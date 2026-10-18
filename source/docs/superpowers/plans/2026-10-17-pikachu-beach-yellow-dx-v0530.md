# Pikachu's Beach Classic + DX v0.53.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace v0.52.0's simplified Pikachu's Beach with a Yellow-source-faithful Classic mode and a port of the supplied Super Surfing Pikachu DX GameMaker release, while preserving LuckyDex rewards, records, achievements, Settings controls, save safety, and portrait-mobile usability.

**Architecture:** Keep the existing `pikachuBeach` Arcade game ID and Summer Beach House route, but make `arcade-pikachu-beach.js` a launcher/shared lifecycle layer. Classic and DX receive separate deterministic simulation cores and presentation controllers, while the existing reserved-safe Lucky Wave prize module remains shared. v0.52.0 state migrates into a `classic` record branch; DX uses its own record branch.

**Tech Stack:** Vanilla JavaScript browser runtime, HTML/CSS Android WebView UI, Node `node:test` regression tests, Python extraction/conversion helpers where useful, Android Gradle metadata.

**Spec:** `docs/superpowers/specs/2026-10-17-pikachu-beach-yellow-dx-design.md`

## Global Constraints

- Baseline is LuckyDex v0.52.0; target is **v0.53.0** with `versionCode 5300`.
- Keep the Arcade game ID `pikachuBeach` and Summer Beach House routing intact.
- No Windows EXE embedding, ROM/emulator dependency, IPS dependency, unrelated Arcade refactor, or Codex use.
- Classic Normal must follow the Pokémon Yellow source behaviour; Easy/Hard only wrap landing/loss tolerance around that base simulation.
- DX must port the supplied GameMaker game's defining surfing, tricks, rings, combat, allies, pickups, five bosses, difficulty, and distance systems when recoverable from the supplied build.
- Lucky Wave remains available in both modes with **Off / Vanilla 2% / Test 25% / Always 100%**.
- Lucky Wave prizes remain the existing five-way reserved-safe pool: Lucky Coins, Card Dust, Pack Voucher/ticket, card, sealed booster.
- Every new DX game mode must have its own meaningful achievements; preserve/migrate the existing Classic achievements where still valid.
- Controls stay below the playfield on portrait mobile and must support simultaneous direction + action in DX.
- Background/page visibility must pause both modes; no hidden-time simulation advancement.
- Missing optional DX audio/effects may degrade locally; missing collision/gameplay data blocks packaging.
- Do not claim APK build or visual browser verification unless actually performed.

## Review Focus

- **Old v0.52.0 saves:** a player with only the flat `state.arcade.pikachuBeach` shape must retain score/clear/Lucky Wave history in Classic after normalization.
- **Multi-touch DX input:** holding a direction while pressing Jump/Attack/Tilt must not cancel either input.
- **Reward interruption:** save switch, visibility loss, card/booster resolution failure, and duplicate retries must leave a single safely claimable Lucky Wave reward.
- **Determinism under long frames:** a 100–500 ms delayed frame must be consumed in fixed-size simulation steps rather than changing Yellow/DX physics outcomes unpredictably.
- **Missing optional asset/audio file:** presentation should skip that one effect/sound while the run continues; missing required gameplay manifest entries must fail tests.

---

## File Structure

### Existing files to modify

- `app/src/main/assets/index.html` — mode picker, Classic markup, DX markup, script order, Settings labels, displayed version.
- `app/src/main/assets/arcade-pikachu-beach.js` — shared launcher/lifecycle only.
- `app/src/main/assets/arcade-pikachu-beach-prizes.js` — shared mode-aware Lucky Wave reservation/delivery.
- `app/src/main/assets/arcade-pikachu-beach.css` — shared shell plus Classic/DX layouts and portrait controls.
- `app/src/main/assets/arcade-platform.js` — state normalization/migration/defaults.
- `app/src/main/assets/arcade-records.js` — separate Classic and DX records sections.
- `app/src/main/assets/achievements-v0341.js` — preserved Classic goals plus DX achievement set.
- `app/src/main/assets/arcade-session.js` — mode-sensitive result metadata/theme fields where required.
- `app/src/main/assets/app-v0167.js` — rare-setting normalization/bindings and v0.53.0 build string.
- `app/build.gradle` — `versionCode 5300`, `versionName '0.53.0'`.
- `package.json` — version `0.53.0`.
- `README.md`, `docs/RELEASE_HISTORY.md` — release note/version metadata.

### Existing file to retire from direct loading

- `app/src/main/assets/arcade-pikachu-beach-core.js` — v0.52.0 approximation; retain only until Classic replacement tests are green, then remove from `index.html` and package if no compatibility consumer remains.

### New runtime files

- `app/src/main/assets/arcade-pikachu-beach-classic-core.js` — deterministic Yellow-derived simulation.
- `app/src/main/assets/arcade-pikachu-beach-classic.js` — Classic input/render/results bridge.
- `app/src/main/assets/arcade-pikachu-beach-dx-content.js` — DX difficulty, distance, enemy, ally, pickup, boss definitions.
- `app/src/main/assets/arcade-pikachu-beach-dx-core.js` — deterministic DX simulation.
- `app/src/main/assets/arcade-pikachu-beach-dx.js` — DX input/render/audio/pause/results bridge.

### New asset/provenance files

- `app/src/main/assets/arcade/pikachu-beach/classic/` — locally bundled Yellow-derived graphics needed by the Classic renderer.
- `app/src/main/assets/arcade/pikachu-beach/dx/` — extracted/converted DX sprites, backgrounds, effects, and browser-compatible audio.
- `app/src/main/assets/arcade/pikachu-beach/dx/manifest.json` — local filenames -> original GameMaker resource names plus frame metadata.
- `docs/PIKACHU_BEACH_ASSETS_v0530.md` — Yellow and DX provenance/recovery notes.
- `scripts/extract-pikachu-beach-dx.py` — reproducible focused extraction/conversion from the supplied DX `data.win`/exported resources.

### New focused tests

- `tests/v0530-pikachu-beach-classic-core.test.cjs`
- `tests/v0530-pikachu-beach-dx-content.test.cjs`
- `tests/v0530-pikachu-beach-dx-core.test.cjs`
- `tests/v0530-pikachu-beach-migration.test.cjs`
- `tests/v0530-pikachu-beach-integration.test.cjs`
- `tests/v0530-pikachu-beach-prizes.test.cjs`

---

### Task 1: Recover and catalogue the two source games

**Files:**
- Create: `scripts/extract-pikachu-beach-dx.py`
- Create: `app/src/main/assets/arcade/pikachu-beach/dx/manifest.json`
- Create: `docs/PIKACHU_BEACH_ASSETS_v0530.md`
- Create: `tests/v0530-pikachu-beach-dx-content.test.cjs`

**Interfaces:**
- Consumes: supplied `superSurfingPikachuDX_v1_1.zip` / `data.win`; Yellow `engine/minigame/surfing_pikachu.asm` and associated graphics as behavioural/visual reference.
- Produces: `manifest.json` entries shaped as `{local, resource, kind, frames, width, height, required}` plus documented source mapping used by later DX tasks.

- [ ] **Step 1: Write the failing manifest/provenance tests**

Assert that the manifest does not yet exist, then require the finished manifest to contain recoverable entries for player surfing/trick sprites, waves, rings, HP pickup, Seaking/Lapras/Natu, enemy assets, and boss assets corresponding to Articuno, Zapdos, Moltres, Lugia and Wailord. Assert every `required:true` local file exists and every asset path remains under `arcade/pikachu-beach/dx/`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/v0530-pikachu-beach-dx-content.test.cjs`

Expected: FAIL because the v0.53.0 DX manifest/assets are absent.

- [ ] **Step 3: Implement focused extraction/cataloguing**

Implement `scripts/extract-pikachu-beach-dx.py INPUT OUTPUT_DIR` so it extracts only the resources needed by the approved DX systems, converts images/audio when practical, preserves transparency/frame ordering, and writes the manifest. Record unrecoverable optional resources explicitly in the provenance doc rather than inventing them.

- [ ] **Step 4: Add the Classic source provenance mapping**

Document the Yellow source file(s), state-machine behaviours being ported, graphics/palette source, and the frame-to-millisecond fixed-step translation rule in `docs/PIKACHU_BEACH_ASSETS_v0530.md`.

- [ ] **Step 5: Run the manifest tests and inspect representative assets**

Run: `node --test tests/v0530-pikachu-beach-dx-content.test.cjs`

Expected: PASS. Manually inspect at least player, wave, ring, one ally, one enemy, and one boss image for cropping/transparency before proceeding.

- [ ] **Step 6: Commit**

```bash
git add scripts/extract-pikachu-beach-dx.py app/src/main/assets/arcade/pikachu-beach/dx docs/PIKACHU_BEACH_ASSETS_v0530.md tests/v0530-pikachu-beach-dx-content.test.cjs
git commit -m "feat: recover Pikachu Beach source assets"
```

### Task 2: Replace the Classic approximation with a Yellow-derived deterministic core

**Files:**
- Create: `app/src/main/assets/arcade-pikachu-beach-classic-core.js`
- Create: `tests/v0530-pikachu-beach-classic-core.test.cjs`
- Modify/remove after green: `app/src/main/assets/arcade-pikachu-beach-core.js`

**Interfaces:**
- Produces: `LuckyDexPikachuBeachClassicCore` / CommonJS API with `CONFIG`, `DIFFICULTIES`, `scoreTrick(flips)`, `createRun({difficulty,luckyWave,rng})`, `setInput(run,{left,right})`, `step(run,dtMs)`, `finishRun(run)`, and `snapshot(run)`.
- `step` returns an array of semantic events such as `wave`, `jump`, `flip`, `landing`, `wipeout`, `luckyWave`, `finish`; callers render events but do not own simulation rules.

- [ ] **Step 1: Write failing tests for Yellow-derived state transitions and scoring**

Cover riding -> jumping -> landing/crashed -> riding/result flow, 6000 starting HP, 50/150/180/350/500 Radness examples, deterministic wave/jump timing, rotation/full flips, clean/rough/hard/wipeout landing classes, speed change after each landing class, HP expiry, shore completion, and final `Radness + remaining HP` score on a clear.

Also add the Review Focus delayed-frame test: stepping one 240 ms frame must match twelve 20 ms fixed steps to the approved tolerance/state values.

- [ ] **Step 2: Run the Classic core tests and verify RED**

Run: `node --test tests/v0530-pikachu-beach-classic-core.test.cjs`

Expected: FAIL because the new Classic core does not exist.

- [ ] **Step 3: Implement the Classic core**

Translate the Yellow state machine into `arcade-pikachu-beach-classic-core.js` with a fixed simulation step. Normal uses source-faithful thresholds/timing; Easy/Hard modify only the approved landing tolerance/speed-loss wrapper values, not wave/state structure.

- [ ] **Step 4: Run Classic core tests and old v0.52.0 core tests**

Run: `node --test tests/v0530-pikachu-beach-classic-core.test.cjs tests/v0520-pikachu-beach-core.test.cjs`

Expected: new tests PASS; any obsolete v0.52.0 assertion is either preserved by the compatibility layer or narrowly updated only after the new source-faithful expectation is pinned.

- [ ] **Step 5: Commit**

```bash
git add app/src/main/assets/arcade-pikachu-beach-classic-core.js app/src/main/assets/arcade-pikachu-beach-core.js tests/v0530-pikachu-beach-classic-core.test.cjs tests/v0520-pikachu-beach-core.test.cjs
git commit -m "feat: port Yellow Pikachu Beach simulation"
```

### Task 3: Add the mode picker and Classic presentation controller

**Files:**
- Modify: `app/src/main/assets/arcade-pikachu-beach.js`
- Create: `app/src/main/assets/arcade-pikachu-beach-classic.js`
- Modify: `app/src/main/assets/arcade-pikachu-beach.css`
- Modify: `app/src/main/assets/index.html`
- Create/modify: `app/src/main/assets/arcade/pikachu-beach/classic/*`
- Create: `tests/v0530-pikachu-beach-integration.test.cjs`

**Interfaces:**
- `LuckyDexPikachuBeach` exposes `open()`, `close()`, `showModePicker()`, `selectMode(mode)`, `snapshot()`.
- `LuckyDexPikachuBeachClassic` exposes `open({difficulty})`, `close()`, `pause()`, `resume()`, `startRun()`, `snapshot()` and consumes `LuckyDexPikachuBeachClassicCore`.

- [ ] **Step 1: Write failing launcher/Classic integration tests**

Assert Summer Beach House still routes to `pikachuBeach`; opening shows **CLASSIC** and **DX** buttons; Classic has Easy/Normal/Hard; Classic playfield uses locally bundled pixel assets with image smoothing disabled; left/right controls are after/outside the playfield; lifecycle pause freezes state; replay/back return through the shared launcher.

- [ ] **Step 2: Run the integration test and verify RED**

Run: `node --test tests/v0530-pikachu-beach-integration.test.cjs`

Expected: FAIL because the mode picker/new Classic controller do not exist.

- [ ] **Step 3: Implement shared launcher and Classic bridge**

Refactor `arcade-pikachu-beach.js` to own routing only, move the current run loop/render/input/results responsibilities into `arcade-pikachu-beach-classic.js`, and drive visuals from Classic core snapshots/events.

- [ ] **Step 4: Implement Classic markup/CSS and local pixel assets**

Keep the modern LuckyDex shell, but render the actual Classic playfield as Game Boy/Yellow-style pixel art. Ensure controls remain below the playfield and UI text is non-selectable without blocking page scrolling.

- [ ] **Step 5: Run the focused integration + Classic tests**

Run: `node --test tests/v0530-pikachu-beach-integration.test.cjs tests/v0530-pikachu-beach-classic-core.test.cjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/index.html app/src/main/assets/arcade-pikachu-beach.js app/src/main/assets/arcade-pikachu-beach-classic.js app/src/main/assets/arcade-pikachu-beach.css app/src/main/assets/arcade/pikachu-beach/classic tests/v0530-pikachu-beach-integration.test.cjs
git commit -m "feat: add Pikachu Beach Classic mode"
```

### Task 4: Implement DX world content and core surfing/combat systems

**Files:**
- Create: `app/src/main/assets/arcade-pikachu-beach-dx-content.js`
- Create: `app/src/main/assets/arcade-pikachu-beach-dx-core.js`
- Create: `tests/v0530-pikachu-beach-dx-core.test.cjs`

**Interfaces:**
- `LuckyDexPikachuBeachDxContent` exports `DIFFICULTIES`, `DISTANCES`, `ENEMIES`, `ALLIES`, `PICKUPS`, `BOSSES`.
- `LuckyDexPikachuBeachDxCore` exports `createRun({difficulty,distance,luckyWave,rng})`, `setInput(run,{up,down,left,right,jump,attack,tilt})`, `step(run,dtMs)`, `finishRun(run)`, `snapshot(run)`.
- DX core semantic events include `jump`, `waveBoost`, `shot`, `ironTail`, `ring`, `trick`, `landing`, `enemyHit`, `damage`, `heal`, `ally`, `bossSpawn`, `bossAttack`, `bossDefeat`, `luckyWave`, `finish`.

- [ ] **Step 1: Write failing tests for movement, jump, trick, rings and combat**

Pin slippery 3/4 movement, direction + action concurrency, jump, wave-assisted airtime, airborne tilt/spin, Iron Tail, ranged attack, ring collection, trick bank/multiplier, perfect/poor landing outcomes, enemy damage/defeat, player HP/damage, and HP Up recovery.

Add the delayed-frame determinism test for DX fixed-step simulation.

- [ ] **Step 2: Run DX core tests and verify RED**

Run: `node --test tests/v0530-pikachu-beach-dx-core.test.cjs`

Expected: FAIL because the DX runtime files do not exist.

- [ ] **Step 3: Implement DX content definitions from recovered data**

Encode only values/systems supported by recovered release data or repeatable executable behaviour. Keep display/assets in content definitions and simulation logic in the core.

- [ ] **Step 4: Implement movement/tricks/rings/combat/pickups**

Use fixed-step deterministic simulation. Preserve simultaneous directional/action input; do not collapse Android input into single-key semantics.

- [ ] **Step 5: Run DX core + content tests**

Run: `node --test tests/v0530-pikachu-beach-dx-core.test.cjs tests/v0530-pikachu-beach-dx-content.test.cjs`

Expected: PASS for implemented base systems.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-pikachu-beach-dx-content.js app/src/main/assets/arcade-pikachu-beach-dx-core.js tests/v0530-pikachu-beach-dx-core.test.cjs
git commit -m "feat: add Pikachu Beach DX core systems"
```

### Task 5: Add DX allies, five bosses, difficulty and distance progression

**Files:**
- Modify: `app/src/main/assets/arcade-pikachu-beach-dx-content.js`
- Modify: `app/src/main/assets/arcade-pikachu-beach-dx-core.js`
- Modify: `tests/v0530-pikachu-beach-dx-core.test.cjs`

**Interfaces:**
- Uses Task 4 DX core/content APIs without changing their public signatures.
- Each boss definition must expose a stable `id`, recovered `name`, spawn/progress condition, attack pattern data, HP, and score/result contribution.

- [ ] **Step 1: Add failing tests for allies, bosses and run length**

Assert Seaking, Lapras and Natu can each reach an ally-triggered state; each of Articuno, Zapdos, Moltres, Lugia and Wailord can reach spawn -> attack -> defeated states; higher difficulty increases supported spawn pressure/damage without changing controls; each distance option changes target run length/progress threshold.

- [ ] **Step 2: Run the expanded DX core tests and verify RED**

Run: `node --test tests/v0530-pikachu-beach-dx-core.test.cjs`

Expected: FAIL at the new ally/boss/distance assertions.

- [ ] **Step 3: Implement recovered ally and boss behaviours**

Port the recoverable release behaviours and attack timings. If an optional audiovisual flourish is unrecoverable, omit only that flourish; if attack/collision rules are unrecoverable, stop and report the blocker rather than inventing a boss.

- [ ] **Step 4: Implement difficulty/distance progression**

Drive spawn pressure and completion distance from `DXContent.DIFFICULTIES` and `DXContent.DISTANCES` so records can key by both dimensions.

- [ ] **Step 5: Run DX tests**

Run: `node --test tests/v0530-pikachu-beach-dx-core.test.cjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-pikachu-beach-dx-content.js app/src/main/assets/arcade-pikachu-beach-dx-core.js tests/v0530-pikachu-beach-dx-core.test.cjs
git commit -m "feat: add Pikachu Beach DX bosses and allies"
```

### Task 6: Build the DX renderer, audio bridge and portrait multi-touch controls

**Files:**
- Create: `app/src/main/assets/arcade-pikachu-beach-dx.js`
- Modify: `app/src/main/assets/arcade-pikachu-beach.css`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/arcade-pikachu-beach.js`
- Modify: `tests/v0530-pikachu-beach-integration.test.cjs`

**Interfaces:**
- `LuckyDexPikachuBeachDx` exposes `open({difficulty,distance})`, `close()`, `pause()`, `resume()`, `startRun()`, `snapshot()` and consumes Tasks 4–5 APIs.
- Input bridge maintains an independent pressed-state set for each control/pointer and produces `{up,down,left,right,jump,attack,tilt}` every simulation step.

- [ ] **Step 1: Add failing DX UI/input/lifecycle tests**

Assert D-pad + JUMP/ATTACK/TILT controls occur after/outside the playfield; independent pointer IDs preserve direction + action simultaneously; keyboard mapping includes arrows/WASD, Space, Z, X, Escape; `visibilitychange`/`pagehide` pause without elapsed simulation; missing optional audio/effect does not terminate the run.

- [ ] **Step 2: Run integration tests and verify RED**

Run: `node --test tests/v0530-pikachu-beach-integration.test.cjs`

Expected: FAIL at DX renderer/control assertions.

- [ ] **Step 3: Implement DX controller and renderer**

Render recovered backgrounds/sprites/effects, HUD, enemies, allies, pickups, bosses and Lucky Wave from DX snapshots/events. Keep runtime asset failures local for optional presentation resources.

- [ ] **Step 4: Implement multi-touch and keyboard input**

Use pointer capture/pressed sets rather than mutually exclusive click handlers so movement and action can overlap.

- [ ] **Step 5: Implement DX pause/results transition**

Pause on Escape/visibility/pagehide and route finish/death to the shared Arcade result framework without advancing while hidden.

- [ ] **Step 6: Run focused UI/core tests**

Run: `node --test tests/v0530-pikachu-beach-integration.test.cjs tests/v0530-pikachu-beach-dx-core.test.cjs`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/index.html app/src/main/assets/arcade-pikachu-beach.js app/src/main/assets/arcade-pikachu-beach-dx.js app/src/main/assets/arcade-pikachu-beach.css tests/v0530-pikachu-beach-integration.test.cjs
git commit -m "feat: add Pikachu Beach DX presentation"
```

### Task 7: Migrate persistence and split Classic/DX records and achievements

**Files:**
- Modify: `app/src/main/assets/arcade-platform.js`
- Modify: `app/src/main/assets/arcade-records.js`
- Modify: `app/src/main/assets/achievements-v0341.js`
- Create: `tests/v0530-pikachu-beach-migration.test.cjs`
- Modify: `tests/v0530-pikachu-beach-integration.test.cjs`

**Interfaces:**
- Normalized shape: `state.arcade.pikachuBeach = { classic:{...}, dx:{...}, luckyPrizes:<aggregate if still needed> }` with a one-time/idempotent migration from the v0.52.0 flat fields into `classic`.
- Records adapter returns distinct `Classic` and `DX` sections; DX best scores key by difficulty and distance.

- [ ] **Step 1: Write failing migration tests**

Create a representative v0.52.0 flat state with non-zero `gamesPlayed`, `clears`, `hardClears`, `bestScore`, `bestScores`, `bestRadness`, `luckyWavesSeen`, `luckyWavesLanded`, `luckyPrizes`; normalize it; assert all values appear under `classic`, no values are lost, and normalizing twice is idempotent.

- [ ] **Step 2: Run migration tests and verify RED**

Run: `node --test tests/v0530-pikachu-beach-migration.test.cjs`

Expected: FAIL because the split state shape does not exist.

- [ ] **Step 3: Implement platform defaults and migration**

Add Classic and DX defaults from the spec, migrate flat v0.52.0 records once, and preserve unknown forward-compatible fields.

- [ ] **Step 4: Add/update achievements**

Preserve the seven existing Classic achievements against `classic` stats. Add at least six DX achievements covering first clear, Hard, combo/trick, rings, boss progression/all five, low/no-death, ally use, and Lucky Wave reward; no debug-only conditions.

- [ ] **Step 5: Split permanent records**

Show separate Classic career/best-score stats and DX career/difficulty+distance/boss stats under the existing Pikachu's Beach game card.

- [ ] **Step 6: Run migration/integration/achievement-record regressions**

Run: `node --test tests/v0530-pikachu-beach-migration.test.cjs tests/v0530-pikachu-beach-integration.test.cjs tests/v0390-arcade-records-state.test.cjs tests/v0390-arcade-records-registry.test.cjs tests/v0390-arcade-achievement-review.test.cjs`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-platform.js app/src/main/assets/arcade-records.js app/src/main/assets/achievements-v0341.js tests/v0530-pikachu-beach-migration.test.cjs tests/v0530-pikachu-beach-integration.test.cjs
git commit -m "feat: persist Pikachu Beach Classic and DX records"
```

### Task 8: Make Lucky Wave mode-aware while retaining reserved-safe five-way rewards

**Files:**
- Modify: `app/src/main/assets/arcade-pikachu-beach-prizes.js`
- Create: `tests/v0530-pikachu-beach-prizes.test.cjs`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`

**Interfaces:**
- `reserve(owner, mode, rng)` where `mode` is `'classic'|'dx'`; attempt source stays `pikachu-beach-lucky-wave` and metadata records the mode.
- `deliver(owner, attempt)` grants exactly once and increments the matching mode's Lucky Wave prize counter.
- `retry(owner)` retries all pending Pikachu Beach attempts regardless of mode.

- [ ] **Step 1: Write failing prize tests**

Pin Off=0, Vanilla=.02, Test=.25, Always=1.0; prove Classic and DX can each reserve; force all five reward classes; verify card/booster resolution occurs before claim; save-switch leaves reservation pending; duplicate concurrent delivery grants once; retry after reopen succeeds; missing optional presentation asset has no effect on the reservation.

- [ ] **Step 2: Run prize tests and verify RED**

Run: `node --test tests/v0530-pikachu-beach-prizes.test.cjs`

Expected: FAIL on the new mode-aware counters/metadata.

- [ ] **Step 3: Implement mode-aware reservation/delivery**

Keep the existing shared rare-reward bridge and locking pattern. Store mode metadata on the attempt and increment `classic.luckyPrizes` or `dx.luckyPrizes` only after the unique claim succeeds.

- [ ] **Step 4: Verify Settings UI and game consumption**

Keep one `Lucky Wave · Pikachu` Settings selector controlling both modes; both controllers must read the same normalized rare odds and Always must guarantee the encounter.

- [ ] **Step 5: Run new and old prize tests**

Run: `node --test tests/v0530-pikachu-beach-prizes.test.cjs tests/v0520-pikachu-beach-prizes.test.cjs`

Expected: PASS after narrowly adapting any v0.52.0 state-shape assertion for migration compatibility.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-pikachu-beach-prizes.js app/src/main/assets/app-v0167.js app/src/main/assets/index.html tests/v0530-pikachu-beach-prizes.test.cjs tests/v0520-pikachu-beach-prizes.test.cjs
git commit -m "feat: share safe Lucky Wave rewards across modes"
```

### Task 9: Results, versioning, focused regression and visual verification

**Files:**
- Modify: `app/src/main/assets/arcade-session.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/build.gradle`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `docs/RELEASE_HISTORY.md`
- Create: `TEST_REPORT_v0.53.0.md`
- Modify: `tests/v0530-pikachu-beach-integration.test.cjs`

**Interfaces:**
- Classic result payload includes score, Radness, remaining HP, landing/wipeout stats, best trick and Lucky Wave prize.
- DX result payload includes score, selected distance, enemies, bosses, rings, best combo/trick bank, HP/damage, allies and Lucky Wave prize.

- [ ] **Step 1: Add failing result/version tests**

Assert the two result payloads expose the approved metrics; permanent results/replay/back routes preserve selected mode; package/app/Gradle/display metadata all read `0.53.0` / `5300`.

- [ ] **Step 2: Run integration test and verify RED**

Run: `node --test tests/v0530-pikachu-beach-integration.test.cjs`

Expected: FAIL on result/version assertions.

- [ ] **Step 3: Implement result metadata and version bump**

Update shared result presentation only as needed for the two modes; do not refactor unrelated game themes. Set `package.json` `0.53.0`, Gradle `5300`/`0.53.0`, app build string/display version, README and release history.

- [ ] **Step 4: Run all focused Pikachu Beach tests**

Run: `node --test tests/v0530-pikachu-beach-*.test.cjs tests/v0520-pikachu-beach-*.test.cjs`

Expected: PASS.

- [ ] **Step 5: Run wider Arcade regressions**

Run: `npm test`

Expected: PASS if the environment has all declared dev dependencies. If Playwright or another external runtime is unavailable, record the exact stopping point and additionally run all non-browser Arcade suites that are available; do not claim a full pass.

- [ ] **Step 6: Perform portrait visual QA if browser tooling is available**

Capture/inspect: mode picker; Classic riding, airborne trick, forced Lucky Wave and result; DX surfing/combat, ally/pickup, each boss category reachable, forced Lucky Wave and result; Settings control; records; achievements. Verify cropping, pixel scaling, transparency, HUD/control collisions, multi-touch layout and result readability.

- [ ] **Step 7: Package and verify the exact ZIP**

Create `LuckyDex_source_v0.53.0.zip`, extract it to a clean temporary directory, rerun the focused Pikachu Beach suite against the extracted copy, run archive integrity checks, and calculate SHA-256.

- [ ] **Step 8: Write the verification report**

Create `TEST_REPORT_v0.53.0.md` distinguishing Yellow-derived behaviours, recovered DX systems/assets, genuine recovery limitations, focused/wider test results, visual QA status, build limitations, and final SHA-256.

- [ ] **Step 9: Commit release metadata/report**

```bash
git add app/src/main/assets/arcade-session.js app/src/main/assets/index.html app/src/main/assets/app-v0167.js app/build.gradle package.json README.md docs/RELEASE_HISTORY.md TEST_REPORT_v0.53.0.md tests/v0530-pikachu-beach-integration.test.cjs
git commit -m "release: LuckyDex v0.53.0 Pikachu Beach Classic and DX"
```
