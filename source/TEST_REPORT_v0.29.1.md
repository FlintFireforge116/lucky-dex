# LuckyDex v0.29.1 — God Pack Test Build Verification

## Release identity
- `applicationId`: `com.example.luckydex` (unchanged)
- `versionCode`: `292`
- `versionName`: `0.29.1`
- package / package-lock versions: `0.29.1`
- permanent LuckyDex signer configuration remains present.

## God Pack contract
- Production odds are centralized as `1 / 1000` in `god-pack-v0291.js`.
- `FORCE_TEST_GOD_PACK=true` is deliberate in **this validation build**, making normal Pack Shop openings 100% God Pack.
- God Pack is rolled before the existing ~1/2,000 Lucky Pack; God Pack suppresses the Lucky Pack roll.
- Stored/excavated sealed boosters explicitly use `godPack:false`.
- TCG, TCG Pocket and offline cached pack construction all support God Pack mode.
- God Pack targets only the selected set's highest available rarity pool. Modern chase pools guarantee at least two ceiling-tier targets when the set supports them; classic sets use their real highest rarity.
- Existing per-card reveal cinematics remain active.
- Added sealed-pack omen, full-screen GOD PACK intro, stronger haptics, persistent charged effects, GOD PACK COMPLETE summary, lifetime `stats.godPacks`, and Rare Hits event recording.
- Existing guarded `commitPreparedPack()` remains the exactly-once economy/save authority.

## Fresh verification
- JS syntax checks passed for:
  - `god-pack-v0291.js`
  - `pack-flow-v0165.js`
  - `app-v0167.js`
- New tests passed:
  - `tests/v0291-god-pack.test.cjs`
  - `tests/v0291-release.test.cjs`
- Existing targeted regressions passed for card rarity, pack UX, sealed boosters, and Pokémon Dash.
- Broader runnable source/static sweep: **126 passed / 0 failed** after excluding browser-only programs and confirmed pre-existing stale/failing guards listed below.

## Offline asset audits
- Booster artwork audit: PASS — 144/156 catalogue rows have real bundled packshots; remaining 12 are explicitly non-booster products.
- Arcade venue audit: PASS — 8 local venue assets verified.
- Adventure asset audit: PASS — 829 images / 1,025 species / 386 back sprites / 37 registry objects.
- Fossil Museum audit: PASS — 42 images verified.

## Environment / inherited caveats
- No Gradle wrapper or system Gradle is available in this extracted workspace, so an Android compile was not run here.
- Playwright is not installed, leaving **19 browser/recovery programs unavailable** in this container.
- The following failures were reproduced unchanged against the untouched v0.29.0 source and are not caused by v0.29.1:
  - `tests/v0223-ball-stalls.test.cjs` — existing Ball Drop stall case.
  - `tests/v0284-release.test.cjs` — stale exact `0.28.7` release assertion already incompatible with v0.29.0.
  - `tests/v0287-keyboard-overlay.test.cjs` — existing Unown answer-shell expected `52vh/520px` while the supplied source contains `45vh/420px`.

## Next release after user validation
Set only:

```js
const FORCE_TEST_GOD_PACK=false;
```

Leave `PRODUCTION_DENOMINATOR=1000` unchanged to restore the requested real 1/1,000 rate.
