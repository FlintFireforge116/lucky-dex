# LuckyDex Adventure Overhaul v0.67.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.67.0 with Johto/Hoenn location identity, reusable Adventure activities led by Fishing, species-targeted Catch Chain v2, safe migration, and a conservative canonical-repository cleanup.

**Architecture:** Keep the existing regional journey and battle engines intact. Add data-driven location capabilities, a shared Adventure activity shell, a pure/testable Fishing core with a browser UI wrapper, and additive Wild Hunt target-chain state. Extend the existing named-scene registry rather than replacing Kanto/fallback behaviour, and clean only repository artifacts proven to be generated or historical rather than deleting large inputs by size.

**Tech Stack:** Android WebView app, vanilla JavaScript/CSS/HTML, Node.js `node:test`, Playwright browser harness, Python asset/build scripts, Gradle Android build.

**Spec:** `docs/superpowers/specs/2026-10-19-adventure-overhaul-v0670-design.md`

## Global Constraints

- No Codex.
- Preserve existing LuckyDex saves, badges, parties, claims, collections, settings, achievements, Arcade records and Wild Hunt field-guide history.
- Do not rewrite the battle engine.
- Mobile controls must remain fully visible and comfortably tappable without a stylus.
- Named location art must retain generic local fallbacks.
- Fishing must hand successful hooks into existing Adventure encounter/battle/capture systems rather than inventing a parallel capture engine.
- Old habitat-chain values remain legacy history and are never guessed into a target species.
- Cleanup may remove only generated/historical repository clutter proven non-runtime; large live/reproducibility inputs are retained.
- Release identity becomes exactly `0.67.0` / versionCode `6700` everywhere.

## Review Focus

- Old saves with no new activity/hunt fields must normalize without resetting journey or Wild Hunt records.
- A remote canonical map failure must fall back to an existing local scene rather than showing a broken image.
- Exiting Fishing during cast/wait/reel must not create or duplicate an encounter/reward.
- A non-target Wild Hunt encounter left untouched must not break the selected target chain.
- Repository cleanup must not remove files consumed by Gradle preBuild, active scripts or the test runner.

---

### Task 1: Establish v0.67.0 baseline and repository hygiene

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `source/README.md`
- Modify: `source/package.json`
- Modify: `source/package-lock.json`
- Modify: `source/app/build.gradle`
- Modify: `source/app/src/main/assets/app-v0167.js`
- Modify: `source/app/src/main/assets/index.html`
- Create: `source/tests/v0670-repo-hygiene.test.cjs`
- Create: `source/tests/v0670-release.test.cjs`
- Delete: top-level `LuckyDex-APK-1.zip`
- Delete: `source/TEST_REPORT_v*.md`, `source/V*_REPORT.md`, obsolete `source/CODEX_*.md`, `source/LuckyDex_Master_Update_Continuation_Plan.txt`
- Delete: `source/docs/CODEX_DASH_V2_GEN3_POLISH_PASS.md`, `source/docs/V0223_REPORT.md`, `source/docs/V0230_REPORT.md`, `source/docs/V0231_REPORT.md`, `source/docs/V0232_REPORT.md`, `source/docs/V0240_REPORT.md`
- Delete: `source/tests/adventure-location-preservation-v0402.json`, `source/tests/adventure-scene-nav-preservation-v0403.json`
- Delete: `source/scripts/adventure-location-preservation-v0402.py`, `source/scripts/adventure-scene-nav-preservation-v0403.py`
- Delete: committed `source/artifacts/` contents

**Interfaces:**
- Consumes: current repository tree and Gradle/npm metadata.
- Produces: one consistent v0.67.0 identity and a clean canonical tree for all later tasks.

- [ ] **Step 1: Write failing hygiene/release tests**
  - `v0670-release.test.cjs` asserts Gradle `versionName '0.67.0'`, `versionCode 6700`, package/lock `0.67.0`, `window.__LUCKYDEX_BUILD='0.67.0'`, and both visible HTML version strings are `v0.67.0`.
  - `v0670-repo-hygiene.test.cjs` asserts the known top-level APK ZIP, root historical report patterns, obsolete Codex prompts and stale whole-tree preservation snapshots are absent; asserts `data/adventure-moves`, `data/dash-gen3`, `reference`, and root `card-art-index.json` remain.
- [ ] **Step 2: Run both tests and verify they fail on the uploaded baseline.**
- [ ] **Step 3: Remove only the audited clutter, update `.gitignore`, and replace stale README dumps with concise canonical build/source guidance.**
- [ ] **Step 4: Normalize all release metadata to v0.67.0 / 6700.**
- [ ] **Step 5: Run hygiene/release tests and existing packaging/build-metadata tests; expect PASS.**

### Task 2: Add Johto and Hoenn canonical scene registries and region maps

**Files:**
- Create: `source/app/src/main/assets/adventure/adventure-johto-hoenn-canonical-v0670.js`
- Modify: `source/app/src/main/assets/index.html`
- Modify: `source/app/src/main/assets/adventure/adventure-regional-ui.js`
- Create: `source/tests/v0670-adventure-regional-visuals.test.cjs`

**Interfaces:**
- Consumes: `window.LuckyDexLocationScenes`, existing generic `region-kind` scenes, current journey place names.
- Produces: `window.LuckyDexJohtoHoennCanonicalV0670` with `JOHTO_MAPS`, `HOENN_MAPS`, `REGION_MAPS`, and `install(catalog)`; catalog scene ids `johto-canonical-*`, `hoenn-canonical-*`, `johto-canonical-region-map`, `hoenn-canonical-region-map`.

- [ ] **Step 1: Write failing tests** asserting every one of the 40 Johto and 40 Hoenn journey place names resolves through an explicit named registry entry; region-map lookup returns region-specific art; unknown names still resolve via generic fallback.
- [ ] **Step 2: Run the visual test and verify failure because only 5 Johto / 3 Hoenn names are explicit and the map UI is Kanto-only.**
- [ ] **Step 3: Implement the canonical registry using verified game-map source filenames/URLs with local generic `fallbackPath` values. Preserve the existing Kanto registry unchanged.**
- [ ] **Step 4: Generalize `journeyMap()` to choose `*-canonical-region-map` for Kanto, Johto and Hoenn, preserving no-image fallback behaviour.**
- [ ] **Step 5: Run visual, location-flow, regional-browser and scene-navigation tests; expect PASS.**

### Task 3: Introduce data-driven Adventure location capabilities and shared activity shell

**Files:**
- Create: `source/app/src/main/assets/adventure/adventure-location-activities.js`
- Create: `source/app/src/main/assets/adventure/adventure-activity-shell.js`
- Create: `source/app/src/main/assets/adventure/adventure-activities.css`
- Modify: `source/app/src/main/assets/adventure/adventure-location-flow.js`
- Modify: `source/app/src/main/assets/adventure/adventure-controller.js`
- Modify: `source/app/src/main/assets/index.html`
- Create: `source/tests/v0670-adventure-activities.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexLocationFlow.describe(journey)` place objects and save object.
- Produces: `LuckyDexAdventureActivities.capabilitiesFor(place)` and `actionsFor(save, place)`; `LuckyDexAdventureActivityShell.open(config)`, `.close()`, `.pause()`, `.resume()`.
- Initial capability schema: `{type:'fish', rods:['old','good','super'], poolKey:string, repeatable:true, helpId:'fishing'}`.

- [ ] **Step 1: Write failing tests** for capability lookup, no capability on dry/invalid locations, additive save normalization, repeatability, and activity action injection without displacing required story actions.
- [ ] **Step 2: Run tests and verify failure because no capability layer exists.**
- [ ] **Step 3: Implement location capability data for selected water locations across Kanto/Johto/Hoenn and expose `FISH` only when valid.**
- [ ] **Step 4: Implement the shared activity shell with first-use help state, reusable help, input lock while help is open, safe Back/Exit, and phone-safe fixed controls.**
- [ ] **Step 5: Wire location-flow/controller routing to the shell without changing existing Explore/Hunt/Battle semantics.**
- [ ] **Step 6: Run activity, location-flow and Adventure navigation tests; expect PASS.**

### Task 4: Implement the pure Fishing state machine and records

**Files:**
- Create: `source/app/src/main/assets/adventure/adventure-fishing-core.js`
- Create: `source/tests/v0670-fishing-core.test.cjs`

**Interfaces:**
- Consumes: location fishing capability, selected rod, deterministic RNG seed, timing/input events.
- Produces: `LuckyDexAdventureFishingCore` with `ensureState(save)`, `availableRods(save, journey)`, `start(config)`, `cast(run, input)`, `advance(run, now)`, `hook(run, now)`, `reel(run, input, dt)`, `result(run)`, `record(save, result)`.
- Rod unlocks: Old Rod immediately; Good Rod at 3 regional badges; Super Rod at 6 regional badges. Existing saves inherit unlocks from current badge count with no item migration required.

- [ ] **Step 1: Write failing deterministic tests** for rod unlocks, cast quality, variable bite timing, missed hook, successful hook, tension break, successful landing, cancellation, record increments, and save normalization.
- [ ] **Step 2: Run tests and verify failure because the core module does not exist.**
- [ ] **Step 3: Implement cast → wait → bite → hook → reel → landed/escaped state transitions with all timing derived from run state/RNG rather than DOM timers.**
- [ ] **Step 4: Implement location/rod pool selection and difficulty modifiers without creating a Pokémon battle yet.**
- [ ] **Step 5: Run core tests; expect PASS.**

### Task 5: Add Fishing UI and Adventure encounter handoff

**Files:**
- Create: `source/app/src/main/assets/adventure/adventure-fishing.js`
- Modify: `source/app/src/main/assets/adventure/adventure-activities.css`
- Modify: `source/app/src/main/assets/adventure/adventure-regional-engine.js`
- Modify: `source/app/src/main/assets/index.html`
- Create: `source/tests/v0670-fishing-integration.test.cjs`
- Create: `source/tests/v0670-fishing-browser.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexAdventureFishingCore`, activity shell, `LuckyDexRegionalEngine` party/encounter/battle flow.
- Produces: `LuckyDexAdventureFishing.open(save, place)`, `.dispose()`, and regional engine `enterFishingWild(save, name, speciesId, levelSeed)` that creates an optional local wild node using the existing battle/capture engine.

- [ ] **Step 1: Write failing integration tests** proving a landed fish creates exactly one normal Adventure wild encounter, an escaped fish creates none, capture rewards/collection flow remain existing-engine behaviour, and repeat/exit cannot duplicate the encounter.
- [ ] **Step 2: Write browser assertions** for visible CAST/HOOK/reel controls on a phone viewport, reusable help, paused input under help, and no clipped Back/Exit controls.
- [ ] **Step 3: Implement Fishing presentation and input, using animation frames only as a view loop over core state.**
- [ ] **Step 4: Add the narrow `enterFishingWild` handoff to the regional engine; do not fork battle/capture rules.**
- [ ] **Step 5: Run fishing core/integration/browser plus Adventure battle/persistence tests; expect PASS.**

### Task 6: Add Catch Chain v2 state and safe migration

**Files:**
- Modify: `source/app/src/main/assets/adventure/adventure-model.js`
- Create: `source/tests/v0670-chain-v2.test.cjs`

**Interfaces:**
- Consumes: existing `adventureV2.destinations[id]` field records and encounters.
- Produces: destination `huntV2` state `{targetId:null|number, chain:number, bestBySpecies:{[id]:number}, startedAt:number|null}` plus model functions `huntState(v2,destination)`, `startTargetHunt(v2,destination,targetId)`, `updateTargetHunt(v2,destination,outcome)`, `targetChainInfo(v2,destination)`.
- Legacy `record.chain` remains readable historical data but no longer drives new target-chain bonuses.

- [ ] **Step 1: Write failing migration/rule tests** proving old seen/caught/rare/mastery/legacy-chain values survive unchanged and `huntV2` initializes independently.
- [ ] **Step 2: Add outcome tests**: target capture +1 chain; target victory preserves current chain but does not increment; untouched non-target leave preserves; committed target flee/loss resets; switching target resets current chain but preserves per-species best; starting a hunt in another destination ends the old active target hunt.
- [ ] **Step 3: Run tests and verify failure on the current habitat-chain model.**
- [ ] **Step 4: Implement additive normalizers and target-hunt reducers while retaining legacy helpers for history/compatibility.**
- [ ] **Step 5: Implement milestone output and return all displayed bonuses from `targetChainInfo` so UI never hides the math.** Use these caps: chain 0 = target weight ×1.0, clue tier 0, +0% rare, +0% item, shiny ×1.0; chain 3 = target weight ×1.5, clue tier 1, +0.5% rare, +1% item, shiny ×1.0; chain 5 = ×2.0, tier 2, +1% rare, +1.5% item, shiny ×1.25; chain 10 = ×3.0, tier 3, +1.5% rare, +2% item, shiny ×1.5; chain 20+ = ×4.0, tier 4, +2% rare, +3% item, shiny ×2.0.
- [ ] **Step 6: Run chain/model/persistence tests; expect PASS.**

### Task 7: Rework Wild Hunt around a selected species target

**Files:**
- Modify: `source/app/src/main/assets/adventure/adventure-wild-hunt.js`
- Modify: `source/app/src/main/assets/adventure/adventure.css`
- Create: `source/tests/v0670-chain-v2-integration.test.cjs`
- Create: `source/tests/v0670-chain-v2-browser.test.cjs`

**Interfaces:**
- Consumes: `targetChainInfo`, field-guide seen/caught records, existing hotspot/encounter generation.
- Produces: target picker/tracking UI, target-weighted hotspot rolls, clear break/suspend messaging, best-chain display.

- [ ] **Step 1: Write failing tests** for target selection only from known local species (plus first-discovery adoption flow), deterministic target weighting, non-target Leave behaviour, target capture/KO/flee/loss outcomes, target switch and destination switch.
- [ ] **Step 2: Write browser assertions** that chain bonuses and break rules are visible before committing to an encounter and controls fit a phone viewport.
- [ ] **Step 3: Replace the displayed generic Catch Chain with target hunt status while retaining Field Guide legacy statistics.**
- [ ] **Step 4: Weight hotspot encounter selection toward the target according to model milestones; keep rare/shiny changes capped and explicit.**
- [ ] **Step 5: Distinguish untouched non-target leave from failed committed target encounters in `returnRoam` / battle settlement.**
- [ ] **Step 6: Run Wild Hunt, chain, model, Adventure controller and persistence regressions; expect PASS.**

### Task 8: Regression, stress simulation and Android build

**Files:**
- Modify/Create: `source/TEST_REPORT_v0.67.0.md` as a generated handoff artifact only (ignored from canonical Git source)
- Modify: `source/docs/RELEASE_HISTORY.md`

**Interfaces:**
- Consumes: completed v0.67.0 source.
- Produces: verified APK, verified source ZIP, truthful test report and Termux handoff commands.

- [ ] **Step 1: Install declared test dependencies with `npm ci` if needed, then run focused v0.67.0 tests plus all existing Adventure tests.**
- [ ] **Step 2: Run Wild Hunt/Fishing deterministic stress simulations over many seeds to catch impossible bite/reel states, runaway chain bonuses and duplicate encounter handoffs.**
- [ ] **Step 3: Run `npm test`; if any environment/tool dependency blocks the full suite, report the exact blocker separately rather than claiming a full pass.**
- [ ] **Step 4: Run the Gradle APK build from unpacked `source/`, verify package id, versionName/versionCode and APK existence.**
- [ ] **Step 5: Build a complete source ZIP from the cleaned `source/` tree, excluding ignored/generated build caches and delivery artifacts; inspect ZIP contents and size.**
- [ ] **Step 6: Update release history and produce the matching Termux commands that remove obsolete tracked files via `git add -A`, replace `source/` from the delivered ZIP, commit v0.67.0, and push.**
