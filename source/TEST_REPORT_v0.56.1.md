# LuckyDex v0.56.1 Test Report

## Scope
Furret's Frolic proper-mechanics rebuild from v0.56.0.

- Discrete four-direction grass-patch locking.
- Release returns through the home burrow; direction changes ping through home rather than free-sliding.
- Player body contact cannot impart force to balls; A/HIT is the only player-controlled ball force.
- Smaller, visually grass-buried Furret/Girafarig actors with visible patch/burrow layout.
- Four corner ball chutes; one starting ball from each chute.
- Non-goal wall rebounds and elastic ball-to-ball collisions.
- Narrower readable scoring mouths.
- Existing 60-second rules, 1/2/3/5 scoring, CPU difficulties, records, achievements and authentic Master Ball test hook retained.

## TDD
New tests were written and observed failing before production changes:
- `tests/v0561-furret-proper-core.test.cjs`
- `tests/v0561-furret-proper-ui.test.cjs`
- `tests/v0561-release.test.cjs`

They cover patch locking, return-to-burrow, direction-change routing, A-only ball force, wall bounce, ball-ball bounce, corner chute spawns, compact/buried UI, teaching copy, initial four balls and release identity.

## Focused + shared regression
Selected Arcade/Stadium/Picross/adventure-access regression set: **127/127 passed**.

Includes Arcade platform/session/records, Clear Cut Challenge, Pokémon Picross, Gutsy Golbat, v0.55.6 adventure/access fixes, v0.55.7-v0.55.8 Picross/10-pack work, Furret v0.56.0 compatibility tests and all v0.56.1 tests.

## Gameplay simulation
Seeded 60-second CPU simulations with identical seed and four initial corner balls:
- Easy: 60 CPU A-hits
- Normal: 90 CPU A-hits
- Hard: 133 CPU A-hits

The same simulations produced repeated wall rebounds and ball-to-ball ricochets, confirming the new physics is active during full matches.

## Syntax
`node -c` passes for:
- `arcade-furret-frolic-core.js`
- `arcade-furret-frolic.js`

## Historical runner
`npm test` passes its first **46 tests** (5 + 23 + 18) and then stops at the existing environment dependency in `adventure-core.test.cjs`: `Cannot find module 'playwright'`. This is the same test-environment limitation as prior releases and is not a Furret assertion failure.

## Packaging requirements
Release identity: v0.56.1 / versionCode 5601.
No Codex used.
