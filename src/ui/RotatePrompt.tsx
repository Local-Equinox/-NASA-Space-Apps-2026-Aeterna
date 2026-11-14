import { useEffect } from 'react'
import { canFullscreen, enterLandscape, isTouch, useIsPortrait } from '../lib/device'

// Phones: the game is built for landscape. In portrait this covers the screen and asks the player to rotate.
// The first touch also goes fullscreen and locks landscape where the browser allows it (Android Chrome),
// which rotates the phone by itself; iPhone Safari can't, so it relies on the message.
export default function RotatePrompt() {
  const portrait = useIsPortrait()

  useEffect(() => {
    if (!isTouch()) return
    let done = false
    const first = (e: PointerEvent) => {
      if (done || e.pointerType !== 'touch') return
      done = true
      window.removeEventListener('pointerup', first)
      void enterLandscape()
    }
    window.addEventListener('pointerup', first)
    return () => window.removeEventListener('pointerup', first)
  }, [])

  if (!isTouch() || !portrait) return null
  return (
    <div className="rotate-prompt" role="alertdialog" aria-live="assertive" aria-labelledby="rotate-title">
      <svg className="rotate-icon" viewBox="0 0 64 64" width="96" height="96" aria-hidden="true">
        <rect x="21" y="8" width="22" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="32" cy="42" r="1.8" fill="currentColor" />
        <path d="M12 54a24 24 0 0 0 40 0" fill="none" stroke="#7cc4ff" strokeWidth="3" strokeLinecap="round" />
        <path d="M52 48v7h-7" fill="none" stroke="#7cc4ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 id="rotate-title">Rotate your phone</h2>
      <p>Left Behind is played in landscape. Turn your device sideways to continue.</p>
      {canFullscreen() && (
        <button className="button" onClick={() => void enterLandscape()}>Go fullscreen and rotate</button>
      )}
      <p className="small">If it doesn't turn, switch off your phone's rotation lock.</p>
    </div>
  )
}
