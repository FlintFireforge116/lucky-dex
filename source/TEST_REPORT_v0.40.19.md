# LuckyDex v0.40.19 Test Report

## Scope
Snore War start-panel visibility hotfix only:
- hide the Snore War ready/start panel when a live round begins;
- show the live HYPNOSIS control during play;
- restore the ready/start panel when returning to ready/replay;
- preserve Snore War pendulum, timing, sleep/elimination rules, CPU profiles, records, Kids Club scrolling and Dynamo behavior.

## Root cause
`arcade-snore-war.js` had a `setControls()` helper that toggled only the live controls. Unlike the other Kids Club games, it never toggled `snoreWarReady`, so START, difficulty and instructions remained visible throughout a live round.

## TDD evidence
`node --test tests/v0419-snore-war-start-visibility.test.cjs`
- RED on v0.40.18: after `startRound()`, `snoreWarReady.hidden` remained `false`.
- GREEN after the fix: ready panel is hidden during racing, live controls are shown/enabled, and ready visibility is restored by `showReady()`.

## Focused verification
95/95 release/game/preservation checks passed, including:
- v0.40.x release guards through v0.40.19;
- Snore War feature, smooth-pendulum and start-panel regressions;
- Dynamo and Dynamo tuning regressions;
- Kids Club scrolling hotfix;
- Adventure preservation: 5,942 protected files matched the baseline.

## Offline / syntax audits
- Snore War runtime JavaScript syntax: PASS.
- Venue assets: 8 local venue assets: PASS.
- Adventure assets: 829 images, 1,025 species, 386 back sprites, 37 registry objects: PASS.
- Fossil Museum assets: 42 images: PASS.

## Full-suite attempt
`npm test`
- 46 subtests passed with 0 failures before the first browser-backed test.
- The run then stopped at `adventure-core.test.cjs` because Playwright is not installed in this execution environment (`MODULE_NOT_FOUND: playwright`).
- Browser-backed tests after that point are not counted as passes.

## Release identity
- package/runtime version: 0.40.19
- Android versionCode: 4019
- Android versionName: 0.40.19
