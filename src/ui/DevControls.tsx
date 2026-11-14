import { artifacts } from '../data/artifacts'
import { useGame } from '../state/game'

// Phase 1 only: lets us test scene switching before the real Land flow exists.
export default function DevControls() {
  const { scene, goTo } = useGame()
  if (scene === 'title') return null
  return (
    <div className="hud">
      {scene === 'space' ? (
        <>
          <span className="small">Phase 1 test: land at</span>
          {artifacts.map((a) => (
            <button key={a.id} className="button secondary" onClick={() => goTo('surface', a)}>{a.name}</button>
          ))}
        </>
      ) : (
        <button className="button" onClick={() => goTo('space')}>Return to ship</button>
      )}
    </div>
  )
}
