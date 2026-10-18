# LuckyDex v0.27.5 verification report

## Scope

- Refactored Poké Ball Drop from one monolithic canvas into six independently redrawn 720×1004 layers.
- Preserved the exact v0.27.4 11-row geometry, gameplay, reward odds, persistent prize rules and shared card reveal flow.
- Integrated the seven prize wells/dividers/floor into the static backboard layer; prize content no longer paints an opaque underlay.
- Added targeted invalidation for aiming, animation, power-up collection, special-pin effects, prize replacement and async Card/Booster artwork.
- Advanced Android/package/runtime identity to v0.27.5 / versionCode 275 without changing application ID or signing configuration.

## Verification completed in this container

- `node --check` passed for `arcade-ball-drop.js`, `arcade-session.js`, and `arcade-fossil-museum.js`.
- **93 non-browser Node/static test programs passed; 0 failed.**
- 19 Playwright-dependent browser programs were not runnable because the local Playwright package is not installed in this execution environment.
- The full `npm test` entry point therefore reaches `adventure-core.test.cjs` and stops with `Cannot find module 'playwright'`; no browser-only pass is claimed.
- Ball Drop production-physics guard: **264 seeded drops** all reached valid slots; worst simulated landing time was **14.848 physics seconds**. Historical wall/peg wedge recovery and cancel/re-entry also passed.
- Focused v0.27.5 guards passed:
  - `tests/v0275-ball-drop-layers.test.cjs`
  - `tests/v0275-release.test.cjs`
- Gameplay/reward compatibility guards passed:
  - `tests/v0271-ball-drop-chaos.test.cjs`
  - `tests/v0272-ball-drop-polish.test.cjs`
  - `tests/v0273-ball-drop-fit.test.cjs`
  - `tests/v0274-ball-drop-persistence.test.cjs`
  - `tests/v0274-arcade-card-reveal.test.cjs`
  - `tests/arcade-ball-drop.test.cjs`
- Offline asset audits passed:
  - 44 authentic Arcade scenes/sheets/crops
  - 2,098 offline Arcade sprites
  - 2,078 unretouched Arcade actor assets
  - 8 venue assets
  - 829 Adventure images / 1,025 species registry
  - 42 Fossil Museum images

## Environment limitation

Playwright is declared as a dev dependency but is not installed in this container. The 19 browser-dependent programs therefore remain for the GitHub Actions/browser-enabled environment.
