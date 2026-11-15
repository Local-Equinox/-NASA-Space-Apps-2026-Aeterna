import { artifacts } from '../data/artifacts'
import { BODY_DATA, isLandable } from '../data/bodies'
import { useGame } from '../state/game'
import { shortYear } from '../lib/sites'

const fmtMass = ([m, e]: [number, number]) => `${m} × 10^${e} kg`

export default function InfoPanel() {
  const { overlay, selected, found, warping, orbitOf, nearProbe, requestWarp, setSelected } = useGame()
  if (!selected || overlay !== 'none') return null
  const body = BODY_DATA[selected]
  if (!body) return null
  const sites = artifacts.filter((a) => a.world === selected)
  const done = sites.filter((a) => found.includes(a.id)).length
  const here = orbitOf === selected || nearProbe === selected
  const equipment = artifacts.find((a) => a.body === selected)
  if (equipment) {
    const got = found.includes(equipment.id)
    // Keep it a mystery until the player has inspected it.
    const title = got ? body.name : 'Unknown spacecraft'
    return (
      <aside className="info-panel" aria-label={`${title} information`}>
        <header className="ip-head">
          <span className="ip-kicker">{body.type}</span>
          <h2>{title}</h2>
          <span className={`ip-status ${got ? 'found' : ''}`}>{got ? '✔ Found' : 'Not inspected yet'}</span>
        </header>
        <div className="ip-body">
          <dl className="ip-facts stack">
            <div><dt>Mission</dt><dd>{got ? `${equipment.mission}, ${shortYear(equipment)}` : '???'}</dd></div>
            <div><dt>Where it is</dt><dd>{equipment.whereabouts}</dd></div>
          </dl>
          <p className="ip-blurb">{got ? body.blurb : 'A human-made spacecraft drifting out here. Fly close and make a spacewalk to find out which one it is.'}</p>
          <p className="ip-hint">When you arrive, press <kbd className="kb-only">E</kbd><span className="touch-text">the Spacewalk button</span> to start the spacewalk.</p>
          <div className="ip-actions">
            <button className="btn-glow" disabled={warping || here} onClick={() => requestWarp(selected)}>
              {here ? `Next to ${title}` : `Warp to ${title}`}
            </button>
            <button className="button secondary" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      </aside>
    )
  }
  return (
    <aside className="info-panel" aria-label={`${body.name} information`}>
      <header className="ip-head">
        <span className="ip-kicker">{body.type}</span>
        <h2>{body.name}</h2>
      </header>
      <div className="ip-body">
        <dl className="ip-facts">
          <div><dt>Surface gravity</dt><dd>{body.gravity} m/s²</dd></div>
          <div><dt>Mean radius</dt><dd>{body.radiusKm.toLocaleString()} km</dd></div>
          <div><dt>Mass</dt><dd>{fmtMass(body.mass)}</dd></div>
          {body.distance && <div><dt>From the Sun</dt><dd>{body.distance}</dd></div>}
          {body.temperature && <div><dt>Temperature</dt><dd>{body.temperature}</dd></div>}
          {sites.length > 0 && <div><dt>Artifacts found</dt><dd>{done} of {sites.length}</dd></div>}
          {isLandable(selected) && <div><dt>Landing sites</dt><dd>{sites.length}</dd></div>}
        </dl>
        <p className="ip-blurb">{body.blurb}</p>
        <div className="ip-actions">
          <button className="btn-glow" disabled={warping || here} onClick={() => requestWarp(selected)}>
            {here ? `In orbit of ${body.name}` : `Warp to ${body.name}`}
          </button>
          <button className="button secondary" onClick={() => setSelected(null)}>Close</button>
        </div>
        <details className="credits">
          <summary>Credits</summary>
          <p className="small">Planet, Sun and Moon textures: Solar System Scope, CC BY 4.0, from NASA data. Star catalog and constellation lines: d3-celestial. Facts: NASA/JPL fact sheets (DRAFT – verify).</p>
        </details>
      </div>
    </aside>
  )
}
