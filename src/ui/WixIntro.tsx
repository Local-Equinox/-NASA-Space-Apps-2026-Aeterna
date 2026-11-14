import { useEffect, useRef, useState } from 'react'
import './wix-intro.css'

/** The intro site that is embedded. Change it here if the Wix address changes. */
export const INTRO_URL = 'https://hannahbellaatay.wixstudio.com/my-site-5'
/** If the embedded page has not loaded after this long, the fallback is shown. */
const LOAD_TIMEOUT_MS = 8000

// The storyline. It is the fallback when the embed cannot load, and screen readers always get it.
const STORY = [
  { title: 'Something is out there.', text: 'Hundreds of man-made objects sit on the Moon and Mars.' },
  { title: 'A question.', text: 'Why is a rover parked forever? Were they forgotten, or did someone decide?' },
  { title: 'The clue.', text: 'A rocket can only carry so much, so crews chose what stayed. Some objects are still working.' },
  { title: 'Your mission.', text: 'You are a junior space archaeologist. Objective: find and explore the abandoned equipment.' },
]

function Story({ hidden = false }: { hidden?: boolean }) {
  return (
    <ol className={hidden ? 'wix-sr-only' : 'wix-story'}>
      {STORY.map((s) => (
        <li key={s.title}><b>{s.title}</b> {s.text}</li>
      ))}
    </ol>
  )
}

interface Props { onStart: () => void; onMissions: () => void; onAbout: () => void }

/**
 * The intro: the team's Wix site in a full-screen iframe, shifted up and made taller so the Wix banner
 * and footer fall outside the visible area (the design from the team's standalone intro page).
 * The page scrolls inside the frame, so its scroll animations play. The Wix page's own "Start mission"
 * button cannot reach the game from inside the frame, so the game's button floats over it.
 */
export default function WixIntro({ onStart, onMissions, onAbout }: Props) {
  const [state, setState] = useState<'loading' | 'ready' | 'slow' | 'failed'>(() => (navigator.onLine === false ? 'failed' : 'loading'))
  const start = useRef<HTMLButtonElement>(null)

  useEffect(() => { start.current?.focus({ preventScroll: true }) }, [])
  // A browser fires the iframe's load event even when the page inside failed, so this request is what
  // catches "offline" and "site down".
  useEffect(() => {
    let alive = true
    fetch(INTRO_URL, { mode: 'no-cors', cache: 'no-store', referrerPolicy: 'no-referrer' }).catch(() => { if (alive) setState('failed') })
    return () => { alive = false }
  }, [])
  useEffect(() => {
    if (state !== 'loading') return
    const t = setTimeout(() => setState((s) => (s === 'loading' ? 'slow' : s)), LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [state])
  // Wix can pull keyboard focus into the frame as it loads. Until the visitor does something, give it back.
  useEffect(() => {
    let touched = false
    const touch = () => { touched = true }
    const onBlur = () => { if (!touched) setTimeout(() => { window.focus(); start.current?.focus({ preventScroll: true }) }, 0) }
    window.addEventListener('pointerdown', touch, true)
    window.addEventListener('keydown', touch, true)
    window.addEventListener('blur', onBlur)
    const stop = setTimeout(touch, 10000)
    return () => { clearTimeout(stop); window.removeEventListener('pointerdown', touch, true); window.removeEventListener('keydown', touch, true); window.removeEventListener('blur', onBlur) }
  }, [])

  const failed = state === 'failed'
  return (
    <main className="wix-intro" aria-label="Left Behind mission introduction">
      {!failed && (
        <iframe
          className={`wix-frame ${state === 'ready' ? 'is-loaded' : ''}`}
          src={INTRO_URL}
          title="AETERNA: Beyond time, beyond stars. Animated mission introduction"
          allow="autoplay; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
          onLoad={() => setState((s) => (s === 'failed' ? s : 'ready'))}
          onError={() => setState('failed')}
        />
      )}
      {(state === 'loading' || state === 'slow') && (
        <section className="wix-status" aria-live="polite">
          <div className="wix-spinner" aria-hidden="true" />
          <h1>Loading the intro…</h1>
          {state === 'slow' && (
            <p>The intro is taking longer than expected. <a href={INTRO_URL} target="_blank" rel="noopener noreferrer">Open the intro in a new tab</a>, or start the mission below.</p>
          )}
        </section>
      )}
      {failed && (
        <section className="wix-status" role="status">
          <h1 className="wix-title">Left Behind</h1>
          <Story />
          <p>The animated intro could not be loaded here. <a href={INTRO_URL} target="_blank" rel="noopener noreferrer">Open the intro in a new tab</a></p>
        </section>
      )}
      {!failed && <Story hidden />}
      <div className="wix-bar">
        <button className="btn-glow soft" onClick={onMissions}>Missions</button>
        <button ref={start} className="btn-glow wix-start" onClick={onStart}>Start mission</button>
        <button className="btn-glow soft" onClick={onAbout}>About</button>
      </div>
    </main>
  )
}
