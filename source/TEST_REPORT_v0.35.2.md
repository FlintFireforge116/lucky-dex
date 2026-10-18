# LuckyDex v0.35.2 Test Report

## Release identity

- Android application ID remains `com.example.luckydex`.
- `versionCode 352`
- `versionName '0.35.2'`
- package/build markers updated to `0.35.2`.

## Ekans' Hoop Hurl touch hotfix

v0.35.2 fixes the first-device-test drag/release failure in the solo Kids Club game.

Root cause:
- Vertical aim treated only downward pointer travel as throw distance (`currentY - startY`). An intuitive upward drag toward the board was clamped to zero, so the marker remained on the near row and an almost purely vertical gesture could fail the deliberate-throw threshold.
- Pointer move/up handling depended on pointer capture and listeners attached to the Ekans launcher. If capture was unavailable or lost outside the launcher, release could fail to complete the throw.

Fix:
- Upward pointer travel now drives throw depth, so dragging Ekans toward the board reaches middle/far rows.
- Horizontal aim remains continuous.
- Move/up/cancel are tracked at document level while a drag is active, with pointer-ID filtering, so release completes even if pointer capture is unavailable.
- Ekans visually follows the new upward throw gesture.
- On-screen and accessibility instructions now say to drag Ekans toward a target and release.

## Verification

Focused v0.35.2 tests:
- `tests/v0352-ekans-touch-gesture.test.cjs` — PASS
- `tests/v0352-release.test.cjs` — PASS

Ekans regression tests:
- v0.35.0 core/integration/lifecycle/runtime — PASS
- v0.35.1 solo core/integration/lifecycle/runtime — PASS

Broader regression:
- 200 non-browser Node test programs — PASS
- 44 authentic Arcade scenes/sheets/crops checksum validation — PASS
- 2,098 offline Arcade sprite PNG/checksum validations — PASS
- 2,078 unretouched Arcade actor source/output validations — PASS
- 8 local venue assets — PASS
- Adventure asset verifier: 829 images / 1,025 species / 37 registry objects, 0 errors — PASS
- Fossil Museum assets: 42 images — PASS

## Environment limitations

- Playwright is declared as a dev dependency but is not installed in this extracted workspace, so the browser-dependent suite could not be executed here.
- The supplied source bundle does not contain `gradlew`, so Android compilation was not available in this environment.
