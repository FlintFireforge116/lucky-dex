# LuckyDex v0.40.16 Test Report

## Scope
Thundering Dynamo fairness tuning only:
- remove visible in-game timer;
- remove 3-2-1 / GO pre-race countdown;
- increase correct input charge from 2% to 3%;
- add a 400 ms neutral-grey lamp state before every BLUE/GREEN swap;
- ignore player presses during grey;
- suspend CPU tapping during grey and start CPU reaction timing only after the new colour appears;
- preserve internal elapsed-time records, Arcade Records, Game Review timing, rewards and Kids Club scroll hotfix.

## TDD evidence
`node --test tests/v0416-thundering-dynamo-tuning.test.cjs`
- RED before implementation: 4/4 new contracts failed for the intended missing behavior.
- GREEN after implementation: 4/4 passed.

## Focused regression / release verification
Command covered v0.40.0-v0.40.16 release guards, Dynamo integration, Kids Club scrolling and Adventure preservation.
- 26/26 tests passed.
- Adventure preservation: 5,942 protected files matched the baseline.
- Syntax checks passed for Dynamo core/runtime and v0.40.16 tests.

## Offline asset integrity
- 44 authentic Arcade scenes/sheets/crops validated.
- 2,098 offline Arcade sprites validated.
- 2,078 unretouched Arcade actors validated.
- 8 venue assets validated, including retained Moon Stage art.
- Adventure asset audit passed: 829 images, 1,025 species, 386 back sprites, 37 registry objects.
- Fossil Museum audit passed: 42 images.

## Full-suite attempt
`npm test`
- 46 subtests passed with 0 failures before the first browser-backed test.
- The suite then stopped at `adventure-core.test.cjs` because this extracted execution environment does not have the package's Playwright dev dependency installed (`MODULE_NOT_FOUND: playwright`).
- This is an environment/dependency limitation, not a failing LuckyDex assertion. Browser-backed tests after that point were not counted as passes.

## Release identity
- package/runtime version: 0.40.16
- Android versionCode: 4016
- Android versionName: 0.40.16
