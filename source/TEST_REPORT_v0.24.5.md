# LuckyDex v0.24.5 Test Report

## Scope
- Style-aware pull impact hierarchy.
- Rainbow Rare now uses a stronger prismatic Tier 5 reveal.
- Hyper Rare / Gold Rare / Crown Rare use the strongest Tier 6 gold jackpot reveal.
- Promo-only series are removed from the normal physical booster catalogue and retained in a separate Promo Vault.
- Promo Vault supports individual Card Dust purchases and exposes a grant path for future achievement rewards.
- Physical booster size scales by set size: <=40 = 4, 41-70 = 6, 71-100 = 8, >100 = 10 cards.
- Pocket 4/5-card formats remain unchanged.
- Android update identity preserved; version advanced to versionCode 245 / versionName 0.24.5.

## Fresh verification
- JavaScript syntax checks: PASS (`pack-opening-v0160.js`, `pack-flow-v0165.js`, `app-v0167.js`).
- Non-Playwright test programs: 23 PASS / 0 FAIL.
- Playwright-dependent test programs: 16 NOT RUN in this extracted environment because Playwright is not installed.
- Offline authentic Arcade asset integrity: PASS.
- Venue asset integrity: PASS.
- Adventure asset integrity: PASS.
- Permanent signer regression test: PASS.
- Canonical keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.

## Update compatibility
- `applicationId`: unchanged (`com.example.luckydex`).
- Canonical `app/luckydex-dev.keystore`: unchanged.
- `versionCode`: 245 (was 244).
- `versionName`: 0.24.5 (was 0.24.4).

A phone already running a LuckyDex build signed with the canonical signer can install the v0.24.5 APK as an update rather than uninstall/reinstalling.
