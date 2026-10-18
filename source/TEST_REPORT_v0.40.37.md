# LuckyDex v0.40.37 Test Report

## Scope

- Reworked **Impact Trial — Defense** from the v0.40.36 DODGE / BRACE timing game into a distinct rapid **HARDEN** challenge.
- Preserved the Goldenrod Challenge Course presentation, caught-Pokémon Defense integration, Golden Hazard rare event, Settings test control, records, rewards and seven achievements.
- Kept the v0.40.36 **Gold Rock** numeric Settings-select fix intact.

## Impact Trial HARDEN redesign

- The player now taps or swipes rapidly through shield targets before each impact. More successful reactions build a higher **Harden %**, directly reducing incoming damage.
- Player execution remains the dominant factor. A perfect 100% Harden can negate the hit completely, while the selected Pokémon's normal **Defense** stat softens mistakes rather than replacing player skill.
- The five hazards deliberately use different interaction rhythms:
  - **Rolling Boulder** — readable burst pattern that teaches the mechanic.
  - **Tauros Charge** — short, violent rush immediately before impact.
  - **Rock Slide** — three falling lanes with a visual guard line, giving the intended rhythm-game feel without requiring music.
  - **Falling Weight** — smaller precision targets where accuracy matters more.
  - **Final Barrage** — increasingly frantic multi-wave Harden sequence.
- Difficulty changes reaction time, target quantity and target size rather than simply inflating damage.
- A segmented Harden gauge and escalating feedback grades run from **CRUSHED** through **IMPENETRABLE**.
- Touch controls support both individual taps and continuous swiping through targets; Space / Enter remains available as a keyboard fallback.
- Non-lane target spawn space is kept below the HUD/cue area so targets remain tappable on mobile.

## Golden Hazard

- Vanilla chance remains **2% per run**, with Settings controls for Off / Vanilla 2% / Test 25% / Always 100%.
- A Golden Hazard mixes gold shield targets into its Harden sequence.
- The rare reward only clears if the player hits the required number of gold shields **and survives the impact**.
- Reward claiming continues to use LuckyDex's existing guarded rare-arcade reward path.

## Records and achievements

Impact Trial now records Harden-specific performance, including:

- Best Harden %
- Perfect Hardens
- Shield targets hit / seen and accuracy
- Golden Hazards cleared

The existing seven Impact Trial achievements remain, so the game continues to ship with achievements. The perfect-play achievement is now **Impenetrable Form** and requires three perfect Hardens in one run. **Golden Guard** remains the hidden rare-event achievement.

## Version

- `package.json`: 0.40.37
- Android `versionCode`: 4037
- Android `versionName`: 0.40.37
- In-app build identity / footer: v0.40.37

## Fresh verification

### Impact Trial

- `node --test tests/v0436-impact-trial.test.cjs tests/v0437-impact-harden.test.cjs`
  - **19/19 passing**
  - Covers Gold Rock select binding, Defense-vs-skill balance, five Harden patterns, spatial target plans, HUD-safe target placement, Golden Hazard requirements, tap/swipe UI, records, achievements and release identity.

### Goldenrod Challenge Course regressions

- `node --test tests/v0431-power-trial.test.cjs tests/v0433-power-trial-ui.test.cjs tests/v0434-power-trial-polish.test.cjs tests/v0435-power-trial-dome.test.cjs`
  - **24/24 passing**

### Persistence / records / achievements / save compatibility

- Focused platform, migration, achievement and Arcade-record regression group:
  - **23/23 passing**
  - The records-registry test intentionally exercises and logs a handled simulated `disk full` save failure; the test itself passes.

### JavaScript syntax

`node --check` passes for all modified runtime JavaScript files:

- `arcade-impact-trial-core.js`
- `arcade-impact-trial.js`
- `arcade-platform.js`
- `arcade-records.js`
- `achievements-v0341.js`
- `arcade-session.js`
- `app-v0167.js`

### Offline asset integrity

- Arcade scenes/sheets/crops: **44** pass checksum/encoding validation.
- Arcade sprites: **2,098** pass.
- Arcade actor sprites: **2,078** pass.
- Venue assets: **8** pass.
- Adventure assets: **829 images / 1,025 species / 37 registry objects** pass.
- Fossil Museum assets: **42 images** pass.

## Known environment / baseline limitations

The project-level `npm test` command was run. Its first three test files completed successfully (**46 tests passed**) before `adventure-core.test.cjs` stopped because this container does not have the declared Playwright module installed (`Cannot find module 'playwright'`). Browser-based historical suites therefore cannot be executed here without that dependency.

`tests/adventure3-preservation.test.cjs` also still reports the pre-existing stale checksum for `app/src/main/assets/arcade/kids-club/SOURCES.md`:

- actual: `265e7b169ca76365e08f8333d3ba9dda51b6750822d098120b767462c5edcbd6`
- expected: `34901cd4f05116e17bd164b031638782700d361b3159ad29a23896341859b18d`

That preservation mismatch predates this Impact Trial redesign and the file was not changed as part of v0.40.37.
