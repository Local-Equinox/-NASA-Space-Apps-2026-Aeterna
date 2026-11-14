# Left Behind

A 3D browser game for the **NASA Space Apps Challenge 2026** (Iligan), for the challenge
*“Abandoned but Not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars.”*

You are a young space archaeologist. Fly a ship from Earth orbit to the Moon and Mars, land at real mission
sites, walk the surface in a spacesuit, find the hardware NASA left behind, make the call the mission faced,
and unlock its story. Nine artifacts, all in a collection.

Not affiliated with or endorsed by NASA. Earth, Moon and Mars distances are compressed so the trip is quick.

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
| Other | Shift boost, click Moon/Mars then Warp, L to land | Space jump, E inspect |
| Touch | On-screen stick and Jump button | same |

`H` shows help. The top bar has Collection, help and a sound toggle.

## Editing content (no code needed)

All artifact content is in **`src/data/artifacts.json`**. Each entry follows the type in
`src/types/artifact.ts`. Adding an artifact means adding one entry; no code changes.

- `site.name`, `lat`, `lon`: landing site (leave `lat`/`lon` as `null` until sourced from NASA).
- `surfacePosition`: metres from where the player spawns (the patch is about 200 m in radius).
- `pairedModels` (optional): extra models for paired artifacts (e.g. two rovers). Inspecting any opens the same story.
- `decision`: one question, several options; exactly one with `"correct": true`. `feedback` explains what NASA did and why.
- `story`: `whatItIs`, `whyLeft`, `science`, `nowStatus`. `sources`: title and `https://` URL.
- Anything still `TODO` or `DRAFT – verify` must be checked against NASA sources before the pitch.
- 3D models: drop a compressed GLB in `public/assets/models/` and point `model` at it. Until real models are wired in, every artifact shows a labelled placeholder box.

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
