# LuckyDex v0.26.9 verification

## Scope

Phone-polish follow-up for the v0.26.8 pack shop/reveal work. Adventure-map feedback was intentionally not implemented in this pass.

## New regression coverage

`tests/v0269-pack-picker-polish.test.cjs` verifies:

- hold-to-fast-reveal has an explicit readable per-card dwell of at least 550 ms (current value: 700 ms);
- skipped cinematics leave the settled card visible for that dwell before advancing;
- the Packs screen can scroll when the set picker grows;
- the selector card sizes to its contents instead of shrinking/overlapping controls;
- the expanded set picker receives a tall dedicated viewport;
- the set list retains its own scrolling;
- the booster-format row cannot be compressed into the set picker;
- release identity is versionCode 269 / v0.26.9.

The older v0.24.1 layout regression was updated to reflect the new explicit requirement that the Packs page scroll rather than crush the selector into a fixed-height viewport. The v0.26.8 behavioral regression remains active but no longer pins the repository to the historical v0.26.8 release number.

## Results

- JavaScript syntax checks: PASS.
- Non-browser Node test programs: **78 / 78 PASS**.
- Offline Arcade asset checksum/encoding audit: PASS.
- Venue asset audit: PASS.
- Adventure asset audit: PASS (829 images, 1,025 species; no errors).
- Fossil Museum asset audit: PASS (42 images).
- Existing v0.26.7 physical-card artwork regression: PASS.
- Existing pack browser/layout/declutter regressions: PASS.

## Browser-suite limitation

The repository contains 19 Playwright/browser-dependent tests. The local full runner stops at the first of these because the `playwright` package is not installed in this execution container (`MODULE_NOT_FOUND: playwright`). This is an environment/dependency limitation, not an application assertion failure. GitHub Actions remains the browser/build authority for those suites.
