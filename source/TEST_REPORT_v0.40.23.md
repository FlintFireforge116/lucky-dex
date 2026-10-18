# LuckyDex v0.40.23 Test Report

## Scope

Run, Rattata, Run presentation-only redesign from four horizontal strips to one top-down four-lane course. The v0.40.22 gameplay core remains unchanged.

## TDD / feature verification

- `tests/v0423-rattata-topdown.test.cjs`: 5/5 passing after an initial red run.
  - player anchor / incoming hurdle camera geometry
  - four stable lane centres
  - visible-hurdle culling
  - single shared top-down course shell
  - runtime world-to-screen integration
  - vertical-lane / airborne CSS contract
- `tests/v0422-run-rattata-run.test.cjs`: 7/7 passing unchanged.
  - momentum, hurdles, stumble, CPU difficulty, finish grace, state, records and achievements preserved
- `tests/v0423-release.test.cjs`: passing after an initial red release-identity run.

## Focused regression suite

Command covered Dynamo, Kids Club scrolling, Snore War v0.40.17-v0.40.21, Run Rattata Run v0.40.22-v0.40.23, all v0.40.x release guards and Adventure preservation.

Result: **65/65 passing**.

Adventure preservation: **5,942 protected files preserved**.

## Offline asset audits

- Venue audit: PASS (8 local venue assets)
- Adventure asset audit: PASS (829 images / 1,025 species / 386 back sprites / 37 registry objects)
- Fossil Museum audit: PASS (42 images)

## Full project runner

`npm test` completed the first **46 subtests with 0 failures** (5 + 23 + 18) and then stopped when `adventure-core.test.cjs` attempted to load the unavailable Node `playwright` package.

This is an execution-environment dependency limitation, not counted as a pass. Browser-backed tests after that point were not run.

## Visual QA limitation

A headless Chromium screenshot was attempted separately, but Chromium hangs in this execution environment before emitting a frame. No browser screenshot is claimed for this release. Phone-fit/readability is instead covered by the top-down geometry tests plus the existing responsive CSS breakpoints; final device feel should be confirmed in the Android build.

## Packaging verification

Pre-final archive extraction check: **14/14 passing** across the v0.40.22 Rattata gameplay suite, v0.40.23 top-down suite, v0.40.23 release guard and the 5,942-file Adventure preservation guard. The final archive is rebuilt with this report and rechecked before delivery.
