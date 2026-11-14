import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { Suspense } from 'react'

// Phase 2: Earth, Moon, Mars, ship flight, selection, warp.
export default function SpaceScene() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 60 }}>
      <color attach="background" args={['#000']} />
      <ambientLight intensity={0.6} />
      <Suspense fallback={null}>
        <Stars radius={200} depth={50} count={3000} factor={4} fade />
      </Suspense>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#3b6fb6" />
      </mesh>
    </Canvas>
  )
}
