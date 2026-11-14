import { useEffect, useState } from 'react'

// Phones and tablets: the primary pointer is a finger. `?touch=1` forces touch mode so the layout can be
// tried on a desktop browser (`?touch=0` forces it off).
export function detectTouch(): boolean {
  try {
    const q = new URLSearchParams(location.search).get('touch')
    if (q === '1') return true
    if (q === '0') return false
    return window.matchMedia('(pointer: coarse)').matches
  } catch { return false }
}

// Marks <html class="is-touch"> so CSS can switch between the keyboard and touch layouts.
export function initDevice() {
  if (detectTouch()) document.documentElement.classList.add('is-touch')
}

export const isTouch = () => document.documentElement.classList.contains('is-touch')

type LockableOrientation = ScreenOrientation & { lock?: (o: string) => Promise<void> }

export const isFullscreen = () => !!document.fullscreenElement
export const canFullscreen = () => !!document.documentElement.requestFullscreen

// Fullscreen + landscape lock. Android Chrome rotates the phone for us once the page is fullscreen.
// iPhone Safari allows neither, so players there are asked to rotate by hand (see RotatePrompt).
export async function enterLandscape() {
  try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' }) } catch { /* not allowed here */ }
  try { await (screen.orientation as LockableOrientation).lock?.('landscape') } catch { /* not supported */ }
}

export async function leaveFullscreen() {
  try { (screen.orientation as LockableOrientation).unlock?.() } catch { /* ignore */ }
  try { if (document.fullscreenElement) await document.exitFullscreen() } catch { /* ignore */ }
}

function useMedia(query: string) {
  const [on, setOn] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const f = () => setOn(m.matches)
    f()
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [query])
  return on
}

export const useIsPortrait = () => useMedia('(orientation: portrait)')

export function useFullscreen() {
  const [fs, setFs] = useState(isFullscreen)
  useEffect(() => {
    const f = () => setFs(isFullscreen())
    document.addEventListener('fullscreenchange', f)
    return () => document.removeEventListener('fullscreenchange', f)
  }, [])
  return fs
}
