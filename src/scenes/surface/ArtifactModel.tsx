import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Box3, CanvasTexture, Group, Mesh, SRGBColorSpace, Vector3 } from 'three'
import { PROPS } from '../../game/props'
import type { Artifact } from '../../types/artifact'
import type { Terrain } from './terrain-math'

// Draco decoder is bundled locally (public/draco), so nothing is fetched from a CDN.
useGLTF.setDecoderPath('./draco/')

/** A floating name tag drawn into a canvas, so it needs no DOM overlay. */
function Tag({ text, found, height }: { text: string; found: boolean; height: number }) {
  const { texture, aspect } = useMemo(() => {
    const c = document.createElement('canvas')
    const g = c.getContext('2d')!
    g.font = 'bold 64px system-ui, sans-serif'
    const w = Math.ceil(g.measureText(text).width) + 56
    c.width = w; c.height = 100
    g.font = 'bold 64px system-ui, sans-serif'
    g.fillStyle = found ? '#5bd18a' : '#ffd166'
    g.beginPath(); g.roundRect(0, 0, w, 100, 22); g.fill()
    g.fillStyle = '#000'; g.textBaseline = 'middle'; g.fillText(text, 28, 54)
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return { texture: t, aspect: w / 100 }
  }, [text, found])
  const h = 1.6
  return (
    <sprite position={[0, height, 0]} scale={[h * aspect, h, 1]} raycast={() => {}}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  )
}

interface ModelSpec { model: string; size?: number; cutAbove?: number }

/** A NASA GLB, scaled to its real size in metres, resting on the ground. */
function Glb({ model, size = 3, cutAbove }: ModelSpec) {
  const gltf = useGLTF(model)
  const scene = useMemo(() => {
    const root = gltf.scene.clone(true)
    const box = new Box3().setFromObject(root)
    // Hide the part above a fraction of the height (for the Lunar Module, the ascent stage, which left the Moon)
    if (cutAbove !== undefined) {
      const limit = box.min.y + (box.max.y - box.min.y) * cutAbove
      const c = new Vector3()
      root.traverse((o) => {
        if ((o as Mesh).isMesh) {
          const b = new Box3().setFromObject(o)
          if (b.getCenter(c).y > limit) o.visible = false
        }
      })
    }
    const fit = new Box3()
    root.traverse((o) => { if ((o as Mesh).isMesh && o.visible) fit.expandByObject(o) })
    const dims = fit.getSize(new Vector3())
    const k = size / Math.max(dims.x, dims.y, dims.z)
    const center = fit.getCenter(new Vector3())
    root.scale.setScalar(k)
    root.position.set(-center.x * k, -fit.min.y * k, -center.z * k)
    const holder = new Group()
    holder.add(root)
    return holder
  }, [gltf, size, cutAbove])
  return <primitive object={scene} />
}

function Model(spec: ModelSpec) {
  if (spec.model.startsWith('procedural:')) {
    const build = PROPS[spec.model.slice('procedural:'.length)]
    return build ? <primitive object={build()} /> : null
  }
  return <Glb {...spec} />
}

interface Props {
  artifact: Artifact
  found: boolean
  terrain: Terrain
}

// Equipment stays unidentified (???) until the player inspects it.
export default function ArtifactModel({ artifact, found, terrain }: Props) {
  const items = [
    { label: artifact.tagLabel ?? artifact.name, model: artifact.model, size: artifact.modelSize, cutAbove: artifact.modelCutAbove, ...artifact.surfacePosition },
    ...(artifact.pairedModels ?? []).map((m) => ({ label: m.label, model: m.model, size: m.modelSize, cutAbove: m.modelCutAbove, ...m.surfacePosition })),
  ]
  return (
    <>
      {items.map((it, i) => (
        <group key={i} position={[it.x, terrain.height(it.x, it.z), it.z]} rotation-y={i * 1.3}>
          {/* A simple solid box so the player walks around the equipment instead of through it */}
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[(it.size ?? 3) * 0.3, (it.size ?? 3) * 0.25, (it.size ?? 3) * 0.3]} position={[0, (it.size ?? 3) * 0.25, 0]} />
          </RigidBody>
          <Suspense fallback={null}>
            <Model model={it.model} size={it.size} cutAbove={it.cutAbove} />
          </Suspense>
          <Tag text={found ? it.label : '???'} found={found} height={(it.size ?? 3) + 1.4} />
        </group>
      ))}
    </>
  )
}
