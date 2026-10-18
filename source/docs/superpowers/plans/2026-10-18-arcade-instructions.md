# Arcade Instructions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add first-play instructions and reusable top-right help to every current LuckyDex Arcade game.

**Architecture:** A shared `arcade-help` module owns copy, persistence helpers and UI. `arcade-world` remains the single lifecycle integration point so gameplay does not start before first-time help and optional game pause/resume is centralized.

**Tech Stack:** Vanilla JavaScript, HTML/CSS, Node `node:test` regression tests, Android WebView assets.

**Spec:** `docs/superpowers/specs/2026-10-18-arcade-instructions-design.md`

## Global Constraints
- Cover all 35 current `GAME_NAMES` IDs.
- First-time help must appear before the game owner's `open()` executes.
- Persist seen state per game in `state.arcade.helpSeen`.
- Same instructions reopen from a top-right info button.
- No gameplay balance/reward/achievement/rare-event changes.
- No Codex.

## Review Focus
- Existing saves with malformed or missing `helpSeen` must normalize without losing other Arcade state.
- Closing/cancelling first-time help must start the intended game exactly once, while cleanup must never trigger it.
- Help reopened during a pausable live game must resume only when this help invocation successfully paused it.
- Fullscreen/high-z-index games must not cover the info button or modal.
- Every registered current game must have Goal, Controls, Rules and Tip copy.

---

### Task 1: Help manifest and persisted state
**Files:** Create `app/src/main/assets/arcade-help.js`; modify `app/src/main/assets/arcade-platform.js`; test `tests/v0580-arcade-help.test.cjs`.

**Interfaces:** Produces `LuckyDexArcadeHelp.getInstructions(id)`, `isSeen(id)`, `markSeen(id)` and normalized `state.arcade.helpSeen`.

- [ ] Write failing tests for complete 35-game manifest and state normalization.
- [ ] Run them and verify expected failures.
- [ ] Implement manifest and normalized persistence.
- [ ] Run tests green.

### Task 2: Shared modal/info UI
**Files:** Modify `arcade-help.js`; create `app/src/main/assets/arcade-help.css`; modify `app/src/main/assets/index.html`; test `tests/v0580-arcade-help.test.cjs`.

**Interfaces:** Produces `showFirstTime(id,onContinue)`, `showInfo(id,{onOpen,onClose})`, `activate(id)`, `deactivate({silent})`, `isOpen()`.

- [ ] Write failing UI asset/API tests.
- [ ] Run RED.
- [ ] Implement modal, info button and safe close/cancel behavior.
- [ ] Run GREEN.

### Task 3: Arcade lifecycle integration
**Files:** Modify `app/src/main/assets/arcade-world.js`; test `tests/v0580-arcade-help-integration.test.cjs`.

**Interfaces:** Consumes `LuckyDexArcadeHelp`; defers unseen owner open and pauses/resumes supported owners for reopened help.

- [ ] Write failing lifecycle tests.
- [ ] Run RED.
- [ ] Integrate first-launch deferral, active info button, pause/resume and cleanup.
- [ ] Run GREEN plus existing Arcade/Kids Club tests.

### Task 4: Release and regression verification
**Files:** Modify `package.json`, `app/build.gradle`, `app/src/main/assets/app-v0167.js`, `app/src/main/assets/index.html`, `README.md`; create `TEST_REPORT_v0.58.0.md` and `tests/v0580-release.test.cjs`.

- [ ] Write failing v0.58.0 release test.
- [ ] Run RED.
- [ ] Bump version to 0.58.0 / versionCode 5800 and document feature.
- [ ] Run help tests, relevant regressions and available full suite; record exact outcomes.
- [ ] Package `LuckyDex_source_v0.58.0.zip`.
