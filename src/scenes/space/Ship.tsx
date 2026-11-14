import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler, Group, MathUtils, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { createSpaceship } from '../../game/models'
import { BODIES, SUN_DIR, landRange, orbitRadius, type BodyId } from '../../data/bodies'
import { useGame } from '../../state/game'
import type { World } from '../../types/artifact'

const SHIP_SCALE = 0.05 // the 20 m ship model becomes 1 scene unit
const CHASE = 3.2
const WARP_SECONDS = 2.4
const BASE_FOV = 60
const WARP_FOV = 34

const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const lookAngles = (d: Vector3) => ({ yaw: Math.atan2(-d.x, -d.z), pitch: Math.asin(MathUtils.clamp(d.y, -1, 1)) })
const forwardOf = (yaw: number, pitch: number, out: Vector3) =>
  out.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch))

/** Where a warp arrives: on the sunlit side of the body. */
const arrivalPoint = (id: BodyId) => BODIES[id].position.clone().addScaledVector(SUN_DIR, orbitRadius(BODIES[id]))

const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyC', 'ShiftLeft', 'ShiftRight'])

export default function Ship() {
  const { spawn, overlay, warpRequest, setNear, setWarping } = useGame()
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const gl = useThree((s) => s.gl)
  const model = useMemo(() => {
    const m = createSpaceship()
    m.userData.setGearDown(false) // flying
    m.position.y = -3.5 // pivot on the hull centre
    return m
  }, [])
  const root = useRef<Group>(null)

  const keys = useRef(new Set<string>())
  const locked = useRef(false)
  locked.current = overlay !== 'none'

  const state = useRef({
    pos: arrivalPoint(spawn).add(new Vector3(0, 1.5, 0)),
    vel: new Vector3(),
    yaw: 0,
    pitch: 0,
    near: null as World | null,
    warp: null as null | { t: number; from: Vector3; to: Vector3; target: BodyId },
    handled: warpRequest?.n ?? 0,
  })

  // Start looking at the body we're orbiting (Earth at game start; the Moon is the first stop).
  useMemo(() => {
    const s = state.current
    const look = BODIES[spawn === 'earth' ? 'moon' : spawn].position.clone().sub(s.pos).normalize()
    Object.assign(s, lookAngles(look))
  }, [spawn])

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (MOVE_KEYS.has(e.code)) {
        // Space must not re-click whichever button was last pressed (e.g. Warp).
        if (document.activeElement instanceof HTMLButtonElement) document.activeElement.blur()
        keys.current.add(e.code)
      }
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const clear = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])

  // Mouse / touch drag to look around
  useEffect(() => {
    const el = gl.domElement
    let last: { x: number; y: number } | null = null
    const down = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId) }
    const move = (e: PointerEvent) => {
      if (!last || locked.current || state.current.warp) return
      const s = state.current
      s.yaw -= (e.clientX - last.x) * 0.004
      s.pitch = MathUtils.clamp(s.pitch - (e.clientY - last.y) * 0.004, -1.5, 1.5)
      last = { x: e.clientX, y: e.clientY }
    }
    const end = () => { last = null }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
    }
  }, [gl])

  const tmp = useMemo(() => ({ fwd: new Vector3(), right: new Vector3(), up: new Vector3(0, 1, 0), dir: new Vector3(), target: new Vector3(), q: new Quaternion(), e: new Euler(0, 0, 0, 'YXZ') }), [])

  useFrame((_, rawDt) => {
    const dt = MathUtils.clamp(rawDt, 0, 0.1) // first frame can be negative
    const s = state.current
    const { fwd, right, up, dir, target, q, e } = tmp

    // New warp request from the info panel
    if (warpRequest && warpRequest.n !== s.handled && !s.warp) {
      s.handled = warpRequest.n
      s.warp = { t: 0, from: s.pos.clone(), to: arrivalPoint(warpRequest.id), target: warpRequest.id }
      s.vel.set(0, 0, 0)
      setWarping(true)
    }

    let thrust = 0
    if (s.warp) {
      const w = s.warp
      w.t += dt / WARP_SECONDS
      const k = smoother(Math.min(1, w.t))
      s.pos.lerpVectors(w.from, w.to, k)
      camera.fov = BASE_FOV + WARP_FOV * Math.sin(Math.PI * Math.min(1, w.t))
      camera.updateProjectionMatrix()
      // Turn toward the destination body
      const a = lookAngles(dir.copy(BODIES[w.target].position).sub(s.pos).normalize())
      const turn = 1 - Math.exp(-4 * dt)
      s.yaw += wrap(a.yaw - s.yaw) * turn
      s.pitch += (a.pitch - s.pitch) * turn
      thrust = 1
      if (w.t >= 1) {
        s.warp = null
        camera.fov = BASE_FOV
        camera.updateProjectionMatrix()
        setWarping(false)
      }
    } else {
      // Speed scales with altitude: careful near a world, fast between them.
      let altitude = Infinity
      for (const b of Object.values(BODIES)) altitude = Math.min(altitude, s.pos.distanceTo(b.position) - b.radius)
      const boost = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight') ? 3 : 1
      const speed = MathUtils.clamp(0.9 * altitude, 0.15, 60) * boost

      forwardOf(s.yaw, s.pitch, fwd)
      right.crossVectors(fwd, up).normalize()
      target.set(0, 0, 0)
      if (!locked.current) {
        const k = keys.current
        if (k.has('KeyW')) target.add(fwd)
        if (k.has('KeyS')) target.sub(fwd)
        if (k.has('KeyD')) target.add(right)
        if (k.has('KeyA')) target.sub(right)
        if (k.has('Space')) target.add(up)
        if (k.has('KeyC')) target.sub(up)
      }
      if (target.lengthSq() > 0) target.normalize().multiplyScalar(speed)
      s.vel.lerp(target, 1 - Math.exp(-3.2 * dt))
      s.pos.addScaledVector(s.vel, dt)
      thrust = Math.min(1, s.vel.length() / Math.max(speed, 0.001)) * (target.lengthSq() > 0 ? 1 : 0)

      // Slide along surfaces instead of passing through
      for (const b of Object.values(BODIES)) {
        dir.copy(s.pos).sub(b.position)
        const d = dir.length()
        const min = b.radius * 1.03 + 0.1
        if (d < min) {
          dir.divideScalar(d)
          s.pos.copy(b.position).addScaledVector(dir, min)
          s.vel.addScaledVector(dir, -Math.min(0, s.vel.dot(dir)))
        }
      }
    }

    // Land prompt: of the bodies in range, the smallest wins.
    let near: World | null = null
    for (const id of ['moon', 'mars'] as const) {
      const b = BODIES[id]
      if (s.pos.distanceTo(b.position) < landRange(b) && (!near || b.radius < BODIES[near].radius)) near = id
    }
    if (near !== s.near && !s.warp) { s.near = near; setNear(near) }
    else if (s.warp && s.near) { s.near = null; setNear(null) }

    // Chase camera and ship pose
    forwardOf(s.yaw, s.pitch, fwd)
    e.set(s.pitch, s.yaw, 0)
    q.setFromEuler(e)
    camera.quaternion.copy(q)
    camera.position.copy(s.pos).addScaledVector(fwd, -CHASE).addScaledVector(up, 0.9)
    if (root.current) {
      root.current.position.copy(s.pos)
      root.current.quaternion.slerp(q, 1 - Math.exp(-8 * dt))
      model.userData.setThrust(thrust)
    }
  })

  return (
    <group ref={root} scale={SHIP_SCALE}>
      <primitive object={model} />
    </group>
  )
}
