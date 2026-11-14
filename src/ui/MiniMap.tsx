import { useEffect, useRef } from 'react'
import { track } from '../lib/track'
import { useGame } from '../state/game'

const SIZE = 150
const RANGE = 120 // metres from the player to the edge of the map

// Tracker: artifacts appear as ??? until the player finds them. Positions are the site's placeholder
// coordinates until the researcher adds real ones.
export default function MiniMap() {
  const { scene, overlay, setOverlay } = useGame()
  const ref = useRef<HTMLCanvasElement>(null)
  const visible = scene === 'surface'

  useEffect(() => {
    if (!visible) return
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = canvas.height = SIZE * dpr
    const g = canvas.getContext('2d')!
    g.scale(dpr, dpr)
    let raf = 0
    const c = SIZE / 2
    const draw = () => {
      g.clearRect(0, 0, SIZE, SIZE)
      g.fillStyle = 'rgba(10,16,32,0.85)'
      g.beginPath(); g.arc(c, c, c - 1, 0, Math.PI * 2); g.fill()
      g.strokeStyle = 'rgba(124,196,255,0.35)'; g.lineWidth = 1
      for (const r of [c * 0.33, c * 0.66, c - 2]) { g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke() }

      const { x, z, yaw } = track
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw)
      const rx = Math.cos(yaw), rz = -Math.sin(yaw)
      const place = (px: number, pz: number) => {
        const dx = px - x, dz = pz - z
        let sx = (dx * rx + dz * rz) / RANGE * (c - 6)
        let sy = -(dx * fx + dz * fz) / RANGE * (c - 6)
        const len = Math.hypot(sx, sy)
        const clamped = len > c - 10
        if (clamped) { sx *= (c - 10) / len; sy *= (c - 10) / len }
        return { x: c + sx, y: c + sy, clamped }
      }

      const ship = place(track.ship.x, track.ship.z)
      g.fillStyle = '#e8ecf5'; g.fillRect(ship.x - 4, ship.y - 4, 8, 8)
      g.font = '10px system-ui'; g.textAlign = 'center'
      g.fillText('ship', ship.x, ship.y + 15)

      track.markers.forEach((m, mi) => {
        const p = place(m.x, m.z)
        g.globalAlpha = p.clamped ? 0.65 : 1
        g.fillStyle = m.found ? '#5bd18a' : '#ffd166'
        g.beginPath(); g.arc(p.x, p.y, 6, 0, Math.PI * 2); g.fill()
        g.fillStyle = '#06101f'; g.font = 'bold 9px system-ui'
        g.fillText(m.found ? '✔' : '?', p.x, p.y + 3)
        if (mi === 0) { g.fillStyle = '#ffd166'; g.font = 'bold 11px system-ui'; g.fillText(m.found ? 'found' : '???', p.x, p.y + 18) }
        g.globalAlpha = 1
      })

      // The player always points up
      g.fillStyle = '#7cc4ff'
      g.beginPath(); g.moveTo(c, c - 7); g.lineTo(c + 5, c + 6); g.lineTo(c - 5, c + 6); g.closePath(); g.fill()
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [visible])

  if (!visible) return null
  // Stay mounted during the decision and story (just hidden): unmounting it used to leave the map blank afterwards.
  const hidden = overlay === 'story' || overlay === 'clean' || overlay === 'map' || overlay === 'collection' || overlay === 'stories'
  return <canvas ref={ref} className="minimap" style={{ width: SIZE, height: SIZE, visibility: hidden ? 'hidden' : 'visible' }} role="button" tabIndex={0} onClick={() => setOverlay('map')} onKeyDown={(e) => { if (e.key === 'Enter') setOverlay('map') }} aria-label="Map tracker. Undiscovered equipment shows as question marks. Press to open the world map (M)." title="Open world map (M)" />
}
