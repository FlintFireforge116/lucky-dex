# Ekans' Hoop Hurl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LuckyDex v0.35.0 with an expandable Gen III-styled Pokémon Stadium / Kids Club venue and a complete touchscreen Ekans' Hoop Hurl minigame.

**Architecture:** Add a small pure rules module for deterministic field/throw/CPU logic, then a game owner that renders and drives the 60-second round through the existing Arcade world/session contracts. Keep game-specific styling and authentic local assets isolated under the Ekans/Kids Club files so later Kids Club games can reuse the venue without growing global Arcade code.

**Tech Stack:** Vanilla JavaScript, HTML/CSS, existing LuckyDex Arcade/session/state APIs, Node `assert` tests, Playwright browser QA, Android Gradle wrapper.

**Spec:** `docs/superpowers/specs/2026-10-10-ekans-hoop-hurl-design.md`

## Global Constraints

- Baseline is LuckyDex v0.34.7; target release is `0.35.0` / Android `versionCode 350`.
- Android application ID stays `com.example.luckydex`; signing/update identity must not change.
- Core rules: 60 seconds, 3×3 sockets, max three active Diglett, normal = 1, Gold = 2, four competitors, ties allowed.
- Use the existing local Gen III Ekans/Diglett assets: `arcade/sprites/actors/pokemon/23.png` and `50.png`.
- Prefer authentic local/extracted Gen III arena assets; no hand-drawn replacement Pokémon art and no runtime network dependency.
- Primary input is pull-and-release touch aiming; fully playable fallback buttons provide Left/Right, Near/Mid/Far and Throw.
- Android visibility loss pauses the current round; returning requires explicit resume and must not consume timer time.
- Leaving with Back intentionally abandons the round and returns to the Kids Club venue.
- The uploaded source bundle has no `.git` directory, so this execution uses test checkpoints instead of local commits; final output is a versioned source ZIP for the user's normal Termux Git workflow.

## Review Focus

- Rapid repeated throws must never create duplicate scoring or exceed three active Diglett.
- A target that ducks during a throw must not be scored from stale state.
- Backgrounding during countdown, active play, or an airborne throw must preserve the round and frozen timer until explicit resume.
- Pointer cancel / interrupted drag must reset aim safely and leave fallback controls usable.
- 320–360 px portrait layouts must keep the complete field, throw controls and Back control reachable without page-level horizontal scrolling.

---

### Task 1: Pure Hoop Hurl Rules

**Files:**
- Create: `app/src/main/assets/arcade-ekans-hoop-core.js`
- Create: `tests/v0350-ekans-core.test.cjs`

**Interfaces:**
- Produces: `LuckyDexEkansHoopCore` / CommonJS export containing `CONFIG`, `createRound(rng)`, `spawnTarget(round, rng, nowMs)`, `expireTargets(round, nowMs, rng)`, `resolveThrow(round, throwSpec, nowMs)`, `cpuDecision(round, cpuIndex, rng, nowMs)`, `rankScores(scores)`.
- `round.targets` contains at most three unique active socket records from indexes 0–8; throws identify the target generation/token they evaluated so stale targets cannot score.

- [ ] **Step 1: Write failing core tests**
  - Assert `CONFIG.durationMs === 60000`, nine sockets, `maxActiveTargets === 3`, normal/gold values 1/2.
  - Assert repeated `spawnTarget` calls never create duplicate sockets or more than three active targets.
  - Assert `resolveThrow` scores only a live target in the resolved lane/depth tolerance and clears exactly that target once.
  - Assert an expired/replaced target token cannot be scored by a stale throw.
  - Assert `rankScores([7,7,5,2])` preserves a tied first place.
  - Assert CPU decisions remain within valid lane/depth values and produce bounded reaction/error values.

- [ ] **Step 2: Run `node tests/v0350-ekans-core.test.cjs` and verify failure because the module does not exist.**

- [ ] **Step 3: Implement the pure rules module with deterministic RNG injection and no DOM/global-state dependency.**

- [ ] **Step 4: Run `node tests/v0350-ekans-core.test.cjs` and verify PASS.**

### Task 2: Kids Club Venue, Game Shell and Authentic Asset Contract

**Files:**
- Modify: `app/src/main/assets/arcade-world.js`
- Modify: `app/src/main/assets/arcade-platform.js`
- Modify: `app/src/main/assets/arcade-session.js`
- Modify: `app/src/main/assets/index.html`
- Create: `app/src/main/assets/arcade-ekans-hoop.css`
- Create/Copy: `app/src/main/assets/arcade/kids-club/...` authentic Gen III venue/arena assets as needed
- Create: `app/src/main/assets/arcade/kids-club/SOURCES.md`
- Create: `tests/v0350-ekans-integration.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexEkansHoopCore` from Task 1.
- Produces: venue ID `stadiumKidsClub`, game ID `ekansHoop`, `#ekansHoopGame` shell, and session rule metadata.

- [ ] **Step 1: Write failing integration/source-contract tests**
  - Assert `stadiumKidsClub` is a new venue with `games:['ekansHoop']` and does not replace existing venue IDs.
  - Assert game name/objective and owner mapping `ekansHoop:()=>window.LuckyDexEkansHoop` exist.
  - Assert `index.html` loads the core, game CSS and runtime before `arcade-world.js` and contains the required HUD, 3×3 field, launcher, fallback controls and pause overlay IDs.
  - Assert production markup references the local Ekans/Diglett actor sprites and no remote URL is used by the game shell.
  - Assert Kids Club source/provenance documentation exists for added extracted assets.

- [ ] **Step 2: Run `node tests/v0350-ekans-integration.test.cjs` and verify failure.**

- [ ] **Step 3: Add the venue/game/session metadata, shell and isolated CSS; materialise only authentic Gen III assets required by the arena and document their provenance.**

- [ ] **Step 4: Run the integration test and verify PASS.**

### Task 3: Playable Game Owner, Touch Controls and CPU Competition

**Files:**
- Create: `app/src/main/assets/arcade-ekans-hoop.js`
- Modify: `app/src/main/assets/arcade-ekans-hoop.css`
- Create: `tests/v0350-ekans-runtime.test.cjs`
- Create: `tests/v0350-ekans-browser.test.cjs`

**Interfaces:**
- Consumes: Task 1 core and Task 2 DOM shell/session metadata.
- Produces: `window.LuckyDexEkansHoop` with `open()`, `close()`, `pause()`, `resume()`, `startRound()`, and test-facing `snapshot()`.

- [ ] **Step 1: Write failing runtime/browser tests**
  - Runtime test asserts `open()` starts a fresh four-player 60-second model, `close()` cancels timers/RAF, and `snapshot()` exposes bounded active target/score/phase data.
  - Browser test enters Kids Club through `LuckyDexArcadeWorld`, starts the game, and verifies the player can aim by pointer drag/release and separately by fallback controls.
  - Verify pointer cancel leaves `dragging === false` and a subsequent fallback throw works.
  - Verify rapid throws cannot score the same target twice and active targets stay `<= 3`.
  - At 360×800 and 320×640 verify no horizontal overflow and Back/controls remain visible/reachable.

- [ ] **Step 2: Run the new runtime/browser tests and verify failure.**

- [ ] **Step 3: Implement renderer/runtime**
  - Render nine fixed sockets with authentic Diglett sprites; gold uses the same sprite plus limited tint and a non-colour sparkle marker.
  - Render player and three CPU Ekans with authentic sprites; airborne player Ekans follows a short CSS/JS parabolic transform without replacement illustration.
  - Implement touch mapping: horizontal drag selects left/centre/right lane and downward pull selects near/mid/far with a projected landing marker.
  - Implement Left/Right + Near/Mid/Far + Throw fallback controls.
  - Drive three CPUs from the core with reaction delay, aim error, throw interval and occasional gold preference.

- [ ] **Step 4: Run `node tests/v0350-ekans-runtime.test.cjs` and the browser test with the project Playwright launcher; verify PASS and no console/page errors.**

### Task 4: Lifecycle, Persistence, Rewards and Results

**Files:**
- Modify: `app/src/main/assets/arcade-ekans-hoop.js`
- Modify: `app/src/main/assets/arcade-platform.js`
- Modify: `app/src/main/assets/arcade-session.js`
- Modify: `app/src/main/assets/arcade-world.js` only if suspend delegation is required
- Create: `tests/v0350-ekans-lifecycle.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexArcadePlatform.awardRun`, `LuckyDexArcadeSession.showResult`, current `state.arcade` save migration.
- Produces: `state.arcade.ekansHoop = {gamesPlayed,wins,bestScore}` and exactly-once result/reward completion.

- [ ] **Step 1: Write failing lifecycle tests**
  - Assert state migration supplies non-destructive defaults for `ekansHoop` while retaining existing Arcade state.
  - Assert visibility loss pauses countdown/round and freezes remaining time; returning displays resume overlay and does not auto-resume.
  - Assert pause during an airborne throw resumes that same round safely without duplicate resolution.
  - Assert Back/close abandons without awarding a result.
  - Assert finished rounds increment games played once, update wins/best score, preserve ties, and award the configured placement coins exactly once.

- [ ] **Step 2: Run lifecycle tests and verify failure.**

- [ ] **Step 3: Implement pause/resume ownership, state persistence, placement rewards (220 / tied-first 200 / 150 / 110 / 80) and shared result-sheet wiring.**

- [ ] **Step 4: Run lifecycle tests and verify PASS.**

### Task 5: Release Identity, Regression Suite and Packaging

**Files:**
- Modify: `app/build.gradle`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/v0350-release.test.cjs`
- Create: `TEST_REPORT_v0.35.0.md`
- Create final archive: `/mnt/data/LuckyDex_source_v0.35.0.zip`

**Interfaces:**
- Consumes: completed Tasks 1–4.
- Produces: an update-compatible v0.35.0 source bundle.

- [ ] **Step 1: Write failing release test**
  - Assert `applicationId 'com.example.luckydex'`, `versionCode 350`, `versionName '0.35.0'`.
  - Assert package/package-lock/runtime/title build markers all equal `0.35.0`.
  - Assert Ekans core/runtime/CSS assets are bundled and no existing Arcade venue/game contract regresses.

- [ ] **Step 2: Run release test and verify failure on v0.34.7 identity.**

- [ ] **Step 3: Update release identity and visible/runtime version markers only; do not alter signing/application ID.**

- [ ] **Step 4: Run focused v0.35.0 tests, then `npm test`; run available browser/mobile QA and `./gradlew assembleDebug` if the local Android toolchain is present. Record exact results and any environment-limited checks in `TEST_REPORT_v0.35.0.md`.**

- [ ] **Step 5: Package the complete source tree as `/mnt/data/LuckyDex_source_v0.35.0.zip`, excluding transient caches/build outputs while retaining docs/tests/assets. Verify the ZIP reopens and contains the v0.35.0 build files.**
