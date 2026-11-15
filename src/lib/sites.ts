import { artifacts } from '../data/artifacts'
import type { Artifact, World } from '../types/artifact'

// Each world's first site is the "set" landing site and is named from the start.
// Every other site shows as ??? until the player has found its equipment.
export function isRevealed(a: Artifact, found: string[]): boolean {
  return found.includes(a.id) || artifacts.find((x) => x.world === a.world) === a
}

// "2004–2018 (last signal 10 June 2018; ...)" -> "2004–2018" for plates and list rows
export const shortYear = (a: Artifact) => a.year.replace(/\s*\(.*$/, '')
export const siteLabel = (a: Artifact, found: string[]) => (isRevealed(a, found) ? a.site.name : '???')
export const shortLabel = (a: Artifact, found: string[]) => (isRevealed(a, found) ? (a.mapLabel ?? a.mission) : '???')

export interface SitePoint { key: string; lat: number; lon: number }

/** Real coordinates on the map (a pair entry like Spirit and Opportunity has two points). */
export function sitePoints(a: Artifact): SitePoint[] {
  const pts: SitePoint[] = []
  if (a.site.lat !== null && a.site.lon !== null) pts.push({ key: a.id, lat: a.site.lat, lon: a.site.lon })
  if (a.site.alt) pts.push({ key: `${a.id}-alt`, lat: a.site.alt.lat, lon: a.site.alt.lon })
  return pts
}

// Both texture maps are equirectangular with longitude 0 at the centre and east to the right.
export const mapPos = (lat: number, lon: number) => {
  const l = lon > 180 ? lon - 360 : lon
  return { left: `${((l + 180) / 360) * 100}%`, top: `${((90 - lat) / 180) * 100}%` }
}

export const worldMapImage = (w: World) => `url(./assets/textures/planets/${w}.jpg)`
