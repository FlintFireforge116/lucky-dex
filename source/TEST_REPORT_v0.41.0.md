# LuckyDex v0.41.0 Test Report

## Scope

Goldenrod Challenge Course tournament framework, built from the supplied v0.40.39 source. No Codex was used.

## Goldenrod tournament framework

- Added one shared Goldenrod Challenge Course shell for Pokémon Dash, Power Trial and Impact Trial.
- Added six event cards: Dash, Power Trial and Impact Trial are active; Target Range, Elemental Gauntlet and Endurance Expedition are reserved as future events.
- Added three modes per built event:
  - Exhibition: unrestricted stats with explicit Easy / Normal / Hard selection.
  - Division Cup: three rounds, six entrants, main progression.
  - Type Cup: three themed rounds using the same unlocked division cap.
- Competitive divisions use the approved maximum relevant-base-stat caps:
  - Rookie <= 59
  - Poké <= 89
  - Great <= 119
  - Ultra <= 149
  - Master unrestricted
- Lower-stat Pokémon may enter higher unlocked divisions; over-cap Pokémon cannot enter lower competitive divisions.
- Cup scoring is exactly 10 / 6 / 4 / 3 / 2 / 1 per round.
- Top-three Division Cup finishes unlock the next division. Rookie podium unlocks Type Cups. Type Cups do not advance the division ladder.
- Gold / Silver / Bronze are recorded for 1st / 2nd / 3rd.
- Added shared between-round standings, final podium/reward reveal, and Goldenrod trophy cabinet.
- Added API-side progression guards so locked divisions and locked Type Cups cannot be started by a caller even if UI validation is bypassed.

## Pokémon Dash

- Dash now enters through the shared Goldenrod shell and tournament progression while retaining its existing six-racer top-down race gameplay.
- Active races remain outdoors.
- Division Cups use the neutral outdoor route.
- All existing type themes remain available for Type Cups; e.g. Fire remains volcanic rather than moving into the indoor Dome.
- Existing stamina, lane steering, hazards, pickups and sprint behaviour are retained.
- Goldenrod divisions map to the existing Dash AI ladder with an interpolated Poké profile.
- Legacy Dash type-league data is retained and migrated into the shared Goldenrod progression without deleting the old save data.

## Power Trial

- Added Goldenrod Division/Type tournament rounds using Attack as the relevant stat.
- Attack contribution now uses diminishing returns and contributes 33% of strike power; execution contributes 67%, keeping timing/accuracy dominant.
- Higher divisions tighten charge/impact timing progressively rather than relying on raw stat inflation.
- Tournament rounds report to the shared standings system and suppress ordinary per-run Exhibition settlement.
- Golden Target prizes are still awarded immediately when earned and carried as a receipt into the cup's final reward reveal.

## Impact Trial

- Added Goldenrod Division/Type tournament rounds using Defense as the relevant stat.
- Retains v0.40.39 countdown, continuous swipe-path hit detection, coalesced pointer handling, fade-hit grace, lowered 78% guard line and falling shields that stop at the impact line.
- Higher divisions are harder through shorter timing/grace, smaller effective hit radius, quicker tempo and slightly denser target plans, while readable simultaneous-target caps remain enforced.
- Master still caps ordinary simultaneous targets at 3 and Final Barrage at 4; difficulty is not created by returning to screen-filling spam.
- Perfect target completion at every division remains 100% Harden and zero damage.
- Golden Hazard prizes remain immediate awards with final-cup receipt presentation only; they are never re-awarded at cup settlement.

Division Impact profiles (round 1 base):

| Division | Time | Count | Target size | Damage | Max live | Barrage max | Grace | Hit radius |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Rookie | 1.08 | 0.90 | 1.08 | 0.95 | 2 | 3 | 190 ms | 1.10 |
| Poké | 1.02 | 0.96 | 1.03 | 1.00 | 3 | 3 | 170 ms | 1.05 |
| Great | 0.96 | 1.00 | 1.00 | 1.08 | 3 | 3 | 145 ms | 1.00 |
| Ultra | 0.91 | 1.04 | 0.95 | 1.16 | 3 | 4 | 120 ms | 0.94 |
| Master | 0.86 | 1.08 | 0.90 | 1.25 | 3 | 4 | 100 ms | 0.88 |

Rounds 2 and 3 tighten timing/grace further without raising those live-target caps.

## AI, progression and persistence

- Added shared event adapters for Speed / Attack / Defense tournament metrics.
- AI opponents are chosen from the local species dataset, so cups can build a legal six-Pokémon field even when the caught collection is small.
- AI selection respects both division caps and Type Cup type restrictions.
- AI profiles have consistency, risk, mistakes, peak performance and variance; quality rises by division while Master still has non-zero mistake/variance.
- Shared Goldenrod save state lives under `state.arcade.goldenrod.version === 1`.
- Existing saves normalize non-destructively; unknown/legacy data is preserved.
- Active cups are intentionally session-only in v0.41.0. Leaving a cup abandons final cup payout/progression while preserving any rare prize already awarded during a round.
- Cup settlement is guarded so repeated completion callbacks cannot duplicate the tournament payout/progression.

## Rewards, records and achievements

Cup coin rewards by final place (1st through 6th):

- Rookie: 240 / 160 / 110 / 70 / 50 / 40
- Poké: 300 / 200 / 140 / 90 / 65 / 50
- Great: 380 / 250 / 175 / 115 / 80 / 60
- Ultra: 480 / 320 / 220 / 145 / 100 / 75
- Master: 620 / 410 / 285 / 185 / 125 / 95

Tournament records are compact: best division placement/points/aggregate metric plus Type Cup trophies; existing Exhibition records remain intact.

Added tournament achievements:

- First Podium
- Division Champion
- Master Champion
- Type Specialist
- Speed Master
- Power Master
- Iron Wall Master
- Goldenrod Grand Champion

The existing Impact Trial achievement named `Iron Wall` remains preserved separately.

## Release-review fixes (TDD)

Two gaps were found during the final self-review and fixed before packaging:

1. Exhibition was described as Easy / Normal / Hard but the shared shell routed directly to Normal. A failing UI regression was added first, then an explicit Exhibition difficulty screen and selected-difficulty routing were implemented. The regression then passed.
2. The UI disabled locked divisions / Type Cups, but the exported `startCup()` API did not independently reject them. A failing integration regression was added first, then API-side progression guards were implemented. The regression then passed.

No independent subagent reviewer is available in this harness, so the final branch review was a separate author self-review against the approved spec and acceptance criteria.

## Fresh verification

### Goldenrod-specific suite

`node --test` across the nine new Goldenrod tournament files:

- 33 tests passed
- 0 failed

This covers the shared core/state/adapters/UI, Dash, Power, Impact, settlement and deterministic end-to-end integration.

### Focused regression suite

A combined `node --test` run across v0.41.0, Power/Impact v0.40.31-v0.40.39, platform/session, save migration, records and achievements completed with:

- 126 tests passed
- 0 failed

### Dash regression

All Dash tests that do not require Playwright:

- 29 tests passed
- 0 failed

### JavaScript syntax

`node --check` passed for all 17 modified/new runtime JavaScript files.

### Offline asset integrity

Passed freshly after the final code changes:

- 44 authentic Arcade scenes/sheets/crops checksum validation
- 2,098 offline Arcade sprite validation
- 2,078 unretouched Arcade actor source/output validation
- all 8 local venue assets
- Adventure verifier: 829 images / 1,025 species / 386 back sprites / 37 registry objects / 0 errors
- Fossil Museum: 42 images verified

## Full-suite / baseline limitations

`npm test` was attempted freshly. The first three suites completed with 46/46 tests passing (5 + 23 + 18), then `adventure-core.test.cjs` could not start because this environment does not have the `playwright` Node module installed (`MODULE_NOT_FOUND`). The package declares Playwright as a development dependency, but `node_modules` is not present in this supplied environment. No claim is made that Playwright-dependent browser/screen checks ran here.

Two supplied-baseline issues are also unchanged:

- `tests/adventure3-preservation.test.cjs` has a pre-existing stale expected checksum for `app/src/main/assets/arcade/kids-club/SOURCES.md`. Actual SHA-256 is `265e7b169ca76365e08f8333d3ba9dda51b6750822d098120b767462c5edcbd6`; the test expects `34901cd4f05116e17bd164b031638782700d361b3159ad29a23896341859b18d`. This file was not modified by v0.41.0.
- `tests/v022-update-compat.test.cjs` cannot execute because the supplied source artifact does not contain `.github/workflows/build-apk.yml`. This workflow was absent from the v0.40.39 baseline and was not removed by this work.

The extracted supplied source also has no `.git` metadata, so implementation checkpoints were recorded in the local execution ledger/test report rather than committed inside this workspace.

## Release identity

- package version: `0.41.0`
- Android `versionCode`: `4100`
- Android `versionName`: `0.41.0`
- runtime build: `0.41.0`
- visible app version: `v0.41.0`
