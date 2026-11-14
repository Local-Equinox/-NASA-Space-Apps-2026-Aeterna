import { useState } from 'react'
import { artifacts } from '../data/artifacts'
import { useGame } from '../state/game'
import WorldMap from './WorldMap'
import type { World } from '../types/artifact'

// Expanded map (M key, or tap the mini-map): Moon and Mars with every equipment site.
export default function MapOverlay() {
  const { site, found, setOverlay } = useGame()
  const [world, setWorld] = useState<World>(site?.world ?? 'moon')
  const count = (w: World) => artifacts.filter((a) => a.world === w && found.includes(a.id)).length
  const total = (w: World) => artifacts.filter((a) => a.world === w).length
  return (
    <section className="overlay wide" role="dialog" aria-labelledby="map-title">
      <h2 id="map-title">World map</h2>
      <div className="row" role="tablist" aria-label="World">
        {(['moon', 'mars'] as World[]).map((w) => (
          <button key={w} role="tab" aria-selected={world === w} className={`button ${world === w ? '' : 'secondary'}`} onClick={() => setWorld(w)}>
            {w === 'moon' ? 'Moon' : 'Mars'} ({count(w)}/{total(w)} found)
          </button>
        ))}
      </div>
      <WorldMap world={world} />
      <p className="small">Yellow ? = not found yet (named ???). Green = found. The ring marks the site you are exploring. Press <kbd>M</kbd> or Esc to close.</p>
      <button className="button" onClick={() => setOverlay('none')}>Close map</button>
    </section>
  )
}
