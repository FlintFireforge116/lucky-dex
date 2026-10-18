# LuckyDex v0.40.15 Test Report

## Scope

v0.40.15 is a focused Kids Club venue-menu hotfix. Adding Clefairy Says and Thundering Dynamo increased the Kids Club selector from four entries to six, exposing an older layout assumption: the venue shell clipped overflow while the game list itself had no scroll ownership.

## Root cause and fix

- `.arcade-venue-view` is intentionally a fixed-height, overflow-clipped full-screen shell.
- `.arcade-venue-games` previously had no flex sizing or vertical overflow rule because the original Kids Club menu fit without scrolling.
- Once the menu reached six games, lower entries could extend beyond the reachable viewport.
- The fix makes `.arcade-venue-games` consume the remaining venue height, shrink correctly inside the flex shell, and own vertical touch scrolling with contained overscroll.
- The venue hero remains fixed while only the game list scrolls.
- No minigame logic, rewards, records or navigation ownership changed.

## TDD

`tests/v0415-kids-club-scroll.test.cjs` was written first and observed failing because the venue list lacked `flex`, `min-height:0`, `overflow-y:auto` and contained overscroll. The CSS change then took that contract RED -> GREEN.

## Mobile browser verification

A real Chromium render using the shipped `styles-v013.css` and `arcade.css` was exercised at 412px wide across multiple viewport heights.

- 915px high: list client 513px / scroll 516px; scrollTop reaches 3px.
- 800px high: list client 444px / scroll 516px; scrollTop reaches 72px and the sixth game is fully visible.
- 732px high: list client 403px / scroll 516px; scrollTop reaches 113px and the sixth game is fully visible.
- 640px high: list client 348px / scroll 516px; scrollTop reaches 168px and the sixth game is fully visible.

This verifies that the actual short-phone failure mode now has a functional scroll range and that the final Kids Club entry can be brought fully on-screen.

## Focused verification

Fresh checks after the final change:

- `tests/v0415-kids-club-scroll.test.cjs`: PASS.
- v0.40.14 Thundering Dynamo behavior/integration + v0.40.15 release tests: 8/8 subtests PASS.
- Release guards v0.40.0 through v0.40.15: 14/14 PASS.
- Existing Ekans, Dig! Dig! Dig!, Magikarp's Splash, Kids Club selector and Rock Harden integration contracts: PASS.
- CommonJS syntax check: 383 test programs PASS `node --check`.
- Adventure preservation: PASS — 5,942 protected files preserved outside the intentional Arcade/release changes.

## Full-suite environment limitation

`npm test` was run from the final v0.40.15 working source. The first three test programs completed successfully, for **46 passing subtests**, before `tests/adventure-core.test.cjs` stopped because the Node environment does not contain the project's `playwright` package:

`Error: Cannot find module 'playwright'`

Python Playwright plus system Chromium were available and were used for the mobile scroll verification above, but that does not satisfy the Node test runner's dependency. Browser-dependent Node tests are therefore environment-blocked and are not counted as passes.

## Release identity

- Package version: **0.40.15**
- Android `versionCode`: **4015**
- Android `versionName`: **0.40.15**
- Runtime build marker: **0.40.15**
- Visible app version: **v0.40.15**

## Device check recommended

Enter Pokémon Stadium / Kids Club on the phone, drag upward on the game list, and confirm Clefairy Says and Thundering Dynamo are both reachable while the venue hero remains fixed.
