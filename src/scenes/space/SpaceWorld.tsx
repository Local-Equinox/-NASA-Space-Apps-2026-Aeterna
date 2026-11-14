import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler, Group, MathUtils, PerspectiveCamera, Quaternion, Scene, Vector3 } from 'three'
import { SolarSystem, type SolarBody } from '../../solar/solarSystem.js'
import { Picker } from '../../solar/picker.js'
import { Labels } from '../../solar/labels.js'
import { createSpaceship } from '../../game/models'
import { isLandable, type LandId } from '../../data/bodies'
import { useGame } from '../../state/game'
import { sim, view, daysPerSecond } from '../../lib/sim'
import { touch } from '../../lib/touch'
import { sfx } from '../../lib/sound'

// Scene units: 1 unit is roughly 333 m for the ship. The ship is drawn at the render origin and the whole
// solar system is shifted around it (floating origin), so nothing jitters even out at Neptune.
const SHIP_SCALE = 1 / 333
const CHASE = 0.17
const CHASE_UP = 0.045
const WARP_SECONDS = 2.4
const BASE_FOV = 60
const WARP_FOV = 34

const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const lookAngles = (d: Vector3) => ({ yaw: Math.atan2(-d.x, -d.z), pitch: Math.asin(MathUtils.clamp(d.y, -1, 1)) })
const forwardOf = (yaw: number, pitch: number, out: Vector3) =>
  out.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch))
const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyC', 'ShiftLeft', 'ShiftRight'])

const orbitRadius = (b: SolarBody) => b.radius * 2.4 + 0.3
const landRange = (b: SolarBody) => b.radius * 3 + 0.6

interface Warp {
  t: number
  target: SolarBody
  launch: boolean
  fromBody: SolarBody | null
  from: Vector3 // fixed point, or an offset from `fromBody`
  lookAt: SolarBody
}

export default function SpaceWorld() {
  const { spawn, overlay, warpRequest, setNear, setWarping, setSelected, selected } = useGame()
  const { gl, camera: cam, size } = useThree()
  const camera = cam as PerspectiveCamera

  const system = useMemo(() => new SolarSystem(new Scene(), gl, sim.days), [gl])
  const sysCam = useMemo(() => new PerspectiveCamera(), [])
  const shipModel = useMemo(() => {
    const m = createSpaceship()
    m.userData.setGearDown(false)
    m.position.y = -3.5
    return m
  }, [])
  const shipRoot = useRef<Group>(null)

  const keys = useRef(new Set<string>())
  const locked = useRef(false)
  locked.current = overlay !== 'none'
  const labels = useRef<Labels | null>(null)

  const sunDirOf = (b: SolarBody, out: Vector3) => {
    out.copy(b.worldPosition).negate()
    return out.lengthSq() < 1e-6 ? out.set(1, 0, 0) : out.normalize()
  }

  // Ship state. `pos` is in system coordinates; if anchored to a body it is carried along as the body orbits.
  const s = useRef({
    pos: new Vector3(),
    vel: new Vector3(),
    yaw: 0,
    pitch: 0,
    anchor: null as SolarBody | null,
    offset: new Vector3(),
    near: null as LandId | null,
    warp: null as Warp | null,
    handled: warpRequest?.n ?? 0,
    selected: null as string | null,
  })

  // Spawn: lift off from the surface of the world we were on, climbing to its orbit.
  useEffect(() => {
    const st = s.current
    const body = system.byId.get(spawn) ?? system.byId.get('earth')!
    const dir = sunDirOf(body, new Vector3())
    st.pos.copy(body.worldPosition).addScaledVector(dir, body.radius * 1.03 + 0.01)
    const lookAt = system.byId.get(body.id === 'earth' ? 'moon' : 'earth')!
    st.warp = { t: 0, target: body, launch: true, fromBody: body, from: dir.clone().multiplyScalar(body.radius * 1.03 + 0.01), lookAt }
    Object.assign(st, lookAngles(dir))
    setWarping(true)
    sfx.warp()
    system.loadTextures(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [system])

  // Labels and picking
  useEffect(() => {
    const container = document.createElement('div')
    container.className = 'labels'
    gl.domElement.parentElement?.append(container)
    labels.current = new Labels(container, system, sysCam)
    const picker = new Picker(gl.domElement, sysCam, camera, system, {
      onSelect: (body: SolarBody) => { setSelected(body.id); sfx.select() },
    })
    ;(window as unknown as { __picker?: Picker }).__picker = picker
    return () => { container.remove(); labels.current = null; picker.enabled = false }
  }, [gl, system, sysCam, camera, setSelected])

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!MOVE_KEYS.has(e.code)) return
      if (document.activeElement instanceof HTMLButtonElement) document.activeElement.blur()
      keys.current.add(e.code)
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

  // Drag to look
  useEffect(() => {
    const el = gl.domElement
    let last: { x: number; y: number } | null = null
    const down = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY }; try { el.setPointerCapture(e.pointerId) } catch { /* ignore */ } }
    const move = (e: PointerEvent) => {
      if (!last || locked.current || s.current.warp) return
      s.current.yaw -= (e.clientX - last.x) * 0.004
      s.current.pitch = MathUtils.clamp(s.current.pitch - (e.clientY - last.y) * 0.004, -1.5, 1.5)
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

  const t = useMemo(() => ({ fwd: new Vector3(), right: new Vector3(), up: new Vector3(0, 1, 0), dir: new Vector3(), target: new Vector3(), from: new Vector3(), to: new Vector3(), q: new Quaternion(), e: new Euler(0, 0, 0, 'YXZ') }), [])

  useFrame((_, rawDt) => {
    const dt = MathUtils.clamp(rawDt, 0, 0.1) // the first frame's timestamp can be negative
    const st = s.current
    const { fwd, right, up, dir, target, from, to, q, e } = t

    // Simulation clock and bodies
    sim.days += daysPerSecond() * dt
    system.update(sim.days, dt, daysPerSecond())
    if (selected !== st.selected) {
      st.selected = selected
      system.setHighlight(selected ? system.byId.get(selected) ?? null : null)
      labels.current?.setSelected(selected ? system.byId.get(selected) ?? null : null)
    }
    for (const b of system.bodies) if (b.path) b.path.visible = view.orbits
    system.markers.visible = view.orbits
    labels.current?.setEnabled(view.labels)

    // Carry the ship with the body it is near
    if (st.anchor) st.pos.copy(st.anchor.worldPosition).add(st.offset)

    // New warp request
    if (warpRequest && warpRequest.n !== st.handled && !st.warp) {
      st.handled = warpRequest.n
      const target = system.byId.get(warpRequest.id)
      if (target) {
        st.warp = {
          t: 0, target, launch: false, lookAt: target,
          fromBody: st.anchor, from: st.anchor ? st.offset.clone() : st.pos.clone(),
        }
        st.anchor = null
        st.vel.set(0, 0, 0)
        setWarping(true)
        sfx.warp()
      }
    }

    let thrust = 0
    let fovBoost = 0
    if (st.warp) {
      const w = st.warp
      w.t += dt / WARP_SECONDS
      const k = smoother(Math.min(1, w.t))
      from.copy(w.from)
      if (w.fromBody) from.add(w.fromBody.worldPosition)
      to.copy(w.target.worldPosition).addScaledVector(sunDirOf(w.target, dir), orbitRadius(w.target))
      st.pos.lerpVectors(from, to, k)
      fovBoost = WARP_FOV * Math.sin(Math.PI * Math.min(1, w.t))
      const a = lookAngles(dir.copy(w.lookAt.worldPosition).sub(st.pos).normalize())
      const turn = 1 - Math.exp(-3 * dt)
      st.yaw += wrap(a.yaw - st.yaw) * turn
      st.pitch += (a.pitch - st.pitch) * turn
      thrust = 1
      if (w.t >= 1) { st.warp = null; setWarping(false) }
    } else {
      // Speed scales with altitude: careful near a world, fast between them.
      let altitude = Infinity
      for (const b of system.bodies) altitude = Math.min(altitude, st.pos.distanceTo(b.worldPosition) - b.radius)
      const boost = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight') ? 3 : 1
      const speed = MathUtils.clamp(0.9 * altitude, 0.1, 90) * boost

      forwardOf(st.yaw, st.pitch, fwd)
      right.crossVectors(fwd, up).normalize()
      target.set(0, 0, 0)
      if (!locked.current) {
        const kk = keys.current
        if (kk.has('KeyW')) target.add(fwd)
        if (kk.has('KeyS')) target.sub(fwd)
        if (kk.has('KeyD')) target.add(right)
        if (kk.has('KeyA')) target.sub(right)
        if (kk.has('Space')) target.add(up)
        if (kk.has('KeyC')) target.sub(up)
        target.addScaledVector(fwd, touch.y).addScaledVector(right, touch.x)
        if (touch.jump) target.add(up)
      }
      if (target.lengthSq() > 0) target.normalize().multiplyScalar(speed)
      // Velocity is relative to the anchor body, so it carries along
      st.vel.lerp(target, 1 - Math.exp(-3.2 * dt))
      st.pos.addScaledVector(st.vel, dt)
      thrust = target.lengthSq() > 0 ? Math.min(1, st.vel.length() / Math.max(speed, 1e-3)) : 0

      // Slide along surfaces instead of passing through
      for (const b of system.bodies) {
        dir.copy(st.pos).sub(b.worldPosition)
        const d = dir.length()
        const min = b.radius * 1.02 + 0.01
        if (d < min) {
          dir.divideScalar(d)
          st.pos.copy(b.worldPosition).addScaledVector(dir, min)
          st.vel.addScaledVector(dir, -Math.min(0, st.vel.dot(dir)))
        }
      }
    }

    // Anchor to the nearest body if close, so its motion carries us
    let nearest: SolarBody | null = null
    let nearestAlt = Infinity
    for (const b of system.bodies) {
      const alt = st.pos.distanceTo(b.worldPosition) - b.radius
      if (alt < nearestAlt) { nearestAlt = alt; nearest = b }
    }
    if (!st.warp && nearest && nearestAlt < nearest.radius * 4 + 1) {
      st.anchor = nearest
      st.offset.copy(st.pos).sub(nearest.worldPosition)
    } else st.anchor = null

    // Land prompt: of the landable bodies in range, the smallest wins.
    let near: LandId | null = null
    let nearR = Infinity
    if (!st.warp) {
      for (const b of system.bodies) {
        if (!isLandable(b.id)) continue
        if (st.pos.distanceTo(b.worldPosition) < landRange(b) && b.radius < nearR) { near = b.id as LandId; nearR = b.radius }
      }
    }
    if (near !== st.near) { st.near = near; setNear(near) }

    // Floating origin: shift the whole system so the ship sits at (0,0,0)
    system.setOrigin(st.pos)

    // Camera, ship pose
    camera.fov = BASE_FOV + fovBoost
    camera.near = MathUtils.clamp(nearestAlt * 0.02, 0.004, 0.1)
    camera.far = 4000
    camera.updateProjectionMatrix()
    forwardOf(st.yaw, st.pitch, fwd)
    e.set(st.pitch, st.yaw, 0)
    q.setFromEuler(e)
    camera.quaternion.copy(q)
    camera.position.copy(fwd).multiplyScalar(-CHASE).addScaledVector(up, CHASE_UP)
    if (shipRoot.current) {
      shipRoot.current.quaternion.slerp(q, 1 - Math.exp(-8 * dt))
      shipModel.userData.setThrust(thrust)
    }

    // System-space camera for labels and screen-space picking
    sysCam.fov = camera.fov; sysCam.aspect = camera.aspect; sysCam.near = camera.near; sysCam.far = camera.far
    sysCam.projectionMatrix.copy(camera.projectionMatrix)
    sysCam.position.copy(camera.position).add(st.pos)
    sysCam.quaternion.copy(camera.quaternion)
    sysCam.updateMatrixWorld(true)
    labels.current?.update(size.width, size.height)
  })

  return (
    <>
      <primitive object={system.root} />
      <group ref={shipRoot} scale={SHIP_SCALE}>
        <primitive object={shipModel} />
      </group>
    </>
  )
}
