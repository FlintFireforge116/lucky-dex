# LuckyDex v0.28.8 Test Report

## Scope
Focused follow-up release for:
- Unown Decoder keyboard overlay layout polish
- Unown answer-screen scroll-lock behaviour
- Clefairy Moon Stage pose restoration and distinct generated art

## Manual / source-level changes covered
- Enlarged Unown answer-screen glyphs and reduced the cream glyph panel height to better match the multiple-choice layout.
- Added stronger overlay scroll locking for the Unown typed-answer screen (`html/body` lock, scroll reset, overlay scroll suppression).
- Restored all four Clefairy move poses in Moon Stage (`star`, `song`, `moon`, `spin`) plus idle.
- Added `spin` as a first-class pose in the Clefairy scene renderer instead of falling back to idle.
- Replaced the in-app Clefairy pose PNGs with distinct clean generated assets so move poses no longer collapse into one pose.

## Test execution
### Targeted automated checks run successfully
- `node tests/v0283-unown-data.test.cjs`
- `node tests/v0283-unown-flow.test.cjs`
- `node tests/v0283-unown-ui.test.cjs`
- `node tests/v0284-unown-answer-screen.test.cjs`
- `node tests/v0286-unown-layout-polish.test.cjs`
- `node tests/v0283-clefairy-pace.test.cjs`
- `node tests/v0284-clefairy-polish.test.cjs`
- `node tests/v0285-clefairy-open-eyes.test.cjs`
- `node tests/v0286-clefairy-face-polish.test.cjs`
- `node tests/v0287-clefairy-generated-art.test.cjs`
- `node tests/v0287-clefairy-reward.test.cjs`

Result: **11 / 11 targeted tests passed**.

### Full suite note
`npm test` still stops at browser-dependent coverage because `playwright` is not installed in this environment (`Cannot find module 'playwright'`). This is an environment limitation rather than a newly introduced regression.

## Release identifiers
- Android package: `com.example.luckydex`
- `versionCode 288`
- `versionName 0.28.8`

## Packaging
Source ZIP prepared as:
- `LuckyDex_source_v0.28.8.zip`
