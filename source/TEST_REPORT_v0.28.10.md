# LuckyDex v0.28.10 Test Report

## Scope
Follow-up micro-polish release for the Unown Decoder after v0.28.9.

## User-reported issue addressed
The Unown glyphs were now fitting on one line, but the sizing had swung a bit too far the other way and looked **too wide / oversized** in both:
- the typed keyboard answer screen
- the easy / multiple-choice decoder screen

## Fix applied
### Unown Decoder sizing pass
- Reworked glyph fitting so each word now uses a **calculated live glyph size** instead of a transform-scale pass.
- Reduced the base glyph sizing slightly so the decoder is still large and readable without feeling overblown.
- Kept the goal of **one line per word**.
- Kept the typed layout and easy layout visually aligned, with the typed answer screen remaining only slightly larger.

### Final sizing behaviour
- **Easy / main screen:** moderate base size, then fit-to-word-width.
- **Typed keyboard overlay:** slightly larger base size, then fit-to-word-width.
- This should prevent both tiny words and overly huge clipped words.

## Automated checks run
Executed successfully:
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

## Full-suite note
`npm test` is still blocked in this environment by the same pre-existing missing `playwright` dependency, so the targeted Node regression pack remains the authoritative check here.

## Release identifiers
- Android package: `com.example.luckydex`
- `versionCode 290`
- `versionName 0.28.10`

## Packaging
Prepared source archive:
- `LuckyDex_source_v0.28.10.zip`
