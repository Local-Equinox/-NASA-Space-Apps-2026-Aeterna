import { useState } from 'react'
import { isMuted, setMuted } from '../lib/sound'
import { view } from '../lib/sim'
import { useGame } from '../state/game'

export default function TopBar() {
  const { scene, overlay, setOverlay } = useGame()
  const [muted, setM] = useState(isMuted)
  const [, force] = useState(0)
  if (scene === 'title' || overlay !== 'none') return null
  const toggle = (k: 'labels' | 'orbits' | 'constellations') => { view[k] = !view[k]; force((n) => n + 1) }
  return (
    <nav className="topbar" aria-label="Menu">
      {scene === 'space' && (
        <>
          <button className="button secondary" aria-pressed={view.orbits} onClick={() => toggle('orbits')}>Orbits</button>
          <button className="button secondary" aria-pressed={view.labels} onClick={() => toggle('labels')}>Names</button>
          <button className="button secondary" aria-pressed={view.constellations} onClick={() => toggle('constellations')}>Stars</button>
        </>
      )}
      {scene === 'surface' && <button className="button secondary" onClick={() => setOverlay('map')}>Map (M)</button>}
      <button className="button secondary" onClick={() => setOverlay('collection')}>Collection</button>
      <button className="button secondary" onClick={() => setOverlay('help')} aria-label="Controls help">?</button>
      <button className="button secondary" aria-pressed={muted} onClick={() => { setMuted(!muted); setM(!muted) }}>
        {muted ? 'Sound off' : 'Sound on'}
      </button>
    </nav>
  )
}
