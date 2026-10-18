# LuckyDex Arcade Zones + Kalos Amie Garden Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace LuckyDex's flat Arcade picker with themed zones, add Berry Picker, Head It, and Tile Puzzle, centralise modest Arcade rewards with once-daily item bonuses, and rebalance Poké Ball Drop without changing unrelated game systems.

**Architecture:** Keep the existing WebView/single-page structure and legacy minigame implementations intact. Add a small Arcade platform module for additive state/reward policy, a final-loaded zone/navigation module that wraps the existing Arcade shell, and a dedicated Amie module/CSS for the three new games. Existing games continue to use their current code; only Poké Ball Drop is migrated to the new payout path in this wave.

**Tech Stack:** Android WebView shell, HTML/CSS, vanilla JavaScript, `localStorage` save state, Node built-in `assert` tests for pure logic, pytest static/regression tests, Gradle Android debug build.

**Spec:** `docs/superpowers/specs/2026-10-04-luckydex-arcade-zones-design.md`

## Global Constraints

- Baseline is LuckyDex v0.16.13; preserve the existing application ID and `app/luckydex-dev.keystore` signing configuration.
- No Arcade entry fee, energy/stamina currency, cooldown, monetisation, Pack Ticket farming, or new battle effect.
- New item rewards use only existing inventory keys: `berry`, `potion`, `pokeball`, `greatball`, `ultraball`.
- Each new game can grant at most one item bonus per local calendar day; repeat play must remain unlimited after the claim.
- Ordinary repeat-run coin rewards should stay roughly 20–80 coins for short/decent runs and roughly 60–150 for strong/hard runs.
- Poké Ball Drop keeps displayed slot scores `150 / 250 / 400 / 1000 / 400 / 250 / 150`; an actual centre landing retains a separate 1000 Lucky Coin jackpot event.
- Existing collection, packs, trade, Adventure/Expeditions, existing Arcade scores, and stable APK update signing must not regress.
- Safari Zone stays absent from Arcade.
- Pokémon Dash, Stadium, Dream World, Slots/Roulette, temporary expedition boosts, and a full rebalance of all legacy games remain out of scope.

## Review Focus

- **Old saves with partial `state.arcade`:** additive migration must populate every new field without replacing existing best scores or other save sections. Covered in Task 1 tests.
- **Local-day rollover:** a daily item claimed yesterday must be claimable today, while two qualifying runs on the same date must yield only one item reward. Covered in Task 1 tests.
- **Sparse/empty Pokémon collection:** all three Amie games must start with safe fallback participants/art instead of showing blank lanes or throwing. Covered in Tasks 2–4 tests/smokes.
- **Back navigation with an at-risk legacy run:** zone wrapping must preserve the existing confirmation and only reveal the owning zone after the game really closes. Covered in Task 5 tests/smoke.
- **Generated Tile Puzzle validity:** every board must be solvable, non-solved at start, and completion must require the exact canonical order. Covered in Task 4 Node tests.

---

### Task 1: Arcade platform state and reward policy

**Files:**
- Create: `app/src/main/assets/arcade-platform-v0170.js`
- Modify: `app/src/main/assets/app-v0167.js` around `DEFAULT_STATE`, `loadState()`, `save()`, and `awardArcadeCoins()`
- Modify: `app/src/main/assets/index.html` script order only (load platform immediately after `app-v0167.js`)
- Create: `tests/arcade-platform-v0170.test.js`
- Create: `tests/test_arcade_v0170_static.py`

**Interfaces:**
- Produces `window.LuckyDexArcadePlatform` with:
  - `ZONES`: zone metadata keyed by `amie`, `gameCorner`, `discovery`, `performance`.
  - `ensureArcadeState(arcade: object) -> object`.
  - `todayKey(date?: Date) -> "YYYY-MM-DD"` using local calendar date parts.
  - `dailyClaimAvailable(gameId: string, dateKey?: string) -> boolean`.
  - `awardRun({gameId,label,score,coins,dailyEligible,dailyReward}) -> {coinsAwarded,itemAwarded}` where `dailyReward` is `null` or `{key, amount}`.
  - `caughtParticipants(limit: number, fallbackIds?: number[]) -> Array<{id,name,shiny?,image}>`.
  - `ballDropPayout({ordinaryPoints,jackpots}) -> {ordinaryCoins,jackpotCoins,totalCoins}`.
- `state.arcade` gains:
  - `dailyRewards: {}`
  - `bestBerryPicker: {easy:0,normal:0,hard:0}`
  - `bestHeadIt: {easy:0,normal:0,hard:0,unlimited:0,unlimitedStreak:0}`
  - `bestTilePuzzle: {easy:null,normal:null,hard:null}`
  - `lastArcadeZone: 'amie'`
- Save schema increments from 5 to 6 additively; no other state section changes.

- [ ] **Step 1: Write failing Node tests for additive state and daily reward semantics**

Test names/assertions:
- `ensureArcadeState preserves legacy fields and adds all v0.17 fields`.
- `daily item reward can be claimed once on one date and again after date rollover`.
- `non-qualifying or already-claimed runs still return their coin award and do not block replay`.
- `ballDropPayout converts 1200 ordinary points to 72 coins, caps 3000 ordinary points at 90 coins, and adds exactly 1000 per jackpot`.
- `caughtParticipants returns fallback entries when collection is empty`.

- [ ] **Step 2: Run the Node test and verify RED**

Run: `node tests/arcade-platform-v0170.test.js`

Expected: FAIL because `arcade-platform-v0170.js` / exported API does not exist.

- [ ] **Step 3: Write failing pytest checks for save defaults/script order**

Assert:
- save version is 6;
- all five new Arcade state keys exist in the default state;
- `arcade-platform-v0170.js` is loaded immediately after `app-v0167.js`;
- the dev keystore signing block remains unchanged.

- [ ] **Step 4: Run the pytest slice and verify RED**

Run: `python -m pytest tests/test_arcade_v0170_static.py -q`

Expected: FAIL on missing v0.17 Arcade fields/module.

- [ ] **Step 5: Implement the platform module and additive save migration**

`awardRun()` must delegate coin/stat accounting through the existing `awardArcadeCoins()` path exactly once per completed run, then conditionally mutate the inventory + `state.arcade.dailyRewards[gameId]` and `save()` when the daily item is actually granted.

`ballDropPayout()` formula is fixed for this release:
- `ordinaryCoins = ordinaryPoints <= 0 ? 0 : clamp(round(ordinaryPoints * 0.06), 15, 90)`;
- `jackpotCoins = max(0, jackpots) * 1000`;
- `totalCoins = ordinaryCoins + jackpotCoins`.

- [ ] **Step 6: Run Node + pytest tests and verify GREEN**

Run:
- `node tests/arcade-platform-v0170.test.js`
- `python -m pytest tests/test_arcade_v0170_static.py -q`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-platform-v0170.js app/src/main/assets/app-v0167.js app/src/main/assets/index.html tests/arcade-platform-v0170.test.js tests/test_arcade_v0170_static.py
git commit -m "feat: add arcade platform rewards"
```

---

### Task 2: Berry Picker

**Files:**
- Create: `app/src/main/assets/arcade-amie-v0170.js`
- Create: `app/src/main/assets/arcade-amie-v0170.css`
- Modify: `app/src/main/assets/index.html` (Berry Picker game shell; CSS/JS includes)
- Create: `tests/arcade-amie-v0170.test.js`
- Modify: `tests/test_arcade_v0170_static.py`

**Interfaces:**
- Consumes: `LuckyDexArcadePlatform.awardRun()`, `.caughtParticipants()` and global `API.sprite`, `state`, `save`, `vibrate`.
- Produces `window.LuckyDexAmie` with `open(gameId)`, `close(force=false)`, `activeGame()`, and game-specific reset/start functions used by zone navigation.
- Berry Picker configs:
  - Easy: 2 customers, 3 berry types, 45s run, 7500ms patience, daily target 8 correct.
  - Normal: 3 customers, 5 berry types, 50s run, 6000ms patience, daily target 14 correct.
  - Hard: 4 customers, 7 berry types, 55s run, 4500ms patience, daily target 20 correct.
- Berry pool by difficulty: Easy = Cheri/Chesto/Pecha; Normal adds Rawst/Aspear; Hard adds Leppa/Oran. Use existing PokeAPI item-art source already used by LuckyDex rather than a new provider.
- Correct delivery score: `100 + min(combo,10)*10 + round(50*remainingPatienceFraction)`.
- Wrong/expired request resets combo and grants no score.
- Coin payout: `clamp(round(score/20), 20, cap)` where cap = 70/100/140 for Easy/Normal/Hard.
- Daily reward, shared across all Berry Picker modes: Easy `berry×2`, Normal `berry×3`, Hard `berry×4`.

- [ ] **Step 1: Write failing logic tests for Berry Picker config/scoring/payout**

Also assert an empty caught collection resolves to four safe fallback Pokémon rather than fewer participants.

- [ ] **Step 2: Run Node test and verify RED**

Run: `node tests/arcade-amie-v0170.test.js`

Expected: FAIL because Amie logic/API is missing.

- [ ] **Step 3: Write failing markup/accessibility tests**

Assert the Berry Picker shell contains mode controls, customer area, berry tray, timer/score/combo, start/restart controls, and Pointer Events code plus a tap-select fallback path.

- [ ] **Step 4: Run pytest slice and verify RED**

Run: `python -m pytest tests/test_arcade_v0170_static.py -q`

Expected: FAIL on missing Berry Picker shell/styles.

- [ ] **Step 5: Implement Berry Picker**

Use caught Pokémon first, then fallback IDs `[25,133,175,183]`. Drag interaction uses Pointer Events; tap fallback is `tap berry -> tap requesting Pokémon`. Requests must visibly show the berry icon and patience state. Ending the run persists `state.arcade.bestBerryPicker[mode]`, calls `awardRun()` once, and never disables replay after the daily item has been claimed.

- [ ] **Step 6: Run Node + pytest tests and verify GREEN**

Run both Arcade test commands from Steps 2/4.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-amie-v0170.js app/src/main/assets/arcade-amie-v0170.css app/src/main/assets/index.html tests/arcade-amie-v0170.test.js tests/test_arcade_v0170_static.py
git commit -m "feat: add berry picker"
```

---

### Task 3: Head It

**Files:**
- Modify: `app/src/main/assets/arcade-amie-v0170.js`
- Modify: `app/src/main/assets/arcade-amie-v0170.css`
- Modify: `app/src/main/assets/index.html` (Head It shell)
- Modify: `tests/arcade-amie-v0170.test.js`
- Modify: `tests/test_arcade_v0170_static.py`

**Interfaces:**
- Consumes/produces the same `LuckyDexAmie` object from Task 2.
- Mode config:
  - Easy: 2 lanes, 45s, fall duration starts 2500ms and floors at 1400ms, daily target 1200 score.
  - Normal: 3 lanes, 60s, 2200ms -> 1100ms, daily target 2000.
  - Hard: 4 lanes, 60s, 1900ms -> 800ms, daily target 2800.
  - Unlimited: 3 lanes, no clock, 3 misses ends run, 2100ms -> 700ms, daily target 3200 or 20 best streak.
- Timing grade uses distance to impact: Perfect <= 90ms, Good <= 220ms, otherwise Miss.
- Score: Perfect 100, Good 60, plus `min(combo*5,100)` on successful normal balls; bonus yarn ball = 300 base before combo bonus.
- Coin payout: `clamp(round(score/25), 20, cap)` with cap 70/100/140/150 by mode.
- Daily reward shared across Head It modes: Easy/Normal qualifying run = `potion×1`; Hard qualifying run = `potion×1`, upgraded to `greatball×1` only at score >= 4200; Unlimited qualifying run = `potion×1`, upgraded to `greatball×1` only at best streak >= 30. This keeps ball rewards occasional rather than routine.

- [ ] **Step 1: Add failing Head It logic tests**

Assert timing buckets, three-miss Unlimited termination, speed floor, bonus-ball score, and mode reward mapping.

- [ ] **Step 2: Run Node tests and verify RED**

Run: `node tests/arcade-amie-v0170.test.js`

Expected: FAIL on missing Head It logic.

- [ ] **Step 3: Add failing static shell tests**

Assert mode controls, lane/playfield host, score/combo/miss displays, and no drag-only requirement.

- [ ] **Step 4: Run pytest and verify RED**

Run: `python -m pytest tests/test_arcade_v0170_static.py -q`

Expected: FAIL on missing Head It markup.

- [ ] **Step 5: Implement Head It**

Use caught Pokémon then the same safe fallback pool. Falling balls target a concrete lane; tapping the lane/Pokémon resolves only the nearest active ball for that lane. Escalate fall duration smoothly toward the mode floor. Persist best score per mode and `unlimitedStreak` separately.

- [ ] **Step 6: Run Node + pytest tests and verify GREEN**

Run the two Arcade test commands.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-amie-v0170.js app/src/main/assets/arcade-amie-v0170.css app/src/main/assets/index.html tests/arcade-amie-v0170.test.js tests/test_arcade_v0170_static.py
git commit -m "feat: add head it minigame"
```

---

### Task 4: Tile Puzzle

**Files:**
- Modify: `app/src/main/assets/arcade-amie-v0170.js`
- Modify: `app/src/main/assets/arcade-amie-v0170.css`
- Modify: `app/src/main/assets/index.html` (Tile Puzzle shell)
- Modify: `tests/arcade-amie-v0170.test.js`
- Modify: `tests/test_arcade_v0170_static.py`

**Interfaces:**
- Modes: Easy 3×3, Normal 4×4, Hard 5×5.
- Puzzle representation is an array of `size*size` integers where the final value (`size*size-1`) is the empty slot and solved order is `[0,1,...,N-1]`.
- `makeSolvablePuzzle(size, randomFn)` starts solved and performs legal empty-slot moves only: 80/160/260 moves for 3×3/4×4/5×5, avoids immediate reversal where another move exists, and performs at least one extra legal move if the final board is solved.
- `isSolvedPuzzle(tiles) -> boolean` requires exact canonical order.
- Daily qualification: completion within 90s/180s/300s for Easy/Normal/Hard.
- Coin reward = base + time bonus + move bonus, capped at 60/90/130 respectively:
  - base 20/35/50;
  - time bonus up to 20/30/40, linearly decreasing to zero at the qualification time;
  - move bonus up to 20/25/40, linearly decreasing to zero at `4 * shuffleMoves` player moves.
- Daily reward: Easy `pokeball×2`, Normal `pokeball×3`, Hard `greatball×1`.

- [ ] **Step 1: Add failing puzzle-generation tests**

For each size, generate at least 200 seeded boards and assert every board is non-solved, every transition used by the shuffler is legal, and replaying the recorded inverse moves returns to solved. Assert exact completion rejects a one-tile mismatch.

- [ ] **Step 2: Run Node tests and verify RED**

Run: `node tests/arcade-amie-v0170.test.js`

Expected: FAIL on missing puzzle helpers.

- [ ] **Step 3: Add failing static shell tests**

Assert mode controls, puzzle grid, target preview/Pokémon identity, timer, move count, and restart control exist.

- [ ] **Step 4: Run pytest and verify RED**

Run: `python -m pytest tests/test_arcade_v0170_static.py -q`

Expected: FAIL on missing Tile Puzzle shell.

- [ ] **Step 5: Implement Tile Puzzle**

Use one caught Pokémon sprite/art if available, fallback to Pikachu. Each numbered crop uses the same image with background-size/position so the complete grid reconstructs one image. Only tiles adjacent to the empty slot move. Persist best completion time in seconds per difficulty, keeping the smaller value.

- [ ] **Step 6: Run Node + pytest tests and verify GREEN**

Run the two Arcade test commands.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-amie-v0170.js app/src/main/assets/arcade-amie-v0170.css app/src/main/assets/index.html tests/arcade-amie-v0170.test.js tests/test_arcade_v0170_static.py
git commit -m "feat: add tile puzzle"
```

---

### Task 5: Arcade map and zone navigation

**Files:**
- Create: `app/src/main/assets/arcade-zones-v0170.js`
- Create: `app/src/main/assets/arcade-zones-v0170.css`
- Modify: `app/src/main/assets/index.html:153-169` (replace old flat picker with map/zone hosts; link CSS; load zone JS last)
- Modify: `tests/test_arcade_v0170_static.py`
- Create: `tests/arcade-zones-v0170.test.js`

**Interfaces:**
- Consumes: `LuckyDexArcadePlatform.ZONES`, final legacy global `openArcadeGame(name)` and `closeArcadeGame(force)`.
- Produces `window.LuckyDexArcadeZones` with:
  - `openMap()`
  - `openZone(zoneId)`
  - `openGame(gameId)`
  - `backFromGame(force=false)`
  - `zoneForGame(gameId) -> zoneId|null`
- Exact initial mapping:
  - `amie`: `berryPicker`, `headIt`, `tilePuzzle`
  - `gameCorner`: `voltorb`, `ballDrop`
  - `discovery`: `fossil`, `ditto`, `unown`, `quiz`
  - `performance`: `berry`, `clefairy`
- Zone JS must load last so it owns the final navigation wrapper after all existing v0.16.x Arcade overrides.

- [ ] **Step 1: Write failing zone metadata/navigation tests**

Assert that every existing visible Arcade game (`voltorb`, `ballDrop`, `fossil`, `ditto`, `unown`, `quiz`, `berry`, `clefairy`) appears in exactly one zone, the three new games are in Amie, and `safari` appears in none.

- [ ] **Step 2: Run Node test and verify RED**

Run: `node tests/arcade-zones-v0170.test.js`

Expected: FAIL because the zone module does not exist.

- [ ] **Step 3: Write failing static markup tests**

Assert `#arcadeMap`, `#arcadeZoneView`, `#arcadeZoneTitle`, `#arcadeZoneGames`, and an `‹ ARCADE MAP` control exist; old `.arcade-picker` is no longer the top-level Arcade selector; each zone has a rendered game-count slot/daily-indicator hook; no duplicate IDs.

- [ ] **Step 4: Run pytest slice and verify RED**

Run: `python -m pytest tests/test_arcade_v0170_static.py -q`

Expected: FAIL on missing map/zone hosts.

- [ ] **Step 5: Implement data-driven map + zone UI and final navigation wrapper**

Rules:
- Bottom-nav Arcade always enters `openMap()`.
- `openZone()` updates `state.arcade.lastArcadeZone`, saves it, renders only that zone's game cards, and exposes `‹ ARCADE MAP`.
- `openGame()` records the owning zone then either calls `LuckyDexAmie.open(gameId)` for an Amie game or delegates to the captured legacy `openArcadeGame()` for existing games.
- Wrapped `closeArcadeGame()`/Android Back must preserve any legacy at-risk confirmation. Only when the game actually closes should the owning zone become visible.
- Existing game headers should read `‹ <ZONE NAME>` through the zone wrapper rather than returning directly to the global map.

- [ ] **Step 6: Add responsive zone styling**

At 320px CSS width there must be no page-level horizontal overflow. Use large touch cards on the map, compact game cards inside a zone, and distinct zone treatments without introducing remote visual dependencies.

- [ ] **Step 7: Run Node + pytest tests and verify GREEN**

Run:
- `node tests/arcade-zones-v0170.test.js`
- `python -m pytest tests/test_arcade_v0170_static.py -q`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/src/main/assets/arcade-zones-v0170.js app/src/main/assets/arcade-zones-v0170.css app/src/main/assets/index.html tests/arcade-zones-v0170.test.js tests/test_arcade_v0170_static.py
git commit -m "feat: add arcade zone map"
```

---

### Task 6: Poké Ball Drop economy rebalance

**Files:**
- Modify: `app/src/main/assets/quality-content-v0168.js:130-156` around `settleBallV168()`
- Modify: `tests/arcade-platform-v0170.test.js`
- Modify: `tests/test_arcade_v0170_static.py`

**Interfaces:**
- Consumes: `LuckyDexArcadePlatform.ballDropPayout()` and `.awardRun()`.
- `ballGameV168` tracks `ordinaryPoints` and `jackpots` in addition to display `score`.
- Slot-score display and physics remain unchanged.

- [ ] **Step 1: Add failing regression tests for payout separation**

Assert source no longer contains `Math.round(g.score*.62)`; centre slot increments `jackpots`; non-centre landing points contribute to `ordinaryPoints`; completed round calls `ballDropPayout()` and `awardRun()`.

- [ ] **Step 2: Run tests and verify RED**

Run:
- `node tests/arcade-platform-v0170.test.js`
- `python -m pytest tests/test_arcade_v0170_static.py -q`

Expected: FAIL because v0.16.13 still uses score × 0.62.

- [ ] **Step 3: Implement payout separation**

Rules:
- `g.score` remains the displayed score and still includes the 1000-point centre slot + pin bonuses.
- For coin conversion, non-centre slot points and all pin bonuses add to `ordinaryPoints`; the centre's 1000 base points do not.
- Each centre landing increments `jackpots` by one.
- At the end of three balls, compute `{ordinaryCoins,jackpotCoins,totalCoins}` through the platform helper and award exactly one completed run with `dailyEligible:false`.
- Result copy explicitly distinguishes ordinary payout from any `1000 × jackpot count` event.
- Do not change peg layout, gravity, aim, slot geometry, displayed slot scores, or jackpot probability.

- [ ] **Step 4: Run tests and verify GREEN**

Run the two commands from Step 2.

- [ ] **Step 5: Commit**

```bash
git add app/src/main/assets/quality-content-v0168.js tests/arcade-platform-v0170.test.js tests/test_arcade_v0170_static.py
git commit -m "fix: rebalance pokeball drop payouts"
```

---

### Task 7: Release integration, regression, and v0.17.0 packaging

**Files:**
- Modify: `app/build.gradle` (`versionCode 180`, `versionName '0.17.0'`; do not alter signing config)
- Modify: `app/src/main/assets/app-v0167.js` build marker to `0.17.0-arcade-zones-amie`
- Modify: `app/src/main/assets/index.html` visible version copy if present
- Modify: `README.md`, `CODEX_HANDOVER.md`
- Create: `TEST_REPORT_v0.17.0.md`
- Modify: `tests/test_arcade_v0170_static.py`

**Interfaces:**
- No new runtime API; this task validates the assembled release.

- [ ] **Step 1: Add failing release/static assertions**

Assert:
- versionCode/versionName are 180/0.17.0;
- build marker is v0.17.0;
- script order is `app-v0167.js` -> `arcade-platform-v0170.js` -> legacy Arcade scripts -> `quality-content-v0168.js` -> `arcade-amie-v0170.js` -> `arcade-zones-v0170.js`;
- every HTML ID is unique;
- every `.js` asset passes `node --check`;
- signing keystore file and signingConfig values are unchanged from v0.16.13.

- [ ] **Step 2: Run release tests and verify RED before version bump**

Run: `python -m pytest -q`

Expected: FAIL on v0.17 version assertions until metadata/docs are updated.

- [ ] **Step 3: Apply version/docs/test-report updates**

Document the four zones, three new games, daily item reward rules, no-entry-fee decision, and Poké Ball Drop payout formula. Do not claim Android build success until Gradle/GitHub Actions has actually produced it.

- [ ] **Step 4: Run full local verification**

Run:
- `node tests/arcade-platform-v0170.test.js`
- `node tests/arcade-zones-v0170.test.js`
- `node tests/arcade-amie-v0170.test.js`
- `python -m pytest -q`
- `for f in app/src/main/assets/*.js; do node --check "$f" || exit 1; done`

Expected: all PASS / exit 0.

- [ ] **Step 5: Build Android debug APK with stable signing**

Run where Gradle is available: `gradle :app:assembleDebug`

Expected: `BUILD SUCCESSFUL`, APK at `app/build/outputs/apk/debug/app-debug.apk`, signed with the existing `luckydex` dev certificate. If local Gradle is unavailable, upload the finished source ZIP and require the existing GitHub Actions APK workflow to pass before calling the release build-complete.

- [ ] **Step 6: Phone-width/manual acceptance smoke**

On Android WebView or equivalent narrow viewport verify:
- Arcade -> map -> each of four zones -> every existing game reachable exactly once;
- game Back returns to owning zone; zone Back returns map;
- legacy at-risk leave confirmation still works;
- Berry Picker drag and tap fallback both work;
- Head It all four modes start/end; Unlimited ends on third miss;
- Tile Puzzle all three sizes complete and persist best times;
- same-day repeat runs give coins but no second item; simulated next local day allows item again;
- Poké Ball Drop ordinary three-ball round pays tens of coins; centre jackpot adds exactly 1000;
- Packs, Trade, Collection and Adventure open and behave as before.

- [ ] **Step 7: Commit**

```bash
git add app/build.gradle app/src/main/assets/app-v0167.js app/src/main/assets/index.html README.md CODEX_HANDOVER.md TEST_REPORT_v0.17.0.md tests
git commit -m "release: lucky dex v0.17.0 arcade zones"
```

---

## Self-review outcome

- **Spec coverage:** All approved v0.16.13 -> v0.17.0 scope is assigned: zones/navigation (Task 5), central rewards/save migration (Task 1), Berry Picker/Head It/Tile Puzzle (Tasks 2–4), Poké Ball Drop rebalance (Task 6), upgrade signing/regression/versioning (Task 7). Deferred roadmap items remain explicitly absent.
- **Step scan:** Each task has a red test, minimal implementation target, green verification and commit boundary. No task requires a later task's undefined runtime symbol.
- **Type/interface consistency:** Amie depends only on the platform API defined in Task 1; zone navigation depends on the platform metadata plus the `LuckyDexAmie` API defined in Task 2 and extended in Tasks 3–4 and is final-loaded after both; Poké Ball Drop consumes the same platform reward interface.
- **Review focus:** Old saves, date rollover, empty collections, at-risk back navigation, and puzzle solvability each have explicit automated or smoke coverage.
- **Proportion:** This plan pins product decisions/formulas/interfaces without transcribing complete game implementations.
