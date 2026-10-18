# Target Range — Special Attack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LuckyDex v0.42.0 with Target Range as the fourth Goldenrod Challenge Course event, featuring deliberate touch aiming, focus, wind/drop/lead, type-themed projectiles, Golden Target rewards, and full Exhibition/Division/Type Cup integration.

**Architecture:** Add a deterministic `arcade-target-range-core.js` for trajectory, target generation, scoring and difficulty, with `arcade-target-range.js/css` owning touch-first presentation and round runtime. Extend the existing v0.41.0 Goldenrod state/adapter/controller interfaces rather than duplicating tournaments; add a small canonical Sp. Atk stat supplement generated from the bundled PokeAPI CSV because the current Adventure species runtime only carries HP/Attack/Defense/Speed.

**Tech Stack:** Vanilla JS/CSS/HTML, Node `node:test`/`assert`, existing LuckyDex Goldenrod/Arcade APIs, local PokeAPI CSV data only.

**Spec:** `docs/superpowers/specs/2026-10-15-target-range-special-attack-design.md`

## Global Constraints

- Base release is LuckyDex v0.41.0; target release is v0.42.0.
- Event ID is `targetRange`; relevant stat key is `spAtk`; higher round score is better.
- Ground projectile identity is Mud Bomb; Psychic projectile identity is Psybeam.
- Exhibition remains unrestricted by competitive stat caps.
- Division caps remain Rookie 59, Poké 89, Great 119, Ultra 149, Master unrestricted.
- Type Cup eligibility requires both selected type and division legality.
- Golden Target rewards only on a bullseye and settle once.
- No network dependency or Android package/application identity change.
- Existing Dash, Power Trial and Impact Trial behavior/progress must remain intact.

## Review Focus

- Dual-type selection must reject a type the selected Pokémon does not own and remain fixed through all three cup rounds.
- Target resolution must use projectile arrival position/time, not the fire-time reticle position.
- Visibility loss/pointer cancellation must cancel an active draw without accidentally firing.
- Golden Target result rendering must remain idempotent under repeated renders/callbacks.
- v0.41.0 saves lacking Target Range state must normalize without changing any existing Goldenrod trophy/progression fields.

---

### Task 1: Deterministic Target Range core

**Files:**
- Create: `app/src/main/assets/arcade-target-range-core.js`
- Create: `tests/v0420-target-range-core.test.cjs`

**Interfaces:**
- Produces `LuckyDexTargetRangeCore` with `ATTACKS`, `DIFFICULTIES`, `divisionProfile`, `statQuality`, `focusQuality`, `projectileSolution`, `targetPositionAt`, `scoreImpact`, `createRound`, `applyShot`, and `roundMetric`.

- [ ] Write failing tests for focus cap, diminishing Sp. Atk returns, near/far flight/drop, wind drift, moving-target lead, ring scores/combo, armour bullseye override, three distinct cup round profiles, and deterministic seeded round generation.
- [ ] Run `node --test tests/v0420-target-range-core.test.cjs` and confirm RED for missing core.
- [ ] Implement the minimal deterministic core and type attack table.
- [ ] Run the test and confirm GREEN.

### Task 2: Touch-first Target Range runtime and gallery presentation

**Files:**
- Create: `app/src/main/assets/arcade-target-range.js`
- Create: `app/src/main/assets/arcade-target-range.css`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/v0420-target-range-ui.test.cjs`

**Interfaces:**
- Produces `LuckyDexTargetRange.startExhibition({difficulty,participant,attackType})`, `startGoldenrodRound({cupId,mode,divisionId,type,roundIndex,seed,player,attackType,onComplete})`, `close()`, and `tournamentResultPayload(...)`.

- [ ] Write failing source/runtime tests for lower-control hold/relative-drag/release input, pointer capture, `touch-action:none`, visibility/pointer-cancel safety, wind/distance HUD, focus meter, visible projectile, target ring/bullseye/combo feedback, type attack classes, and Golden Target treatment.
- [ ] Run the UI test and confirm RED.
- [ ] Implement the outdoor perspective gallery, target sequencing and responsive input/runtime.
- [ ] Run the UI test and core test and confirm GREEN.

### Task 3: Canonical Special Attack stat supply and Goldenrod adapter

**Files:**
- Create: `app/src/main/assets/arcade-special-stats.js`
- Modify: `app/src/main/assets/arcade-goldenrod-adapters.js`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/v0420-target-range-adapter.test.cjs`

**Interfaces:**
- `LuckyDexArcadeSpecialStats.spAtk(id)` returns canonical base Special Attack from bundled `docs/adventure/data-sources/pokemon_stats.csv` stat_id 4.
- Goldenrod `targetRange` adapter exposes `statKey:'spAtk'`, participants, legal AI selection, score metric and round config.

- [ ] Write failing tests proving known canonical values (Bulbasaur 65, Alakazam 135), caught participant override, division/type AI filtering and seeded overlapping AI results.
- [ ] Run and confirm RED.
- [ ] Generate/add local stat supplement and adapter support without network access.
- [ ] Run and confirm GREEN.

### Task 4: Goldenrod shell integration and dual-type move choice

**Files:**
- Modify: `app/src/main/assets/arcade-goldenrod-state.js`
- Modify: `app/src/main/assets/arcade-goldenrod.js`
- Modify: `app/src/main/assets/arcade-goldenrod.css`
- Modify: `app/src/main/assets/arcade-world.js`
- Modify: `app/src/main/assets/arcade-session.js`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/v0420-target-range-tournament.test.cjs`

**Interfaces:**
- Goldenrod state gains normalized `targetRange` defaults.
- Cup context stores `attackType`; controller validates owned type and passes it unchanged to every Target Range round.

- [ ] Write failing tests for fourth active card, unrestricted Exhibition, Sp. Atk division caps, Type Cup eligibility, dual-type selection/rejection, fixed attack type across all three rounds, and a deterministic completed Target Range cup.
- [ ] Run and confirm RED.
- [ ] Integrate Target Range into the shared shell/controller/world/session and add attack-type selection step only when needed.
- [ ] Run Goldenrod + new tournament tests and confirm GREEN.

### Task 5: Records, Golden Target settlement and achievements

**Files:**
- Modify: `app/src/main/assets/arcade-records.js`
- Modify: `app/src/main/assets/arcade-records-core.js` only if normalization needs a new field family
- Modify: `app/src/main/assets/achievements-v0341.js`
- Modify: `app/src/main/assets/arcade-target-range.js`
- Create: `tests/v0420-target-range-progression.test.cjs`

**Interfaces:**
- Target Range records include games, best score by difficulty, accuracy, bullseyes, best bullseye streak, longest-distance bullseye, Golden Targets seen/won, plus shared cup trophies.
- New achievements cover first completion, first bullseye, streak, long-distance bullseye, Golden Target bullseye and Target Range Master champion; Grand Champion now requires four implemented events.

- [ ] Write failing tests for record updates, Golden Target non-bullseye/no-award, bullseye single settlement/reveal receipt, achievements and Grand Champion denominator 4.
- [ ] Run and confirm RED.
- [ ] Implement persistence/reward/achievement integration.
- [ ] Run and confirm GREEN.

### Task 6: Release integration and v0.42.0 verification

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/build.gradle`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/v0420-release.test.cjs`
- Create: `TEST_REPORT_v0.42.0.md`

**Interfaces:**
- All version surfaces report 0.42.0 / versionCode 4200.

- [ ] Write failing release/integration test for version surfaces, script/style inclusion, fourth event, Ground Mud Bomb, Psychic Psybeam, and Grand Champion four-event requirement.
- [ ] Run and confirm RED.
- [ ] Bump release surfaces to v0.42.0 and update current-version tests only where they intentionally pin the active release.
- [ ] Run all new Target Range tests plus existing v0.41.0 Goldenrod/Power/Impact focused regressions and syntax checks.
- [ ] Run offline Arcade/venue/Adventure/Fossil asset checks.
- [ ] Attempt `npm test`; report environment/pre-existing limitations exactly rather than claiming success if blocked.
- [ ] Package `LuckyDex_source_v0.42.0.zip`, run `unzip -t`, calculate SHA-256, and write the release report.
