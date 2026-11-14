// Tiny synthesized sound effects (no audio files). Muted state persists.
const KEY = 'left-behind-muted'
let ctx: AudioContext | null = null
let muted = false
try { muted = localStorage.getItem(KEY) === '1' } catch { /* ignore */ }

export const isMuted = () => muted
export function setMuted(m: boolean) {
  muted = m
  try { localStorage.setItem(KEY, m ? '1' : '0') } catch { /* ignore */ }
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.08, slideTo?: number, delay = 0) {
  if (muted) return
  try {
    ctx ??= new AudioContext()
    const t = ctx.currentTime + delay
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g).connect(ctx.destination)
    o.start(t)
    o.stop(t + dur)
  } catch { /* audio unavailable */ }
}

export const sfx = {
  warp: () => tone(120, 2.2, 'sawtooth', 0.05, 900),
  select: () => tone(660, 0.12, 'triangle'),
  inspect: () => { tone(520, 0.12, 'triangle'); tone(780, 0.18, 'triangle', 0.08, undefined, 0.1) },
  right: () => { tone(523, 0.15, 'triangle'); tone(784, 0.25, 'triangle', 0.08, undefined, 0.12) },
  thud: () => tone(95, 0.14, 'square', 0.05, 45),
  brush: () => tone(2200 + Math.random() * 600, 0.04, 'sawtooth', 0.01),
  wrong: () => tone(220, 0.3, 'square', 0.05, 140),
  unlock: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.07, undefined, i * 0.1)),
}
