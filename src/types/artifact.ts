export type World = 'moon' | 'mars'

export interface DecisionOption {
  text: string
  correct: boolean
  feedback: string
}

export interface Artifact {
  id: string
  name: string
  world: World
  site: {
    name: string
    /** Real landing-site coordinates. Leave null until sourced from NASA. */
    lat: number | null
    lon: number | null
  }
  mission: string
  year: string
  /** Path under /assets/models/. Missing file = labelled placeholder box. */
  model: string
  modelCredit: string
  /** Metres from the spawn point on that site's terrain patch. */
  surfacePosition: { x: number; z: number }
  decision: {
    question: string
    options: DecisionOption[]
  }
  story: {
    whatItIs: string
    whyLeft: string
    science: string
    nowStatus: string
  }
  sources: { title: string; url: string }[]
}
