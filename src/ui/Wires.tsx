import { useMemo, useRef, useState } from 'react'
import { useGame } from '../state/game'
import { sfx } from '../lib/sound'

const W = 560
const H = 300
const LEFT_END = 150
const RIGHT_END = 410
const WIRES = [
  { color: '#ff4d4d', name: 'red', mark: '●' },
  { color: '#4da3ff', name: 'blue', mark: '▲' },
  { color: '#ffd24d', name: 'yellow', mark: '■' },
  { color: '#4dff88', name: 'green', mark: '◆' },
]
const yOf = (slot: number) => 50 + slot * 66

// Inspect minigame for equipment with no (readable) nameplate: join the cut, colour-coded wires to power it up.
export default function Wires() {
  const { site, setOverlay } = useGame()
  const svg = useRef<SVGSVGElement>(null)
  // Right-hand side: which colour sits in each slot (shuffled once; never in the same order as the left)
  const order = useMemo(() => {
    const a = [0, 1, 2, 3]
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
    if (a.every((v, i) => v === i)) a.push(a.shift()!)
    return a
  }, [])
  const [joined, setJoined] = useState<boolean[]>([false, false, false, false])
  const [drag, setDrag] = useState<{ wire: number; x: number; y: number } | null>(null)
  const [miss, setMiss] = useState(false)
  const done = joined.every(Boolean)
  const slotOf = (wire: number) => order.indexOf(wire)

  const point = (e: React.PointerEvent) => {
    const m = svg.current!.getScreenCTM()!.inverse()
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m)
    return { x: p.x, y: p.y }
  }
  const down = (e: React.PointerEvent, wire: number) => {
    if (joined[wire]) return
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId) } catch { /* ignore */ }
    setDrag({ wire, ...point(e) })
  }
  const move = (e: React.PointerEvent) => { if (drag) setDrag({ ...drag, ...point(e) }) }
  const up = (e: React.PointerEvent) => {
    if (!drag) return
    const p = point(e)
    let hit = -1
    for (let s = 0; s < 4; s++) if (Math.hypot(p.x - RIGHT_END, p.y - yOf(s)) < 34) hit = s
    if (hit >= 0 && order[hit] === drag.wire) {
      setJoined((j) => j.map((v, i) => (i === drag.wire ? true : v)))
      sfx.right()
    } else if (hit >= 0) {
      setMiss(true); sfx.wrong(); setTimeout(() => setMiss(false), 500)
    }
    setDrag(null)
  }

  const path = (x1: number, y1: number, x2: number, y2: number) => `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`
  if (!site) return null
  return (
    <section className="overlay minigame-overlay" role="dialog" aria-labelledby="wires-title">
      <h2 id="wires-title">{done ? 'Module powered' : 'Power up the module'}</h2>
      <p role="status" className="small">
        {done
          ? 'The lights come on. Its module menu is ready.'
          : 'No nameplate to read here. The wires are cut: press a wire end on the left and drag it to the end with the matching colour and shape on the right.'}
      </p>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className={`wires ${done ? 'on' : ''} ${miss ? 'miss' : ''}`} onPointerMove={move} onPointerUp={up} onPointerCancel={() => setDrag(null)} role="img" aria-label="Four cut wires: red, blue, yellow and green. Drag each left end to the matching right end.">
        <rect x="6" y="6" width={W - 12} height={H - 12} rx="14" className="wires-panel" />
        {WIRES.map((w, i) => (
          <g key={`l${i}`}>
            <line x1="40" y1={yOf(i)} x2={LEFT_END} y2={yOf(i)} stroke={w.color} strokeWidth="8" strokeLinecap="round" />
            <circle cx="40" cy={yOf(i)} r="14" className="terminal" />
            <text x="40" y={yOf(i) + 6} textAnchor="middle" className="mark">{w.mark}</text>
          </g>
        ))}
        {WIRES.map((_, s) => {
          const w = WIRES[order[s]]
          return (
            <g key={`r${s}`}>
              <line x1={RIGHT_END} y1={yOf(s)} x2={W - 40} y2={yOf(s)} stroke={w.color} strokeWidth="8" strokeLinecap="round" />
              <circle cx={W - 40} cy={yOf(s)} r="14" className="terminal" />
              <text x={W - 40} y={yOf(s) + 6} textAnchor="middle" className="mark">{w.mark}</text>
              <circle cx={RIGHT_END} cy={yOf(s)} r="9" fill="#06101f" stroke={w.color} strokeWidth="3" />
            </g>
          )
        })}
        {WIRES.map((w, i) => joined[i] && (
          <path key={`j${i}`} d={path(LEFT_END, yOf(i), RIGHT_END, yOf(slotOf(i)))} stroke={w.color} strokeWidth="8" fill="none" strokeLinecap="round" className="live" />
        ))}
        {WIRES.map((w, i) => !joined[i] && (
          <g key={`h${i}`} onPointerDown={(e) => down(e, i)} className="handle">
            {drag?.wire === i && <path d={path(LEFT_END, yOf(i), drag.x, drag.y)} stroke={w.color} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.9" />}
            <circle cx={drag?.wire === i ? drag.x : LEFT_END} cy={drag?.wire === i ? drag.y : yOf(i)} r="18" fill={w.color} stroke="#06101f" strokeWidth="3" />
          </g>
        ))}
      </svg>
      <div className="row">
        {done && <button className="button" onClick={() => setOverlay('cutscene')}>Open module menu</button>}
      </div>
    </section>
  )
}
