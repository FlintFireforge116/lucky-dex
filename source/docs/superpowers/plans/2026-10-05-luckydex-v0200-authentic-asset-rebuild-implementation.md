# LuckyDex v0.20.0 Authentic Arcade Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the v0.19 CSS-drawn Arcade presentation with actual-game asset-backed venue and game surfaces that fit correctly on Android portrait screens.

**Architecture:** Keep v0.19 gameplay/save/reward modules as the mechanic layer. Add a deterministic authentic-asset fetch manifest, a transform-driven v0.20 world navigator, and one v0.20 fidelity CSS/JS adapter that reshapes game surfaces around authentic local assets and guarantees visible controls.

**Tech Stack:** Android WebView; HTML/CSS/vanilla JS; Python asset fetch/validation; Node assert tests; pytest; Chromium/Playwright local smoke.

**Spec:** `docs/superpowers/specs/2026-10-05-luckydex-v0200-authentic-asset-rebuild-design.md`

## Global Constraints
- `versionName '0.20.0'`, `versionCode 210`.
- Existing package ID and `app/luckydex-dev.keystore` unchanged.
- Actual assets are local at runtime; no gameplay depends on network access.
- Asset fetch failures fail CI rather than falling back to generated venue art.
- Preserve v0.19 mechanics/reward/save behavior except for presentation ownership.

## Review Focus
1. 360x800 Android viewport: every initial game control visible and clickable.
2. WebView scrollbar behavior: world parent remains `overflow-x:hidden`, no native scroller.
3. Missing/blocked external asset: fetch step exits non-zero before Gradle.
4. v0.19 save upgrade: same state fields and reward owners survive.
5. Older CSS specificity: v0.20 rules must actually win without requiring DOM-breaking rewrites.

### Task 1: Regression tests for layout and asset ownership
**Files:** Create `tests/test_arcade_v0200_static.py`, `tests/arcade-world-v0200.test.js`.
- [ ] Write assertions for no native horizontal world scroller, authentic asset paths, no generated v0190 venue paths, Start controls inside stage shells, version metadata and workflow fetch step.
- [ ] Run tests and observe RED.

### Task 2: Deterministic authentic asset pipeline
**Files:** Create `scripts/fetch_arcade_v0200_assets.py`, `app/src/main/assets/arcade/authentic-v0200/ASSET_SOURCES.md`; modify workflow.
- [ ] Define explicit URL/fallback manifest and image magic/size validation.
- [ ] Add CI fetch before Gradle; fail on any required missing asset.
- [ ] Update APK artifact name.

### Task 3: Transform-driven world and actual-game venue art
**Files:** Create `arcade-world-v0200.js/css`; modify `index.html`.
- [ ] Replace native horizontal scrolling with overflow-hidden track translated by JS.
- [ ] Preserve swipe + arrows + selected venue state/back hierarchy.
- [ ] Point all eight venues to authentic local art.

### Task 4: Phone-safe authentic game frames
**Files:** Create `arcade-fidelity-v0200.css/js`; modify `index.html`.
- [ ] Move/clone primary Start controls into in-frame start shelves.
- [ ] Replace hard min-height presentation with source-ratio frames.
- [ ] Apply authentic Amie/Voltorb/Berry Blender/Clefairy/Fossil/location assets as dominant visual surfaces.
- [ ] Preserve mechanics/event ownership.

### Task 5: Browser geometry verification
**Files:** Create `scripts/browser_smoke_v0200.py`.
- [ ] At 360x800 and 412x915, open Arcade/world and each game.
- [ ] Assert world overflow is hidden; no scrollbar track overlays art.
- [ ] Assert each initial Start/primary control bounding rect intersects viewport and click target is unobstructed.

### Task 6: Release integration and package
**Files:** Modify build metadata/docs; create `TEST_REPORT_v0.20.0.md`.
- [ ] Set v0.20.0/versionCode 210/build marker.
- [ ] Run all Node tests, pytest, JS syntax, browser smoke, keystore hash and ZIP CRC.
- [ ] Package `LuckyDex_source.zip` and `LuckyDex_v0.20.0_SOURCE.zip`.
