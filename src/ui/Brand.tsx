import { useGame } from '../state/game'

// Game name, with the challenge and event underneath, in the top-left corner.
export default function Brand() {
  const { scene, overlay } = useGame()
  if (scene === 'title' || overlay === 'story') return null
  return (
    <div className="brand">
      <b>Left Behind</b>
      <span>Abandoned but Not Forgotten <i>· NASA Space Apps 2026</i></span>
    </div>
  )
}
