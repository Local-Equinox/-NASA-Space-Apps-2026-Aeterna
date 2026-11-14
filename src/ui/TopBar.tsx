import { useEffect, useState } from 'react'
import { isMuted, setMuted } from '../lib/sound'
import { sim, view } from '../lib/sim'
import { artifacts } from '../data/artifacts'
import { useGame } from '../state/game'
import { canFullscreen, enterLandscape, leaveFullscreen, useFullscreen } from '../lib/device'

type ViewKey = 'orbits' | 'labels' | 'constellations'

function Switch({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className="switch" role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span>{label}</span>
      <i aria-hidden="true" />
    </button>
  )
}

// Map, Missions and the Orbits pause button stay on the main screen; everything else lives behind the gear.
export default function TopBar() {
  const { scene, overlay, found, setOverlay } = useGame()
  const [open, setOpen] = useState(false)
  const [muted, setM] = useState(isMuted)
  const [, force] = useState(0)
  const fs = useFullscreen()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  if (scene === 'title' || scene === 'launch' || overlay !== 'none') return null
  const set = (k: ViewKey, v: boolean) => { view[k] = v; force((n) => n + 1) }
  return (
    <nav className="topbar" aria-label="Menu">
      {scene === 'surface' && <button className="button secondary" onClick={() => setOverlay('map')}>Map (M)</button>}
      <button className="button secondary" onClick={() => setOverlay('collection')}>Missions ({found.length}/{artifacts.length})</button>
      {scene === 'space' && (
        <button className="button secondary" aria-pressed={!sim.paused} onClick={() => { sim.paused = !sim.paused; force((n) => n + 1) }}>
          Orbits: {sim.paused ? 'Paused' : 'Moving'}
        </button>
      )}
      <button className="button secondary gear" aria-label="Settings" aria-expanded={open} title="Settings" onClick={() => setOpen(!open)}>⚙</button>
      {open && (
        <div className="settings" role="group" aria-label="Settings">
          <h2>Settings</h2>
          <button className="button secondary" onClick={() => { setOpen(false); setOverlay('help') }}>Controls</button>
          <button className="button secondary" onClick={() => { setOpen(false); setOverlay('about') }}>About and credits</button>
          {canFullscreen() && <Switch label="Fullscreen" on={fs} onChange={(v) => { void (v ? enterLandscape() : leaveFullscreen()) }} />}
          <a className="button secondary" href="./index.html">Back to the intro</a>
          <Switch label="Orbit lines" on={view.orbits} onChange={(v) => set('orbits', v)} />
          <Switch label="Names" on={view.labels} onChange={(v) => set('labels', v)} />
          <Switch label="Stars" on={view.constellations} onChange={(v) => set('constellations', v)} />
          <Switch label="Sound" on={!muted} onChange={(v) => { setMuted(!v); setM(!v) }} />
          {scene !== 'space' && <p className="small">Orbit lines, Names and Stars apply to the space view.</p>}
        </div>
      )}
    </nav>
  )
}
