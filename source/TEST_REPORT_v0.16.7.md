# Lucky Dex v0.16.7 validation report

## Scope
v0.16.7 is a content/polish release on top of the tested v0.16.6 build. Battle code is intentionally untouched.

## Card Binder / Trade
- Card artwork tiles now use the physical 245:342 portrait ratio and `object-fit: contain`; the prior collection `cover` crop and Trade fixed-height override are superseded.
- Card Binder exposes visible All Cards / Spare Copies / Rare Hits shortcuts. The existing dropdown and per-set filter remain available.
- Spare Copies count is based on distinct cards with `count > 1`.
- Human-facing card labels reject URL/file/path/provider-like technical strings.
- Link Trade shows OWNED ×N on both offered and requested cards.
- Link Trade adds All Offers / Trades I Can Make / Use Spare Copies Only filters.
- Trade ownership lookup first uses exact ID, then only accepts a unique set+number+name/source legacy identity match; ambiguous matches are not guessed.

## Arcade polish
- Voltorb Flip hidden-tile centre pseudo-element now explicitly resets inherited height, removing the stretched vertical oval shown in the v0.16.6 screenshot.
- Who's That Pokémon? adds Super Hard and Endless.
- Super Hard: six choices, no hints, 4.2-second timer, transformed/cropped silhouette presentation.
- Endless: one miss ends the run; initial 9.0-second timer shrinks by 0.22 seconds per question to a 2.5-second floor, with persistent best streak and score.

## New games
- Poké Ball Drop: three-ball Celadon prize machine using Canvas peg collision/ball physics and seven prize slots.
- Unown Decoder: five timed Ruins of Alph messages with Unown-form artwork and a functional fallback glyph.
- Safari Zone: six encounters with Ball / Bait / Rock / Wait risk-reward decisions, Safari Ball count, catch/flee modifiers and persistent best score.

## Static validation
- `node --check` PASS: app-v0167.js
- `node --check` PASS: trade-v0163.js
- `node --check` PASS: arcade-expansion-v0166.js
- `node --check` PASS: quality-content-v0167.js
- `node --check` PASS: card-art-library-v0165.js
- HTML IDs: 246 total / 246 unique / 0 duplicates.
- v0.16.7 module getElementById references: 93 / 93 present.
- Every `data-game` picker has a corresponding `#<name>Game` panel.
- Quiz modes present: easy / normal / hard / super / endless.
- All local HTML script/style/image references resolve.
- Android metadata: versionCode 167 / versionName 0.16.7.
- MainActivity User-Agent updated to LuckyDex/0.16.7.

## Runtime/build limitation
The container does not have Gradle installed, so the Android APK itself cannot be compiled locally. The existing GitHub Actions `build-apk.yml` remains the final compiler/build gate after `LuckyDex_source.zip` is replaced in the repository.

A Chromium headless preview was attempted but the container Chromium process failed at the environment/DBus layer before producing DOM output. No runtime claim is based on that failed preview.
