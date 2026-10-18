# LuckyDex v0.39.0 — Arcade Records & Game Review Test Report

**Release:** 0.39.0  
**Android versionCode:** 3900  
**Baseline:** v0.38.2 filtered bulk Dust Exchange

## Delivered

- Added shared Arcade GAME REVIEW presentation with mode/difficulty, competitive scoreboards, per-game stats, PB rows, rewards and newly completed achievement rows.
- Added ARCADE RECORDS from the Arcade hub with permanent per-game records and the 10 most recent completed runs per supported game.
- Stored historical reviews are read-only and cannot re-award rewards, achievements or history entries.
- Added compact, capped, sanitized review/history persistence under Arcade state, including duplicate-entry protection and old-save normalization.
- Migrated completed-result reviews across Berry Picker, Tile Puzzle, Voltorb Flip, Poké Ball Drop, Berry Blender, Clefairy Match, Fossil Dig, Unown Decoder, Who's That Pokémon?, Pokémon Dash, Ekans’ Hoop Hurl, Dig! Dig! Dig!, Magikarp’s Splash and Rock Harden.
- Dash Type League stores one completed cup review rather than three independent race-history entries.
- Clefairy failures now remain on GAME REVIEW rather than auto-resetting before the result can be inspected.
- Rock Harden Normal CPU target was rebalanced to approximately 40% Perfect / 9% miss, with Good becoming the most common successful outcome while Hard remains materially more precise.
- Magikarp Quick Splash now uses 84% of normal flight duration for both player and CPU while preserving jump height and the existing timing windows.
- Preserved the complete v0.38.2 Dust Exchange feature set, including filters, remembered Keep N, protected-card exclusion and atomic Convert Filtered confirmation.

## Final review fixes

The final whole-change self-review found and fixed these Important issues before packaging:

- GAME REVIEW mode/difficulty line is rendered instead of being silently omitted.
- Arcade Records hub cards show real permanent PB/totals summaries rather than a generic saved-record label.
- Rock Harden permanent records include Gold Rewards Claimed.
- Achievement snapshots distinguish an unavailable catalogue/runtime from a genuinely empty pre-run snapshot so previously completed achievements are not later mislabelled as new.
- Tile Puzzle permanent PB values are formatted as seconds, matching how they are stored, rather than being divided by 1000 as if they were milliseconds.
- Ball Drop, Rock Harden and Clefairy PB rows compare against the pre-run record so tying an existing best is not falsely labelled NEW RECORD.

The Tile/PB defects were observed RED in their focused regression tests and GREEN after the final fix pass.

## Focused v0.39.0 verification

Fresh final run on the release tree:

- **12 / 12 available focused v0.39.0 non-browser programs passed**
- `v0390-arcade-achievement-review.test.cjs`
- `v0390-arcade-records-core.test.cjs`
- `v0390-arcade-records-registry.test.cjs`
- `v0390-arcade-records-state.test.cjs`
- `v0390-arcade-records-ui.test.cjs`
- `v0390-arcade-session-review.test.cjs`
- `v0390-competitive-reviews.test.cjs`
- `v0390-release.test.cjs`
- `v0390-review-pb-truth.test.cjs`
- `v0390-rock-magikarp-balance.test.cjs`
- `v0390-solo-reviews-amie-corner-stage.test.cjs`
- `v0390-solo-reviews-discovery-ekans.test.cjs`

## Repository-wide regression verification

Every `.test.cjs` program was executed individually on the final source tree so missing browser dependencies could be separated from product assertion failures:

- **303 total test programs discovered**
- **288 passed**
- **15 unavailable** because they require Playwright through the browser/recovery harness and Playwright is not installed in this extracted environment
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

The repository's normal `npm test` command was also run. It stops at `adventure-core.test.cjs` with `MODULE_NOT_FOUND: playwright`; this environment limitation is reported rather than counted as a product failure or a pass.

## Offline asset integrity

All four project asset verification stages pass on the final tree:

- authentic Arcade scenes/sheets/crops: **44** validated
- offline Arcade sprites: **2,098** validated, with **2,078** unretouched actors source/output checked
- local Arcade venues: **8** validated
- Adventure assets: **829 images / 1,025 species / 386 back sprites / 37 registry objects**
- Fossil Museum assets: **42 images** validated

## Syntax / release identity

- **21 / 21 changed or newly introduced JavaScript files** passed `node --check`.
- `tests/v0390-release.test.cjs` — PASS.
- `package.json` / `package-lock.json` version: **0.39.0**.
- Android `versionCode`: **3900**.
- Android `versionName`: **0.39.0**.
- No Gradle wrapper (`gradlew`) is present in this source archive, so an APK compile is not claimed.

## Review environment

This extracted source archive does not contain Git metadata, so no branch/worktree commit or merge claim is made. No independent subagent reviewer is available in this harness; the final whole-change review was therefore performed as a separate author self-review, followed by the RED→GREEN fix pass and fresh full available regression sweep documented above.

## Packaged archive verification

The final `LuckyDex_source_v0.39.0.zip` was created with Git metadata, `node_modules`, Python caches and `.superpowers` scratch data excluded. The archive was then extracted to a fresh verification directory and all 12 available focused v0.39.0 tests, release identity, and targeted syntax checks were rerun successfully from the extracted bytes.
