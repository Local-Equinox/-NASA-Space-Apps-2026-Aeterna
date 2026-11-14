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
import ProbePrompt from './ui/ProbePrompt'
import Wires from './ui/Wires'
import Cutscene from './ui/Cutscene'
import Spacewalk from './ui/Spacewalk'
import BoardPrompt from './ui/BoardPrompt'
import MiniMap from './ui/MiniMap'
import BodiesList from './ui/BodiesList'
import TimeControls from './ui/TimeControls'
import Clean from './ui/Clean'
import MapOverlay from './ui/MapOverlay'
import Story from './ui/Story'
import Stories from './ui/Stories'
import TopBar from './ui/TopBar'
import { artifacts } from './data/artifacts'
import Joystick from './ui/Joystick'

const SpaceScene = lazy(() => import('./scenes/SpaceScene'))
const SurfaceScene = lazy(() => import('./scenes/SurfaceScene'))
const LaunchScene = lazy(() => import('./scenes/LaunchScene'))

function Game() {
  const { scene, site, overlay, fading, warping, near, nearProbe, inspect, board, canInspect, canBoard, setOverlay, setSelected } = useGame()

  // Show the controls once on first load of the space scene; H toggles them any time.
  useEffect(() => {
    if (scene === 'title') return
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
      else if (e.code === 'KeyE' && scene === 'surface' && canInspect && overlay === 'none' && site) inspect(site)
      else if (e.code === 'KeyE' && scene === 'space' && nearProbe && overlay === 'none') {
        const a = artifacts.find((x) => x.body === nearProbe)
        if (a) inspect(a)
      }
      else if (e.code === 'KeyM' && scene === 'surface' && (overlay === 'none' || overlay === 'map')) setOverlay(overlay === 'map' ? 'none' : 'map')
      else if (e.code === 'KeyL' && scene === 'space' && near && overlay === 'none') setOverlay('sites')
      else if (e.code === 'KeyE' && scene === 'surface' && canBoard && !canInspect && overlay === 'none') {
        board()
      }
      else if (e.code === 'Escape') { setOverlay('none'); setSelected(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scene, site, nearProbe, inspect, board, near, canInspect, canBoard, overlay, setOverlay, setSelected])

  return (
    <div className={`stage ${warping ? 'warping' : ''}`}>
      {/* Only one 3D scene is mounted at a time */}
      <Suspense fallback={<p className="hud">Loading…</p>}>
        {scene === 'space' && <SpaceScene />}
        {scene === 'surface' && <SurfaceScene />}
        {scene === 'launch' && <LaunchScene />}
      </Suspense>
      {scene === 'title' && <TitleScreen />}
      {scene === 'space' && <InfoPanel />}
      {scene === 'space' && <LandPrompt />}
      <SurfaceHud />
      <InspectPrompt />
      <ProbePrompt />
      <BoardPrompt />
      <MiniMap />
      <BodiesList />
      <TimeControls />
      {overlay === 'clean' && <Clean />}
      {overlay === 'wires' && <Wires />}
      {overlay === 'cutscene' && <Cutscene />}
      {overlay === 'spacewalk' && <Spacewalk />}
      {overlay === 'map' && <MapOverlay />}
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
