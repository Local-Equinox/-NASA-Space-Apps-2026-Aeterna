# Credits

## Open-source libraries
| Library | License |
|---|---|
| React, React DOM | MIT |
| three.js | MIT |
| @react-three/fiber, @react-three/drei | MIT |
| @react-three/rapier / Rapier | MIT / Apache-2.0 |
| Vite, @vitejs/plugin-react | MIT |
| TypeScript | Apache-2.0 |

## Textures, models and data
| Asset | Source | License |
|---|---|---|
| Sun, Mercury, Venus, Earth (day, night, clouds), Moon, Mars, Jupiter, Saturn and its rings, Uranus, Neptune textures | [Solar System Scope](https://www.solarsystemscope.com/textures/), based on NASA data (re-encoded) | CC BY 4.0 (credit required) |
| Phobos, Deimos, Io, Europa, Ganymede, Callisto, Titan maps | JPL Solar System Simulator (Caltech/JPL/USGS) and NASA/JPL-Caltech missions (resampled, tinted) | Public domain (NASA/JPL) |
| `sky/stars.bin`, `sky/constellations.json` | [d3-celestial](https://github.com/ofrohn/d3-celestial) by Olaf Frohn | BSD-3 (`public/assets/sky/LICENSE`) |
| `fonts/bungee.woff2` | Bungee by David Jonathan Ross | SIL OFL (`public/assets/fonts/LICENSE-bungee`) |
| Orbital elements and rotation models | JPL Solar System Dynamics "Approximate Positions of the Planets"; IAU Working Group on Cartographic Coordinates and Rotational Elements | Public data |
| Planet and moon facts (gravity, radius, mass, distance) | NASA/JPL planetary and satellite fact sheets, via the team's Solar System 3D project | DRAFT – verify |
| Astronaut, spaceship, solar system engine | Ported from the team's Solar System 3D project (`src/solar/`, `src/game/models.ts`) | Team-owned |
| Apollo Lunar Module (descent stage shown), Viking Lander, Mars Exploration Rover (Opportunity), InSight Cruise Lander, Ingenuity Mars Helicopter | [NASA 3D Resources](https://science.nasa.gov/3d-resources/) (also on [GitHub](https://github.com/nasa/NASA-3D-Resources)); "free and without copyright", per NASA's [usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media). Scaled and cropped in code; the Lunar Module's ascent stage is hidden. | NASA media, public use |
| Surveyor 3, Lunar Roving Vehicle, ALSEP/EASEP, Pathfinder lander, Sojourner | Simplified models built from primitives in `src/game/props.ts` (no NASA 3D model exists for them); credited as simplified in each story card | Team-owned |
| Draco decoder (`public/draco/`) | three.js | MIT |
| Story text, decisions, coordinates | NASA NSSDCA and NASA Science mission pages (linked in each artifact's sources) | NASA |

## Data sources
TODO

- Deep-space 3D models (Dawn, Kepler, NEAR Shoemaker, Pioneer 10) and their preview images: NASA 3D Resources (https://github.com/nasa/NASA-3D-Resources). Shown larger than life.
- Asteroid Eros shape: NASA 3D Resources, "Asteroid 433 Eros" (3D-printing model), its two printed halves joined and simplified for the game.
- Orbits of Ceres and Eros: NASA/JPL Small-Body Database elements (https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html), rounded. Deep-space story text: NASA Science mission pages and NASA news releases linked on each story card.

- Launch cutscene facts: NASA, "The Space Shuttle" (https://www.nasa.gov/reference/the-space-shuttle/). The shuttle, tank and boosters are simplified models built for this game.

## Intro page images (`public/assets/intro/`)

Not supplied yet: the page shows labelled placeholders. Fill in the source and licence of each image when it is added. No NASA logos or insignia.

| File | What it shows | Source |
|---|---|---|
| `hero-sky.jpg` | Hero background: Milky Way night sky over a grey, rocky lunar landscape with dark mountains | TODO: source and licence |
| `hero-moon.png` | Hero: the Moon, cropped at the top-left corner | TODO: source and licence |
| `hero-mars.png` | Hero: Mars, cropped at the top-right corner | TODO: source and licence |
| `hero-satellite.png` | Hero: satellite with solar panels | TODO: source and licence |
| `hero-astronaut.png` | Hero: waving astronaut | TODO: source and licence |
| `hero-dish.png` | Hero: radio dish antenna | TODO: source and licence |
| `s2-lander.jpg` | Section 2 background: Apollo Lunar Module descent stage on the lunar surface, small rover in the distance | TODO: source and licence |
| `s3-bg.jpg` | Section 3 background: black space over a lunar horizon, lunar lander on the right | TODO: source and licence |
| `s3-astronaut.png` | Section 3: astronaut in a thinking pose | TODO: source and licence |
| `s3-probe.png` | Section 3: gold-foil space probe | TODO: source and licence |
| `s4-earthrise.jpg` | Section 4 background: Earth rising over the lunar horizon, with a dusty track | TODO: source and licence |
| `s4-lander.png` | Section 4: gold lunar lander | TODO: source and licence |
| `s4-rover.png` | Section 4: white rover | TODO: source and licence |
| `s4-rocket.png` | Section 4: rocket | TODO: source and licence |
| `s4-capsule.png` | Section 4: crewed capsule with solar panels | TODO: source and licence |
| `s5-bg.jpg` | Section 5 background: black space with Earth's curved horizon glowing blue | TODO: source and licence |
| `s5-moon.png` | Section 5: the Moon | TODO: source and licence |
| `s5-mars.png` | Section 5: Mars | TODO: source and licence |
| `s5-astronaut.png` | Section 5: standing astronaut | TODO: source and licence |
| `s6-nebula.jpg` | Section 6 background: deep blue nebula and star field with Earth's horizon | TODO: source and licence |
| `s6-craft-1.png` | Section 6: satellite (top-left) | TODO: source and licence |
| `s6-craft-2.png` | Section 6: satellite (top-right) | TODO: source and licence |
| `s6-craft-3.png` | Section 6: lunar rover (bottom-left) | TODO: source and licence |
| `s6-craft-4.png` | Section 6: probe (right edge) | TODO: source and licence |
| `s6-craft-5.png` | Section 6: probe (bottom-right) | TODO: source and licence |
| `s7-bg.jpg` | Section 7 background: star field, Earth's horizon across the top, cratered lunar surface across the bottom | TODO: source and licence |
| `s7-astronaut.png` | Section 7: waving astronaut | TODO: source and licence |
| `s7-shuttle.png` | Section 7: space shuttle launching with flame and smoke | TODO: source and licence |

## Intro page fonts (`public/fonts/`)

- Bowlby One and Montserrat, from Google Fonts, SIL Open Font License 1.1. Self-hosted.
