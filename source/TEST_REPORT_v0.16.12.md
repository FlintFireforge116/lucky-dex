# LuckyDex v0.16.12 test report

## Scope
Trade-mode semantics, Link Trade animation logic, visible version label, and retention of stable APK signing.

## Fixes
- `SAME SET` now strictly requires offer + request to resolve to the same discovered set.
- `ACROSS SETS` now strictly requires genuinely different discovered sets and never falls back to the request set.
- Across Sets returns no listings when fewer than two sets are discovered, with explanatory empty-state copy.
- Trade market version bumped so stale v0.16.10/v0.16.11 boards are regenerated.
- Trade exchange animation now follows a literal sequence: both fronts visible -> both LuckyDex backs -> face-down exchange -> received back -> received front.
- Face changes happen only while the card is visually edge-on; no 180/360/540-degree resting transform is used.
- Trade animation timing is slower and the final received card is held for 1.9 seconds.
- Visible app labels updated to v0.16.12.
- Android metadata updated to `versionCode 172`, `versionName 0.16.12`.
- Existing bundled LuckyDex development signing key retained unchanged.

## Static validation
- All 12 JavaScript files pass `node --check`.
- 256 HTML IDs, all unique.
- No missing local assets referenced by `index.html`.
- Old permissive Across Sets fallback absent.
- Same-set and cross-set final semantic guards present.
- Explicit back-face and received back-to-front animation phases present.
- LuckyDex development keystore validates with the configured alias.

## Build note
A local Android Gradle build was not run because Gradle/Android SDK are not installed in this environment. The existing GitHub Actions APK build remains the compile/install test.
