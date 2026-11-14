// Surface tracking data written by the player each frame and drawn by the mini-map.
export interface Marker { x: number; z: number; label: string; found: boolean }
export const track = {
  x: 0,
  z: 0,
  yaw: 0,
  ship: { x: 0, z: 0 },
  markers: [] as Marker[],
}
