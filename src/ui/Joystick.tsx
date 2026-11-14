import { useRef } from 'react'
import { touch } from '../lib/touch'

const RADIUS = 42

// Shown only on touch devices (see CSS: pointer: coarse).
export default function Joystick() {
  const thumb = useRef<HTMLDivElement>(null)
  const origin = useRef<{ x: number; y: number } | null>(null)

  const set = (dx: number, dy: number) => {
    const len = Math.hypot(dx, dy)
    const k = len > RADIUS ? RADIUS / len : 1
    dx *= k; dy *= k
    touch.x = dx / RADIUS
    touch.y = -dy / RADIUS
    if (thumb.current) thumb.current.style.transform = `translate(${dx}px, ${dy}px)`
  }
  const reset = () => { origin.current = null; set(0, 0) }

  return (
    <>
      <div
        className="joystick touch-only"
        aria-hidden="true"
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
          try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* synthetic or lost pointer */ }
          set(e.clientX - origin.current.x, e.clientY - origin.current.y)
        }}
        onPointerMove={(e) => origin.current && set(e.clientX - origin.current.x, e.clientY - origin.current.y)}
        onPointerUp={reset}
        onPointerCancel={reset}
      >
        <div ref={thumb} className="joystick-thumb" />
      </div>
      <button
        className="jump-button touch-only"
        aria-label="Jump"
        onPointerDown={() => { touch.jump = true }}
        onPointerUp={() => { touch.jump = false }}
        onPointerCancel={() => { touch.jump = false }}
        onPointerLeave={() => { touch.jump = false }}
      >
        Jump
      </button>
    </>
  )
}
