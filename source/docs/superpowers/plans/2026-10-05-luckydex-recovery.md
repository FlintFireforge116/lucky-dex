# LuckyDex Recovery Implementation Plan

> Execute inline with superpowers:executing-plans; independent asset, Android tooling, and Amie repairs use the parallel-agent workflow.

**Goal:** Recover the supplied app's stability, offline Arcade graphics and phone composition without adding features.

**Architecture:** Keep the save schema and file origin. Export the live state through a getter; one Arcade router owns all transitions and dispatches cleanup to one owner per game. Replace layered Arcade CSS with scoped definitive styles and package authentic references locally.

**Tech Stack:** Android Activity/WebView, plain JavaScript/CSS, Chromium/Playwright, Node unit tests, Python asset checks, Gradle.

**Spec:** `docs/RECOVERY_REQUEST.md`

## Global Constraints

- No new features; keep collection/save compatibility and signing identity.
- Local essential graphics, no generated substitutes, no runtime remote Arcade graphics.
- Test 360×800, 412×915, and 393×873 with real pointer/touch hit tests.
- Bump to 0.21.0 and versionCode above 210 only after packaging gates pass.
- Android browser evidence does not establish device runtime stability.

## Review Focus

- Mid-run exit must invalidate callbacks, RAFs, and drag listeners.
- Reentry must restore enabled Start controls and a complete scene.
- Existing saves with unknown fields must retain data.
- Delayed Trade catalogue results must not reclaim navigation or strand overlays.
- Android background/resume and system navigation require lifecycle cleanup and device validation.

### Task 1: Baseline and failure reproduction

Files: `scripts/recovery-browser.cjs`, `tests/recovery-navigation.cjs`, `artifacts/baseline/`.

- [x] Preserve supplied source as commit and create requested recovery branch.
- [x] Capture unchanged app at phone size; reproduce Ball Drop fullscreen residue with failing browser assertion.
- [x] Record Trade crash as not reproduced in browser; retain evidence and distinguish Android logs unavailable.

### Task 2: One owner and lifecycle repair

Files: `app/src/main/assets/{app-v0167.js,arcade-world.js,arcade-classics.js,arcade-quiz.js,arcade-unown.js,berry-blender.js,arcade-ball-drop.js,arcade-platform.js,arcade-session.js,binder-controls.js,index.html}`, `MainActivity.java`.

Interfaces: world router `openWorld/openVenue/openGame/backFromGame/leave/activeGame`; each owner `open/close` or `stop`; state getter exposes current save object.

- [x] Test Ball Drop exit, Blender countdown exit, state access, repeated route cycles, background cleanup and reward deduplication.
- [x] Remove loaded legacy owners and stale shells; migrate retained rules into sole owners; normalize chrome cleanup in router.
- [x] Verify browser regression tests; commit lifecycle phase.

### Task 3: Offline assets and responsive game scenes

Files: `arcade/`, `arcade.css`, `arcade-amie.{js,css}`, asset verifier, source audit.

- [x] Materialise reference images, local normal/shiny sprites and Unown letters; record hashes and source encoding.
- [x] Compare all ten games to references, repair aspect ratios, hierarchy, controls and idle scenes.
- [x] Assert loaded local images, board geometry, initial controls and overlays in three viewports; inspect screenshots; commit.

### Task 4: Regression and Android release package

Files: test runner/browser suite, `.github/workflows/build-apk.yml`, `app/build.gradle`, docs and artifacts.

- [x] Replace obsolete implementation-string tests with retained behavior tests and runtime smoke; run entire active suite.
- [x] Review branch, address important findings, inspect phone contact sheets.
- [x] Build/debug-sign APK; verify manifest, signature and packaged asset inventory.
- [x] If gates pass set 0.21.0/211, rebuild; otherwise keep source version and explicitly mark incomplete gates.
- [x] Produce source ZIP excluding signing key/cache, QA bundle and release report with limitations.

Candidate exception: native hardware validation remains unperformed; user explicitly chose delivery without a device. Retail-fidelity assets that cannot be sourced remain listed in ASSET_AUDIT.md.
