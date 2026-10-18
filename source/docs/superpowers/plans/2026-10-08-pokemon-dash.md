# Pokémon Dash Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete offline six-racer Pokémon Dash minigame to LuckyDex v0.29.0 using the player's caught Pokémon, Speed-derived performance, lane hazards, stamina/sprint controls, AI racers, persistent stats, and exact-once rewards.

**Architecture:** Keep race logic isolated in `arcade-dash.js`, deterministic course generation in `arcade-dash-course.js`, and presentation in `arcade-dash.css`, with only narrow hooks into the existing Arcade world/session/platform and save schema. Pure race helpers export through CommonJS for Node tests while the browser API is exposed as `window.LuckyDexDash`.

**Tech Stack:** Vanilla JavaScript, HTML/CSS, Canvas 2D, Android WebView, Node/assert regression tests, Gradle Android packaging.

**Spec:** `docs/superpowers/specs/2026-10-08-pokemon-dash-design.md`

## Global Constraints

- Release `versionName 0.29.0`, Android `versionCode 291`.
- Preserve `applicationId 'com.example.luckydex'` and permanent signer configuration.
- Preserve all existing saves and unknown `state.arcade` keys; migration is additive only.
- Dash race logic and visuals are fully offline and use bundled assets/species metadata.
- Player picker contains only actual entries from `state.pokemon`; no fallback racer is injected.
- Raw species Speed is compressed to a roughly 15–20% pace spread before skill effects.
- Placement rewards are exactly `120 / 80 / 55 / 35 / 25 / 20` Lucky Coins for 1st–6th.
- Background/recent-app transitions freeze simulation time; close/navigation cancels active RAF/listeners and grants no abandoned-race reward.

## Review Focus

- Empty or stale Pokémon collection keys return safely to the picker and never fabricate ownership.
- Missing species metadata/sprite/canvas context degrades safely without preventing navigation or race completion.
- Large frame gaps after backgrounding do not advance race simulation by hidden elapsed time.
- Course generation never presents simultaneous unavoidable hazards across all three lanes in the player reaction window.
- Finish/lifecycle callbacks cannot award the same race more than once.

---

### Task 1: Dash persistence and collection racer model

**Files:**
- Modify: `app/src/main/assets/arcade-platform.js`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify/Test: `tests/arcade-platform.test.cjs`

**Interfaces:**
- Produces: `LuckyDexArcadePlatform.dashRacers()`, normalized `state.arcade.dash`, and `dash` venue persistence support.
- Consumes: `state.pokemon`, bundled sprite paths, existing `ensureArcadeState()` semantics.

- [ ] **Step 1: Write failing platform tests** for Dash state defaults/unknown-key preservation, `dashCourse` last venue, empty collection returning `[]`, and racer identity `{key,id,name,shiny,level,baseSpeed,image}`.
- [ ] **Step 2: Run `node tests/arcade-platform.test.cjs`** and verify failures are caused by missing Dash support.
- [ ] **Step 3: Implement additive Dash defaults and `dashRacers()`**, sourcing Speed from `LuckyDexAdventureSpecies` with collection-baseStats then neutral fallback.
- [ ] **Step 4: Run `node tests/arcade-platform.test.cjs`** and verify PASS.

### Task 2: Deterministic course generator and race math

**Files:**
- Create: `app/src/main/assets/arcade-dash-course.js`
- Create: `tests/arcade-dash-course.test.cjs`
- Create: `app/src/main/assets/arcade-dash.js`
- Create: `tests/arcade-dash.test.cjs`

**Interfaces:**
- Produces course API `generateCourse(seed)`, `objectsNear(course,distance,lookAhead)`, constants/helpers for hazards and three lanes.
- Produces Dash pure helpers: `paceModifier`, `levelModifier`, `stepStamina`, `applyCourseObject`, `clampLane`, `rankRacers`, `rewardForPlace`, `stepRace`, `createRaceState`, `finishRaceOnce`.
- Consumes racer records from Task 1 and `LuckyDexAdventureSpecies` for AI selection.

- [ ] **Step 1: Write failing course tests** for deterministic seed output, lane bounds, object spacing, increased late density, and no three-lane unavoidable hazard cluster inside the reaction window.
- [ ] **Step 2: Run `node tests/arcade-dash-course.test.cjs`** and verify module-missing/behavior failures.
- [ ] **Step 3: Implement minimal deterministic seeded course module** with rock, mud, speed-pad, stamina-pickup objects.
- [ ] **Step 4: Run course tests** and verify PASS.
- [ ] **Step 5: Write failing race-math tests** for bounded Speed spread, capped level bonus, sprint drain/recovery, hazard/boost expiry, lane interpolation/clamping, finite AI stamina/shared object effects, stable placement, fixed-distance finish, reward table, and hidden-time step capping.
- [ ] **Step 6: Run `node tests/arcade-dash.test.cjs`** and verify expected failures.
- [ ] **Step 7: Implement pure race helpers and state machine primitives** in `arcade-dash.js` without DOM-specific behavior yet.
- [ ] **Step 8: Run both Dash test files** and verify PASS.

### Task 3: Interactive Dash runtime, lifecycle, and exact-once completion

**Files:**
- Modify: `app/src/main/assets/arcade-dash.js`
- Modify/Test: `tests/arcade-dash.test.cjs`
- Modify: `app/src/main/assets/arcade-session.js`
- Modify/Test: `tests/arcade-session.test.cjs`

**Interfaces:**
- Produces browser API `window.LuckyDexDash.open()`, `.close()`, `.pause()`, `.resume()`, `.startRace(key)` and picker/race runtime.
- Consumes `LuckyDexArcadePlatform.dashRacers()`, `awardRun()`, `LuckyDexArcadeSession.showResult()`, and course API from Task 2.

- [ ] **Step 1: Add failing tests** for race completion guard/exactly-once award, pause/resume frame delta reset, abandoned close receiving no reward, and Dash session copy.
- [ ] **Step 2: Run targeted tests** and verify expected failures.
- [ ] **Step 3: Implement lifecycle-aware RAF/input/AI runtime**, preserving countdown/race state on visibility pause, cancelling all handlers on close, and updating Dash stats only at guarded finish.
- [ ] **Step 4: Implement result routing** with `RACE AGAIN`, `CHANGE RACER`, placement/time/Speed details and existing `awardRun()` path.
- [ ] **Step 5: Run targeted tests** and verify PASS.

### Task 4: Dash UI, canvas rendering, and Arcade world integration

**Files:**
- Create: `app/src/main/assets/arcade-dash.css`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/arcade-world.js`
- Create: `tests/arcade-dash-integration.test.cjs`

**Interfaces:**
- Produces `dashGame` DOM shell, racer picker, canvas/HUD/mobile controls, dedicated `dashCourse` world stop and owner routing.
- Consumes `window.LuckyDexDash` runtime and existing Arcade world navigation.

- [ ] **Step 1: Write failing source/DOM contract tests** for CSS/script load order, `dashGame` shell, `dashCourse` venue metadata, objective/name mappings, owner routing, and last-venue support.
- [ ] **Step 2: Run `node tests/arcade-dash-integration.test.cjs`** and verify expected failures.
- [ ] **Step 3: Add the Dash HTML/CSS and world integration**, including search/sort racer picker, six-racer canvas, HUD, pause overlay, SPRINT/UP/DOWN mobile controls and empty/unavailable states.
- [ ] **Step 4: Implement canvas scene rendering** with parallax/scenery, three lane marks, course objects, shadows, racer sprites, overtakes, and finish line while retaining readable fallback rendering for missing sprites.
- [ ] **Step 5: Run integration + Dash logic tests** and verify PASS.

### Task 5: Release metadata, regression verification, and package

**Files:**
- Modify: `app/build.gradle`
- Modify: `package.json`
- Create: `TEST_REPORT_v0.29.0.md`
- Modify as needed: `docs/RELEASE_HISTORY.md`
- Test: existing suite plus Dash tests

**Interfaces:**
- Produces Termux-ready `LuckyDex_source_v0.29.0.zip` preserving app identity and signer.
- Consumes all prior task outputs.

- [ ] **Step 1: Write failing release contract assertions** into `tests/arcade-dash-integration.test.cjs` for versionName/code/applicationId/signer and package version.
- [ ] **Step 2: Run integration test** and verify version assertions fail on v0.28.10 metadata.
- [ ] **Step 3: Update release metadata to 0.29.0 / 291** without changing application ID or signer.
- [ ] **Step 4: Run targeted tests:** `node tests/arcade-platform.test.cjs`, both Dash logic tests, Dash integration, session, world-related regression tests.
- [ ] **Step 5: Run full `npm test`** and record every failure by name; fix any Dash-caused regression.
- [ ] **Step 6: Run Android debug build if Gradle wrapper/environment permits**; otherwise document the exact limitation.
- [ ] **Step 7: Write `TEST_REPORT_v0.29.0.md` and release-history entry** with commands/results and known limitations.
- [ ] **Step 8: Package the source as `/mnt/data/LuckyDex_source_v0.29.0.zip`**, excluding `.git`, `.superpowers`, build caches and generated APK/build directories, and verify the ZIP contains the expected versioned source.
