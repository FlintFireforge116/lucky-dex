# LuckyDex v0.40.17 Test Report

## Scope
Snore War / Pokémon Stadium Kids Club feature:
- add Snore War as the seventh Kids Club game;
- reuse LuckyDex's established timing-game patterns for a faithful accelerating pendulum challenge;
- four Drowzee, one player and three CPUs;
- a 120 ms centre timing window and one attempt per pendulum crossing;
- a miss puts the racer to sleep for two crossings;
- the round ends when only one racer remains awake;
- Easy / Normal / Hard CPU timing profiles;
- no pre-game countdown and no visible race timer;
- persistent Arcade Records and Game Review integration;
- preserve Thundering Dynamo, the Kids Club scroll hotfix and the rest of the app.

## TDD evidence
`node --test tests/v0417-snore-war.test.cjs`
- RED before implementation: the new Snore War contracts failed because the core/runtime, shell, state and Kids Club wiring did not yet exist.
- GREEN after implementation: 7/7 Snore War contracts passed, including the narrow-screen difficulty-control regression.

## Focused verification completed during implementation
- Kids Club / Dynamo / Snore War focused suite: 19/19 passed.
- v0.40.0-v0.40.17 release guards: 15/15 passed.
- Snore War + Dynamo + scroll + preservation set: 20/20 passed.
- Arcade platform / session / records set: 7/7 passed.
- Adventure preservation: 5,942 protected files matched the baseline.
- Gameplay simulation completed 500 perfect-player races at each difficulty and all races finalized.

## Visual / mobile QA
A 412 × 915 phone-size render was inspected with the actual Drowzee sprite. All four racer panels, pendulum, three difficulty controls, START button and the large A / HYPNOSIS control remained inside the viewport. A global-button min-width interaction found during this pass was fixed and locked with a regression test.

## Full-suite attempt
`npm test`
- 46 subtests passed with 0 failures before the first browser-backed test.
- The suite then stopped at `adventure-core.test.cjs` because this extracted execution environment does not have the package's Playwright dev dependency installed (`MODULE_NOT_FOUND: playwright`).
- Browser-backed tests after that point are not counted as passes.

## Release identity
- package/runtime version: 0.40.17
- Android versionCode: 4017
- Android versionName: 0.40.17

## Final pre-package verification
Fresh release-gate verification after documentation cleanup:
- Snore War / Dynamo / Kids Club scroll / records registry / Adventure preservation: 21/21 passed.
- v0.40.0-v0.40.17 release guards: 15/15 passed.
- JavaScript syntax checks passed for the Snore War core and runtime.
- Offline Arcade audit passed: 44 authentic scenes/sheets/crops, 2,098 sprites and 2,078 unretouched actors.
- Venue audit passed: 8 local venue assets.
- Adventure asset audit passed: 829 images, 1,025 species, 386 back sprites and 37 registry objects.
- Fossil Museum audit passed: 42 images.
