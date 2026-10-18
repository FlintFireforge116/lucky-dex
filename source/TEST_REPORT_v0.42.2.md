# LuckyDex v0.42.2 Test Report

## Scope

v0.42.2 is the Target Range landscape/archery rework. It keeps the v0.42.1 Goldenrod tournament, rewards, records, type attacks and scoring systems intact while changing the live Target Range presentation and pacing to a calmer downrange target-shooting format.

No Codex was used for this release.

## Implemented changes

- Replaced the top-down/vertical Target Range composition with a horizontal scenic downrange presentation.
- Added a real horizon/ground treatment with 10–50 m depth markers and type-themed distant scenery.
- Moved the player Pokémon to the left foreground and placed targets downrange according to their actual distance.
- Added `rangeYForDistance()` so farther targets sit closer to the horizon.
- Reduced reticle size and made it visibly tighten while focus settles.
- Increased focus settle cap from 550 ms to 850 ms for a more deliberate draw/aim/release rhythm.
- Slowed moving targets, reduced their travel amplitude and increased their exposure windows.
- Removed the target-escape/`TOO SLOW` timer: Target Range no longer pressures the player like a race.
- Slowed projectile travel slightly and increased the importance/readability of distance drop while reducing wind drift somewhat.
- Replaced the old split point-to-point projectile path with a smooth ballistic quadratic path from the foreground Pokémon to the exact solved scoring impact point.
- Preserved single-screen mobile play with no gameplay scrolling.
- Bumped release identity to 0.42.2 / Android versionCode 4202.

## TDD coverage

New regression files:

- `tests/v0422-target-range-landscape.test.cjs`
  - distance-to-depth mapping
  - slower projectile travel
  - calmer moving targets / longer exposure
  - smooth ballistic visual path ending at the solved impact
  - horizontal scenic range and foreground Pokémon composition
  - smaller focus-tightening reticle
  - no target escape timer
  - foreground projectile launch coordinates
- `tests/v0422-target-range-release.test.cjs`
  - package/package-lock 0.42.2
  - Android versionCode 4202 / versionName 0.42.2
  - asset-builder user agent 0.42.2
  - visible/runtime build identity 0.42.2

Existing Target Range tests whose assertions described superseded v0.42.1 presentation/timing were updated to assert the approved v0.42.2 behavior instead. Related Power/Impact release-identity assertions were updated only from 0.42.1/4201 to 0.42.2/4202.

## Fresh verification on final tree

### Goldenrod + Target Range focused release suite

17 test files covering the shared Goldenrod tournament framework, Dash/Power/Impact adapters, Target Range core/UI/progression/tournaments, v0.42.1 polish regressions and v0.42.2 landscape/release regressions.

Result: **81/81 passed**, 0 failed.

### Adjacent Arcade / persistence / rewards / Power / Impact regressions

21 test files covering Arcade platform/session behavior, records state/core/UI/registry/session review, rare rewards/odds/reveal visuals, achievements, Power Trial and Impact Trial.

Result: **87/87 passed**, 0 failed.

### Browser-independent Dash regression suite

15 Dash test files excluding the Playwright browser test.

Result: **21/21 passed**, 0 failed.

### JavaScript syntax

`node --check` passed for:

- `app/src/main/assets/arcade-target-range-core.js`
- `app/src/main/assets/arcade-target-range.js`
- `app/src/main/assets/app-v0167.js`

### Offline asset verification

- Arcade authentic scenes/sheets/crops: **44 passed**
- Offline Arcade sprites: **2098 passed**
- Unretouched Arcade actors: **2078 passed**
- Local venue assets: **8 passed**
- Adventure asset verifier: **passed**, 0 errors (829 images, 1025 species, 386 back sprites, 37 registry objects)
- Fossil Museum assets: **42 passed**

## Historical full-suite limitation

`npm test` was run on the final v0.42.2 tree. The first three historical test files complete with **46/46 tests passing** (5 + 23 + 18), then `adventure-core.test.cjs` cannot start because `scripts/recovery-browser.cjs` requires the unavailable `playwright` package:

`Error: Cannot find module 'playwright'`

Therefore the historical full suite is **not claimed as passed**. This is the same environment/dependency limitation seen in previous releases, not a v0.42.2 Target Range failure.

## Final self-review

A file-level comparison against the packaged v0.42.1 baseline found changes only in:

- Target Range runtime/core/CSS
- release identity files
- Target Range v0.42.2 regressions and intentionally superseded Target Range assertions
- related historical tests whose only required change is the current release identity
- this release report / existing project documentation workspace

No separate reviewer subagent is available in this harness, so the final code review was an author self-review. No Critical/Important findings remain and no minor findings are deferred.
