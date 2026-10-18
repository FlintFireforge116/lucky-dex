# LuckyDex v0.35.3 Test Report

## Release identity

- Android application ID remains `com.example.luckydex`.
- `versionCode 353`
- `versionName '0.35.3'`
- package/build markers updated to `0.35.3`.

## Ekans' Hoop Hurl release hotfix

v0.35.3 fixes the remaining on-device release failure reported after v0.35.2.

### Device evidence / root cause

- While the finger remained down, the target marker stayed active, proving the drag state and move tracking were alive.
- On finger release the marker disappeared but no throw began. That matches the runtime's `pointercancel` path: it cleared drag state without committing the throw.
- Android WebView can terminate an active touch gesture through cancellation/lost-capture semantics instead of the `pointerup` path assumed by v0.35.2.

### Fix

- A deliberate drag now has one shared completion path.
- `pointerup` commits the throw.
- `pointercancel` commits the throw when the round is still active and the drag was deliberate.
- `lostpointercapture` is also treated as a valid end of a deliberate drag.
- A capture-phase `touchend`/`touchcancel` fallback commits the last visible aim when WebView omits the pointer release event.
- Completion is exactly-once because the first ending clears the active drag before fallback events can act.
- App/background cancellation remains safe: a hidden/paused document cannot start a throw.
- Ekans now stays visually planted while aiming; only the target circle moves. Releasing sends Ekans to that circle, including a deliberate miss.

## Verification

Focused v0.35.3 tests:
- `tests/v0353-ekans-release-endings.test.cjs` — PASS
- `tests/v0353-release.test.cjs` — PASS

Ekans regressions:
- v0.35.0 core/integration/lifecycle/runtime — PASS
- v0.35.1 solo core/integration/lifecycle/runtime — PASS
- v0.35.2 upward touch gesture regression — PASS

Broader regression:
- 202 non-browser Node test programs — PASS
- 44 authentic Arcade scenes/sheets/crops checksum validation — PASS
- 2,098 offline Arcade sprite PNG/checksum validations — PASS
- 2,078 unretouched Arcade actor source/output validations — PASS
- 8 local venue assets — PASS
- Adventure asset verifier: 829 images / 1,025 species / 37 registry objects, 0 errors — PASS
- Fossil Museum assets: 42 images — PASS

## Environment limitations

- Playwright is declared as a dev dependency but is not installed in this extracted workspace, so browser-dependent tests could not run here.
- The supplied source bundle does not contain `gradlew`, so Android compilation is not available in this environment.
