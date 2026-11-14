# Flashback cutscenes

After each minigame the game plays a flashback video for that piece of equipment, then opens its story.
Drop an `.mp4` (H.264 + AAC plays everywhere) here with the exact file name below. Nothing else needs changing.
A missing file is skipped: the game goes straight to the story (while developing, a placeholder card shows the expected file name).

| Equipment | File |
|---|---|
| Apollo 11 Lunar Module Eagle | `apollo-11-eagle.mp4` |
| Apollo 15 Lunar Module Falcon, ALSEP and rover | `apollo-15-falcon.mp4` |
| Apollo 12 Lunar Module Intrepid and ALSEP | `apollo-12-intrepid.mp4` |
| Surveyor 3 | `surveyor-3.mp4` |
| Sojourner rover and Pathfinder lander | `sojourner.mp4` |
| Spirit and Opportunity | `spirit-and-opportunity.mp4` |
| Viking 1 lander | `viking-1.mp4` |
| InSight lander | `insight.mp4` |
| Ingenuity helicopter | `ingenuity.mp4` |
| Dawn | `dawn.mp4` |
| NEAR Shoemaker | `near-shoemaker.mp4` |
| Pioneer 10 | `pioneer-10.mp4` |
| Kepler | `kepler.mp4` |

The path for each one is the `cutscene` field in `src/data/artifacts.json`. Keep files small (a few MB) and credit the footage in `CREDITS.md`. No NASA logos or insignia.
