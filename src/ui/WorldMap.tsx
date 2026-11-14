import { artifacts } from '../data/artifacts'
import { mapPos, shortLabel, siteLabel, sitePoints, worldMapImage } from '../lib/sites'
import { useGame } from '../state/game'
import type { World } from '../types/artifact'

// A world's surface map with every equipment site on it: named once found, ??? until then.
export default function WorldMap({ world, onPick }: { world: World; onPick?: (id: string) => void }) {
  const { found, site: here, scene } = useGame()
  const list = artifacts.filter((a) => a.world === world)
  return (
    <div className="site-map" style={{ backgroundImage: worldMapImage(world) }}>
      {list.flatMap((a, i) =>
        sitePoints(a).map((p, pi) => {
          const label = shortLabel(a, found)
          const props = {
            className: `site-dot ${found.includes(a.id) ? 'done' : ''} ${(i + pi) % 2 ? 'alt' : ''} ${scene === 'surface' && here?.id === a.id ? 'here' : ''}`,
            style: mapPos(p.lat, p.lon),
            title: `${siteLabel(a, found)} (${p.lat}°, ${p.lon}°)`,
          }
          return onPick ? (
            <button key={p.key} {...props} onClick={() => onPick(a.id)} aria-label={siteLabel(a, found)}><span>{label}</span></button>
          ) : (
            <div key={p.key} {...props} role="img" aria-label={siteLabel(a, found)}><span>{label}</span></div>
          )
        }),
      )}
    </div>
  )
}
