# LuckyDex v0.59.1 Test Report

## Scope

v0.59.1 is a focused Barrier Ball mobile usability fix.

### Root cause
On phone-width screens the Barrier Ball court is square. The ready overlay lived inside that square and repeated the full rules paragraph as well as the title, best score, difficulty controls and **START MATCH** button. At the observed phone viewport this content exceeded the available ready-panel height, and the arena's `overflow:hidden` clipped the Start button to a small blue sliver.

### Fix
- The full Barrier Ball instructions remain in the shared first-play / top-right info help.
- On screens at or below 600px, the duplicate rules copy and redundant small venue label are hidden from the in-court ready overlay.
- Mobile ready spacing and title sizing are tightened.
- **START MATCH** now has a reserved non-shrinking 36px minimum tap target.
- Barrier Ball gameplay, physics, scoring, difficulty and rewards are unchanged.

## Verification

### Regression test added
`tests/v0591-barrier-ball-mobile-start.test.cjs`
- Verifies the phone layout removes the duplicated rules content that caused overflow.
- Verifies `START MATCH` retains a non-shrinking phone tap target.
- Verifies the actual Start button remains present in the Barrier Ball panel.
- Verifies v0.59.1 release metadata.

### Barrier Ball focused suite
Barrier Ball core, integration, state and v0.59.1 mobile-start tests.

Result: **19/19 passed**.

### Stadium 2 / help / records regression
Selected non-browser tests covering Gutsy Golbat, Furret's Frolic, Topsy-Turvy, Barrier Ball, shared Arcade help and Arcade records.

Result: **92/92 passed**.

### Repository-wide `npm test`
The repository command successfully completes its first three suites (**46/46 tests passed**) and then stops at `adventure-core.test.cjs` because the source bundle does not contain the declared `playwright` package in `node_modules` (`MODULE_NOT_FOUND: playwright`). This is the same existing source-package test-environment issue and is unrelated to the Barrier Ball CSS fix.

## Release metadata
- versionName: **0.59.1**
- versionCode: **5901**
- `package.json` / `package-lock.json`: **0.59.1**
- Android application ID unchanged: `com.example.luckydex`
- No Codex used.
