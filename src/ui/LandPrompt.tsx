import { useGame } from '../state/game'
import { BODY_DATA } from '../data/bodies'
import { sfx } from '../lib/sound'

export default function LandPrompt() {
  const { near, overlay, setOverlay } = useGame()
  if (!near || overlay !== 'none') return null
  const land = () => {
    sfx.select()
    setOverlay('sites')
  }
  return (
    <button className="prompt" onClick={land}>
      <span className="kb-only">Press L to land</span><span className="touch-text">Land</span> on {BODY_DATA[near].name}
    </button>
  )
}
