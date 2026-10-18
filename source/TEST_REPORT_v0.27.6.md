# LuckyDex v0.27.6 Test Report

## Scope

Ball Drop physics/collision refinement, special-pin behaviour replacement, anti-stall no-teleport recovery, and shared Arcade card-reveal framing.

## Automated verification

- 96 non-browser Node/static test programs: **PASS (0 failures)**.
- `tests/v0276-ball-drop-physics.test.cjs`: **PASS**.
- `tests/v0276-card-reveal-frame.test.cjs`: **PASS**.
- `tests/v0276-release.test.cjs`: **PASS**.
- Historical Ball Drop regression coverage through v0.27.5: **PASS**, with superseded expectations updated only for approved v0.27.6 behaviour.
- `node --check app/src/main/assets/arcade-ball-drop.js`: **PASS**.
- `node --check app/src/main/assets/arcade-session.js`: **PASS**.

## Physics evidence

- Existing production-RAF stress harness: **264/264 seeded drops landed**, worst 21.104 simulated seconds (30s limit).
- Dedicated non-Warp correction probe: **165,698 sampled 2ms physics steps**, maximum pin correction **1.556px**, **0** corrections above 2px.
- Anti-stall recovery test confirms recovery modifies velocity only and does not relocate x/y.
- Main visual radius stays 26px while collision radius is 16px; rain visual radius stays 18px while collision radius is 11px.

## Special pins

- Warp/Teleport: unchanged paired teleport behaviour.
- Sticky Web: near-zero restitution/heavy damping while touching the web peg.
- Explosion: strong deterministic radial blast away from pin centre.
- Gravity: temporary high downward acceleration without sideways launch.
- Metronome: selects Explosion/Sticky Web/Gravity on first hit, mutates to that pin and retains it for the run.

## Offline asset integrity

- 44 authentic Arcade scenes/sheets/crops: PASS.
- 2,098 offline Arcade sprites: PASS.
- 2,078 unretouched Arcade actors: PASS.
- 8 venue assets: PASS.
- Adventure assets: 829 images / 1,025 species / 386 back sprites: PASS.
- Fossil Museum: 42 images: PASS.

## Environment limitation

19 Playwright/browser-dependent test programs cannot run in this container because the local Playwright dependency is unavailable. The full test entrypoint reaches the first such program and stops with `Cannot find module 'playwright'`; this is the same environment limitation as recent LuckyDex releases.
