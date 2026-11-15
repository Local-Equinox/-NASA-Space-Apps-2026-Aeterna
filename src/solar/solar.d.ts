// Types for the ported Solar System 3D modules. They stay plain JS; this only describes what the game uses.
import type { Group, Mesh, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'

export interface BodyData {
  id: string
  name: string
  kind: 'star' | 'planet' | 'moon' | 'asteroid' | 'probe'
  type: string
  color: string
  gravity: number
  radiusKm: number
  mass: [number, number]
  distance?: string
  temperature?: string
  composition?: string
  blurb: string
  knownMoons?: number
  orbitDays: number | null
  parent?: string
  probe?: boolean
}

export interface SolarBody {
  id: string
  name: string
  kind: 'star' | 'planet' | 'moon' | 'asteroid' | 'probe'
  data: BodyData
  parent: SolarBody | null
  moons: SolarBody[]
  radius: number
  worldPosition: Vector3
  surface: Mesh
  axis: Group
  path: Object3D | null
}

export class SolarSystem {
  constructor(scene: Scene, renderer: WebGLRenderer, startDays: number)
  root: Group
  bodies: SolarBody[]
  byId: Map<string, SolarBody>
  pickables: Object3D[]
  markers: Object3D
  loadTextures(onProgress: (done: number, total: number, failed: number) => void): void
  setOrigin(position: Vector3): void
  setHighlight(body: SolarBody | null): void
  setPixelRatio(pixelRatio: number): void
  update(days: number, dt: number, daysPerSecond: number): void
}

export class Picker {
  constructor(
    canvas: HTMLElement,
    camera: PerspectiveCamera,
    rayCamera: PerspectiveCamera,
    system: SolarSystem,
    handlers: { onSelect: (body: SolarBody) => void; onHover?: (body: SolarBody | null) => void },
  )
  enabled: boolean
  updateHover(): void
}

export class Labels {
  constructor(container: HTMLElement, system: SolarSystem, camera: PerspectiveCamera)
  setSelected(body: SolarBody | null): void
  setEnabled(enabled: boolean): void
  setMasked(ids: Set<string>): void
  update(width: number, height: number): void
}
