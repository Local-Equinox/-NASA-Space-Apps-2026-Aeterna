import { useState } from 'react'
import { useGame } from '../state/game'
import { sfx } from '../lib/sound'

// "Make the call": the real trade-off the mission faced.
export default function Decision() {
  const { site, setOverlay } = useGame()
  const [picked, setPicked] = useState<number | null>(null)
  if (!site) return null
  const { question, options } = site.decision
  const choice = picked === null ? null : options[picked]
  const correct = options.find((o) => o.correct)
  return (
    <section className="overlay" role="dialog" aria-labelledby="decision-title">
      <h2 id="decision-title">Make the call</h2>
      <p>{question}</p>
      <ul className="list">
        {options.map((o, i) => (
          <li key={i}>
            <button
              className={`button secondary site ${picked === i ? (o.correct ? 'right' : 'wrong') : ''}`}
              disabled={picked !== null}
              onClick={() => { setPicked(i); (o.correct ? sfx.right : sfx.wrong)() }}
            >
              {o.text}
            </button>
          </li>
        ))}
      </ul>
      {choice && (
        <div role="status">
          <p><b>{choice.correct ? 'That is what the mission did.' : 'Not quite.'}</b> {choice.feedback}</p>
          {!choice.correct && correct && <p><b>What NASA did:</b> {correct.text}. {correct.feedback}</p>}
          <button className="button" onClick={() => setOverlay('story')}>Unlock the story</button>
        </div>
      )}
    </section>
  )
}
