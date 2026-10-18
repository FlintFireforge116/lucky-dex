# LuckyDex v0.27.3 Test Report

## Scope

Poké Ball Drop phone-fit adjustment only: scale the whole cabinet slightly smaller so the full bottom prize row is visible without changing internal game geometry.

## Targeted verification

- `tests/v0273-ball-drop-fit.test.cjs` — PASS. Requires 94% centered phone cabinet, unchanged 720/1140 aspect ratio and unchanged 13-row production geometry.
- `tests/v0273-release.test.cjs` — PASS. Requires versionCode 273 / versionName 0.27.3 and matching package/runtime/UI versions.
- `tests/v0272-release.test.cjs` updated to remain a v0.27.2+ non-regression baseline.

## Project regression verification

- Non-browser sweep: **92 passed, 15 skipped for missing Playwright, 0 failed**.
- `node --check app/src/main/assets/arcade-ball-drop.js` — PASS.
- Offline Arcade asset audit — PASS: 44 authentic scenes/sheets/crops, 2,098 Arcade sprites, 2,078 actor assets.
- Venue audit — PASS: 8 local venue assets.
- Adventure asset audit — PASS: 829 images / 1,025 species.
- Fossil Museum asset audit — PASS: 42 images.

## Environment-limited checks

- Full `npm test` still stops at the first Playwright-dependent test because Playwright is not installed in this container. All test programs that do not require Playwright were run individually in the non-browser sweep.
- No Gradle wrapper/system Gradle is available here, so Android compilation remains the GitHub Actions build check.

## Release identity

- `applicationId 'com.example.luckydex'` unchanged.
- `versionCode 273`; `versionName '0.27.3'`.
- package/package-lock/runtime marker/visible UI version all match `0.27.3`.
