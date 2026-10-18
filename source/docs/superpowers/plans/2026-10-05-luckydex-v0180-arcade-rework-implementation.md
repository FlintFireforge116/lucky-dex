# LuckyDex v0.18.0 Arcade Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild LuckyDex Arcade so it behaves like a continuous Pokémon-world minigame hub with dedicated venue/game pages, clear run/reward/results UX, and polished Berry Picker, Head It, Tile Puzzle and Poké Ball Drop experiences.

**Architecture:** Keep the v0.17 reward/save platform as the source of truth, add one shared session/results layer and one data-driven world/venue navigator, then rebuild only the four weak game surfaces. Stable legacy games receive narrow adapters for session/result/navigation information rather than mechanical rewrites. Ditto Transform remains save-compatible but is removed from visible navigation and script entry points.

**Tech Stack:** Android WebView shell; HTML/CSS; vanilla JavaScript; Canvas for Poké Ball Drop; Pointer Events + requestAnimationFrame; Node `assert` tests; Python/pytest static tests; Gradle Android build through existing GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-05-luckydex-v0180-arcade-rework-design.md`

## Global Constraints

- Baseline is LuckyDex v0.17.0; upgrade must be in-place and non-destructive.
- Package/application ID and `app/luckydex-dev.keystore` remain unchanged.
- Keystore SHA-256 remains `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
- Release version is `versionName '0.18.0'`, `versionCode 190`.
- No Arcade entry fee, energy, ticket timer, ads or real-money mechanic.
- v0.17 coin-award and daily-item claim logic remains centralized in `LuckyDexArcadePlatform.awardRun()`.
- No new minigame families in v0.18.0.
- Ditto save/best fields remain untouched even though Ditto Transform disappears from visible Arcade navigation.
- World landmarks use local PNG/WebP assets; no emoji may be the visible primary landmark art.
- Every visible game exposes run-ending/reward information and an unmistakable final result showing the actual reward awarded.
- Touch targets should be approximately 44 CSS px minimum; no essential hover-only interaction.
- Preserve vertical page scrolling outside dedicated horizontal-world and game gesture surfaces.

## Review Focus

1. **Upgrading an existing v0.17 save with `lastArcadeZone` but no `lastArcadeVenue`:** migration selects a valid venue without removing any old Arcade/card/inventory state. Covered in Task 2.
2. **Android Back from every hierarchy level:** Game -> owning Venue -> same World landmark -> normal app navigation, including legacy games. Covered in Tasks 2 and 7.
3. **Rapid taps/swipes while a timed game is ending:** completion/result awarding happens exactly once and timers/RAF stop. Covered in Tasks 3-6.
4. **Small/failed artwork loads:** Tile Puzzle and world landmarks remain usable with a local/fallback visual rather than a broken or stretched board. Covered in Tasks 2 and 5.
5. **Repeat play after daily item has already been claimed:** exact coin result still displays and replay remains available; no reward gate appears. Covered in Tasks 1, 3-7.

---

## File Structure

**Create**
- `app/src/main/assets/arcade-session-v0180.js` — shared run/reward strip and standard result-sheet API.
- `app/src/main/assets/arcade-session-v0180.css` — compact session/result presentation.
- `app/src/main/assets/arcade-world-v0180.js` — venue definitions, horizontal world state, venue/game hierarchy, back navigation.
- `app/src/main/assets/arcade-world-v0180.css` — continuous route, scroll-snap landmarks, venue pages.
- `app/src/main/assets/arcade-amie-v0180.js` — v0.18 Berry Picker scene, Head It rebuild, Tile Puzzle rebuild. Reuse tested v0.17 scoring/reward helpers where unchanged.
- `app/src/main/assets/arcade-amie-v0180.css` — focused Amie playfields.
- `app/src/main/assets/arcade-ball-drop-v0180.js` — v0.18 three-ball lifecycle/result adapter over existing physics.
- `app/src/main/assets/arcade-ball-drop-v0180.css` — landing/result presentation only where needed.
- `app/src/main/assets/arcade/venues/*.webp` — eight local landmark illustrations.
- `tests/arcade-session-v0180.test.js`
- `tests/arcade-world-v0180.test.js`
- `tests/arcade-amie-v0180.test.js`
- `tests/arcade-ball-drop-v0180.test.js`
- `tests/test_arcade_v0180_static.py`
- `TEST_REPORT_v0.18.0.md`

**Modify**
- `app/src/main/assets/index.html` — world/venue/session shells, rebuilt game markup, ordered v0.18 includes, remove visible Ditto entry.
- `app/src/main/assets/app-v0167.js` — additive `lastArcadeVenue` save default/migration; narrow result integration for Voltorb/Berry Blend/Clefairy where required.
- `app/src/main/assets/arcade-platform-v0170.js` — preserve award logic; add only migration/default helper or payout-delta helper if required by tests.
- `app/src/main/assets/arcade-expansion-v0166.js` — narrow Fossil/Quiz result integration only; do not refactor mechanics.
- `app/src/main/assets/quality-content-v0168.js` — Unown result adapter and remove ownership of Poké Ball Drop lifecycle once v0.18 adapter is installed.
- `app/src/main/assets/clefairy-flow.js` / `berry-blender-v0164.js` only if their current finish path cannot expose exact awards through `app-v0167.js` without duplication.
- `app/build.gradle`, `README.md`, `CODEX_HANDOVER.md` — release metadata/handover.

**Retain but stop loading visibly**
- `arcade-zones-v0170.js/css`
- `arcade-ditto-v0170.js/css`

---

### Task 1: Shared Arcade Session + Result Contract

**Files:**
- Create: `app/src/main/assets/arcade-session-v0180.js`
- Create: `app/src/main/assets/arcade-session-v0180.css`
- Create: `tests/arcade-session-v0180.test.js`
- Modify: `app/src/main/assets/index.html`

**Interfaces:**
- Consumes: `LuckyDexArcadePlatform.dailyClaimAvailable(gameId)` and existing awarded result shape `{coinsAwarded, itemAwarded}`.
- Produces global `LuckyDexArcadeSession` with:
  - `GAME_RULES: Record<gameId,{run:string,reward:string}>`
  - `ruleFor(gameId) -> {run,reward}`
  - `resultModel({title, metricLabel, metricValue, coinsAwarded, itemAwarded, bestText}) -> object`
  - `mount(gameId, host?)`
  - `update(gameId,{runText?,rewardText?,liveLabel?,liveValue?})`
  - `showResult(gameId,{title,metricLabel,metricValue,coinsAwarded,itemAwarded,bestText,replayLabel,onReplay,onBack})`
  - `hideResult()`
- Later game tasks must call `showResult()` only **after** their award function returns, so displayed coins/items are actual awarded values.

- [ ] **Step 1: Write failing session tests**

Assert:
- every v0.18 visible game ID has non-empty `run` and `reward` strings;
- `resultModel()` formats zero coins without hiding them;
- an item `{key:'berry',amount:2}` is represented explicitly as `+2 Berry`;
- `itemAwarded:null` produces no phantom item;
- calling the completion guard twice for one run cannot create two active results/award callbacks.

- [ ] **Step 2: Run RED**

Run: `node tests/arcade-session-v0180.test.js`

Expected: FAIL because `arcade-session-v0180.js` does not exist.

- [ ] **Step 3: Add shared HTML shell**

In `index.html`, add one hidden `#arcadeResultSheet` with metric, exact coins, item, best status, `PLAY AGAIN`, and venue-back actions; add a reusable `.arcade-session-strip` host inside each visible game shell or a mount target the session module can populate.

- [ ] **Step 4: Implement session module/CSS**

`GAME_RULES` must cover exactly the v0.18 visible games:
`berryPicker`, `headIt`, `tilePuzzle`, `voltorb`, `ballDrop`, `berry`, `clefairy`, `fossil`, `unown`, `quiz`.

Do not include `ditto` or `safari`.

- [ ] **Step 5: Run GREEN and full existing tests**

Run:
```bash
node tests/arcade-session-v0180.test.js
for f in tests/arcade-*-v0170.test.js; do node "$f"; done
pytest -q tests/test_arcade_v0170_static.py tests/test_v01613_static.py
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-session-v0180.* app/src/main/assets/index.html tests/arcade-session-v0180.test.js
git commit -m "feat: add shared arcade session results"
```

---

### Task 2: Continuous World + Dedicated Venue Navigation

**Files:**
- Create: `app/src/main/assets/arcade-world-v0180.js`
- Create: `app/src/main/assets/arcade-world-v0180.css`
- Create: `app/src/main/assets/arcade/venues/amie-garden.webp`
- Create: `app/src/main/assets/arcade/venues/goldenrod-game-corner.webp`
- Create: `app/src/main/assets/arcade/venues/celadon-prize-machine.webp`
- Create: `app/src/main/assets/arcade/venues/lilycove-contest-hall.webp`
- Create: `app/src/main/assets/arcade/venues/moon-stage.webp`
- Create: `app/src/main/assets/arcade/venues/oreburgh-museum.webp`
- Create: `app/src/main/assets/arcade/venues/ruins-of-alph.webp`
- Create: `app/src/main/assets/arcade/venues/indigo-quiz-studio.webp`
- Create: `tests/arcade-world-v0180.test.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/arcade-platform-v0170.js` only for additive venue migration/default if that is cleaner than app migration.

**Interfaces:**
- Consumes: `LuckyDexArcadeSession.GAME_RULES`, legacy `openArcadeGame/closeArcadeGame` launchers, `LuckyDexAmie` until Task 3 replaces it.
- Produces global `LuckyDexArcadeWorld` with:
  - `VENUES: Array<{id,name,description,art,games}>`
  - `venueForGame(gameId) -> venueId|null`
  - `selectedVenue() -> venueId`
  - `selectVenue(venueId,{scroll=true}={}) -> boolean`
  - `openWorld({focusVenueId}={})`
  - `openVenue(venueId) -> boolean`
  - `openGame(gameId) -> boolean`
  - `backFromGame(force=false) -> boolean`
  - `backFromVenue() -> boolean`
- State adds `state.arcade.lastArcadeVenue`, preserving `lastArcadeZone` unchanged.

**Exact venue mapping:**
- `amieGarden` -> `berryPicker, headIt, tilePuzzle`
- `goldenrod` -> `voltorb`
- `celadonPrize` -> `ballDrop`
- `lilycoveContest` -> `berry`
- `moonStage` -> `clefairy`
- `oreburghMuseum` -> `fossil`
- `ruinsAlph` -> `unown`
- `indigoQuiz` -> `quiz`

**Legacy migration:** `amie -> amieGarden`, `gameCorner -> goldenrod`, `discovery -> oreburghMuseum`, `performance -> lilycoveContest`; unknown/missing -> `amieGarden`.

- [ ] **Step 1: Write failing world tests**

Assert:
- exactly eight venues and ten unique visible games;
- every visible game maps to one venue;
- `ditto` and `safari` map to `null`;
- every venue `art` path is local, non-emoji metadata, exists on disk, and is non-empty;
- legacy-zone migration returns the exact mapping above;
- selected venue defaults to `amieGarden` when state is absent/invalid;
- Back hierarchy state transitions preserve the selected venue.

- [ ] **Step 2: Run RED**

Run: `node tests/arcade-world-v0180.test.js`

Expected: FAIL because the v0.18 world module/assets do not exist.

- [ ] **Step 3: Create eight landmark assets**

Create coherent sprite/illustration-style local WebP landmarks. They may be replaced later, but v0.18 cannot ship emoji or generic text placeholders. Keep composition readable at phone landmark-card size and do not bake UI labels into the art.

- [ ] **Step 4: Replace the v0.17 visible map/zone shells**

`index.html` must contain separate `#arcadeWorldView` and `#arcadeVenueView` siblings. Venue contents must never be children appended below the world route. Keep `#arcadeLegacyHooks` hidden only for legacy scripts that still require their old `data-game` handlers; remove its Ditto hook.

- [ ] **Step 5: Implement world CSS/JS**

World route uses horizontal overflow + scroll-snap, partially visible neighbouring stops, pointer/touch scrolling, left/right controls and an explicit ENTER action. `‹ WORLD` returns to the same selected landmark. `openGame()` hides both world and venue views before launching a game. Override Android `handleLuckyBack` only after capturing the existing handler.

- [ ] **Step 6: Run GREEN + static navigation checks**

Run:
```bash
node tests/arcade-world-v0180.test.js
pytest -q tests/test_arcade_v0170_static.py
```

Expected: PASS after updating superseded v0.17 map assertions to v0.18 equivalents rather than deleting unrelated coverage.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-world-v0180.* app/src/main/assets/arcade/venues app/src/main/assets/index.html app/src/main/assets/app-v0167.js app/src/main/assets/arcade-platform-v0170.js tests/arcade-world-v0180.test.js tests/test_arcade_v0170_static.py
git commit -m "feat: rebuild arcade as continuous world venues"
```

---

### Task 3: Berry Picker Presentation Rework

**Files:**
- Create/modify: `app/src/main/assets/arcade-amie-v0180.js`
- Create/modify: `app/src/main/assets/arcade-amie-v0180.css`
- Create: `tests/arcade-amie-v0180.test.js`
- Modify: `app/src/main/assets/index.html`

**Interfaces:**
- Consumes: v0.17 `BERRY_CONFIGS`, `berryDeliveryScore`, `berryPayout`, `berryReward`, `LuckyDexArcadePlatform.awardRun`, `LuckyDexArcadeSession.showResult`.
- Produces `LuckyDexAmieV0180` and preserves launcher compatibility via `open(gameId)`, `close(force)`, `activeGame()`.
- Berry mechanics/payout constants remain unchanged from v0.17.

- [ ] **Step 1: Write Berry Picker RED tests**

Assert:
- all three v0.17 `BERRY_CONFIGS` remain byte-equivalent values;
- scene model creates 2/3/4 customers by difficulty;
- customers expose berry request + patience locally;
- rendered source includes berry-tree controls and Pokémon thought-bubble/reaction states (`happy`, `wrong`, `timeout`);
- both pointer drag and tap-berry/tap-Pokémon input paths remain present;
- completion calls `awardRun()` once and passes returned exact result to `LuckyDexArcadeSession.showResult()`.

- [ ] **Step 2: Run RED**

Run: `node tests/arcade-amie-v0180.test.js`

Expected: FAIL on missing v0.18 module/scene behavior.

- [ ] **Step 3: Rebuild Berry Picker markup/CSS**

Make the garden playfield the dominant surface. Place berry controls visually on 2-3 tree/branch clusters; Pokémon customers live in-scene with thought bubbles and local patience rings/bars. Remove the v0.17 four-box HUD and instructional paragraph from active play.

- [ ] **Step 4: Implement reactions and exact result lifecycle**

Correct delivery: short bounce/sparkle + thought-bubble refresh. Wrong berry: local shake/disappointed state, no full-screen interruption. Timeout: disappointed state before request refresh. Guard finish with `run.finished` so timer expiry/last interaction cannot double-award.

- [ ] **Step 5: Run GREEN**

Run:
```bash
node tests/arcade-amie-v0180.test.js
node tests/arcade-amie-v0170.test.js
```

Expected: PASS; v0.17 scoring/payout tests remain green.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-amie-v0180.* app/src/main/assets/index.html tests/arcade-amie-v0180.test.js
git commit -m "feat: polish berry picker garden gameplay"
```

---

### Task 4: Head It Full Rebuild

**Files:**
- Modify: `app/src/main/assets/arcade-amie-v0180.js`
- Modify: `app/src/main/assets/arcade-amie-v0180.css`
- Modify: `tests/arcade-amie-v0180.test.js`
- Modify: `app/src/main/assets/index.html`

**Interfaces:**
- Consumes: existing `headTimingGrade`, `headScore`, `headReward`, `headPayout` semantics where compatible; `LuckyDexArcadeSession` result contract.
- Produces `HEAD_RUN_CONFIGS` and `headFallDuration(mode,index)`.

**Exact v0.18 run configs:**
- Easy: `lanes:2`, `balls:12`, `fallStartMs:1500`, `fallFloorMs:900`, `fallStepMs:50`, `coinCap:70`, `dailyTarget:1200`.
- Normal: `lanes:3`, `balls:18`, `fallStartMs:1250`, `fallFloorMs:650`, `fallStepMs:35`, `coinCap:100`, `dailyTarget:2000`.
- Hard: `lanes:4`, `balls:24`, `fallStartMs:1000`, `fallFloorMs:480`, `fallStepMs:25`, `coinCap:140`, `dailyTarget:2800`.
- Unlimited: `lanes:3`, `balls:null`, `fallStartMs:1150`, `fallFloorMs:420`, `fallStepMs:20`, `missLimit:3`, `coinCap:150`, `dailyTarget:3200`, `dailyStreak:20`.
- Timing grades remain Perfect `abs(offsetMs) <= 90`, Good `<= 220`, otherwise Miss.

- [ ] **Step 1: Extend RED tests**

Assert exact configs; fall duration reaches but never crosses floors; Easy/Normal/Hard finish after exact ball counts; Unlimited finishes on third miss; wrong-lane tap is a miss; a hit cannot be scored twice; `requestAnimationFrame` is the motion driver; finish/RAF cleanup is idempotent; exact awarded result is forwarded to shared results.

- [ ] **Step 2: Run RED**

Run: `node tests/arcade-amie-v0180.test.js`

Expected: new Head It assertions FAIL.

- [ ] **Step 3: Rebuild playfield and animation**

Three/four lane layout uses actual participant sprites, idle movement, one continuous yarn element per active ball, rotation, contact shadow and lane-local impact feedback. RAF position is derived from elapsed time; do not animate with coarse interval jumps.

- [ ] **Step 4: Implement hit/feedback lifecycle**

Tap lane -> head-bump class. Successful hit briefly reverses/deflects yarn and shows Perfect/Good at contact point; misses show short local feedback. Bonus yarn is visually distinct and retains existing bonus-score semantics. Finite games immediately enter result state after the final ball resolves.

- [ ] **Step 5: Run GREEN**

Run: `node tests/arcade-amie-v0180.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-amie-v0180.* app/src/main/assets/index.html tests/arcade-amie-v0180.test.js
git commit -m "feat: rebuild head it gameplay"
```

---

### Task 5: Tile Puzzle Full Rebuild

**Files:**
- Modify: `app/src/main/assets/arcade-amie-v0180.js`
- Modify: `app/src/main/assets/arcade-amie-v0180.css`
- Modify: `tests/arcade-amie-v0180.test.js`
- Modify: `app/src/main/assets/index.html`

**Interfaces:**
- Consumes: v0.17 `TILE_CONFIGS`, `makeSolvablePuzzle`, `isSolvedPuzzle`, `tilePayout`, `tileReward` unchanged.
- Produces:
  - `officialArtworkUrl(participant) -> string`
  - `canSlideTile(board,size,tileIndex) -> boolean`
  - `swipeTargetsEmpty(board,size,tileIndex,dx,dy,threshold=18) -> boolean`
  - `tileCrop(tileValue,size) -> {leftPct,topPct,widthPct,heightPct}`

- [ ] **Step 1: Extend RED tests**

Assert:
- all existing 600 seeded solvability/inverse-replay checks remain;
- crop geometry reconstructs exact rows/columns for 3x3/4x4/5x5 without stretching;
- only a tile adjacent to the empty slot can tap-slide;
- swipe succeeds only when dominant gesture direction points from adjacent tile into empty slot and magnitude >=18 px;
- invalid/non-adjacent gesture leaves board unchanged;
- official artwork URL is used when ID exists, with participant sprite fallback available;
- finish reveals completed image before one exact result award.

- [ ] **Step 2: Run RED**

Run: `node tests/arcade-amie-v0180.test.js`

Expected: new Tile assertions FAIL.

- [ ] **Step 3: Replace Tile Puzzle markup/layout**

One large approximately-square `#tilePuzzleBoard` dominates the game view. Remove the 2x2 stat cards, oversized target card, long instruction copy and dead black space. Keep only difficulty, compact target thumbnail, board and minimal reshuffle/new-puzzle controls.

- [ ] **Step 4: Implement coherent image tiles + gestures**

Use each tile as a clipped window over one shared high-resolution image: inner image width/height `size*100%`; solved row/column offsets are exact tile-size multiples. Pointer Events capture only within board; do not call `preventDefault()` until a recognised horizontal/vertical tile gesture is underway.

- [ ] **Step 5: Implement completion/result**

When solved, lock input, reveal full final image for ~650 ms, then show shared result with elapsed time, moves, exact coins/item and best status. Finish guard prevents duplicate award on final swipe/tap.

- [ ] **Step 6: Run GREEN**

Run: `node tests/arcade-amie-v0180.test.js`

Expected: PASS including all 600 seeded puzzle checks.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-amie-v0180.* app/src/main/assets/index.html tests/arcade-amie-v0180.test.js
git commit -m "feat: rebuild tile puzzle interaction"
```

---

### Task 6: Poké Ball Drop Three-Ball Lifecycle + Exact Winnings

**Files:**
- Create: `app/src/main/assets/arcade-ball-drop-v0180.js`
- Create: `app/src/main/assets/arcade-ball-drop-v0180.css`
- Create: `tests/arcade-ball-drop-v0180.test.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/quality-content-v0168.js` narrowly to relinquish old reset/button/result wiring or expose its physics helpers.
- Modify: `app/src/main/assets/arcade-platform-v0170.js` only if a payout-delta helper is needed.

**Interfaces:**
- Consumes existing v0.17 canvas dimensions, pin physics and slot points `[150,250,400,1000,400,250,150]`; `ballDropPayout()` remains the source of final economy.
- Produces:
  - `payoutDelta(before,after) -> {ordinaryCoins,jackpotCoins,totalCoins}` where `before/after` are `{ordinaryPoints,jackpots}`;
  - `startRun()`, `dropBall()`, `stop()`, `open()` for v0.18 launcher.

- [ ] **Step 1: Write RED tests**

Assert:
- a run starts at Ball 1/3 and never exposes NEW/NEXT ROUND;
- after landing ball 1 or 2, next ball becomes available automatically after landing message;
- after ball 3, drop control stays disabled until result/replay;
- non-jackpot landing text reports the **incremental actual coin delta**, not points as coins;
- jackpot delta explicitly contains 1000 jackpot coins plus any ordinary pin-bonus delta;
- final award calls `awardRun()` once with `ballDropPayout(total).totalCoins`;
- result sheet receives exact returned `coinsAwarded`.

- [ ] **Step 2: Run RED**

Run: `node tests/arcade-ball-drop-v0180.test.js`

Expected: FAIL before adapter exists.

- [ ] **Step 3: Remove obsolete controls and wire v0.18 lifecycle**

Delete visible `#ballDropNewBtn`. Preserve existing aim slider/physics. Ball landing overlay displays points **and** exact coin delta. Balls 1/2 auto-ready; ball 3 calls finish after the landing hold.

- [ ] **Step 4: Run GREEN + v0.17 payout regression**

Run:
```bash
node tests/arcade-ball-drop-v0180.test.js
node tests/arcade-platform-v0170.test.js
```

Expected: PASS, including existing 6%/90 cap and 1000 jackpot tests.

- [ ] **Step 5: Commit**

```bash
git add app/src/main/assets/arcade-ball-drop-v0180.* app/src/main/assets/quality-content-v0168.js app/src/main/assets/arcade-platform-v0170.js app/src/main/assets/index.html tests/arcade-ball-drop-v0180.test.js
git commit -m "fix: make pokeball drop a clear three-ball run"
```

---

### Task 7: Legacy Game Session/Result Integration + Ditto Removal

**Files:**
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/arcade-expansion-v0166.js`
- Modify: `app/src/main/assets/quality-content-v0168.js`
- Modify: `app/src/main/assets/clefairy-flow.js` / `berry-blender-v0164.js` only if required by their current finish ownership.
- Modify: `app/src/main/assets/index.html`
- Modify: `tests/test_arcade_v0180_static.py`

**Interfaces:**
- Consumes `LuckyDexArcadeSession.showResult()` and `LuckyDexArcadeWorld.backFromGame()`.
- Covers visible stable games: `voltorb`, `berry`, `clefairy`, `fossil`, `unown`, `quiz`.
- No changes to their core board/timing/scoring algorithms unless required to surface exact existing payouts.

- [ ] **Step 1: Write static/integration RED tests**

Assert for every visible stable game:
- `GAME_RULES` has run/reward text;
- finish/cash-out path passes an actual awarded coin value into a result path;
- game exit resolves through world/venue hierarchy;
- `ditto` is absent from `VENUES`, visible `data-game`, venue tiles, world text and loaded v0.18 script list;
- old Ditto save keys still exist in migration/default state or are preserved by spread migration;
- `arcade-ditto-v0170.js` and `arcade-zones-v0170.js` are not loaded by `index.html`.

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/test_arcade_v0180_static.py`

Expected: FAIL until legacy finish paths and Ditto visibility are updated.

- [ ] **Step 3: Adapt stable result paths minimally**

Voltorb:
- board clear -> shared result with exact awarded payout and `PLAY AGAIN`;
- cash-out -> shared result with exact awarded payout;
- hitting Voltorb -> result with 0 coins and explicit bank lost.

Berry Blender/Clefairy/Fossil/Unown/Quiz:
- preserve mechanics;
- replace/bridge finish UI so exact awarded coins are shown and replay/back actions are explicit.

Do not duplicate `awardArcadeCoins`/`awardRun` calls in the session layer.

- [ ] **Step 4: Remove visible Ditto entry points**

Remove Ditto game shell from active visible markup if no script requires it; otherwise leave it `hidden` with no launcher. Remove v0.17 Ditto stylesheet/script includes and its legacy hook. Do not delete save fields.

- [ ] **Step 5: Run GREEN**

Run:
```bash
pytest -q tests/test_arcade_v0180_static.py
for f in tests/arcade-*.test.js; do node "$f"; done
```

Expected: PASS. If `arcade-ditto-v0170.test.js` remains, it may still test dormant compatibility logic; it must not prove visibility/launchability.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/app-v0167.js app/src/main/assets/arcade-expansion-v0166.js app/src/main/assets/quality-content-v0168.js app/src/main/assets/clefairy-flow.js app/src/main/assets/berry-blender-v0164.js app/src/main/assets/index.html tests/test_arcade_v0180_static.py
git commit -m "feat: unify arcade results and retire ditto transform"
```

---

### Task 8: v0.18.0 Release Integration, Regression + Package

**Files:**
- Modify: `app/build.gradle`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `README.md`
- Modify: `CODEX_HANDOVER.md`
- Create: `TEST_REPORT_v0.18.0.md`
- Add: `docs/superpowers/specs/2026-10-05-luckydex-v0180-arcade-rework-design.md`
- Add: `docs/superpowers/plans/2026-10-05-luckydex-v0180-arcade-rework-implementation.md`

**Interfaces:** None new. This task freezes script order and verifies the shipped tree.

- [ ] **Step 1: Write/update release static assertions first**

`tests/test_arcade_v0180_static.py` must assert:
- `versionCode 190`, `versionName '0.18.0'`;
- visible build label contains `v0.18.0`;
- build marker is `window.__LUCKYDEX_BUILD='0.18.0-arcade-world-rework';`;
- script order is: app -> platform -> session -> legacy game providers -> v0.18 Amie/Ball Drop -> world last;
- v0.17 zone/Ditto scripts are not loaded;
- all eight venue asset files exist;
- no duplicate HTML IDs;
- every asset JS file passes `node --check`;
- stable keystore SHA/config unchanged.

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/test_arcade_v0180_static.py`

Expected: FAIL on old release metadata/build marker before version bump.

- [ ] **Step 3: Apply release metadata/docs**

Set `versionCode 190`, `versionName '0.18.0'`, build marker above, visible `v0.18.0`. Document v0.18 features and explicitly note GitHub Actions is the authoritative APK compile.

- [ ] **Step 4: Full verification**

Run:
```bash
set -e
for f in tests/arcade-*.test.js; do node "$f"; done
pytest -q
for f in app/src/main/assets/*.js; do node --check "$f"; done
git diff --check
keytool -list -keystore app/luckydex-dev.keystore -storepass luckydex-dev -alias luckydex >/tmp/luckydex-key.txt
sha256sum app/luckydex-dev.keystore
```

Expected:
- every Node Arcade test PASS;
- pytest 0 failures;
- all JS syntax checks exit 0;
- `git diff --check` produces no output;
- keystore list succeeds;
- SHA equals `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.

- [ ] **Step 5: Manual/source-level acceptance pass**

Check against the 12 spec acceptance criteria. In particular verify from markup/source:
- world and venue are separate replacement views;
- no primary landmark emoji;
- every visible game has run/reward metadata;
- no Ditto launcher;
- Ball Drop has no New/Next Round;
- Tile Puzzle board is the dominant game surface.

Record any visual behavior requiring phone confirmation in `TEST_REPORT_v0.18.0.md` rather than claiming it was device-tested locally.

- [ ] **Step 6: Package source**

Create both:
- `LuckyDex_source.zip`
- `LuckyDex_v0.18.0_SOURCE.zip`

Exclude `.git`, `.superpowers`, caches and generated bytecode. Re-open each ZIP with `testzip()` and record SHA-256.

- [ ] **Step 7: Commit**

```bash
git add app/build.gradle app/src/main/assets README.md CODEX_HANDOVER.md TEST_REPORT_v0.18.0.md docs tests
git commit -m "release: LuckyDex v0.18.0 arcade rework"
```

- [ ] **Step 8: GitHub Actions build after user uploads root ZIP**

The existing workflow must build `:app:assembleDebug` successfully and produce the debug APK. This is the authoritative Android compile/signing verification because the local harness may not have Gradle/Android SDK available.

---

## Plan Self-Review

- **Spec coverage:** all world/venue/session requirements, four targeted game changes, Ditto removal, economy compatibility, save/signing compatibility and release checks map to Tasks 1-8.
- **Sequencing:** shared session contract precedes every game; world exists before legacy integration; Amie game rebuilds share one module and tests; Ball Drop stays isolated from Amie; final task only integrates/releases.
- **Interface consistency:** game result flow always ends at `LuckyDexArcadeSession.showResult`; award calculation remains upstream in platform/game logic; world owns navigation only.
- **Scope discipline:** Pokémon Dash, Slots/Roulette, Beach, Jump, Stadium, Dream World and Ditto replacement remain deferred.
- **Risk:** landmark visual quality, motion feel, and phone geometry still require on-device judgement after static/logic verification; the report must call this out explicitly.
