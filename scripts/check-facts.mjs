// Checks the game's card data against docs/FACT_CHECK.md and looks for known-wrong old wording.
// Usage: node scripts/check-facts.mjs   (exits 1 if anything fails)
import fs from 'node:fs'
import { execSync } from 'node:child_process'

const data = JSON.parse(fs.readFileSync('src/data/artifacts.json', 'utf8'))
const md = fs.readFileSync('docs/FACT_CHECK.md', 'utf8')
let bad = 0
const fail = (m) => { bad++; console.log('FAIL', m) }
const all = (a) => [a.story.whatItIs, a.story.whyLeft, a.story.landing ?? '', a.story.science, a.story.nowStatus, a.modelCredit, a.year, a.mission, a.site.name, a.site.coordinates ?? ''].join('\n')

// 1. Every card: each section is the document's text, word for word
for (const card of md.split(/\n## /).slice(1)) {
  const a = data[Number(card.match(/^Chapter (\d+)/m)[1]) - 1]
  const must = (label, text) => { if (!all(a).includes(text)) fail(`${a.id}: ${label} differs from the document`) }
  const sec = {}
  for (const part of card.split(/\n### /).slice(1)) { const [h, ...r] = part.split('\n'); sec[h.trim()] = r.join('\n').trim() }
  for (const [k, f] of [['Intro', 'whatItIs'], ['Why it was left', 'whyLeft'], ['The landing', 'landing'], ['The science it enabled', 'science'], ['Where it is now', 'nowStatus']]) {
    if (!sec[k]) continue
    const want = sec[k].split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).join('\n\n')
    if (a.story[f] !== want) fail(`${a.id}: ${k} differs from the document`)
  }
  const facts = Object.fromEntries([...sec['Quick facts'].matchAll(/^- \*\*(.+?):\*\*\s*(.+)$/gm)].map((m) => [m[1], m[2].trim()]))
  if (a.mission !== facts['Mission']) fail(`${a.id}: mission`)
  if (a.year !== facts['Years']) fail(`${a.id}: years "${a.year}" vs "${facts['Years']}"`)
  if (facts['Coordinates'] && a.site.coordinates !== facts['Coordinates']) fail(`${a.id}: coordinates text`)
  if (!a.site.name.endsWith(facts['Site'] ?? facts['Where'])) fail(`${a.id}: site name`)
  for (const m of sec['Sources'].matchAll(/https?:\/\/[^\s)]+/g)) if (!a.sources.some((s) => s.url === m[0])) fail(`${a.id}: missing source link ${m[0]}`)
  if (a.sources.some((s) => !/^https:\/\//.test(s.url))) fail(`${a.id}: a source is not a link`)
  if (a.world === 'space' && !a.whereabouts) fail(`${a.id}: no whereabouts line`)
}

// 2. Key facts, copied from the document, must be in the right card
const facts = {
  'surveyor-3': ['1967', '6,326 TV pictures', '3° S, 23.41° W', '98 kPa', '180 m (197 yards)', '4 May 1967', 'about 14 feet (4.3 m)'],
  'apollo-11-eagle': ['1969', '0.67° N, 23.47° E', '48 kg', '0.67416° N, 23.47314° E', '27 August 1969'],
  'apollo-15-falcon': ['1971', '26.13° N, 3.63° E', '18 hours 35 minutes', '27.9 km', '77.31 kg', '63.5 W after one year', '30 September 1977', '26.36° N, 0.25° E'],
  'apollo-12-intrepid': ['1969', '3.01° S, 23.42° W', '34.35 kg', '3.94° S, 338.80° E', '60 km'],
  sojourner: ['19.47° N, 326.75° E (the same as 33.25° W)', '10.6 kg', '27 September 1997', 'sol 93 (7 October 1997)', '2.3 billion bits', '16,500 images', '100 meters'],
  spirit: ['2004–2011', '14.57° S, 175.47° E (landing site)', '1 May 2009', '1,300 commands', '25 May 2011', '4.8 miles (7.73 km)', '6 years, 2 months and 19 days'],
  opportunity: ['2004–2018 (last signal 10 June 2018; mission declared complete 13 February 2019)', '1.95° S, 354.47° E (the same as 5.53° W)', '28.06 miles (45.16 km)', 'On 25 March 2015, NASA announced', '11 October 2026', '14.9 km'],
  'viking-1': ['1976–1982', '22.48° N, 47.94° W', '11 November 1982', '28 km', '22.483° N, 47.94° W', '−86 °C'],
  'viking-2': ['1976–1980', '47.97° N, 225.71° W (the same as 134.29° E)', '12 April 1980', '6,460 km', '52,663 images', '24 July 1978'],
  insight: ['2018–2022', 'about 4.5° N, 135.9° E (the center of the landing site)', '15 December 2022', '21 December 2022', 'almost 95%', '600 km'],
  ingenuity: ['2021–2024', '18.44° N, 77.45° E', '72 times', '128.8 minutes', '17.0 km (10.5 miles)', '24.0 m (78.7 feet)', '18 January 2024'],
  phoenix: ['2008', '68.22° N, 125.75° W (the same as 234.25° E)', '25 May 2008', '2 November 2008', '5 August 2008', '19 June 2008'],
  dawn: ['2007–2018', '27 September 2007', 'at least 20 years', '99 percent', '50 years'],
  'near-shoemaker': ['1996–2001', '12 February 2001', '4 mph (6.4 km/h)', '28 February 2001', '160,000 images', '19:44 UT', 'minus 173 °C'],
  'pioneer-10': ['1972–2003', '13 June 1983', '31 March 1997', '23 January 2003', '12.23 billion km', '118.8 AU', '17.7 billion km'],
  'pioneer-11': ['1973–1995', '42,500 km', '30 September 1995', '44.1 AU', '97.59 AU', '14.599 billion km', '440 images'],
  kepler: ['2009–2018', '6 March 2009', 'May 2013', '30 October 2018', '2,600 planet discoveries'],
}
for (const a of data) for (const f of facts[a.id] ?? []) if (!all(a).includes(f)) fail(`${a.id}: missing "${f}"`)
if (Object.keys(facts).length !== 17 || data.length !== 17) fail('expected 17 cards')

// 3. Map pins must be the document's coordinates (card text parsed as degrees)
const deg = (s, pos, neg) => { const m = s.match(new RegExp(`([\\d.]+)° ([${pos}${neg}])`)); return m ? (m[2] === pos ? 1 : -1) * Number(m[1]) : null }
for (const a of data) {
  if (a.site.lat == null) continue
  const c = a.site.coordinates ?? ''
  const lat = deg(c, 'N', 'S'); let lon = deg(c, 'E', 'W')
  if (lat !== null && Math.abs(lat - a.site.lat) > 0.01) fail(`${a.id}: pin latitude ${a.site.lat} vs card ${lat}`)
  if (lon !== null) { const norm = (x) => ((x % 360) + 360) % 360; if (Math.abs(norm(lon) - norm(a.site.lon)) > 0.02 && !/same as/.test(c)) fail(`${a.id}: pin longitude ${a.site.lon} vs card ${lon}`)
    else if (/same as/.test(c) && Math.abs(norm(lon) - norm(a.site.lon)) > 0.02) fail(`${a.id}: pin longitude ${a.site.lon} vs card ${lon}`) }
}

// 4. Wording the document removed or corrected must not be in the game anywhere
const stale = [/2004[–-]2018/, /Hadley/i, /drift/i, /70 W at launch/, /no NASA 3D model exists/, /(?<!Mars Exploration Rovers \()Spirit[^.]*2004–2018/]
const files = execSync("grep -rIl . src README.md CREDITS.md intro.html public/assets/cutscenes/README.md | grep -v '^src/solar/'").toString().trim().split('\n')
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  for (const re of [/Hadley/i, /no NASA 3D model exists/, /70 W at launch/])
    if (re.test(t)) fail(`${f}: contains ${re}`)
  if (f === 'src/data/artifacts.json') for (const a of data) {
    if (a.id !== 'opportunity' && /2004–2018/.test(all(a))) fail(`${a.id}: still says 2004–2018`)
    if (/drift/i.test(all(a))) fail(`${a.id}: says drift`)
  }
}
console.log(bad ? `${bad} problem(s)` : 'OK: all 17 cards match docs/FACT_CHECK.md, pins match, no stale wording')
process.exit(bad ? 1 : 0)
