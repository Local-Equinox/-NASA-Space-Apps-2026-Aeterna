import { artifacts } from '../data/artifacts'
import { BODIES } from '../data/bodies'
import { useGame } from '../state/game'

export default function InfoPanel() {
  const { overlay, selected, found, warping, requestWarp, setSelected } = useGame()
  if (!selected || overlay !== 'none') return null
  const body = BODIES[selected]
  const list = artifacts.filter((a) => a.world === selected)
  const done = list.filter((a) => found.includes(a.id)).length
  return (
    <aside className="info-panel" aria-label={`${body.name} information`}>
      <h2>{body.name}</h2>
      <dl>
        <dt>Type</dt><dd>{body.type}</dd>
        <dt>Surface gravity</dt><dd>{body.gravity} m/s²</dd>
        <dt>Artifacts found</dt><dd>{done} of {list.length}</dd>
      </dl>
      <div className="row">
        <button className="button" disabled={warping} onClick={() => requestWarp(selected)}>Warp</button>
        <button className="button secondary" onClick={() => setSelected(null)}>Close</button>
      </div>
    </aside>
  )
}
