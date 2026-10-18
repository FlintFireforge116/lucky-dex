# Lucky Dex v0.16.4 regression report

## Reported regressions addressed

1. **Wrong card art attached to the right name** — removed v0.16.3's unverified `set code + local collector number` image guess. Pack artwork now resolves through an identity-matched set and card before an alternate image is accepted.
2. **30th Classic Collection mismatch** — the local subset ordering is no longer treated as the printed number from another catalogue. `Erika's Jigglypuff` resolves through the explicit Classic Collection bridge to `me55c-69`.
3. **McDonald's Collection 2023 missing art** — added a number+name verified 15-card bridge; `Sandaconda #10` resolves to `mcd23-10`.
4. **Previously cached wrong images** — v0.16.4 performs a one-time invalidation of v0.16.3 cross-catalogue artwork and uses a new `LuckyDexOfflinePackV164` IndexedDB namespace.
5. **Berry Blender target looked offset** — removed the floating text pill. GOOD and BEST arcs are generated from the scoring constants and the fixed notch is calculated from the exact GOOD-window midpoint (raw 32/256 -> visual 315°).

## Validation performed

- `node --check` passed for every JavaScript file under `app/src/main/assets`.
- Pack candidate order was inspected: exact PokémonTCG identity match -> exact Scrydex identity match -> identity-backed URLs -> TCGdex/native fallback. The old direct Limitless constructor is absent.
- Physical alternate-set matching is now strict: exact set ID, code, or normalized name is required; fuzzy token matching cannot attach artwork.
- Static identity regression checks confirm `Erika's Jigglypuff -> me55c-69` and `McDonald's Collection 2023 #10 + Sandaconda -> mcd23-10`.
- Berry target math regression confirms GOOD = 48/256 revolution, BEST = central 8/256, target midpoint = 32/256, rendered counter-clockwise at 315°.
- `index.html` references the v0.16.4 app, pack-flow and Berry assets; Android metadata is `versionCode 164` / `versionName 0.16.4`.
- APK compilation was not run in this container because the Android Gradle wrapper/SDK is not installed. The GitHub Actions workflow has been updated to emit `LuckyDex-v0.16.4-debug.apk`.
