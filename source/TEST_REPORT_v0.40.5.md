# LuckyDex v0.40.5 — Device Feedback Hotfix Report

Date: 2026-10-13
Baseline: LuckyDex v0.40.4

## Scope

This hotfix addresses the five on-device regressions reported immediately after v0.40.4 testing.

### 1. Poké Mart quantity controls blank the screen

**Root cause:** the quantity click handler declared a local numeric variable named `current`, shadowing the outer screen identifier. Pressing `+`, `+10`, or `-` therefore called the renderer with a number instead of the current tool screen.

**Fix:** quantity mutation is now isolated in `adjustQuantity()`. The Mart screen identifier is preserved and quantities clamp to 1–99.

### 2. Poké Mart cannot scroll on normal phone heights

**Root cause:** `.a3-tools-content` used `overflow:hidden` except under a very short-screen media query, so the longer quantity-based Mart list was clipped on normal portrait phones.

**Fix:** tool content now uses vertical scrolling with horizontal overflow suppressed and contained overscroll.

### 3. Johto Route 30 has nothing to do

**Root cause:** the authored Johto section groups Route 30, Route 31 and Sprout Tower into one progression node. Only the final step receives the authored trainer action, leaving the two intermediate route steps without a local action.

**Fix:** eligible intermediate route steps now expose `EXPLORE AREA`. It produces one small deterministic local find per route segment/traversal and then marks that segment explored so the item reward cannot be spammed repeatedly.

### 4. Wild Hunt chain breaks when a wild Pokémon is fainted

**Root cause:** the durable field-chain model incremented only on `capture` and explicitly reset on `victory`.

**Fix:** both capture and victory/faint now extend the chain. Only flee and loss break it. Unrelated navigation/events leave it unchanged.

### 5. Card Binder still shows Pokémon sprites after switching from Pokédex

**Root cause:** the v0.40.4 regression check only verified the card renderer cleared the grid. It did not test the actual runtime tab-switch path, where the original collection click handler could still win the render ordering and leave stale Pokédex content visible.

**Fix:** the collection-browser layer now installs a direct collection-mode switch handler after its wrapper is installed, rebuilds the correct controls, and immediately renders the selected collection mode.

### 6. Physical TCG trade falsely labels different rarities as matched

The reported Deoxys VSTAR and Radiant Eternatus are **not the same printed rarity class** in LuckyDex's canonical rarity classifier:

- Deoxys VSTAR (`Trainer Gallery Holo Rare V`) -> `Illustration Rare`
- Radiant Eternatus (`Radiant Rare`) -> `Ultra / Radiant Rare`

**Root cause:** physical TCG trade matching collapsed both classes into the same broad numeric trade tier, so the marketplace could label the pair as a matched-rarity trade.

**Fix:** physical TCG listings now match by the exact LuckyDex canonical rarity class, mirroring the already-strict Pocket rarity behavior. The marketplace cache generation was bumped to `v0405-exact-physical-rarity`, so previously generated misclassified listings are discarded and regenerated.

## Regression coverage

New focused device-feedback regression file:

- `tests/v0405-device-feedback.test.cjs`
  - Mart quantity remains on Mart and clamps correctly
  - Mart tool body is scrollable
  - Route 30 has a useful one-time local Explore action
  - Wild Hunt chain grows on catch or faint and breaks only on flee/loss
  - Card Binder installs deterministic collection-mode switching
  - Illustration and Ultra/Radiant physical rarities cannot be treated as identical

Existing historical contracts were updated only where the product requirement intentionally changed:

- field-chain tests now retain/extend the chain on victory/faint
- old release metadata test now checks the v0.40.4+ compatibility floor rather than pinning the entire project forever to 0.40.4
- trade cache regression accepts later versioned generations
- preservation guard excludes the two newly intentional physical-rarity trade files

## Verification

### Focused regression suite

Passed: 27/27 tests in the affected Adventure, Mart, Wild Hunt, Collection and Trade areas before the broader run.

### Full non-browser suite

Static dependency traversal identified browser tests that transitively require Playwright.

- Non-browser test files executed: **308**
- Test assertions/subtests passed: **467 / 467**
- Failures: **0**
- Browser/visual test files blocked by unavailable Playwright dependency: **36**

The blocked browser files were not counted as passes.

### Syntax

`node --check` passed for all changed JavaScript runtime files:

- `adventure/adventure-tools.js`
- `adventure/adventure-location-flow.js`
- `adventure/adventure-model.js`
- `collection-browser-v0280.js`
- `card-rarity-v0253.js`
- `trade-v0163.js`
- `app-v0167.js`

## Release identity

- Package version: `0.40.5`
- Android `versionCode`: `4005`
- Android `versionName`: `0.40.5`
- Web build marker: `0.40.5`

## Remaining device QA

Because Playwright is unavailable in this environment, the following should be rechecked on the actual phone after installing/building v0.40.5:

1. Tap Mart `+`, `+10`, and `-` repeatedly; the Mart must stay visible and quantities update.
2. Scroll to the bottom of the Mart list and back to the top.
3. Enter Johto Route 30 and use `EXPLORE AREA` once.
4. Faint a wild Pokémon in Wild Hunt and confirm the chain increases rather than resets.
5. Open Pokédex, then switch directly to Card Binder without changing set; card art must appear immediately.
6. Open Trade and confirm regenerated physical listings no longer call Illustration Rare vs Ultra/Radiant Rare a matched-rarity trade.
