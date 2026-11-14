import { BODIES } from '../solar/bodies.js'
import type { BodyData } from '../solar/solar'

/** Catalog of every body in the solar system view (NASA/JPL fact sheets, via Solar System 3D). DRAFT – verify. */
export const CATALOG = BODIES
export const BODY_DATA: Record<string, BodyData> = Object.fromEntries(BODIES.map((b) => [b.id, b]))

/** Worlds the player can walk on. Earth is only the home launch pad; Moon and Mars have the artifact sites. */
export type LandId = 'earth' | 'moon' | 'mars'
/** Destinations the ship can select, warp to and orbit. */
export const DESTINATIONS = ['earth', 'moon', 'mars']
export const isDestination = (id: string) => DESTINATIONS.includes(id)
/** Only the Moon and Mars can be landed on. */
export type SiteWorld = 'moon' | 'mars'
export const isLandable = (id: string): id is SiteWorld => id === 'moon' || id === 'mars'

/** Same launch speed on every world (m/s), so gravity alone changes the jump. */
export const JUMP_SPEED = 4
export const gravityOf = (id: string) => BODY_DATA[id]?.gravity ?? 9.81
