import { useGame } from '../state/game'
import { BODIES } from '../data/bodies'

export default function LandPrompt() {
  const { near, overlay, setOverlay } = useGame()
  if (!near || overlay !== 'none') return null
  return (
    <button className="prompt" onClick={() => setOverlay('sites')}>
      Land on the {BODIES[near].name} <kbd>L</kbd>
    </button>
  )
}
