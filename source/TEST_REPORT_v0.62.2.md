# LuckyDex v0.62.2 – Streaming Stampede tuning patch

## Summary
This patch tunes Streaming Stampede after first-play feedback.

### Changes made
- Added a persistent **chosen Pokémon** display at the top of the studio so the selected lead Pokémon is always visible.
- Reworked the studio presentation with an improved **background**, more distinct lane art, and a cleaner broadcast-stage feel.
- Expanded the arena to **four visible avenues/lane tracks** in later rounds.
- Tuned **Normal difficulty** slightly down so it remains challenging without being as punishing.
- Reduced the density/extremity of the **final "count every Pokémon"** round so it is still hectic but no longer excessive.
- Difficulty now affects not just CPU counting quality, but also the stream pacing/count density.
- Updated help text and release metadata to **v0.62.2**.

## Verification performed
Focused patch verification only.

### Automated tests
- `v0620-release.test.cjs`
- `v0620-streaming-stampede-core.test.cjs`
- `v0620-streaming-stampede-integration.test.cjs`
- `v0621-stadium2-entry-regression.test.cjs`

Result: **12 / 12 tests passed**.

### Additional checks
- Syntax-checked changed JavaScript files:
  - `arcade-streaming-stampede-core.js`
  - `arcade-streaming-stampede.js`
  - `arcade-help.js`
  - `arcade-world.js`
  - `app-v0167.js`
- Confirmed release metadata aligned to **0.62.2**.

## Notes
- This is a focused patch verification, **not** a claim that the entire repository suite passed.
- Patch is cumulative over the recent Streaming Stampede hotfix line.
