export type World = 'moon' | 'mars'

/** Fractions (0–1) of the site image's width and height. */
export interface Hotspot {
  x: number
  y: number
  radius: number
}

export interface DecisionOption {
  text: string
  correct: boolean
  feedback: string
}

export interface Artifact {
  id: string
  name: string
  world: World
  mission: string
  year: string
  siteImage: string
  siteImageCredit: string
  hotspot: Hotspot
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
