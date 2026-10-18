# LuckyDex v0.40.12 Test Report

## Scope

v0.40.12 adds the first Voltorb Flip rare-event expansion and performs a small rare-event presentation cleanup.

### Voltorb mini-gift

- Vanilla board chance: **2%**.
- Settings expose **Off / Vanilla 2% / Test 20% / Always 100%**.
- A gift is assigned only to a non-Voltorb tile.
- The gift remains hidden until that tile is revealed.
- Revealing it shows the existing transparent Mystery Gift sprite without replacing the tile value.
- The player must still clear the board to claim the reward.
- Hitting Voltorb or abandoning/replacing the board forfeits the hidden gift.
- Board state and gift state use `LuckyDexArcadeRareRewards` so closing/reopening does not reroll the attempt.
- Claiming uses the existing claim-once path and pre-results reward reveal stage.
- Reward table includes Lucky Coins, Card Dust, Pack Voucher, card and sealed booster outcomes.

### Presentation cleanup

- Rock Harden falling reward/hazard container is explicitly transparent, borderless and shadowless.
- Fossil Dig find sprites are explicitly transparent, borderless and shadowless.

## Focused red/green coverage

New tests:

- `tests/v0412-voltorb-gift.test.cjs`
- `tests/v0412-rare-visual-cleanup.test.cjs`
- `tests/v0412-release.test.cjs`

The new tests were first run against v0.40.11 and failed for the missing Voltorb gift core/settings/runtime and transparent-container contracts, then passed after implementation.

## Fresh regression evidence

From the final source tree, and then repeated from a fresh extraction of the packaged ZIP:

- **340 non-Playwright test programs** executed together with `node --test`.
- **566 tests/subtests passed**.
- **0 failures**.
- **32 Playwright/browser programs** were rerun separately and all 32 are blocked solely by the unavailable Playwright runtime in this environment; they are not counted as passes.

Offline asset verification also passes:

- 44 authentic Arcade scenes/sheets/crops.
- 2,098 offline Arcade sprites.
- 2,078 unretouched Arcade actors.
- 8 venue assets.
- 829 Adventure images / 1,025 species / 386 back sprites.
- 42 Fossil Museum images.
- Historical preservation guard passes with the intentionally modified v0.40.12 `arcade-classics.js` excluded alongside prior accepted files.

## Release identity

- Package version: **0.40.12**
- Android `versionCode`: **4012**
- Android `versionName`: **0.40.12**
- Runtime build marker: **0.40.12**

## Device checks recommended

1. Settings → Rare Event Odds → Voltorb Gift → **Always**.
2. Start a fresh Voltorb board and reveal safe tiles until the small Mystery Gift appears.
3. Confirm the tile's normal `1 / 2 / 3` face remains readable underneath/alongside the gift marker.
4. Clear the board and confirm the reward reveal appears before the Game Review.
5. Set Voltorb Gift to Always, reveal the gift, leave and reopen the game; confirm the same board/gift state resumes rather than rerolling.
6. Reveal the gift, then hit Voltorb; confirm no gift is awarded.
7. Restore the setting to **Vanilla · 2%** after testing.
