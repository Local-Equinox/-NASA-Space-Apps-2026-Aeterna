import { BODIES, JUMP_SPEED } from '../data/bodies'
import { useGame } from '../state/game'

export default function SurfaceHud() {
  const { scene, site, overlay, goTo, setSpawn } = useGame()
  if (scene !== 'surface' || !site) return null
  const g = BODIES[site.world].gravity
  return (
    <>
      <div className="hud">
        <span className="pill">{site.site.name}</span>
        <span className="pill">Gravity {g} m/s² · jump {(JUMP_SPEED ** 2 / (2 * g)).toFixed(1)} m</span>
        {overlay === 'none' && (
          <button className="button" onClick={() => { setSpawn(site.world); goTo('space') }}>Return to ship</button>
        )}
      </div>
      <p className="small controls-hint">WASD walk · Shift run · Space jump · drag to look · wheel to zoom · E inspect</p>
    </>
  )
}
