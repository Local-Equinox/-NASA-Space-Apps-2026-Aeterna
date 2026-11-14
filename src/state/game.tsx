import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { artifacts } from '../data/artifacts'
import type { Artifact } from '../types/artifact'

export type SceneName = 'title' | 'space' | 'surface'
export type Overlay = 'none' | 'collection' | 'about' | 'help'

const STORAGE_KEY = 'left-behind-found'

function loadFound(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((id) => artifacts.some((a) => a.id === id)) : []
  } catch {
    return []
  }
}

interface Game {
  scene: SceneName
  site: Artifact | null
  overlay: Overlay
  found: string[]
  fading: boolean
  goTo: (scene: SceneName, site?: Artifact | null) => void
  setOverlay: (o: Overlay) => void
  markFound: (id: string) => void
  resetProgress: () => void
}

const Ctx = createContext<Game | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [scene, setScene] = useState<SceneName>('title')
  const [site, setSite] = useState<Artifact | null>(null)
  const [overlay, setOverlay] = useState<Overlay>('none')
  const [found, setFound] = useState<string[]>(loadFound)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    } catch {
      /* storage unavailable: progress just won't persist */
    }
  }, [found])

  // Fade out, swap scene, fade in. Space and surface never render together.
  const goTo = useCallback((next: SceneName, nextSite: Artifact | null = null) => {
    setFading(true)
    setTimeout(() => {
      setScene(next)
      setSite(nextSite)
      setFading(false)
    }, 400)
  }, [])

  const markFound = useCallback(
    (id: string) => setFound((f) => (f.includes(id) ? f : [...f, id])),
    [],
  )
  const resetProgress = useCallback(() => setFound([]), [])

  return (
    <Ctx.Provider value={{ scene, site, overlay, found, fading, goTo, setOverlay, markFound, resetProgress }}>
      {children}
    </Ctx.Provider>
  )
}

export function useGame(): Game {
  const g = useContext(Ctx)
  if (!g) throw new Error('useGame must be used inside GameProvider')
  return g
}
