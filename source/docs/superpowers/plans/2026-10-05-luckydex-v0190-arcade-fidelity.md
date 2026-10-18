# LuckyDex v0.19.0 Arcade Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace v0.18's generic Arcade presentation with recognisable Pokémon-inspired world/game layouts while preserving saves and economy.

**Architecture:** Leave v0.18 platform/session code as the reward/result foundation. Add v0.19 world, Amie and classic-game modules loaded after legacy providers; v0.19 owns visible interaction surfaces while older modules remain for compatibility/testing. Update HTML shells where the real game requires different controls.

**Tech Stack:** Android WebView; HTML/CSS; vanilla JavaScript; Canvas; Pointer Events; requestAnimationFrame; Node assert tests; pytest static tests.

**Spec:** `docs/superpowers/specs/2026-10-05-luckydex-v0190-arcade-fidelity-design.md`

## Global Constraints
- versionName `0.19.0`, versionCode `200`.
- build marker `0.19.0-arcade-fidelity`.
- package ID and keystore unchanged.
- v0.18 session/platform remain reward truth.
- no Ditto/Safari visible launcher.
- phone portrait layout must work at 320 CSS px without page-level horizontal overflow.

## Review Focus
1. 320-360px phones: world and 6×8 Tile Puzzle remain usable without page overflow.
2. Rapid finish/input races: every run awards once.
3. Legacy providers loaded before v0.19 must not re-own click handlers afterward.
4. Missing Pokémon artwork must fall back without breaking game geometry.
5. Returning from any game restores its venue/world stop.

---

### Task 1: v0.19 World Route + Landmark Assets
**Files:** Create `arcade-world-v0190.js/css`, replace/add `arcade/venues-v0190/*`, modify `index.html`, add `tests/arcade-world-v0190.test.js`.
**Interfaces:** Produce `LuckyDexArcadeWorld` compatible with v0.18 methods and exact 8-venue/10-game mapping.
- [x] Write RED tests for viewport-scale stops, mapping, local assets, saved selection and back hierarchy.
- [x] Run RED.
- [x] Build continuous route and richer local landmark art.
- [x] Run task tests + v0.18 world regression.

### Task 2: Pokémon-Amie Fidelity Rebuild
**Files:** Create `arcade-amie-v0190.js/css`, modify Berry/Head/Tile HTML, add `tests/arcade-amie-v0190.test.js`.
**Interfaces:** Produce `LuckyDexAmieV0190` with `open`, `close`, `activeGame`; Berry 60s/3-miss model; Head 60s/Fever/final-bonus model; Tile swap model `rows×cols`.
- [x] RED tests for source-game configs, finish guards, swap-only puzzle, canvas crop mapping.
- [x] Run RED.
- [x] Implement Berry Picker.
- [x] Implement Head It.
- [x] Implement Tile Puzzle.
- [x] Run task + v0.17/v0.18 Amie regression.

### Task 3: Voltorb Flip Memo + Authentic Board
**Files:** Create `arcade-classics-v0190.js/css`, modify Voltorb HTML, add `tests/arcade-classics-v0190.test.js`.
**Interfaces:** `LuckyDexArcadeClassics` exposes Voltorb state helpers and `open(gameId)` adapters.
- [x] RED memo/board/result tests.
- [x] Run RED.
- [x] Implement memo marks, board composition and exact-result bridge.
- [x] Run GREEN + legacy platform regression.

### Task 4: Berry Blender + Clefairy Says
**Files:** Extend `arcade-classics-v0190.js/css`, modify Berry/Clefairy HTML.
- [x] RED tests proving Berry Blender retains continuous retail-derived engine and Clefairy uses teacher sequence/five-hit structure.
- [x] Run RED.
- [x] Reskin/wire Berry Blender around its existing engine.
- [x] Implement Clefairy classroom game and exact reward result.
- [x] Run GREEN.

### Task 5: Underground-Style Fossil Dig
**Files:** Extend `arcade-classics-v0190.js/css`, modify Fossil HTML.
- [x] RED layered-hardness/stability/tool-footprint/finish-guard tests.
- [x] Run RED.
- [x] Implement excavation model and wall UI.
- [x] Run GREEN.

### Task 6: Ball Drop / Unown / Quiz Scene Polish
**Files:** Create `arcade-polish-v0190.css/js` as needed, modify associated HTML.
- [x] Static/logic RED tests for preserved three-ball lifecycle and active legacy quiz/unown result ownership.
- [x] Run RED.
- [x] Implement cabinet, ruins and anime-interstitial presentation.
- [x] Run GREEN + v0.18 Ball Drop regression.

### Task 7: Release Integration
**Files:** `index.html`, `app/build.gradle`, `README.md`, `CODEX_HANDOVER.md`, `TEST_REPORT_v0.19.0.md`, `tests/test_arcade_v0190_static.py`.
- [x] RED release/static assertions.
- [x] Apply 0.19.0 metadata and final script/style order.
- [x] Run all Node tests, pytest, node --check and keystore hash.
- [x] Package `LuckyDex_source.zip` and `LuckyDex_v0.19.0_SOURCE.zip`; test CRC and SHA-256.
