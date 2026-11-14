import { useEffect, useRef, useState } from 'react'
import './wix-intro.css'

/** The intro site that is embedded. Change it here if the Wix address changes. */
export const INTRO_URL = 'https://hannahbellaatay.wixstudio.com/my-site-5'
/** If the embedded page has not loaded after this long, the fallback is shown. */
const LOAD_TIMEOUT_MS = 12000

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

/**
 * Full-screen intro: the team's Wix site in an iframe, cropped so its top banner and footer are hidden.
 * The crop is set by CSS variables in wix-intro.css (see the notes at the top of that file).
 */
export default function WixIntro({ onBegin }: { onBegin: () => void }) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>(() => (navigator.onLine === false ? 'failed' : 'loading'))
  const begin = useRef<HTMLButtonElement>(null)

  useEffect(() => { begin.current?.focus({ preventScroll: true }) }, [])
  // Check the Wix site can be reached at all. A browser fires the iframe's load event even when the page
  // inside failed, so this request is what catches "offline" and "site down".
  useEffect(() => {
    let alive = true
    fetch(INTRO_URL, { mode: 'no-cors', cache: 'no-store', referrerPolicy: 'no-referrer' }).catch(() => { if (alive) setState('failed') })
    return () => { alive = false }
  }, [])
  // The embedded page can pull keyboard focus into itself when it loads: hand it back to the button.
  const onLoad = () => {
    setState((st) => (st === 'failed' ? st : 'ready'))
    const active = document.activeElement
    if (!active || active === document.body || active.tagName === 'IFRAME') begin.current?.focus({ preventScroll: true })
  }
  // Wix can also take focus a moment after loading. Until the visitor does something, give it back.
  useEffect(() => {
    let touched = false
    const touch = () => { touched = true }
    const onBlur = () => { if (!touched) setTimeout(() => { window.focus(); begin.current?.focus({ preventScroll: true }) }, 0) }
    window.addEventListener('pointerdown', touch, true)
    window.addEventListener('keydown', touch, true)
    window.addEventListener('blur', onBlur)
    const stop = setTimeout(touch, 10000)
    return () => { clearTimeout(stop); window.removeEventListener('pointerdown', touch, true); window.removeEventListener('keydown', touch, true); window.removeEventListener('blur', onBlur) }
  }, [])
  // A blocked or blank embed never fires a usable load event, so fall back after a timeout.
  useEffect(() => {
    if (state !== 'loading') return
    const t = setTimeout(() => setState((s) => (s === 'loading' ? 'failed' : s)), LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [state])

  return (
    <section className="wix-intro" aria-label="Intro story">
      <div className="wix-scroll" tabIndex={state === 'ready' ? 0 : -1} aria-label="Intro story page. Scroll to read.">
        {state !== 'failed' && (
          <div className={`wix-crop ${state}`}>
            <iframe
              src={INTRO_URL}
              title="Left Behind intro story"
              loading="eager"
              scrolling="no"
              referrerPolicy="no-referrer"
              onLoad={onLoad}
              onError={() => setState('failed')}
            />
          </div>
        )}
        {state === 'loading' && <p className="wix-status" role="status">Loading the intro story…</p>}
        {state === 'failed' && (
          <div className="wix-fallback" role="status">
            <h1>Left Behind</h1>
            <Story />
            <p className="small">The illustrated intro could not be loaded here.</p>
            <a className="button secondary" href={INTRO_URL} target="_blank" rel="noopener noreferrer">Open the intro story in a new tab</a>
          </div>
        )}
        {state !== 'failed' && <Story hidden />}
      </div>
      <div className="wix-bar">
        {state !== 'failed' && (
          <a className="wix-open" href={INTRO_URL} target="_blank" rel="noopener noreferrer">Intro not showing? Open it in a new tab</a>
        )}
        <button ref={begin} className="button big wix-begin" onClick={onBegin}>Begin the mission</button>
      </div>
    </section>
  )
}
