import { useState } from 'react'
import { CATALOG } from '../data/bodies'
import { useGame } from '../state/game'

// Every body in one list: handy when a world is only a speck on screen.
export default function BodiesList() {
  const { scene, overlay, selected, setSelected } = useGame()
  const [open, setOpen] = useState(false)
  if (scene !== 'space' || overlay !== 'none') return null
  return (
    <div className="bodies">
      <button className="button secondary" aria-expanded={open} onClick={() => setOpen(!open)}>Bodies</button>
      {open && (
        <ul className="bodies-list">
          {CATALOG.map((b) => (
            <li key={b.id}>
              <button
                className={`button secondary ${b.kind === 'moon' ? 'indent' : ''} ${selected === b.id ? 'right' : ''}`}
                onClick={() => { setSelected(b.id); setOpen(false) }}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
