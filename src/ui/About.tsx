import { useGame } from '../state/game'

export default function About() {
  const { setOverlay } = useGame()
  return (
    <section className="overlay" role="dialog" aria-labelledby="about-title">
      <h2 id="about-title">About &amp; Credits</h2>
      <p>Distances between Earth, the Moon and Mars are compressed so the trip is quick to fly.</p>
      <p>TODO: data and model credits, team, AI-use disclosure (see CREDITS.md and AI_USE.md).</p>
      <button className="button" onClick={() => setOverlay('none')}>Close</button>
    </section>
  )
}
