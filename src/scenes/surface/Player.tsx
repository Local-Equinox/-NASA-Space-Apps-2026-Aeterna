import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { Group, MathUtils, Vector3 } from 'three'
import { createAstronaut } from '../../game/models'
import { useGame } from '../../state/game'
import { JUMP_SPEED } from '../../data/bodies'
import { touch } from '../../lib/touch'
import type { Artifact } from '../../types/artifact'
import { shipSpot } from './Terrain'
import { PATCH_RADIUS, type Terrain } from './terrain-math'
import { track } from '../../lib/track'

const WALK = 5
const RUN = 9.5
const INSPECT_RANGE = 4
const BOARD_RANGE = 16
const KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight'])

export default function Player({ artifact, terrain }: { artifact: Artifact | null; terrain: Terrain }) {
  const { overlay, setCanInspect, setCanBoard, found } = useGame()
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<Group>(null)
  const model = useMemo(() => createAstronaut(), [])

  const keys = useRef(new Set<string>())
  const locked = useRef(false)
  locked.current = overlay !== 'none'
  // The camera starts on the open side, looking toward the artifact's general direction.
  const view = useRef({ yaw: 0, pitch: 0.3, dist: 6 })
  const state = useRef({ canInspect: false, canBoard: false, facing: 0 })
  const ship = useMemo(() => shipSpot(artifact ? artifact.surfacePosition : null), [artifact])
  // Start looking toward the artifact (or the ship, on Earth) so the camera is on the open side.
  useMemo(() => {
    const look = artifact ? artifact.surfacePosition : ship
    view.current.yaw = Math.atan2(-look.x, -look.z)
  }, [artifact, ship])

  // Mini-map data: artifacts show as ??? until found.
  useEffect(() => {
    track.ship = ship
    track.markers = artifact
      ? [artifact.surfacePosition, ...(artifact.pairedModels ?? []).map((m) => m.surfacePosition)].map((p) => ({
          x: p.x, z: p.z, found: found.includes(artifact.id), label: found.includes(artifact.id) ? artifact.name : '???',
        }))
      : []
  }, [artifact, ship, found])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!KEYS.has(e.code)) return
      if (document.activeElement instanceof HTMLButtonElement) document.activeElement.blur()
      keys.current.add(e.code)
      if (e.code === 'Space') e.preventDefault()
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

  // Drag to orbit, wheel to zoom
  useEffect(() => {
    const el = gl.domElement
    let last: { x: number; y: number } | null = null
    const down = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY }; try { el.setPointerCapture(e.pointerId) } catch { /* ignore */ } }
    const move = (e: PointerEvent) => {
      if (!last || locked.current) return
      view.current.yaw -= (e.clientX - last.x) * 0.005
      view.current.pitch = MathUtils.clamp(view.current.pitch + (e.clientY - last.y) * 0.005, -0.2, 1.3)
      last = { x: e.clientX, y: e.clientY }
    }
    const end = () => { last = null }
    const wheel = (e: WheelEvent) => { view.current.dist = MathUtils.clamp(view.current.dist + e.deltaY * 0.01, 2.6, 30) }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
    el.addEventListener('wheel', wheel, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl])

  const tmp = useMemo(() => ({ wish: new Vector3(), fwd: new Vector3(), right: new Vector3(), head: new Vector3() }), [])
  // Smoothed camera target and a short 'coyote' timer so bumpy ground never flickers the pose or the camera.
  const smooth = useRef({ head: new Vector3(), ready: false, air: 0 })

  useFrame((_, rawDt) => {
    const rb = body.current
    if (!rb) return
    const dt = MathUtils.clamp(rawDt, 0, 0.1)
    const { yaw, pitch, dist } = view.current
    const { wish, fwd, right, head } = tmp
    const pos = rb.translation()
    const vel = rb.linvel()
    const ground = terrain.height(pos.x, pos.z)
    const grounded = pos.y - ground < 0.99 && vel.y < 2.5

    fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw))
    right.set(Math.cos(yaw), 0, -Math.sin(yaw))
    wish.set(0, 0, 0)
    if (!locked.current) {
      const k = keys.current
      if (k.has('KeyW')) wish.add(fwd)
      if (k.has('KeyS')) wish.sub(fwd)
      if (k.has('KeyD')) wish.add(right)
      if (k.has('KeyA')) wish.sub(right)
      wish.addScaledVector(fwd, touch.y).addScaledVector(right, touch.x)
      if (wish.lengthSq() > 1) wish.normalize()
    }
    const running = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight')
    const top = running ? RUN : WALK
    if (wish.lengthSq() > 0) wish.multiplyScalar(top / Math.max(1, wish.length()))

    // Strong control on the ground, weak in the air
    const accel = (grounded ? 32 : 3) * dt
    const dx = wish.x - vel.x, dz = wish.z - vel.z
    const dl = Math.hypot(dx, dz)
    const k = dl > accel ? accel / dl : 1
    let vx = vel.x + dx * k
    let vz = vel.z + dz * k
    let vy = vel.y
    const jumping = grounded && !locked.current && (keys.current.has('Space') || touch.jump)
    if (jumping) vy = JUMP_SPEED
    else if (grounded && vel.y < 1) {
      // Glue to the ground: follow the terrain height instead of bouncing off every bump
      vy = MathUtils.clamp((ground + 0.9 - pos.y) * 14, -6, 6)
    }

    // Stay inside the patch
    const r = Math.hypot(pos.x, pos.z)
    if (r > PATCH_RADIUS && pos.x * vx + pos.z * vz > 0) { vx = 0; vz = 0 }
    rb.setLinvel({ x: vx, y: vy, z: vz }, true)
    // Never fall through the ground: if the physics ever lets the player sink below the surface, put them back on it
    const floor = ground + 0.8
    if (pos.y < floor) {
      rb.setTranslation({ x: pos.x, y: floor, z: pos.z }, true)
      rb.setLinvel({ x: vx, y: Math.max(vy, 0), z: vz }, true)
    }
    if (pos.y < -60) { rb.setTranslation({ x: 0, y: terrain.height(0, 0) + 1, z: 0 }, true); rb.setLinvel({ x: 0, y: 0, z: 0 }, true) }

    // Face the direction of travel and animate
    const groundSpeed = Math.hypot(vx, vz)
    if (groundSpeed > 0.3) state.current.facing = Math.atan2(vx, vz)
    if (visual.current) {
      const diff = Math.atan2(Math.sin(state.current.facing - visual.current.rotation.y), Math.cos(state.current.facing - visual.current.rotation.y))
      visual.current.rotation.y += diff * (1 - Math.exp(-12 * dt))
    }
    const sm = smooth.current
    sm.air = grounded ? 0 : sm.air + dt
    model.userData.animate(dt, groundSpeed, sm.air > 0.18)

    // Third-person camera
    head.set(pos.x, pos.y + 0.5, pos.z)
    if (!sm.ready) { sm.head.copy(head); sm.ready = true }
    // Horizontal follows tightly; vertical is damped so steps and jumps do not shake the view
    sm.head.x = head.x; sm.head.z = head.z
    sm.head.y += (head.y - sm.head.y) * (1 - Math.exp(-10 * dt))
    head.copy(sm.head)
    camera.position.set(
      head.x + Math.sin(yaw) * Math.cos(pitch) * dist,
      Math.max(terrain.height(head.x + Math.sin(yaw) * Math.cos(pitch) * dist, head.z + Math.cos(yaw) * Math.cos(pitch) * dist) + 0.5, head.y + Math.sin(pitch) * dist),
      head.z + Math.cos(yaw) * Math.cos(pitch) * dist,
    )
    camera.lookAt(head)

    track.x = pos.x; track.z = pos.z; track.yaw = yaw

    // Boarding prompt
    const nearShip = Math.hypot(pos.x - ship.x, pos.z - ship.z) < BOARD_RANGE
    if (nearShip !== state.current.canBoard) { state.current.canBoard = nearShip; setCanBoard(nearShip) }

    // Inspect prompt
    const spots = artifact ? [artifact.surfacePosition, ...(artifact.pairedModels ?? []).map((m) => m.surfacePosition)] : []
    const near = spots.some((p) => Math.hypot(pos.x - p.x, pos.z - p.z) < INSPECT_RANGE)
    if (near !== state.current.canInspect) {
      state.current.canInspect = near
      setCanInspect(near)
    }
  })

  return (
    <RigidBody ref={body} position={[0, terrain.height(0, 0) + 0.95, 0]} lockRotations colliders={false} linearDamping={0} ccd>
      <CapsuleCollider args={[0.5, 0.4]} friction={0} />
      <group ref={visual} position={[0, -0.9, 0]}>
        <primitive object={model} />
      </group>
    </RigidBody>
  )
}
