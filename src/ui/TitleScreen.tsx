import { useGame } from '../state/game'

export default function TitleScreen() {
  const { goTo, setOverlay } = useGame()
  return (
    <section className="title-screen">
      <h1>Left Behind</h1>
      <p>Fly to the Moon and Mars, find the hardware NASA left there, and learn why.</p>
      <button className="button" onClick={() => goTo('space')}>Start mission</button>
      <div className="row">
        <button className="button secondary" onClick={() => setOverlay('collection')}>Collection</button>
        <button className="button secondary" onClick={() => setOverlay('about')}>About</button>
      </div>
      <p className="small">How to play: WASD to move, drag to look, Shift to boost, H for help.</p>
    </section>
  )
}
