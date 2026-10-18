# LuckyDex v0.43.1 Test Report

## Scope

Focused Impact Trial low-Defense expression correction built from v0.43.0 after live play feedback with Chansey (Defense 5) on Easy.

### Root cause

v0.43.0 still flattened the extreme low end in two places:

- the shared Goldenrod curve clamps every stat at or below 20 to the same 0.65 factor, so Defense 5 and Defense 20 could not feel meaningfully different inside Impact Trial;
- Impact Trial's Defense workload was capped at only +24%, while unblocked damage used only gentle mitigation, so even a Defense 5 Pokémon received only a few extra Harden targets and could absorb several completely undefended impacts.

### Changes

- Added an Impact-specific low-Defense extension below 20 while retaining the approved shared Goldenrod curve from 20 upward.
- Harden workload now rises sharply at very low Defense while keeping existing simultaneous-target readability caps.
- Low-Defense unblocked impacts now apply a strong fragility multiplier; high Defense still mitigates damage.
- Perfect Harden target collection remains an exact zero-damage outcome at every Defense value.
- Impact Trial CPU simulation now uses the same extra low-Defense separation, so Defense 5 is no longer simulated identically to Defense 20.
- Other Goldenrod games and the shared stat curve were not changed.

## Reference checks

Easy training, deterministic target generation:

| Defense | Rolling Boulder | Tauros Charge | Rock Slide | Falling Weight | Final Barrage |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | 12 | 14 | 16 | 12 | 21 |
| 20 | 9 | 11 | 12 | 9 | 16 |
| 40 | 8 | 9 | 10 | 8 | 13 |
| 60 | 6 | 7 | 8 | 6 | 10 |
| 120 | 5 | 5 | 5 | 5 | 7 |
| 180 | 5 | 5 | 5 | 5 | 7 |

Easy training damage when collecting zero Harden targets:

| Defense | Rolling Boulder | Tauros Charge | Rock Slide | Falling Weight | Final Barrage |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | 84 | 102 | 111 | 120 | 137 |
| 20 | 55 | 66 | 72 | 78 | 89 |
| 40 | 38 | 46 | 50 | 54 | 62 |
| 60 | 24 | 29 | 32 | 34 | 39 |
| 120 | 17 | 21 | 23 | 24 | 28 |
| 180 | 14 | 17 | 18 | 20 | 23 |

Integrity is clamped at zero, so values above 100 are one-hit knockouts. Defense 5 therefore loses 84 integrity to the first Easy hazard and is one-shot by later completely undefended impacts. Perfect target collection remains zero damage.

## TDD verification

The new v0.43.1 regression tests were observed RED on the v0.43.0 behavior and GREEN after implementation for:

- dramatically heavier Defense 5 Easy workload;
- Defense 5 near-one-shot fragility when collecting no shields;
- distinct 5 < 20 < 40 low-end Defense progression;
- Impact Trial CPU using the same below-20 separation;
- v0.43.1 release identity.

## Final focused regression run

A fresh non-browser Goldenrod/Impact regression run covered shared tournament core/state/UI/integration/settlement, Dash/Power/Impact tournament adapters, Target Range core/progression/tournament/UI and Rookie balance, picker sorting, v0.43.0 shared stat/AI/trophy contracts, all Impact Trial Harden/input suites, and the new v0.43.1 tests.

Result: **116 / 116 tests passed**.

A broader historical category sweep was also attempted. It encounters known/superseded historical failures (old release-identity assertions and older Dash/Target Range behavior contracts), so it is not claimed as a clean suite. The current focused release contracts above are green.

## Syntax checks

`node --check` passed for the changed runtime JavaScript files:

- `arcade-impact-trial-core.js`
- `arcade-goldenrod-adapters.js`
- `app-v0167.js`

## Offline asset verification

Passed:

- `python3 scripts/fetch_arcade_v0200_assets.py --check`
  - 44 authentic scenes/sheets/crops verified.
  - 2,098 Arcade sprites verified.
  - 2,078 unretouched Arcade actors verified.
- `python3 scripts/verify_v0223_venues.py`
  - 8 local venue assets verified.
- `python3 scripts/verify_adventure_assets.py`
  - passed, 829 images / 1,025 species / 386 back sprites / 37 registry objects, 0 errors.
- `python3 scripts/verify_fossil_museum_v0250_assets.py`
  - 42 Fossil Museum images verified.

## Historical full-suite limitation

`npm test` was attempted on the final v0.43.1 tree.

- `adventure-battle-v0404.test.cjs`: 5 / 5 passed.
- `adventure-battle-v0411.test.cjs`: 23 / 23 passed.
- `adventure-battle.test.cjs`: 18 / 18 passed.
- Total before browser-dependent stop: **46 / 46 runnable assertions passed**.
- `adventure-core.test.cjs` then stops because the environment does not have the declared `playwright` package installed.

This is the same pre-existing browser-test environment limitation as recent LuckyDex releases. No Playwright-dependent browser suite is claimed as passing.

## Release identity

- Package version: `0.43.1`
- Android versionName: `0.43.1`
- Android versionCode: `4301`
- Android application ID unchanged: `com.example.luckydex`
