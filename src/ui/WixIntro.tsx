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
 * The intro: the team's Wix site in an iframe as tall as the whole Wix page, so the game (not Wix) does the
 * scrolling. That is what lets the game put its own working "Start mission" button exactly on top of the
 * one drawn in the Wix page, which is only a picture and could not reach the game anyway.
 * The crop and the button position are CSS variables in wix-intro.css.
 */
export default function WixIntro({ onStart, onMissions, onAbout }: Props) {
  const [state, setState] = useState<'loading' | 'ready' | 'slow' | 'failed'>(() => (navigator.onLine === false ? 'failed' : 'loading'))
  const start = useRef<HTMLButtonElement>(null)

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
    const onBlur = () => { if (!touched) setTimeout(() => { window.focus(); document.querySelector<HTMLElement>('.wix-scroll')?.focus({ preventScroll: true }) }, 0) }
    window.addEventListener('pointerdown', touch, true)
    window.addEventListener('keydown', touch, true)
    window.addEventListener('blur', onBlur)
    const stop = setTimeout(touch, 10000)
    return () => { clearTimeout(stop); window.removeEventListener('pointerdown', touch, true); window.removeEventListener('keydown', touch, true); window.removeEventListener('blur', onBlur) }
  }, [])

  const failed = state === 'failed'
  const startButton = <button ref={start} className="btn-glow wix-start" onClick={onStart}>Start mission</button>
  return (
    <main className="wix-intro" aria-label="Left Behind mission introduction">
      <div className="wix-scroll" tabIndex={-1}>
        {!failed && (
          <div className={`wix-crop ${state === 'ready' ? 'is-loaded' : ''}`}>
            <iframe
              className="wix-frame"
              src={INTRO_URL}
              title="AETERNA: Beyond time, beyond stars. Animated mission introduction"
              scrolling="no"
              referrerPolicy="no-referrer"
              onLoad={() => setState((s) => (s === 'failed' ? s : 'ready'))}
              onError={() => setState('failed')}
            />
            {/* Sits exactly over the button drawn in the Wix page */}
            {state === 'ready' && startButton}
          </div>
        )}
        {!failed && <Story hidden />}
      </div>
      {(state === 'loading' || state === 'slow') && (
        <section className="wix-status" aria-live="polite">
          <div className="wix-spinner" aria-hidden="true" />
          <h1>Loading the intro…</h1>
          {state === 'slow' && (
            <>
              <p>The intro is taking longer than expected. <a href={INTRO_URL} target="_blank" rel="noopener noreferrer">Open the intro in a new tab</a>, or start now.</p>
              {startButton}
            </>
          )}
        </section>
      )}
      {failed && (
        <section className="wix-status" role="status">
          <h1 className="wix-title">Left Behind</h1>
          <Story />
          <p>The animated intro could not be loaded here. <a href={INTRO_URL} target="_blank" rel="noopener noreferrer">Open the intro in a new tab</a></p>
          {startButton}
        </section>
      )}
      <div className="wix-corner">
        <button className="btn-glow soft" onClick={onMissions}>Missions</button>
        <button className="btn-glow soft" onClick={onAbout}>About</button>
      </div>
    </main>
  )
}
