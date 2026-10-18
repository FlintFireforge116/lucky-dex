# LuckyDex v0.35.7 Test Report

## Scope
Hoop Hurl presentation/start-flow polish and selectable difficulty modes.

### Implemented
- Hoop Hurl now opens in an idle pre-start state; the timer does not run until START is pressed.
- Added EASY / NORMAL / HARD selection, defaulting to NORMAL.
- Difficulty profiles:
  - Easy: 75 seconds, 1.35x target lifetime, medal thresholds 15 / 28 / 45 / 65.
  - Normal: 60 seconds, existing target timing, medal thresholds 20 / 35 / 55 / 80.
  - Hard: 50 seconds, 0.72x target lifetime, medal thresholds 24 / 42 / 65 / 95.
- Replay returns to the ready screen so difficulty can be changed before the next round.
- Hoop Hurl stage now flexes to fill the Arcade game surface instead of ending at its content height.
- Lower area is a framed Kids Club control panel with title, difficulty selector, score key and START button.
- Existing slingshot input mapping and Android touch-ownership fix were left unchanged.
- Existing target scoring/tuning remains: Diglett +1, Dugtrio +3, shiny Diglett +5, shiny Dugtrio +10; targets can still disappear mid-flight.

## Verification

### TDD / focused Hoop Hurl checks
- `tests/v0357-ekans-presentation-difficulty.test.cjs` — PASS after an initial RED failure before implementation.
- `tests/v0357-ekans-start-ui.test.cjs` — PASS.
- All Hoop Hurl regressions v0.35.0 through v0.35.7 — PASS, except the browser QA test which self-skips without Playwright.

### Full test suite
`npm test` was attempted. It stops at `adventure-core.test.cjs` because the extracted workspace does not contain the declared Playwright package (`MODULE_NOT_FOUND: playwright`). No claim is made that the Playwright/browser suite passed.

All test programs not dependent on Playwright/recovery-browser were run individually:
- PASS: 211
- FAIL: 0
- SKIPPED as Playwright/browser-dependent: 21

### Asset integrity
- `python3 scripts/fetch_arcade_v0200_assets.py --check` — PASS (44 authentic scenes/sheets/crops, 2098 offline Arcade sprites, 2078 unretouched actors).
- `python3 scripts/verify_v0223_venues.py` — PASS (8 pre-existing venue assets).
- `python3 scripts/verify_adventure_assets.py` — PASS (829 images, 1025 species, no errors).
- `python3 scripts/verify_fossil_museum_v0250_assets.py` — PASS (42 images).

### Release identity
- applicationId: `com.example.luckydex` (unchanged)
- versionCode: `357`
- versionName: `0.35.7`
- package/package-lock/app build marker: `0.35.7`

## Environment limitations
- No `./gradlew` exists in this extracted source bundle, so an Android Gradle build was not run.
- Playwright is declared but not installed in this workspace, so browser automation was not run.
- A direct system-Chromium screenshot attempt timed out in this container due its D-Bus/browser environment; no browser visual-pass claim is made.
