import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { artifacts } from '../data/artifacts'
import { sfx } from '../lib/sound'
import type { Artifact } from '../types/artifact'
import type { LandId, SiteWorld } from '../data/bodies'

export type SceneName = 'title' | 'space' | 'surface'
export type Overlay = 'none' | 'collection' | 'about' | 'help' | 'sites' | 'cutscene' | 'clean' | 'wires' | 'spacewalk' | 'map' | 'story' | 'stories'

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
  selected: string | null
  near: SiteWorld | null
  orbitOf: string | null
  setOrbitOf: (w: string | null) => void
  /** Space body id of the spacecraft the ship is next to, if any (Dawn, NEAR Shoemaker, Pioneer 10, Kepler). */
  nearProbe: string | null
  setNearProbe: (id: string | null) => void
  /** Start inspecting equipment: picks the minigame (or the story if it was already found). */
  inspect: (a: Artifact) => void
  surfaceWorld: LandId
  canBoard: boolean
  setCanBoard: (b: boolean) => void
  warping: boolean
  canInspect: boolean
  setCanInspect: (b: boolean) => void
  warpRequest: { id: string; n: number } | null
  spawn: string
  setSelected: (w: string | null) => void
  setNear: (w: SiteWorld | null) => void
  setWarping: (b: boolean) => void
  requestWarp: (w: string) => void
  setSpawn: (b: string) => void
  goTo: (scene: SceneName, site?: Artifact | null, world?: LandId) => void
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
  const [selected, setSelected] = useState<string | null>(null)
  const [near, setNear] = useState<SiteWorld | null>(null)
  const [orbitOf, setOrbitOf] = useState<string | null>(null)
  const [nearProbe, setNearProbe] = useState<string | null>(null)
  const [surfaceWorld, setSurfaceWorld] = useState<LandId>('earth')
  const [canBoard, setCanBoard] = useState(false)
  const [warping, setWarping] = useState(false)
  const [canInspect, setCanInspect] = useState(false)
  const [warpRequest, setWarpRequest] = useState<{ id: string; n: number } | null>(null)
  const [spawn, setSpawn] = useState<string>('earth')
  const requestWarp = useCallback((id: string) => setWarpRequest((r) => ({ id, n: (r?.n ?? 0) + 1 })), [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    } catch {
      /* storage unavailable: progress just won't persist */
    }
  }, [found])

  // Fade out, swap scene, fade in. Space and surface never render together.
  const goTo = useCallback((next: SceneName, nextSite: Artifact | null = null, world?: LandId) => {
    setFading(true)
    setTimeout(() => {
      setScene(next)
      setSelected(null)
      setNear(null)
      setNearProbe(null)
      setWarping(false)
      setCanInspect(false)
      setSite(nextSite)
      if (world) setSurfaceWorld(world)
      setCanBoard(false)
      setFading(false)
    }, 400)
  }, [])

  const markFound = useCallback(
    (id: string) => setFound((f) => (f.includes(id) ? f : [...f, id])),
    [],
  )
  const resetProgress = useCallback(() => setFound([]), [])

  // Moon and Mars equipment: a nameplate-cleaning or a wire minigame (equipment with no nameplate always gets wires).
  // Equipment out in space: the spacewalk. Anything already found goes straight to its story.
  const inspect = useCallback((a: Artifact) => {
    setSite(a)
    sfx.inspect()
    if (found.includes(a.id)) setOverlay('story')
    else if (a.world === 'space') setOverlay('spacewalk')
    else if (a.nameplate === false) setOverlay('wires')
    else setOverlay(Math.random() < 0.5 ? 'clean' : 'wires')
  }, [found])

  return (
    <Ctx.Provider value={{ scene, site, overlay, found, fading, selected, near, orbitOf, setOrbitOf, nearProbe, setNearProbe, inspect, surfaceWorld, canBoard, setCanBoard, warping, canInspect, setCanInspect, warpRequest, spawn, setSelected, setNear, setWarping, requestWarp, setSpawn, goTo, setOverlay, markFound, resetProgress }}>
      {children}
    </Ctx.Provider>
  )
}

export function useGame(): Game {
  const g = useContext(Ctx)
  if (!g) throw new Error('useGame must be used inside GameProvider')
  return g
}
