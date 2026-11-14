import { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/game'
import { sfx } from '../lib/sound'

const W = 640
const H = 320
const LANE = H / 2
const START = 76
const END = 566
const SPEED = 68
const PLAYER_R = 9

interface Rock { x: number; y: number; vy: number; r: number; spin: number; rot: number; shape: number[] }

const makeRock = (): Rock => {
  const r = 16 + Math.random() * 14
  const down = Math.random() < 0.5
  return {
    x: START + 70 + Math.random() * (END - START - 90),
    y: down ? -r - 20 : H + r + 20,
    vy: (down ? 1 : -1) * (85 + Math.random() * 60),
    r, spin: (Math.random() - 0.5) * 2, rot: Math.random() * 6,
    shape: Array.from({ length: 9 }, () => 0.72 + Math.random() * 0.4),
  }
}

// Inspect minigame for equipment out in space: tethered, cross to the spacecraft while rogue asteroids cut across the rope.
export default function Spacewalk() {
  const { site, setOverlay } = useGame()
  const canvas = useRef<HTMLCanvasElement>(null)
  const held = useRef({ fwd: false, back: false })
  const [bumps, setBumps] = useState(0)
  const [done, setDone] = useState(false)
  const doneRef = useRef(false)
  const preview = useRef<HTMLImageElement | null>(null)
  const stars = useRef(Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.6 + 0.4 })))

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'KeyD' || e.code === 'ArrowRight') { held.current.fwd = true; e.preventDefault() }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') { held.current.back = true; e.preventDefault() }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'KeyD' || e.code === 'ArrowRight') held.current.fwd = false
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') held.current.back = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useEffect(() => {
    const img = new Image()
    img.src = `./assets/models/previews/${site?.body}.png`
    preview.current = img
    const c = canvas.current!
    const g = c.getContext('2d')!
    const px = { x: START, flash: 0 }
    const rocks: Rock[] = []
    let spawn = 0.6
    let last = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!doneRef.current) {
        const h = held.current
        px.x = Math.max(START, Math.min(END, px.x + ((h.fwd ? 1 : 0) - (h.back ? 1 : 0)) * SPEED * dt))
        spawn -= dt
        if (spawn <= 0) { rocks.push(makeRock()); spawn = 0.8 + Math.random() * 0.9 }
        for (const r of rocks) { r.y += r.vy * dt; r.rot += r.spin * dt }
        for (let i = rocks.length - 1; i >= 0; i--) if (rocks[i].y < -80 || rocks[i].y > H + 80) rocks.splice(i, 1)
        // A hit throws you back to the ship
        for (const r of rocks) {
          if (Math.hypot(r.x - px.x, r.y - LANE) < r.r * 0.85 + PLAYER_R) {
            px.x = START; px.flash = 1; sfx.wrong(); setBumps((b) => b + 1)
            rocks.splice(rocks.indexOf(r), 1)
            break
          }
        }
        if (px.x >= END) { doneRef.current = true; setDone(true); sfx.unlock() }
      }
      px.flash = Math.max(0, px.flash - dt * 2.5)

      // Draw
      g.fillStyle = '#04070f'; g.fillRect(0, 0, W, H)
      g.fillStyle = '#cfd8ee'
      for (const s of stars.current) g.fillRect(s.x, s.y, s.s, s.s)
      // Ship hull
      g.fillStyle = '#c9d1e0'; g.fillRect(0, LANE - 44, 46, 88)
      g.fillStyle = '#5b6b8f'; g.fillRect(36, LANE - 14, 14, 28)
      // Spacecraft being inspected: a disc with a dish
      g.save(); g.translate(W - 36, LANE)
      g.shadowColor = '#ffd166'; g.shadowBlur = doneRef.current ? 24 : 10
      const im = preview.current
      if (im && im.complete && im.naturalWidth > 0) {
        const w = 120, h = (im.naturalHeight / im.naturalWidth) * w
        g.drawImage(im, -w / 2 - 14, -h / 2, w, h)
      } else {
        g.fillStyle = '#e2e6ee'; g.beginPath(); g.ellipse(0, 0, 26, 12, 0, 0, Math.PI * 2); g.fill()
      }
      g.restore()
      // Tether
      g.strokeStyle = '#ffd166'; g.lineWidth = 2; g.setLineDash([6, 4])
      g.beginPath(); g.moveTo(46, LANE); g.lineTo(px.x - PLAYER_R, LANE); g.stroke(); g.setLineDash([])
      // Asteroids
      for (const r of rocks) {
        g.save(); g.translate(r.x, r.y); g.rotate(r.rot)
        g.fillStyle = '#7b756d'; g.strokeStyle = '#3d3a36'; g.lineWidth = 2
        g.beginPath()
        r.shape.forEach((k, i) => { const a = (i / r.shape.length) * Math.PI * 2; const X = Math.cos(a) * r.r * k, Y = Math.sin(a) * r.r * k; i ? g.lineTo(X, Y) : g.moveTo(X, Y) })
        g.closePath(); g.fill(); g.stroke(); g.restore()
        // Warning tick at the edge it comes from
        if (r.y < 0 || r.y > H) { g.fillStyle = '#ff6b6b'; g.font = 'bold 14px system-ui'; g.textAlign = 'center'; g.fillText('!', r.x, r.y < 0 ? 14 : H - 6) }
      }
      // Astronaut
      g.fillStyle = '#f2f4fa'; g.beginPath(); g.arc(px.x, LANE, PLAYER_R, 0, Math.PI * 2); g.fill()
      g.fillStyle = '#2a6fdb'; g.beginPath(); g.ellipse(px.x + 2, LANE - 1, 5, 4, 0, 0, Math.PI * 2); g.fill()
      if (px.flash > 0) { g.fillStyle = `rgba(255,80,80,${px.flash * 0.35})`; g.fillRect(0, 0, W, H) }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!site) return null
  const hold = (k: 'fwd' | 'back', v: boolean) => ({
    onPointerDown: (e: React.PointerEvent) => { held.current[k] = v; try { (e.target as Element).setPointerCapture(e.pointerId) } catch { /* ignore */ } },
    onPointerUp: () => { held.current[k] = false },
    onPointerCancel: () => { held.current[k] = false },
    onPointerLeave: () => { held.current[k] = false },
  })
  return (
    <section className="overlay wide" role="dialog" aria-labelledby="walk-title">
      <h2 id="walk-title">{done ? 'You reached it' : 'Spacewalk'}</h2>
      <p role="status" className="small">
        {done
          ? `You are at ${site.name}. Take a good look.`
          : 'You are on a tether. Hold → (or D) to drift toward the spacecraft, ← (or A) to pull back. Rogue asteroids cross the rope: wait for a gap. A hit throws you back to the ship.'}
      </p>
      <canvas ref={canvas} width={W} height={H} className="walk" role="img" aria-label="Spacewalk: a tethered astronaut crossing to a spacecraft while asteroids pass" />
      <div className="row walk-controls">
        <button className="button secondary" {...hold('back', true)} aria-label="Pull back">◄ Back</button>
        <button className="button" {...hold('fwd', true)} aria-label="Move forward">Forward ►</button>
        <span className="small">Hits: {bumps}</span>
      </div>
      {done && <button className="button" onClick={() => setOverlay('cutscene')}>Inspect the spacecraft</button>}
    </section>
  )
}
