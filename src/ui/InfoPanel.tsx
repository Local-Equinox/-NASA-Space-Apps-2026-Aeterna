import { artifacts } from '../data/artifacts'
import { BODY_DATA, isLandable } from '../data/bodies'
import { useGame } from '../state/game'

const fmtMass = ([m, e]: [number, number]) => `${m} × 10^${e} kg`

export default function InfoPanel() {
  const { overlay, selected, found, warping, requestWarp, setSelected } = useGame()
  if (!selected || overlay !== 'none') return null
  const body = BODY_DATA[selected]
  if (!body) return null
  const sites = artifacts.filter((a) => a.world === selected)
  const done = sites.filter((a) => found.includes(a.id)).length
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
        {!isLandable(selected) && (<><dt>Landing</dt><dd>Not available</dd></>)}
      </dl>
      <p className="small blurb">{body.blurb}</p>
      <div className="row">
        <button className="button" disabled={warping} onClick={() => requestWarp(selected)}>Warp</button>
        <button className="button secondary" onClick={() => setSelected(null)}>Close</button>
      </div>
    </aside>
  )
}
