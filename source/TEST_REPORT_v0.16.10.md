# Lucky Dex v0.16.10 Test Report

## Scope
Quick-fix release for empty trade-board counts and persistent APK signing.

## Trade board
- Featured badge is no longer hardcoded to 5.
- FEATURED count = min(5, actual non-completed live listings).
- LIVE count renders numeric 0 when the market is empty rather than an ellipsis.
- Intro copy says "up to five featured" and explains that listings begin after a set is discovered.
- Marketplace state version bumped so stale v0.16.9 boards are not reused.

## APK signing
- Android metadata: versionCode 170 / versionName 0.16.10.
- Added bundled development keystore: app/luckydex-dev.keystore.
- app/build.gradle debug signing points at that keystore with a stable alias/password.
- Keystore alias `luckydex` validates successfully.
- Certificate SHA-256: 06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A.
- This certificate is intended for personal/testing builds only. It is intentionally bundled in source and is not appropriate for a public production release.
- v0.16.10 requires one final uninstall because previous GitHub debug builds used ephemeral runner certificates. Future builds using this bundled key should install as updates when versionCode increases.

## Static validation
- 12/12 JavaScript files pass `node --check`.
- 256 HTML IDs / 256 unique / 0 duplicates.
- New `tradeFeaturedCount` control exists.
- Hardcoded Featured=5 markup removed.
- Legacy `current.length || …` LIVE placeholder removed.
- Two trade IDs reported by static lookup (`tradeConfirmModal`, `tradeExchangeFx`) are intentionally runtime-created elements from the existing trade UI.
- Keystore passes `keytool -list` validation.
- Local Gradle is unavailable in this container; GitHub Actions remains the final Android compile/signing test.
