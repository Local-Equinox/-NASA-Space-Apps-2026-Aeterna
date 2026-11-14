import { useEffect } from 'react'
import { useGame } from '../state/game'
import { sfx } from '../lib/sound'

const isUrl = (u: string) => /^https?:\/\//.test(u)

export default function Story() {
  const { site, markFound, setOverlay } = useGame()
  useEffect(() => { if (site) { markFound(site.id); sfx.unlock() } }, [site, markFound])
  if (!site) return null
  const { story } = site
  return (
    <section className="overlay" role="dialog" aria-labelledby="story-title">
      <h2 id="story-title">{site.name}</h2>
      <p className="small">{site.mission} · {site.year}</p>
      <h3>What it is</h3><p>{story.whatItIs}</p>
      <h3>Why it was left</h3><p>{story.whyLeft}</p>
      <h3>The science it enabled</h3><p>{story.science}</p>
      <h3>Where it is now</h3><p>{story.nowStatus}</p>
      <h3>Sources</h3>
      <ul>
        {site.sources.map((s, i) => (
          <li key={i}>{isUrl(s.url) ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : `${s.title} (${s.url})`}</li>
        ))}
      </ul>
      <p><b>✔ Added to your collection.</b></p>
      <div className="row">
        <button className="button secondary" onClick={() => setOverlay('collection')}>Open collection</button>
        <button className="button" onClick={() => setOverlay('none')}>Keep exploring</button>
      </div>
    </section>
  )
}
