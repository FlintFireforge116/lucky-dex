# Goldenrod Stat Expression + Type Cup Trophies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Speed, Attack, Defense and Sp. Atk materially affect the physical feel and CPU performance of all current Goldenrod events, expose distinct Type Cup trophies, and correct Target Range scenery.

**Architecture:** Add one small shared stat-curve module that interpolates the approved reference points and is consumed by game mechanics plus Goldenrod AI simulation. Each game maps the normalized factor into its own physical mechanics rather than applying a generic final-score multiplier. Existing tournament state remains authoritative; the trophy cabinet only exposes saved `typeTrophies` that already exist.

**Tech Stack:** Vanilla JavaScript browser modules/CommonJS-compatible test exports, HTML/CSS, Node `node:test`, existing LuckyDex offline assets.

**Spec:** `docs/superpowers/specs/2026-10-15-goldenrod-stat-expression-type-trophies-design.md`

## Global Constraints

- Baseline is LuckyDex v0.42.5; release target is v0.43.0.
- Shared stat reference points are: 20→0.65, 40→0.78, 59→0.90, 89→1.02, 119→1.12, 149→1.19, 180→1.24, 220+→1.28.
- Existing division caps remain unchanged; Exhibition remains unrestricted.
- Moderate 30–40 point stat gaps remain surmountable by better play; equal-quality play clearly favours the higher stat.
- CPU competitors use the same shared stat curve as player mechanics; AI execution variance layers on top.
- Impact perfect completion still means 100% Harden and zero damage.
- Target Range visual projectile destination must equal the scoring impact destination.
- Preserve v0.42.4 Rookie Target Range approachable AI balance; do not restore the old 130–160 Rookie field.
- Preserve saves, records, achievements, rewards, tournament progression, offline operation and Android package identity.
- No external runtime dependencies and no unrelated Goldenrod redesign.

## Review Focus

- Stats below 20 or above 220 clamp cleanly without NaN/Infinity or reversing the curve.
- Low-Defense Impact increases total work without exceeding the existing readable simultaneous-target caps.
- CPU stat advantage stays directional without overwhelming division execution quality or breaking Rookie Target Range balance.
- Existing saved Type Cup trophies render distinctly by event/type/division without migration or data loss.
- Target Range scenery replacement removes the incorrect tree sprites without introducing missing/offline asset references or cluttering the firing lane.

---

### Task 1: Shared Goldenrod Stat Curve

**Files:**
- Create: `app/src/main/assets/arcade-goldenrod-stat-curve.js`
- Modify: `app/src/main/assets/index.html`
- Test: `tests/v0430-goldenrod-stat-curve.test.cjs`

**Interfaces:**
- Produces: `LuckyDexGoldenrodStatCurve.factor(baseStat:number):number`, `interpolate(baseStat:number):number`, `REFERENCE_POINTS`.
- Consumed by Tasks 2–6 and `arcade-goldenrod-adapters.js`.

- [ ] **Step 1: Write failing curve tests** for exact reference points, monotonic interpolation, top-end tapering, and clamping below 20 / above 220.
- [ ] **Step 2: Run** `node --test tests/v0430-goldenrod-stat-curve.test.cjs` and confirm RED because the module does not exist.
- [ ] **Step 3: Implement** piecewise-linear interpolation through the approved reference points and export it in the repo's UMD/CommonJS style; load it before Goldenrod adapters/game runtime consumers in `index.html`.
- [ ] **Step 4: Re-run** the curve test and confirm GREEN.

### Task 2: Dash Speed Becomes Physically Obvious

**Files:**
- Modify: `app/src/main/assets/arcade-dash.js`
- Test: `tests/v0430-dash-stat-expression.test.cjs`
- Preserve existing: `tests/arcade-dash*.test.cjs`, `tests/v0410-dash-goldenrod.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexGoldenrodStatCurve.factor(baseSpeed)` from Task 1.
- Produces: a pace/acceleration mapping where equal driving at Speed 25 vs 58 is measurably different, while high stats taper.

- [ ] **Step 1: Write failing tests** comparing low/high Rookie Speed for sustained pace and acceleration, plus a high-end taper assertion.
- [ ] **Step 2: Run** `node --test tests/v0430-dash-stat-expression.test.cjs` and confirm RED against the old compressed pace mapping.
- [ ] **Step 3: Replace** the current linear `paceModifier()` compression with shared-factor-based pace and acceleration scaling; preserve stamina, boosts, hazards and handling rules.
- [ ] **Step 4: Run** the new Dash tests plus existing non-browser Dash core/config/integration suites and confirm GREEN.

### Task 3: Power Trial Attack Sets a Stronger Ceiling

**Files:**
- Modify: `app/src/main/assets/arcade-power-trial-core.js`
- Test: `tests/v0430-power-stat-expression.test.cjs`
- Preserve existing: `tests/v0410-power-tournament.test.cjs`, `tests/v0431-power-trial.test.cjs`, `tests/v0433-power-trial-ui.test.cjs`, `tests/v0434-power-trial-polish.test.cjs`, `tests/v0435-power-trial-dome.test.cjs`

**Interfaces:**
- Consumes: shared stat factor from Task 1.
- Produces: stronger Attack-dependent strike ceiling while existing charge/impact accuracy remains the execution multiplier.

- [ ] **Step 1: Write failing tests** proving perfect-vs-perfect Attack 25 vs 58 produces a clear power gap, while a well-executed lower-Attack strike can beat a badly executed stronger one.
- [ ] **Step 2: Run** `node --test tests/v0430-power-stat-expression.test.cjs` and confirm RED.
- [ ] **Step 3: Rework** the Attack contribution in the strike-resolution path to use the shared factor as the power ceiling; retain timing/charge execution as the realized fraction.
- [ ] **Step 4: Run** the new test and existing Power Trial/tournament suites and confirm GREEN.

### Task 4: Impact Defense Changes Workload and Mitigation

**Files:**
- Modify: `app/src/main/assets/arcade-impact-trial-core.js`
- Test: `tests/v0430-impact-stat-expression.test.cjs`
- Preserve existing: `tests/v0410-impact-tournament.test.cjs`, `tests/v0436-impact-trial.test.cjs`, `tests/v0437-impact-harden.test.cjs`, `tests/v0438-impact-harden-tuning.test.cjs`, `tests/v0439-impact-input-polish.test.cjs`

**Interfaces:**
- Consumes: shared stat factor from Task 1.
- Produces: Defense-sensitive target burden and miss mitigation without raising simultaneous target caps.

- [ ] **Step 1: Write failing tests** proving Defense 25 creates more required targets than Defense 58 for the same hazard/profile, both retain identical `maxLive`/`barrageMaxLive`, higher Defense mitigates misses more, and a perfect clear still takes zero damage.
- [ ] **Step 2: Run** `node --test tests/v0430-impact-stat-expression.test.cjs` and confirm RED.
- [ ] **Step 3: Extend** `createTargetPlan(...)` to accept/use Defense (or an explicit stat factor) when deriving total target count, scaling count upward below neutral and downward above neutral while preserving live-density caps; strengthen `defenseResilience()` using the shared tapering curve.
- [ ] **Step 4: Update** the Impact runtime call site to pass the participant Defense into target-plan creation.
- [ ] **Step 5: Run** the new test plus existing Impact/tournament/input suites and confirm GREEN.

### Task 5: Target Range Sp. Atk Becomes Projectile Power + Scenery Fix

**Files:**
- Modify: `app/src/main/assets/arcade-target-range-core.js`
- Modify: `app/src/main/assets/arcade-target-range.js`
- Modify: `app/src/main/assets/arcade-target-range.css`
- Test: `tests/v0430-target-range-stat-expression.test.cjs`
- Test: `tests/v0430-target-range-scenery.test.cjs`
- Preserve existing: `tests/v0420-target-range-*.test.cjs` through `tests/v0425-goldenrod-picker-*.test.cjs`

**Interfaces:**
- Consumes: shared stat factor from Task 1.
- Produces: lower Sp. Atk → slower travel/more drop/more wind susceptibility/lower armour power; higher Sp. Atk → faster/flatter/stronger, with scoring and visual destination agreement unchanged.

- [ ] **Step 1: Write failing projectile tests** comparing Sp. Atk 25 vs 58 for travel time, drop, drift sensitivity and armour break power; assert reticle/tolerance remains only lightly affected and visual/scoring endpoints agree.
- [ ] **Step 2: Write failing scenery test** asserting the incorrect small-tree sprite treatment is absent and the replacement uses offline-safe edge/background scenery while keeping the firing lane unobstructed.
- [ ] **Step 3: Run** both new tests and confirm RED.
- [ ] **Step 4: Rework** `statAssist()`/`projectileSolution()`/armour power to derive physical shot characteristics from the shared factor, preserving the current aim and release mechanics.
- [ ] **Step 5: Replace** the scattered tree sprites with restrained perspective-correct CSS/existing-asset scenery; do not alter gameplay or controls.
- [ ] **Step 6: Run** the new tests plus current Target Range core/release/balance/picker suites and confirm GREEN.

### Task 6: CPU Simulation Uses the Same Stat Curve

**Files:**
- Modify: `app/src/main/assets/arcade-goldenrod-adapters.js`
- Test: `tests/v0430-goldenrod-ai-stat-expression.test.cjs`
- Preserve existing: `tests/v0410-goldenrod-adapters.test.cjs`, `tests/v0410-goldenrod-integration.test.cjs`, `tests/v0420-target-range-adapter.test.cjs`, `tests/v0424-target-range-balance.test.cjs`

**Interfaces:**
- Consumes: shared stat factor from Task 1 and existing division AI quality/profile APIs.
- Produces: stat-aware AI round metrics for all four events with existing AI consistency/risk/mistake variance layered on top.

- [ ] **Step 1: Write failing seeded tests** for each event showing equal AI execution/seed favours the higher relevant stat, while different execution can still reverse moderate stat gaps.
- [ ] **Step 2: Add a failing Rookie Target Range distribution guard** preserving the approachable v0.42.4 envelope (no return to 130–160 median fields; existing 75-point podium / 90-point win intent remains broadly intact).
- [ ] **Step 3: Run** `node --test tests/v0430-goldenrod-ai-stat-expression.test.cjs tests/v0424-target-range-balance.test.cjs` and confirm RED on stat-direction expectations but retain the existing balance baseline.
- [ ] **Step 4: Replace** `core.compressedStat(...)` in AI simulation with the shared factor, then retune event conversion coefficients as needed so division difficulty and execution variance remain meaningful and Rookie Target Range stays approachable.
- [ ] **Step 5: Run** adapter/integration/balance tests and confirm GREEN.

### Task 7: Type Cup Trophy Cabinet Presentation

**Files:**
- Modify: `app/src/main/assets/arcade-goldenrod.js`
- Modify: `app/src/main/assets/arcade-goldenrod.css`
- Test: `tests/v0430-goldenrod-type-trophies.test.cjs`
- Preserve existing: `tests/v0410-goldenrod-state.test.cjs`, `tests/v0410-goldenrod-settlement.test.cjs`, `tests/v0410-goldenrod-ui.test.cjs`

**Interfaces:**
- Consumes: existing `eventState.typeTrophies[type][divisionId]` and `divisionTrophies` state; no save migration.
- Produces: separate mobile-friendly Division Cups and Type Cups trophy sections for every built event.

- [ ] **Step 1: Write failing UI/state fixture test** with distinct Fire/Great and Water/Great trophies plus another event/type, asserting each appears separately alongside Division trophies and empty types remain identifiable without corrupting saved state.
- [ ] **Step 2: Run** `node --test tests/v0430-goldenrod-type-trophies.test.cjs` and confirm RED because the cabinet currently renders Division trophies only.
- [ ] **Step 3: Extend** `renderTrophyCabinet()` to render a compact Type Cups section per event using the canonical 18-type order and five divisions; use collapsible/compact presentation if needed for mobile.
- [ ] **Step 4: Add** focused CSS for the trophy matrix/expansion without changing other Goldenrod screens.
- [ ] **Step 5: Run** the new test plus Goldenrod state/settlement/UI tests and confirm GREEN.

### Task 8: v0.43.0 Integration, Release Identity and Verification

**Files:**
- Modify: release/version identity files already used by v0.42.5 (`README.md`, app metadata/version references, current-release helper/tests as applicable)
- Create: `TEST_REPORT_v0.43.0.md`
- Test: `tests/v0430-goldenrod-release.test.cjs`
- Package: `LuckyDex_source_v0.43.0.zip`

**Interfaces:**
- Consumes: all Tasks 1–7.
- Produces: verified v0.43.0 source ZIP and test report.

- [ ] **Step 1: Write failing release test** asserting v0.43.0 identity and presence/loading of the new shared stat-curve module.
- [ ] **Step 2: Run** the release test and confirm RED on v0.42.5 identity.
- [ ] **Step 3: Bump** release identity to v0.43.0 without changing Android application ID.
- [ ] **Step 4: Run** all new v0.43.0 tests plus the focused Goldenrod, Dash non-browser, Power, Impact, Target Range, records, rewards and achievements regression set; require zero functional failures.
- [ ] **Step 5: Run** `node --check` on every changed JS file and all existing offline asset verification scripts; record exact pass counts.
- [ ] **Step 6: Run** historical `npm test`; if it stops at the existing unavailable Playwright dependency, document the exact runnable pass count and do not claim a complete suite pass.
- [ ] **Step 7: Write** `TEST_REPORT_v0.43.0.md` with changed files, stat-reference verification, CPU balance results, test counts and environment limitations.
- [ ] **Step 8: Create** `/mnt/data/LuckyDex_source_v0.43.0.zip`, run `unzip -t`, calculate SHA-256, and confirm the archive contains v0.43.0 identity plus the new stat module.

