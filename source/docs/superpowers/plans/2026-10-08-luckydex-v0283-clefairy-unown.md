# LuckyDex v0.28.3 Clefairy Pace + Unown Decoder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LuckyDex v0.28.3 with a materially faster Clefairy Match and a replayable three-mode Unown Decoder that dynamically uses all 1,025 existing National Pokédex species plus a large curated Pokémon-world term pool.

**Architecture:** Keep Clefairy’s existing game loop and scene ownership, but compress the non-idle scene timeline without changing its relative motion/effect choreography. Split Unown’s pure data/normalisation/weighting/scoring logic into a new `arcade-unown-data.js` module, while `arcade-unown.js` remains the DOM/timer/lifecycle owner and consumes `LuckyDexAdventureSpecies.byId` at runtime. Preserve the existing Arcade session/reward path and finish with one release-identity/package gate for both changes.

**Tech Stack:** Vanilla JavaScript, HTML/CSS, Android WebView assets, Node `assert` tests (`*.cjs`), Playwright where available, Gradle Android metadata.

**Spec:** `docs/superpowers/specs/2026-10-08-luckydex-v0283-clefairy-unown-design.md`

## Global Constraints

- Android application ID remains exactly `com.example.luckydex`.
- Release version is exactly `0.28.3`; Android `versionCode` is exactly `283`.
- No new Clefairy art and no changes to Clefairy sequence generation, banking rules, reward routing, save data, venue ownership, or Moon Stage presentation.
- Unown uses only the existing A–Z glyph sprites under `arcade/sprites/actors/unown/`; no word-specific images and no online word/API fetches.
- `adventure/adventure-species.js` remains the sole full Pokémon species source; do not copy the 1,025-name list into Decoder code.
- Unown rewards continue through the existing `awardArcadeCoins(..., 'unown')` / Arcade session result path; do not add a new currency or reward service.
- Existing save fields, including `state.arcade.bestUnown` and any old `state.arcade.unownPerfect`, must remain load-safe; v0.28.3 must not require destructive migration.
- Use test-first red/green cycles for every behavior change; preserve lifecycle cancellation on game close/reopen.

## Review Focus

- **Normalised-name collisions:** `Nidoran♀` and `Nidoran♂` both decode to `NIDORAN`; Easy choices must never present two answers with the same normalised key, and a run must not immediately serve an indistinguishable collision after its twin.
- **Punctuation/diacritics:** names such as `Flabébé`, `Farfetch’d`, `Mr. Mime`, `Type: Null`, `Ho-Oh`, and gender-symbol names must use only A–Z glyph assets while accepting sensible typed variants and revealing canonical display text.
- **Long/multi-word mobile layout:** long answers such as `Brute Bonnet`, `Iron Valiant`, and similarly long curated terms must wrap/scale in the chamber without horizontal page overflow on a narrow phone viewport.
- **Android keyboard submission:** Enter/IME action in Normal/Hard must call the same answer path as `DECODE`, prevent double submission, and refocus the input when the next typed round begins.
- **Lifecycle races:** closing/reopening Unown during a timer, reveal delay, or between-round state must cancel intervals/timeouts so stale callbacks cannot score, advance, focus, or show a result in a new session.

---

### Task 1: Compress the Clefairy action timeline without changing choreography

**Files:**
- Modify: `app/src/main/assets/clefairy-scene.js:5-173`
- Modify: `app/src/main/assets/clefairy-memory.js:38-46`
- Create: `tests/v0283-clefairy-pace.test.cjs`

**Interfaces:**
- Consumes: existing `LuckyDexClefairy.durationFor(action)`, `motionAt(action, ms, from)`, `effectsAt(...)`, and scene `play(action)` contract.
- Produces: `LuckyDexClefairy.durationFor('star'|'song'|'moon'|'spin')` values `968`, `1129`, `1065`, and `935` ms respectively (the current source durations divided by a 1.55 playback-speed factor, rounded); idle remains `220` ms. `clefairy-memory.js` uses a `100` ms playback gap.

- [ ] **Step 1: Write the failing Clefairy pacing test**

Create `tests/v0283-clefairy-pace.test.cjs` asserting:
- `durationFor('idle') === 220`.
- `durationFor('star') === 968`, `song === 1129`, `moon === 1065`, `spin === 935`.
- End-of-action `motionAt(action, durationFor(action))` returns to the same neutral/end pose envelope as the old timeline rather than truncating at an intermediate old keyframe.
- `clefairy-memory.js` contains an inter-symbol `delay(100, control.signal)` and no remaining `delay(220, control.signal)`.
- Miss/reset delay still derives from `LuckyDexClefairy.durationFor(...)` rather than a new hardcoded old-duration constant.

- [ ] **Step 2: Run the Clefairy pacing test and verify RED**

Run: `node tests/v0283-clefairy-pace.test.cjs`

Expected: FAIL on the old `1500/1750/1650/1450` durations and `220` ms playback gap.

- [ ] **Step 3: Add source-timeline scaling in `clefairy-scene.js`**

Keep the existing choreography keyframes/effect timings as the source timeline. Add an internal playback-speed factor of `1.55`, expose only the shortened durations via `durationFor`, and map real playback elapsed time onto the original per-action timeline before evaluating motion/effects. Do not shorten idle breathing. Ensure `play()` ends at the shortened real duration while motion/effects receive the mapped source-timeline time.

- [ ] **Step 4: Reduce Clefairy’s inter-symbol pause**

In `clefairy-memory.js`, change only the playback gap after each completed action from `220` ms to `100` ms. Leave sequence generation, player tap handling, bank growth, cash-out, and abort-controller logic unchanged; player taps automatically inherit the faster scene duration through `playAction()`.

- [ ] **Step 5: Run Clefairy unit/regression checks and verify GREEN**

Run:
- `node tests/v0283-clefairy-pace.test.cjs`
- `node tests/restore-regressions.test.cjs`
- `node tests/v022-targeted.test.cjs`

Expected: all PASS.

- [ ] **Step 6: Commit the Clefairy pacing slice**

```bash
git add app/src/main/assets/clefairy-scene.js app/src/main/assets/clefairy-memory.js tests/v0283-clefairy-pace.test.cjs
git commit -m "feat: speed up Clefairy Match playback"
```

---

### Task 2: Build the pure Unown content, glyph, normalisation, weighting, and scoring module

**Files:**
- Create: `app/src/main/assets/arcade-unown-data.js`
- Create: `tests/v0283-unown-data.test.cjs`
- Modify later in Task 3: `app/src/main/assets/index.html` to load the module before `arcade-unown.js`

**Interfaces:**
- Consumes: a caller-supplied `speciesById` object shaped like `LuckyDexAdventureSpecies.byId` (`{id,name,types,...}`).
- Produces global/CommonJS API `LuckyDexUnownData` with:
  - `MODE_CONFIG` — `easy:{durationMs:15000,multiplier:1}`, `normal:{durationMs:18000,multiplier:1.3}`, `hard:{durationMs:10000,multiplier:1.65}`.
  - `CURATED_ENTRIES` — at least 120 text-only entries covering `REGION`, `TYPE`, `ITEM`, `MOVE`, `LOCATION`, `BATTLE`, and `TRAINING`/collecting terminology; each has stable `key`, canonical `answer`, `category`, and Easy/Normal `clue`.
  - `normaliseAnswer(value) -> string` — Unicode NFKD/diacritic folding, uppercasing, then retaining only ASCII `A-Z0-9`.
  - `glyphWords(answer) -> string[]` — split on whitespace, fold accents, remove non-`A-Z`, discard empty words; e.g. `HO-OH -> ['HOOH']`, `MR. MIME -> ['MR','MIME']`, `FARFETCH'D -> ['FARFETCHD']`, both Nidoran gender names -> `['NIDORAN']`.
  - `buildPokemonEntries(speciesById) -> Entry[]` — exactly one entry per National Dex object, key `pokemon:<id>`, category `POKÉMON`, canonical species name, and clue `<TYPE[/TYPE]> Pokémon` derived from existing `types`.
  - `buildPool(speciesById) -> Entry[]` — Pokémon entries plus curated entries; no duplicated full species list.
  - `complexityFor(entry) -> number` — glyph letter count plus `3` per additional word.
  - `weightFor(entry, mode, streak) -> number` — Hard returns `1`; Easy target complexity is `6 + min(streak,10)*0.6` with penalty slope `0.55`; Normal target is `9 + min(streak,10)*0.5` with penalty slope `0.25`; curated entries marked `common:true` multiply weight by `2.5` on Easy and `1.4` on Normal. Weight is always positive so nothing is excluded.
  - `pickEntry(pool,{mode,streak,usedKeys,usedNormalised,rng}) -> Entry|null` — weighted pick excluding used stable keys and, where possible, answers whose `normaliseAnswer` is already used; if only normalised collisions remain, stable-key uniqueness still wins; if the entire pool is exhausted, caller may clear used sets and retry.
  - `buildChoices(entry,pool,count,rng) -> Entry[]` — includes the correct entry, prefers same-category distractors, returns exactly `count` where pool size permits, and never includes two choices with the same normalised answer.
  - `scoreFor(entry,{mode,streak,remainingFraction}) -> {points:number,coins:number}` — `base = 120 + glyphLetterCount*16 + extraWords*30`; multiply by mode multiplier, `1 + min(streak,15)*0.06`, and `0.75 + clamp(remainingFraction,0,1)*0.5`; `points = round(result)`, `coins = max(30, round(points*0.35))`.

- [ ] **Step 1: Write the failing Unown data/helper tests**

Create `tests/v0283-unown-data.test.cjs` covering:
- `buildPokemonEntries(require('../app/src/main/assets/adventure/adventure-species.js').byId).length === 1025` and IDs `1`/`1025` map to the existing canonical names.
- `CURATED_ENTRIES.length >= 120` and required category coverage.
- `glyphWords` punctuation/space examples from the spec plus `Flabébé`, `Type: Null`, curly-apostrophe `Farfetch’d`, and both Nidoran genders.
- `normaliseAnswer('Mr. Mime') === normaliseAnswer('mr-mime')`, accent/case variants match, punctuation is ignored.
- Easy/Normal short-entry weights exceed long-entry weights at streak `0`, the gap narrows at higher streak, and Hard weights are equal.
- `buildChoices` does not place both gendered Nidoran entries together because their normalised keys collide.
- `scoreFor` yields Hard > Normal > Easy for identical entry/time/streak and longer/multi-word entries outscore shorter ones.

- [ ] **Step 2: Run the helper tests and verify RED**

Run: `node tests/v0283-unown-data.test.cjs`

Expected: FAIL because `arcade-unown-data.js` does not exist.

- [ ] **Step 3: Implement `arcade-unown-data.js`**

Use a small UMD-style wrapper matching other reusable assets: export through `module.exports` in Node and `window.LuckyDexUnownData` in the app. Keep the 1,025 Pokémon external by accepting `speciesById`; only curated Pokémon-world terms and small weighting metadata live here. Implement the exact interfaces/constants above.

- [ ] **Step 4: Run the helper tests and verify GREEN**

Run: `node tests/v0283-unown-data.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit the pure Decoder data slice**

```bash
git add app/src/main/assets/arcade-unown-data.js tests/v0283-unown-data.test.cjs
git commit -m "feat: add dynamic Unown Decoder content model"
```

---

### Task 3: Replace the Decoder panel with three-mode responsive UI and canonical reveal states

**Files:**
- Modify: `app/src/main/assets/index.html:238-246,410-431`
- Modify: `app/src/main/assets/arcade.css:89-97`
- Create: `tests/v0283-unown-ui.test.cjs`
- Create: `tests/v0283-unown-browser.test.cjs` (Playwright; run when dependency/browser support is available)

**Interfaces:**
- Consumes: `LuckyDexUnownData.MODE_CONFIG`, `glyphWords(entry.answer)`, and canonical `entry.answer`.
- Produces DOM IDs/classes consumed by Task 4:
  - difficulty buttons `data-unown-difficulty="easy|normal|hard"`;
  - `#unownStreak`, `#unownScore`, `#unownCategory`, `#unownClue`, `#unownGlyphs`, `#unownTimerFill`;
  - Easy-only `#unownAnswers`;
  - typed-mode form `#unownTypedForm` with `#unownInput` and `#unownDecodeBtn`;
  - `#unownStartBtn` used as `START DECODER` before a run and `NEXT MESSAGE` between successful rounds;
  - `#unownCashBtn`, disabled until the first correct answer and only actionable in the between-round state.

- [ ] **Step 1: Write the failing static UI contract test**

Create `tests/v0283-unown-ui.test.cjs` asserting the HTML contains all three mode buttons, typed form/input/DECODE button, streak/category/cash-out elements, and loads `arcade-unown-data.js` after `adventure/adventure-species.js` but before `arcade-unown.js`. Assert obsolete fixed-run copy such as `Message ... /5` is absent from the Decoder panel.

Also assert CSS contains:
- mutually exclusive Easy-choice vs typed-answer visibility hooks/classes;
- a decoded/reveal state that crossfades/hides Unown images and displays canonical Latin word text;
- wrapping/max-width rules that keep the glyph chamber and typed controls within `100%` width on mobile.

- [ ] **Step 2: Run the static UI test and verify RED**

Run: `node tests/v0283-unown-ui.test.cjs`

Expected: FAIL on missing Normal mode, typed form, cash-out controls, helper script, and reveal CSS.

- [ ] **Step 3: Update Decoder markup and script order in `index.html`**

Replace the fixed `Message n/5` header with streak/score UI. Add the three tabs, category label, Easy answer container, Normal/Hard form, start/next button, and cash-out button using the exact IDs above. Load `arcade-unown-data.js` after `adventure/adventure-species.js` and before `arcade-unown.js`.

- [ ] **Step 4: Update Decoder CSS for modes, reveal, and narrow screens**

Retain the Ruins of Alph chamber background. Make glyph words flex-wrap/scale without horizontal page overflow. Structure each word so its Unown glyph row and canonical Latin text occupy the same word slot; before reveal, canonical text is visually hidden, and `.decoded`/`.failed` state crossfades to the canonical word. Add typed-form styles with full-width input + prominent `DECODE`, and keep Easy answer buttons in the existing two-column style.

- [ ] **Step 5: Write the Playwright mobile-layout/reveal test**

Create `tests/v0283-unown-browser.test.cjs` covering a narrow Android-like viewport and asserting:
- all three tabs fit without page-level horizontal overflow;
- switching to Normal shows the input/DECODE controls and hides Easy choices;
- a long multi-word fixture can render/reveal without `document.documentElement.scrollWidth > innerWidth`;
- revealed canonical text is visible while glyph images are visually retired.

The test may use a deterministic debug hook added in Task 4 for fixture injection; until Task 4 exists, this test is expected to remain RED/skipped from the non-browser gate.

- [ ] **Step 6: Run the static UI test and verify GREEN**

Run: `node tests/v0283-unown-ui.test.cjs`

Expected: PASS.

- [ ] **Step 7: Commit the Decoder UI shell**

```bash
git add app/src/main/assets/index.html app/src/main/assets/arcade.css tests/v0283-unown-ui.test.cjs tests/v0283-unown-browser.test.cjs
git commit -m "feat: rebuild Unown Decoder interface"
```

---

### Task 4: Rewrite the Decoder run loop as typed/multiple-choice push-your-luck streak gameplay

**Files:**
- Modify: `app/src/main/assets/arcade-unown.js:1-63` (replace legacy fixed-five-question implementation)
- Modify if needed only for test hooks: `tests/v0283-unown-browser.test.cjs`
- Create: `tests/v0283-unown-flow.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexUnownData`, `LuckyDexAdventureSpecies.byId`, global `state/save/vibrate/awardArcadeCoins`, and `LuckyDexArcadeSession.showResult`.
- Produces: `window.LuckyDexUnown = {open,close,start,cashOut,state:()=>game}` plus debug-only deterministic hooks under `window.LuckyDexDebug` for browser tests (fixture round injection and current-state readback; no production UI dependency).
- Internal run state: `{mode,active,phase,streak,score,bank,usedKeys:Set,usedNormalised:Set,current,token}` where `phase` is one of `ready|question|between|finished`.

- [ ] **Step 1: Write the failing non-browser flow/source contract test**

Create `tests/v0283-unown-flow.test.cjs` asserting the rewritten owner:
- consumes `LuckyDexUnownData.buildPool(LuckyDexAdventureSpecies.byId)` rather than a local 24-word array;
- recognises `easy`, `normal`, and `hard`;
- uses Easy choice submission and the shared `submitAnswer(...)` path for typed form submit/Enter;
- exposes cash-out and uses the existing `awardArcadeCoins(...,'unown')` reward path;
- no longer has `round>=5`, `/5 DECODED`, or the old two-mode `6 choices` hard flow;
- stops/clears interval and managed timeouts on `close`/reset.

- [ ] **Step 2: Run the flow contract test and verify RED**

Run: `node tests/v0283-unown-flow.test.cjs`

Expected: FAIL against the v0.28.2 fixed-five-question owner.

- [ ] **Step 3: Implement mode selection, pool construction, and round start**

On reset/open, build the pool from `LuckyDexUnownData.buildPool(window.LuckyDexAdventureSpecies.byId)`, keep the selected mode, clear used sets, and render the idle `UNOWN` glyph prompt. `start()` begins a fresh run. `beginQuestion()` picks an unused entry with `pickEntry`, records both stable key and normalised key, applies the mode timer, renders category/clue visibility (`Easy`: clue; `Normal`: clue when present; `Hard`: category only/no clue), and renders either four Easy choices or the typed form.

If every stable key is exhausted, clear both used sets once and continue; never repeat before that exhaustion point.

- [ ] **Step 4: Implement glyph rendering and canonical reveal**

Render only existing A–Z sprite paths from `glyphWords(entry.answer)`. In each word slot also render a hidden canonical Latin word string from the original answer split by spaces. On resolution, set the chamber state to `.decoded` for correct answers or `.failed` for wrong/timeout and expose canonical punctuation/diacritics exactly as stored in `entry.answer`. Keep reveal duration at `650` ms.

- [ ] **Step 5: Implement Easy and typed submission through one answer path**

Easy option buttons call `submitAnswer(canonicalChoice)`. `#unownTypedForm` handles `submit` with `preventDefault()` and calls the same `submitAnswer(input.value)`, so Android Enter/IME and the `DECODE` button are identical. Disable choices/input immediately on resolution to prevent double submission. Compare with `normaliseAnswer` rather than raw strings.

When a typed question begins, focus `#unownInput` in `requestAnimationFrame` only if the run token/current phase still match, so stale focus callbacks cannot fire after close/reopen.

- [ ] **Step 6: Implement score, bank, between-round decision, failure, and cash-out**

For a correct answer, call `scoreFor(entry,{mode,streak,remainingFraction})`, then increment streak, score, and bank. After the `650` ms reveal, enter `phase='between'`, show `NEXT MESSAGE`, enable `CASH OUT`, and do not run a timer. `NEXT MESSAGE` begins the next risk-bearing challenge.

On wrong answer or timeout, reveal for `650` ms and end the run, awarding `round(bank*0.20)` consolation coins (zero if no bank), while recording the run’s score in `state.arcade.bestUnown` when it is a new high. On cash-out, award the full current bank. Leave any existing `state.arcade.unownPerfect` value untouched rather than deleting/reinterpreting old saves.

Result copy must distinguish `CASHED OUT` from `STREAK ENDED`, display streak + mode + score, and route through `LuckyDexArcadeSession.showResult('unown', ...)` with replay/back callbacks.

- [ ] **Step 7: Add lifecycle-safe timer/timeout ownership**

Maintain one timer interval plus a managed timeout set and incrementing run token. `stop()`/`close()` clear interval, clear all managed timeouts, invalidate the token, disable active phase, and prevent stale reveal/focus/result callbacks from mutating a later run.

- [ ] **Step 8: Add deterministic debug hooks for browser tests**

Under `window.LuckyDexDebug`, expose only test/debug helpers needed to force a known Decoder entry/mode and inspect current phase without bypassing the normal render/submit path. Do not expose reward mutation helpers.

- [ ] **Step 9: Run flow, data, and browser tests**

Run:
- `node tests/v0283-unown-data.test.cjs`
- `node tests/v0283-unown-ui.test.cjs`
- `node tests/v0283-unown-flow.test.cjs`
- `node tests/v0283-unown-browser.test.cjs` when Playwright is installed/usable.

Expected: all runnable tests PASS. Browser test must specifically cover the Review Focus items for long mobile layout and Android-style form submission.

- [ ] **Step 10: Add/verify lifecycle race coverage**

Extend the browser test (or existing `tests/recovery-lifecycle.cjs` if that is the cleaner owner) to start an Unown question, close/switch games during timer/reveal, wait beyond `650` ms and the question duration, and assert no stale Decoder result/advance/focus appears. Reopen Decoder and verify a clean `ready` state.

- [ ] **Step 11: Commit the Decoder gameplay slice**

```bash
git add app/src/main/assets/arcade-unown.js tests/v0283-unown-flow.test.cjs tests/v0283-unown-browser.test.cjs tests/recovery-lifecycle.cjs
git commit -m "feat: overhaul Unown Decoder streak gameplay"
```

(If `tests/recovery-lifecycle.cjs` does not need modification because the dedicated browser test fully covers the race, omit it from `git add`.)

---

### Task 5: Regression-check Arcade ownership and update compatibility

**Files:**
- Create: `tests/v0283-arcade-regression.test.cjs`
- Read/verify unchanged ownership: `app/src/main/assets/arcade-world.js`
- Read/verify unchanged session registration: `tests/arcade-session.test.cjs`

**Interfaces:**
- Consumes: current `LuckyDexArcadeWorld` game ownership and `LuckyDexArcadeSession` game IDs.
- Produces: regression proof that Unown remains owned by Ruins of Alph and Clefairy by Moon Stage with no venue/world-map rewrite.

- [ ] **Step 1: Write the regression test**

Assert:
- `arcade-world.js` still maps Ruins of Alph to `games:['unown']` and `unown:()=>window.LuckyDexUnown`.
- Clefairy owner remains `window.LuckyDexClefairyGame` and its venue mapping is unchanged.
- `tests/arcade-session.test.cjs` expectations still include both `clefairy` and `unown`.
- no new Unown image folder or word-specific image references are introduced by v0.28.3; all Decoder sprite URLs continue to resolve under the existing Unown A–Z directory.

- [ ] **Step 2: Run regression tests**

Run:
- `node tests/v0283-arcade-regression.test.cjs`
- `node tests/arcade-session.test.cjs`
- `node tests/restore-regressions.test.cjs`

Expected: PASS.

- [ ] **Step 3: Commit the regression gate**

```bash
git add tests/v0283-arcade-regression.test.cjs
git commit -m "test: lock v0.28.3 arcade ownership"
```

---

### Task 6: Bump release identity, run the complete verification gate, and package v0.28.3

**Files:**
- Modify: `app/build.gradle:11-12`
- Modify: `package.json:3`
- Modify: `package-lock.json:3,9`
- Modify: `app/src/main/assets/index.html:33,50`
- Modify: `app/src/main/assets/app-v0167.js:1541`
- Create: `tests/v0283-release.test.cjs`
- Create: `TEST_REPORT_v0.28.3.md`
- Generate outside source tree: `/mnt/data/LuckyDex_source_v0.28.3.zip`

**Interfaces:**
- Consumes: all completed v0.28.3 code/tests.
- Produces: update-compatible Android/source release with versionName/package version/build marker `0.28.3` and versionCode `283`.

- [ ] **Step 1: Write the failing release-identity test**

Create `tests/v0283-release.test.cjs` asserting:
- `applicationId 'com.example.luckydex'`.
- `versionCode 283`, `versionName '0.28.3'`.
- `package.json`, `package-lock.json` root/package versions equal `0.28.3`.
- both visible version strings in `index.html` are `v0.28.3`.
- `window.__LUCKYDEX_BUILD='0.28.3'`.
- `arcade-unown-data.js` is loaded before `arcade-unown.js`.

- [ ] **Step 2: Run release test and verify RED**

Run: `node tests/v0283-release.test.cjs`

Expected: FAIL while repository identity is still v0.28.2.

- [ ] **Step 3: Apply exact v0.28.3 identity changes**

Set Gradle/package/lock/visible/runtime version fields to `0.28.3` and Android `versionCode` to `283`; do not change `applicationId`, namespace, keystore/signing identity, minSdk, or targetSdk.

- [ ] **Step 4: Run syntax and targeted v0.28.3 tests**

Run:
```bash
node --check app/src/main/assets/clefairy-scene.js
node --check app/src/main/assets/clefairy-memory.js
node --check app/src/main/assets/arcade-unown-data.js
node --check app/src/main/assets/arcade-unown.js
node tests/v0283-clefairy-pace.test.cjs
node tests/v0283-unown-data.test.cjs
node tests/v0283-unown-ui.test.cjs
node tests/v0283-unown-flow.test.cjs
node tests/v0283-arcade-regression.test.cjs
node tests/v0283-release.test.cjs
```

Expected: all PASS.

- [ ] **Step 5: Run the full project verification available in the environment**

First run `npm test`. If Playwright/module/browser support is unavailable in the execution environment, record the exact failing browser test/dependency error, then run every non-browser `tests/*.cjs` program individually plus these offline audits:

```bash
python3 scripts/fetch_arcade_v0200_assets.py --check
python3 scripts/verify_v0223_venues.py
python3 scripts/verify_adventure_assets.py
python3 scripts/verify_fossil_museum_v0250_assets.py
```

Also run `node tests/recovery-lifecycle.cjs` and `node tests/v0283-unown-browser.test.cjs` when Playwright is available. Do not report unavailable browser tests as passing.

- [ ] **Step 6: Verify Android build/update identity if Gradle tooling is available**

Run the project’s existing debug build path (for example `./gradlew assembleDebug`) only if the environment has the Android/Gradle toolchain. Confirm the generated APK uses the unchanged application ID and permanent signer. If the toolchain is unavailable, state that explicitly in the report rather than substituting a weaker claim.

- [ ] **Step 7: Write `TEST_REPORT_v0.28.3.md`**

Record the exact commands, pass/fail counts, any environmental skips, release identity, Clefairy timing values, Decoder pool counts (1,025 Pokémon + curated count), and browser/build availability. Mention any pre-existing unrelated failures by exact test name.

- [ ] **Step 8: Commit the release identity/report**

```bash
git add app/build.gradle package.json package-lock.json app/src/main/assets/index.html app/src/main/assets/app-v0167.js tests/v0283-release.test.cjs TEST_REPORT_v0.28.3.md
git commit -m "release: LuckyDex v0.28.3"
```

- [ ] **Step 9: Package the versioned source ZIP**

Create `/mnt/data/LuckyDex_source_v0.28.3.zip` from the source root, excluding transient dependency/build/cache directories (`node_modules`, `.gradle`, `app/build`, temporary screenshots/output) while retaining source, tests, docs, assets, Gradle metadata, and the permanent project keystore exactly as the existing source ZIP does. Compute SHA-256 and verify the ZIP can be listed/extracted before handing it off for the user’s Termux rename-to-`LuckyDex_source.zip` workflow.

---

## Self-Review Notes

- **Spec coverage:** Clefairy speed/gap, all three Decoder modes, all 1,025 species, large curated term pool, runtime glyph composition, punctuation normalisation, length weighting, canonical reveal, typed keyboard flow, streak/cash-out, reward routing, lifecycle cancellation, save compatibility, venue ownership, and v0.28.3 identity are each assigned to a task.
- **Step scan:** Each implementation step names a single file-level behavior and exact interface/value; no task depends on an undefined helper.
- **Type/name consistency:** `LuckyDexUnownData`, `MODE_CONFIG`, `normaliseAnswer`, `glyphWords`, `buildPokemonEntries`, `buildPool`, `weightFor`, `pickEntry`, `buildChoices`, and `scoreFor` use the same names across Tasks 2–4.
- **Review Focus coverage:** normalised collisions are tested in Task 2; punctuation/diacritics in Task 2 + reveal in Task 4; mobile overflow in Task 3 browser coverage; Android Enter/focus and lifecycle races in Task 4 browser coverage.
- **Proportion:** Pure logic is isolated to keep the DOM owner smaller/testable; no broad Arcade/world-map refactor is included.
