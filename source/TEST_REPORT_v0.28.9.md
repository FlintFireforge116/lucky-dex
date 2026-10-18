# LuckyDex v0.28.9 Test Report

## Scope
Follow-up polish release focused on:
- Clefairy Moon Stage pose rendering
- Unown Decoder easy / typed layout consistency
- Larger Unown letters with per-word single-line fitting

## Changes covered
### Clefairy Moon Stage
- Replaced the accidentally opaque Clefairy pose PNGs with the transparent generated versions, removing the white square backdrop.
- Kept the distinct move-based poses in place (`star`, `song`, `moon`, `spin`) plus idle.
- Preserved the pose system so Moon Stage no longer collapses back to one visible pose.

### Unown Decoder
- Added per-word glyph fitting so each word stays on a single line and scales to the available width instead of shrinking inconsistently.
- Enlarged the base Unown glyph size again for both the main easy screen and the typed keyboard screen.
- Made the easy-screen message panel visually closer to the typed keyboard layout.
- Retained the typed-answer overlay / scroll-lock behaviour from the prior fix.

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
`npm test` is still blocked in this environment by the pre-existing browser dependency issue (`playwright` not installed). No new failure was introduced by the v0.28.9 changes above.

## Release identifiers
- Android package: `com.example.luckydex`
- `versionCode 289`
- `versionName 0.28.9`

## Packaging
Prepared source archive:
- `LuckyDex_source_v0.28.9.zip`
