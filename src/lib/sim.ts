// Days since the J2000 epoch (1 Jan 2000, 12:00 UTC). Kept here, not imported from the solar engine,
// so the title screen does not pull in Three.js.
const daysSinceJ2000 = (ms: number) => (ms - Date.UTC(2000, 0, 1, 12)) / 86400000

// Shared simulation clock: days since J2000, starting at the real current date.
export const RATES = [
  { label: '1 hour/s', days: 1 / 24 },
  { label: '1 day/s', days: 1 },
  { label: '10 days/s', days: 10 },
  { label: '100 days/s', days: 100 },
]
export const sim = { days: daysSinceJ2000(Date.now()), rateIndex: 0, paused: false }
export const daysPerSecond = () => (sim.paused ? 0 : RATES[sim.rateIndex].days)

// Display toggles read by the space scene every frame.
export const view = { labels: true, orbits: true, constellations: true }
