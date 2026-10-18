# LuckyDex v0.25.2 Test Report

## New regression contract
`node tests/v0252-fossil-risk-landscape.test.cjs`

Result: **PASS**.

The contract was first observed failing against the old implementation, then passed after the v0.25.2 changes. It covers:
- 60% cave-in loss and the 2+ find survivor safeguard;
- exact larger excavation footprints for the classic fossils, Odd Keystone and Star Piece;
- use of the v0.25.2 mining-art set;
- delayed/unbanked reward routing and explicit cave-in losses;
- museum-only landscape + portrait restoration hooks;
- case-based museum placement using only genuine display furniture;
- valid Android orientation bridge/config-change wiring;
- current museum room/header asset references;
- Android/package version 0.25.2 / 252.

## Full local regression matrix
The project command `npm test` was run. It stops when the first browser-only test imports `playwright`, because this extracted source workspace does not contain a complete Playwright installation.

All 54 `.cjs` programs were therefore executed individually. Results:
- **39 test programs passed**.
- **0 runnable test programs failed**.
- **15 Playwright-dependent browser/device programs were skipped only because the Playwright module is unavailable locally**:
  - adventure-core.test.cjs
  - adventure-file-origin.test.cjs
  - adventure-lifecycle.test.cjs
  - adventure-persistence.test.cjs
  - adventure-runtime.test.cjs
  - amie-recovery.test.cjs
  - recovery-layout.cjs
  - recovery-lifecycle.cjs
  - recovery-navigation.cjs
  - recovery-runtime.cjs
  - recovery-trade-refresh.cjs
  - recovery-transactions.cjs
  - v0223-ball-stalls.test.cjs
  - v0223-berry-touch.test.cjs
  - v0223-layout-grid.test.cjs

An attempt to restore the locked Playwright package with browser download disabled timed out in the container and did not yield a usable module, so those tests are not reported as executed.

## Offline asset verification
All active source-level asset integrity checks passed:
- authentic Arcade assets: **44 scenes/sheets/crops**, plus 2,098 offline Arcade sprites and 2,078 unretouched actors;
- venue assets: **8 verified**;
- Adventure assets: **829 images / 1,025 species**;
- Fossil Museum v0.25.2 manifest: **42 images verified**.

## Additional Fossil/Museum verification
- `arcade-fossil-museum-core.js`: `node --check` PASS.
- `arcade-fossil-museum.js`: `node --check` PASS.
- `app-v0167.js`: `node --check` PASS.
- 5,000 generated dig walls: minimum 3 finds, maximum 6 finds, **0 overlaps/out-of-bounds cells**.
- A full 30-exhibit museum mock was visually reviewed after the final case-model correction; exhibits sit on the genuine cases/pedestal and no third inner case is modelled.

## Signing / build environment
- Permanent keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
- Certificate SHA-256 fingerprint: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`.
- This extracted source has no Gradle wrapper/system Gradle, so an APK cannot be built locally. `scripts/verify-release.py` therefore cannot perform its APK-level check here and remains delegated to the existing GitHub Actions build.
