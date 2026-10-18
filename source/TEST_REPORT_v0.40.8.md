# LuckyDex v0.40.8 Test Report

## Scope

v0.40.8 is the rare-event usability/testing pass built on v0.40.7.

### Golden Berry
- Berry Picker rare requests no longer expose the hidden reward asset during play.
- The requested fruit in the thought bubble and the matching pickable fruit are rendered as the same solid-gold berry silhouette.
- Drag ghosts preserve the gold treatment.
- The Golden Berry can surface before remote card/pack reward resolution finishes; the reward is still persisted and resolved/claimed safely at run completion.
- Correct delivery banks a mystery reward; missing it forfeits the reward.
- Successful Golden Berry rewards use the shared pre-results reveal screen. Card/pack rewards show art when available; Dust/Vouchers use a dedicated visual fallback.

### Unown Decoder
- CASH OUT is hidden on the idle/start page and only appears when a live bank can actually be cashed out.
- Multi-word glyph rows now size against both width and available vertical space, preventing the lower row from being clipped in the keyboard overlay.

### Configurable rare odds
Settings now expose saved controls for:
- Golden Berry request — vanilla 3%
- Shiny Unown — vanilla 1/250 (0.4%)
- Tile Puzzle card — vanilla 1/250 (0.4%)
- Tile Puzzle pack — vanilla 1/250 (0.4%)
- Tile Puzzle present — vanilla 1.8%

Each control offers Off, the clearly labelled Vanilla value, boosted testing odds, and Always. Existing normal Pokémon shiny odds now explicitly label `Lucky Dex (Vanilla) · 1/2048`.

Changing these settings affects only newly created rare-event attempts/questions. Persisted attempts are deliberately not rerolled, preserving the anti-exploit `ROLL ONCE -> PERSIST -> CLAIM ONCE` contract.

## Focused red/green coverage

New tests:
- `tests/v0408-rare-odds.test.cjs`
- `tests/v0408-integration.test.cjs`
- `tests/v0408-reward-reveal.test.cjs`
- `tests/v0408-release.test.cjs`

Compatibility coverage included:
- v0.40.7 Berry/Unown rare-event contracts
- v0.40.6 Tile Puzzle core/integration contracts
- historical Unown flow/UI/layout contracts
- shared Arcade result/card-reveal contracts
- release identity and protected shared-function contracts

## Verification

Source-tree exhaustive file-by-file test sweep:
- 330 runnable `.cjs` test programs: PASS
- 32 Playwright-dependent programs: BLOCKED by missing Playwright runtime in this environment
- genuine failures: 0
- timeouts: 0

The blocked programs are browser/device harnesses and are not counted as passes.

JavaScript syntax checks passed for all changed runtime JS files.

Offline asset verification:
- authentic Arcade v0.20 assets: PASS
- v0.22.3 venue assets: PASS
- Adventure assets: PASS (829 images / 1,025 species / 386 back-sprite species)
- Fossil Museum assets: PASS (42 images)

Preservation checks:
- 5,948 protected baseline files preserved after excluding intentional v0.40.4-v0.40.8 changes.
- 211 shared save/pack/Collection/Dust/trade/navigation function declarations preserved exactly.

Release identity:
- package version: 0.40.8
- Android versionName: 0.40.8
- Android versionCode: 4008
- asset-builder user agent: 0.40.8
- runtime/title UI build label: 0.40.8

## Device checks recommended

1. Settings -> set Golden Berry to Always -> start a fresh Berry Picker run.
   - A request should visibly become gold.
   - The matching fruit on the tree should be a solid-gold version of the berry, not a card/pack/dust icon.
   - Deliver it and finish the run; the mystery reward should reveal before the normal result summary.
2. Settings -> set Shiny Unown to Always -> start a fresh Unown question.
   - Confirm the shiny glyph is visible and the answer screen does not clip two-word answers with the keyboard open.
3. Open Unown Decoder without starting.
   - CASH OUT should not be visible.
4. Set Tile Puzzle card/pack/present odds to boosted/Always values and test fresh puzzle attempts.
   - Existing persisted puzzle attempts will not reroll merely because settings changed; finish/consume the current attempt first.
5. Restore all rare-event selectors to their labelled Vanilla values after testing.
