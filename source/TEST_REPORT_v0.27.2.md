# LuckyDex v0.27.2 Test Report

## Scope

Poké Ball Drop real-device polish: direct touch aiming, smaller main ball, persistent/randomized run power-ups, cabinet crop adjustment, neon presentation, split event log/toasts, and release identity.

## Ball Drop-specific verification

- `tests/v0272-ball-drop-polish.test.cjs` — PASS. Covers radius 26 vs Rain radius 18, 720×1140 geometry, aim clamping, randomized clear-pocket pickup placement, per-run pickup persistence/collected state, and five-entry log/toast capping.
- `tests/v0272-ball-drop-ui.test.cjs` — PASS. Covers slider removal, direct pointer aiming contract, persistent log above the board, temporary toast overlay, 720×1140 CSS aspect ratio, `touch-action: pan-y`, and v0.27.2 runtime ownership export.
- `tests/v0271-ball-drop-chaos.test.cjs` — PASS. v0.27.1 reward odds, special pins, Rain eligibility and reward-upgrade mechanics remain intact.
- `tests/arcade-ball-drop.test.cjs` — PASS. Legacy award/idempotence compatibility remains intact.
- `tests/v0223-ball-stalls.test.cjs` Node simulation — PASS before browser section: forced wedge recovery passes; 264 seeded production RAF drops all reached valid slots; worst simulated landing time was 14.096 physics seconds; cancellation/re-entry remained clean.

## Project regression verification

- Non-browser sweep: **86 passed, 19 skipped for Playwright dependency, 0 failed**.
- `node --check app/src/main/assets/arcade-ball-drop.js` — PASS.
- `python3 scripts/fetch_arcade_v0200_assets.py --check` — PASS: 44 authentic scenes/sheets/crops, 2,098 Arcade sprites and 2,078 actor assets.
- `python3 scripts/verify_v0223_venues.py` — PASS: 8 venue assets.
- `python3 scripts/verify_adventure_assets.py` — PASS: 829 images / 1,025 species.
- `python3 scripts/verify_fossil_museum_v0250_assets.py` — PASS: 42 images.

## Environment-limited checks

- Full `npm test` stops when the first Playwright-dependent test imports `playwright`; the dependency is not installed in this container. The non-browser sweep above runs every test program that does not require that dependency.
- The browser continuation of `v0223-ball-stalls.test.cjs` is likewise unavailable for the same reason after its Node physics section passes.
- No Gradle wrapper is bundled and no system `gradle` binary is available, so Android compilation remains the GitHub Actions build check.

## Release identity

- `applicationId 'com.example.luckydex'` unchanged.
- `versionCode 272`; `versionName '0.27.2'`.
- package/package-lock/runtime build marker/visible UI version are all `0.27.2`.
- Permanent signing configuration and existing save identity remain unchanged.
