# LuckyDex v0.43.0 Test Report

## Scope

Goldenrod stat-expression and trophy-cabinet release built from v0.42.5.

### Feature changes

- Added shared Goldenrod stat curve at `arcade-goldenrod-stat-curve.js` using the approved reference points from 20→0.65 through 220+→1.28.
- Pokémon Dash now uses that curve for materially different Speed-based race pace plus Speed-sensitive acceleration response.
- Power Trial now uses Attack as a stronger strike-power ceiling while charge/impact execution controls how much of the ceiling is realised.
- Impact Trial now uses Defense to change both Harden workload and miss mitigation while preserving simultaneous-target caps and perfect=zero-damage.
- Target Range now uses Sp. Atk for projectile velocity, drop, wind resistance and armour power while retaining the same visual/scoring impact endpoint.
- Goldenrod CPU simulation now uses the same shared stat curve with AI execution/variance layered on top.
- Goldenrod Trophy Cabinet now displays separate Type Cup trophy tracks by event, type and division using existing saved `typeTrophies` state.
- Target Range removed the incorrect per-type prop/tree sprite injection and now uses restrained perspective edge scenery.

## Reference checks

Representative Rookie-range comparison (same execution):

- Shared factor: stat 25 = 0.6825; stat 58 = 0.8937.
- Dash: Speed 58 pace factor is ~1.309× Speed 25.
- Power Trial: perfect Attack 25 strike = 68.3; perfect Attack 58 strike = 89.4.
- Impact Final Barrage / Rookie: Defense 25 = 13 Harden targets; Defense 58 = 11, with identical simultaneous-target cap.
- Target Range at 45 m / wind 1 / perfect release:
  - Sp. Atk 25: 1665 ms travel, 0.1512 drop, 0.0608 drift, 0.6479 impact power.
  - Sp. Atk 58: 1369 ms travel, 0.1164 drop, 0.0491 drift, 0.8289 impact power.

The v0.42.4 Target Range Rookie tournament balance guard remains green after the CPU stat-curve change.

## TDD verification

New tests were observed RED before implementation and GREEN after implementation for:

- shared curve reference points / clamping / monotonic taper;
- Dash Speed expression;
- Power Trial Attack ceiling and skill-over-stat reversal;
- Impact Defense workload / mitigation / perfect invariant;
- Target Range Sp. Atk projectile behaviour and armour power;
- CPU stat-direction advantage in all four events;
- separate Type Cup trophy rendering from existing save state;
- Target Range scenery removal;
- v0.43.0 release identity.

## Final focused regression run

Command: Node `--test` across the new v0.43.0 tests plus Goldenrod core/state/UI/integration/settlement, Dash non-browser core/config/course/league, Power Trial, Impact Trial, Target Range, picker sort and Target Range Rookie balance suites.

Result: **155 / 155 tests passed**.

## Syntax checks

`node --check` passed for all 10 changed runtime JavaScript files:

- `arcade-goldenrod-stat-curve.js`
- `arcade-dash.js`
- `arcade-power-trial-core.js`
- `arcade-impact-trial-core.js`
- `arcade-impact-trial.js`
- `arcade-target-range-core.js`
- `arcade-target-range.js`
- `arcade-goldenrod-adapters.js`
- `arcade-goldenrod.js`
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

`npm test` was attempted on the final v0.43.0 tree.

- 3 test programs completed before the browser-dependent stop.
- **46 / 46 runnable assertions passed**.
- The next program, `adventure-core.test.cjs`, stops because the environment does not have the declared `playwright` package installed.
- This is the same pre-existing environment limitation as recent LuckyDex releases. No Playwright-dependent browser suite is claimed as passing.

## Release identity

- Package version: `0.43.0`
- Android versionName: `0.43.0`
- Android versionCode: `4300`
- Android application ID unchanged: `com.example.luckydex`
