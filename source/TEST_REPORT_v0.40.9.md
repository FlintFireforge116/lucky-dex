# LuckyDex v0.40.9 Test Report

## Scope

v0.40.9 is a bounded rare-reward presentation and testing-controls polish pass built on v0.40.8.

### Shiny Unown
- Removed the cyan circular halo/background around the rare glyph.
- The glyph itself receives the shiny colour/filter treatment with only a small sparkle accent.
- A successfully claimed shiny-Unown card is retained in the current run's reward-reveal queue.
- Cashing out (or otherwise ending that run after earning the reward) displays the won card in the shared pre-results reveal stage before the normal Game Review.

### Tile Puzzle rare rewards
- Rare card and booster puzzles now pass the exact claimed reward into the shared reveal stage before the Game Review.
- Hidden presents now use a small transparent gift sprite rather than a dark numbered badge.
- The found message no longer relies on an emoji/number badge.
- Present rewards are named by their actual contents: `250 Lucky Coins`, `50 Card Dust`, or `Pack Voucher`.
- Completing a puzzle after finding the present shows that actual reward in the shared pre-results reveal stage and records the same label in the review.
- Existing roll-once/persist/claim-once protections remain in place.

The transparent Tile marker is an original small redraw/adaptation for LuckyDex inspired by the 18×18 Friend Gift bag sprite from Pokémon Mystery Dungeon: Gates to Infinity; source/provenance notes are packaged in `app/src/main/assets/arcade/ui/SOURCES.md`.

### Expanded rare-event odds settings
Settings now additionally expose saved controls for:
- Gold Rock — vanilla 10%
- Fossil Dig buried card — vanilla 15%
- Fossil Dig buried booster — vanilla 4%

Each keeps its existing production default and offers Off / Vanilla / boosted test odds / Always. Runtime Rock Harden and Fossil Dig generation now read the saved setting when creating a new round/site. Existing v0.40.8 controls remain unchanged.

## Focused red/green coverage

New tests:
- `tests/v0409-rare-reveal-polish.test.cjs`
- `tests/v0409-rare-odds-controls.test.cjs`
- `tests/v0409-release.test.cjs`

The new tests were first observed failing against v0.40.8 behaviour, then passed after implementation. Compatibility updates were made only where historical release/preservation tests intentionally enumerate supported later versions or intentionally changed files.

## Verification

Source-tree full Node test sweep:
- 365 `.cjs` test files discovered
- 333 runnable/non-browser test files: PASS
- 521 tests/subtests reported passing
- 32 Playwright/browser-dependent files: BLOCKED because Playwright is not installed in this environment
- genuine non-browser failures: 0

The blocked browser/device files are not counted as passes.

JavaScript syntax checks: PASS for all changed runtime JS files.

Offline asset verification:
- authentic Arcade v0.20 assets: PASS (44 scenes/sheets/crops; 2,098 offline sprites; 2,078 unretouched actors)
- v0.22.3 venue assets: PASS (8 local venue assets)
- Adventure assets: PASS (829 images / 1,025 species / 386 back-sprite species)
- Fossil Museum assets: PASS (42 images)

Preservation checks:
- 5,946 protected baseline files preserved after excluding intentional v0.40.4-v0.40.9 changes.
- existing shared save/pack/Collection/Dust/trade/navigation preservation contracts remain green.

Release identity:
- package version: 0.40.9
- Android versionName: 0.40.9
- Android versionCode: 4009
- asset-builder user agent: 0.40.9
- runtime/title UI build label: 0.40.9

## Device checks recommended

1. Settings -> Shiny Unown -> Always, then begin a fresh question.
   - The rare glyph should itself be shiny with no surrounding circular halo.
   - Solve it, then cash out; the card reveal should appear before the normal Game Review.
2. Settings -> Tile Puzzle card -> Always and Tile Puzzle pack -> Off; create a fresh puzzle, complete it and confirm the exact card reveal appears before results. Repeat with card Off / pack Always for a booster.
3. Settings -> Tile Puzzle present -> Always; create a fresh normal puzzle.
   - The hidden marker should be a small transparent gift sprite with no dark backing/number badge.
   - Finish the puzzle and confirm the actual contents are revealed and named in Game Review.
4. Set Gold Rock -> Always and start fresh Harden rounds to force-test the gold event.
5. Set Fossil Dig card / booster values independently to Always while setting the other to Off, then create fresh dig sites to force-test each event.
6. Restore every rare-event selector to its labelled Vanilla value after testing.
