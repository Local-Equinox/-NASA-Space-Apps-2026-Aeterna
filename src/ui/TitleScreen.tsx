import { useGame } from '../state/game'

export default function TitleScreen() {
  const { goTo, setOverlay, overlay } = useGame()
  if (overlay === 'collection' || overlay === 'about' || overlay === 'stories') return null
  return (
    <section className="title-screen">
      <h1>Left Behind</h1>
      <p className="premise">
        You are a young space archaeologist. Fly to the Moon and Mars, find the hardware NASA left behind,
        and work out why it was left.
      </p>
      <button className="button big" onClick={() => goTo('space')}>Start mission</button>
      <div className="row">
        <button className="button secondary" onClick={() => setOverlay('collection')}>Collection</button>
        <button className="button secondary" onClick={() => setOverlay('about')}>About</button>
      </div>
      <ol className="how">
        <li>Fly your ship (WASD, drag to look, Shift to boost, or the on-screen stick).</li>
        <li>Click the Moon or Mars, warp there, and land at a site.</li>
        <li>Walk the surface, find the artifact, and make the call NASA faced.</li>
      </ol>
    </section>
  )
}
