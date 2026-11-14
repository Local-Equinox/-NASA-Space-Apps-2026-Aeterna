import { lazy, Suspense, useEffect } from 'react'
import { GameProvider, useGame } from './state/game'
import TitleScreen from './ui/TitleScreen'
import Collection from './ui/Collection'
import About from './ui/About'
import InfoPanel from './ui/InfoPanel'
import LandPrompt from './ui/LandPrompt'
import SitePicker from './ui/SitePicker'
import Help from './ui/Help'
import SurfaceHud from './ui/SurfaceHud'
import InspectPrompt from './ui/InspectPrompt'
import Decision from './ui/Decision'
import Story from './ui/Story'
import Stories from './ui/Stories'
import TopBar from './ui/TopBar'
import Joystick from './ui/Joystick'

const SpaceScene = lazy(() => import('./scenes/SpaceScene'))
const SurfaceScene = lazy(() => import('./scenes/SurfaceScene'))

function Game() {
  const { scene, overlay, fading, warping, near, canInspect, setOverlay } = useGame()

  // Show the controls once on first load of the space scene; H toggles them any time.
  useEffect(() => {
    if (scene !== 'space') return
    try {
      if (!localStorage.getItem('left-behind-help-seen')) {
        localStorage.setItem('left-behind-help-seen', '1')
        setOverlay('help')
      }
    } catch { /* ignore */ }
  }, [scene, setOverlay])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (scene === 'title') return
      if (e.code === 'KeyH' && (overlay === 'none' || overlay === 'help')) setOverlay(overlay === 'help' ? 'none' : 'help')
      else if (e.code === 'KeyE' && scene === 'surface' && canInspect && overlay === 'none') setOverlay('decision')
      else if (e.code === 'KeyL' && scene === 'space' && near && overlay === 'none') setOverlay('sites')
      else if (e.code === 'Escape') setOverlay('none')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scene, near, canInspect, overlay, setOverlay])

  return (
    <div className={`stage ${warping ? 'warping' : ''}`}>
      {/* Only one 3D scene is mounted at a time */}
      <Suspense fallback={<p className="hud">Loading…</p>}>
        {scene === 'space' && <SpaceScene />}
        {scene === 'surface' && <SurfaceScene />}
      </Suspense>
      {scene === 'title' && <TitleScreen />}
      {scene === 'space' && <InfoPanel />}
      {scene === 'space' && <LandPrompt />}
      <SurfaceHud />
      <InspectPrompt />
      {overlay === 'decision' && <Decision />}
      {overlay === 'story' && <Story />}
      {overlay === 'stories' && <Stories />}
      <TopBar />
      {(scene === 'space' || scene === 'surface') && overlay === 'none' && <Joystick />}
      {overlay === 'sites' && <SitePicker />}
      {overlay === 'help' && <Help />}
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
