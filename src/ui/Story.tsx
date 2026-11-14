import { useEffect } from 'react'
import { artifacts } from '../data/artifacts'
import { useGame } from '../state/game'
import { sfx } from '../lib/sound'

const isUrl = (u: string) => /^https?:\/\//.test(u)
const PLACE = { moon: 'Moon', mars: 'Mars', space: 'Deep space' } as const
const fmt = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`

// The equipment's dossier: a panel on the right while the camera frames the equipment on the left.
export default function Story() {
  const { site, reading, readStory, markFound, setOverlay } = useGame()
  const a = reading ?? site
  useEffect(() => { if (a && !reading) { markFound(a.id); sfx.unlock() } }, [a, reading, markFound])
  if (!a) return null
  const { story } = a
  const close = () => (reading ? readStory(null) : setOverlay('none'))
  const facts: [string, string][] = [
    ['Mission', a.mission],
    ['Years', a.year],
    [a.world === 'space' ? 'Where' : 'Site', a.site.name.replace(/^.*site: /, '')],
  ]
  if (a.site.lat !== null && a.site.lon !== null) facts.push(['Coordinates', `${fmt(a.site.lat, 'N', 'S')}, ${fmt(a.site.lon, 'E', 'W')}`])
  return (
    <aside className="dossier" role="dialog" aria-labelledby="story-title">
      <header>
        <button className="dossier-x" onClick={close} aria-label="Close">✕</button>
        <span>{PLACE[a.world]} · Chapter {artifacts.indexOf(a) + 1} of {artifacts.length}</span>
      </header>
      <div className="dossier-body">
        <p className="dossier-kicker">Chapter {artifacts.indexOf(a) + 1} · {PLACE[a.world]}</p>
        <h2 id="story-title">{a.name}</h2>
        <p className="dossier-lead">{story.whatItIs}</p>
        <p className="dossier-stamp">Added to your missions</p>
        <dl className="dossier-facts">
          {facts.map(([k, v], i) => (
            <div key={k}><dt><span>{String(i + 1).padStart(2, '0')}</span>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <section><p className="dossier-kicker">Why it was left</p><p>{story.whyLeft}</p></section>
        <section><p className="dossier-kicker">The science it enabled</p><p>{story.science}</p></section>
        <section><p className="dossier-kicker">Where it is now</p><p>{story.nowStatus}</p></section>
        {a.whereabouts && <section><p className="dossier-kicker">Whereabouts</p><p>{a.whereabouts}</p></section>}
        <section>
          <p className="dossier-kicker">3D model</p>
          <p className="dossier-small">{a.modelCredit}</p>
          <p className="dossier-kicker">Sources</p>
          <ul className="dossier-small">
            {a.sources.map((s, i) => (
              <li key={i}>{isUrl(s.url) ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : `${s.title} (${s.url})`}</li>
            ))}
          </ul>
        </section>
        <div className="row">
          <button className="dossier-btn" onClick={() => { if (reading) readStory(null); setOverlay('collection') }}>Missions list</button>
          <button className="dossier-btn solid" onClick={close}>Keep exploring</button>
        </div>
      </div>
    </aside>
  )
}
