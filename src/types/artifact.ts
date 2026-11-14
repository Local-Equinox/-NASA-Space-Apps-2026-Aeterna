export type World = 'moon' | 'mars'

export interface Artifact {
  id: string
  name: string
  world: World
  site: {
    name: string
    /** Real landing-site coordinates. Leave null until sourced from NASA. */
    lat: number | null
    lon: number | null
    /** Second location when one entry covers two sites (Spirit and Opportunity). */
    alt?: { name: string; lat: number; lon: number }
  }
  mission: string
  year: string
  /** A GLB under /assets/models/, or "procedural:<name>" for a simplified model built in code (see src/game/props.ts). */
  model: string
  /** Real size in metres of the model's largest dimension. */
  modelSize?: number
  /** Hide the part of the model above this fraction of its height (0–1), e.g. the Lunar Module's ascent stage. */
  modelCutAbove?: number
  modelCredit: string
  /** Metres from the spawn point on that site's terrain patch. */
  surfacePosition: { x: number; z: number }
  /** Optional extra models for paired artifacts (e.g. two rovers). Inspecting any of them opens the same story. */
  pairedModels?: { label: string; model: string; modelSize?: number; modelCutAbove?: number; modelCredit: string; surfacePosition: { x: number; z: number } }[]
  story: {
    whatItIs: string
    whyLeft: string
    science: string
    nowStatus: string
  }
  sources: { title: string; url: string }[]
}
