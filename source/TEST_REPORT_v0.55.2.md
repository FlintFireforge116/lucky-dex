# LuckyDex v0.55.2 Verification

## Scope
Focused Gutsy Golbat feel/input patch only:
- racer contact always separates and rebounds;
- hard impacts retain heart-scatter behaviour;
- CPU racers use distinct lateral biases/jukes instead of sharing one forward target line;
- playable horizontal range extends to the right side of the cave;
- finish marker becomes reachable;
- right-handed controls default to steering-left / FLAP-right;
- persistent left-handed mode mirrors the controls.

## TDD
`tests/v0552-gutsy-chaos.test.cjs` and `tests/v0552-release.test.cjs` were run before implementation and failed for all six new expectations. After implementation they pass 6/6.

## Focused / shared regression
Command includes Arcade platform/session/records, Clear Cut, Picross, all Gutsy tests, v0.55.2 tests.
Result: **72 tests passed, 0 failed**. The browser records QA explicitly skips when Playwright is unavailable.

## Syntax
`node --check` passed for:
- `app/src/main/assets/arcade-gutsy-golbat-core.js`
- `app/src/main/assets/arcade-gutsy-golbat.js`
- `app/src/main/assets/app-v0167.js`

## Runtime diagnostic
A deterministic full Hard simulation completed the cave and produced 44 physical racer rebounds and 27 hard rival-hit events, confirming that racers no longer simply overlap without reaction.

## Full historical runner
`npm test` passes the first 46 historical tests (5 + 23 + 18) then stops at `adventure-core.test.cjs` because the environment does not have the declared `playwright` module installed. No Gutsy assertion failure occurs before that environment stop.

## Packaging
The release ZIP is packaged with Gradle files at the archive root. The supplied Pokémon Stadium 2 ROM is not included.
