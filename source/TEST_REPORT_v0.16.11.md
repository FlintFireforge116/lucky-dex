# LuckyDex v0.16.11 test report

## Scope

Quick combined patch on top of unreleased v0.16.10 stable signing.

## Fixes

- Received Link Trade card no longer ends mirrored/reversed from Android WebView 3D transform behaviour.
- Trade animation slowed and result held longer.
- Initial Trade page and all browser tabs now share/await the same asynchronous market build.
- Catalogue warm-up no longer requires a filter click to reveal completed listings.
- Stable signing from v0.16.10 retained.

## Static validation

- 12/12 JavaScript files passed `node --check`.
- 256 HTML IDs / 256 unique / 0 duplicate IDs.
- `versionCode 171`, `versionName 0.16.11`.
- No `tradeReceiveFlip` or `rotateY(540deg)` remains.
- New front-face swap uses edge-on `scaleX(.035)` and settles with `transform:none`.
- Trade board uses key-scoped `tradeBuildPromises` and market controls call `renderTradeBoard(false)`.
- Bundled LuckyDex development keystore validated with `keytool`.
- APK compile remains delegated to the existing GitHub Actions Android build.
