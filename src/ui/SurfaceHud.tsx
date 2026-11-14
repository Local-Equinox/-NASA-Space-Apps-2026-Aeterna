import { BODY_DATA, JUMP_SPEED } from '../data/bodies'
import { useGame } from '../state/game'

export default function SurfaceHud() {
  const { scene, site, surfaceWorld, overlay, goTo, setSpawn } = useGame()
  if (scene !== 'surface') return null
  const body = BODY_DATA[surfaceWorld]
  const g = body.gravity
  const height = JUMP_SPEED ** 2 / (2 * g)
  const air = (2 * JUMP_SPEED) / g
  return (
    <>
      <div className="hud-center">
        <span className="pill">{site ? site.site.name : body.name.toUpperCase()}</span>
        <span className="pill">Gravity {g} m/s² · Jump {height.toFixed(1)} m · {air.toFixed(1)} s in the air</span>
      </div>
      {overlay === 'none' && surfaceWorld !== 'earth' && (
        <div className="return-button">
          <button className="button secondary" onClick={() => { setSpawn(surfaceWorld); goTo('space') }}>Return to ship</button>
        </div>
      )}
      <p className="small controls-hint">WASD walk · Shift run · Space jump · drag to look · wheel to zoom · E inspect / board</p>
    </>
  )
}
