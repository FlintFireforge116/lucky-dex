# LuckyDex v0.28.5 Test Report

## Scope
Follow-up polish pass after v0.28.4 focused on two user-reported issues:
1. Clefairy Match Star/Moon facial expressions should use open eyes rather than a drawn closed-eye overlay.
2. Unown Decoder typed-answer view should keep the visual decoding chamber in the top half of the screen and behave better with the Android keyboard.

## Implemented changes
- Replaced `clefairy_pose_star.png` and `clefairy_pose_moon.png` with the open-eye pose assets.
- Updated Unown typed-answer screen behavior:
  - focus uses `preventScroll` to reduce browser scroll-jump
  - added `visualViewport` sync so the dedicated answer screen tracks the visible viewport on Android
  - resized the answer chamber to a fixed top-half presentation rather than centering it in a large flexible column
- Version bumped to `0.28.5` / `versionCode 285`.

## Targeted verification run locally
Passed:
- `tests/v0284-release.test.cjs`
- `tests/v0284-unown-answer-screen.test.cjs`
- `tests/v0284-clefairy-polish.test.cjs`
- `tests/v0285-clefairy-open-eyes.test.cjs`
- `tests/v0283-arcade-regression.test.cjs`
- `tests/v0283-unown-flow.test.cjs`
- `tests/v0283-unown-ui.test.cjs`
- `tests/v0283-clefairy-pace.test.cjs`

## Full suite note
A full `node scripts/run-tests.cjs` sweep was attempted, but the environment does not currently have Playwright installed, so browser-dependent tests cannot be executed here. The first blocking failure was:
- `tests/adventure-core.test.cjs` -> `Error: Cannot find module 'playwright'`

This does **not** indicate a regression in the v0.28.5 changes; it is an environment dependency issue.

## Packaging
- Android identity unchanged: `com.example.luckydex`
- Version name: `0.28.5`
- Version code: `285`
