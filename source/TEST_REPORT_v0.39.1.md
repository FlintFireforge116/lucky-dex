# LuckyDex v0.39.1 — On-device Arcade & Pack Stability Test Report

**Release:** 0.39.1  
**Android versionCode:** 3901  
**Baseline:** v0.39.0 Arcade Records & Game Review

## Delivered

- Repaired the shared Arcade RUN / REWARD / LIVE strip so it is styled, separated and no longer renders as concatenated raw text.
- Reworked Berry Picker's vertical grid so the playfield receives the flexible height instead of the HUD, removing the giant empty middle section seen on mobile.
- Removed the obsolete Ball Drop jackpot achievement definitions so jackpot progress cannot appear in unrelated GAME REVIEW panels.
- Made Fossil Dig vertically scrollable on short Android viewports so the End Dig / confirmation area is no longer clipped by the app shell.
- Replaced Fossil Dig's tiny Odd Keystone header icon with the local Cranidos actor sprite.
- Added a full-field 3–2–1 Ekans countdown. No targets or launcher are exposed until the countdown completes; zero-countdown test/tool launches retain immediate-start compatibility.
- Removed Dig! Dig! Dig!'s four-second grace-expiry phase. The race now continues after the player finishes, the elapsed timer keeps increasing, and results finalize only when every racer has crossed the finish.
- Hardened pack preparation with recoverable collation retries and set/source diagnostics. Pack preparation still happens before entitlement debit, and commit-time entitlement validation now fails closed if coins/tickets/sealed stock/daily allowance changed while preparing.
- Pack preparation errors explicitly state that nothing was spent, rather than leaving the player unsure whether a failed pack consumed currency.

## Root causes confirmed

The mobile UI corruption was not a device-font issue: the v0.39.0 shared session strip was injected without a matching CSS component, while Berry Picker's row template assigned its flexible `1fr` track to the HUD rather than the stage. Fossil Dig also explicitly disabled overflow, which clipped lower controls on shorter viewports.

Dig's `GRACE EXPIRED` rows came from an intentional `graceMs: 4000` finalization path rather than a display-only bug. Ekans spawned its targets as part of `startRound()` before the countdown timer had elapsed. Pack debit already happened after preparation, but recoverable build errors had no retry and the error logger lost the selected set context because no prepared pack existed yet.

## TDD regression coverage

`tests/v0391-device-feedback-regressions.test.cjs` was added before the production fixes and observed failing against the v0.39.0 behavior. It now covers the session-strip styling, Berry grid allocation, Fossil scrolling/header actor, jackpot-definition removal, Ekans countdown/spawn ordering, Dig all-racers completion/timer behavior, and pack retry/no-spend hardening.

`tests/v0391-release.test.cjs` was likewise observed RED before the release-version bump and GREEN after the v0.39.1 identity was applied.

Existing Dig and Ekans lifecycle tests were updated to assert the intended replacement behavior rather than the retired grace/immediate-spawn behavior.

## Repository-wide regression verification

Every `tests/*.test.cjs` program was executed individually on the final source tree so unavailable browser harnesses could be separated from product assertion failures:

- **305 total test programs discovered**
- **290 passed**
- **15 unavailable** because they require Playwright/browser support not installed in this extracted environment
- **0 available-program failures**

The unavailable programs are:

- `adventure-core.test.cjs`
- `adventure-file-origin.test.cjs`
- `adventure-lifecycle.test.cjs`
- `adventure-persistence.test.cjs`
- `adventure-regional-browser.test.cjs`
- `adventure-runtime.test.cjs`
- `amie-recovery.test.cjs`
- `arcade-dash-browser.test.cjs`
- `v0223-ball-stalls.test.cjs`
- `v0223-berry-touch.test.cjs`
- `v0223-layout-grid.test.cjs`
- `v0320-ball-drop-render.test.cjs`
- `v0340-dash-previews.test.cjs`
- `v0340-dash-repeated-races.test.cjs`
- `v0340-dash-viewport.test.cjs`

The repository's normal `npm test` command was also run. It reaches the Playwright-backed Adventure browser test and stops with `MODULE_NOT_FOUND: playwright`; this is an environment limitation, not reported as a product pass.

## Offline asset integrity

The project's offline verification stages pass on the release tree:

- authentic Arcade scenes/sheets/crops: **44** validated
- offline Arcade sprites: **2,098** validated
- actor files: **2,078** validated
- local Arcade venues: **8** validated
- Adventure assets: **829 images / 1,025 species / 386 back sprites / 37 registry objects**
- Fossil Museum assets: **42 images** validated

## Syntax / release identity

- **51 / 51** top-level JavaScript files under `app/src/main/assets` passed `node --check`.
- `tests/v0391-device-feedback-regressions.test.cjs` — PASS.
- `tests/v0391-release.test.cjs` — PASS.
- `package.json` / `package-lock.json` version: **0.39.1**.
- Android `versionCode`: **3901**.
- Android `versionName`: **0.39.1**.
- No Gradle wrapper (`gradlew`) is present in this source archive, so an APK compile is not claimed.

## Review environment

This extracted source archive contains no Git metadata, so no branch/worktree commit or merge claim is made. No independent subagent execution tool is available in this harness; the fixes were therefore reviewed by focused source inspection followed by fresh regression verification.

## Packaged archive verification

The release ZIP is packaged with Git metadata, `node_modules`, Python caches and scratch output excluded, then extracted into a fresh directory. Release identity, v0.39.1 regressions, syntax checks and the complete available test sweep are rerun against the extracted bytes before delivery.
