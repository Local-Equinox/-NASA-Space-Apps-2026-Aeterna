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
      <button className="button big" onClick={() => goTo('surface', null, 'earth')}>Start mission</button>
      <div className="row">
        <button className="button secondary" onClick={() => setOverlay('collection')}>Collection</button>
        <button className="button secondary" onClick={() => setOverlay('about')}>About</button>
      </div>
      <ol className="how">
        <li>Walk to your ship on Earth and take off.</li>
        <li>Fly the solar system (WASD, drag to look). Select the Moon or Mars, warp there, and land at a site.</li>
        <li>Explore on foot, find the equipment marked ??? on your map (press M for the full Moon and Mars map), then clean the dust and debris off its nameplate.</li>
      </ol>
    </section>
  )
}
