# LuckyDex v0.40.18 Test Report

## Scope
Snore War pendulum continuity hotfix only:
- keep Snore War gameplay, timing window, acceleration, sleep/elimination rules, CPU profiles, records and Kids Club integration unchanged;
- fix the visible pendulum snap/reset seen on Android/WebView after a centre crossing;
- use one monotonic `performance.now()` timebase for start, input, CPU progression and animation frames.

## Root cause
`arcade-snore-war.js` created race timestamps with `performance.now()` but drove animation frames from the timestamp argument supplied by `requestAnimationFrame`. The core pendulum calculation assumes all timestamps share one origin. A WebView/host offset between those two clocks can therefore make the frame immediately after a centre press jump to an unrelated phase.

## TDD evidence
`node --test tests/v0418-snore-war-smooth-pendulum.test.cjs`
- RED on v0.40.17: a deliberately mismatched RAF timestamp made the pendulum jump from centre to `42.35deg`.
- GREEN after the fix: the same mismatched RAF timestamp is ignored for race timing and the pendulum remains within 5 degrees of centre 16 ms later.

## Focused verification
39/39 focused release/game/preservation checks passed, including:
- v0.40.0-v0.40.18 release guards;
- Snore War feature and smooth-pendulum regression tests;
- Dynamo and Dynamo tuning tests;
- Kids Club scroll hotfix;
- Arcade Records core/state/registry tests;
- Adventure preservation: 5,942 protected files matched the baseline.

## Offline / syntax audits
- Snore War core/runtime JavaScript syntax: PASS.
- Arcade assets: 44 authentic scenes/sheets/crops, 2,098 sprites, 2,078 unretouched actors: PASS.
- Venue assets: 8 local venue assets: PASS.
- Adventure assets: 829 images, 1,025 species, 386 back sprites, 37 registry objects: PASS.
- Fossil Museum assets: 42 images: PASS.

## Full-suite attempt
`npm test`
- 46 subtests passed with 0 failures before the first browser-backed test.
- The run then stopped at `adventure-core.test.cjs` because Playwright is not installed in this execution environment (`MODULE_NOT_FOUND: playwright`).
- Browser-backed tests after that point are not counted as passes.

## Release identity
- package/runtime version: 0.40.18
- Android versionCode: 4018
- Android versionName: 0.40.18
