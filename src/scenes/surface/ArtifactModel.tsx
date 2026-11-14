import { Html } from '@react-three/drei'
import type { Artifact } from '../../types/artifact'

function Placeholder({ x, z, text }: { x: number; z: number; text: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[2.4, 1.4, 3.2]} />
        <meshStandardMaterial color="#d9b84a" roughness={0.6} />
      </mesh>
      <Html zIndexRange={[5, 0]} position={[0, 2.4, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
        <div className="placeholder-label">{text}</div>
      </Html>
    </group>
  )
}

// Placeholders until real NASA GLBs replace them. Clearly labelled, per the accuracy rules.
export default function ArtifactModel({ artifact }: { artifact: Artifact }) {
  return (
    <>
      <Placeholder x={artifact.surfacePosition.x} z={artifact.surfacePosition.z} text="PLACEHOLDER MODEL" />
      {(artifact.pairedModels ?? []).map((m) => (
        <Placeholder key={m.label} x={m.surfacePosition.x} z={m.surfacePosition.z} text={`PLACEHOLDER MODEL: ${m.label}`} />
      ))}
    </>
  )
}
