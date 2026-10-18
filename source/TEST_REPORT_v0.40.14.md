# LuckyDex v0.40.14 Test Report

## Scope

v0.40.14 expands Pokémon Stadium / Kids Club with **Thundering Dynamo** and relocates the existing Clefairy game into that venue as **Clefairy Says**.

### Thundering Dynamo

- Four-racer Pikachu / Voltorb presentation using packaged local Pokémon actor sprites.
- BLUE lamp requires A; GREEN lamp requires B.
- Correct presses add charge; incorrect presses discharge the racer.
- Lamp timing changes during the round rather than remaining fixed.
- First racer to 100% ends the round, with a 45-second safety cap for pathological runs.
- Easy / Normal / Hard COM profiles vary reaction delay, tapping interval and error rate.
- Persistent Arcade state records games, wins, podiums, wins by difficulty, best overall/difficulty time, best accuracy and cumulative correct/wrong presses.
- Game Review records placement, time, correct presses, wrong presses, accuracy, racer species/charge and Lucky Coin reward.
- Keyboard A/B and large pointer/touch controls share the same input path.
- Pause/resume shifts all race timestamps so backgrounding the app does not advance the game unfairly.

### Clefairy relocation

- The separate Moon Stage world stop is removed.
- Kids Club now owns Clefairy under the title **Clefairy Says**.
- Existing Clefairy game logic, Moon Stage presentation, rewards and sequence behavior remain unchanged.
- Legacy `moonStage` / `stadiumClassroom` venue saves migrate to `stadiumKidsClub`.
- The Moon Stage background asset remains packaged because the Clefairy game still uses it.

## TDD / focused verification

The v0.40.14 behavior tests were written first and observed failing on the missing Dynamo core/UI/state/records and old Clefairy world ownership. Implementation then took those contracts RED -> GREEN.

A 412x915 phone-sized render exposed a second genuine regression before packaging: the GREEN B control could overflow the right edge because ordinary `1fr` grid tracks respected the buttons' intrinsic minimum width. A new regression test was added and observed failing, then the controls were changed to shrink-safe `minmax(0,1fr)` tracks with zero minimum button width. The test returned GREEN and a fresh 412x915 render showed both controls fully within the stage.

Fresh final focused command result:

- **27 tests/subtests passed**
- **0 failed**
- Includes v0.40.14 Dynamo behavior/integration, v0.40.4-v0.40.14 release guards, Kids Club predecessors, restore/ownership migration and Adventure preservation.
- Changed/new JavaScript syntax via `node --check`: **PASS**.
- Adventure preservation: **PASS — 5,942 protected files** preserved outside the intentional v0.40.14 Arcade changes.

## Asset verification

Fresh offline asset checks from the working source:

- Arcade v0.20.0 authentic assets: **PASS — 44 scenes/sheets/crops, 2,098 offline sprites, 2,078 unretouched actors**.
- Venue assets: **PASS — 8 local venue assets**, including retained Moon Stage art required by Clefairy Says.
- Adventure assets: **PASS — 829 images, 1,025 species, 386 back sprites, 37 registry objects**.
- Fossil Museum assets: **PASS — 42 images**.

## Full-suite environment limitation

`npm test` was launched from the final working source. Its first three test programs completed successfully (**46 subtests passed**) before the runner reached `tests/adventure-core.test.cjs` and stopped because this execution environment does not contain the project's `playwright` package:

`Error: Cannot find module 'playwright'`

A dependency restore was attempted earlier in the implementation pass, but package installation timed out in this environment. Browser-dependent programs are therefore **environment-blocked, not counted as passes**, and this report does not claim a fully green `npm test` run. The release-specific and preservation checks above do not require Playwright and were rerun successfully after the final layout fix.

## Release identity

- Package version: **0.40.14**
- Android `versionCode`: **4014**
- Android `versionName`: **0.40.14**
- Runtime build marker: **0.40.14**
- Visible app version: **v0.40.14**

## Device checks recommended

1. Enter Stadium / Kids Club and confirm Clefairy Says and Thundering Dynamo both appear alongside the four existing Kids Club games.
2. Open Clefairy Says and confirm the familiar Moon Stage game is unchanged despite its new venue entry point.
3. Start Dynamo on each difficulty and confirm no input is accepted before the countdown finishes.
4. While BLUE A is lit, tap A repeatedly; charge should rise. Tap B instead; charge should fall. Verify the inverse while GREEN B is lit.
5. Confirm COM racers visibly react more quickly and make fewer mistakes as difficulty rises.
6. On a narrow phone viewport, confirm both large A and B buttons remain fully visible side by side with no horizontal overflow.
7. Background and resume during a round; elapsed race time and COM progress should not jump ahead while paused.
8. Finish a round and confirm Game Review, Lucky Coin award and Arcade Records update exactly once.
