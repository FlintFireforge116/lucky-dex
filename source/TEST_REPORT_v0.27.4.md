# LuckyDex v0.27.4 verification report

## Scope

- Poké Ball Drop shortened from 13 to 11 peg rows / 720×1004 internal canvas.
- Prize board persists across balls; only won slots refresh.
- Card targets preload the exact card and show its artwork.
- Shared end-of-minigame card reveal added for Ball Drop and Fossil Dig.
- Android/package/runtime version advanced to v0.27.4 / versionCode 274 without changing application ID or signer configuration.

## Verification completed in this container

- `node -c` passed for `arcade-ball-drop.js`, `arcade-session.js`, and `arcade-fossil-museum.js`.
- 91 non-browser Node/static test programs passed; 0 failed.
- 19 Playwright-dependent browser programs were not runnable because the local Playwright package is not installed in this execution environment.
- Ball Drop production-physics guard: 264 seeded drops across the established aim/seed matrix all reached valid slots; worst simulated landing time was 14.848 physics seconds. Cancellation/re-entry and the historical wall/peg wedge recovery also passed.
- v0.27.4 focused guards passed:
  - `tests/v0274-ball-drop-persistence.test.cjs`
  - `tests/v0274-arcade-card-reveal.test.cjs`
  - `tests/v0274-release.test.cjs`
- Offline asset audits passed:
  - 44 authentic Arcade scenes/sheets/crops
  - 2,098 offline Arcade sprites
  - 2,078 unretouched Arcade actor assets
  - 8 venue assets
  - 829 Adventure images / 1,025 species registry
  - 42 Fossil Museum images

## Environment limitation

The full `npm test` entry point reaches a Playwright-dependent program and stops with `Cannot find module 'playwright'`. The 19 browser-dependent programs therefore remain for the GitHub Actions/browser-enabled environment. No browser-only pass is claimed here.
