# LuckyDex v0.35.0 Test Report

## Feature under test

Pokémon Stadium / Kids Club venue with Ekans’ Hoop Hurl, using local Gen III Ekans/Diglett sprites and an existing locally bundled Gen III floor tile.

## Focused v0.35.0 checks

- `node tests/v0350-ekans-core.test.cjs` — PASS
- `node tests/v0350-ekans-integration.test.cjs` — PASS
- `node tests/v0350-ekans-runtime.test.cjs` — PASS
- `node tests/v0350-ekans-lifecycle.test.cjs` — PASS
- `node tests/v0350-release.test.cjs` — PASS
- `node tests/v0350-ekans-browser.test.cjs` — SKIPPED in this workspace because the declared Playwright dev dependency is not installed and network package installation is unavailable here.

The browser test remains in the source and exercises world routing, touch pull/release aiming, pointer-cancel recovery, fallback controls, rapid-throw target safety, console errors, and 360×800 / 320×640 layout when Playwright is installed.

## Regression suite

`npm test` was attempted. It stops at `tests/adventure-core.test.cjs` because `scripts/recovery-browser.cjs` requires the unavailable `playwright` package. This is an environment/dependency availability failure rather than a product assertion failure.

A complete pass over all test programs that do not import Playwright/recovery-browser completed with:

- 193 test programs passed
- 27 browser/Playwright-dependent programs skipped by the environment-only runner
- 0 assertion failures

Two legacy test expectations were made forward-compatible with later release versions:

- `tests/v0341-bugfix-achievements.test.cjs` now accepts any Android versionCode >= 341.
- `tests/v0347-release.test.cjs` now checks v0.34.7-or-later release compatibility rather than pinning the entire app to v0.34.7.
- `tests/arcade-session.test.cjs` now includes the new `ekansHoop` session rule.

## Offline asset integrity

- `python3 scripts/fetch_arcade_v0200_assets.py --check` — PASS (44 authentic scenes/sheets/crops; 2098 offline sprites; 2078 unretouched actors)
- `python3 scripts/verify_v0223_venues.py` — PASS
- `python3 scripts/verify_adventure_assets.py` — PASS (829 images, 1025 species)
- `python3 scripts/verify_fossil_museum_v0250_assets.py` — PASS (42 images)

Kids Club additions are local-only and documented in `app/src/main/assets/arcade/kids-club/SOURCES.md`.

## Android build

`./gradlew assembleDebug` could not run because the uploaded v0.34.7 source bundle contains no Gradle wrapper executable. Release identity was nevertheless verified statically:

- applicationId: `com.example.luckydex`
- versionCode: `350`
- versionName: `0.35.0`
- permanent signing configuration left unchanged

## Known verification limitation

A real-device/Playwright visual pass is still recommended after installing dependencies/building on the normal PC toolchain, especially for touch feel and final 320 px portrait composition. No browser or Android build success is claimed by this report.
