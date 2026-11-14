import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { useGame } from '../state/game'
import { BODIES } from '../data/bodies'

// Phase 3: terrain, 3rd-person character, artifact model, Inspect.
export default function SurfaceScene() {
  const { site } = useGame()
  if (!site) return null
  const g = BODIES[site.world].gravity
  const color = site.world === 'moon' ? '#8a8a8a' : '#a0522d'
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 6, 14], fov: 60 }}>
      <color attach="background" args={['#05070f']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 30, 10]} intensity={1.5} />
      <Physics gravity={[0, -g, 0]}>
        <RigidBody type="fixed">
          <mesh rotation-x={-Math.PI / 2}>
            <planeGeometry args={[400, 400]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </RigidBody>
        <RigidBody position={[0, 8, 0]} colliders="ball">
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </RigidBody>
      </Physics>
      {/* Placeholder artifact: replaced by the GLB model in Phase 3 */}
      <mesh position={[site.surfacePosition.x, 0.5, site.surfacePosition.z]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
    </Canvas>
  )
}
