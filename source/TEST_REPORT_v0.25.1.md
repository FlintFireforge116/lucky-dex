# LuckyDex v0.25.1 Test Report

## New regression contract
`node tests/v0251-fossil-museum-polish.test.cjs`

Result: **PASS**.

The test was first observed failing against v0.25.0 on the translucent depth-3 rock layer, then passed after the v0.25.1 implementation. It covers:
- opaque rock at depths 4/3/2;
- controlled final chipped reveal at depth 1;
- in-app End Dig controls and manual finish state;
- absence of browser `confirm()`;
- larger museum presentation and corrected room asset;
- Android/package version 0.25.1 / 251.

## Full local regression matrix
The repository-wide runner was attempted with `npm test`. It stopped at the first legacy browser-only test because `playwright` is not installed in this extracted workspace.

Every `.cjs` test was therefore executed individually. Results:
- **38 test programs passed**.
- **0 runnable test programs failed**.
- **15 Playwright-dependent browser/device programs were skipped only because the `playwright` module is unavailable locally**:
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

## Offline asset verification
All four asset checks passed:
- authentic Arcade assets: 44 scenes/sheets/crops;
- venue assets: 8 verified;
- Adventure assets: 829 images / 1,025 species;
- Fossil Museum 0.25.1 assets: 42 images.

## Syntax/signing checks
- `arcade-fossil-museum.js`: `node --check` PASS.
- `arcade-fossil-museum-core.js`: `node --check` PASS.
- Permanent keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
- Certificate SHA-256 fingerprint: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`.

Browser/device verification remains delegated to the normal GitHub Actions environment where Playwright dependencies are installed.
