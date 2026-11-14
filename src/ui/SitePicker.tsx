import { artifacts } from '../data/artifacts'
import { BODY_DATA } from '../data/bodies'
import { isRevealed, siteLabel } from '../lib/sites'
import { useGame } from '../state/game'
import WorldMap from './WorldMap'

export default function SitePicker() {
  const { near, found, goTo, setOverlay } = useGame()
  if (!near || (near !== 'moon' && near !== 'mars')) return null
  const sites = artifacts.filter((a) => a.world === near)
  if (sites.length === 0) return null
  const land = (id: string) => {
    const a = sites.find((s) => s.id === id)
    if (!a) return
    setOverlay('none')
    goTo('surface', a, a.world)
  }
  return (
    <section className="overlay" role="dialog" aria-labelledby="sites-title">
      <h2 id="sites-title">Choose a landing site: {BODY_DATA[near].name}</h2>
      <WorldMap world={near} onPick={land} />
      <p className="small">Dots are the real coordinates from NASA's records. Only your first landing site is named; the rest stay ??? until you find their equipment.</p>
      <ul className="list">
        {sites.map((a) => (
          <li key={a.id}>
            <button className="button secondary site" onClick={() => land(a.id)}>
              {found.includes(a.id) ? '✔ ' : ''}{siteLabel(a, found)}
              {!isRevealed(a, found) && ' (undiscovered)'}
            </button>
          </li>
        ))}
      </ul>
      <button className="button" onClick={() => setOverlay('none')}>Back to ship</button>
    </section>
  )
}
