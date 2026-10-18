# LuckyDex v0.35.16 verification report

## Scope

v0.35.16 fixes three on-device regressions reported after v0.35.15: Voltorb Flip still exposing cash-out and showing an inflated in-board coin value, Tile Puzzle requiring exact hidden tile identity even when two source tiles are visually indistinguishable, and TCG Pocket Link Trade treating a Crown card as the same rarity as Two Diamond.

## Voltorb Flip

Root cause: the HUD displayed `voltorb.bank * 20`, so a legitimate board multiplier/payout value of 5,184 was rendered as 103,680 “COINS”. Cash-out code and UI from the older arcade contract were also still active.

Changes:
- Removed the Voltorb `CASH OUT` button and `cashVoltorb()` path completely.
- Starting `NEW BOARD` simply abandons the current board and awards nothing.
- The top HUD now says `PAYOUT`, clarifying that the value is the current unbanked board payout rather than the player's Lucky Coin balance.
- The displayed payout is the actual Voltorb board value with no arbitrary ×20 display multiplier.
- Arcade session copy now states that the board must be cleared by finding all ×2/×3 tiles without hitting Voltorb.

## Tile Puzzle

Root cause: completion used `board.every((value,index) => value === index)`, so every shuffled tile had to return to its exact hidden source index. Oreburgh City's Normal 5×6 image contains three pairs of bottom-left ground tiles that are visually indistinguishable at play scale. The audited mean absolute RGB sample distances for source pairs 18↔24, 19↔25 and 20↔26 are approximately 7.40, 9.65 and 7.31 respectively, making exact identity unknowable to the player even though the picture can look correct.

Changes:
- Completion is now visual rather than hidden-index-only.
- Exact tile identity still passes immediately.
- A misplaced tile also counts as correct when its sampled source crop is visually equivalent to the target crop.
- An 8×8 RGB signature per source tile is cached from the local scene canvas; a conservative mean-absolute-difference threshold of 10 is used.
- Signature generation is blocked until the scene image is actually loaded, so a blank canvas can never make every tile equivalent.
- Distinct misplaced tiles still prevent completion.

## TCG Pocket trade rarity

Root cause: the shared rarity parser recognized `Crown Rare` but not the actual Pocket label `Crown`. Bare `Crown` therefore fell into `unknown`, whose fallback tier is 1 — the same numeric tier used by `Two Diamond`. The trade market then honestly believed the screenshot pair was a matched rarity trade.

Changes:
- Bare `Crown` now classifies as a secret/crown rarity.
- TCG Pocket trade matching no longer collapses printed rarities into broad numeric tiers. One/Two/Three/Four Diamond, One/Two/Three Star, Crown, One Shiny and Two Shiny each have their own exact trade class.
- Pocket listings now match only the same printed rarity; the physical TCG retains its established tier-market behavior.
- Pocket exact-rarity classes bypass the physical market's ±1-tier bargain roll.
- Trade labels display the real Pocket rarity name such as `Crown` or `Two Diamond`.
- Market cache version was bumped to `v3516-exact-pocket-rarity`, forcing existing saves to regenerate stale listings instead of keeping previously misclassified Crown trades.

## TDD / regression evidence

The new `tests/v03516-user-regressions.test.cjs` was run red before implementation. Its first failure was the missing Voltorb payout rule; after that fix it failed on the missing visual Tile Puzzle completion rule; after that it failed because bare Pocket `Crown` still classified as `unknown`. The final regression test now passes all three areas. A later full-suite run caught a compatibility regression where invalidating the old Trade market materialised `null` instead of leaving the market lazy; that regression was then reproduced, changed to delete the stale snapshot, and both the new v0.35.16 test and the existing v0.24 market-contract test passed.

The browser transaction regression was also updated so abandoning a Voltorb board verifies zero reward and verifies that the old cash-out control does not exist.

## Verification performed

- `node --check` passed for all six modified runtime JavaScript modules.
- Focused v0.35.16 regression test passed.
- Existing Voltorb, Tile Puzzle, card-rarity and trade contract tests passed.
- Full non-browser sweep: 236 test programs passed, 0 failed; 21 Playwright/browser-dependent programs were excluded because Playwright is not installed in this execution environment.
- `npm test` runs the first 18 Adventure battle subtests successfully, then stops at `adventure-core.test.cjs` with `MODULE_NOT_FOUND: playwright`; this is an environment limitation and is not counted as a full-suite pass.
- `scripts/build-booster-art-index.py` passed: 144/156 catalogue rows have real bundled packshots and the remaining 12 are explicitly non-booster products.
- Authentic Arcade asset checksum verification passed (44 scenes/sheets/crops, 2,098 offline sprites and 2,078 unretouched actor outputs).
- Venue verification passed for all 8 local venue assets.
- Adventure asset verification passed (829 images, 1,025 species, 386 back sprites, 37 registry objects, 0 errors).
- Fossil Museum asset verification passed for all 42 images.
- Local Android/Gradle APK compilation was not performed because this environment has no Gradle wrapper/installation; GitHub Actions remains the APK-build verification.
