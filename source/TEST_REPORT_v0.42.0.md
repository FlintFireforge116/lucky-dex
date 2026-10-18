# LuckyDex v0.42.0 Test Report

## Scope

LuckyDex v0.42.0 adds **Target Range — Special Attack** as the fourth active Goldenrod Challenge Course event. The implementation was completed natively in the supplied v0.41.0 source extract; **Codex was not used**.

Target Range uses the shared v0.41.0 Goldenrod tournament framework rather than a parallel cup system.

## Target Range gameplay

- Touch-first **hold → relative drag aim → release** control inspired by Wii Sports Resort archery.
- The reticle remains above the player's finger and preserves its last aim position between shots.
- Focus caps at roughly half a second; early release is faster but less stable/powerful.
- Visible projectile travel uses target distance, vertical drop, wind drift and target movement during flight.
- Near/mid/far targets span roughly 10–50 m and scale visually with depth.
- Target vocabulary includes stationary, crossing, swinging, pop-up and armoured targets.
- Standard scoring is Bullseye 10 / Inner 8 / Middle 6 / Outer 3 / Miss 0.
- Bullseyes extend a capped combo; Special Attack gives a modest diminishing-return stability/tolerance/power advantage but never auto-aims.
- Armoured targets always break on a bullseye regardless of Special Attack.
- Three tournament rounds are distinct: **Marksman**, **Moving Range**, **Championship Range**.
- Projectile presentation was polished in final review so the 18 attacks use recognisable silhouettes/treatments rather than colour-only dots, shots visibly animate to the solved impact point, and hits/breaks receive brief impact animation without obscuring the target.

## Type-themed attacks

| Type | Target Range attack |
| --- | --- |
| Normal | Swift |
| Fire | Flamethrower |
| Water | Water Pulse |
| Electric | Thunderbolt |
| Grass | Energy Ball |
| Ice | Ice Beam |
| Fighting | Aura Sphere |
| Poison | Sludge Bomb |
| Ground | **Mud Bomb** |
| Flying | Air Slash |
| Psychic | **Psybeam** |
| Bug | Signal Beam |
| Rock | Power Gem |
| Ghost | Shadow Ball |
| Dragon | Dragon Pulse |
| Dark | Dark Pulse |
| Steel | Flash Cannon |
| Fairy | Moonblast |

Dual-type Pokémon may select either of their own types before the run/cup; a tournament keeps that choice for all three rounds. Non-owned attack types are rejected.

## Goldenrod integration

- Target Range is the fourth active Challenge Course event.
- Exhibition remains unrestricted by stat caps and offers Easy / Normal / Hard.
- Division Cups use base Special Attack caps: Rookie ≤59, Poké ≤89, Great ≤119, Ultra ≤149, Master unrestricted.
- All 18 Type Cups use the existing shared type + division eligibility rules.
- The same five AI rivals persist through all three rounds and use seeded Special Attack-aware performance simulation.
- Shared 10 / 6 / 4 / 3 / 2 / 1 cup points, standings, podiums, trophies, progression and payouts are reused unchanged.
- Existing Dash, Power Trial and Impact Trial Goldenrod progress is preserved by additive state normalization.
- Goldenrod Grand Champion now requires Master championships in all four implemented events.

## Golden Target

- Default Golden Target odds: 2%, with Settings controls for Off / Vanilla / Test / Always.
- A normal hit still scores normally but does not win the rare reward.
- Only a true **bullseye** secures the Golden Target prize.
- Rare settlement uses the existing safe/idempotent Arcade rare-reward attempt system.
- Cup rewards are carried to the final tournament reveal; Exhibition reveals at its own result screen.

## Persistence / records / achievements

Target Range tracks games played, overall and per-difficulty best scores, best accuracy, best bullseye count, best bullseye streak, longest-distance bullseye, Golden Targets seen/won, total shots/hits/bullseyes and last Pokémon. Goldenrod Division/Type trophies remain in the shared cabinet.

New Target Range achievement coverage includes first completion, first bullseye, bullseye streak, long-distance bullseye, hidden Golden Target bullseye and Target Range Master Champion. Existing achievement and reward migration remains additive.

A lifecycle regression was found during implementation: Target Range rebuilds its DOM whenever opened, so `close()` now explicitly unbinds pointer/visibility handlers and resets the binding state. Reopening therefore binds the fresh controls instead of leaving touch input dead.

## Release identity

- package version: `0.42.0`
- Android `versionCode`: `4200`
- Android `versionName`: `0.42.0`
- Android application ID preserved as `com.example.luckydex`
- visible/index build surfaces updated to `v0.42.0`

## Fresh verification on final tree

### Goldenrod + Target Range release suite

16 focused files covering shared Goldenrod behavior, Dash/Power/Impact tournament integration, Target Range core/UI/adapter/tournament/progression and release identity:

- **68 passed / 68 total**
- **0 failed**

This includes RED→GREEN regressions for type-themed projectile silhouettes, actual visible projectile travel to the solved impact position, short projectile impact bursts, target hit/break feedback and Target Range reopen input lifecycle.

### Existing focused regressions

Power Trial, Impact Trial, Arcade platform/session, save migration, achievements and Arcade records:

- **79 passed / 79 total**
- **0 failed**

The records-registry test intentionally logs a simulated `disk full` warning while verifying save failure handling; the test passes.

The two groups above are non-overlapping, giving **147/147 focused release/regression tests passed**.

### Browser-independent Dash regression suite

All Dash tests that do not import Playwright/recovery-browser:

- **29 passed / 29 total**
- **0 failed**

### JavaScript syntax

`node --check` passed for all 12 modified/new runtime JavaScript surfaces checked:

- `arcade-target-range-core.js`
- `arcade-target-range.js`
- `arcade-special-stats.js`
- `arcade-goldenrod-adapters.js`
- `arcade-goldenrod-state.js`
- `arcade-goldenrod.js`
- `arcade-world.js`
- `arcade-session.js`
- `arcade-platform.js`
- `arcade-records.js`
- `achievements-v0341.js`
- `app-v0167.js`

Result: **12/12 syntax checks passed**.

### Offline asset audits

Fresh final-tree checks passed:

- 44 authentic Arcade scenes/sheets/crops
- 2,098 offline Arcade sprites
- 2,078 unretouched Arcade actor outputs
- 8 local venue assets
- Adventure asset audit: 829 images, 1,150,382 bytes, 1,025 species, 386 back sprites/species outputs, 37 registry objects, 0 errors
- Fossil Museum: 42 images

## Full historical `npm test` limitation

A fresh full `npm test` was attempted on the final tree. The first three suites complete successfully:

- `adventure-battle-v0404`: 5/5
- `adventure-battle-v0411`: 23/23
- `adventure-battle`: 18/18

That is **46/46 runnable tests passed before the environment stop**. `adventure-core.test.cjs` then cannot start because `scripts/recovery-browser.cjs` requires the missing Node module `playwright`.

This is reported as an environment/dependency limitation. The full historical suite is **not** represented as passing.

## Pre-existing supplied-baseline issues

These were reconfirmed and were not introduced by v0.42.0:

1. `tests/v022-update-compat.test.cjs` expects `.github/workflows/build-apk.yml`, which is absent from the supplied source extract.
2. `tests/adventure3-preservation.test.cjs` contains a stale checksum for `app/src/main/assets/arcade/kids-club/SOURCES.md`:
   - actual SHA-256: `265e7b169ca76365e08f8333d3ba9dda51b6750822d098120b767462c5edcbd6`
   - expected SHA-256: `34901cd4f05116e17bd164b031638782700d361b3159ad29a23896341859b18d`

The file was not modified by this release.

## Review note

This harness has no separate reviewer subagent, so the final branch/product review was an **author self-review** rather than an independent fresh-context review. Three final-review findings were fixed with regression tests: projectile visual identity, visible projectile destination travel, and impact/break feedback. No Critical/Important findings or deferred Minor findings remain from that self-review.

The supplied extracted source contains no `.git` metadata, so per-task commits/worktree integration were unavailable in the build environment. The packaged source ZIP is the delivery artifact.
