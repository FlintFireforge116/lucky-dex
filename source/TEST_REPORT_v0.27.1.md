# LuckyDex v0.27.1 Test Report

## Scope

Poké Ball Drop chaos-machine overhaul and update identity.

## Ball Drop-specific verification

- `tests/v0271-ball-drop-chaos.test.cjs` — PASS. Covers 13-row geometry, special pins, paired Teleport, random Card/Booster prize targets, Mystery odds, reward upgrades, +1 Ball, Lucky Egg, Master Boost, Poké Ball Rain and full rain-ball reward eligibility.
- `tests/v0271-ball-drop-ui.test.cjs` — PASS. Covers 720×1180 cabinet, dynamic extra-ball denominator, coin metric, event feed and phone-first aspect ratio.
- `tests/arcade-ball-drop.test.cjs` — PASS. Legacy three-ball/idempotent award compatibility remains intact.
- `tests/v0223-ball-stalls.test.cjs` Node simulation — PASS before browser section: 264 seeded production-physics drops across 11 aim positions all reached a real slot; cancellation/reentry remained clean. The browser continuation of this test is unavailable because Playwright is not installed.

## Project regression verification

- Non-browser test sweep: **83 passed, 19 skipped for Playwright dependency, 0 failed**.
- `node --check app/src/main/assets/arcade-ball-drop.js` — PASS.
- `python3 scripts/fetch_arcade_v0200_assets.py --check` — PASS: 44 authentic scenes/sheets/crops, 2,098 sprites and 2,078 actor assets.
- `python3 scripts/verify_v0223_venues.py` — PASS: 8 venue assets.
- `python3 scripts/verify_adventure_assets.py` — PASS: 829 images / 1,025 species.
- `python3 scripts/verify_fossil_museum_v0250_assets.py` — PASS: 42 images.

## Environment-limited checks

- `npm test` starts normally but stops when `adventure-core.test.cjs` requires Playwright. `npm ci --ignore-scripts` stalled in this container and did not provide a usable Playwright installation.
- No Gradle wrapper is bundled and no system `gradle` binary is installed, so Android compilation cannot be performed in this container. GitHub Actions remains the authoritative APK build check.

## Release identity

- `applicationId 'com.example.luckydex'` unchanged.
- `versionCode 271`; `versionName '0.27.1'`.
- Runtime build marker and visible version are `0.27.1`.
- Permanent signing keystore/configuration unchanged; existing signing regression test passes.
