# LuckyDex v0.31.0 — Dash Gen III polish verification

## Release
- Android / npm / lockfile / runtime build marker / visible version: **0.31.0**, Android code **310**.
- Package remains `com.example.luckydex`. Included `app/luckydex-dev.keystore` is byte-identical to supplied v0.30.0.
- Android debug APK built successfully offline; signer SHA-256 remains `069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a`. All **5,863** source asset files were compared byte-for-byte with the compiled APK payload.
- Windows build adaptation used the installed Python for the existing booster audit. Its regenerated JSON was semantically identical; original bytes were restored and final build reused that completed audit. No Gradle signing or asset-build behavior was changed in source.

## Gameplay and eligibility
- Inclusive Speed classes: **Easy 20–65; Normal 55–100; Hard 90–135; Expert 100–180**.
- `LuckyDexDashConfig.isRacerEligible` is authoritative for type + Speed. Picker ordering/disabled states, selection, remembered restoration, Start state, defensive `startRace`, difficulty counts, League counts and AI filtering share it.
- Quick Race preserves collection discovery. Leagues filter other types; out-of-band cards show `TOO SLOW` / `TOO FAST` and cannot select or start.
- Every one of 18 types has at least five candidates in every difficulty across actual bundled 1,025 species (72 pools). Sparse future pools repeat eligible candidates; an empty AI pool is rejected rather than using an out-of-band placeholder.
- AI fields choose nearest unique eligible species to 10/30/50/70/90% band targets, with seeded tie-breaking and shuffled assignment. All five persist across three cup races.
- Raw Speed maps linearly from 0.80 at 10 to 1.20 at 180, a 1.50× spread. Level bonus remains capped at 4%. No rubber-banding. Test demonstrates an Expert rival naturally leaving the player’s viewport.
- Physics, length 1800, obstacle density, sprint/stamina, boosts, slowdowns, lane geometry, 10/6/4/3/2/1 scoring, tie-breaks, trophies, save schema and reward tables preserved. All unrelated app code/assets are unchanged except release markers. God Pack 1/1000 and Lucky Pack 1/500 contracts remain green.

## Visual change
- Separate cached asset loader and pixel renderer; **221** local raster assets across 18 themes.
- Emerald general route textures / evergreen / boulder adapted alongside original themed hazards, slow patches, double-chevron pads, berry pickups, props and pixel UI markers. Full path-level provenance in `docs/DASH_ASSET_SOURCES.md`; downloaded reference bytes retained in `scripts/dash-source/`.
- Native sprite proportions, bottom-center feet anchors, rounded pixel coordinates, nearest-neighbor rendering and viewport-matched canvas backing aspect prevent both sprite and CSS canvas stretching.
- Fair staggered visual starting grid fades over 0.8 seconds; all race distances begin at zero. Player camera, y sorting and offscreen culling preserved.
- Compact pixel-bordered menu tiles, themed League grid, restriction/owned counts, two-column racer cards, distinct metadata/footer, compact HUD and one-row large touch controls. Excess mobile header padding removed.
- Theme assets and racer images preload before countdown. Cached loads do not repeat per frame. Exit cancels stale preload; asset failure shows a recoverable unavailable view.

## Fresh verification
- **12/12 targeted test programs pass**, including all eight existing Dash programs, eligibility/diversity/pace, actual renderer assets/shape geometry, real Chromium mobile lifecycle and exact v0310 release contract.
- Test-first failures observed for missing eligibility helper, missing raster renderer, wrong release marker, and the inherited GO-overlay pause regression; corresponding checks now pass.
- Independent reviewer found one Important inherited launch-pause defect. Browser reproduction failed before fix; `resume()` now clears GO when returning to racing. Regression passes. No remaining Critical or Important review finding.
- Browser lifecycle: invalid remembered selection, unselectable/out-of-band start gate, no valid owned racer, delayed preload cancellation, missing asset, pause during GO, and 320×640 / 360×800 layouts pass.
- Mobile visual QA at **412×850**: menu, difficulty, eligible/disabled picker, launch, Quick Race near 40%, Fire League near 40%, race standings, full three-race cup and League grid. Screenshots visually inspected. All 18 themes and Pikachu / Pinsir / Rattata / Chansey / Exeggutor silhouette gallery inspected. No stretching, initial six-sprite pile, text overlap or race page scroll observed.
- Offline audits pass: 44 Arcade scenes/sheets/crops, 2,098 sprites, 2,078 actors, eight venues, Adventure 829 images / 1,025 species / 386 backs / 37 objects, and Fossil Museum 42 images.
- Standard `node scripts/run-tests.cjs` was run (npm entry point; `npm` executable absent). It stops on inherited Adventure runtime failure. The continuing inventory runs every program individually: **146/160 pass, 14 non-passing**. Playwright was supplied from the bundled runtime and Chrome actually ran; browser results are not represented as skipped or passing when they failed.

## Broader failures — each reproduced against untouched v0.30.0 under the same environment
- `adventure-runtime.test.cjs` — inherited browser / runtime assertion or timeout; same failure in baseline.
- `amie-recovery.test.cjs` — sandbox environment denies this test’s localhost HTTP navigation; same failure in baseline.
- `recovery-lifecycle.cjs` — inherited browser / runtime assertion or timeout; same failure in baseline.
- `recovery-runtime.cjs` — inherited browser / runtime assertion or timeout; same failure in baseline.
- `recovery-trade-refresh.cjs` — inherited browser / runtime assertion or timeout; same failure in baseline.
- `recovery-transactions.cjs` — inherited browser / runtime assertion or timeout; same failure in baseline.
- `v0223-ball-stalls.test.cjs` — inherited simulation assertion; same failure in baseline.
- `v0250-fossil-browser.test.cjs` — inherited browser / runtime assertion or timeout; same failure in baseline.
- `v0250-fossil-routing-browser.test.cjs` — inherited browser / runtime assertion or timeout; same failure in baseline.
- `v0264-booster-art-audit-and-slim-pack.test.cjs` — Windows environment: test invokes unavailable python3 executable; same failure in baseline.
- `v0267-physical-card-art-recovery.test.cjs` — Windows environment: test invokes unavailable python3 executable; same failure in baseline.
- `v0283-unown-browser.test.cjs` — inherited browser / runtime assertion or timeout; same failure in baseline.
- `v0284-release.test.cjs` — stale exact historical release expectation; same failure in baseline.
- `v0287-keyboard-overlay.test.cjs` — inherited keyboard/layout assertion; same failure in baseline.

An initial `v0223-layout-grid.test.cjs` browser timing failure passed both the final full sweep and standalone rerun; it is not included in the 14 final failures. No unrelated failure was suppressed or its assertion weakened. Full output: `artifacts/test-inventory.json`, baseline comparison: `artifacts/baseline-failures.json`.

## Packaging and evidence
- Required source ZIP: `LuckyDex_source_v0.31.0.zip`, root layout preserved from v0.30.0 (no wrapper directory).
- Exact ZIP is freshly extracted, targeted programs rerun, release identity / all local Dash assets / signing bytes checked. Final outcomes and SHA-256 are in sibling `LuckyDex_source_v0.31.0.zip.verification.json` and `.sha256` after packaging.
- Screenshots: `artifacts/dash-v0310/`; theme contact sheet: `artifacts/dash-v0310/themes/all-18-themes.png`; native shapes: `artifacts/dash-v0310/themes/sprite-shapes.png`. Reproduced baseline: `artifacts/dash-before/`. The three named reference JPGs were absent from the supplied ZIP.
- Reproduce artwork with the two pixel asset builders; reproduce QA with `scripts/dash-mobile-qa.cjs` and `scripts/dash-theme-gallery.cjs` (Playwright + installed Chrome required).
- Android emulator / physical-device recents switching was not tested. Real Chrome lifecycle and pause logic were tested; Android build/signature/payload verified.
- No push/merge/publish performed. No requested polish item deferred; broader inherited failures remain outside the focused Dash scope.
