# LuckyDex v0.40.4 Test / Handover Report

## Baseline

- Supplied baseline: LuckyDex v0.40.3 source ZIP.
- Implementation mode: native/direct editing; Codex was not used.
- Release metadata updated to v0.40.4 / Android versionCode 4004.
- Existing player save/economy structures were preserved; no intentional save reset or signing change was made.

## Completed in v0.40.4

### Adventure interaction and navigation

- Removed the redundant local Wild Hunt / Rare Pokémon style action stack.
- Required wild/rare location encounters now present through one `EXPLORE AREA` action.
- Authored trainers remain a separate `TRAINER` action.
- Generic settlement Explore is not shown when it has no distinct local purpose.
- The Adventure MAP button now opens an active-journey map view rather than region selection.
- NOTE: authentic replacement artwork for every Kanto town/route is still a separate outstanding pass. The supplied custom location scenes were not replaced wholesale in this release.

### Battle mechanics and UI

- Multi-hit move metadata is now executed generically; Fury Swipes resolves 2–5 hits and spends PP once.
- Yawn now applies delayed sleep instead of silently doing nothing.
- Fight / Bag / Pokémon drawers remember the last selected battle menu until the player closes it.
- Player EXP is visible in the battle HUD with bar and numeric progress.
- Compact move choices / move-learning comparisons now show Power and PP.

### Poké Mart

- Fixed bundles replaced with quantity selection controls.
- Purchase quote/confirmation uses the chosen quantity.
- Buying Poké Balls awards one Premier Ball per 10 Poké Balls in the transaction.
- Premier Ball is a usable 1× capture ball.
- Existing transaction rollback behaviour now covers both bought items and Premier Ball bonuses atomically.

### Rock Harden

- Added multiple local Gen III rock visuals.
- Added dangerous Graveler, Golem, Ferroseed and Pincurchin falling hazards with higher damage than ordinary heavy rocks.
- Added Oran and Sitrus Berry drops: do not Harden to collect/heal; Hardening through them misses the heal.
- Hard difficulty now randomises fall speed per wave within bounded timing rather than using one fixed fall rhythm.
- CPU timing remains tied to each wave's actual impact time and does not Harden against berry drops.

### Regression / cleanup fixes

- Removed full regional journey completion from the daily challenge pool; replaced with an Adventure battle-sized daily goal.
- Existing same-day saves containing the removed daily task regenerate the invalid daily safely.
- Card Binder clears stale Pokédex sprite tiles before drawing card art, preventing the set-change-only visual refresh bug.
- Arcade world/location viewport can scroll vertically above the persistent bottom navigation so lower location buttons are reachable.

## Deferred master-plan passes

The following remain intentionally outstanding for later releases:

- Full authentic Kanto location-map replacement / asset audit.
- Shared rare-reward framework for new jackpot events.
- Tile Puzzle landscape layout, source-image quality filtering, rare card/pack puzzles and present tiles.
- Berry Picker rare card/pack/dust/voucher requests.
- Shiny Unown letter reward flow.
- Dedicated Achievements sub-screen / Profile cleanup.

These were not partially stubbed into production code in v0.40.4.

## Verification

### Fresh exhaustive non-browser audit

A final audit executed every test file that does not require the unavailable Playwright dependency:

- 316 / 316 test files passed.
- 0 non-browser test files failed.
- 26 browser-dependent files are blocked in this environment because `playwright` is not installed.

The normal `npm test` command therefore exits non-zero at the first browser/recovery test with:

`Error: Cannot find module 'playwright'`

This is an execution-environment limitation, not recorded as a passing browser suite. Browser/mobile screenshot QA should be rerun after Playwright is available or on the built Android app.

### Focused changed-owner coverage

Green focused coverage includes:

- Adventure location flow and scene navigation.
- Battle reducer / real battle / Adventure 3 battle suites.
- v0.40.4 multi-hit, Yawn, sticky drawer, EXP and move-view tests.
- Mart quoting, rollback and Premier Ball tests.
- Card Binder and set picker regression suites.
- Daily / Arcade clipping regressions.
- Rock Harden core, CPU balance, lifecycle, runtime, Gold reward, integration, presentation, roster and v0.40.4 hazard expansion tests.
- Preservation checks for unchanged baseline files.
- Shared function declaration preservation checks.
- v0.40.4 release metadata checks.

## Continuation rule

Use `LuckyDex_Master_Update_Continuation_Plan.txt` in future chats. Every new chat must audit the current supplied baseline against the master plan and mark each pass DONE / PARTIAL / NOT DONE / REGRESSED before implementing anything. Do not redo v0.40.4 work merely because the requirement still appears in the master plan.
