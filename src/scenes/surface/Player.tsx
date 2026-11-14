import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { Group, MathUtils, Vector3 } from 'three'
import { createAstronaut } from '../../game/models'
import { useGame } from '../../state/game'
import { JUMP_SPEED } from '../../data/bodies'
import { touch } from '../../lib/touch'
import type { Artifact } from '../../types/artifact'
import { PATCH_RADIUS } from './Terrain'

const WALK = 5
const RUN = 9.5
const INSPECT_RANGE = 4
const KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight'])

export default function Player({ artifact }: { artifact: Artifact }) {
  const { overlay, setCanInspect } = useGame()
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<Group>(null)
  const model = useMemo(() => createAstronaut(), [])

  const keys = useRef(new Set<string>())
  const locked = useRef(false)
  locked.current = overlay !== 'none'
  // The camera starts on the open side, looking toward the artifact's general direction.
  const view = useRef({ yaw: Math.atan2(artifact.surfacePosition.x, artifact.surfacePosition.z) + Math.PI, pitch: 0.3, dist: 6 })
  const state = useRef({ canInspect: false, facing: 0 })

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
    const down = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId) }
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

  useFrame((_, rawDt) => {
    const rb = body.current
    if (!rb) return
    const dt = MathUtils.clamp(rawDt, 0, 0.1)
    const { yaw, pitch, dist } = view.current
    const { wish, fwd, right, head } = tmp
    const pos = rb.translation()
    const vel = rb.linvel()
    const grounded = pos.y < 0.96 && Math.abs(vel.y) < 0.1

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
    if (grounded && !locked.current && (keys.current.has('Space') || touch.jump)) vy = JUMP_SPEED

    // Stay inside the patch
    const r = Math.hypot(pos.x, pos.z)
    if (r > PATCH_RADIUS && pos.x * vx + pos.z * vz > 0) { vx = 0; vz = 0 }
    rb.setLinvel({ x: vx, y: vy, z: vz }, true)
    if (pos.y < -20) { rb.setTranslation({ x: 0, y: 1, z: 0 }, true); rb.setLinvel({ x: 0, y: 0, z: 0 }, true) }

    // Face the direction of travel and animate
    const groundSpeed = Math.hypot(vx, vz)
    if (groundSpeed > 0.3) state.current.facing = Math.atan2(vx, vz)
    if (visual.current) {
      const diff = Math.atan2(Math.sin(state.current.facing - visual.current.rotation.y), Math.cos(state.current.facing - visual.current.rotation.y))
      visual.current.rotation.y += diff * (1 - Math.exp(-12 * dt))
    }
    model.userData.animate(dt, groundSpeed, !grounded)

    // Third-person camera
    head.set(pos.x, pos.y + 0.5, pos.z)
    camera.position.set(
      head.x + Math.sin(yaw) * Math.cos(pitch) * dist,
      Math.max(0.4, head.y + Math.sin(pitch) * dist),
      head.z + Math.cos(yaw) * Math.cos(pitch) * dist,
    )
    camera.lookAt(head)

    // Inspect prompt
    const near = [artifact.surfacePosition, ...(artifact.pairedModels ?? []).map((m) => m.surfacePosition)].some(
      (p) => Math.hypot(pos.x - p.x, pos.z - p.z) < INSPECT_RANGE,
    )
    if (near !== state.current.canInspect) {
      state.current.canInspect = near
      setCanInspect(near)
    }
  })

  return (
    <RigidBody ref={body} position={[0, 0.95, 0]} lockRotations colliders={false} linearDamping={0} ccd>
      <CapsuleCollider args={[0.5, 0.4]} friction={0} />
      <group ref={visual} position={[0, -0.9, 0]}>
        <primitive object={model} />
      </group>
    </RigidBody>
  )
}
