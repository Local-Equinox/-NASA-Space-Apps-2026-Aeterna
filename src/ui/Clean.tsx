import { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../state/game'
import { sfx } from '../lib/sound'

const W = 560
const H = 200
const GOAL = 0.95

interface Rock { id: number; x: number; y: number; size: number; rot: number; radius: string }

const makeRocks = (): Rock[] =>
  Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: 14 + ((i * 19 + 7) % 70),
    y: 22 + ((i * 37) % 56),
    size: 54 + ((i * 23) % 36),
    rot: (i * 53) % 360,
    radius: `${40 + ((i * 7) % 20)}% ${55 - ((i * 5) % 15)}% ${45 + ((i * 11) % 15)}% ${60 - ((i * 3) % 20)}%`,
  }))

const outside = (r: Rock) => r.x < -2 || r.x > 102 || r.y < -4 || r.y > 104

// Inspect minigame: lift the big rocks off the nameplate, then brush the dust away to read it.
export default function Clean() {
  const { site, setOverlay } = useGame()
  const [rocks, setRocks] = useState<Rock[]>(makeRocks)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const plate = useRef<HTMLDivElement>(null)
  const dust = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ id: number; px: number; py: number } | null>(null)
  const brush = useRef<{ x: number; y: number; lastCheck: number; lastSound: number } | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const world = site?.world ?? 'moon'
  const stage = rocks.some((r) => !outside(r)) ? 'rocks' : 'dust'
  const dustName = world === 'mars' ? 'Mars dust' : 'Moon dust'

  // Paint the dust layer once
  useEffect(() => {
    const c = dust.current
    if (!c) return
    const g = c.getContext('2d')!
    const [base, light, dark] = world === 'mars' ? ['#a4502c', '#c9693d', '#6f3219'] : ['#8c8c89', '#b3b3af', '#5c5c59']
    g.fillStyle = base; g.fillRect(0, 0, W, H)
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = Math.random() < 0.5 ? light : dark
      g.globalAlpha = 0.25 + Math.random() * 0.4
      g.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 3, 1 + Math.random() * 3)
    }
    g.globalAlpha = 1
  }, [world])

  const finish = () => {
    const c = dust.current
    if (c) c.getContext('2d')!.clearRect(0, 0, W, H)
    setProgress(1); setDone(true); sfx.unlock()
  }

  const cleared = () => {
    const c = dust.current!
    const d = c.getContext('2d')!.getImageData(0, 0, W, H).data
    let clear = 0, n = 0
    for (let i = 3; i < d.length; i += 4 * 9) { n++; if (d[i] < 40) clear++ }
    return clear / n
  }

  const rockDown = (e: React.PointerEvent, r: Rock) => {
    if (done) return
    drag.current = { id: r.id, px: e.clientX, py: e.clientY }
    try { (e.target as Element).setPointerCapture(e.pointerId) } catch { /* ignore */ }
  }
  const rockMove = (e: React.PointerEvent) => {
    const dr = drag.current
    const box = plate.current?.getBoundingClientRect()
    if (!dr || !box) return
    const dx = ((e.clientX - dr.px) / box.width) * 100
    const dy = ((e.clientY - dr.py) / box.height) * 100
    drag.current = { ...dr, px: e.clientX, py: e.clientY }
    setRocks((rs) => rs.map((r) => (r.id === dr.id ? { ...r, x: r.x + dx, y: r.y + dy } : r)))
  }
  const rockUp = () => {
    if (!drag.current) return
    drag.current = null
    sfx.thud()
  }

  const toCanvas = (e: React.PointerEvent) => {
    const box = dust.current!.getBoundingClientRect()
    return { x: ((e.clientX - box.left) / box.width) * W, y: ((e.clientY - box.top) / box.height) * H }
  }
  const brushDown = (e: React.PointerEvent) => {
    if (stage !== 'dust' || done) return
    const p = toCanvas(e)
    brush.current = { ...p, lastCheck: 0, lastSound: 0 }
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId) } catch { /* ignore */ }
    sweep(p, p)
  }
  const sweep = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const g = dust.current!.getContext('2d')!
    g.globalCompositeOperation = 'destination-out'
    g.lineCap = 'round'; g.lineJoin = 'round'
    g.globalAlpha = 0.5; g.lineWidth = 92
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke()
    g.globalAlpha = 1; g.lineWidth = 66
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke()
    g.globalCompositeOperation = 'source-over'
  }
  const brushMove = (e: React.PointerEvent) => {
    const box = e.currentTarget.getBoundingClientRect()
    setCursor({ x: e.clientX - box.left, y: e.clientY - box.top })
    const b = brush.current
    if (!b || stage !== 'dust' || done) return
    const p = toCanvas(e)
    sweep(b, p)
    const now = performance.now()
    if (now - b.lastSound > 90) { b.lastSound = now; sfx.brush() }
    b.x = p.x; b.y = p.y
    if (now - b.lastCheck > 160) {
      b.lastCheck = now
      const f = cleared()
      setProgress(f)
      if (f >= GOAL) finish()
    }
  }
  const brushUp = () => { brush.current = null }

  const plateText = useMemo(() => (site ? [site.name, `${site.mission} · ${site.year}`] : ['', '']), [site])
  if (!site) return null
  const pct = Math.min(100, Math.round(Math.min(progress / GOAL, 1) * 100))

  return (
    <section className="overlay wide" role="dialog" aria-labelledby="clean-title">
      <h2 id="clean-title">{done ? 'Nameplate uncovered' : 'Uncover the nameplate'}</h2>
      <p role="status" className="small">
        {done
          ? 'You can read it. This is what was left here.'
          : stage === 'rocks'
            ? 'Step 1: debris covers the plate. Press and drag the big rocks off it.'
            : `Step 2: hold and drag the brush across the plate to sweep off the ${dustName}.`}
      </p>
      <div
        className={`clean-area ${world} ${stage === 'dust' && !done ? 'brushing' : ''}`}
        onPointerDown={brushDown}
        onPointerMove={brushMove}
        onPointerUp={brushUp}
        onPointerCancel={brushUp}
        onPointerLeave={() => setCursor(null)}
      >
        <div className="plate" ref={plate} style={{ aspectRatio: `${W} / ${H}` }}>
          <div className="plate-text">
            <b>{plateText[0]}</b>
            <span>{plateText[1]}</span>
          </div>
          <canvas ref={dust} width={W} height={H} className={`dust ${done ? 'gone' : ''}`} />
          {rocks.map((r) => (
            <div
              key={r.id}
              className={`rock ${outside(r) ? 'off' : ''}`}
              style={{ left: `${r.x}%`, top: `${r.y}%`, width: r.size, height: r.size * 0.8, borderRadius: r.radius, transform: `translate(-50%,-50%) rotate(${r.rot}deg)` }}
              onPointerDown={(e) => { e.stopPropagation(); rockDown(e, r) }}
              onPointerMove={rockMove}
              onPointerUp={rockUp}
              onPointerCancel={rockUp}
            />
          ))}
        </div>
        {stage === 'dust' && !done && cursor && <span className="brush" style={{ left: cursor.x, top: cursor.y }} aria-hidden="true">🖌️</span>}
      </div>
      <div className="progress" aria-hidden="true"><i style={{ width: `${stage === 'rocks' ? Math.round(((5 - rocks.filter((r) => !outside(r)).length) / 5) * 25) : 25 + pct * 0.75}%` }} /></div>
      <div className="row">
        {done && <button className="button" onClick={() => setOverlay('story')}>Read the story</button>}
      </div>
    </section>
  )
}
