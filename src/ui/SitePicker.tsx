import { artifacts } from '../data/artifacts'
import { BODY_DATA } from '../data/bodies'
import { useGame } from '../state/game'

export default function SitePicker() {
  const { near, found, goTo, setOverlay } = useGame()
  if (!near) return null
  const sites = artifacts.filter((a) => a.world === near)
  if (sites.length === 0) return null
  const land = (id: string) => {
    const a = sites.find((s) => s.id === id)
    if (!a) return
    setOverlay('none')
    goTo('surface', a, a.world)
  }
  // The Moon's map has longitude 0 at its centre, so real coordinates plot directly.
  const mapped = near === 'moon' ? sites.filter((a) => a.site.lat !== null && a.site.lon !== null) : []
  return (
    <section className="overlay" role="dialog" aria-labelledby="sites-title">
      <h2 id="sites-title">Choose a landing site: {BODY_DATA[near].name}</h2>
      {mapped.length > 0 && (
        <div className="site-map" style={{ backgroundImage: 'url(./assets/textures/planets/moon.jpg)' }}>
          {mapped.map((a, i) => (
            <button
              key={a.id}
              className={`site-dot ${found.includes(a.id) ? 'done' : ''} ${i % 2 ? 'alt' : ''}`}
              style={{ left: `${((a.site.lon! + 180) / 360) * 100}%`, top: `${((90 - a.site.lat!) / 180) * 100}%` }}
              onClick={() => land(a.id)}
              aria-label={a.site.name}
              title={`${a.site.name} (${a.site.lat}°, ${a.site.lon}°)`}
            >
              <span>{a.mission}</span>
            </button>
          ))}
        </div>
      )}
      {mapped.length > 0 && <p className="small">Site positions are the real coordinates from NASA's records, on the Moon's surface map.</p>}
      <ul className="list">
        {sites.map((a) => (
          <li key={a.id}>
            <button className="button secondary site" onClick={() => land(a.id)}>
              {found.includes(a.id) ? '✔ ' : ''}{a.site.name}
            </button>
          </li>
        ))}
      </ul>
      <button className="button" onClick={() => setOverlay('none')}>Back to ship</button>
    </section>
  )
}
