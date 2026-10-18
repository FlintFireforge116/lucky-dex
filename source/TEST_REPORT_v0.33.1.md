# LuckyDex v0.33.1 verification report

## Scope
Patch release on top of v0.33.0. No Dash asset/course redesign is included; that remains a separate Codex pass.

### Dust Exchange
- Replaced the old `CONVERT 1` / `ALL` choice with a quantity selector.
- Supports minus / numeric entry / plus / MAX.
- Conversion quote updates live before confirmation.
- Existing conversion clamping still protects the final binder copy.

### Poké Ball Drop stability
- Card/booster reward resolution is now deadline-bounded so an unresolved async lookup cannot hold `pendingRewards` forever, including after Ball Rain.
- Auxiliary and main balls have a 20-second **simulated physics time** failsafe; this does not count time while the app is backgrounded because RAF `dt` remains capped.
- Existing wedge recovery and sloped-board physics remain intact.

### Pack opening stability
- Reveal-frame exceptions are contained and settle the current card to a usable state.
- Web Animation cancellation failures are contained during rapid navigation.
- Concurrent rapid Next/Previous transitions are rejected with a navigation lock.
- Reveal mount/preload failures record `luckyDexLastPackError` with set/card/index/phase context.
- If the cinematic cannot mount, the current card falls back to a static reveal; if that also fails, the committed pack recovers to its summary.

The reported pack crash did not include a native/WebView crash log, so this patch does not claim one proven historical stack trace. It hardens the concrete unguarded transition/render paths found in the current opener and adds context for any recurrence.

## Verification
- Changed JavaScript files pass `node --check`.
- New regression tests pass: `tests/v0331-stability-dust.test.cjs`, `tests/v0331-release.test.cjs`.
- Existing targeted Ball Drop tests pass: `arcade-ball-drop`, `v0271-ball-drop-chaos`, `v0278-ball-drop-final-polish`.
- Full local test inventory: **180** test programs.
  - **162 completed successfully**.
  - **18 browser-integrated programs could not complete because Playwright is not installed in this environment**; no non-Playwright failure remained.
- Offline asset validation passed:
  - 44 authentic scenes/sheets/crops
  - 2,098 Arcade sprites
  - 2,078 unretouched Arcade actors
  - 8 venue assets
  - Adventure registry/assets: 829 images / 1,025 species / 386 back sprites / 37 objects
  - 42 Fossil Museum images
- Android identity remains `com.example.luckydex` with the permanent development signer configuration.
- Release version: `0.33.1`, versionCode `331`.

## Build limitation
Gradle/Android SDK are not available in this execution environment, so the APK was not compiled locally. The existing repository GitHub workflow can build the signed debug APK from `LuckyDex_source.zip`.
