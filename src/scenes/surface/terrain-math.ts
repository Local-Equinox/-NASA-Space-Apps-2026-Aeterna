import type { LandId } from '../../data/bodies'

export const PATCH_RADIUS = 200 // metres from spawn the player may roam
export const GRID_SIZE = 420 // metres across the detailed patch
export const GRID_SEGMENTS = 168 // 2.5 m cells

/** Earth only: the river's centre line (x for a given z). */
export const riverX = (z: number) => 78 + 22 * Math.sin(z / 38)

// Deterministic random numbers, so a site looks the same every visit.
export function rng(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function hash2(ix: number, iz: number, seed: number) {
  let h = Math.imul(ix, 374761393) + Math.imul(iz, 668265263) + Math.imul(seed, 1442695041)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** Smooth value noise in [0,1]. */
function noise(x: number, z: number, seed: number) {
  const ix = Math.floor(x), iz = Math.floor(z)
  const fx = x - ix, fz = z - iz
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz)
  const a = hash2(ix, iz, seed), b = hash2(ix + 1, iz, seed), c = hash2(ix, iz + 1, seed), d = hash2(ix + 1, iz + 1, seed)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

const fbm = (x: number, z: number, seed: number) =>
  noise(x, z, seed) * 0.55 + noise(x * 2.1, z * 2.1, seed + 7) * 0.3 + noise(x * 4.3, z * 4.3, seed + 13) * 0.15

export interface Spot { x: number; z: number }
export interface Crater { x: number; z: number; r: number; depth: number }

export interface Terrain {
  height: (x: number, z: number) => number
  /** Height of the drawn ground mesh at (x, z): what the player actually stands on. */
  surface: (x: number, z: number) => number
  craters: Crater[]
}

const CONFIG = {
  earth: { craters: 0, craterDepth: 0, hill: 5.5, rough: 0.12 },
  moon: { craters: 85, craterDepth: 0.2, hill: 2.6, rough: 0.5 },
  mars: { craters: 55, craterDepth: 0.15, hill: 3.2, rough: 0.4 },
}

/**
 * Surface height at (x, z) in metres. Craters (with raised rims), rolling ground and small roughness,
 * flattened around the spawn, ship and artifact so they are easy to reach.
 */
export function makeTerrain(world: LandId, seed: string, flats: Spot[]): Terrain {
  const cfg = CONFIG[world]
  const rand = rng(seed + world)
  const s = Math.floor(rand() * 10000)
  const craters: Crater[] = []
  let guard = 0
  while (craters.length < cfg.craters && guard++ < 2000) {
    const r = 4 + Math.pow(rand(), 2.4) * 46
    const a = rand() * Math.PI * 2
    const d = Math.sqrt(rand()) * (PATCH_RADIUS - 10)
    const x = Math.cos(a) * d, z = Math.sin(a) * d
    // Keep the important spots clear of crater bowls and rims
    if (flats.some((f) => Math.hypot(x - f.x, z - f.z) < r * 1.7 + 14)) continue
    craters.push({ x, z, r, depth: r * cfg.craterDepth })
  }

  const height = (x: number, z: number) => {
    let h = (fbm(x / 55, z / 55, s) - 0.5) * 2 * cfg.hill + (fbm(x / 9, z / 9, s + 3) - 0.5) * 2 * cfg.rough
    for (const c of craters) {
      const d = Math.hypot(x - c.x, z - c.z)
      if (d > c.r * 2.2) continue
      if (d < c.r) {
        const t = d / c.r
        h -= c.depth * (1 - t * t) * (1 - 0.15 * t) // bowl
        h += c.depth * 0.3 * smooth(0.8, 1, t) // rim starts to rise inside the edge
      } else {
        const e = (d - c.r) / (c.r * 0.35)
        h += c.depth * 0.32 * Math.exp(-e * e) // raised rim, fading out
      }
    }
    // Flatten near the important spots, and fade to level ground at the patch edge
    let flat = 1
    for (const f of flats) flat = Math.min(flat, smooth(5, 15, Math.hypot(x - f.x, z - f.z)))
    const edge = 1 - smooth(PATCH_RADIUS - 35, PATCH_RADIUS, Math.hypot(x, z))
    const ground = h * flat * edge
    if (world !== 'earth') return ground
    // Earth: a river channel cut through the hills
    return -1.7 + (ground + 1.7) * smooth(5, 15, Math.abs(x - riverX(z)))
  }

  // The same grid the ground mesh is built from, so the player follows the drawn triangles exactly.
  const n = GRID_SEGMENTS + 1
  const cell = GRID_SIZE / GRID_SEGMENTS
  let grid: Float32Array | null = null
  const at = (i: number, j: number) => grid![j * n + i]
  const surface = (x: number, z: number) => {
    if (!grid) {
      grid = new Float32Array(n * n)
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) grid[j * n + i] = height((i / GRID_SEGMENTS - 0.5) * GRID_SIZE, (j / GRID_SEGMENTS - 0.5) * GRID_SIZE)
    }
    const gx = x / cell + GRID_SEGMENTS / 2, gz = z / cell + GRID_SEGMENTS / 2
    if (gx < 0 || gz < 0 || gx >= GRID_SEGMENTS || gz >= GRID_SEGMENTS) return 0
    const i = Math.floor(gx), j = Math.floor(gz)
    const u = gx - i, v = gz - j
    const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1)
    // Each cell is two triangles split along the b-c diagonal (see Terrain.tsx)
    return u + v <= 1 ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v)
  }
  return { height, surface, craters }
}

/** Shades a vertex: darker in low ground, lighter on rims, with a little noise. */
export function shade(x: number, z: number, h: number, seed: number) {
  const patches = noise(x / 28, z / 28, seed + 2) // large lighter/darker areas
  const n = noise(x / 3, z / 3, seed) * 0.5 + noise(x / 0.9, z / 0.9, seed + 5) * 0.5
  return 0.5 + patches * 0.55 + n * 0.3 + Math.max(-0.25, Math.min(0.25, h * 0.06))
}
