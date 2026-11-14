import { Link } from '../lib/router'

export default function Home() {
  return (
    <section>
      <h1>Left Behind</h1>
      <p>Why would NASA leave hardware on another world? Visit the sites and find out.</p>
      <div className="row">
        <Link to="/world/moon" className="button">Visit the Moon</Link>
        <Link to="/world/mars" className="button">Visit Mars</Link>
      </div>
    </section>
  )
}
