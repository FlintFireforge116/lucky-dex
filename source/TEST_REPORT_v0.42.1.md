# LuckyDex v0.42.1 Test Report

## Scope

LuckyDex v0.42.1 is a bounded mobile-first polish pass for **Target Range — Special Attack** based on the supplied Android screenshot. The gameplay progression, Goldenrod tournament framework, scoring, rewards and rare-event settlement remain intact. **Codex was not used.**

## Target Range presentation changes

- Active gameplay is now a **single-screen, no-scroll mobile composition**.
- The shared three-card Arcade session strip is hidden only while Target Range is actively playing, freeing vertical space without changing other games.
- The four pale HUD boxes plus separate metadata row were replaced by a compact, high-contrast three-cell HUD for round/target, score and combo.
- Wind, distance, Special Attack and current move are now small overlays inside the range instead of separate rows.
- The permanent AIM instruction card was removed from normal targets; only meaningful transient feedback such as hits, misses and Golden Target alerts appears over the range.
- Focus is integrated into the touch control pad so the range receives the majority of the viewport.
- Bottom safe-area padding is retained and the live play shell does not scroll.

## Aiming / composition

- Initial aim height moved from 0.42 to **0.32** of the range height.
- Vertical reticle movement is capped at **0.68** so aiming remains separated from the lower touch controls.
- Generated target centres now use the upper shooting lane (base Y 0.16–0.50 rather than 0.20–0.63).
- Player Pokémon width was reduced from 74 px to a responsive **40–58 px** range, with an even smaller short-screen profile.
- Targets were reduced from 92 px to 76 px before distance scaling and receive a small stand so they read as gallery targets rather than floating UI circles.

## Themed range backgrounds

Target Range now reuses the already-bundled **18 Gen III Dash type environments** from `arcade/dash/gen3/previews/` as its range scenery. The selected Special Attack type chooses the matching backdrop, so Water, Rock, Ghost, Electric, etc. no longer share the generic blue-sky/green-field background. No network dependency was added.

## Projectile / trajectory presentation

The old projectile was a CSS left/top transition from the Pokémon directly to the solved impact point. It could look stiff and did not visually explain why a shot drifted/dropped away from the reticle.

v0.42.1 adds `projectileVisualPoint()` and frame-by-frame flight animation:

- projectile begins at the Pokémon,
- visibly travels through the player's aim line at 55% of flight,
- then the already-calculated wind drift/drop carries it to the exact solved impact point,
- short curved segments replace the old straight CSS jump,
- the existing type-specific projectile silhouettes and impact burst remain.

The underlying `resolveShot()` scoring solution is unchanged, so visual flight now communicates the same impact coordinates that gameplay uses.

## TDD / regression coverage

A new `tests/v0421-target-range-polish.test.cjs` suite was written RED first and then made GREEN. It pins:

- no-scroll active mobile composition,
- hidden redundant session strip during play,
- compact/high-contrast HUD,
- raised aiming lane,
- smaller Pokémon and safe-area controls,
- bundled type-themed backgrounds,
- upper target placement,
- projectile path start → aim line → solved impact,
- frame-by-frame runtime projectile animation,
- removal of the permanent normal-target instruction overlay.

The old v0.42.0 projectile UI regression was updated from asserting the discarded straight CSS transition to asserting the new calibrated flight-path contract.

## Release identity

- package version: `0.42.1`
- Android `versionCode`: `4201`
- Android `versionName`: `0.42.1`
- Android application ID preserved as `com.example.luckydex`
- visible/index build surfaces updated to `v0.42.1`

## Fresh verification on final tree

### Goldenrod + Target Range release suite

18 focused files covering the shared Goldenrod framework, Dash/Power/Impact tournament integration, Target Range core/UI/adapter/tournament/progression, the new mobile polish and release identity:

- **77 passed / 77 total**
- **0 failed**

### Adjacent Arcade regressions

Arcade platform/session, records, achievements, rare rewards, Power Trial and Impact Trial:

- **88 passed / 88 total**
- **0 failed**

The records-registry test intentionally logs a simulated `disk full` warning while verifying save-failure handling; the test passes.

### Dash regression check

- **29 browser-independent Dash tests passed**.
- Three additional Dash browser files could not start because the supplied environment does not have the `playwright` Node module. This is the same environment limitation documented in prior releases.

### JavaScript syntax

Fresh `node --check` passed for all runtime JavaScript modified by this release:

- `arcade-target-range-core.js`
- `arcade-target-range.js`
- `app-v0167.js`

Result: **3/3 syntax checks passed**.

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

The full historical suite is therefore **not** represented as passing.

## Pre-existing supplied-baseline issues

As documented in v0.42.0, the source extract still contains pre-existing historical-suite issues unrelated to this polish pass, including the absent `.github/workflows/build-apk.yml` expected by `tests/v022-update-compat.test.cjs` and the stale Kids Club `SOURCES.md` preservation checksum. Neither file was modified by v0.42.1.

## Review note

This harness has no separate reviewer subagent, so final review was an author self-review. The diff was checked against the v0.42.0 package to keep the scope bounded to Target Range presentation/trajectory plus release identity and matching version assertions. No Critical/Important findings or deferred Minor findings remain from that pass.
