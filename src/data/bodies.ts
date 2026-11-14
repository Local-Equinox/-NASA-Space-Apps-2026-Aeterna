import { BODIES } from '../solar/bodies.js'
import type { BodyData } from '../solar/solar'

/** Catalog of every body in the solar system view (NASA/JPL fact sheets, via Solar System 3D). DRAFT – verify. */
export const CATALOG = BODIES
export const BODY_DATA: Record<string, BodyData> = Object.fromEntries(BODIES.map((b) => [b.id, b]))

/** Worlds the player can walk on. Moon and Mars have artifact sites; Earth is the home pad. */
export type LandId = 'earth' | 'moon' | 'mars'
export const LANDABLE: LandId[] = ['earth', 'moon', 'mars']
export const isLandable = (id: string): id is LandId => (LANDABLE as string[]).includes(id)

/** Same launch speed on every world (m/s), so gravity alone changes the jump. */
export const JUMP_SPEED = 4
export const gravityOf = (id: string) => BODY_DATA[id]?.gravity ?? 9.81
