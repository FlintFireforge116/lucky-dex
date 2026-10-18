# LuckyDex v0.35.6 Test Report

## Scope
Ekans' Hoop Hurl arcade tuning on top of v0.35.5.

## Implemented
- Target generation now chooses species first (80% Diglett / 20% Dugtrio), then independently applies a 1% shiny chance to either species.
- Scores: Diglett 1, Dugtrio 3, Shiny Diglett 5, Shiny Dugtrio 10 before streak multiplier.
- Ekans launcher shifted 10px lower and aim rest position moved below the near row.
- Slingshot distance mapping: roughly 22px pull = near row, ~80px = middle row, ~145px = far row.
- Minimum deliberate pull reduced so near-row attempts reliably launch.
- Throw resolution no longer pins the target that was nearest at release. It checks every still-visible target at landing time.
- More forgiving collision tolerance: Diglett 0.58 grid units; Dugtrio 0.72 grid units. If generous hitboxes overlap, the nearest target centre wins.
- Arcade timing intentionally retained: targets may expire while Ekans is in flight; expired targets do not score.
- App identity remains `com.example.luckydex`; versionCode 356 / versionName 0.35.6.

## Verification
- Focused v0.35.6 tuning regression: PASS.
- Release identity regression: PASS.
- All Ekans non-browser regressions: PASS.
- 208 non-browser test programs: PASS.
- 27 browser-dependent programs were not run because Playwright is not installed in this extracted workspace.
- Authentic Arcade scenes/sheets/crops checksum validation: PASS (44).
- Offline Arcade sprite validation: PASS (2098).
- Unretouched Arcade actor validation: PASS (2078).
- Venue asset validation: PASS (8).
- Adventure asset validation: PASS (829 images / 1025 species / 37 registry objects).
- Fossil Museum asset validation: PASS (42 images).

## Environment limits
The repository master test command reaches Playwright-backed browser tests and cannot complete in this extracted environment because the Playwright package is not installed. Android compilation was not run because this source bundle does not include a Gradle wrapper.
