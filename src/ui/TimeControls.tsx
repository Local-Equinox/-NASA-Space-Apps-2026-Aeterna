import { useState } from 'react'
import { RATES, sim } from '../lib/sim'
import { useGame } from '../state/game'

export default function TimeControls() {
  const { scene, overlay } = useGame()
  const [, force] = useState(0)
  if (scene !== 'space' || overlay !== 'none') return null
  const date = new Date(Date.UTC(2000, 0, 1, 12) + sim.days * 86400000)
  return (
    <div className="time-controls" role="group" aria-label="Simulation time">
      <button className="button secondary" aria-label={sim.paused ? 'Play' : 'Pause'} onClick={() => { sim.paused = !sim.paused; force((n) => n + 1) }}>
        {sim.paused ? '▶' : '❚❚'}
      </button>
      <span className="pill-text">{date.toISOString().slice(0, 10)}</span>
      <button className="button secondary" onClick={() => { sim.rateIndex = (sim.rateIndex + 1) % RATES.length; force((n) => n + 1) }}>
        {RATES[sim.rateIndex].label}
      </button>
    </div>
  )
}
