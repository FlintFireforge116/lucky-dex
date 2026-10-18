# LuckyDex v0.40.39 Test Report

## Scope

Impact Trial input/readability polish on top of v0.40.38. No Codex was used.

## Gameplay changes

- Added a dedicated 3 → 2 → 1 → GO! countdown before the first hazard begins; target input is locked until the countdown and incoming-hazard cue complete.
- Improved touch responsiveness for both taps and swipes. Pointer-down now resolves immediately, swipe movement uses continuous segment-vs-target hit testing, coalesced pointer samples are consumed when available, and the effective touch radius is intentionally more forgiving than the visible shield.
- Added a short 190 ms post-life grace/fade window. Shields remain hittable while fading instead of becoming dead input immediately.
- Lowered Rock Slide's lane guard/impact line to 78% of the playfield.
- Falling shields now descend to that line, stop there, and remain hittable at the line through the remainder of their life/grace window rather than travelling through it.
- Lane timing reaches full value at the guard line and stays fully valuable while the shield is held there.
- Grace-window spacing is included in target-plan concurrency calculations so the extra responsiveness does not recreate the old screen clutter.
- Existing v0.40.38 rules remain: all targets collected = 100% Harden / zero damage; Golden Hazard requires every gold shield plus survival and reveals the prize at the end of the run.

## TDD regression

The new `tests/v0439-impact-input-polish.test.cjs` was run against an untouched v0.40.38 extraction before implementation. It failed 6 of 7 tests for the expected missing behaviours (countdown, continuous swipe geometry, stopped/lowered lane targets, fade grace, runtime wiring, and v0.40.39 release identity).

After implementation, the combined v0.40.31–v0.40.39 Power Trial / Impact Trial regression set passed:

- 56 tests passed
- 0 failed

The v0.40.39 tests specifically verify:

- 3 → 2 → 1 → GO! countdown timing;
- tap-friendly and continuous fast-swipe hit geometry;
- lowered 78% lane guard line;
- falling shields stop on the line instead of crossing it;
- shields retain strong/full timing value at the stopped impact line;
- 190 ms hittable fade grace;
- grace windows preserve the existing on-screen target caps;
- runtime wiring for countdown lockout, coalesced swipe paths, fade hits, and stopped lane targets;
- aligned v0.40.39 release identity.

Modified Impact Trial JavaScript passed Node syntax checks.

## Offline asset integrity

Passed:

- 44 authentic Arcade scenes/sheets/crops checksum validation
- 2,098 offline Arcade sprite validation
- 2,078 unretouched Arcade actor source/output validation
- all 8 local venue assets
- Adventure asset verifier: 829 images / 1,025 species / 386 back sprites / 37 registry objects, 0 errors
- Fossil Museum: 42 images verified

## Full suite note

`npm test` was attempted after the changes. The runnable suites before the browser dependency point passed, then the suite stopped at `adventure-core.test.cjs` because this environment does not have the `playwright` Node module installed (`MODULE_NOT_FOUND`). This is an environment/dependency limitation rather than an Impact Trial regression. No claim is made that the Playwright-dependent browser suite ran here.
