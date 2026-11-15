import type { ReactNode } from 'react'

// Card text is plain paragraphs separated by blank lines; lines starting with "- " are list items and
// **bold** marks a label. Keeping it this simple means the text in artifacts.json reads like the team's document.
const inline = (s: string): ReactNode[] =>
  s.split(/(\*\*[^*]+\*\*)/).map((p, i) => (p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p))

export default function Rich({ text }: { text: string }) {
  const out: ReactNode[] = []
  let items: string[] = []
  const flush = () => {
    if (items.length) out.push(<ul key={`l${out.length}`}>{items.map((t, i) => <li key={i}>{inline(t)}</li>)}</ul>)
    items = []
  }
  for (const block of text.split(/\n\s*\n/)) {
    if (block.startsWith('- ')) items.push(block.slice(2))
    else { flush(); out.push(<p key={`p${out.length}`}>{inline(block)}</p>) }
  }
  flush()
  return <>{out}</>
}
