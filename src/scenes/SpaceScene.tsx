import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Stars from './space/Stars'
import Constellations from './space/Constellations'
import SpaceWorld from './space/SpaceWorld'

// The whole solar system, with real orbits and rotations. Distances and sizes are compressed.
export default function SpaceScene() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 0.2], fov: 60, near: 0.01, far: 4000 }}>
      <color attach="background" args={['#000']} />
      <Suspense fallback={null}>
        <Stars />
        <Constellations />
        <SpaceWorld />
      </Suspense>
    </Canvas>
  )
}
