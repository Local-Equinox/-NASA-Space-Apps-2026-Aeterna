import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, Mesh, ShaderMaterial, Vector2 } from 'three'
import { buildConstellationLines, buildConstellationNames } from '../../solar/constellations.js'
import { view } from '../../lib/sim'

// Constellation lines and names, drawn at a fixed radius around the camera. Never raycast.
export default function Constellations() {
  const [parts, setParts] = useState<{ lines: Mesh; names: Mesh } | null>(null)
  const group = useRef<Group>(null)
  const size = useThree((s) => s.size)
  const resolution = useRef(new Vector2(1, 1))

  useEffect(() => {
    let cancelled = false
    fetch('./assets/sky/constellations.json')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const pr = Math.min(window.devicePixelRatio, 2)
        setParts({
          lines: buildConstellationLines(data) as unknown as Mesh,
          names: buildConstellationNames(data, pr, resolution.current) as unknown as Mesh,
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useFrame(({ camera }) => {
    group.current?.position.copy(camera.position)
    resolution.current.set(size.width, size.height)
    if (group.current) group.current.visible = view.constellations
    if (parts) (parts.names.material as ShaderMaterial).uniforms.resolution.value = resolution.current
  })

  return <group ref={group}>{parts && (<><primitive object={parts.lines} /><primitive object={parts.names} /></>)}</group>
}
