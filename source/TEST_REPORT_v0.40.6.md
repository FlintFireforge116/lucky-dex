# LuckyDex v0.40.6 — Test / Handover Report

## Scope

v0.40.6 continues from the supplied v0.40.5 source. This pass intentionally covers:

- the persistent Pokédex -> Card Binder live-state regression;
- a shared persisted/claim-once Arcade rare-reward foundation; and
- Tile Puzzle landscape presentation, scene-quality filtering, rare card/booster puzzles, and hidden present rewards.

No Codex handoff was used for this pass.

## Card Binder regression

Root cause: `collection-browser-v0280.js` still unconditionally accessed the removed legacy `#teamPanel` element while rebuilding card controls. The Card Binder button could therefore become visually active before the handler threw, leaving the underlying Pokédex summary/search/grid on screen.

The rebuild now treats that retired element as optional. A VM-based runtime regression test performs the actual Pokédex -> Card Binder click with no `teamPanel` present and verifies card tiles, card search copy and active mode immediately replace the sprite grid.

## Shared rare-reward foundation

New `arcade-rare-rewards.js` stores live attempts under `state.arcade.rareRewards` and provides:

- create-or-reuse attempt semantics;
- persisted attempt patches;
- claim-once receipts;
- safe retry when granting fails; and
- explicit abandonment for completed attempts with no earned rare reward.

This enforces the intended `ROLL ONCE -> PERSIST FOR THAT ATTEMPT -> CLAIM ONCE` rule for Tile Puzzle and provides the reusable base for later Berry Picker / Unown passes.

## Tile Puzzle

### Landscape

A LANDSCAPE / PORTRAIT control uses the existing Android orientation bridge when available. In landscape the puzzle becomes a two-column workspace: the board gets the wide side while reference, controls, status and actions remain in a compact reachable rail. Leaving Tile Puzzle restores portrait orientation.

### Image-quality exclusions

An image/tile-signature audit found scene/difficulty combinations with excessive visual ambiguity. The scene manifest now excludes:

- Ruins of Alph: Easy / Normal / Hard
- Celadon Game Corner: Normal / Hard
- Indigo Plateau: Hard
- Lilycove Contest Hall: Hard
- Oreburgh City: Hard

Existing visual-equivalence tolerance remains as a safety net, while the problematic combinations are no longer selected normally.

### Rare reward puzzles

On creation of a new persistent puzzle attempt:

- 0.4% chance: rare card puzzle
- 0.4% chance: rare booster puzzle
- otherwise: normal scene puzzle

The special event is persisted before play and does not reroll on leaving/reopening or orientation changes. Once the exact card/booster resolves, that reward is stored on the same attempt and the puzzle image becomes that reward. Completion grants through the claim-once reward path.

### Present tiles

Normal puzzles have a 1.8% chance to contain one hidden present tile. Tapping/revealing its numbered tile persists discovery; the icon follows that tile as pieces move. The gift is awarded only after the entire puzzle is completed. Current random gifts are Lucky Coins, Card Dust or a Pack Ticket.

## Compatibility retained

Older Tile Puzzle contracts were kept intact:

- the studied preview picture is the picture used when START is pressed;
- the enlarged reference uses the same target image;
- consecutive completed puzzles avoid immediately repeating the prior normal scene when alternatives exist; and
- Easy / Normal / Hard grid sizes remain 4x5, 5x6 and 6x8.

## Verification

Fresh source-tree verification before packaging:

- JavaScript syntax checks: PASS for all modified/new runtime JS files.
- Focused v0.40.6 tests: PASS.
- Historical Tile Puzzle reference/scene contracts: PASS.
- Collection and v0.40.4/v0.40.5 regression tests: PASS.
- Preservation guard: PASS, 5,956 protected baseline files unchanged.
- Full runnable non-browser suite: **481 / 481 tests PASS across 313 test files**.
- Browser-dependent files unavailable in this environment: **36**. Each depends directly or indirectly on Playwright, which is not installed in this source environment. They are classified as blocked rather than passed.

There is no Gradle executable/wrapper in this environment, so an Android APK build was not claimed here. The supplied permanent keystore and application identity remain present and the release metadata tests pass.

## Device checks recommended

1. Open Collection -> Pokédex, then immediately press Card Binder without changing set/filter. Card art and card-specific controls should appear immediately.
2. Open Tile Puzzle in portrait, press LANDSCAPE, and confirm the board uses the left/wide area with controls reachable on the right.
3. Leave Tile Puzzle and verify the app returns to portrait.
4. Start a normal Tile Puzzle, leave, reopen, and verify the same attempt/picture remains rather than rerolling.
5. Rare card/booster/present events are deliberately too uncommon for a quick manual smoke test; their roll/persist/claim-once paths are covered by deterministic tests.
