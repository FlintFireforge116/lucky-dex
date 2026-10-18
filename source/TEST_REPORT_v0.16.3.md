# Lucky Dex v0.16.3 test report

## Fixes covered

- Physical TCG artwork fallback across pack reveal, collection/card modal and Trade.
- Exact set-code/set-ID preference for alternate physical artwork matching.
- Berry Blender timing marker generated from the same scoring constants and blender-as-input control.
- Trade page scrolling/mobile layout and commit-before-animation transaction flow.

## Checks run

- `node --check` passed for every JavaScript asset in `app/src/main/assets`.
- All local `src` / `href` references in `index.html` resolve to files in the asset bundle.
- Deterministic physical-art helper returns the confirmed MEP Paradise Resort path:
  `.../tpci/MEP/MEP_092_R_EN.png`.
- Regression check confirms MEP Black Star Promos no longer fuzzy-matches SVP Black Star Promos when an MEP row is missing from the alternate catalogue.
- Trade CSS now computes from the internal-scroll selector rather than the prior `overflow:hidden` page rule.
- Trade source verifies `save()` happens before the exchange animation is awaited and accept controls lock during the transaction.
- Berry timing geometry resolves to GOOD start 281.25°, sweep 67.5°; BEST start 309.375°, sweep 11.25°, matching the player-0 scoring window.

## Build note

The source tree is versioned as Android `0.16.3` / versionCode `163`. The GitHub Actions workflow now names the output `LuckyDex-v0.16.3-debug.apk`. A local APK was not produced in this environment because the Android SDK/Gradle toolchain is not installed here; the repository workflow remains configured to build it with Gradle 8.9 and Java 17.
