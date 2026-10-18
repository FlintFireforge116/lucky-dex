# LuckyDex v0.25.0 Test Report

## Scope
- Underground-style Fossil Dig core and phone UI.
- Persistent Oreburgh Mining Museum state and display room.
- Fossil/relic/treasure/inventory/card reward routing.
- Save migration and old Fossil-owner retirement.
- Oreburgh two-activity navigation.
- Offline asset integrity and release/signing identity.

## Fresh final verification

### Full project command
`npm test` was run on the final tree. It stops when `adventure-core.test.cjs` loads `scripts/recovery-browser.cjs` because the extracted source environment does not contain the declared Playwright package:

`Error: Cannot find module 'playwright'`

This is an environment/dependency stop, not a LuckyDex assertion failure. Per the release plan, every `.cjs` test was then run individually so dependency-bound browser tests could be separated from runnable tests.

### Node regression matrix
- **37 test programs passed**.
- **0 runnable test failures**.
- **15 Playwright-dependent programs skipped** because `playwright` is not installed locally.

The v0.25.0 tests that passed include:
- `v0250-fossil-assets.test.cjs`
- `v0250-fossil-core.test.cjs`
- `v0250-fossil-rewards.test.cjs`
- `v0250-save-migration.test.cjs`
- `v0250-oreburgh-navigation.test.cjs`
- `v0250-release.test.cjs`
- `v0250-final-review.test.cjs`
- `v0250-fossil-browser.test.cjs` static/browser fallback
- `v0250-fossil-routing-browser.test.cjs` static/browser fallback
- `v0250-museum-browser.test.cjs` static/browser fallback
- updated `v0223-fossil.test.cjs` compatibility fallback

Dependency-bound tests not run in real browser mode locally:
- `adventure-core.test.cjs`
- `adventure-file-origin.test.cjs`
- `adventure-lifecycle.test.cjs`
- `adventure-persistence.test.cjs`
- `adventure-runtime.test.cjs`
- `amie-recovery.test.cjs`
- `recovery-layout.cjs`
- `recovery-lifecycle.cjs`
- `recovery-navigation.cjs`
- `recovery-runtime.cjs`
- `recovery-trade-refresh.cjs`
- `recovery-transactions.cjs`
- `v0223-ball-stalls.test.cjs`
- `v0223-berry-touch.test.cjs`
- `v0223-layout-grid.test.cjs`

GitHub Actions remains the environment for the full installed Playwright/device run.

### Offline asset verification
All passed:
- `python3 scripts/fetch_arcade_v0200_assets.py --check`
  - 44 authentic scenes/sheets/crops verified
  - 2,098 offline Arcade sprites verified
  - 2,078 unretouched Arcade actors verified
- `python3 scripts/verify_v0223_venues.py`
  - 8 venue assets verified
- `python3 scripts/verify_adventure_assets.py`
  - 829 images / 1,025 species / 386 back-sprite species verified
- `python3 scripts/verify_fossil_museum_v0250_assets.py`
  - 42 Fossil Museum images verified

### JavaScript syntax
`node --check` passed for:
- `arcade-fossil-museum-core.js`
- `arcade-fossil-museum.js`
- `arcade-world.js`
- `arcade-classics.js`
- `arcade-session.js`
- `app-v0167.js`

### Signing identity
- Existing signing regression: PASS.
- `app/luckydex-dev.keystore` SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`
- Certificate SHA-256: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`
- `applicationId`: `com.example.luckydex`
- `versionCode`: `250`
- `versionName`: `0.25.0`

## Review mode
No subagent/reviewer tool was available in this harness, so the required final review was performed as an author self-review. That review found three visual issues and they were fixed with a new RED→GREEN regression (`v0250-final-review.test.cjs`) before the final verification run.
