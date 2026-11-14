import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useGame } from '../state/game'
import { gravityOf } from '../data/bodies'
import { createLaunchStack, createSpaceship } from '../game/models'
import Stars from './space/Stars'
import TerrainView, { shipSpot } from './surface/Terrain'
import Player from './surface/Player'
import ArtifactModel from './surface/ArtifactModel'
import EarthScenery, { earthFlats } from './surface/EarthScenery'
import { makeTerrain, type Spot } from './surface/terrain-math'

const SKY = { earth: '#8fb4ee', moon: '#000000', mars: '#b98363' } as const

// A separate scene and physics world in real metres. It shares no coordinates with space.
export default function SurfaceScene() {
  const { site, surfaceWorld: world, found } = useGame()
  const ship = useMemo(() => {
    // On Earth the ship stands on the pad as a full launch stack; elsewhere the orbiter is parked on its gear.
    if (world === 'earth') return createLaunchStack()
    const s = createSpaceship()
    s.userData.setGearDown(true)
    return s
  }, [world])

  const { terrain, spot, spots } = useMemo(() => {
    const spot = shipSpot(site ? site.surfacePosition : null)
    const spots: Spot[] = [
      { x: 0, z: 0 },
      spot,
      ...(site ? [site.surfacePosition, ...(site.pairedModels ?? []).map((m) => m.surfacePosition)] : []),
      ...(world === 'earth' ? earthFlats(spot) : []),
    ]
    return { terrain: makeTerrain(world, site?.id ?? 'earth', spots), spot, spots }
  }, [site, world])

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 4, 10], fov: 60, near: 0.1, far: 3000 }}>
      <color attach="background" args={[SKY[world]]} />
      {world !== 'moon' && <fog attach="fog" args={[SKY[world], 150, 900]} />}
      <ambientLight intensity={world === 'moon' ? 0.28 : 0.4} />
      <directionalLight position={[80, 22, 35]} intensity={world === 'moon' ? 3.4 : 2.8} />
      <Suspense fallback={null}>
        {world === 'moon' && <Stars />}
        <Physics gravity={[0, -gravityOf(world), 0]} timeStep="vary">
          <TerrainView world={world} seed={site?.id ?? 'earth'} terrain={terrain} avoid={spots} />
          {world === 'earth' && <EarthScenery terrain={terrain} pad={spot} />}
          <Player artifact={site} terrain={terrain} />
          {site && <ArtifactModel artifact={site} found={found.includes(site.id)} terrain={terrain} />}
        </Physics>
        <primitive object={ship} position={[spot.x, terrain.height(spot.x, spot.z), spot.z]} rotation-y={world === 'earth' ? 0 : 0.6} />
      </Suspense>
    </Canvas>
  )
}
