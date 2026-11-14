import { useGame } from '../state/game'

export default function BoardPrompt() {
  const { scene, canBoard, canInspect, overlay, board } = useGame()
  if (scene !== 'surface' || !canBoard || canInspect || overlay !== 'none') return null
  return (
    <button className="prompt" onClick={board}>
      Press E to board and take off
    </button>
  )
}
