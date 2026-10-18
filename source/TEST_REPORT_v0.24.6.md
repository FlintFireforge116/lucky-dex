# LuckyDex v0.24.6 Test Report

## Scope
v0.24.6 adds card-level physical-TCG acquisition routing and curated achievement-card rewards while preserving existing collection IDs/counts and the permanent Android signing identity.

## Verified locally
- `node --test tests/v0246-promo-routing.test.cjs` — **3/3 subtests passed**.
- Full Node-only regression sweep — **24 test files passed, 0 failed**.
- Runtime JavaScript syntax checks passed for:
  - `app/src/main/assets/card-acquisition-v0246.js`
  - `app/src/main/assets/app-v0167.js`
  - `app/src/main/assets/pack-flow-v0165.js`
- Release identity verified by regression test: **versionCode 246 / versionName 0.24.6**.
- Canonical signer remains `app/luckydex-dev.keystore`, SHA-256 `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.

## Acquisition regression coverage
- Ancient Mew => Achievement Reward only; not booster- or Dust-obtainable.
- Selected Victory Medal => Achievement Reward only.
- Ordinary dedicated promo cards => Promo Vault.
- Promo-rarity cards in generic sets => Promo Vault.
- Miscellaneous, Victory Medals, Poké Card Creator Pack, and World Collection => excluded from retail booster catalogue; non-achievement cards remain available via Promo Vault.
- Normal Base Set card => booster eligible.
- Achievement Reward binder group uses no misleading physical-set completion denominator.
- Both online/library and offline cached physical pack pools apply the booster eligibility policy.

## Environment limitation
10 browser/Playwright-dependent test files were not executed locally. The source ZIP did not include `node_modules`; `npm ci` could not complete in the execution environment. No local Gradle executable/wrapper is present, so Android compilation was not attempted here. GitHub Actions remains the authoritative browser/Android build check for this source package.
