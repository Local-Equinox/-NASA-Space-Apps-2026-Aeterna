import { Link } from '../lib/router'

export default function NotFound() {
  return (
    <section>
      <h1>Lost in space</h1>
      <p>That page doesn't exist.</p>
      <Link to="/" className="button">Back to start</Link>
    </section>
  )
}
