# LuckyDex v0.40.20 Test Report

## Scope
Snore War live-place and round-length tuning:
- fix live PLACE so currently awake racers rank by hits, then fewer misses, then best streak;
- ensure a currently sleeping racer cannot rank above an awake racer during live play;
- preserve survival-based final placement, with the winner locked first and eliminated racers ordered by when they dropped out;
- reduce a miss to exactly two centre crossings of sleep total, including the missed crossing, so simultaneous three-way sleep happens less often and rounds last longer;
- preserve v0.40.18 smooth pendulum and v0.40.19 start-panel visibility fixes.

## Root causes
1. `rankRace()` used `lastSleepAt` before hits even during live play. A racer that had never slept had a near-zero fallback timestamp, so a weaker COM that had recovered from a recent sleep could appear above a much stronger player.
2. `sleepThroughCrossing=index+CONFIG.sleepCrossings` was inclusive at both ends. With `sleepCrossings: 2`, a miss at crossing N therefore counted N, N+1 and N+2: three crossings total.

## TDD evidence
`node --test tests/v0420-snore-war-ranking-duration.test.cjs`
- RED on v0.40.19: a 10-hit recovered COM ranked above a 17-hit / 0-miss player; Drowzee remained asleep on the third crossing after a miss.
- GREEN after the fix: live ranking is awake -> hits -> fewer misses -> best streak, while finalized ranking preserves survival order; sleep lasts exactly two crossings total.

## Duration sanity check
A deterministic 1,000-run Normal-mode simulation with a perfect player produced:
- median round length: ~37.0 seconds;
- middle 50%: ~20.8 to 46.4 seconds.
This verifies the intended longer-round effect without changing pendulum speed or CPU difficulty.

## Focused verification
43/43 focused release/game/preservation checks passed, including:
- v0.40.x release guards through v0.40.20;
- Snore War feature, smooth-pendulum, start-panel, live-place and sleep-duration regressions;
- Dynamo feature/tuning regressions;
- Kids Club scrolling hotfix;
- Arcade Records core/registry/state;
- Adventure preservation: 5,942 protected files matched the baseline.

## Offline / syntax audits
- Snore War core/runtime JavaScript syntax: PASS.
- Venue assets: 8 local venue assets: PASS.
- Adventure assets: 829 images, 1,025 species, 386 back sprites, 37 registry objects: PASS.
- Fossil Museum assets: 42 images: PASS.

## Full-suite attempt
`npm test`
- 46 subtests passed with 0 failures before the first browser-backed test.
- The run then stopped at `adventure-core.test.cjs` because Playwright is not installed in this execution environment (`MODULE_NOT_FOUND: playwright`).
- Browser-backed tests after that point are not counted as passes.

## Release identity
- package/runtime version: 0.40.20
- Android versionCode: 4020
- Android versionName: 0.40.20
