import { useGame } from '../state/game'
import { BODY_DATA } from '../data/bodies'
import { sfx } from '../lib/sound'

export default function LandPrompt() {
  const { near, overlay, setOverlay, goTo } = useGame()
  if (!near || overlay !== 'none') return null
  const land = () => {
    sfx.select()
    if (near === 'earth') goTo('surface', null, 'earth')
    else setOverlay('sites')
  }
  return (
    <button className="prompt" onClick={land}>
      Press L to land on {BODY_DATA[near].name}
    </button>
  )
}
