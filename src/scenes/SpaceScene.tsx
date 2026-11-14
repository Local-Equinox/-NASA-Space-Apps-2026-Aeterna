import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { SUN_DIR } from '../data/bodies'
import { useGame } from '../state/game'
import Stars from './space/Stars'
import Bodies from './space/Bodies'
import Ship from './space/Ship'

export default function SpaceScene() {
  const { setSelected } = useGame()
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 60, near: 0.05, far: 5000 }}
      onPointerMissed={() => setSelected(null)}
    >
      <color attach="background" args={['#000']} />
      <ambientLight intensity={0.12} />
      <directionalLight position={SUN_DIR.clone().multiplyScalar(500)} intensity={3} />
      <Suspense fallback={null}>
        <Stars />
        <Bodies />
        <Ship />
      </Suspense>
    </Canvas>
  )
}
