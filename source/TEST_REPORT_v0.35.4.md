# LuckyDex v0.35.4 Test Report

## Release identity

- Android application ID remains `com.example.luckydex`.
- `versionCode 354`
- `versionName '0.35.4'`
- package/build markers updated to `0.35.4`.

## Ekans' Hoop Hurl slingshot correction

v0.35.4 replaces the incorrect forward/direct drag mapping with the approved pull-back slingshot control model.

### Root cause

- v0.35.3 still interpreted upward/forward finger travel as throw distance.
- That meant pulling back/down, as requested for a slingshot, left the target circle at the near row.
- Horizontal aiming also followed the finger instead of mirroring it, so the gesture was not physically slingshot-like.
- The old deliberate-throw threshold could accept a forward flick even though the desired mechanic requires a charged backward pull.

### Corrected control contract

- Press and hold Ekans; Ekans remains planted.
- Pull downward/backward to charge distance.
- Pull farther back to move the target circle farther up the field.
- Pull down-left to aim up-right; pull down-right to aim up-left.
- The target circle updates continuously while the finger remains held.
- Release commits the throw to the exact visible target-circle position.
- A forward/upward flick does not charge and does not throw.
- Existing Android release fallbacks (`pointerup`, cancel/lost-capture and touch-end fallback) remain in place.

## Verification

Focused v0.35.4 tests:
- `tests/v0354-ekans-slingshot-gesture.test.cjs` — PASS
- `tests/v0354-release.test.cjs` — PASS

Ekans regressions:
- v0.35.0 core/integration/lifecycle/runtime — PASS
- v0.35.1 solo core/integration/lifecycle/runtime — PASS
- v0.35.2 pointer-capture fallback, updated to the slingshot contract — PASS
- v0.35.3 Android release-ending fallback — PASS

Broader regression:
- 204 non-browser Node test programs — PASS
- 44 authentic Arcade scenes/sheets/crops checksum validation — PASS
- 2,098 offline Arcade sprite PNG/checksum validations — PASS
- 2,078 unretouched Arcade actor source/output validations — PASS
- 8 local venue assets — PASS
- Adventure asset verifier: 829 images / 1,025 species / 37 registry objects, 0 errors — PASS
- Fossil Museum assets: 42 images — PASS

## Environment limitations

- Playwright is declared as a dev dependency but is not installed in this extracted workspace, so browser-dependent tests could not run here.
- The supplied source bundle does not contain `gradlew`, so Android compilation is not available in this environment.
