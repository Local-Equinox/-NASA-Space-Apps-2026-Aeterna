import { lazy, Suspense } from 'react'
import { GameProvider, useGame } from './state/game'
import TitleScreen from './ui/TitleScreen'
import Collection from './ui/Collection'
import About from './ui/About'
import DevControls from './ui/DevControls'

const SpaceScene = lazy(() => import('./scenes/SpaceScene'))
const SurfaceScene = lazy(() => import('./scenes/SurfaceScene'))

function Game() {
  const { scene, overlay, fading } = useGame()
  return (
    <div className="stage">
      {/* Only one 3D scene is mounted at a time */}
      <Suspense fallback={<p className="hud">Loading…</p>}>
        {scene === 'space' && <SpaceScene />}
        {scene === 'surface' && <SurfaceScene />}
      </Suspense>
      {scene === 'title' && <TitleScreen />}
      <DevControls />
      {overlay === 'collection' && <Collection />}
      {overlay === 'about' && <About />}
      <div className={`fade ${fading ? 'on' : ''}`} aria-hidden="true" />
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  )
}
