# LuckyDex v0.55.4 test report

Scope: Gutsy Golbat CPU personality model.

## Changes verified
- Every race assigns exactly one Backmarker, one Front-runner, and one Brawler.
- Personality assignment is shuffled across COM 1/2/3; no COM slot has a fixed role.
- Backmarker biases the rear half and avoids close contact.
- Front-runner biases the forward half and prioritizes advanced heart routes.
- Brawler actively targets valuable/leading nearby rivals and predicts their movement more strongly on higher difficulty.
- Easy / Normal / Hard scale reaction time, steering authority, maximum CPU lateral speed, hazard awareness, flap timing, and pursuit quality without changing each role's identity.
- The existing full-screen cave model remains pack-wide: the CPUs collectively use both sides, while role-specific movement is preserved.

## Focused/shared regression
`node --test ...` across Gutsy Golbat, Picross, Clear Cut, Arcade platform/session/records, and v0.55.4 release identity:
- 79 tests
- 79 passed
- 0 failed

## Syntax
- `node --check app/src/main/assets/arcade-gutsy-golbat-core.js` passed.
- `node --check app/src/main/assets/arcade-gutsy-golbat.js` passed.

## Full historical runner
`npm test` passes its first 46 historical tests, then stops at `adventure-core.test.cjs` because this environment does not have the declared Playwright module installed (`Cannot find module 'playwright'`). This is the same environment limitation as prior builds, not a Gutsy assertion failure.

## ROM packaging
No `.n64`, `.z64`, or `.v64` files are present in the source tree.
