# LuckyDex v0.24.0 Test Report

Date: 2026-10-05
Baseline: v0.23.2
Target: v0.24.0 / versionCode 240

## v0.24 targeted contracts

- `node tests/v024-trade-market.test.cjs` — PASS
- `node tests/v024-trade-ui.test.cjs` — PASS
- `node tests/v024-pack-browser.test.cjs` — PASS
- `node tests/v024-compat.test.cjs` — PASS

Trade market regression coverage also verifies:
- failed slot refreshes are throttled to a 15-second retry window rather than retried every countdown tick;
- a market snapshot is not persisted when an eligible Same/Across bucket has zero catalogue coverage, so a temporarily unavailable second set cannot lock Across Sets empty for four hours.

## Non-browser regression suite

17 non-browser `.cjs` programs pass, including Adventure model/battle, Arcade models, restore/update compatibility, v0.22 device contracts, and v0.23 Adventure polish.

Two historical release tests were generalized from exact v0.23.2 metadata to an update-compatible `versionCode >= 232` floor. The release-specific v0.24 compatibility test still pins `240` / `0.24.0` exactly.

## Syntax / structural integrity

- JavaScript syntax: 23 asset JS files checked, 0 failures.
- HTML IDs: 221 IDs, 0 duplicates.
- Adventure asset audit: PASS — 829 images, 1,025 species, 386 back sprites, 37 registry objects.
- Arcade venue audit: PASS — 8 local venue assets verified.

## Browser-dependent suite

`npm test` cannot complete in this extracted environment because the declared Playwright dev dependency is not installed. `npm ci --ignore-scripts` timed out in the environment. The first browser-dependent test fails at `require('playwright')` before app execution.

Browser-dependent programs therefore remain a CI gate for the GitHub build. No browser/device screenshot result is claimed in this report.

## Android / update identity

Verified from source:

- applicationId: `com.example.luckydex`
- versionCode: `240`
- versionName: `0.24.0`
- save key: `luckyDexSave`
- workflow still references `LUCKYDEX_KEYSTORE_BASE64`
- Gradle signing file contract remains `app/luckydex-dev.keystore`

No local APK build is claimed from this environment; GitHub Actions remains the authoritative APK/signing build.
