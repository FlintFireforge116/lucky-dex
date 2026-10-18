# LuckyDex v0.35.9 Test Report

## Scope
Final Ekans' Hoop Hurl presentation pass to make active Diglett / Dugtrio targets visually larger so they fill the 3×3 field more comfortably, without changing scoring, timing, start flow or slingshot behaviour.

## Change summary
- Enlarged normal Diglett target sprites from **60×60** to **78×78** on standard layouts.
- Enlarged Dugtrio target sprites from **72×68** to **96×88** on standard layouts.
- Enlarged mobile Diglett target sprites from **54×54** to **72×72**.
- Enlarged mobile Dugtrio target sprites from **66×62** to **86×80**.
- Nudged shiny star offsets so they still sit cleanly on the larger sprites.
- No gameplay logic changes.

## Verification
Executed focused Ekans regression coverage from the edited source tree:

1. `tests/v0358-ekans-clean-layout.test.cjs`
2. `tests/v0354-ekans-slingshot-gesture.test.cjs`
3. `tests/v0355-ekans-touch-ownership.test.cjs`
4. `tests/v0357-ekans-start-ui.test.cjs`
5. `tests/v0359-ekans-target-scale.test.cjs`

## Result
All focused Ekans regression tests passed.

```text
PASS v0.35.8 Ekans clean board and pull-back runway
PASS v0.35.4 Ekans pull-back slingshot aiming
v0.35.5 Ekans touch ownership regression: PASS
PASS v0.35.7 Ekans START UI flow
PASS v0.35.9 Ekans target sprite scale
```

## Notes
- This is a presentation-only tuning pass for target occupancy.
- Existing scoring remains unchanged: Diglett +1, Dugtrio +3, shiny Diglett +5, shiny Dugtrio +10.
- Targets can still disappear mid-flight, per the approved arcade behaviour.

## Packaging correction
The first v0.35.9 archive was incorrectly created with a `luckydex_0359_work/` top-level folder. GitHub CI extracts `LuckyDex_source.zip` into `source/`, so Gradle could not find `source/settings.gradle` and failed with exit code 1.

The corrected archive is flat at its root, matching prior working releases. Its root contains `settings.gradle`, `build.gradle`, `app/`, `package.json`, and the rest of the project directly.

The release metadata was also corrected to:
- applicationId: `com.example.luckydex`
- versionCode: `359`
- versionName: `0.35.9`
- package/runtime version: `0.35.9`
