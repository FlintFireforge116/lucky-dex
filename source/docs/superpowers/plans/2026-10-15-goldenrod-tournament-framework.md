# Goldenrod Tournament Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LuckyDex v0.41.0 with one shared Goldenrod Challenge Course tournament system for Pokémon Dash, Power Trial, and Impact Trial, including stat-cap divisions, Division/Type Cups, shared standings/podium/trophies, Dash presentation unification, and a harder-but-readable Impact Trial.

**Architecture:** Add pure shared Goldenrod core/state modules, then expose each existing game through a narrow tournament adapter while preserving each game’s underlying mechanic. A shared Goldenrod controller owns navigation, cup session state, standings, progression, reward reveal, and trophy cabinet; Dash remains a six-racer outdoor game, while Power/Impact return one player result per round and simulate five persistent AI rivals through their adapters.

**Tech Stack:** Vanilla JavaScript UMD/browser globals + CommonJS tests, HTML/CSS, Node `node:test`, Android WebView asset bundle.

**Spec:** `docs/superpowers/specs/2026-10-15-goldenrod-tournament-framework-design.md`

## Global Constraints

- Target release is **v0.41.0**, based on **v0.40.39**.
- Competitive division caps are exactly: Rookie `<=59`, Poké `<=89`, Great `<=119`, Ultra `<=149`, Master unrestricted.
- Division Cups and Type Cups are exactly three rounds with six entrants and points `10 / 6 / 4 / 3 / 2 / 1`.
- Exhibition is unrestricted by stat and retains Easy / Normal / Hard style play where already present.
- Top-three Division Cup finish unlocks the next division; first place records that division’s championship trophy.
- Type Cups unlock for an event after a Rookie Division Cup podium and reuse that event’s unlocked divisions.
- Dash active races remain outdoors; all 18 existing type themes remain available.
- Perfect Impact target completion always yields 100% Harden and zero damage at every division.
- Impact difficulty may tighten precision/tempo but must not return to unreadable target spam.
- Existing saves, Dash legacy league data, exhibition records, Settings rare-event controls, Android identity, offline/local operation, and already-owned rewards must be preserved.
- Rare tournament prizes are settled immediately when earned, stored as presentation receipts only, and never awarded again at cup completion.
- Active cups are session-only in v0.41.0; leaving abandons final cup rewards/progression without revoking already-settled rare prizes.
- Do not use Codex for this implementation unless the user explicitly requests it or direct tooling becomes insufficient.

## Review Focus

1. **Malformed/partial legacy Dash league saves:** normalization must preserve unknown data, ignore invalid progression inputs, and never downgrade migrated trophies.
2. **Exact tournament ties:** standings must resolve deterministically through aggregate event metric, best round placement, then seeded entrant order.
3. **Duplicate callbacks/navigation:** a round, cup completion, trophy, Lucky Coin payout, and rare receipt must each settle once even if UI callbacks fire twice or the player backs out.
4. **Rare prize lifecycle:** a Round 1/2 Golden Target/Hazard prize must remain owned after abandonment and appear exactly once on the final reveal if the cup finishes.
5. **Missing/insufficient event data:** missing future adapters disable their event cards cleanly, and a cup with too few eligible caught Pokémon must still build a legal AI field from species data without violating division/type caps.

---

### Task 1: Shared Tournament Core

**Files:**
- Create: `app/src/main/assets/arcade-goldenrod-core.js`
- Create: `tests/v0410-goldenrod-core.test.cjs`

**Interfaces:**
- Consumes: no browser DOM or save state; pure values only.
- Produces: `window.LuckyDexGoldenrodCore` / CommonJS API with:
  - `DIVISIONS`
  - `POINTS_BY_PLACE`
  - `division(id)`
  - `nextDivision(id)`
  - `isStatEligible(baseStat, divisionId)`
  - `trophyForPlace(place)`
  - `createSeededRng(seed)`
  - `compressedStat(baseStat, {min=20,max=180,floor=.55,ceiling=1})`
  - `createCup({eventId, mode, divisionId, type=null, player, entrants, seed, metricDirection='higher'})`
  - `recordRound(cup, {roundId, results, rareReceipts=[]})`
  - `standings(cup)`
  - `completeCupOnce(cup, fn)`
  - `abandonCup(cup)`

- [ ] **Step 1: Write failing core tests**

Add tests that assert:

```js
assert.equal(core.isStatEligible(59, 'rookie'), true);
assert.equal(core.isStatEligible(60, 'rookie'), false);
assert.equal(core.isStatEligible(89, 'poke'), true);
assert.equal(core.isStatEligible(90, 'poke'), false);
assert.equal(core.isStatEligible(119, 'great'), true);
assert.equal(core.isStatEligible(120, 'great'), false);
assert.equal(core.isStatEligible(149, 'ultra'), true);
assert.equal(core.isStatEligible(999, 'master'), true);
assert.deepEqual([1,2,3,4,5,6].map(core.pointsForPlace ?? (p => core.POINTS_BY_PLACE[p])), [10,6,4,3,2,1]);
```

Also cover: three rounds only, duplicate `roundId` ignored, point accumulation, trophy mapping, deterministic seeded tiebreak, metric-direction handling, `completeCupOnce` idempotence, and `abandonCup` blocking completion.

- [ ] **Step 2: Run core tests and verify RED**

Run: `node --test tests/v0410-goldenrod-core.test.cjs`
Expected: FAIL because `arcade-goldenrod-core.js` does not exist.

- [ ] **Step 3: Implement the pure tournament core**

Use the exact division IDs `rookie`, `poke`, `great`, `ultra`, `master`; display labels may use `POKÉ`. Preserve entrant seed order on cup creation and store per-entrant `points`, `aggregateMetric`, and `places`. Tiebreak order is points desc → aggregate metric according to direction → best single-round place → initial seeded order.

- [ ] **Step 4: Run core tests and verify GREEN**

Run: `node --test tests/v0410-goldenrod-core.test.cjs`
Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add app/src/main/assets/arcade-goldenrod-core.js tests/v0410-goldenrod-core.test.cjs
git commit -m "feat: add Goldenrod tournament core"
```

If the extracted artifact has no `.git`, record the passing command in the v0.41.0 test report instead.

---

### Task 2: Goldenrod Save State and Dash Legacy Migration

**Files:**
- Create: `app/src/main/assets/arcade-goldenrod-state.js`
- Modify: `app/src/main/assets/arcade-platform.js`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/v0410-goldenrod-state.test.cjs`
- Modify: `tests/arcade-platform.test.cjs`
- Modify: `tests/v022-update-compat.test.cjs`
- Modify: `tests/v0250-save-migration.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexGoldenrodCore`, existing `state.arcade.dash.leagueRecords`.
- Produces: `window.LuckyDexGoldenrodState` / CommonJS API:
  - `DEFAULT_EVENT_STATE`
  - `defaultGoldenrodState()`
  - `normalizeGoldenrodState(value, {legacyDash})`
  - `migrateLegacyDash(goldenrod, legacyDash)`
  - `applyCupProgress(eventState, {mode, divisionId, type, finalPlace, trophy})`
  - `trophyRank(medal)`

- [ ] **Step 1: Write failing migration/state tests**

Test the conceptual shape under `state.arcade.goldenrod.version === 1`, with event keys `dash`, `powerTrial`, `impactTrial`. Assert Rookie is initially unlocked and Type Cups initially locked for fresh saves.

Create a legacy Dash fixture with valid and malformed records. Assert exact mapping:

```js
// easy -> poke, normal -> great, hard -> ultra, expert -> master
assert.equal(out.events.dash.typeTrophies.fire.poke, 'bronze');
assert.equal(out.events.dash.typeTrophies.water.great, 'silver');
assert.equal(out.events.dash.typeTrophies.steel.ultra, 'gold');
assert.equal(out.events.dash.unlockedDivision, 'master');
```

Also assert: original `state.arcade.dash.leagueRecords` survives unchanged; malformed medals/unknown difficulties do not grant progression; non-finite score/time cannot poison state; unknown future keys on `goldenrod` survive normalization; existing higher trophy is never downgraded on repeat normalization.

- [ ] **Step 2: Run state tests and verify RED**

Run: `node --test tests/v0410-goldenrod-state.test.cjs tests/arcade-platform.test.cjs tests/v022-update-compat.test.cjs tests/v0250-save-migration.test.cjs`
Expected: new Goldenrod assertions FAIL.

- [ ] **Step 3: Implement Goldenrod state module and platform normalization**

Load `arcade-goldenrod-core.js` then `arcade-goldenrod-state.js` before `arcade-platform.js` in `index.html`. Add `goldenrod` to `ARCADE_DEFAULTS`/`ensureArcadeState` through `normalizeGoldenrodState`; preserve unknown keys with object spreads instead of destructive reconstruction. Update `defaultState.arcade` / raw save migration in `app-v0167.js` so pre-platform imports cannot discard Goldenrod data.

- [ ] **Step 4: Run migration/state tests and verify GREEN**

Run the command from Step 2.
Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add app/src/main/assets/arcade-goldenrod-state.js app/src/main/assets/arcade-platform.js app/src/main/assets/app-v0167.js app/src/main/assets/index.html tests/v0410-goldenrod-state.test.cjs tests/arcade-platform.test.cjs tests/v022-update-compat.test.cjs tests/v0250-save-migration.test.cjs
git commit -m "feat: persist Goldenrod tournament progression"
```

---

### Task 3: Event Adapter Registry and AI Profiles

**Files:**
- Create: `app/src/main/assets/arcade-goldenrod-adapters.js`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/v0410-goldenrod-adapters.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexGoldenrodCore`, `LuckyDexDashConfig`, `LuckyDexPowerTrialCore`, `LuckyDexImpactTrialCore`, `LuckyDexArcadePlatform.challengeParticipants/dashRacers`.
- Produces: `window.LuckyDexGoldenrodAdapters` / CommonJS API:
  - `EVENT_IDS = ['dash','powerTrial','impactTrial']`
  - `get(eventId)` returning an adapter with:
    - `id`, `name`, `statKey`, `metricDirection`
    - `participants()`
    - `eligibility(participant,{mode,divisionId,type}) -> {eligible,reason}`
    - `selectAi({divisionId,type,player,seed,count=5})`
    - `createAiProfile({entrant,divisionId,seed})`
    - `simulateAiRound({entrant,profile,divisionId,roundIndex,seed})`
    - `roundConfig({divisionId,roundIndex,type,seed})`
    - `playerMetric(result)`
    - `formatMetric(metric)`
    - `themeKey({mode,type})`
  - `divisionAiQuality(divisionId)`

- [ ] **Step 1: Write failing adapter tests**

Assert each event uses the correct stat (`speed`, `attack`, `defense`), Exhibition ignores caps, cups enforce exact caps, lower-stat Pokémon may enter higher unlocked divisions, dual types qualify, and over-cap Pokémon are rejected with `reason:'over-cap'`.

For AI selection, provide a species fixture larger than the caught collection and assert exactly five legal rivals are produced even when the player’s caught set has too few candidates; every rival must obey the same division/type cap and never duplicate the player identity.

Seed two cups identically and assert identical AI profiles/results; change seed and assert at least one result changes. AI quality must rise Rookie→Master, but simulated variance remains non-zero at Master.

- [ ] **Step 2: Run adapter tests and verify RED**

Run: `node --test tests/v0410-goldenrod-adapters.test.cjs`
Expected: FAIL because adapter registry does not exist.

- [ ] **Step 3: Implement shared adapters and centralized AI quality**

Use a diminishing-return stat term through `core.compressedStat`. Persistent AI profiles contain `consistency`, `risk`, `mistake`, `peak`, and seeded variance. Use division quality targets `rookie:.38`, `poke:.52`, `great:.66`, `ultra:.80`, `master:.90`; clamp profile attributes so even Master retains a small mistake/variance window.

For Dash, reuse `LuckyDexDashConfig.themeFor(type)` for Type Cups and `normal` for neutral Division Cups. For Power/Impact, type changes theme/opponent filtering only.

- [ ] **Step 4: Run adapter tests and verify GREEN**

Run Step 2 command.
Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add app/src/main/assets/arcade-goldenrod-adapters.js app/src/main/assets/index.html tests/v0410-goldenrod-adapters.test.cjs
git commit -m "feat: add Goldenrod event adapters"
```

---

### Task 4: Shared Goldenrod Shell, Mode Flow, Standings, Podium, and Trophy Cabinet

**Files:**
- Create: `app/src/main/assets/arcade-goldenrod.js`
- Create: `app/src/main/assets/arcade-goldenrod.css`
- Modify: `app/src/main/assets/arcade-world.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/arcade-session.js`
- Create: `tests/v0410-goldenrod-ui.test.cjs`
- Modify: `tests/arcade-session.test.cjs`
- Modify: `tests/v0390-arcade-session-review.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexGoldenrodCore`, `LuckyDexGoldenrodState`, `LuckyDexGoldenrodAdapters`, game APIs from Tasks 5–7, global `state/save/showToast`.
- Produces: `window.LuckyDexGoldenrod` with:
  - `open({eventId=null}={})`
  - `close()`
  - `startExhibition({eventId,difficulty,participantKey})`
  - `startCup({eventId,mode,divisionId,type=null,participantKey})`
  - `acceptRoundResult(result)`
  - `abandonActiveCup()`
  - `renderTrophyCabinet()`
  - `activeCup()`

- [ ] **Step 1: Write failing UI-contract tests**

Assert DOM/contracts for one Challenge Course shell with six event cards, active cards for Dash/Power/Impact, disabled `coming later` cards for the other three, and the flow Event → Mode → Division → Type when required → Pokémon.

Assert the scoreboard has separate `ROUND RESULTS` and `CUP STANDINGS` regions, highlights the player row, shows `ROUND n / 3`, and after Round 3 exposes a three-place podium, trophy, Lucky Coins, rare receipts, unlock text, and trophy-cabinet access.

Assert a missing adapter disables its event card and cannot throw on click.

- [ ] **Step 2: Run UI tests and verify RED**

Run: `node --test tests/v0410-goldenrod-ui.test.cjs tests/arcade-session.test.cjs tests/v0390-arcade-session-review.test.cjs`
Expected: new Goldenrod UI assertions FAIL.

- [ ] **Step 3: Implement the shared shell/controller**

Change the Pokéathlon/Challenge Course world venue so its single facility entry opens `LuckyDexGoldenrod`, while the shell itself renders the six event panels. Keep existing individual game panels as gameplay surfaces. Use an in-memory `activeCup` only; backing out from the shared shell during a cup must require/perform abandon and must not call final completion.

Update session copy for Dash/Power/Impact to describe Exhibition / Division Cup / Type Cup rather than old Quick Race/Type League wording.

- [ ] **Step 4: Run UI/session tests and verify GREEN**

Run Step 2 command.
Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add app/src/main/assets/arcade-goldenrod.js app/src/main/assets/arcade-goldenrod.css app/src/main/assets/arcade-world.js app/src/main/assets/index.html app/src/main/assets/arcade-session.js tests/v0410-goldenrod-ui.test.cjs tests/arcade-session.test.cjs tests/v0390-arcade-session-review.test.cjs
git commit -m "feat: add shared Goldenrod Challenge Course shell"
```

---

### Task 5: Pokémon Dash Tournament Integration and Presentation Rebuild

**Files:**
- Modify: `app/src/main/assets/arcade-dash.js`
- Modify: `app/src/main/assets/arcade-dash-config.js`
- Modify: `app/src/main/assets/arcade-dash-league.js`
- Modify: `app/src/main/assets/arcade-dash.css`
- Modify: `app/src/main/assets/index.html`
- Modify: `tests/arcade-dash-config.test.cjs`
- Modify: `tests/arcade-dash-league.test.cjs`
- Modify: `tests/arcade-dash-league-integration.test.cjs`
- Modify: `tests/arcade-dash-integration.test.cjs`
- Modify: `tests/arcade-dash-ui.test.cjs`
- Create: `tests/v0410-dash-goldenrod.test.cjs`

**Interfaces:**
- Consumes: cup round context from `LuckyDexGoldenrod` and Dash adapter entrant list.
- Produces/extends `window.LuckyDexDash` with:
  - `startGoldenrodRound({cupId,mode,divisionId,type,roundIndex,seed,player,aiEntrants,onComplete})`
  - existing Exhibition/open behavior kept compatible.
  - round completion payload `{eventId:'dash', metric:timeMs, raw:{place,timeMs,results}, rareReceipts:[]}`.

- [ ] **Step 1: Write failing Dash integration tests**

Assert competitive Dash no longer uses old min/max Speed bands, but stat-cap eligibility comes from Goldenrod. Exhibition continues to accept any caught racer.

Assert a neutral Division Cup uses the outdoor normal/Goldenrod route theme; each of the 18 Type Cups resolves its existing theme through `themeFor(type)`; race state still contains six visible racers and retains stamina, sprint, lanes, hazards, boosts, pause/resume.

Assert Dash does not award its old per-race cup payout during a Goldenrod round; only the shared cup controller awards final cup rewards.

- [ ] **Step 2: Run Dash tests and verify RED**

Run: `node --test tests/arcade-dash-config.test.cjs tests/arcade-dash-league.test.cjs tests/arcade-dash-league-integration.test.cjs tests/arcade-dash-integration.test.cjs tests/arcade-dash-ui.test.cjs tests/v0410-dash-goldenrod.test.cjs`
Expected: new tournament assertions FAIL.

- [ ] **Step 3: Adapt Dash without rebuilding race physics**

Map division AI behavior onto existing Dash AI profiles: Rookie≈easy, Poké midpoint easy/normal, Great≈normal, Ultra≈hard, Master≈expert. Remove competitive dependency on `DIFFICULTIES.minSpeed/maxSpeed`; retain those only for archived legacy display/tests if needed for migration. Retire the old standalone Type League menu from the visible Dash shell, but keep `arcade-dash-league.js` as a compatibility/legacy parsing surface until v0.41.0 migration is proven.

Use the shared Goldenrod banner/results around the race; do not move active races indoors.

- [ ] **Step 4: Run Dash tests and verify GREEN**

Run Step 2 command.
Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add app/src/main/assets/arcade-dash.js app/src/main/assets/arcade-dash-config.js app/src/main/assets/arcade-dash-league.js app/src/main/assets/arcade-dash.css app/src/main/assets/index.html tests/arcade-dash-config.test.cjs tests/arcade-dash-league.test.cjs tests/arcade-dash-league-integration.test.cjs tests/arcade-dash-integration.test.cjs tests/arcade-dash-ui.test.cjs tests/v0410-dash-goldenrod.test.cjs
git commit -m "feat: integrate Dash with Goldenrod tournaments"
```

---

### Task 6: Power Trial Tournament Adapter and Golden Target Carry-Through

**Files:**
- Modify: `app/src/main/assets/arcade-power-trial-core.js`
- Modify: `app/src/main/assets/arcade-power-trial.js`
- Modify: `app/src/main/assets/arcade-power-trial.css`
- Modify: `tests/v0431-power-trial.test.cjs`
- Modify: `tests/v0433-power-trial-ui.test.cjs`
- Modify: `tests/v0434-power-trial-polish.test.cjs`
- Modify: `tests/v0435-power-trial-dome.test.cjs`
- Create: `tests/v0410-power-tournament.test.cjs`

**Interfaces:**
- Consumes: shared round context.
- Produces/extends `window.LuckyDexPowerTrial` with `startGoldenrodRound(...)` analogous to Dash and completion payload `{eventId:'powerTrial', metric, raw, rareReceipts}`.
- Core produces `divisionProfile(divisionId, roundIndex)` in addition to existing `difficultyProfile`.

- [ ] **Step 1: Write failing Power tournament tests**

Assert division profiles use these base timing envelopes before round pressure:

```js
rookie: {chargePeakMs:1100,maxChargeMs:2400,impactCycleMs:1550,impactTimeoutMs:4100,thresholdBonus:-5}
poke:   {chargePeakMs:1000,maxChargeMs:2150,impactCycleMs:1380,impactTimeoutMs:3550,thresholdBonus:-2}
great:  {chargePeakMs:900, maxChargeMs:1900,impactCycleMs:1200,impactTimeoutMs:3100,thresholdBonus:0}
ultra:  {chargePeakMs:820, maxChargeMs:1700,impactCycleMs:1050,impactTimeoutMs:2650,thresholdBonus:2}
master: {chargePeakMs:740, maxChargeMs:1500,impactCycleMs:900, impactTimeoutMs:2250,thresholdBonus:5}
```

Round 2 and Round 3 may tighten timing by at most 4% and 8% respectively; thresholds may rise by at most +1/+2 beyond the division base. Attack remains compressed and execution remains the majority influence.

Assert tournament completion suppresses the ordinary Exhibition award/result screen and returns to shared standings. Simulate a Golden Target in Round 1 and assert its guarded prize is awarded immediately, its receipt survives rounds 2/3, and the final controller only displays it.

- [ ] **Step 2: Run Power tests and verify RED**

Run: `node --test tests/v0431-power-trial.test.cjs tests/v0433-power-trial-ui.test.cjs tests/v0434-power-trial-polish.test.cjs tests/v0435-power-trial-dome.test.cjs tests/v0410-power-tournament.test.cjs`
Expected: new tournament assertions FAIL.

- [ ] **Step 3: Implement Power division profiles and tournament callback mode**

Keep Exhibition Easy/Normal/Hard unchanged. In tournament mode, create the run using `divisionProfile`; on finish compute adapter metric from normalized score/execution/clears, settle any Golden Target through the existing rare reward bridge once, and return a receipt without re-awarding it later.

- [ ] **Step 4: Run Power tests and verify GREEN**

Run Step 2 command.
Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add app/src/main/assets/arcade-power-trial-core.js app/src/main/assets/arcade-power-trial.js app/src/main/assets/arcade-power-trial.css tests/v0431-power-trial.test.cjs tests/v0433-power-trial-ui.test.cjs tests/v0434-power-trial-polish.test.cjs tests/v0435-power-trial-dome.test.cjs tests/v0410-power-tournament.test.cjs
git commit -m "feat: add Power Trial tournaments"
```

---

### Task 7: Impact Trial Tournament Scaling and Difficulty Increase

**Files:**
- Modify: `app/src/main/assets/arcade-impact-trial-core.js`
- Modify: `app/src/main/assets/arcade-impact-trial.js`
- Modify: `app/src/main/assets/arcade-impact-trial.css`
- Modify: `tests/v0436-impact-trial.test.cjs`
- Modify: `tests/v0437-impact-harden.test.cjs`
- Modify: `tests/v0438-impact-harden-tuning.test.cjs`
- Modify: `tests/v0439-impact-input-polish.test.cjs`
- Create: `tests/v0410-impact-tournament.test.cjs`

**Interfaces:**
- Consumes: shared round context.
- Produces/extends `window.LuckyDexImpactTrial` with `startGoldenrodRound(...)` and completion payload `{eventId:'impactTrial', metric, raw, rareReceipts}`.
- Core produces `divisionProfile(divisionId, roundIndex)` and target plans carry profile-owned `graceMs`; runtime uses `hitRadiusScale` from that profile.

- [ ] **Step 1: Write failing Impact tournament/difficulty tests**

Pin the division tuning envelope:

```js
rookie: {timeScale:1.08,targetCountScale:.90,targetScale:1.08,damageMultiplier:.95,maxLive:2,barrageMaxLive:3,graceMs:190,hitRadiusScale:1.10}
poke:   {timeScale:1.02,targetCountScale:.96,targetScale:1.03,damageMultiplier:1.00,maxLive:3,barrageMaxLive:3,graceMs:170,hitRadiusScale:1.05}
great:  {timeScale:.96,targetCountScale:1.00,targetScale:1.00,damageMultiplier:1.08,maxLive:3,barrageMaxLive:3,graceMs:145,hitRadiusScale:1.00}
ultra:  {timeScale:.91,targetCountScale:1.04,targetScale:.95,damageMultiplier:1.16,maxLive:3,barrageMaxLive:4,graceMs:120,hitRadiusScale:.94}
master: {timeScale:.86,targetCountScale:1.08,targetScale:.90,damageMultiplier:1.25,maxLive:3,barrageMaxLive:4,graceMs:100,hitRadiusScale:.88}
```

Round 2/3 may tighten `timeScale` by at most another 3%/6% and grace by at most 10/20 ms. Assert lane mode stays capped at 3 simultaneous targets and only barrage may reach 4. Assert falling targets still stop at `LANE_GUARD_Y === 78`; countdown remains `3,2,1,GO`; swipe segment collision still works; targets remain hittable through configured fade grace.

Most importantly, assert for every division and all five hazards:

```js
const result = core.resolveHarden({targetsHit:targetsTotal, targetsTotal, ...});
assert.equal(result.percent, 100);
assert.equal(result.damage, 0);
assert.equal(result.perfect, true);
```

Simulate a Golden Hazard receipt in Round 1 and verify immediate award + final display-only carry-through.

- [ ] **Step 2: Run Impact tests and verify RED**

Run: `node --test tests/v0436-impact-trial.test.cjs tests/v0437-impact-harden.test.cjs tests/v0438-impact-harden-tuning.test.cjs tests/v0439-impact-input-polish.test.cjs tests/v0410-impact-tournament.test.cjs`
Expected: new division-profile assertions FAIL.

- [ ] **Step 3: Implement division scaling without target spam**

Keep Exhibition difficulties intact. Make target-plan spacing derive from each plan’s own grace/max-live values. Runtime swipe/tap radius becomes existing radius × `hitRadiusScale`. Preserve pointer-down registration, segment-path swipe detection, coalesced touch samples, lower guard line, stopping/final-hit window, and fade-hit behavior.

- [ ] **Step 4: Run Impact tests and verify GREEN**

Run Step 2 command.
Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add app/src/main/assets/arcade-impact-trial-core.js app/src/main/assets/arcade-impact-trial.js app/src/main/assets/arcade-impact-trial.css tests/v0436-impact-trial.test.cjs tests/v0437-impact-harden.test.cjs tests/v0438-impact-harden-tuning.test.cjs tests/v0439-impact-input-polish.test.cjs tests/v0410-impact-tournament.test.cjs
git commit -m "feat: add Impact Trial tournaments and division scaling"
```

---

### Task 8: Cup Settlement, Rewards, Records, Trophies, and Achievements

**Files:**
- Modify: `app/src/main/assets/arcade-goldenrod.js`
- Modify: `app/src/main/assets/arcade-goldenrod-state.js`
- Modify: `app/src/main/assets/arcade-records.js`
- Modify: `app/src/main/assets/arcade-records-core.js`
- Modify: `app/src/main/assets/achievements-v0341.js`
- Create: `tests/v0410-goldenrod-settlement.test.cjs`
- Modify: `tests/v0390-arcade-records-core.test.cjs`
- Modify: `tests/v0390-arcade-records-registry.test.cjs`
- Modify: `tests/v0390-arcade-records-state.test.cjs`
- Modify: `tests/v0390-arcade-records-ui.test.cjs`
- Modify: `tests/v0390-arcade-achievement-review.test.cjs`

**Interfaces:**
- Consumes: completed shared cup + existing `LuckyDexArcadePlatform.awardRun` and save/achievement surfaces.
- Produces:
  - `settleCupOnce(cup)` inside Goldenrod controller returning `{finalPlace,trophy,coinsAwarded,unlocks,rareReceipts}`.
  - tournament record keys under `state.arcade.records.games` without overwriting Exhibition personal bests.
  - progression mutations through `LuckyDexGoldenrodState.applyCupProgress` only.

- [ ] **Step 1: Write failing settlement tests**

Assert exact reward table by division and placement, chosen to remain bounded versus existing arcade payouts:

```js
rookie: [240,160,110,70,50,40]
poke:   [300,200,140,90,65,50]
great:  [380,250,175,115,80,60]
ultra:  [480,320,220,145,100,75]
master: [620,410,285,185,125,95]
```

Assert final reward can settle once only. Assert 1st/2nd/3rd grant Gold/Silver/Bronze respectively, top 3 Division Cup unlock next division, first Rookie podium sets `typeCupsUnlocked=true`, and Type Cup wins do not advance division unlocks.

Assert abandonment before Round 3 gives no placement/trophy/cup coins, but an already-awarded rare receipt remains in player inventory and is not rolled back.

Add achievement assertions for these IDs and conditions:
- `goldenrod_first_podium`
- `goldenrod_division_champion`
- `goldenrod_master_champion`
- `goldenrod_type_specialist`
- `goldenrod_speed_master`
- `goldenrod_power_master`
- `goldenrod_iron_wall_master`
- `goldenrod_grand_champion`

Keep existing Impact achievement `impact_trial_hard_clear` / display name `Iron Wall` intact; the new tournament achievement ID must therefore be distinct even if copy is similar.

- [ ] **Step 2: Run settlement/record/achievement tests and verify RED**

Run: `node --test tests/v0410-goldenrod-settlement.test.cjs tests/v0390-arcade-records-core.test.cjs tests/v0390-arcade-records-registry.test.cjs tests/v0390-arcade-records-state.test.cjs tests/v0390-arcade-records-ui.test.cjs tests/v0390-arcade-achievement-review.test.cjs`
Expected: new Goldenrod settlement assertions FAIL.

- [ ] **Step 3: Implement guarded final settlement and tournament records**

Use the core completion guard before any payout. Store compact cup record summaries by event/division (`bestPlace`, `bestPoints`, `bestAggregateMetric`) plus Type Cup best trophy. Do not create unbounded history by Pokémon/type beyond existing recent-history limits.

- [ ] **Step 4: Implement and register tournament achievements**

Achievement progress reads normalized Goldenrod state and must be idempotent. `Goldenrod Grand Champion` requires Gold in Master Division Cup for Dash, Power Trial, and Impact Trial only in v0.41.0.

- [ ] **Step 5: Run settlement/record/achievement tests and verify GREEN**

Run Step 2 command.
Expected: PASS.

- [ ] **Step 6: Commit checkpoint**

```bash
git add app/src/main/assets/arcade-goldenrod.js app/src/main/assets/arcade-goldenrod-state.js app/src/main/assets/arcade-records.js app/src/main/assets/arcade-records-core.js app/src/main/assets/achievements-v0341.js tests/v0410-goldenrod-settlement.test.cjs tests/v0390-arcade-records-core.test.cjs tests/v0390-arcade-records-registry.test.cjs tests/v0390-arcade-records-state.test.cjs tests/v0390-arcade-records-ui.test.cjs tests/v0390-arcade-achievement-review.test.cjs
git commit -m "feat: settle Goldenrod cups and trophies"
```

---

### Task 9: Final Integration, Mobile Layout, Versioning, and Packaging

**Files:**
- Modify: `app/src/main/assets/arcade-goldenrod.css`
- Modify: `app/src/main/assets/arcade-world.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/build.gradle`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `TEST_REPORT_v0.41.0.md`
- Create/modify focused version/integration tests as required by existing current-version assertions.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: packaged `LuckyDex_source_v0.41.0.zip`.

- [ ] **Step 1: Add final integration tests for full flow**

Cover one deterministic three-round Division Cup for each event and one Type Cup path, including event → mode → division → participant → three results → standings → final podium → progression/save. Include direct regression that Exhibition still runs for all three events and accepts over-cap Pokémon.

- [ ] **Step 2: Run all Goldenrod/Dash/Power/Impact focused tests**

Run all `v0410-*`, `arcade-dash-*`, `v0431`–`v0439`, platform/session/records/achievement migration tests.
Expected: PASS.

- [ ] **Step 3: Verify mobile screen contracts**

Check at minimum narrow portrait layouts for: six-event selector, mode/division/type selection, participant picker, Dash shared header + outdoor race, between-round standings, final podium, Trophy Cabinet, and rare reward section. No horizontal clipping; primary action stays reachable; active gameplay surfaces keep their existing touch areas.

- [ ] **Step 4: Bump release identity to v0.41.0**

Set:
- `package.json` / root `package-lock.json`: `0.41.0`
- `app/build.gradle`: `versionCode 4100`, `versionName '0.41.0'`
- `app-v0167.js`: `window.__LUCKYDEX_BUILD='0.41.0'`
- visible footer/title/current-version test expectations to `v0.41.0`.

- [ ] **Step 5: Run syntax and offline asset verification**

Run `node --check` on every changed/new JS file, then:

```bash
python3 scripts/fetch_arcade_v0200_assets.py --check
python3 scripts/verify_v0223_venues.py
python3 scripts/verify_adventure_assets.py
python3 scripts/verify_fossil_museum_v0250_assets.py
```

Expected: all available checks PASS; document any pre-existing checksum/environment limitation without misrepresenting it as a feature failure.

- [ ] **Step 6: Run the broad test command**

Run: `npm test`
Expected: record the exact pass count reached. If Playwright remains unavailable in the environment, report that same environment limitation explicitly and separately from feature tests; do not claim the full suite passed.

- [ ] **Step 7: Write `TEST_REPORT_v0.41.0.md`**

Include feature scope, migration behavior, tournament rules, Impact tuning constants, focused test totals, syntax/assets results, full-suite limitation if any, and known pre-existing issues.

- [ ] **Step 8: Package and integrity-check the source ZIP**

Create `/mnt/data/LuckyDex_source_v0.41.0.zip`, run `unzip -t`, compute SHA-256, and confirm the ZIP contains the spec, implementation plan, new Goldenrod modules/tests, and v0.41.0 test report.

- [ ] **Step 9: Commit/tag checkpoint if Git metadata is available**

```bash
git add .
git commit -m "release: LuckyDex v0.41.0 Goldenrod tournaments"
```

