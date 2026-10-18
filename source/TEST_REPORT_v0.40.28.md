# LuckyDex v0.40.28 verification report

## Scope

v0.40.28 expands Clear Cut Challenge and corrects the TCG Pocket special Rare Pack path.

### Clear Cut Challenge
- Removed CPU competitors and placement/win scoring; five scored cuts now form a solo accuracy total out of 100.
- Added five distinct phone-safe object angles per run.
- Added visible two-piece cut separation, rotation and falling animation at the player's actual cut line.
- Moved Clear Cut from Pokémon Stadium 1 · Kids Club into a new Pokémon Stadium 2 · Kids Club venue.
- Added one unscored Mystery Bag bonus cut after the five scored cuts. A PERFECT cut uses the established claim-once rare-reward bridge and Voltorb gift reward table (Lucky Coins, Card Dust, Pack Voucher, random card, or sealed booster). The bonus cannot change the /100 accuracy score.
- Updated Clear Cut records and achievements to accuracy-based requirements while retaining legacy save fields/achievement IDs for compatibility.

### TCG Pocket Rare Pack
Root cause investigation found two distinct special-pack paths:
- True LuckyDex God Packs already used the God Pack intro/stat path.
- The separate TCG Pocket `luckyPack` path used the broad hit pool `double-rare`, `ultra`, `illustration`, `special-illustration`, `historic-chase`, `secret` and had no special intro. That admitted ordinary Four Diamond ex cards (`double-rare`) and visually resembled an unexplained God Pack.

Fix:
- TCG Pocket Rare Packs now accept only `ultra`, `illustration`, `special-illustration`, and `secret` classes. Ordinary Four Diamond ex / `double-rare` cards are excluded.
- Rare Packs now get their own `RARE PACK` intro, running badge, and `RARE PACK COMPLETE` summary.
- True God Pack logic, odds, stats, and intro remain separate and unchanged.

## Test-first evidence

The new v0.40.28 tests were written against the v0.40.27 baseline and first failed for the missing behavior before implementation:
- `tests/v0428-clear-cut-expansion.test.cjs`
- `tests/v0428-pocket-rare-pack.test.cjs`
- `tests/v0428-release.test.cjs`

## Fresh verification

### Feature and compatibility regressions
20 directly impacted test files: **72 tests passed, 0 failed**. This includes:
- v0.40.28 Clear Cut expansion / Rare Pack / release tests
- v0.40.27 Clear Cut compatibility
- God Pack v0.29.1 / v0.29.2 contracts
- pack builder/collation and full pack audits
- achievements and Arcade Records
- existing Stadium 1 Kids Club games
- preservation guard

### Shared rare-reward infrastructure
4 focused files: **20 tests passed, 0 failed**, covering claim-once persistence, failed-claim retry behavior, rare reward reveal plumbing, and the Voltorb gift reward table.

### JavaScript syntax
`node --check` passed for all 9 modified JavaScript production files checked:
- `arcade-clear-cut-core.js`
- `arcade-clear-cut.js`
- `arcade-world.js`
- `arcade-platform.js`
- `arcade-records.js`
- `achievements-v0341.js`
- `pack-policy-v0343.js`
- `pack-flow-v0165.js`
- `app-v0167.js`

### Preservation comparison
Against the v0.40.27 source baseline:
- Baseline files checked: 7,510
- Current files checked before this report: 7,514
- Unchanged files: **7,490**
- Intentional changed/new files: **24**
- Unexpected changed files: **0**

### Full project runner boundary
`npm test` freshly ran the first three suites successfully:
- `adventure-battle-v0404.test.cjs`: 5/5
- `adventure-battle-v0411.test.cjs`: 23/23
- `adventure-battle.test.cjs`: 18/18

That is **46 tests passed, 0 failed** before the runner reaches `adventure-core.test.cjs`, where this environment stops because the `playwright` module is not installed. No browser/Playwright coverage is claimed.

## Release identity
- package version: `0.40.28`
- Android versionCode: `4028`
- Android versionName: `0.40.28`
- runtime build marker: `0.40.28`
