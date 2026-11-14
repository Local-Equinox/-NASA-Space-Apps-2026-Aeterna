# Intro page images

Drop the images here with exactly these file names. No code changes are needed: each placeholder box on the
intro page is replaced as soon as its file exists.

- `.png` files are transparent cut-outs; `.jpg` files are full-screen backgrounds (keep them under about 400 KB).
- **WebP:** if a `.webp` with the same base name is here (for example `hero-sky.webp`), the page uses it first,
  then falls back to the `.jpg`/`.png`. To convert: `brew install webp`, then `cwebp -q 80 hero-sky.jpg -o hero-sky.webp`
  (use `-q 85 -alpha_q 90` for the cut-outs). There is no build-time converter, because that needs a new dependency.
- Record every image's source and licence in `CREDITS.md`. No NASA logos or insignia.

| File | What it shows |
|---|---|
| `hero-sky.jpg` | Hero background: Milky Way night sky over a grey, rocky lunar landscape with dark mountains |
| `hero-moon.png` | Hero: the Moon, cropped at the top-left corner |
| `hero-mars.png` | Hero: Mars, cropped at the top-right corner |
| `hero-satellite.png` | Hero: satellite with solar panels |
| `hero-astronaut.png` | Hero: waving astronaut |
| `hero-dish.png` | Hero: radio dish antenna |
| `s2-lander.jpg` | Section 2 background: Apollo Lunar Module descent stage on the lunar surface, small rover in the distance |
| `s3-bg.jpg` | Section 3 background: black space over a lunar horizon, lunar lander on the right |
| `s3-astronaut.png` | Section 3: astronaut in a thinking pose |
| `s3-probe.png` | Section 3: gold-foil space probe |
| `s4-earthrise.jpg` | Section 4 background: Earth rising over the lunar horizon, with a dusty track |
| `s4-lander.png` | Section 4: gold lunar lander |
| `s4-rover.png` | Section 4: white rover |
| `s4-rocket.png` | Section 4: rocket |
| `s4-capsule.png` | Section 4: crewed capsule with solar panels |
| `s5-bg.jpg` | Section 5 background: black space with Earth's curved horizon glowing blue |
| `s5-moon.png` | Section 5: the Moon |
| `s5-mars.png` | Section 5: Mars |
| `s5-astronaut.png` | Section 5: standing astronaut |
| `s6-nebula.jpg` | Section 6 background: deep blue nebula and star field with Earth's horizon |
| `s6-craft-1.png` | Section 6: satellite (top-left) |
| `s6-craft-2.png` | Section 6: satellite (top-right) |
| `s6-craft-3.png` | Section 6: lunar rover (bottom-left) |
| `s6-craft-4.png` | Section 6: probe (right edge) |
| `s6-craft-5.png` | Section 6: probe (bottom-right) |
| `s7-bg.jpg` | Section 7 background: star field, Earth's horizon across the top, cratered lunar surface across the bottom |
| `s7-astronaut.png` | Section 7: waving astronaut |
| `s7-shuttle.png` | Section 7: space shuttle launching with flame and smoke |
