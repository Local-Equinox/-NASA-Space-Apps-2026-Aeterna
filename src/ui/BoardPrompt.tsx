import { useGame } from '../state/game'

export default function BoardPrompt() {
  const { scene, canBoard, canInspect, overlay, surfaceWorld, goTo, setSpawn } = useGame()
  if (scene !== 'surface' || !canBoard || canInspect || overlay !== 'none') return null
  return (
    <button className="prompt" onClick={() => { setSpawn(surfaceWorld); goTo('space') }}>
      Press E to board and take off
    </button>
  )
}
