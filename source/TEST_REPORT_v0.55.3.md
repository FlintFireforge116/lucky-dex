# LuckyDex v0.55.3 test report

Scope: Gutsy Golbat full-screen horizontal movement and collision-chaos tuning.

## Changes verified
- CPU flyers periodically cross-cut between left and right screen zones rather than camping at the incoming-heart edge.
- CPU horizontal acceleration/speed increased for visible overtakes and lane changes.
- Racer-to-racer collisions use stronger spring separation plus normal-velocity exchange.
- Left/right cave walls rebound racers back into play instead of zeroing horizontal motion.
- Race progress remains time/course-scroll based, independent from a racer's screen X position.

## Focused/shared regression
`node --test ...` across Gutsy Golbat, Picross, Clear Cut, Arcade platform/session/records, and v0.55.3 release identity:
- 72 tests
- 72 passed
- 0 failed

## Syntax
- `node --check app/src/main/assets/arcade-gutsy-golbat-core.js` passed.
- `node --check app/src/main/assets/arcade-gutsy-golbat.js` passed.

## Full historical runner
`npm test` passes its first 46 historical tests, then stops at `adventure-core.test.cjs` because this environment does not have the declared Playwright module installed (`Cannot find module 'playwright'`). This is the same environment limitation as prior builds, not a Gutsy assertion failure.

## ROM packaging
No `.n64`, `.z64`, or `.v64` files are present in the source tree.
