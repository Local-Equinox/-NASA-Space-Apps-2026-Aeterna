import { Vector3 } from 'three'
import type { World } from '../types/artifact'

export type BodyId = 'earth' | World

// Facts: NASA/JPL planetary fact sheets (via the Solar System 3D reference project).
// DRAFT – verify before the pitch.
export interface BodyInfo {
  id: BodyId
  name: string
  type: string
  gravity: number // m/s²
  meanRadiusKm: number
  /** Scene units. Sizes and distances are compressed, not to scale. */
  radius: number
  position: Vector3
  texture: string
}

export const BODIES: Record<BodyId, BodyInfo> = {
  earth: { id: 'earth', name: 'Earth', type: 'Planet', gravity: 9.81, meanRadiusKm: 6371, radius: 6, position: new Vector3(0, 0, 0), texture: './assets/textures/earth_daymap.jpg' },
  moon: { id: 'moon', name: 'Moon', type: 'Moon of Earth', gravity: 1.62, meanRadiusKm: 1737.4, radius: 1.7, position: new Vector3(75, 4, -20), texture: './assets/textures/moon.jpg' },
  mars: { id: 'mars', name: 'Mars', type: 'Planet', gravity: 3.71, meanRadiusKm: 3389.5, radius: 3.2, position: new Vector3(-60, -8, -260), texture: './assets/textures/mars.jpg' },
}

/** Direction toward the Sun. One directional light, so bodies are lit consistently. */
export const SUN_DIR = new Vector3(0.7, 0.25, 0.65).normalize()

/** Warp arrives, and Land is offered, at these distances from a body's centre. */
export const orbitRadius = (b: BodyInfo) => b.radius * 2.4 + 0.3
export const landRange = (b: BodyInfo) => b.radius * 3.4
