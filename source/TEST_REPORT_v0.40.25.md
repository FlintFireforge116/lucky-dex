# LuckyDex v0.40.25 Verification Report

## Scope

v0.40.25 redesigns **Sushi-Go-Round** around the approved three-ring, fixed-Lickitung, tap-to-eat interaction while preserving v0.40.24 scoring, saves, records, rewards and achievements.

## Sushi-Go-Round redesign

- Three concentric conveyor rings, four plate positions per ring (12 live track slots total).
- All normal plates share one continuous angular velocity; the old 520 ms slot-step presentation is removed.
- Belt slowed from the old 6.24-second full-lap equivalent to a smooth 7.2-second lap.
- All four Lickitung remain fixed around a smaller table.
- Player taps the exact glowing plate they want when it enters their reach; no movement controls and no large EAT button.
- Three staggered rings provide several meaningful choices at each station rather than one upstream-dependent plate.
- Moving plates carry only their food art; names and prices are moved to a compact side menu.
- Old centre title copy and one-slot target panel are removed.
- Player tongue animation points to the selected plate.
- Hot Tea, x1-x5 same-sushi chains, one-minute rounds and the original eight values remain unchanged.
- CPU decision cadence/value preference was retuned for the three-ring choice set. In a deterministic 200-round strong greedy-player simulation, Normal produced a 51.5% player win rate; Hard remained substantially tougher (11%).

## Preserved achievement / record contract

Existing Sushi-Go-Round records and five achievements remain unchanged:

- Big Spender
- Conveyor Connoisseur
- Sushi Master
- Same Again!
- High Roller

## TDD / focused regression verification

New v0.40.25 tests cover:

- three synchronized continuous rings
- direct exact-plate selection
- rejection of out-of-reach taps
- cleaned shell (no EAT control, no centre copy, side menu)
- continuous ring geometry / reachable highlighting / direct pointer selection
- v0.40.25 release identity

Broad focused result: **86/86 tests passed, 0 failures.**

This includes all rolling v0.40.x release guards through v0.40.25, Arcade state/records, Dynamo, Snore War, Run Rattata Run, Sushi-Go-Round, and the Adventure preservation guard.

The preservation guard reports **5,942 protected files preserved**. The Arcade Records registry deliberately logs a simulated `disk full` save error while testing failure resilience; that test passes.

## Syntax checks

`node --check` passed for:

- `arcade-sushi-go-round-core.js`
- `arcade-sushi-go-round.js`
- `arcade-world.js`
- `arcade-records.js`
- `arcade-platform.js`
- `achievements-v0341.js`

## Offline asset audits

- Venue audit: PASS — 8 local venue assets.
- Adventure asset audit: PASS — 829 images, 1025 species, 386 back sprites, 37 registry objects.
- Fossil Museum audit: PASS — 42 images.

## Full project runner

`npm test` completed the first three suites with **46 passing subtests and 0 failures**:

- `adventure-battle-v0404.test.cjs`: 5/5
- `adventure-battle-v0411.test.cjs`: 23/23
- `adventure-battle.test.cjs`: 18/18

The runner then stops before `adventure-core.test.cjs` because the environment does not have the Node `playwright` module installed (`MODULE_NOT_FOUND: playwright`). Browser-backed tests after that point are therefore **not claimed as passed**.

## Package verification

The final v0.40.25 source ZIP is extracted into a clean directory and the v0.40.25 Sushi redesign, release-identity, recent Kids Club and preservation checks are rerun against that exact packaged copy before handoff.
