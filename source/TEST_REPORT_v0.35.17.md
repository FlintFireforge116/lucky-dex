# LuckyDex v0.35.17 Test Report

## Scope

Fix physical TCG trade valuation for cards that deliberately have no printed Common/Uncommon/Rare rarity symbol.

## Root cause

`card-rarity-v0253.js` classified explicit `No Rarity` as the internal `unknown` class. The canonical rarity tier table assigns `unknown` tier `1`, which is also the numeric tier used by Uncommon. `trade-v0163.js` then used that numeric tier for physical trades, so legitimate no-rarity products such as Dragon Vault and McDonald's Collection 2022 could be advertised as "Matched rarity trade · Uncommon".

A second data-flow issue was found while testing holo promotional prints: `normalizeTradeCard()` discarded finish metadata such as `_foil`, which could collapse a McDonald's Confetti Holo into the same trade class as a normal print.

## Fixes

- Dragon Vault cards 1–20 use exact trade class `tcg:dragon-vault-holo` and display `Dragon Vault Holofoil` in Trade.
- McDonald's mini-pack cards use `tcg:mcdonalds-promo`; when finish metadata marks a foil/confetti print they use `tcg:mcdonalds-confetti-holo`.
- Other explicit physical `No Rarity` cards fail closed into exact `tcg:no-rarity` / `tcg:no-rarity-holo` classes instead of inheriting Uncommon's numeric tier.
- `confetti` is recognized as a special-foil finish marker.
- Physical exact string trade classes are matched exactly by the market; string-vs-numeric mismatches can no longer render as matched rarity.
- Trade card normalization now preserves finish fields needed for value classification.
- Trade cards show useful product-aware labels (`Dragon Vault Holofoil`, `McDonald's Promo`, etc.) instead of raw `No Rarity` where a better product class is known.
- Trade market cache generation bumped to `v3517-physical-special-rarity`, invalidating stale v0.35.16 listings.

## Regression verification

- `tests/v03517-no-rarity-trade.test.cjs`: PASS after confirmed RED failure on v0.35.16 behavior.
- `tests/v03517-release.test.cjs`: PASS.
- v0.35.16 Pocket exact-rarity regressions: PASS.
- v0.35.13 Dragon Vault / McDonald's acquisition regressions: PASS.
- v0.35.15 booster-only / Dragon Vault reveal regressions: PASS.
- Existing Trade hourly / market semantics regressions: PASS.
- 231 non-browser test programs: PASS, 0 failed.
- 27 Playwright/browser programs skipped because Playwright is not installed in this environment.
- Offline asset integrity scripts: PASS for Arcade assets, venues, Adventure assets and Fossil Museum assets.

## Build limitations

Android/Gradle APK compilation is not available locally in this environment. GitHub Actions remains the APK build verification step.
