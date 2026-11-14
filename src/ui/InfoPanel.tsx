import { artifacts } from '../data/artifacts'
import { BODY_DATA, isLandable } from '../data/bodies'
import { useGame } from '../state/game'

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
    return (
      <aside className="info-panel" aria-label={`${body.name} information`}>
        <h2>{body.name}</h2>
        <p className="small">{body.type}</p>
        <dl>
          <dt>Mission</dt><dd>{equipment.mission}, {equipment.year}</dd>
          <dt>Where it is</dt><dd>{equipment.whereabouts}</dd>
          <dt>Status</dt><dd>{got ? '✔ Found' : 'Not inspected yet'}</dd>
        </dl>
        <p className="small blurb">{body.blurb} When you arrive, press E to start the spacewalk.</p>
        <div className="row">
          <button className="btn-glow" disabled={warping || here} onClick={() => requestWarp(selected)}>
            {here ? `Next to ${body.name}` : `Warp to ${body.name}`}
          </button>
          <button className="button secondary" onClick={() => setSelected(null)}>Close</button>
        </div>
      </aside>
    )
  }
  return (
    <aside className="info-panel" aria-label={`${body.name} information`}>
      <h2>{body.name}</h2>
      <p className="small">{body.type}</p>
      <dl>
        <dt>Surface gravity</dt><dd>{body.gravity} m/s²</dd>
        <dt>Mean radius</dt><dd>{body.radiusKm.toLocaleString()} km</dd>
        <dt>Mass</dt><dd>{fmtMass(body.mass)}</dd>
        {body.distance && (<><dt>From the Sun</dt><dd>{body.distance}</dd></>)}
        {body.temperature && (<><dt>Temperature</dt><dd>{body.temperature}</dd></>)}
        {sites.length > 0 && (<><dt>Artifacts found</dt><dd>{done} of {sites.length}</dd></>)}
        {isLandable(selected) && (<><dt>Landing sites</dt><dd>{sites.length}</dd></>)}
      </dl>
      <p className="small blurb">{body.blurb}</p>
      <div className="row">
        <button className="btn-glow" disabled={warping || here} onClick={() => requestWarp(selected)}>
          {here ? `In orbit of ${body.name}` : `Warp to ${body.name}`}
        </button>
        <button className="button secondary" onClick={() => setSelected(null)}>Close</button>
      </div>
      <details className="credits">
        <summary>Credits</summary>
        <p className="small">Planet, Sun and Moon textures: Solar System Scope, CC BY 4.0, from NASA data. Star catalog and constellation lines: d3-celestial. Facts: NASA/JPL fact sheets (DRAFT – verify).</p>
      </details>
    </aside>
  )
}
