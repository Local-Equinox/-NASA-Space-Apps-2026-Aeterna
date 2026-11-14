# Left Behind

A 3D browser game for the **NASA Space Apps Challenge 2026** (Iligan), for the challenge
*“Abandoned but Not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars.”*

You are a young space archaeologist. Walk to your ship on Earth and blast off into a solar system with real
orbits, rotations and labelled constellations. Select a world, warp to it, land at a mission site, explore on
foot under that world's real gravity, and follow the map tracker (artifacts show as ??? until found). Find
the hardware NASA left behind (shown as real NASA 3D models where NASA has them), make the call the mission faced, and unlock its story. Nine artifacts, from NASA mission pages.

Not affiliated with or endorsed by NASA. Distances and sizes are compressed (logarithmic) so the trip is quick.
The solar system engine in `src/solar/` is ported from the team's Solar System 3D project.

## Run it

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:5173 (add -- --host to test on a phone on the same Wi-Fi)
npm run build    # production build in dist/
npm run preview  # serve dist/ locally
```

## Controls

| | Space | Surface |
|---|---|---|
| Move | WASD (Space / C up and down) | WASD, Shift to run |
| Look | Drag | Drag, wheel to zoom |
| Other | Shift boost; click a world or use Bodies, then Warp; L to land | Space jump; E inspect or board your ship |
| Touch | On-screen stick and Jump button | same |

`H` shows help. The top bar has Orbits/Names/Stars toggles, Collection, help and a sound toggle. The bottom-right clock sets the simulation speed. On the surface, the map tracker (top left) shows ??? where an artifact is, and your ship.

## Editing content (no code needed)

All artifact content is in **`src/data/artifacts.json`**. Each entry follows the type in
`src/types/artifact.ts`. Adding an artifact means adding one entry; no code changes.

- `site.name`, `lat`, `lon`: landing site (leave `lat`/`lon` as `null` until sourced from NASA).
- `surfacePosition`: metres from where the player spawns (the patch is about 200 m in radius).
- `pairedModels` (optional): extra models for paired artifacts (e.g. two rovers). Inspecting any opens the same story.
- `decision`: one question, several options; exactly one with `"correct": true`. `feedback` explains what NASA did and why.
- `story`: `whatItIs`, `whyLeft`, `science`, `nowStatus`. `sources`: title and `https://` URL.
- All current story text comes from the NASA pages listed in each artifact's `sources`. Where a page does not say something (such as coordinates or a reason), the text says so. Re-check any edit against NASA before the pitch.
- `model`: a GLB in `public/assets/models/` (Draco and WebP are fine; the decoder is bundled), or `"procedural:<name>"` for a simplified model from `src/game/props.ts`. `modelSize` is the model's real largest dimension in metres. `modelCutAbove` (0–1) hides the part above that fraction of the height (used to show only the Lunar Module's descent stage).
- Only the Moon and Mars can be landed on; Earth is the launch pad. After take-off the ship circles Earth: pick the Moon or Mars, then Warp.

## Deploy

It is a static site: `npm run build` produces `dist/`. A `vercel.json` is included, so import the repo into
Vercel and deploy with defaults. Netlify works too (build `npm run build`, publish `dist`). The build uses
relative paths; keep the site at the domain root because artifact `model` paths start with `/assets/`.
No backend or runtime API calls; all textures are bundled locally.

## Progress

Found artifacts are saved in `localStorage`. "Reset progress" is in the Collection screen.

## Credits and AI use

See [CREDITS.md](CREDITS.md) and [AI_USE.md](AI_USE.md). Earth, Moon and Mars textures are CC BY 4.0
(Solar System Scope, based on NASA data).
