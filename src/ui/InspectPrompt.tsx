import { useGame } from '../state/game'
import { sfx } from '../lib/sound'

export default function InspectPrompt() {
  const { scene, canInspect, overlay, setOverlay } = useGame()
  if (scene !== 'surface' || !canInspect || overlay !== 'none') return null
  return (
    <button className="prompt" onClick={() => { sfx.inspect(); setOverlay('decision') }}>
      Inspect <kbd>E</kbd>
    </button>
  )
}
