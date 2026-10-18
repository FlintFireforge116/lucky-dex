# LuckyDex v0.42.5 Test Report

## Scope

Bounded usability update to the shared Goldenrod Challenge Course Pokémon picker.
No event mechanics, tournament scoring, AI balance, rewards, records, achievements,
or save progression were intentionally changed.

## Changes verified

- Shared Goldenrod participant picker now exposes Search + Sort controls.
- Search matches Pokémon name or Pokédex number.
- Sort options adapt to each event's relevant stat:
  - Dash: Speed
  - Power Trial: Attack
  - Impact Trial: Defense
  - Target Range: Sp. Atk
- Relevant stat can be sorted highest or lowest.
- Additional sort modes: Level highest, Name A-Z, Name Z-A, Pokédex number.
- Division and Type Cups group eligible Pokémon before ineligible Pokémon, then apply the selected sort within each group.
- Exhibition remains unrestricted.
- Picker controls use the shared Goldenrod UI, so current and future Goldenrod events can reuse the same behavior.

## TDD evidence

`tests/v0425-goldenrod-picker-sort.test.cjs` was added before implementation.
Initial run: 0/4 passing because the sort/search API and UI controls did not exist.
After implementation: 4/4 passing.

`tests/v0425-goldenrod-picker-release.test.cjs` was added before the release bump.
Initial run failed on v0.42.4 identity. After the release bump: 1/1 passing.

## Final focused verification

Command: Node test runner over Goldenrod core/UI/state/settlement/integration,
Dash/Power/Impact tournament contracts, Target Range core/UI/tournament/progression,
v0.42.4 Target Range balance, and the v0.42.5 picker/release tests.

Result: **80/80 passed**.

A broader run including `tests/v0422-target-range-landscape.test.cjs` reached
80 passing tests before that browser-driven file failed to start because the
`playwright` package is not installed in this environment. This is an environment
limitation, not a product assertion, so no browser-suite pass is claimed.

## Syntax and offline assets

- `node --check app/src/main/assets/arcade-goldenrod.js` — PASS
- `python3 scripts/fetch_arcade_v0200_assets.py --check` — PASS
  - 44 authentic scenes/sheets/crops verified
  - 2,098 offline Arcade sprites verified
  - 2,078 unretouched Arcade actors verified
- `python3 scripts/verify_v0223_venues.py` — PASS (8 venue assets)
- `python3 scripts/verify_adventure_assets.py` — PASS (829 images, 1,025 species)
- `python3 scripts/verify_fossil_museum_v0250_assets.py` — PASS (42 images)

## Historical full-suite attempt

`npm test`:
- 46/46 runnable tests passed across the first three suites.
- The runner then stopped at `adventure-core.test.cjs` because `playwright`
  is unavailable in this environment.
- Therefore the complete historical suite is **not** claimed as passed.

## Release identity

- package version: `0.42.5`
- Android versionName: `0.42.5`
- Android versionCode: `4205`
- applicationId remains `com.example.luckydex`
