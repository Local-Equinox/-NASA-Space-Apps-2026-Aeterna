import { artifacts } from '../data/artifacts'
import { BODIES } from '../data/bodies'
import { useGame } from '../state/game'

export default function SitePicker() {
  const { near, found, goTo, setOverlay } = useGame()
  if (!near) return null
  const sites = artifacts.filter((a) => a.world === near)
  return (
    <section className="overlay" role="dialog" aria-labelledby="sites-title">
      <h2 id="sites-title">Choose a landing site: {BODIES[near].name}</h2>
      <ul className="list">
        {sites.map((a) => (
          <li key={a.id}>
            <button
              className="button secondary site"
              onClick={() => { setOverlay('none'); goTo('surface', a) }}
            >
              {found.includes(a.id) ? '✔ ' : ''}{a.site.name}
            </button>
          </li>
        ))}
      </ul>
      <button className="button" onClick={() => setOverlay('none')}>Back to ship</button>
    </section>
  )
}
