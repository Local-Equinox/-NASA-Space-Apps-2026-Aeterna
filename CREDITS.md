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
| Surveyor 3, Lunar Roving Vehicle, ALSEP/EASEP, Pathfinder lander, Sojourner | Simplified models built from primitives in `src/game/props.ts` (credited as simplified in each story card; whether NASA has a model for any of them has not been checked) | Team-owned |
| Draco decoder (`public/draco/`) | three.js | MIT |
| Story text, decisions, coordinates | NASA NSSDCA and NASA Science mission pages (linked in each artifact's sources). Final wording: the team's fact-check, `docs/FACT_CHECK.md` | NASA |

## Data sources
TODO

- Deep-space 3D models (Dawn, Kepler, NEAR Shoemaker, Pioneer 10) and their preview images: NASA 3D Resources (https://github.com/nasa/NASA-3D-Resources). Shown larger than life.
- Asteroid Eros shape: NASA 3D Resources, "Asteroid 433 Eros" (3D-printing model), its two printed halves joined and simplified for the game.
- Orbits of Ceres and Eros: NASA/JPL Small-Body Database elements (https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html), rounded. Deep-space story text: NASA Science mission pages and NASA news releases linked on each story card.

- Launch cutscene facts: NASA, "The Space Shuttle" (https://www.nasa.gov/reference/the-space-shuttle/). The shuttle, tank and boosters are simplified models built for this game.

- Intro story page: the team's own Wix Studio site (https://hannahbellaatay.wixstudio.com/my-site-5), embedded at runtime. TODO: list the sources and licences of the images used on that site.

## Sources added by the fact-check
- NASA GISS Mars24 lander table (https://www.giss.nasa.gov/tools/mars24/help/landers.html): now a source on the Sojourner, InSight, Ingenuity and Phoenix cards.
- NASA, "After Three Years on Mars, NASA's Ingenuity Helicopter Mission Ends" (https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/): source for the Ingenuity rotor damage statement.
- NASA 3D Resources pages for NEAR Shoemaker, Pioneer 10 (also used for Pioneer 11) and Kepler (A) are now linked on their cards. The Dawn model page link is still to be added.

## Card pictures (`public/assets/cards/`)
Shown at the top of each equipment card. The team supplied these pictures; resized to at most 1100 px wide and saved as JPEG, otherwise not altered. **Source and license of each picture: [TO CONFIRM by the team before publishing].** Captions on the cards describe the picture only and do not name a photographer or mission archive.

| File | Cards | What it shows |
|---|---|---|
| `apollo-11-eagle.jpg` | Apollo 11 | A lunar module on the Moon. It looks like a computer-generated illustration, so confirm whether it is AI-generated and credit it accordingly |
| `apollo-15-falcon.jpg`, `apollo-15-falcon-2.jpg` | Apollo 15 | The Lunar Roving Vehicle (with and without an astronaut). Confirm which Apollo mission each picture is from |
| `surveyor-3.jpg` | Surveyor 3, Apollo 12 | An Apollo 12 astronaut at Surveyor 3, with the lunar module in the distance |
| `spirit.jpg` | Spirit | A 3D model of a Mars Exploration Rover |
| `opportunity.jpg` | Opportunity | Artist's concept of a Mars Exploration Rover |
| `viking-1.jpg`, `viking-2.jpg` | Viking 1, Viking 2 | A Viking lander on a simulated Mars surface; the Viking orbiter with its lander capsule |
| `insight.jpg` | InSight | Engineers working on the lander in a clean room |
| `phoenix.jpg` | Phoenix | Artist's concept of the lander |
| `dawn.jpg`, `near-shoemaker.jpg` | Dawn, NEAR Shoemaker | Artist's concepts |
| `pioneer-10.jpg`, `pioneer-11.jpg` | Pioneer 10, Pioneer 11 | Artist's concepts (the Jupiter picture is on the Pioneer 11 card) |

Sojourner and Pathfinder, Ingenuity and Kepler have no picture yet.

