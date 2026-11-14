import { artifacts } from '../data/artifacts'
import { useGame } from '../state/game'

export default function Collection() {
  const { found, setOverlay, resetProgress } = useGame()
  return (
    <section className="overlay" role="dialog" aria-labelledby="collection-title">
      <h2 id="collection-title">Collection: {found.length} of {artifacts.length} found</h2>
      <ul className="list">
        {artifacts.map((a) => {
          const unlocked = found.includes(a.id)
          return (
            <li key={a.id}>
              {unlocked ? '✔' : '🔒'} {unlocked ? a.name : 'Not found yet'}
              {unlocked && <p className="small">{a.story.whatItIs}</p>}
            </li>
          )
        })}
      </ul>
      {/* Phase 4: "View all stories" link (readable without playing 3D) */}
      <div className="row">
        <button className="button secondary" onClick={resetProgress}>Reset progress</button>
        <button className="button" onClick={() => setOverlay('none')}>Close</button>
      </div>
    </section>
  )
}
