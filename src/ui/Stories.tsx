import { artifacts } from '../data/artifacts'
import { useGame } from '../state/game'
import Rich from './Rich'

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
          <Rich text={a.story.whatItIs} />
          <h4>Why it was left</h4><Rich text={a.story.whyLeft} />
          {a.story.landing && <><h4>The landing</h4><Rich text={a.story.landing} /></>}
          <h4>The science it enabled</h4><Rich text={a.story.science} />
          <h4>Where it is now</h4><Rich text={a.story.nowStatus} />
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
