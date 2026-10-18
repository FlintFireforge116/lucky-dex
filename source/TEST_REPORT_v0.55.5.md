# LuckyDex v0.55.5 test report

Scope: Gutsy Golbat unbiased Brawler targeting and faster bat-flight / rebound feel.

## Changes verified
- Brawler no longer prefers the player, leader, or high-heart racer.
- Each chaos decision can choose one of the three rival racers with equal selection logic, a visible heart / loose heart, or a random cave point.
- Hard Brawler decisions occur on a short cadence and can redirect across both axes.
- Player lateral speed, CPU lateral acceleration / cap, flap impulse, vertical cap, and AI juke cadence are all increased from v0.55.4.
- Racer collisions use stronger momentum exchange and a brief rebound hold so knockback remains visible before normal steering resumes.
- Existing Backmarker / Front-runner / Brawler role shuffling is preserved.
- Existing handedness, Golden Heart, records, achievements, Clear Cut, and Picross behaviour are preserved.

## Focused/shared regression
Focused/shared `node --test ...` across Gutsy Golbat, Picross, Clear Cut, Arcade platform/session/records, and v0.55.5 release identity:
- 89 tests
- 89 passed
- 0 failed

## Deterministic Hard-run sanity sample
A seeded 20-second Hard simulation produced:
- 48 Brawler chaos decisions
- 18 racer targets, 16 collectible targets, 14 random-space targets
- racer target counts: YOU 3, other COMs 10 and 5 in that sample
- Brawler horizontal range: x≈241 to x=920 (≈679 px traversal)
- 8 racer rebound events

These sample counts are not balance guarantees; they verify that the Brawler is not hard-wired to the player and that all three chaos target categories occur in live stepping.

## Syntax / packaging safety
- `node --check app/src/main/assets/arcade-gutsy-golbat-core.js` passed.
- `node --check app/src/main/assets/arcade-gutsy-golbat.js` passed.
- No `.n64`, `.z64`, or `.v64` files are present in the source tree.

## Full historical runner
`npm test` passes its first 46 historical tests, then stops at `adventure-core.test.cjs` because this environment does not have the declared Playwright module installed (`Cannot find module 'playwright'`). This is the same environment limitation as prior builds, not a Gutsy assertion failure.
