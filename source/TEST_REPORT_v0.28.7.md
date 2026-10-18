# LuckyDex v0.28.7 Test Report

## Scope
Follow-up polish after v0.28.6 focused on three user-reported issues:
1. Android keyboard still resized/scrolled the Unown Decoder answer screen instead of behaving like an overlay.
2. Clefairy Star/Moon facial edits looked unnatural.
3. Clefairy Round 1 was still far too profitable for repeated one-turn cash-outs.

## Implemented changes
### Unown Decoder
- Android activity now uses `android:windowSoftInputMode="adjustNothing"` so the soft keyboard overlays the app instead of resizing the WebView.
- Removed the JavaScript `visualViewport` resize workaround that was shrinking the Decoder screen when the keyboard appeared.
- Answer screen is a fixed, non-scrolling overlay; the underlying/body layout is locked while it is open.
- Answer UI is constrained to roughly the upper half of the screen so the keyboard can cover the lower half without hiding the message, clue, input, or DECODE button.
- Ruins of Alph background remains visible behind the answer UI.
- Main ruins panel is shorter with reduced empty space.
- Pre-game ENTER ANSWER container is hidden until there is a live Normal/Hard question.

### Clefairy Match
- Replaced the hand-retouched Star/Moon faces with newly generated clean Clefairy artwork.
- New clean assets are used for idle, Star, Song, Moon and the stored Spin image; Moon uses the clean open-eyed idle art while its motion/glow still distinguishes the cue.
- Existing fast v0.28.3 animation timings remain unchanged.

### Reward rebalance
Per-round reward is now `round(8 × 1.32^(round-1))`.
Examples:
- Round 1: 8 coins (bank 8)
- Round 2: 11 coins (bank 19)
- Round 3: 14 coins (bank 33)
- Round 5: 24 coins (bank 75)
- Round 10: 97 coins (bank 376)
- Round 15: 390 coins (bank 1,583)

This heavily cuts one-turn farming while retaining exponential value for long streaks.

## Verification
### Non-browser test programs
- 122 passed
- 0 failed

### Browser-dependent tests
- 20 not runnable in this environment because Playwright is not installed.

### Offline asset audits
Passed:
- authentic Arcade scenes/sheets/crops and actor sprites
- venue asset audit
- Adventure asset audit
- Fossil Museum asset audit

## Packaging identity
- applicationId: `com.example.luckydex`
- versionName: `0.28.7`
- versionCode: `287`
- permanent signer configuration unchanged
