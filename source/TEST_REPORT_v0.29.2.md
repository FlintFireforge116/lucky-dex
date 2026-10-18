# LuckyDex v0.29.2 — God Pack Production Polish Verification

## Release identity
- `applicationId`: `com.example.luckydex` (unchanged)
- `versionCode`: `293`
- `versionName`: `0.29.2`
- package / package-lock versions: `0.29.2`
- permanent LuckyDex signer configuration remains present.

## God Pack / Lucky Pack contract
- God Pack production odds remain centralized at **1/1,000** in `god-pack-v0291.js`.
- `FORCE_TEST_GOD_PACK=false`; the temporary 100% validation override is disabled.
- Lucky Pack is now **1/500**, and only rolls when God Pack did not trigger.
- The full-screen God Pack intro contains only **GOD PACK**; `IMPOSSIBLE LUCK` and `EVERY CARD IS A HIT` were removed.
- `GOD PACK COMPLETE` remains on the completion summary.
- God Pack generation, top-rarity targeting, persistent charged effects, haptics, per-card rarity reveals, stats, and rare-hit recording are otherwise unchanged from v0.29.1.
- Stored/excavated sealed boosters remain excluded from God Pack conversion.

## Fresh verification
- RED→GREEN tests added for the v0.29.2 God/Lucky odds and copy contract and for release identity.
- JS syntax checks passed for `god-pack-v0291.js`, `pack-flow-v0165.js`, and `app-v0167.js`.
- Pack/card/sealed-booster targeted regressions all passed.
- Broad direct Node sweep: **133 passed / 17 non-passing out of 150 test programs**.
- Of the 17 non-passing programs, 14 require Playwright/recovery-browser support that is not installed in this extracted workspace.
- The remaining 3 are inherited known failures: `v0223-ball-stalls.test.cjs`, stale `v0284-release.test.cjs`, and `v0287-keyboard-overlay.test.cjs`.

## Offline asset audits
- Booster artwork audit: PASS — 144/156 catalogue rows have real bundled packshots; remaining 12 are explicitly non-booster products.
- Arcade asset validation: PASS — 44 authentic scenes/sheets/crops, 2,098 offline sprites, and 2,078 actors validated.
- Arcade venue audit: PASS.
- Adventure asset audit: PASS — 1,025 species / 386 back sprites / 37 registry objects, no errors.
- Fossil Museum audit: PASS — 42 images verified.

## Environment caveat
- No Gradle wrapper or system Gradle is available in this extracted workspace, so an Android compile was not run here.
