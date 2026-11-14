import { artifacts } from '../data/artifacts'
import { Link } from '../lib/router'
import type { World } from '../types/artifact'

export default function SiteMap({ world }: { world: World }) {
  const list = artifacts.filter((a) => a.world === world)
  return (
    <section>
      <h1>{world === 'moon' ? 'The Moon' : 'Mars'}</h1>
      <ul className="list">
        {list.map((a) => (
          <li key={a.id}>
            <Link to={`/artifact/${a.id}`}>{a.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
