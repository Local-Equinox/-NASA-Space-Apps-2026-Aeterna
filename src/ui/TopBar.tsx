import { useState } from 'react'
import { isMuted, setMuted } from '../lib/sound'
import { useGame } from '../state/game'

export default function TopBar() {
  const { scene, overlay, setOverlay } = useGame()
  const [muted, setM] = useState(isMuted)
  if (scene === 'title' || overlay !== 'none') return null
  return (
    <nav className="topbar" aria-label="Menu">
      <button className="button secondary" onClick={() => setOverlay('collection')}>Collection</button>
      <button className="button secondary" onClick={() => setOverlay('help')} aria-label="Controls help">?</button>
      <button className="button secondary" aria-pressed={muted} onClick={() => { setMuted(!muted); setM(!muted) }}>
        {muted ? 'Sound off' : 'Sound on'}
      </button>
    </nav>
  )
}
