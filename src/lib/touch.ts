// On-screen controls state, read each frame by the ship and the walker.
// x/y: joystick (-1..1). jump: jump on foot / fly up in space. down: fly down. boost: fly faster. run: sprint on foot.
export const touch = { x: 0, y: 0, jump: false, down: false, boost: false, run: false }
