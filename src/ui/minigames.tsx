import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useGame } from '../state/game'
import { sfx } from '../lib/sound'
import { useFinish } from './useFinish'

// Four extra inspect minigames. Each one runs until it is won, then goes on to the flashback and story by itself.
//   Moon and Mars: Antenna (point the dish at Earth) and Reboot (repeat the start-up sequence)
//   Deep space:    Signal (match the faint radio wave) and Burn (time the thruster burns)

function Frame({ id, title, status, children }: { id: string; title: string; status: string; children: ReactNode }) {
  return (
    <section className="overlay minigame-overlay" role="dialog" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <p role="status" className="small">{status}</p>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Antenna: turn the dish until the signal from Earth is strongest, then hold it there.
export function Antenna() {
  const { site } = useGame()
  const target = useMemo(() => 25 + Math.random() * 130, [])
  const [angle, setAngle] = useState(90)
  const [lock, setLock] = useState(0)
  const [done, setDone] = useState(false)
  const angleRef = useRef(90)
  const lockRef = useRef(0)
  angleRef.current = angle
  useFinish(done)

  useEffect(() => {
    const t = setInterval(() => {
      if (lockRef.current >= 1) return
      const near = Math.abs(angleRef.current - target) <= 6
      lockRef.current = near ? Math.min(1, lockRef.current + 0.05 / 1.5) : Math.max(0, lockRef.current - 0.1)
      setLock(lockRef.current)
      if (lockRef.current >= 1) { setDone(true); sfx.unlock(); clearInterval(t) }
    }, 50)
    return () => clearInterval(t)
  }, [target])

  const strength = Math.max(0, 1 - Math.abs(angle - target) / 70)
  if (!site) return null
  return (
    <Frame id="antenna-title" title={done ? 'Signal locked' : 'Realign the antenna'}
      status={done ? 'Earth answers. The equipment wakes up and its records open.' : 'The dish has drifted. Turn it with the slider until the signal is strongest, then hold it steady.'}>
      <svg viewBox="0 0 560 240" className="mg-svg" role="img" aria-label="A radio dish that you turn to point at Earth">
        <rect x="6" y="6" width="548" height="228" rx="14" className="mg-panel" />
        {[40, 90, 140].map((x) => <circle key={x} cx={x * 3.5} cy={20 + (x % 70)} r="1.5" fill="#cfd8ee" opacity=".7" />)}
        <g transform="translate(280 214)">
          <rect x="-26" y="-6" width="52" height="22" rx="4" fill="#5b6b8f" />
          <g transform={`rotate(${-angle})`}>
            <line x1="0" y1="0" x2="230" y2="0" stroke={strength > 0.8 ? '#6fdc8c' : '#ffd166'} strokeWidth="2" strokeDasharray="6 5" opacity={0.25 + strength * 0.6} />
            <line x1="0" y1="0" x2="34" y2="0" stroke="#c9d1e0" strokeWidth="5" />
            <path d="M 40 -42 Q 8 0 40 42" fill="none" stroke="#e2e6ee" strokeWidth="7" strokeLinecap="round" />
          </g>
        </g>
      </svg>
      <div className="mg-meter" aria-label={`Signal strength ${Math.round(strength * 100)} percent`}>
        <span>Signal</span>
        <div className="mg-bar"><i style={{ width: `${strength * 100}%` }} className={strength > 0.85 ? 'hot' : ''} /></div>
        <b>{Math.round(strength * 100)}%</b>
      </div>
      <div className="mg-meter">
        <span>Lock</span>
        <div className="mg-bar"><i style={{ width: `${lock * 100}%` }} className="hot" /></div>
        <b>{Math.round(lock * 100)}%</b>
      </div>
      <input className="mg-range" type="range" min={0} max={180} step={0.5} value={angle} disabled={done} onChange={(e) => setAngle(Number(e.target.value))} aria-label="Dish angle" />
    </Frame>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Reboot: the computer lights its four pads in a sequence; repeat it. Every round adds one more.
const PADS = [
  { color: '#ff4d4d', mark: '●', name: 'red' },
  { color: '#4da3ff', mark: '▲', name: 'blue' },
  { color: '#ffd24d', mark: '■', name: 'yellow' },
  { color: '#4dff88', mark: '◆', name: 'green' },
]
const ROUNDS = 4

export function Reboot() {
  const { site } = useGame()
  const seq = useMemo(() => Array.from({ length: ROUNDS }, () => Math.floor(Math.random() * 4)), [])
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<'show' | 'input' | 'done'>('show')
  const [lit, setLit] = useState<number | null>(null)
  const [step, setStep] = useState(0)
  const [miss, setMiss] = useState(false)
  useFinish(phase === 'done')

  // Show the first `round` lights, one by one
  useEffect(() => {
    if (phase !== 'show') return
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < round; i++) {
      timers.push(setTimeout(() => { setLit(seq[i]); sfx.select() }, 700 + i * 700))
      timers.push(setTimeout(() => setLit(null), 700 + i * 700 + 450))
    }
    timers.push(setTimeout(() => { setStep(0); setPhase('input') }, 700 + round * 700))
    return () => timers.forEach(clearTimeout)
  }, [phase, round, seq])

  const press = (p: number) => {
    if (phase !== 'input') return
    setLit(p); setTimeout(() => setLit(null), 180)
    if (p !== seq[step]) {
      sfx.wrong(); setMiss(true); setTimeout(() => setMiss(false), 500)
      setPhase('show') // watch the same sequence again
      return
    }
    sfx.right()
    if (step + 1 === round) {
      if (round === ROUNDS) { setPhase('done'); sfx.unlock() } else { setRound(round + 1); setPhase('show') }
    } else setStep(step + 1)
  }

  if (!site) return null
  return (
    <Frame id="reboot-title" title={phase === 'done' ? 'System online' : 'Reboot the computer'}
      status={phase === 'done' ? 'The start-up sequence is accepted. Its records open.'
        : phase === 'show' ? `Round ${round} of ${ROUNDS}: watch the lights.`
        : `Round ${round} of ${ROUNDS}: repeat the sequence (${step} of ${round}).`}>
      <div className={`mg-pads ${miss ? 'miss' : ''} ${phase === 'input' ? 'ready' : ''}`}>
        {PADS.map((p, i) => (
          <button key={p.name} className={`mg-pad ${lit === i ? 'lit' : ''}`} style={{ ['--c' as string]: p.color }} onPointerDown={() => press(i)} disabled={phase !== 'input'} aria-label={`${p.name} pad`}>
            {p.mark}
          </button>
        ))}
      </div>
    </Frame>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Signal: a faint transmission is buried in noise. Match its height (amplitude) and spacing (frequency).
const SW = 560, SH = 200
const wave = (amp: number, freq: number, phase: number) => {
  const pts: string[] = []
  for (let x = 0; x <= SW; x += 4) pts.push(`${x},${SH / 2 - Math.sin((x / SW) * freq * Math.PI * 2 + phase) * amp * (SH / 2 - 16)}`)
  return 'M' + pts.join(' L')
}

export function Signal() {
  const { site } = useGame()
  const goal = useMemo(() => ({ amp: 0.35 + Math.random() * 0.55, freq: 1.5 + Math.round(Math.random() * 6) / 2 }), [])
  const [amp, setAmp] = useState(0.2)
  const [freq, setFreq] = useState(1)
  const [lock, setLock] = useState(0)
  const [done, setDone] = useState(false)
  const [t, setT] = useState(0)
  const cur = useRef({ amp: 0.2, freq: 1 })
  const lockRef = useRef(0)
  cur.current = { amp, freq }
  useFinish(done)

  useEffect(() => {
    const iv = setInterval(() => {
      setT((x) => x + 0.12)
      if (lockRef.current >= 1) return
      const ok = Math.abs(cur.current.amp - goal.amp) <= 0.07 && Math.abs(cur.current.freq - goal.freq) <= 0.2
      lockRef.current = ok ? Math.min(1, lockRef.current + 0.05 / 1.3) : Math.max(0, lockRef.current - 0.1)
      setLock(lockRef.current)
      if (lockRef.current >= 1) { setDone(true); sfx.unlock() }
    }, 50)
    return () => clearInterval(iv)
  }, [goal])

  if (!site) return null
  return (
    <Frame id="signal-title" title={done ? 'Signal received' : 'Match the signal'}
      status={done ? 'The old transmitter answers. Its records open.' : 'A faint transmission is hidden in the noise (dashed yellow). Use the sliders to make your wave (blue) lie on top of it, and hold it there.'}>
      <svg viewBox={`0 0 ${SW} ${SH}`} className="mg-svg" role="img" aria-label="A hidden radio wave and your wave, which you match with two sliders">
        <rect x="6" y="6" width={SW - 12} height={SH - 12} rx="14" className="mg-panel" />
        <line x1="10" y1={SH / 2} x2={SW - 10} y2={SH / 2} stroke="#2a3558" />
        <path d={wave(goal.amp, goal.freq, t)} fill="none" stroke="#ffd166" strokeWidth="3" strokeDasharray="7 6" opacity=".85" />
        <path d={wave(amp, freq, t)} fill="none" stroke={done ? '#6fdc8c' : '#7cc4ff'} strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className="mg-meter"><span>Lock</span><div className="mg-bar"><i style={{ width: `${lock * 100}%` }} className="hot" /></div><b>{Math.round(lock * 100)}%</b></div>
      <label className="mg-slider"><span>Height</span><input className="mg-range" type="range" min={0.1} max={1} step={0.01} value={amp} disabled={done} onChange={(e) => setAmp(Number(e.target.value))} /></label>
      <label className="mg-slider"><span>Spacing</span><input className="mg-range" type="range" min={1} max={5} step={0.05} value={freq} disabled={done} onChange={(e) => setFreq(Number(e.target.value))} /></label>
    </Frame>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Burn: a needle sweeps across a gauge. Fire the thruster while it is inside the green zone. Three good burns.
const BURNS = 3

export function Burn() {
  const { site } = useGame()
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [needle, setNeedle] = useState(0.5)
  const [zone, setZone] = useState({ c: 0.5, w: 0.22 })
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null)
  const [done, setDone] = useState(false)
  const live = useRef({ needle: 0.5, zone, hits: 0, done: false })
  live.current.zone = zone
  useFinish(done)

  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const frame = (now: number) => {
      const speed = 1.4 + live.current.hits * 0.5
      const n = 0.5 + 0.5 * Math.sin(((now - t0) / 1000) * speed)
      live.current.needle = n
      setNeedle(n)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  const fire = () => {
    const L = live.current
    if (L.done) return
    if (Math.abs(L.needle - L.zone.c) <= L.zone.w / 2) {
      sfx.right(); setFlash('good')
      L.hits += 1; setHits(L.hits)
      if (L.hits >= BURNS) { L.done = true; setDone(true); sfx.unlock() }
      else setZone({ c: 0.2 + Math.random() * 0.6, w: 0.22 - L.hits * 0.05 })
    } else {
      sfx.wrong(); setFlash('bad'); setMisses((m) => m + 1)
      if (L.hits > 0) { L.hits -= 1; setHits(L.hits) }
    }
    setTimeout(() => setFlash(null), 250)
  }
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); fire() } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  // Gauge: a half circle, 0 at the left end and 1 at the right end
  const pt = (v: number, r: number) => { const a = Math.PI * (1 - v); return `${280 + Math.cos(a) * r},${190 - Math.sin(a) * r}` }
  const arc = (a: number, b: number, r: number) => `M ${pt(a, r)} A ${r} ${r} 0 0 1 ${pt(b, r)}`
  if (!site) return null
  return (
    <Frame id="burn-title" title={done ? 'Orbit matched' : 'Match its orbit'}
      status={done ? 'Your speed now matches the spacecraft. Take a good look.' : `Time the thruster burns: press Fire (or Space) while the needle is inside the green zone. Good burns: ${hits} of ${BURNS}. A miss costs you one.`}>
      <svg viewBox="0 0 560 220" className={`mg-svg ${flash ?? ''}`} role="img" aria-label="A gauge with a sweeping needle and a green target zone">
        <rect x="6" y="6" width="548" height="208" rx="14" className="mg-panel" />
        <path d={arc(0, 1, 150)} fill="none" stroke="#2a3558" strokeWidth="26" />
        <path d={arc(Math.max(0, zone.c - zone.w / 2), Math.min(1, zone.c + zone.w / 2), 150)} fill="none" stroke="#4dff88" strokeWidth="26" opacity=".85" />
        <line x1="280" y1="190" x2={pt(needle, 170).split(',')[0]} y2={pt(needle, 170).split(',')[1]} stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <circle cx="280" cy="190" r="12" fill="#c9d1e0" />
        {Array.from({ length: BURNS }, (_, i) => <circle key={i} cx={236 + i * 44} cy="205" r="7" fill={i < hits ? '#6fdc8c' : '#2a3558'} stroke="#7cc4ff" />)}
      </svg>
      <div className="row walk-controls">
        <button className="button big" onPointerDown={fire} disabled={done}>Fire thruster</button>
        <span className="small">Misses: {misses}</span>
      </div>
    </Frame>
  )
}
