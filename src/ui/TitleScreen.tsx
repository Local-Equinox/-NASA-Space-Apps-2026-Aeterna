import { useGame } from '../state/game'
import WixIntro from './WixIntro'

// The first screen is the team's intro page. "Start mission" begins the game.
export default function TitleScreen() {
  const { goTo, setOverlay, overlay } = useGame()
  const hidden = overlay === 'collection' || overlay === 'about' || overlay === 'stories' || overlay === 'story'
  return (
    // Kept mounted (just hidden) behind Missions and About, so the intro does not reload afterwards.
    <div style={{ display: hidden ? 'none' : 'contents' }}>
      <WixIntro
        onStart={() => goTo('surface', null, 'earth')}
        onMissions={() => setOverlay('collection')}
        onAbout={() => setOverlay('about')}
      />
    </div>
  )
}
