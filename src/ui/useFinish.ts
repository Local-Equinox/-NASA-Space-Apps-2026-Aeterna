import { useEffect } from 'react'
import { useGame } from '../state/game'

// When a minigame is won, pause a moment so the player can read the result, then go on to the flashback and story.
export function useFinish(done: boolean, ms = 1700) {
  const { setOverlay } = useGame()
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setOverlay('cutscene'), ms)
    return () => clearTimeout(t)
  }, [done, ms, setOverlay])
}
