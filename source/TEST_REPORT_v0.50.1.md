# LuckyDex v0.50.1 — Dream World Polish Verification

## Scope
Bounded polish pass on Dream World, Ice Cream Scoop, and Wailord’s Water Spout. No Codex used.

### Implemented
- Dream World venue now uses the original Pokémon Dream World Dream Bridge artwork, with the existing bundled SVG retained as the venue fallback.
- Ice Cream Scoop playfield uses original Dream World Pleasant Forest artwork, adds a Combee supervisor and 20-inch target treatment, darkens all game text/panel copy for readable contrast, and disables browser-style text selection/callouts.
- Ice Cream tower sensitivity increased modestly on all difficulties, especially Normal/Hard, and visible lean is stronger.
- Wailord’s Water Spout uses original Dream World Sparkling Sea artwork, darker readable HUD/panels, a smaller/lower Wailord, a tidier spout, clearer colour legend, and no tiny name labels beneath moving Pokémon.
- All existing achievements and rare-event Settings controls remain in place.
- Release markers advanced to versionName 0.50.1 / versionCode 5001.

## Focused verification
PASS — 26/26 assertions across the five focused Dream World programs:
- `tests/v0490-ice-cream-scoop-core.test.cjs` — 6/6
- `tests/v0490-ice-cream-scoop-integration.test.cjs` — 3/3
- `tests/v0500-wailord-water-spout-core.test.cjs` — 7/7
- `tests/v0500-wailord-water-spout-integration.test.cjs` — 4/4
- `tests/v0501-dream-world-polish.test.cjs` — 6/6

PASS — syntax checks:
- `arcade-ice-cream-scoop-core.js`
- `arcade-ice-cream-scoop.js`
- `arcade-wailord-water-spout.js`
- `arcade-world.js`

PASS — offline asset integrity:
- 44 authentic scenes/sheets/crops
- 2,098 Arcade sprites
- 2,078 unretouched Arcade actors
- 8 local venue assets
- 829 Adventure images / 1,025 species registry checks
- 42 Fossil Museum assets
- 202 sleeve assets

## Full-suite / environment notes
`npm test` was attempted. It begins green, then cannot continue because the uploaded source snapshot does not contain its Playwright dependency (`Cannot find module 'playwright'`). An `npm ci` attempt could not complete in this environment because package-network access timed out.

A broader per-test sweep also surfaced two stale Adventure preservation assertions already failing in the untouched v0.50.0 baseline (`adventure3-preservation.test.cjs` and `adventure3-shared-functions.test.cjs`). Both failures were reproduced against a fresh extraction of v0.50.0 and are unrelated to this Dream World pass.

Android compilation was not claimed: this source bundle has no `gradlew`, and no system `gradle` executable is available here.

## Visual source notes
See `app/src/main/assets/arcade/dream-world/SOURCES.md`. The original Dream World art is loaded from HTTPS at runtime; the venue retains the bundled local SVG fallback and each game retains a readable colour/background fallback if the remote art cannot load.
