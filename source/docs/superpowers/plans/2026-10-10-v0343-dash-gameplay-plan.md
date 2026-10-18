# LuckyDex v0.34.3 Pokémon Dash Gameplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the v0.34.0 Gen 3 visual renderer while making Pokémon Dash more responsive, less clumped, more varied and more authored across all 18 Type League courses.

**Architecture:** Keep `arcade-dash.js` as the race simulation/controller and `arcade-dash-course-data.js` + `arcade-dash-course.js` as the authored course-data layer. Improve physics/feedback through pure simulation functions first, then enrich section descriptors/events so course identity comes from data rather than type-specific hard-coded race loops.

**Tech Stack:** Vanilla JavaScript, canvas/WebView rendering, existing Gen 3 Dash assets, Node.js CJS tests.

**Spec:** `docs/superpowers/specs/2026-10-10-luckydex-v0343-release-design.md`

## Global Constraints

- Keep Codex's Gen 3 asset/course-renderer foundation intact.
- Preserve simple `LEFT / SPRINT / RIGHT` controls.
- Strict speed-class eligibility is unchanged; out-of-band Pokémon never enter the race.
- Do not add weapons/items/drifting systems.
- Keep nearby road/verge/scenery on the same world plane.
- Preserve app-switch/pause lifecycle behavior and existing Dash progression/rewards.

## Review Focus

- Continuous steering must react on the first simulation frame but remain smooth on release/reversal.
- Contact separation must not secretly change top speed or create rubber-banding.
- A racer touching one obstacle must not be penalized repeatedly every frame.
- Berry collection must be exactly once and remove the object immediately.
- Every Type League must remain winnable under its existing strict speed band.

---

### Task 1: Tune steering and sprint/stamina decisions

**Files:**
- Modify: `app/src/main/assets/arcade-dash.js:1-220`
- Test: `tests/v0343-dash-gameplay.test.cjs`
- Test: `tests/v0340-dash-steering.test.cjs`
- Test: `tests/arcade-dash.test.cjs`

**Interfaces:**
- Preserves: `stepStamina(src,sprinting,dt)`, `stepRace(race,dt,input)`.
- Produces: first-frame steering response with smooth settle/reversal; stamina cadence where uninterrupted hold-to-empty/release cycling is not mathematically dominant.

- [ ] **Step 1: Write failing first-frame steering/reversal tests**

Assert held left/right moves `laneVisual` immediately on the first step, release does not keep queued motion, and reversing changes direction on the next frame without teleporting.

- [ ] **Step 2: Write failing stamina decision test**

Compare a naive full-drain cycle with a paced sprint pattern over equal simulated time and assert the system does not reward only the naive hold-empty-repeat rhythm.

- [ ] **Step 3: Run and verify RED**

Run: `node tests/v0343-dash-gameplay.test.cjs`
Expected: at least the new stamina/steering assertions fail against v0.34.2 tuning.

- [ ] **Step 4: Tune constants/step logic minimally**

Adjust `PLAYER_STEER_SPEED`, sprint drain/recovery delay/regen and any input smoothing inside `stepRace`; keep existing API signatures and deterministic simulation.

- [ ] **Step 5: Run steering and core Dash tests**

Run: `node tests/v0343-dash-gameplay.test.cjs && node tests/v0340-dash-steering.test.cjs && node tests/arcade-dash.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-dash.js tests/v0343-dash-gameplay.test.cjs tests/v0340-dash-steering.test.cjs tests/arcade-dash.test.cjs
git commit -m "feat: improve dash steering and stamina"
```

### Task 2: Reduce racer clumping and repeated-contact snagging

**Files:**
- Modify: `app/src/main/assets/arcade-dash.js`
- Test: `tests/v0343-dash-gameplay.test.cjs`

**Interfaces:**
- Preserves: `resolveRacerContacts(race,dt)` and existing race-speed calculation.
- Produces: small lateral/longitudinal separation impulses/cooldowns that do not add forward speed bonuses.

- [ ] **Step 1: Add failing overlap/separation tests**

Create racers at near-identical lane/distance and assert separation increases spacing over several frames while their base pace modifiers stay unchanged.

- [ ] **Step 2: Add failing repeated-obstacle grace test**

Place the player overlapping one rock across consecutive frames and assert the impact/slow penalty is applied once during the configured grace/cooldown window.

- [ ] **Step 3: Run and verify RED**

Run: `node tests/v0343-dash-gameplay.test.cjs`
Expected: FAIL on new overlap/grace assertions.

- [ ] **Step 4: Implement separation and collision grace**

Use bounded lane/distance nudges plus existing contact/impact timers; never modify species base speed or difficulty speed band.

- [ ] **Step 5: Run and verify GREEN**

Run: `node tests/v0343-dash-gameplay.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-dash.js tests/v0343-dash-gameplay.test.cjs
git commit -m "feat: reduce dash racer clumping"
```

### Task 3: Make pickups and race feedback deterministic/readable

**Files:**
- Modify: `app/src/main/assets/arcade-dash.js:556-578`
- Modify: `app/src/main/assets/arcade-dash-renderer.js`
- Modify: `app/src/main/assets/arcade.css` or `app/src/main/assets/arcade-dash.css`
- Test: `tests/v0343-dash-gameplay.test.cjs`
- Test: `tests/arcade-dash-render-contract.test.cjs`

**Interfaces:**
- Produces: one-shot pickup consumption state on course objects.
- Produces: clearer `dashRaceFeedback` states for pickup, boost, impact, position change and final stretch.

- [ ] **Step 1: Write failing berry despawn/exactly-once test**

Assert a `stamina-pickup` becomes consumed immediately, cannot be collected twice and no longer appears in the active render-object list.

- [ ] **Step 2: Add position/final-stretch feedback contract tests**

Assert the controller exposes a transient position-change signal and a final-stretch state before finish.

- [ ] **Step 3: Run and verify RED**

Run: `node tests/v0343-dash-gameplay.test.cjs && node tests/arcade-dash-render-contract.test.cjs`
Expected: FAIL on the new contracts.

- [ ] **Step 4: Implement pickup consumption and presentation hooks**

Keep berries phone-readable through renderer sizing; use a small pickup response and remove consumed objects from rendering immediately.

- [ ] **Step 5: Implement position/final-stretch/close-finish UI feedback**

Keep result/reward logic exactly-once; feedback is presentation-only.

- [ ] **Step 6: Run and verify GREEN**

Run: `node tests/v0343-dash-gameplay.test.cjs && node tests/arcade-dash-render-contract.test.cjs`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-dash.js app/src/main/assets/arcade-dash-renderer.js app/src/main/assets/arcade-dash.css tests/v0343-dash-gameplay.test.cjs tests/arcade-dash-render-contract.test.cjs
git commit -m "feat: improve dash pickup and race feedback"
```

### Task 4: Expand authored section rhythm and Type League mechanics

**Files:**
- Modify: `app/src/main/assets/arcade-dash-course-data.js`
- Modify: `app/src/main/assets/arcade-dash-course.js`
- Modify: `app/src/main/assets/arcade-dash.js`
- Test: `tests/v0343-dash-course-identity.test.cjs`
- Test: `tests/arcade-dash-course-sections.test.cjs`
- Test: `tests/arcade-dash-course.test.cjs`

**Interfaces:**
- Produces: richer `sectionPlan` descriptors supporting safe-lane width, alternate/risk lines, moving/event descriptors and course-specific mechanic tags.
- Preserves: `generateCourse(seed,{theme})`, `objectsNear`, `sceneryNear`, `sectionAt`.

- [ ] **Step 1: Write failing course-identity tests**

Assert all 18 types resolve distinct authored mechanic signatures, not only different asset names; every course still has eight ordered sections and at least one boost, one recovery opportunity and multiple hazard/choice moments.

- [ ] **Step 2: Add safe-path/winnability invariants**

Assert no generated event cluster blocks all three lanes and strict difficulty speed bands remain unchanged.

- [ ] **Step 3: Run and verify RED**

Run: `node tests/v0343-dash-course-identity.test.cjs`
Expected: FAIL because many courses currently share the same event grammar.

- [ ] **Step 4: Extend section templates/data**

Add data-driven chicanes/narrowings, bridge/squeeze rules, boost sequences, hazard clusters, alternate/risk lines and performant environmental events. Keep environment assets from v0.34.0; do not reintroduce painted backgrounds.

- [ ] **Step 5: Make simulation consume mechanic tags**

Implement only the minimal generic behaviors needed by the new data (for example moving crossing hazard timing, lane-width restriction or risk-line reward) without adding weapons/items.

- [ ] **Step 6: Run course and speed-band regressions**

Run: `node tests/v0343-dash-course-identity.test.cjs && node tests/arcade-dash-course-sections.test.cjs && node tests/arcade-dash-course.test.cjs && node tests/arcade-dash-config.test.cjs`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-dash-course-data.js app/src/main/assets/arcade-dash-course.js app/src/main/assets/arcade-dash.js tests/v0343-dash-course-identity.test.cjs tests/arcade-dash-course-sections.test.cjs tests/arcade-dash-course.test.cjs
git commit -m "feat: deepen dash course identity"
```

### Task 5: Run Dash browser/viewport QA when available

**Files:**
- Modify only if failures require fixes: `app/src/main/assets/arcade-dash*.js`, `app/src/main/assets/arcade-dash.css`
- Test: existing `tests/arcade-dash-browser.test.cjs`, `tests/v0340-dash-viewport.test.cjs`, `tests/v0340-dash-repeated-races.test.cjs`

**Interfaces:** None new.

- [ ] **Step 1: Run the non-browser Dash suite**

Run: `for f in tests/*dash*.test.cjs; do case "$f" in *browser*) ;; *) node "$f" || exit 1;; esac; done`
Expected: PASS.

- [ ] **Step 2: Run Playwright Dash tests if Playwright/browser binaries are available**

Run: `node tests/arcade-dash-browser.test.cjs && node tests/v0340-dash-viewport.test.cjs && node tests/v0340-dash-repeated-races.test.cjs`
Expected: PASS, or record exact environment limitation in the release report.

- [ ] **Step 3: Commit any QA-driven fixes**

```bash
git add app/src/main/assets/arcade-dash*.js app/src/main/assets/arcade-dash.css tests
git commit -m "fix: polish dash v0.34.3 qa"
```
