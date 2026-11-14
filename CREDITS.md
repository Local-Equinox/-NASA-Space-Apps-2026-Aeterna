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
