import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { Artifact } from '../../types/artifact'
import type { LandId } from '../../data/bodies'

// Deterministic random numbers, so a site looks the same every visit.
function rng(seed: string) {
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

export const PATCH_RADIUS = 200 // metres from spawn the player may roam

/** Parked ship: to the side of the line toward the artifact, so it never blocks the first view. */
export function shipSpot(a: Artifact | null) {
  if (!a) return { x: -5, z: -14 } // Earth: the pad is just ahead of the spawn point
  const { x, z } = a.surfacePosition
  const len = Math.hypot(x, z) || 1
  return { x: (-z / len) * 12, z: (x / len) * 12 }
}

const PALETTE = {
  earth: { ground: '#4f7a3a', rock: '#7d7d76' },
  moon: { ground: '#8d8d8b', rock: '#6f6f6d' },
  mars: { ground: '#a85f3c', rock: '#7d4630' },
}

// Fallback terrain: flat ground with scattered rocks (no heightmap yet).
export default function Terrain({ world, artifact }: { world: LandId; artifact: Artifact | null }) {
  const colors = PALETTE[world]
  const rocks = useMemo(() => {
    const rand = rng(artifact?.id ?? 'earth')
    const ship = shipSpot(artifact)
    const list: { x: number; z: number; r: number; sx: number; sy: number; sz: number; ry: number }[] = []
    while (list.length < (world === 'earth' ? 40 : 70)) {
      const angle = rand() * Math.PI * 2
      const dist = 8 + rand() * (PATCH_RADIUS - 10)
      const x = Math.cos(angle) * dist
      const z = Math.sin(angle) * dist
      const r = 0.3 + Math.pow(rand(), 3) * 2.2
      // Keep the artifact and ship clear so it stays easy to inspect.
      const spots = artifact ? [artifact.surfacePosition, ...(artifact.pairedModels ?? []).map((m) => m.surfacePosition)] : []
      if (spots.some((p) => Math.hypot(x - p.x, z - p.z) < 6)) continue
      if (Math.hypot(x - ship.x, z - ship.z) < 14) continue
      list.push({ x, z, r, sx: 0.8 + rand() * 0.6, sy: 0.5 + rand() * 0.5, sz: 0.8 + rand() * 0.6, ry: rand() * 6 })
    }
    return list
  }, [artifact, world])

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <mesh rotation-x={-Math.PI / 2}>
          <circleGeometry args={[800, 48]} />
          <meshStandardMaterial color={colors.ground} roughness={1} />
        </mesh>
        {/* Thick slab so nothing tunnels through; its top face is y = 0 */}
        <CuboidCollider args={[400, 1, 400]} position={[0, -1, 0]} friction={0.8} />
      </RigidBody>
      {rocks.map((rock, i) => (
        <RigidBody key={i} type="fixed" colliders="ball" position={[rock.x, rock.r * rock.sy * 0.5, rock.z]}>
          <mesh scale={[rock.r * rock.sx, rock.r * rock.sy, rock.r * rock.sz]} rotation-y={rock.ry}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={colors.rock} roughness={1} flatShading />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}
