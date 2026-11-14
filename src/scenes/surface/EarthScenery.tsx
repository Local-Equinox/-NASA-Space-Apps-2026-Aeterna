import { useLayoutEffect, useMemo, useRef } from 'react'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { BufferAttribute, BufferGeometry, CanvasTexture, InstancedMesh, Matrix4, Quaternion, SRGBColorSpace, Vector3 } from 'three'
import { PATCH_RADIUS, riverX, rng, type Spot, type Terrain } from './terrain-math'

const PAD_RADIUS = 13
// The assembly building stands behind the pad (toward -z), joined to it by a road.
const BUILDING = { dx: 0, dz: -62, w: 44, h: 48, d: 30 }

/** Ground that must be level: the launch pad, the road and the building's footprint. */
export function earthFlats(pad: Spot): Spot[] {
  const out: Spot[] = []
  for (let a = 0; a < 8; a++) out.push({ x: pad.x + Math.cos(a * 0.785) * 9, z: pad.z + Math.sin(a * 0.785) * 9 })
  for (let z = pad.z - 14; z > pad.z + BUILDING.dz + BUILDING.d / 2; z -= 7) out.push({ x: pad.x, z })
  for (let x = -BUILDING.w / 2 - 16; x <= BUILDING.w / 2 + 2; x += 8)
    for (let z = -BUILDING.d / 2; z <= BUILDING.d / 2 + 14; z += 8) out.push({ x: pad.x + BUILDING.dx + x, z: pad.z + BUILDING.dz + z })
  return out
}

function flagTexture() {
  const c = document.createElement('canvas')
  c.width = 190; c.height = 260 // hung vertically, like on the real building
  const g = c.getContext('2d')!
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#fff' : '#b22234'; g.fillRect((i * c.width) / 13, 0, c.width / 13 + 1, c.height) }
  g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, (c.width * 7) / 13, c.height * 0.4)
  g.fillStyle = '#fff'
  for (let r = 0; r < 6; r++) for (let k = 0; k < 5; k++) g.fillRect(8 + k * 19, 8 + r * 16, 4, 4)
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace
  return t
}

function signTexture() {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#1d3f8a'; g.fillRect(0, 0, 512, 128)
  g.fillStyle = '#fff'; g.font = 'bold 64px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText('SPACE CENTER', 256, 68)
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace
  return t
}

interface Props { terrain: Terrain; pad: Spot }

// Earth's home base: launch pad under the ship, an assembly building, a river, trees and far mountains.
// The building is modelled on NASA's Vehicle Assembly Building but carries no NASA logo or insignia.
export default function EarthScenery({ terrain, pad }: Props) {
  const padY = terrain.height(pad.x, pad.z)
  const bx = pad.x + BUILDING.dx, bz = pad.z + BUILDING.dz
  const flag = useMemo(flagTexture, [])
  const sign = useMemo(signTexture, [])
  const frontZ = BUILDING.d / 2

  // Trees inside the walkable patch (solid) and beyond it (scenery only)
  const trees = useMemo(() => {
    const rand = rng('earth-trees')
    const solid: { x: number; y: number; z: number; s: number }[] = []
    const far: { x: number; z: number; s: number }[] = []
    let guard = 0
    while (solid.length < 80 && guard++ < 4000) {
      const a = rand() * Math.PI * 2, d = 18 + Math.sqrt(rand()) * (PATCH_RADIUS - 24)
      const x = Math.cos(a) * d, z = Math.sin(a) * d
      if (Math.abs(x - riverX(z)) < 11) continue
      if (Math.hypot(x - pad.x, z - pad.z) < PAD_RADIUS + 8) continue
      if (Math.abs(x - pad.x) < 8 && z < pad.z && z > bz) continue // the road
      if (Math.abs(x - bx) < BUILDING.w / 2 + 24 && Math.abs(z - bz) < BUILDING.d / 2 + 22) continue
      solid.push({ x, y: terrain.height(x, z), z, s: 0.8 + rand() * 0.9 })
    }
    for (let i = 0; i < 320; i++) {
      const a = rand() * Math.PI * 2, d = PATCH_RADIUS + 8 + rand() * 420
      far.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.9 + rand() * 1.3 })
    }
    return { solid, far }
  }, [terrain, pad, bx, bz])

  const farTrunks = useRef<InstancedMesh>(null)
  const farLeaves = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = new Matrix4(), q = new Quaternion(), p = new Vector3(), s = new Vector3()
    trees.far.forEach((t, i) => {
      farTrunks.current?.setMatrixAt(i, m.compose(p.set(t.x, 1.1 * t.s, t.z), q, s.setScalar(t.s)))
      farLeaves.current?.setMatrixAt(i, m.compose(p.set(t.x, 4.4 * t.s, t.z), q, s.setScalar(t.s)))
    })
    if (farTrunks.current) farTrunks.current.instanceMatrix.needsUpdate = true
    if (farLeaves.current) farLeaves.current.instanceMatrix.needsUpdate = true
  }, [trees])

  const mountains = useMemo(() => {
    const rand = rng('earth-mountains')
    return Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2 + rand() * 0.2
      const d = 620 + rand() * 260
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, h: 130 + rand() * 170, r: 170 + rand() * 120, ry: rand() * 6 }
    })
  }, [])

  // River: a ribbon of water in the channel, continuing as a flat strip beyond the patch
  const river = useMemo(() => {
    const pts: number[] = [], idx: number[] = []
    const N = 140
    for (let i = 0; i <= N; i++) {
      const z = -700 + (i / N) * 1400
      const inside = Math.hypot(riverX(z), z) < PATCH_RADIUS + 3
      const half = inside ? 15 : 7, y = inside ? -0.75 : 0.02
      pts.push(riverX(z) - half, y, z, riverX(z) + half, y, z)
      if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3) }
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <>
      {/* Launch pad under the ship */}
      <group position={[pad.x, padY, pad.z]}>
        <mesh position={[0, -0.47, 0]}>
          <cylinderGeometry args={[PAD_RADIUS, PAD_RADIUS + 1.5, 1, 40]} />
          <meshStandardMaterial color="#8d9096" roughness={0.9} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.045, 0]}>
          <ringGeometry args={[PAD_RADIUS - 1.6, PAD_RADIUS - 0.9, 48]} />
          <meshStandardMaterial color="#e8c22a" roughness={0.8} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.045, 0]}>
          <circleGeometry args={[5.5, 32]} />
          <meshStandardMaterial color="#4a4c52" roughness={1} />
        </mesh>
        {/* Road to the building */}
        <mesh position={[0, -0.46, (BUILDING.dz + frontZ - PAD_RADIUS) / 2 - PAD_RADIUS / 2]}>
          <boxGeometry args={[8, 1, Math.abs(BUILDING.dz) - frontZ - PAD_RADIUS + 2]} />
          <meshStandardMaterial color="#6f7278" roughness={0.95} />
        </mesh>
      </group>

      {/* Assembly building */}
      <group position={[bx, terrain.height(bx, bz), bz]}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[BUILDING.w / 2, BUILDING.h / 2, BUILDING.d / 2]} position={[0, BUILDING.h / 2, 0]} />
          <CuboidCollider args={[11, 6, 9]} position={[-BUILDING.w / 2 - 7, 6, frontZ - 3]} />
        </RigidBody>
        <mesh position={[0, BUILDING.h / 2, 0]}>
          <boxGeometry args={[BUILDING.w, BUILDING.h, BUILDING.d]} />
          <meshStandardMaterial color="#ecece8" roughness={0.85} />
        </mesh>
        {/* Tall grey door bay and side panels */}
        <mesh position={[0, BUILDING.h * 0.43, frontZ + 0.15]}>
          <boxGeometry args={[13, BUILDING.h * 0.82, 0.3]} />
          <meshStandardMaterial color="#9a9da0" roughness={0.8} />
        </mesh>
        <mesh position={[0, BUILDING.h * 0.4, frontZ + 0.35]}>
          <boxGeometry args={[7.5, BUILDING.h * 0.6, 0.2]} />
          <meshStandardMaterial color="#b9b9ad" roughness={0.8} />
        </mesh>
        <mesh position={[BUILDING.w / 2 - 3, BUILDING.h * 0.5, frontZ + 0.15]}>
          <boxGeometry args={[5, BUILDING.h * 0.9, 0.3]} />
          <meshStandardMaterial color="#a4a7aa" roughness={0.8} />
        </mesh>
        <mesh position={[-13.5, BUILDING.h * 0.68, frontZ + 0.2]}>
          <planeGeometry args={[9, 12.3]} />
          <meshStandardMaterial map={flag} roughness={0.9} />
        </mesh>
        <mesh position={[13, BUILDING.h * 0.74, frontZ + 0.2]}>
          <planeGeometry args={[11, 2.75]} />
          <meshStandardMaterial map={sign} roughness={0.9} />
        </mesh>
        {/* Low wing */}
        <mesh position={[-BUILDING.w / 2 - 7, 6, frontZ - 3]}>
          <boxGeometry args={[22, 12, 18]} />
          <meshStandardMaterial color="#dcdcd6" roughness={0.9} />
        </mesh>
        <mesh position={[-BUILDING.w / 2 - 7, 5, frontZ + 6.1]}>
          <boxGeometry args={[18, 3, 0.2]} />
          <meshStandardMaterial color="#3b4a5e" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>

      {/* River */}
      <mesh geometry={river}>
        <meshStandardMaterial color="#2f7fc4" roughness={0.25} metalness={0.1} transparent opacity={0.85} />
      </mesh>

      {/* Trees you can walk around */}
      {trees.solid.map((t, i) => (
        <RigidBody key={i} type="fixed" colliders={false} position={[t.x, t.y, t.z]}>
          <CylinderCollider args={[2 * t.s, 0.35 * t.s]} position={[0, 2 * t.s, 0]} />
          <mesh position={[0, 1.1 * t.s, 0]}>
            <cylinderGeometry args={[0.22 * t.s, 0.3 * t.s, 2.2 * t.s, 7]} />
            <meshStandardMaterial color="#6b4a2b" roughness={1} />
          </mesh>
          <mesh position={[0, 3.6 * t.s, 0]}>
            <coneGeometry args={[1.9 * t.s, 3.6 * t.s, 8]} />
            <meshStandardMaterial color={i % 3 ? '#2e6b34' : '#3d7d3a'} roughness={1} flatShading />
          </mesh>
          <mesh position={[0, 5.4 * t.s, 0]}>
            <coneGeometry args={[1.3 * t.s, 2.8 * t.s, 8]} />
            <meshStandardMaterial color={i % 3 ? '#347a3b' : '#46903f'} roughness={1} flatShading />
          </mesh>
        </RigidBody>
      ))}
      {/* Forest beyond the walkable area */}
      <instancedMesh ref={farTrunks} args={[undefined, undefined, trees.far.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.25, 0.3, 2.2, 6]} />
        <meshStandardMaterial color="#6b4a2b" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={farLeaves} args={[undefined, undefined, trees.far.length]} frustumCulled={false}>
        <coneGeometry args={[1.9, 5.2, 7]} />
        <meshStandardMaterial color="#2e6b34" roughness={1} flatShading />
      </instancedMesh>

      {/* Mountains on the horizon, with snow caps */}
      {mountains.map((m, i) => (
        <group key={i} position={[m.x, -2, m.z]} rotation-y={m.ry}>
          <mesh position={[0, m.h / 2, 0]}>
            <coneGeometry args={[m.r, m.h, 7]} />
            <meshStandardMaterial color="#5f6b62" roughness={1} flatShading />
          </mesh>
          <mesh position={[0, m.h * 0.86, 0]}>
            <coneGeometry args={[m.r * 0.29, m.h * 0.29, 7]} />
            <meshStandardMaterial color="#f4f6f8" roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}
    </>
  )
}
