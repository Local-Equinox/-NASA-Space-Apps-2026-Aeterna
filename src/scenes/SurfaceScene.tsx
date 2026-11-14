import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useGame } from '../state/game'
import { gravityOf } from '../data/bodies'
import { createSpaceship } from '../game/models'
import Stars from './space/Stars'
import Terrain, { shipSpot } from './surface/Terrain'
import Player from './surface/Player'
import ArtifactModel from './surface/ArtifactModel'

const SKY = { earth: '#8fb4ee', moon: '#000000', mars: '#b98363' } as const

// A separate scene and physics world in real metres. It shares no coordinates with space.
export default function SurfaceScene() {
  const { site, surfaceWorld: world } = useGame()
  const ship = useMemo(() => {
    const s = createSpaceship()
    s.userData.setGearDown(true)
    return s
  }, [])
  const spot = shipSpot(site)
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 4, 10], fov: 60, near: 0.1, far: 3000 }}>
      <color attach="background" args={[SKY[world]]} />
      {world !== 'moon' && <fog attach="fog" args={[SKY[world], 150, 900]} />}
      <ambientLight intensity={world === 'moon' ? 0.25 : 0.55} />
      <directionalLight position={[60, 40, 30]} intensity={world === 'moon' ? 3 : 2.4} />
      <Suspense fallback={null}>
        {world === 'moon' && <Stars />}
        <Physics gravity={[0, -gravityOf(world), 0]}>
          <Terrain world={world} artifact={site} />
          <Player artifact={site} />
        </Physics>
        {site && <ArtifactModel artifact={site} />}
        <primitive object={ship} position={[spot.x, 0, spot.z]} rotation-y={0.6} />
      </Suspense>
    </Canvas>
  )
}
