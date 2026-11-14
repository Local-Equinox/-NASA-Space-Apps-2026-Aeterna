import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, ShaderMaterial, Vector3 } from 'three'

const SKY_RADIUS = 1000
const DEG = Math.PI / 180
const OBLIQUITY = 23.43928 * DEG

// J2000 RA/Dec (degrees) -> scene axes (Y up, ecliptic plane). Same convention as Solar System 3D.
function equatorialToScene(raDeg: number, decDeg: number, out: Vector3) {
  const ra = raDeg * DEG, dec = decDeg * DEG
  const x = Math.cos(dec) * Math.cos(ra)
  const y = Math.cos(dec) * Math.sin(ra)
  const z = Math.sin(dec)
  const ey = y * Math.cos(OBLIQUITY) + z * Math.sin(OBLIQUITY)
  const ez = -y * Math.sin(OBLIQUITY) + z * Math.cos(OBLIQUITY)
  return out.set(x, ez, -ey)
}

function colorFromBV(bv: number, target: Color) {
  const c = Math.min(2, Math.max(-0.4, bv))
  const t = (4600 * (1 / (0.92 * c + 1.7) + 1 / (0.92 * c + 0.62))) / 100
  const r = t <= 66 ? 1 : Math.min(1, 1.2929 * Math.pow(t - 60, -0.1332))
  const g = t <= 66 ? Math.min(1, Math.max(0, 0.39 * Math.log(t) - 0.6318)) : Math.min(1, 1.1299 * Math.pow(t - 60, -0.0755))
  const b = t >= 66 ? 1 : t <= 19 ? 0 : Math.min(1, Math.max(0, 0.5432 * Math.log(t - 10) - 1.1963))
  return target.setRGB(r, g, b)
}

// Records are Int16 [ra, dec, mag, bv]; see assets/sky/LICENSE (d3-celestial, BSD-3).
function buildGeometry(buffer: ArrayBuffer) {
  const rec = new Int16Array(buffer)
  const n = rec.length / 4
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), mag = new Float32Array(n)
  const dir = new Vector3(), c = new Color()
  for (let i = 0; i < n; i++) {
    equatorialToScene((rec[i * 4] * 180) / 32767, (rec[i * 4 + 1] * 90) / 32767, dir).multiplyScalar(SKY_RADIUS).toArray(pos, i * 3)
    mag[i] = rec[i * 4 + 2] / 1000
    colorFromBV(rec[i * 4 + 3] / 1000, c).toArray(col, i * 3)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setAttribute('color', new BufferAttribute(col, 3))
  g.setAttribute('magnitude', new BufferAttribute(mag, 1))
  return g
}

// Stars are drawn at a fixed radius around the camera and are never raycast.
export default function Stars() {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null)
  const group = useRef<Group>(null)

  useEffect(() => {
    let cancelled = false
    fetch('./assets/sky/stars.bin')
      .then((r) => r.arrayBuffer())
      .then((b) => !cancelled && setGeometry(buildGeometry(b)))
      .catch(() => {}) // no stars is not fatal
    return () => { cancelled = true }
  }, [])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { pixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
        vertexShader: /* glsl */ `
          attribute vec3 color;
          attribute float magnitude;
          uniform float pixelRatio;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vAlpha = clamp(pow(10.0, -0.13 * (magnitude - 2.0)), 0.12, 1.0);
            vColor = mix(vec3(1.0), color, 0.75);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = clamp(4.1 - 0.42 * magnitude, 1.4, 6.0) * pixelRatio;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.18, d));
          }`,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  )

  useFrame(({ camera }) => group.current?.position.copy(camera.position))

  if (!geometry) return null
  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} raycast={() => {}} />
    </group>
  )
}
