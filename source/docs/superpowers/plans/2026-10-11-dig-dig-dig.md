# Dig! Dig! Dig! Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LuckyDex v0.36.0 with Dig! Dig! Dig! as the second Pokémon Stadium / Kids Club activity: a fair four-Sandshrew alternating-input race presented entirely in Gen III/GBA style.

**Architecture:** Add a pure deterministic Dig rules module for player alternation, CPU cadence, grace/ranking, and rewards; layer a small Arcade game owner on top for DOM lifecycle, touch/keyboard ownership, rendering, pause/resume, persistence, and results. Extend the existing `stadiumKidsClub`, Arcade platform/session, achievements, and HTML shell without refactoring Ekans or creating a premature generic Kids Club engine.

**Tech Stack:** Vanilla JavaScript, HTML/CSS, existing LuckyDex Arcade/session/state APIs, Node `assert` test programs, Playwright browser QA where available, Android Gradle wrapper.

**Spec:** `docs/superpowers/specs/2026-10-11-dig-dig-dig-design.md`

## Global Constraints

- Baseline is LuckyDex v0.35.17; target release is `0.36.0` / Android `versionCode 3600`.
- Android application ID stays `com.example.luckydex`; signing/update identity must not change.
- `RACE_DISTANCE = 80`; one accepted alternating input advances exactly one dig; same-side repeat does nothing and never reduces progress.
- Player input is touch/pointer `L`/`R` plus keyboard Left/Right and A/D; `KeyboardEvent.repeat` is ignored.
- Easy CPU valid-input interval is 210–300 ms, Normal 155–225 ms, Hard 120–185 ms; CPUs use independent RNG-generated cadence, bounded jitter, hesitations, and occasional invalid repeated-side attempts.
- There is no rubber-banding, catch-up logic, caught-Pokémon stat use, stamina, boosts, or streak multiplier.
- The first finisher starts a 4000 ms grace period. Completed racers rank by finish timestamp; unfinished racers rank by progress, then most recent accepted-dig timestamp.
- Rewards are fixed by place/difficulty: Easy 80/55/35/20, Normal 100/70/45/25, Hard 130/90/60/35.
- Use only existing local Gen III cave/water tiles and local Sandshrew sprite `arcade/sprites/actors/pokemon/27.png`; no runtime network fetch, generated cave art, stretched Pokémon, glossy gradients, or modern oversized playfield cards.
- `stadiumKidsClub` must contain both `ekansHoop` and `digDigDig`; Ekans gameplay/presentation remains unchanged.
- Visibility loss/pagehide pauses countdown/race/grace timing; resume must not grant CPU or timer progress while backgrounded.
- Completion state mutation and `LuckyDexArcadePlatform.awardRun()` happen exactly once per finalized race; abandoning does neither.
- The uploaded source bundle has no `.git` directory, so local execution uses test checkpoints rather than commits; the final deliverable is a versioned source ZIP for the user's normal Termux Git workflow.

## Review Focus

- Extremely rapid alternating pointer/keyboard input must advance at most one dig per accepted event, while same-side repeats and key auto-repeat cannot leak progress.
- Backgrounding during countdown, active racing, or the 4-second grace period must freeze both player-facing time and future CPU scheduled actions until explicit resume.
- A player who has not reached 80 by grace expiry may still place by progress and receive that placement reward, but must never record a fabricated best time.
- 320–360 px portrait layouts must keep all four shafts, Back, pause/resume, and both touch controls reachable without horizontal scrolling or fractional sprite distortion.
- Partial/legacy `state.arcade.digDigDig` objects must migrate without losing unrelated Arcade state or overwriting valid nested best-time/win records.

---

### Task 1: Pure Race Rules and Deterministic CPU Simulation

**Files:**
- Create: `app/src/main/assets/arcade-dig-dig-dig-core.js`
- Create: `tests/v0360-dig-core.test.cjs`

**Interfaces:**
- Produces: `LuckyDexDigDigDigCore` / CommonJS export with `CONFIG`, `DIFFICULTIES`, `REWARDS`, `difficultyProfile(key)`, `createRace({difficulty,rng,nowMs})`, `acceptInput(racer,side,nowMs)`, `advanceCpu(race,cpuIndex,nowMs,rng)`, `advanceRace(race,nowMs,rng)`, `finalizeRace(race,nowMs)`, and `rewardFor(place,difficulty)`.
- `createRace()` returns four racer records (`player`, `cpu1`, `cpu2`, `cpu3`) with `progress`, `lastAcceptedSide`, `lastAcceptedAt`, `finishedAt`, and CPU scheduling fields where applicable.
- `acceptInput()` returns `{accepted:boolean,progress:number,finished:boolean}` and never accepts progress beyond 80.

- [ ] **Step 1: Write the failing core test.**
  - Assert `CONFIG.raceDistance === 80` and `CONFIG.graceMs === 4000`.
  - Assert the first left or right input is accepted, same-side repeat is rejected without progress loss, and the opposite side then advances exactly once.
  - Assert accepted progress clamps at 80 and records one finish timestamp only.
  - Assert seeded RNG produces repeatable CPU cadence/schedules; Easy, Normal, Hard generated base intervals remain inside 210–300, 155–225, 120–185 ms respectively.
  - Assert changing only `race.player.progress` does not alter a CPU's next scheduled action/outcome under identical RNG/time inputs.
  - Assert first finish sets `graceEndsAt = firstFinishAt + 4000`; later racers can still finish during grace.
  - Assert final ranking sorts completed racers by `finishedAt`, then unfinished racers by progress and `lastAcceptedAt`.
  - Assert all twelve reward table entries exactly match the approved spec.

- [ ] **Step 2: Run `node tests/v0360-dig-core.test.cjs`; expected result is FAIL because `arcade-dig-dig-dig-core.js` does not exist.**

- [ ] **Step 3: Implement the pure core with injectable RNG and no DOM, state, timer, or rendering dependency.**

- [ ] **Step 4: Run `node tests/v0360-dig-core.test.cjs`; expected result is PASS.**

- [ ] **Step 5: If a Git checkout is present, commit `feat: add Dig Dig Dig race core`; otherwise record the passing test checkpoint.**

### Task 2: Persistence, Rewards, Session Metadata and Achievements

**Files:**
- Modify: `app/src/main/assets/arcade-platform.js`
- Modify: `app/src/main/assets/arcade-session.js`
- Modify: `app/src/main/assets/achievements-v0341.js`
- Create: `tests/v0360-dig-state-achievements.test.cjs`

**Interfaces:**
- Consumes: reward/place/difficulty values from Task 1.
- Produces: migrated `state.arcade.digDigDig` with `{gamesPlayed,wins,podiums,bestTimeMs,bestTimes,winsByDifficulty}`; session rule metadata for `digDigDig`; four achievement definitions.

- [ ] **Step 1: Write the failing state/achievement test.**
  - Assert default Dig state is exactly `{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null,bestTimes:{easy:null,normal:null,hard:null},winsByDifficulty:{easy:0,normal:0,hard:0}}`.
  - Assert partial nested state such as `{bestTimes:{normal:12345},winsByDifficulty:{hard:2}}` preserves those values while filling missing difficulty keys and unrelated Arcade keys.
  - Assert `LuckyDexArcadeSession.ruleFor('digDigDig')` describes an 80-dig four-Sandshrew alternating-input race and placement-based Lucky Coin rewards.
  - Assert achievements exist as `dig_first_win` / **Down We Go** target 1 win, `dig_wins_10` / **Tunnel Vision** target 10 wins, `dig_hard_win` / **Hard Ground** target 1 Hard win, and `dig_time_12000` / **Rapid Excavator** completed best time target 12000 ms.
  - Assert Rapid Excavator remains incomplete when `bestTimeMs` is null and completes at `<= 12000` only from durable saved timing state.

- [ ] **Step 2: Run `node tests/v0360-dig-state-achievements.test.cjs`; expected result is FAIL.**

- [ ] **Step 3: Add deep non-destructive Dig migration, session metadata, and the four achievement entries; do not modify Ekans defaults/achievement semantics.**

- [ ] **Step 4: Run `node tests/v0360-dig-state-achievements.test.cjs`; expected result is PASS.**

- [ ] **Step 5: If a Git checkout is present, commit `feat: add Dig Dig Dig state and achievements`; otherwise record the passing test checkpoint.**

### Task 3: Kids Club Integration and Stable HTML Contract

**Files:**
- Modify: `app/src/main/assets/arcade-world.js`
- Modify: `app/src/main/assets/index.html`
- Create: `app/src/main/assets/arcade-dig-dig-dig.css`
- Modify: `app/src/main/assets/arcade/kids-club/SOURCES.md`
- Create: `tests/v0360-dig-integration.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexDigDigDigCore` from Task 1 and persisted/session contracts from Task 2.
- Produces: game ID `digDigDig`, `window.LuckyDexDigDigDig` owner mapping, Kids Club's second game card, the complete stable Dig shell, stylesheet/script load contract, and provenance for reused local terrain assets.

- [ ] **Step 1: Write the failing integration/source-contract test.**
  - Assert `stadiumKidsClub.games` is exactly `['ekansHoop','digDigDig']` and all pre-existing venue IDs remain present.
  - Assert `GAME_NAMES.digDigDig === 'Dig! Dig! Dig!'`, its objective describes alternating left/right to out-dig three COM Sandshrew, and owner mapping is `digDigDig:()=>window.LuckyDexDigDigDig`.
  - Assert the shell contains `digDigDigGame`, `digDigDigStage`, `digDigDigReady`, `digDigDigStart`, all three `data-dig-difficulty` buttons, countdown/place/timer/race IDs, all four lane IDs, left/right controls, pause overlay and resume button.
  - Assert the shell uses local `arcade/sprites/actors/pokemon/27.png` and contains no HTTP(S) runtime asset URL.
  - Assert CSS references existing Gen III cave/water assets and applies `image-rendering:pixelated` to Sandshrew/terrain elements.
  - Assert `arcade-dig-dig-dig-core.js` loads before `arcade-dig-dig-dig.js`, both load before `arcade-world.js`, and `arcade-dig-dig-dig.css` is linked.
  - Assert `arcade/kids-club/SOURCES.md` documents the reused Granite Cave/water tile paths rather than introducing new remote provenance.

- [ ] **Step 2: Run `node tests/v0360-dig-integration.test.cjs`; expected result is FAIL.**

- [ ] **Step 3: Add the Kids Club game entry, HTML shell, CSS link/script tags, and provenance update. Keep Ekans shell and styling byte-for-byte unchanged unless a shared nonvisual line is strictly required.**

- [ ] **Step 4: Run `node tests/v0360-dig-integration.test.cjs`; expected result is PASS.**

- [ ] **Step 5: If a Git checkout is present, commit `feat: add Dig Dig Dig Kids Club shell`; otherwise record the passing test checkpoint.**

### Task 4: Runtime Owner, Controls, Rendering and Lifecycle

**Files:**
- Create: `app/src/main/assets/arcade-dig-dig-dig.js`
- Modify: `app/src/main/assets/arcade-dig-dig-dig.css`
- Create: `tests/v0360-dig-runtime.test.cjs`
- Create: `tests/v0360-dig-lifecycle.test.cjs`

**Interfaces:**
- Consumes: Task 1 core, Task 2 `LuckyDexArcadePlatform`/`LuckyDexArcadeSession`, and Task 3 DOM shell.
- Produces: `window.LuckyDexDigDigDig` with `open()`, `close()`, `showReady({difficulty})`, `startRound({difficulty,countdownMs})`, `input(side)`, `pause()`, `resume()`, `finishRound(nowMs?)`, and test-facing `snapshot()`.
- `snapshot()` exposes phase, difficulty, elapsed/remaining timing, four racer progress/finish fields, player expected/last side, grace timing, current ranking, and completion-guard state without exposing mutable internal objects.

- [ ] **Step 1: Write the failing runtime test.**
  - Assert `open()` mounts `digDigDig` and displays Normal ready state without moving racers.
  - Assert `startRound({countdownMs:0})` enters racing; `input('left')`, repeated `left`, then `right` yields progress 1, 1, 2.
  - Assert keyboard adapter ignores `event.repeat === true` and maps Left/A to left and Right/D to right.
  - Assert accepted inputs alternate a Dig visual state while rejected inputs do not fake terrain progress.
  - Assert four racer render models stay bounded 0–80 and the player cannot exceed 80 under rapid calls.

- [ ] **Step 2: Run `node tests/v0360-dig-runtime.test.cjs`; expected result is FAIL.**

- [ ] **Step 3: Implement ready/countdown/race/grace/result orchestration, independent CPU stepping, four-shaft renderer, terrain scroll/strata state, left/right touch ownership, keyboard input, countdown overlay, current-place/elapsed HUD, and final standings panel.**

- [ ] **Step 4: Run `node tests/v0360-dig-runtime.test.cjs`; expected result is PASS.**

- [ ] **Step 5: Write the failing lifecycle test.**
  - Assert input before `DIG!` is ignored.
  - Assert pausing countdown freezes countdown remaining time; pausing racing freezes elapsed/CPU schedules; pausing grace freezes grace remaining time.
  - Assert resume shifts future CPU action/grace deadlines so no background time is granted.
  - Assert `close()`/Back before finalization awards no coins and changes no Dig completion stats.
  - Assert finalized 1st/2nd/3rd/4th runs award the Task 1 reward once, increment `gamesPlayed` once, increment wins/podiums correctly, and increment `winsByDifficulty` only for wins.
  - Assert best times update only when player `finishedAt` exists; an unfinished progress-ranked placement never changes `bestTimeMs` or per-difficulty best time.
  - Assert repeated `finishRound()` calls cannot duplicate save mutation or `awardRun()`.

- [ ] **Step 6: Run `node tests/v0360-dig-lifecycle.test.cjs`; expected result is FAIL before lifecycle/persistence completion.**

- [ ] **Step 7: Implement pause/resume deadline shifting, exactly-once completion, persisted records, `LuckyDexArcadePlatform.awardRun()`, and `LuckyDexArcadeSession.showResult()` replay/back wiring.**

- [ ] **Step 8: Run `node tests/v0360-dig-runtime.test.cjs && node tests/v0360-dig-lifecycle.test.cjs`; expected result is PASS.**

- [ ] **Step 9: If a Git checkout is present, commit `feat: make Dig Dig Dig playable`; otherwise record the passing test checkpoint.**

### Task 5: Gen III Mobile Presentation and Browser Regression

**Files:**
- Modify: `app/src/main/assets/arcade-dig-dig-dig.css`
- Modify: `app/src/main/assets/arcade-dig-dig-dig.js` only for render-state fixes exposed by browser QA
- Create: `tests/v0360-dig-browser.test.cjs`
- Create: `tests/v0360-dig-presentation.test.cjs`

**Interfaces:**
- Consumes: complete Task 4 owner/shell.
- Produces: the approved GBA-style presentation and mobile-safe touch behaviour without altering core race rules.

- [ ] **Step 1: Write the failing static presentation test.**
  - Assert Dig CSS uses local cave-floor/cave-wall/cave-floor-dark/cave-rock and shallow-water assets, pixelated rendering, square/chunky Gen III borders, and `touch-action:none` on both Dig input controls with specificity stronger than the global `.arcade-game button` rule.
  - Assert the Dig CSS contains no `linear-gradient(` / `radial-gradient(` in the gameplay stage and no transform that non-uniformly scales a Sandshrew image.
  - Assert each lane renders the same 35:39 sprite aspect contract and uses integer 1×/2× sizing breakpoints rather than fractional width/height distortion.

- [ ] **Step 2: Run `node tests/v0360-dig-presentation.test.cjs`; expected result is FAIL until final presentation CSS is in place.**

- [ ] **Step 3: Finish Gen III styling:** compact framed HUD, four equal shafts, visible soil strata, anchored Sandshrew, two-frame left/right digging offset/dust, final water breakthrough, pixel countdown/standings, and large bottom L/R controls with no glossy/modern card treatment.

- [ ] **Step 4: Run `node tests/v0360-dig-presentation.test.cjs`; expected result is PASS.**

- [ ] **Step 5: Write the Playwright browser QA.**
  - At 360×800 and 320×640, open `stadiumKidsClub` → `digDigDig`; assert no horizontal overflow and all four lane rectangles plus both controls and Back remain inside the viewport.
  - Start Normal with zero test countdown; alternate touch/pointer L/R and assert visible/player progress increases while repeated same-side input does not.
  - Dispatch keyboard repeat and assert it adds no dig.
  - Trigger document hidden/visible test hooks or direct owner pause/resume and assert the pause overlay remains functional.
  - Inspect each Sandshrew bounding box and natural dimensions to assert the rendered width:height ratio matches 35:39 within rounding tolerance.
  - Complete/finalize a deterministic test race and verify replay returns to Dig ready state and Back returns to the Kids Club venue.
  - Assert no page errors or unexpected console errors.

- [ ] **Step 6: Run `node tests/v0360-dig-browser.test.cjs`; expected result is PASS when Playwright is installed, otherwise an explicit environment SKIP only.**

- [ ] **Step 7: If a Git checkout is present, commit `style: polish Dig Dig Dig Gen III presentation`; otherwise record the passing test checkpoint.**

### Task 6: Release Identity, Full Regression and Source Packaging

**Files:**
- Modify: `app/build.gradle`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/v0360-release.test.cjs`
- Create: `TEST_REPORT_v0.36.0.md`
- Create final archive: `/mnt/data/LuckyDex_source_v0.36.0.zip`

**Interfaces:**
- Consumes: completed Tasks 1–5.
- Produces: update-compatible LuckyDex v0.36.0 source package with test/report evidence.

- [ ] **Step 1: Write the failing release test.**
  - Assert `package.json`, root package-lock version, and `packages[''].version` are `0.36.0`.
  - Assert Android `versionCode 3600`, `versionName '0.36.0'`, and unchanged `applicationId 'com.example.luckydex'`.
  - Assert visible index build labels and `window.__LUCKYDEX_BUILD` are `0.36.0`.
  - Assert Dig core/runtime/CSS are bundled and the Kids Club still exposes both Ekans and Dig.

- [ ] **Step 2: Run `node tests/v0360-release.test.cjs`; expected result is FAIL on v0.35.17 identity.**

- [ ] **Step 3: Update only release/version markers to v0.36.0/3600; keep Android signing/application identity unchanged. Update any versioned build User-Agent literal in `app/build.gradle` to `0.36.0` for consistency.**

- [ ] **Step 4: Run focused tests:** `node tests/v0360-dig-core.test.cjs`, `node tests/v0360-dig-state-achievements.test.cjs`, `node tests/v0360-dig-integration.test.cjs`, `node tests/v0360-dig-runtime.test.cjs`, `node tests/v0360-dig-lifecycle.test.cjs`, `node tests/v0360-dig-presentation.test.cjs`, `node tests/v0360-dig-browser.test.cjs`, and `node tests/v0360-release.test.cjs`.

- [ ] **Step 5: Run `npm test`; expected result is the entire active Node/offline-asset suite passing, with browser tests reporting PASS or explicit dependency/toolchain SKIP only where the existing suite already permits it.**

- [ ] **Step 6: Run `./gradlew assembleDebug` when the local Android SDK/toolchain is available. Record PASS or the exact environment limitation; do not claim an APK verification that was not run.**

- [ ] **Step 7: Write `TEST_REPORT_v0.36.0.md` with changed files, focused/full-suite results, browser QA result, Android build result, and explicit confirmation that Ekans was preserved.**

- [ ] **Step 8: Package `/mnt/data/LuckyDex_source_v0.36.0.zip` from the complete source tree, excluding `.git`, `node_modules`, Gradle/build caches and transient artifacts while retaining docs/tests/assets/keystore required by the existing source distribution. Reopen the ZIP and verify the v0.36.0 metadata plus all three Dig implementation files and v0.36.0 test report are present.**

- [ ] **Step 9: If a Git checkout is present, commit `release: LuckyDex v0.36.0 Dig Dig Dig`; otherwise use the packaged source ZIP as the release checkpoint.**
