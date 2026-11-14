import raw from './artifacts.json'
import type { Artifact } from '../types/artifact'

// All content lives in artifacts.json. Edit that file, not this one.
export const artifacts = raw as Artifact[]
