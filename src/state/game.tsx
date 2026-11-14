import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { artifacts } from '../data/artifacts'
import type { Artifact, World } from '../types/artifact'
import type { BodyId } from '../data/bodies'

export type SceneName = 'title' | 'space' | 'surface'
export type Overlay = 'none' | 'collection' | 'about' | 'help' | 'sites' | 'decision' | 'story' | 'stories'

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
  selected: World | null
  near: World | null
  warping: boolean
  canInspect: boolean
  setCanInspect: (b: boolean) => void
  warpRequest: { id: World; n: number } | null
  spawn: BodyId
  setSelected: (w: World | null) => void
  setNear: (w: World | null) => void
  setWarping: (b: boolean) => void
  requestWarp: (w: World) => void
  setSpawn: (b: BodyId) => void
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
  const [selected, setSelected] = useState<World | null>(null)
  const [near, setNear] = useState<World | null>(null)
  const [warping, setWarping] = useState(false)
  const [canInspect, setCanInspect] = useState(false)
  const [warpRequest, setWarpRequest] = useState<{ id: World; n: number } | null>(null)
  const [spawn, setSpawn] = useState<BodyId>('earth')
  const requestWarp = useCallback((id: World) => setWarpRequest((r) => ({ id, n: (r?.n ?? 0) + 1 })), [])

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
      setSelected(null)
      setNear(null)
      setWarping(false)
      setCanInspect(false)
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
    <Ctx.Provider value={{ scene, site, overlay, found, fading, selected, near, warping, canInspect, setCanInspect, warpRequest, spawn, setSelected, setNear, setWarping, requestWarp, setSpawn, goTo, setOverlay, markFound, resetProgress }}>
      {children}
    </Ctx.Provider>
  )
}

export function useGame(): Game {
  const g = useContext(Ctx)
  if (!g) throw new Error('useGame must be used inside GameProvider')
  return g
}
