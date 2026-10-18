# Lucky Dex v0.16.8 Test Report

## Scope
- Random wider Link Trade market + five featured default listings
- Themed in-app trade confirmation
- Pokéball Drop circular physics / rotation / scoring refinement
- Unown Decoder Easy/Hard + word-aware glyph layout
- Safari Zone removed from Arcade navigation

## Validation completed
- JavaScript syntax: PASS across all 12 asset JS files (`node --check`).
- HTML IDs: PASS — 251 IDs / 251 unique / 0 duplicates.
- v0.16.8 static DOM references: PASS — all 17 explicit `getElementById()` targets exist.
- Dynamic trade-confirmation IDs: PASS — modal, trainer, send/receive, warning and accept targets are defined by the injected LuckyDex dialog.
- Trade acceptance contains no browser/WebView `confirm()` call.
- Marketplace migration: `MARKET_VERSION` invalidates old v0.16.7 cached boards.
- Marketplace configuration: 15 current listings, 5 featured by default; filters/search operate across the wider pool.
- Marketplace generation samples both offer and request cards from discovered sets independently of ownership.
- Safari picker entry: absent.
- Android metadata: versionCode 168 / versionName 0.16.8.
- Visible UI version: v0.16.8.

## Pokéball Drop changes verified statically
- Ball is rendered as a true circle with rotation angle.
- Pin collisions resolve a normal bounce plus tangential friction/angular impulse.
- Pin impacts contribute a capped score bonus.
- Seven explicit landing values are displayed: 150 / 250 / 400 / 1000 / 400 / 250 / 150.
- Landing result shows slot score + pin bonus + hit count.
- The physical ball remains visibly resting in its slot for 1.25 s (1.55 s jackpot) before reset.

## Unown Decoder changes verified statically
- Easy: hints on, 14 s, 4 choices.
- Hard: hints off, 8 s, 6 choices.
- Glyph rendering splits on real spaces only; each individual word is a single non-wrapping grid row, so DRAGONITE cannot split while MASTER BALL may use two word rows.

## Compatibility
- Existing collection/save data is preserved.
- Only trade-board cache is intentionally regenerated once because the marketplace model changed.
- Hidden Safari DOM remains for compatibility with the loaded v0.16.7 module, but it is not exposed as an Arcade game.
- Battle / future roguelite code is untouched.

## Remaining build check
The repository GitHub Actions APK build remains the authoritative Android/Gradle compile after replacing the root `LuckyDex_source.zip`.
