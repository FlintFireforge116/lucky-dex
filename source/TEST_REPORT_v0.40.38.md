# LuckyDex v0.40.38 Test Report

## Scope

Impact Trial readability and Golden Hazard tuning on top of v0.40.37. No Codex was used.

## Gameplay changes

- Reduced Harden target density across all difficulties, including Hard.
- Added bounded simultaneous-target caps: Easy generally tops out at 2 live targets, Normal at 3, Hard at 4 only in the Final Barrage; the falling Rock Slide is capped at 3 on every difficulty.
- Reduced raw target counts and lengthened/redistributed Harden windows so difficulty comes from reaction and accuracy rather than screen clutter.
- Rock Slide now uses controlled random lane choice and irregular spawn gaps. It deliberately avoids fixed 1-2-3 cycles and long two-lane alternation while still visiting all three lanes.
- Hitting every valid Harden target now guarantees 100% Harden / IMPENETRABLE and zero damage, even if lane timing quality would otherwise reduce weighted coverage.
- Golden Hazard now requires every gold shield to be collected (plus surviving the impact) before the rare prize is secured.
- Golden shield stars have an explicit gold treatment, and the Golden Rolling Boulder has a stronger dedicated gold-rock treatment/glint.
- Successful Golden Hazard rewards continue through the shared rare-reward bridge and are presented as a reward reveal on the end-of-run result screen.

## Focused verification

Command covered the new v0.40.38 tuning tests plus the current Impact Trial and Power Trial regression programs.

- 49 tests passed
- 0 failed
- Modified JavaScript files passed `node -c` syntax checks

The new v0.40.38 tests verify:

- readable target concurrency on Easy, Normal and Hard;
- chaotic/non-cyclic Rock Slide lane generation;
- zero damage for collecting every Harden target;
- all-gold-shields requirement for Golden Hazard prizes;
- explicit gold icon / gold rock styling and end-of-game reward reveal;
- v0.40.38 release identity.

## Offline asset integrity

Passed:

- 44 authentic Arcade scenes/sheets/crops checksum validation
- 2,098 offline Arcade sprite validation
- 2,078 unretouched Arcade actor source/output validation
- all 8 local venue assets
- Adventure asset verifier: 829 images / 1,025 species / 386 back sprites / 37 registry objects, 0 errors
- Fossil Museum: 42 images verified

## Full suite note

`npm test` was attempted after the final changes. The runnable tests before the browser dependency point passed, then the suite stopped at `adventure-core.test.cjs` because this environment does not have the `playwright` Node module installed (`MODULE_NOT_FOUND`). This is an environment/dependency limitation rather than an Impact Trial test failure. No claim is made that the Playwright-dependent browser suite ran here.
