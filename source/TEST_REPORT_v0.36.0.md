# LuckyDex v0.36.0 — Dig! Dig! Dig! Test Report

## Release

- Version: `0.36.0`
- Android versionCode: `3600`
- Android applicationId: `com.example.luckydex`
- Feature: Pokémon Stadium Kids Club — **Dig! Dig! Dig!**
- Visual direction: Gen III / GBA-style presentation using bundled local cave and Sandshrew assets

## Implemented scope

- Added Dig! Dig! Dig! as the second Kids Club game beside Ekans' Hoop Hurl.
- Added deterministic DOM-free race core with 80 accepted alternating digs to finish.
- Added L/R touch controls and Left/Right/A/D keyboard controls; keyboard repeat is rejected.
- Added Easy / Normal / Hard CPU cadence profiles with independent seeded RNG and no rubber-banding.
- Added four-racer ranking, 4-second post-first-finish grace period, placement rewards, and exactly-once completion handling.
- Added persistent Dig records, per-difficulty best times/wins, podiums, and games played.
- Added four Dig achievements: Down We Go, Tunnel Vision, Hard Ground, and Rapid Excavator.
- Added pause/resume handling for countdown, CPU deadlines, grace deadline, and displayed elapsed race time.
- Added Gen III cave strata progression, local Sandshrew sprite rendering, countdown/DIG flash, results panel, and mobile touch ownership.
- Preserved Ekans gameplay and existing Kids Club owner contract.

## Focused v0.36.0 verification

Fresh run after the final pause-timer and presentation fixes:

- `tests/v0360-dig-core.test.cjs` — PASS
- `tests/v0360-dig-state-achievements.test.cjs` — PASS
- `tests/v0360-dig-integration.test.cjs` — PASS
- `tests/v0360-dig-runtime.test.cjs` — PASS
- `tests/v0360-dig-lifecycle.test.cjs` — PASS
- `tests/v0360-dig-presentation.test.cjs` — PASS
- `tests/v0360-release.test.cjs` — PASS
- `tests/v0360-dig-browser.test.cjs` — SKIP: Playwright is not installed in this extracted source workspace

Result: **7 PASS, 0 FAIL, 1 environment SKIP**.

## Regression verification

Every test file that does not import Playwright or the Playwright-backed recovery harness was executed in a clean parallel pass after the final fixes.

Result: **238 / 238 PASS, 0 FAIL**.

This set includes the v0.36.0 gameplay/state/integration/release tests and the applicable historical LuckyDex regressions, including preservation of Ekans and existing Arcade/Kids Club behavior.

## Full `npm test` environment limitation

`npm test` cannot complete in this extracted source environment because the existing browser recovery harness imports `playwright`, while this source bundle has no installed `node_modules` and the dependency could not be installed in the container.

Observed stop:

- First affected test: `tests/adventure-core.test.cjs`
- Require chain: `tests/adventure-core.test.cjs` → `scripts/recovery-browser.cjs` → `require('playwright')`
- Node result: `MODULE_NOT_FOUND`

This is an environment/dependency stop, not a LuckyDex assertion failure. Browser-backed tests are therefore **not claimed as passed**.

## Android build environment limitation

An Android APK build could not be run from this uploaded source bundle because it does not contain a Gradle wrapper (`./gradlew`).

Observed result:

- `./gradlew assembleDebug` unavailable: `./gradlew` is not present in the source bundle.

The Android build is therefore **not claimed as verified** in this environment.

## Static/release checks

- `node --check app/src/main/assets/arcade-dig-dig-dig-core.js` — PASS
- `node --check app/src/main/assets/arcade-dig-dig-dig.js` — PASS
- `package.json` version — `0.36.0`
- `app/build.gradle` versionCode — `3600`
- `app/build.gradle` versionName — `0.36.0`
- `app/build.gradle` applicationId — `com.example.luckydex`
- Runtime build marker — `0.36.0`
- Visible HTML release labels — `v0.36.0`

## Final review

A final self-review was performed because this environment does not expose a separate subagent reviewer. One Important lifecycle issue was found: the displayed elapsed timer could advance while a race was background-paused even though CPU/game deadlines were frozen. A regression assertion was added first and observed failing (`5000 !== 100`), then the runtime was fixed to preserve paused elapsed time and the lifecycle test returned green.

A second RED→GREEN presentation check pinned the `DIG!` flash and terrain progression classes before release.

An independent fresh-context code review was **not available**, so this self-review is explicitly weaker than a separate reviewer pass.

## Packaging exclusions

The release source ZIP excludes transient/dependency/build output such as:

- `.git/`
- `node_modules/`
- `.gradle/`
- generated `build/` directories
- transient `.log` files
- `.superpowers/` scratch workspace

The approved design spec, implementation plan, source, tests, assets, and this report are retained in the source release.
