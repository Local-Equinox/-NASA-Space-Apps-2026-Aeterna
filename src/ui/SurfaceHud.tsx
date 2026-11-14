import { BODIES } from '../data/bodies'
import { useGame } from '../state/game'

// Phase 3 replaces this with the full surface HUD and Inspect prompt.
export default function SurfaceHud() {
  const { scene, site, goTo, setSpawn } = useGame()
  if (scene !== 'surface' || !site) return null
  return (
    <div className="hud">
      <span className="pill">{site.site.name} · gravity {BODIES[site.world].gravity} m/s²</span>
      <button
        className="button"
        onClick={() => { setSpawn(site.world); goTo('space') }}
      >
        Return to ship
      </button>
    </div>
  )
}
