# LuckyDex v0.24.7 Test Report

## Scope
- Promo Vault card search by name, collector number, or rarity.
- Manual duplicate-to-Dust conversion in Trade > Dust Exchange.
- Final binder copy is protected; only spare copies can be converted.
- 100 Dust -> 1 Pack Ticket moved from Packs into Dust Exchange.
- Promo cards use a dedicated trade rarity class and generated Promo trades only match Promo with Promo.
- Existing cached trade markets are invalidated with market version `v0247-single-market`.
- Android update identity preserved with versionCode 247 / versionName 0.24.7.

## Verification
- New v0.24.7 regression contract: PASS.
- Non-Playwright regression files: 25 PASS, 0 FAIL.
- JavaScript syntax checks for modified runtime files: PASS.
- Playwright-dependent files: 16 not run locally because `playwright` is not installed in this extracted source environment.
- Permanent signer SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3` (unchanged).
