# LuckyDex v0.24.8 Test Report

## Scope
- Promo Dust economy now uses shared quality bands.
- Promo Vault purchase cost and Dust Exchange salvage value share the same classifier.
- Achievement-only promo buckets are hidden from Promo Vault / Trade set lists.
- Empty promo series self-remove after hydration if they contain no purchasable cards.
- Android update identity remains stable at versionCode 248 / versionName 0.24.8.

## Promo economy
| Promo band | Examples | Purchase | Salvage per spare |
| --- | --- | ---: | ---: |
| Standard | basic Pikachu / Popplio-style promos | 350 Dust | 100 Dust |
| Enhanced | EX, GX, V, BREAK, Lv.X | 600 Dust | 175 Dust |
| Elite | VMAX, VSTAR, V-UNION, TAG TEAM, Radiant, Shining | 900 Dust | 275 Dust |
| Premium | Gold, Hyper Rare, Rainbow, Special Illustration, Secret Rare, Crown | 1300 Dust | 450 Dust |

Every promo salvage value is below its purchase cost. Achievement Reward cards remain non-convertible.

## Verification
- New `tests/v0248-promo-economy-filter.test.cjs`: PASS.
- Historical v0.24.5 / v0.24.6 / v0.24.7 promo and trade contracts: PASS.
- 26 non-browser Node regression programs: PASS, 0 failures.
- 16 Playwright-dependent browser/device tests: not run locally because Playwright is not installed in the extracted source environment.
- Arcade asset integrity: PASS.
- v0.22.3 venue integrity: PASS.
- Adventure asset integrity: PASS.
- Modified runtime JavaScript syntax checks: PASS.
- Canonical signing keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
