import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { BackSide, Mesh, Quaternion, SRGBColorSpace, Vector3, type Texture } from 'three'
import { BODIES, type BodyId } from '../../data/bodies'
import { useGame } from '../../state/game'

const HIT_PIXELS = 24 // far bodies are tiny: give them a generous invisible click target
const srgb = (t: Texture) => ((t.colorSpace = SRGBColorSpace), t)

function Earth() {
  const b = BODIES.earth
  const [day, clouds] = useTexture([b.texture, './assets/textures/earth_clouds.jpg'])
  srgb(day)
  const spin = useRef<Mesh>(null)
  const cloud = useRef<Mesh>(null)
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.05
    if (cloud.current) cloud.current.rotation.y += dt * 0.06
  })
  return (
    <group position={b.position}>
      <mesh ref={spin}>
        <sphereGeometry args={[b.radius, 64, 48]} />
        <meshLambertMaterial map={day} />
      </mesh>
      <mesh ref={cloud} raycast={() => {}}>
        <sphereGeometry args={[b.radius * 1.008, 64, 48]} />
        <meshLambertMaterial color="white" alphaMap={clouds} transparent depthWrite={false} />
      </mesh>
      <mesh raycast={() => {}}>
        <sphereGeometry args={[b.radius * 1.045, 48, 32]} />
        <meshBasicMaterial color="#5aa7ff" transparent opacity={0.12} side={BackSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function SelectableBody({ id }: { id: 'moon' | 'mars' }) {
  const b = BODIES[id]
  const [map] = useTexture([b.texture])
  srgb(map)
  const { setSelected } = useGame()
  const mesh = useRef<Mesh>(null)
  const hit = useRef<Mesh>(null)

  // The Moon is tidally locked: longitude 0 (texture centre, +X) always faces Earth.
  const lock = useMemo(
    () => new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), BODIES.earth.position.clone().sub(b.position).normalize()),
    [b.position],
  )

  useFrame(({ camera, size }, dt) => {
    if (id === 'mars' && mesh.current) mesh.current.rotation.y += dt * 0.04
    if (hit.current) {
      const dist = camera.position.distanceTo(b.position)
      const fov = ((camera as { fov?: number }).fov ?? 60) * (Math.PI / 180)
      const minRadius = dist * Math.tan(fov / 2) * ((HIT_PIXELS * 2) / size.height)
      hit.current.scale.setScalar(Math.max(1, minRadius / b.radius))
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return // a drag, not a click
    e.stopPropagation()
    setSelected(id)
  }

  return (
    <group position={b.position}>
      <mesh ref={mesh} quaternion={id === 'moon' ? lock : undefined} onClick={onClick}>
        <sphereGeometry args={[b.radius, 64, 48]} />
        <meshLambertMaterial map={map} />
      </mesh>
      <mesh ref={hit} onClick={onClick}>
        <sphereGeometry args={[b.radius, 12, 8]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {id === 'mars' && (
        <mesh raycast={() => {}}>
          <sphereGeometry args={[b.radius * 1.04, 48, 32]} />
          <meshBasicMaterial color="#e8a57a" transparent opacity={0.1} side={BackSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

export default function Bodies() {
  const ids: BodyId[] = ['moon', 'mars']
  return (
    <>
      <Earth />
      {ids.map((id) => (id === 'earth' ? null : <SelectableBody key={id} id={id} />))}
    </>
  )
}
