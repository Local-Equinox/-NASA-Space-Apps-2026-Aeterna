import { useLayoutEffect, useMemo, useRef } from 'react'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import { BufferAttribute, BufferGeometry, Color, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import type { LandId } from '../../data/bodies'
import { GRID_SEGMENTS as SEGMENTS, GRID_SIZE as SIZE, PATCH_RADIUS, rng, shade, type Spot, type Terrain } from './terrain-math'

const PALETTE = {
  earth: { ground: '#4f7a3a', rock: '#7d7d76' },
  moon: { ground: '#8d8d8b', rock: '#6f6f6d' },
  mars: { ground: '#a85f3c', rock: '#7d4630' },
}


/** Parked ship: to the side of the line toward the artifact, so it never blocks the first view. */
export function shipSpot(target: Spot | null): Spot {
  if (!target) return { x: -5, z: -14 } // Earth: the pad is just ahead of the spawn point
  const len = Math.hypot(target.x, target.z) || 1
  return { x: (-target.z / len) * 12, z: (target.x / len) * 12 }
}

interface Props { world: LandId; seed: string; terrain: Terrain; avoid: Spot[] }

// Rolling ground with craters, scattered boulders and pebbles. The collider is built from the same mesh.
export default function TerrainView({ world, seed, terrain, avoid }: Props) {
  const colors = PALETTE[world]

  const { geometry, vertices, indices } = useMemo(() => {
    const n = SEGMENTS + 1
    const vertices = new Float32Array(n * n * 3)
    const col = new Float32Array(n * n * 3)
    const base = new Color(colors.ground)
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const x = (i / SEGMENTS - 0.5) * SIZE
        const z = (j / SEGMENTS - 0.5) * SIZE
        const h = terrain.height(x, z)
        const k = (j * n + i) * 3
        vertices[k] = x; vertices[k + 1] = h; vertices[k + 2] = z
        const m = shade(x, z, h, 11)
        col[k] = base.r * m; col[k + 1] = base.g * m; col[k + 2] = base.b * m
      }
    }
    const indices = new Uint32Array(SEGMENTS * SEGMENTS * 6)
    let p = 0
    for (let j = 0; j < SEGMENTS; j++) {
      for (let i = 0; i < SEGMENTS; i++) {
        const a = j * n + i, b = a + 1, c = a + n, d = c + 1
        indices[p++] = a; indices[p++] = c; indices[p++] = b
        indices[p++] = b; indices[p++] = c; indices[p++] = d
      }
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new BufferAttribute(col, 3))
    geometry.setIndex(new BufferAttribute(indices, 1))
    geometry.computeVertexNormals()
    return { geometry, vertices, indices }
  }, [terrain, colors.ground])

  const rocks = useMemo(() => {
    const rand = rng(seed + 'rocks')
    const list: { x: number; z: number; y: number; r: number; sx: number; sy: number; sz: number; ry: number }[] = []
    const target = world === 'earth' ? 40 : 90
    let guard = 0
    while (list.length < target && guard++ < 3000) {
      const a = rand() * Math.PI * 2
      const d = 8 + rand() * (PATCH_RADIUS - 10)
      const x = Math.cos(a) * d, z = Math.sin(a) * d
      if (avoid.some((p) => Math.hypot(x - p.x, z - p.z) < 7)) continue
      const r = 0.3 + Math.pow(rand(), 3) * 2.4
      list.push({ x, z, y: terrain.height(x, z), r, sx: 0.8 + rand() * 0.6, sy: 0.5 + rand() * 0.5, sz: 0.8 + rand() * 0.6, ry: rand() * 6 })
    }
    return list
  }, [seed, terrain, avoid, world])

  // Pebbles: many tiny rocks in one draw call, for texture on the ground
  const pebbles = useRef<InstancedMesh>(null)
  const PEBBLES = 900
  useLayoutEffect(() => {
    const mesh = pebbles.current
    if (!mesh) return
    const rand = rng(seed + 'pebbles')
    const m = new Matrix4(), q = new Quaternion(), pos = new Vector3(), sc = new Vector3()
    for (let i = 0; i < PEBBLES; i++) {
      const a = rand() * Math.PI * 2
      const d = Math.sqrt(rand()) * (PATCH_RADIUS - 5)
      const x = Math.cos(a) * d, z = Math.sin(a) * d
      const s = 0.05 + rand() * rand() * 0.28
      pos.set(x, terrain.height(x, z) + s * 0.3, z)
      q.setFromAxisAngle(new Vector3(0, 1, 0), rand() * 6)
      sc.set(s * (0.8 + rand() * 0.6), s * 0.6, s * (0.8 + rand() * 0.6))
      m.compose(pos, q, sc)
      mesh.setMatrixAt(i, m)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [seed, terrain])

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <TrimeshCollider args={[vertices, indices]} friction={0.8} />
      </RigidBody>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      {/* Level ground only BEYOND the detailed patch (a ring), so the horizon is never an edge.
          It must not cover the patch: a full disc hid every dip and crater under a fake flat floor. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]}>
        <ringGeometry args={[PATCH_RADIUS + 2, 1200, 64]} />
        <meshStandardMaterial color={colors.ground} roughness={1} />
      </mesh>
      {rocks.map((rock, i) => (
        <RigidBody key={i} type="fixed" colliders="ball" position={[rock.x, rock.y + rock.r * rock.sy * 0.4, rock.z]}>
          <mesh scale={[rock.r * rock.sx, rock.r * rock.sy, rock.r * rock.sz]} rotation-y={rock.ry}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={colors.rock} roughness={1} flatShading />
          </mesh>
        </RigidBody>
      ))}
      <instancedMesh ref={pebbles} args={[undefined, undefined, PEBBLES]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={colors.rock} roughness={1} flatShading />
      </instancedMesh>
    </>
  )
}
