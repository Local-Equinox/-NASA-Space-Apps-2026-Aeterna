import { artifacts } from '../data/artifacts'
import { useGame } from '../state/game'

// Next to a spacecraft out in space: offer the spacewalk.
export default function ProbePrompt() {
  const { scene, nearProbe, overlay, inspect } = useGame()
  if (scene !== 'space' || !nearProbe || overlay !== 'none') return null
  const a = artifacts.find((x) => x.body === nearProbe)
  if (!a) return null
  return (
    <button className="prompt" onClick={() => inspect(a)}>
      Spacewalk to the spacecraft <kbd className="kb-only">E</kbd>
    </button>
  )
}
