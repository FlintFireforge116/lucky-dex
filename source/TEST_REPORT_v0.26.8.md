# LuckyDex v0.26.8 verification

## Scope

Focused pack-shop and pack-opening UX release only. Adventure-map feedback was intentionally not implemented in this pass.

## New regression coverage

`tests/v0268-pack-ux.test.cjs` verifies:

- swipe tear planning is exported and accepts broad horizontal swipes;
- mostly vertical gestures do not open a pack;
- tear paths remain constrained to a 5–32% upper-pack band;
- the generated rip follows swipe start/end heights and produces jagged split polygons;
- currency help copy is present;
- set-browser search/sort/tap targets are enlarged;
- sealed-pack pointer tracking uses the shared tear planner;
- real booster art has a detachable top piece;
- Skip is in the bottom action row;
- hold-to-fast-reveal orchestration can start/stop, skip cinematics and advance cards;
- release identity is versionCode 268 / v0.26.8.

## Results

- JavaScript syntax checks: PASS
  - `app-v0167.js`
  - `pack-flow-v0165.js`
  - `pack-opening-v0160.js`
- Non-browser Node test programs: **77 / 77 PASS**.
- Offline Arcade asset checksum/encoding audit: PASS.
- Venue asset audit: PASS.
- Adventure asset audit: PASS (829 images, 1,025 species; no errors).
- Fossil Museum asset audit: PASS (42 images).
- Existing v0.26.7 physical-card artwork regression: PASS.
- Existing pack browser/layout/declutter regressions: PASS.

## Browser-suite limitation

The repository contains 19 Playwright/browser-dependent tests. The local full runner stops at the first of these because the `playwright` package is not installed in this execution container (`MODULE_NOT_FOUND: playwright`). This is an environment/dependency limitation, not an application assertion failure. GitHub Actions remains the browser/build authority for those suites.
