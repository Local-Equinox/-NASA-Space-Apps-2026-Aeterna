import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Color, Group, MathUtils, SRGBColorSpace, TextureLoader } from 'three'
import { createLaunchStack } from '../game/models'
import { useGame } from '../state/game'
import { sfx } from '../lib/sound'
import Stars from './space/Stars'

// The launch, compressed into about 25 seconds. Facts in the captions are from NASA's reference page
// "The Space Shuttle" (https://www.nasa.gov/reference/the-space-shuttle/).
const STAGES = [
  { at: 0, title: 'Liftoff', text: 'The three main engines and the two solid rocket boosters fire together to lift the shuttle off the pad.' },
  { at: 9.5, title: 'Booster separation', text: 'About two minutes after launch, around 45 km up, the two solid rocket boosters separate. They parachute into the Atlantic Ocean and are recovered for reuse.' },
  { at: 15.5, title: 'External tank separation', text: 'The main engines burn for about 8.5 minutes. Then the empty external tank is released. Most of it disintegrates in the atmosphere.' },
  { at: 20, title: 'Orbit', text: 'The orbiter is now travelling at over 27,000 km/h (17,000 mph), fast enough to stay in orbit.' },
]
const END = 25.5
const SKY = new Color('#8fb4ee')
const SPACE = new Color('#000008')

function Earth() {
  const map = useLoader(TextureLoader, './assets/textures/planets/earth_daymap.jpg')
  map.colorSpace = SRGBColorSpace
  return (
    <mesh position={[0, -1290, -200]} rotation={[0.4, 2.2, 0]}>
      <sphereGeometry args={[1200, 64, 48]} />
      <meshStandardMaterial map={map} roughness={1} />
    </mesh>
  )
}

function Timeline({ onStage, onDone }: { onStage: (i: number) => void; onDone: () => void }) {
  const { scene, camera } = useThree()
  const stack = useMemo(() => createLaunchStack(), [])
  const rig = useRef<Group>(null)
  const ground = useRef<Group>(null)
  const earth = useRef<Group>(null)
  const st = useRef({ t: 0, stage: -1, done: false })
  const bg = useMemo(() => new Color(), [])
  const [starsOn, setStarsOn] = useState(false)

  useFrame((_, rawDt) => {
    const s = st.current
    const dt = MathUtils.clamp(rawDt, 0, 0.1)
    s.t += dt
    const t = s.t
    let stage = 0
    STAGES.forEach((g, i) => { if (t >= g.at) stage = i })
    if (stage !== s.stage) { s.stage = stage; onStage(stage) }
    if (t >= END && !s.done) { s.done = true; onDone() }

    const { orbiter, tank, boosters } = stack.userData.parts as { orbiter: Group; tank: Group; boosters: Group[] }
    // Altitude: hold for ignition, then climb ever faster. The ground and clouds drop away below.
    const climb = Math.max(0, t - 2)
    const alt = 5 * Math.pow(climb, 2.6)
    if (ground.current) { ground.current.position.y = -alt; ground.current.visible = t < STAGES[1].at }
    bg.copy(SKY).lerp(SPACE, MathUtils.smoothstep(t, 5, 11))
    scene.background = bg
    if (t > 8 && !starsOn) setStarsOn(true)
    if (earth.current) earth.current.visible = t >= STAGES[1].at

    // Engines
    const main = t < 0.6 ? 0 : t < STAGES[2].at - 0.4 ? 1 : t > STAGES[3].at && t < STAGES[3].at + 1.6 ? 0.35 : 0
    const solid = t < 1.2 ? 0 : t < STAGES[1].at ? 1 : 0
    stack.userData.setLaunchThrust(main, solid, t)

    // Boosters peel away and fall behind
    const sb = Math.max(0, t - STAGES[1].at)
    boosters.forEach((b, i) => {
      const side = i ? 1 : -1
      b.position.set(side * (3.95 + sb * 5 + sb * sb * 1.2), -sb * sb * 5, -sb * 2)
      b.rotation.z = -side * sb * 0.22
      b.visible = sb < 5.5
    })
    // The tank drops away and tumbles
    const tk = Math.max(0, t - STAGES[2].at)
    tank.position.set(0, 3 - tk * tk * 2.2, -tk * 4.5)
    tank.rotation.x = -tk * 0.3
    tank.visible = tk < 6

    // The whole vehicle slowly pitches over toward horizontal flight after the boosters go
    if (rig.current) {
      rig.current.rotation.x = -1.25 * MathUtils.smoothstep(t, 8.5, 19)
      const shake = t > 1 && t < 6 ? 0.12 * (1 - (t - 1) / 5) : 0
      rig.current.position.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0)
    }
    void orbiter

    // Camera: a slow sweep round the vehicle, pulling back for the separations
    const a = 0.75 + t * 0.035
    const dist = 62 + 22 * MathUtils.smoothstep(t, 8.5, 11) - 26 * MathUtils.smoothstep(t, 19, 22)
    const lookY = 16 - 6 * MathUtils.smoothstep(t, 9, 19)
    camera.position.set(Math.sin(a) * dist, lookY + 4 + 10 * MathUtils.smoothstep(t, 2, 8), Math.cos(a) * dist)
    camera.lookAt(0, lookY, 0)
  })

  const clouds = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    x: Math.sin(i * 2.4) * (60 + (i % 5) * 45), z: Math.cos(i * 1.7) * (60 + (i % 4) * 50), y: 260 + i * 95, s: 30 + (i % 4) * 16,
  })), [])

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[60, 80, 50]} intensity={2.6} />
      {starsOn && <Stars />}
      <group ref={rig}>
        <primitive object={stack} />
      </group>
      <group ref={ground}>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.6, 0]}>
          <circleGeometry args={[9000, 48]} />
          <meshStandardMaterial color="#3f6f37" roughness={1} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[13, 14.5, 1, 40]} />
          <meshStandardMaterial color="#8d9096" roughness={0.9} />
        </mesh>
        <mesh position={[0, 24, -62]}>
          <boxGeometry args={[44, 48, 30]} />
          <meshStandardMaterial color="#ecece8" roughness={0.85} />
        </mesh>
        {clouds.map((c, i) => (
          <mesh key={i} position={[c.x, c.y, c.z]} scale={[c.s, c.s * 0.28, c.s * 0.7]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
      <group ref={earth} visible={false}>
        <Suspense fallback={null}><Earth /></Suspense>
      </group>
    </>
  )
}

// Launch cutscene: liftoff, booster separation, external tank separation, orbit. Can be skipped.
export default function LaunchScene() {
  const { goTo, fading } = useGame()
  const [stage, setStage] = useState(0)
  const left = useRef(false)
  const finish = () => {
    if (left.current) return
    left.current = true
    goTo('space')
  }
  useEffect(() => { sfx.launch() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Escape' || e.code === 'Enter') finish() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const s = STAGES[stage]
  return (
    <>
      <Canvas dpr={[1, 2]} camera={{ position: [40, 14, 46], fov: 50, near: 0.5, far: 20000 }}>
        <Timeline onStage={setStage} onDone={finish} />
      </Canvas>
      <div className="launch-caption" role="status">
        <p className="small">Stage {stage + 1} of {STAGES.length}</p>
        <h2>{s.title}</h2>
        <p>{s.text}</p>
        <div className="launch-dots" aria-hidden="true">{STAGES.map((_, i) => <i key={i} className={i <= stage ? 'on' : ''} />)}</div>
      </div>
      <button className="button launch-skip" onClick={finish} disabled={fading}>Skip cutscene ▸▸</button>
    </>
  )
}
