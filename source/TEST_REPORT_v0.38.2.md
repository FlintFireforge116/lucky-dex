# LuckyDex v0.38.2 — Filtered Bulk Dust Exchange Test Report

**Release:** 0.38.2  
**Android versionCode:** 3802  
**Scope:** bounded Dust Exchange feature on top of v0.38.1

## Delivered

- Added `dust-exchange-core.js` for deterministic filter, Keep N, confirmation snapshot and atomic batch logic.
- Added Dust Exchange filters for name/collector number, set, rarity and Dust value. Filters combine with AND logic.
- Added remembered `Keep Copies` preference under `state.ui.dustExchange.keepCopies`, defaulting to 3 with a protected minimum of 1.
- Added live `CONVERT FILTERED` totals and a detailed confirmation dialog listing every affected card type, owned count, kept count, converted count and Dust gain.
- Bulk conversion never includes Achievement Reward/protected cards and only touches cards present in the confirmed snapshot.
- If card ownership or salvage value changes after confirmation is prepared, conversion aborts atomically and asks the player to review again.
- Existing individual quantity / MAX conversion remains unchanged.
- Dust filters reset when the Dust Exchange is reopened; Keep Copies persists.

## TDD evidence

New focused tests were observed RED before implementation and GREEN afterwards:

- `tests/v0382-dust-bulk-filter.test.cjs`
  - missing core module → RED
  - AND filtering, Keep 3 math, protected-card exclusion, atomic apply → GREEN
  - tampered confirmed Dust amount reproduced as RED, then rejected atomically → GREEN
- `tests/v0382-dust-bulk-ui.test.cjs`
  - missing Set/Rarity/Dust/Keep/confirmation controls → RED
  - final HTML/runtime/CSS contract → GREEN
- `tests/v0382-release.test.cjs`
  - v0.38.1 release identity → RED
  - v0.38.2 / versionCode 3802 → GREEN

## Regression verification

Fresh full test-program sweep on the final source tree:

- **296 total `.cjs` test programs discovered**
- **275 passed**
- **21 unavailable browser/recovery programs** because the extracted environment does not contain the Playwright/browser harness dependency
- **0 available-program failures**

Historical Dust/Trade compatibility checks explicitly pass, including:

- `v0247-trade-dust-promo-search.test.cjs`
- `v0248-promo-economy-filter.test.cjs`
- `v0331-stability-dust.test.cjs`
- `v03515-booster-only-rewards-vault.test.cjs`
- `v0381-rock-harden-polish.test.cjs`
- `v0340-preservation.test.cjs` with `trade-browser-v0169.css` explicitly classified as an intentional later UI change while the remaining protected baseline stays hashed.

## Offline asset integrity

All available verifiers pass:

- authentic Arcade scenes/sheets/crops and **2,098** offline Arcade sprites
- **8** local venue assets
- Adventure asset verifier: **829 images / 1,025 species / 386 back sprites / 37 registry objects**
- Fossil Museum verifier: **42 images**

## Syntax / build environment

- `node --check app/src/main/assets/dust-exchange-core.js` — PASS
- `node --check app/src/main/assets/app-v0167.js` — PASS
- `node --check app/src/main/assets/trade-v0163.js` — PASS
- No Gradle wrapper (`gradlew`) is present in this source archive, so an APK compile is not claimed.

## Browser limitation

The 21 unavailable programs require Playwright and/or the recovery browser harness. They are reported as unavailable rather than counted as passing. No browser result is claimed for v0.38.2 in this environment.
