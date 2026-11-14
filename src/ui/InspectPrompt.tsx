import { useGame } from '../state/game'

export default function InspectPrompt() {
  const { scene, site, canInspect, overlay, inspect } = useGame()
  if (scene !== 'surface' || !canInspect || overlay !== 'none' || !site) return null
  return (
    <button className="prompt" onClick={() => inspect(site)}>
      Inspect <kbd className="kb-only">E</kbd>
    </button>
  )
}
