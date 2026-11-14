import { artifacts } from '../data/artifacts'
import { useGame } from '../state/game'

const isUrl = (u: string) => /^https?:\/\//.test(u)

// Every story, readable without playing the 3D part.
export default function Stories() {
  const { found, setOverlay } = useGame()
  return (
    <section className="overlay" role="dialog" aria-labelledby="stories-title">
      <h2 id="stories-title">All stories</h2>
      {artifacts.map((a) => (
        <article key={a.id}>
          <h3>{a.name} {found.includes(a.id) ? '✔' : ''}</h3>
          <p className="small">{a.mission} · {a.year}</p>
          <p>{a.story.whatItIs}</p>
          <p><b>Why it was left:</b> {a.story.whyLeft}</p>
          <p><b>Science:</b> {a.story.science}</p>
          <p><b>Now:</b> {a.story.nowStatus}</p>
          <p className="small">
            Sources:{' '}
            {a.sources.map((s, i) => (isUrl(s.url) ? <a key={i} href={s.url} target="_blank" rel="noreferrer">{s.title} </a> : <span key={i}>{s.title} </span>))}
          </p>
        </article>
      ))}
      <button className="button" onClick={() => setOverlay('collection')}>Back</button>
    </section>
  )
}
