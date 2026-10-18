# LuckyDex v0.35.1 Test Report

Date: 2026-10-10

## Release identity

- Android application ID preserved: `com.example.luckydex`
- `versionCode 351`
- `versionName '0.35.1'`
- package/build markers updated to `0.35.1`

## Ekans’ Hoop Hurl solo rework

v0.35.1 converts the first Kids Club game from four-player competition into a solo touchscreen score attack.

- CPU players and P2/P3/P4 score UI removed.
- Left/right, Near/Mid/Far and THROW buttons removed.
- Ekans is now the direct control: hold, drag horizontally to aim, pull down for distance, release to throw.
- Aim is continuous rather than snapped to three button-selected lanes/distances.
- 60-second score attack retained.
- Target values:
  - Diglett: 1 point
  - Dugtrio: 2 points
  - Shiny Diglett: 3 points
  - Shiny Dugtrio: 5 points
- Spawn distribution: 75% Diglett, 20% Dugtrio, 4% shiny Diglett, 1% shiny Dugtrio.
- Dugtrio targets duck away faster than Diglett targets.
- Streak bonus ramps from x1 to x1.25, x1.5 and x2; a miss resets the streak.
- Score reward tiers:
  - Participation: 0–19, 30 Lucky Coins
  - Bronze: 20–34, 60 Lucky Coins
  - Silver: 35–54, 100 Lucky Coins
  - Gold: 55–79, 160 Lucky Coins
  - Master: 80+, 250 Lucky Coins
- Persistent Ekans records now include best score, best streak, total hoops and shiny hits. The old `wins` field is preserved for save compatibility but is no longer modified.
- App-switch pause/resume and exactly-once completion/reward behaviour are retained.

## Asset policy

No AI-drawn Pokémon art was added. The game uses existing locally bundled Gen III actor sprites:

- Ekans: `arcade/sprites/actors/pokemon/23.png`
- Diglett: `arcade/sprites/actors/pokemon/50.png`
- Dugtrio: `arcade/sprites/actors/pokemon/51.png`
- Shiny Diglett: `arcade/sprites/actors/pokemon/shiny/50.png`
- Shiny Dugtrio: `arcade/sprites/actors/pokemon/shiny/51.png`
- Arena floor: existing locally bundled Emerald/Gen III floor tile.

## Verification

Focused v0.35.1 tests passed:

- `v0351-ekans-solo-core.test.cjs`
- `v0351-ekans-solo-integration.test.cjs`
- `v0351-ekans-solo-runtime.test.cjs`
- `v0351-ekans-solo-lifecycle.test.cjs`
- `v0351-release.test.cjs`

Historical v0.35.0 Ekans regression coverage was updated for the current solo contract and passes.

Full non-browser regression run:

- 198 test programs passed.
- Authentic Arcade scene/sprite checksum validation passed.
- Venue asset validation passed.
- Adventure asset validation passed: 829 images / 1025 species / 37 registry objects, zero errors.
- Fossil Museum asset validation passed: 42 images.

## Environment-limited checks

- Browser automation was not executed because the extracted source workspace does not contain the Playwright runtime dependency. The Ekans browser test remains in the suite and skips cleanly when Playwright is absent.
- Android compilation was not executed because this source bundle does not include a Gradle wrapper (`gradlew`).
