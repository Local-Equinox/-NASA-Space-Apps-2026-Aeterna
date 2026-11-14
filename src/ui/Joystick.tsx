import { useEffect, useRef } from 'react'
import { touch } from '../lib/touch'
import { useGame } from '../state/game'

const RADIUS = 46
const RUN_AT = 0.92 // push the stick to its rim to sprint on foot

type Flag = 'jump' | 'down' | 'boost'

function HoldButton({ flag, label, className }: { flag: Flag; label: string; className: string }) {
  const off = () => { touch[flag] = false }
  return (
    <button
      className={`touch-btn touch-only ${className}`}
      aria-label={label}
      onPointerDown={(e) => { try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ignore */ } touch[flag] = true }}
      onPointerUp={off}
      onPointerCancel={off}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  )
}

// Shown only on touch devices: stick on the left walks / flies, buttons on the right jump or climb.
// Anything not covered by the controls (look around, tap to select) is a drag or tap on the 3D view.
export default function Joystick() {
  const { scene } = useGame()
  const thumb = useRef<HTMLDivElement>(null)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const pointer = useRef<number | null>(null)

  const set = (dx: number, dy: number) => {
    const len = Math.hypot(dx, dy)
    const k = len > RADIUS ? RADIUS / len : 1
    dx *= k; dy *= k
    touch.x = dx / RADIUS
    touch.y = -dy / RADIUS
    touch.run = Math.hypot(touch.x, touch.y) >= RUN_AT
    if (thumb.current) thumb.current.style.transform = `translate(${dx}px, ${dy}px)`
  }
  const reset = () => { origin.current = null; pointer.current = null; set(0, 0) }

  // Never leave the ship drifting if the controls disappear mid-touch (overlay opens, scene changes).
  useEffect(() => () => {
    touch.x = touch.y = 0
    touch.jump = touch.down = touch.boost = touch.run = false
  }, [])

  return (
    <>
      <div
        className="joystick touch-only"
        aria-hidden="true"
        onPointerDown={(e) => {
          if (pointer.current !== null) return
          pointer.current = e.pointerId
          const r = e.currentTarget.getBoundingClientRect()
          origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
          try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* synthetic or lost pointer */ }
          set(e.clientX - origin.current.x, e.clientY - origin.current.y)
        }}
        onPointerMove={(e) => e.pointerId === pointer.current && origin.current && set(e.clientX - origin.current.x, e.clientY - origin.current.y)}
        onPointerUp={(e) => e.pointerId === pointer.current && reset()}
        onPointerCancel={(e) => e.pointerId === pointer.current && reset()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div ref={thumb} className="joystick-thumb" />
      </div>
      {scene === 'surface' ? (
        <HoldButton flag="jump" label="Jump" className="jump-button" />
      ) : (
        <div className="space-buttons touch-only">
          <HoldButton flag="jump" label="Up" className="" />
          <HoldButton flag="down" label="Down" className="" />
          <HoldButton flag="boost" label="Boost" className="boost" />
        </div>
      )}
    </>
  )
}
