# LuckyDex v0.28.6 Test Report

## Scope
Follow-up polish after v0.28.5 to address the next round of user-reported issues:
1. Clefairy Match face still looked off in the Star and Moon pose images.
2. Unown Decoder ruins panel used too much vertical space, making glyphs feel small.
3. Normal/Hard answer flow still wasted space before starting, and the keyboard needed more room around the decode controls.

## Implemented changes
- Replaced `clefairy_pose_star.png` and `clefairy_pose_moon.png` with retouched face variants using clearer open eyes.
- Reduced the main Unown ruins chamber height by shortening its aspect ratio.
- Increased main Unown glyph size while reducing surrounding whitespace.
- Further compacted the dedicated Unown answer chamber so the keyboard has more room and the decode controls remain visible more often.
- Hid the pre-start `ENTER ANSWER` button until there is an active live question in Normal/Hard mode.
- Version bumped to `0.28.6` / `versionCode 286`.

## Targeted verification run locally
Passed:
- `tests/v0284-release.test.cjs`
- `tests/v0284-unown-answer-screen.test.cjs`
- `tests/v0284-clefairy-polish.test.cjs`
- `tests/v0285-clefairy-open-eyes.test.cjs`
- `tests/v0286-unown-layout-polish.test.cjs`
- `tests/v0286-clefairy-face-polish.test.cjs`
- `tests/v0283-arcade-regression.test.cjs`
- `tests/v0283-unown-flow.test.cjs`
- `tests/v0283-unown-ui.test.cjs`
- `tests/v0283-clefairy-pace.test.cjs`

## Full suite note
A full `node scripts/run-tests.cjs` sweep was not completed here because the container still lacks the browser dependency required by some tests (`playwright`). This is the same environment limitation seen previously and is not specific to the v0.28.6 changes.

## Packaging
- Android identity unchanged: `com.example.luckydex`
- Version name: `0.28.6`
- Version code: `286`
