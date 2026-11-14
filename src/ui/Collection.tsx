import { artifacts } from '../data/artifacts'
import { isLandable, type SiteWorld } from '../data/bodies'
import { useGame } from '../state/game'
import type { Artifact, World } from '../types/artifact'

const GROUPS: { world: World; title: string; body?: string }[] = [
  { world: 'moon', title: 'Moon', body: 'moon' },
  { world: 'mars', title: 'Mars', body: 'mars' },
  { world: 'space', title: 'Deep space' },
]

// The missions list: every piece of hardware, grouped by where it is. Unexplored ones stay "???".
// In space, choosing one selects its destination (or lands there if the ship is already in orbit).
export default function Collection() {
  const { scene, found, near, setOverlay, setSelected, goTo, readStory, resetProgress } = useGame()
  const inSpace = scene === 'space'

  const choose = (a: Artifact) => {
    const got = found.includes(a.id)
    if (inSpace) {
      if (a.world !== 'space' && near === a.world && isLandable(a.world)) {
        setOverlay('none')
        goTo('surface', a, a.world as SiteWorld)
      } else {
        setSelected(a.world === 'space' ? a.body ?? null : a.world)
        setOverlay('none')
      }
    } else if (got) readStory(a) // already found: straight to its story
  }

  return (
    <section className="overlay missions" role="dialog" aria-labelledby="missions-title">
      <h2 id="missions-title">{artifacts.length} pieces of hardware</h2>
      <p className="small">
        {found.length} of {artifacts.length} explored. {inSpace ? 'Click one to set course there.' : 'Fly to the Moon, Mars or deep space to explore them.'}
      </p>
      {GROUPS.map((g) => {
        const list = artifacts.filter((a) => a.world === g.world)
        return (
          <div key={g.world} className="mission-group">
            <h3>
              {g.title} <small>{list.filter((a) => found.includes(a.id)).length}/{list.length}</small>
            </h3>
            <ul>
              {list.map((a) => {
                const got = found.includes(a.id)
                const usable = inSpace || got
                return (
                  <li key={a.id}>
                    <button className={`mission ${got ? 'done' : ''}`} onClick={() => choose(a)} disabled={!usable}>
                      <i aria-hidden="true" />
                      <span>
                        <b>{artifacts.indexOf(a) + 1}. {got ? a.name : '???'}</b>
                        <em>{got ? `Explored · ${a.mission}, ${a.year}` : a.world === 'space' ? 'Unexplored · warp there' : 'Unexplored · you can land there'}</em>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
      {inSpace && (
        <div className="mission-group">
          <h3>Home</h3>
          <ul>
            <li>
              <button className="mission home" onClick={() => { setSelected('earth'); setOverlay('none') }}>
                <i aria-hidden="true" />
                <span><b>Earth</b><em>Set course for home</em></span>
              </button>
            </li>
          </ul>
        </div>
      )}
      <p className="mission-legend small"><i className="dot done" /> Explored <i className="dot" /> Unexplored (???)</p>
      <div className="row">
        <button className="button secondary" onClick={() => setOverlay('stories')}>View all stories</button>
        <button className="button secondary" onClick={resetProgress}>Reset progress</button>
        <button className="button" onClick={() => setOverlay('none')}>Close</button>
      </div>
    </section>
  )
}
