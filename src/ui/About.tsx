import { useGame } from '../state/game'

export default function About() {
  const { setOverlay } = useGame()
  return (
    <section className="overlay" role="dialog" aria-labelledby="about-title">
      <h2 id="about-title">About &amp; Credits</h2>
      <p>
        <b>Left Behind</b> was made for the NASA Space Apps Challenge 2026 (Iligan), for the challenge
        “Abandoned but Not Forgotten”. It is a student project and is not affiliated with or endorsed by NASA.
      </p>
      <h3>Distances are compressed</h3>
      <p>Planet orbits, spins and constellations follow real data, starting from today's date, but distances and sizes are compressed (logarithmically) so the trip is quick to fly. Real distances would make Earth a speck.</p>
      <h3>Placeholders</h3>
      <p>Artifact models marked “PLACEHOLDER MODEL” are stand-ins until real NASA 3D models are added. Story text marked “DRAFT – verify” or “TODO” has not been checked against NASA sources yet.</p>
      <h3>Credits</h3>
      <ul>
        <li>Sun, planet and Moon textures: <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope</a>, CC BY 4.0, based on NASA data. Other moon maps: NASA/JPL (Caltech/JPL/USGS).</li>
        <li>Orbital elements: JPL Solar System Dynamics. Rotation models: IAU Working Group on Cartographic Coordinates and Rotational Elements.</li>
        <li>Star catalog and constellations: d3-celestial (BSD-3).</li>
        <li>Font: Bungee, SIL Open Font License.</li>
        <li>Built with React, three.js, React Three Fiber, drei and Rapier.</li>
        <li>Gravity values: NASA/JPL planetary fact sheets (Earth 9.81, Moon 1.62, Mars 3.71 m/s²).</li>
        <li>Full list: <code>CREDITS.md</code> in the project.</li>
      </ul>
      <h3>Team</h3>
      <p>TODO: team members.</p>
      <h3>AI use</h3>
      <p>The code was written with Claude Code (Anthropic), and the ship and astronaut models are generated from code. Story facts are written and verified by the team. Details: <code>AI_USE.md</code>.</p>
      <button className="button" onClick={() => setOverlay('none')}>Close</button>
    </section>
  )
}
