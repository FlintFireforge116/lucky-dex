# LuckyDex v0.35.8 verification report

## Scope
Hoop Hurl visual cleanup and slingshot pull-back runway.

### Changes verified
- Removed the decorative top and bottom inset bands from the Hoop Hurl playfield.
- Grid now spans the full vertical playfield.
- Removed the separate framed/background strip around the live launch area.
- Increased launch runway height so there is meaningful empty space below Ekans for the pull-back gesture.
- Kept the existing slingshot input/runtime behavior unchanged.
- Application ID remains `com.example.luckydex`.
- Version bumped to `0.35.8` / Android `versionCode 358`.

## Focused regression coverage
- `tests/v0358-ekans-clean-layout.test.cjs` — PASS
- `tests/v0358-release.test.cjs` — PASS
- All existing non-browser Ekans tests from v0.35.0 through v0.35.7 — PASS

## Full source regression pass
- 213 non-browser test programs — PASS
- 21 Playwright/recovery-browser dependent programs — SKIPPED because Playwright is not installed in this extracted source environment
- 0 non-browser failures

## Offline asset integrity
- Arcade authentic scenes/sheets/crops — PASS
- 2098 offline Arcade sprites — PASS
- 2078 unretouched Arcade actors — PASS
- Venue assets — PASS
- Adventure assets — PASS
- Fossil Museum assets — PASS

## Android build
Not claimed. This extracted source bundle does not contain an executable `./gradlew` wrapper.
