// Rebuilds the card fields in src/data/artifacts.json from docs/FACT_CHECK.md (the team's fact-checked wording).
// Usage: node scripts/apply-fact-check.mjs
// Only text fields are touched (story, mission, year, site name and coordinates, model credit, sources).
// Pin positions (site.lat/lon), models, cutscenes and the other settings are left as they are.
import fs from 'node:fs'

const md = fs.readFileSync('docs/FACT_CHECK.md', 'utf8')
const jsonPath = 'src/data/artifacts.json'
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
const open = []

const cards = md.split(/\n## /).slice(1)
for (const card of cards) {
  const title = card.split('\n')[0]
  const chapter = Number(card.match(/^Chapter (\d+)/m)?.[1])
  const a = data[chapter - 1]
  if (!a) { open.push(`No game entry for document card "${title}" (chapter ${chapter})`); continue }

  const sec = {}
  for (const part of card.split(/\n### /).slice(1)) {
    const [h, ...rest] = part.split('\n')
    sec[h.trim()] = rest.join('\n').replace(/\n# [A-Z ]+\s*$/, '').trim()
  }
  const blocks = (t) => t.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
  const body = (t) => blocks(t).join('\n\n') // paragraphs and "- " bullets, separated by blank lines

  a.story.whatItIs = body(sec['Intro'])
  a.story.whyLeft = body(sec['Why it was left'])
  a.story.science = body(sec['The science it enabled'])
  a.story.nowStatus = body(sec['Where it is now'])
  if (sec['The landing']) a.story.landing = body(sec['The landing'])
  else delete a.story.landing

  const facts = {}
  for (const l of sec['Quick facts'].split('\n')) {
    const m = l.match(/^- \*\*(.+?):\*\*\s*(.+)$/)
    if (m) facts[m[1]] = m[2].trim()
  }
  a.mission = facts['Mission']
  a.year = facts['Years']
  const place = facts['Site'] ?? facts['Where']
  if (facts['Site']) {
    const prefix = a.site.name.match(/^.*site: /)?.[0] ?? ''
    a.site.name = prefix + place
  } else {
    a.site.name = place
    a.whereabouts = place // the one short "where" line shown in the space info panel
  }
  if (facts['Coordinates']) a.site.coordinates = facts['Coordinates']
  else delete a.site.coordinates

  // 3D model note: the first paragraph only; "Before publishing" lines and editor notes are open items
  const mb = blocks(sec['3D model'])
  a.modelCredit = mb[0].replace(/\s*I could not confirm[\s\S]*$/, '').trim()
  for (const extra of mb.slice(1)) open.push(`${a.id}: ${extra}`)
  if (/I could not confirm/.test(mb[0])) open.push(`${a.id}: ${mb[0].match(/I could not confirm[\s\S]*$/)[0]}`)

  a.sources = []
  for (const raw of sec['Sources'].split('\n').filter((l) => l.startsWith('- '))) {
    let line = raw.slice(2).trim()
    const url = line.match(/(https?:\/\/[^\s)]+)/)
    if (!url) { open.push(`${a.id}: ${line}`); continue }
    const t = line.replace(/^Add:\s*/, '').match(/^(.*),\s*https?:\/\//)
    a.sources.push({ title: t[1].trim(), url: url[1] })
    const note = line.match(/https?:\/\/\S+\s+\((.*)\)\s*$/)
    if (note && /^(add|I did not)/i.test(note[1])) open.push(`${a.id}: source "${t[1].trim()}": ${note[1]}`)
  }
}
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n')
console.log(open.map((o) => '- ' + o).join('\n'))
