export type World = 'moon' | 'mars' | 'space'

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
  /** Space entries only: id of the body in the solar system view (src/solar/bodies.js). */
  body?: string
  /** Space entries only: where the equipment is, in NASA's words. */
  whereabouts?: string
  /** false = no nameplate, so the wire-connection minigame is used instead of the cleaning one. */
  nameplate?: boolean
  /** Name on the 3D tag of the first model, when it differs from the entry's name. */
  tagLabel?: string
  /** Name shown on the world map, when it differs from the mission. */
  mapLabel?: string
  /** Flashback video played after the minigame, under public/. If the file is missing the game goes straight to the story. */
  cutscene?: string
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
