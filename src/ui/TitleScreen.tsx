import { useGame } from '../state/game'
import Intro from './intro/Intro'

// The title screen is the scrolling intro story. The buttons do exactly what they did before.
export default function TitleScreen() {
  const { goTo, setOverlay, overlay } = useGame()
  const hidden = overlay === 'collection' || overlay === 'about' || overlay === 'stories'
  return (
    // Kept mounted (just hidden) behind Collection and About, so the page keeps its scroll position.
    <div style={{ display: hidden ? 'none' : 'contents' }}>
      <Intro
        onStart={() => goTo('surface', null, 'earth')}
        onCollection={() => setOverlay('collection')}
        onAbout={() => setOverlay('about')}
      />
    </div>
  )
}
