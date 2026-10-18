# LuckyDex v0.40.13 Sleeves, Customise & Achievement Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a durable global card-sleeve cosmetics system, Profile → Customise UI, retroactive cosmetic rewards, and 30 new achievements including 10 hidden secrets without breaking existing saves or reward flows.

**Architecture:** Keep cosmetics separate from Achievements. A CommonJS/browser cosmetics core owns the sleeve registry, normalized cosmetics state, unlock/equip rules, reconciliation and shared card-back markup; Profile Customise and existing card-back surfaces consume that API. Achievement definitions live in a v0.40.13 expansion module and may reference sleeve IDs as additive rewards; event-only achievements use a small v0.40.13 telemetry branch rather than ad-hoc hidden state in individual games.

**Tech Stack:** Vanilla JavaScript/HTML/CSS, Android WebView assets, Node `node:test` CommonJS tests, existing LuckyDex save model and build/version tooling.

**Spec:** `docs/superpowers/specs/2026-10-13-luckydex-v0413-sleeves-achievements-design.md`

## Global Constraints

- Baseline is LuckyDex `0.40.12`; release target is `0.40.13` / Android `versionCode 4013`.
- Exactly one global active sleeve; no per-deck or per-mode sleeve selection.
- Sleeves are permanent unlocks; the default sleeve is always unlocked and cannot be removed.
- Sleeve rewards are additive to existing coins/dust/tickets/cards/fixed products.
- Retroactivity uses only durable evidence already present in the save; never invent historical completion.
- Undiscovered secret achievements/sleeves render as `???` and must not leak true names, artwork or requirements.
- Sleeve artwork must be packaged locally. No runtime remote URLs in the cosmetics catalogue.
- Cosmetics errors must never block save loading, Profile, pack opening or Trade.
- Existing protected files/functions, Adventure, Arcade, collection, pack, Trade, reward and signing behavior remain preserved unless this plan explicitly changes them.
- Current v0.40.12 source contains no player-visible “Developer Tools” screen. Implement the test helper as developer-only API (`LuckyDexCosmeticsV0413.devUnlockAll`) and expose a UI button only if an existing debug/developer host is discovered during execution; do not create a public debug menu solely for this helper.

## Review Focus

1. **Malformed/legacy cosmetics state** — loading `null`, arrays, duplicate IDs or an unknown active sleeve must repair to a valid default state without changing unrelated save data. Task 1 pins this.
2. **Secret metadata leakage** — All/Locked/category browsing must not reveal secret sleeve art/name/requirement before discovery. Task 3 pins this.
3. **Reward replay on upgrade** — already-claimed achievements that gain sleeve rewards in v0.40.13 must grant the sleeve once, with no duplicate coins/items or repeated summary on reload. Task 5 pins this.
4. **Broken/missing sleeve asset** — pack and Trade card backs must fall back to the built-in default visual rather than show a broken image or throw. Task 4 pins this.
5. **Imported save/reset path** — import and reset must normalize cosmetics/telemetry just like normal startup and must not retain another save’s active sleeve accidentally. Task 6 pins this.

---

## File Structure

### Create

- `app/src/main/assets/cosmetics-core-v0413.js` — pure registry/state/unlock/equip/reconciliation/shared-card-back API.
- `app/src/main/assets/cosmetics-catalog-v0413.js` — 30 stable sleeve definitions and reward-source metadata.
- `app/src/main/assets/cosmetics-customise-v0413.js` — Profile → Customise renderer, filters, detail/equip interactions.
- `app/src/main/assets/cosmetics-v0413.css` — Customise screen and reusable sleeve/card-back presentation styles.
- `app/src/main/assets/achievements-expansion-v0413.js` — 30 new achievement definitions and helper progress functions.
- `app/src/main/assets/achievement-telemetry-v0413.js` — small normalized event/flag store for conditions first trackable in v0.40.13.
- `app/src/main/assets/cosmetics/sleeves/*.webp` — 30 locally packaged sleeve artworks, matching catalogue IDs.
- `docs/COSMETICS_SOURCES_v0413.md` — asset provenance/creation note; distinguish sourced Pokémon/TCG references from LuckyDex-original art.
- `tests/v0413-cosmetics-core.test.cjs`
- `tests/v0413-cosmetics-assets.test.cjs`
- `tests/v0413-customise-ui.test.cjs`
- `tests/v0413-card-backs.test.cjs`
- `tests/v0413-achievements.test.cjs`
- `tests/v0413-reconciliation.test.cjs`
- `tests/v0413-release.test.cjs`
- `TEST_REPORT_v0.40.13.md`

### Modify

- `app/src/main/assets/app-v0167.js:107-190` — default/migrated state, startup reconciliation, import/reset normalization, cosmetics bridge install.
- `app/src/main/assets/app-v0167.js:702-742` — reward text/claim bridge and Profile rendering hooks.
- `app/src/main/assets/app-v0167.js:767` — Profile subview event wiring.
- `app/src/main/assets/achievements-v0341.js:189-231` — merge v0.40.13 definitions; additive sleeve reward grant; discovered-secret presentation.
- `app/src/main/assets/index.html:551-565` — Customise Profile card and Customise subview.
- `app/src/main/assets/index.html:610-685` — catalogue/core load before app; Customise/achievement-expansion/telemetry scripts load in dependency-safe order after their prerequisites.
- `app/src/main/assets/pack-opening-v0160.js:315,331` — shared active-sleeve markup for both fallback and cinematic card backs.
- `app/src/main/assets/pack-opening-v0160.css:12-17` — delegate card-back art to shared sleeve styles while preserving flip geometry.
- `app/src/main/assets/trade-v0163.js:614-619` — `fxCardBack()` consumes shared active-sleeve markup.
- `app/src/main/assets/trade-v0163.css` — shared sleeve image fills Trade back without changing 3D animation geometry.
- `app/src/main/assets/arcade-classics.js:37-38` — record Voltorb gift-cleared/gift-lost telemetry only at the final board outcome.
- `app/src/main/assets/arcade-amie.js:178-209` — record Golden Berry perfect telemetry only when a delivered Golden Berry run finishes with zero misses.
- `app/src/main/assets/adventure/adventure-wild-hunt.js:64-65` — track per-fight ball attempts, first-throw captures and one-HP wild-battle victories.
- `app/src/main/assets/adventure/adventure-regional-ui.js:32` — increment the Regional Adventure fight’s capture-throw counter for each ball attempt.
- `app/src/main/assets/adventure/adventure-regional-engine.js:33` — record first-throw captures and one-HP Regional Adventure victories at battle settlement.
- pack completion integration in `app/src/main/assets/pack-flow-v0165.js` — record God Pack/no-new-cards telemetry after the committed pack is known.
- `package.json`, `package-lock.json`, `app/build.gradle`, `README.md` — v0.40.13 release identity and notes.

---

### Task 1: Cosmetics core, save shape and fail-safe normalization

**Files:**
- Create: `app/src/main/assets/cosmetics-core-v0413.js`
- Create: `app/src/main/assets/cosmetics-catalog-v0413.js`
- Modify: `app/src/main/assets/app-v0167.js:107-190`
- Modify: `app/src/main/assets/index.html:610-645`
- Test: `tests/v0413-cosmetics-core.test.cjs`

**Interfaces:**
- Produces `window.LuckyDexCosmeticsV0413` / CommonJS API with:
  - `DEFAULT_SLEEVE_ID === 'luckydex-default'`
  - `normaliseCosmetics(raw, registry?) -> {unlockedSleeves:string[], activeSleeve:string, discoveredSecrets:string[], claimedCosmeticRewards:string[]}`
  - `ensureState(state) -> cosmeticsState`
  - `unlockSleeve(state, id, claimToken?) -> {ok:boolean, changed:boolean, id:string}`
  - `equipSleeve(state, id) -> {ok:boolean, changed:boolean, reason?:string}`
  - `activeSleeve(state) -> sleeveEntry`
  - `discoverSecret(state, secretId) -> boolean`
  - `isDiscovered(state, secretId) -> boolean`
  - `installBridge({getState, save, showToast, onChange})`
- Later tasks consume these exact names.

- [ ] **Step 1: Write failing core-state tests**

Assert in `tests/v0413-cosmetics-core.test.cjs` that:
- missing cosmetics state normalizes to the default sleeve unlocked/active;
- malformed arrays and duplicate IDs are deduplicated;
- an unknown active sleeve becomes `luckydex-default`;
- `unlockSleeve()` is idempotent and rejects unknown IDs;
- `equipSleeve()` accepts owned known sleeves and rejects locked/unknown sleeves without mutation;
- `discoverSecret()` persists a stable secret ID once;
- `ensureState()` mutates only `state.cosmetics` and leaves a sentinel unrelated branch byte-for-byte equivalent.

- [ ] **Step 2: Run the core test and confirm RED**

Run: `node --test tests/v0413-cosmetics-core.test.cjs`
Expected: FAIL because `cosmetics-core-v0413.js` does not exist.

- [ ] **Step 3: Implement the pure cosmetics core and minimal catalogue shell**

Create `cosmetics-catalog-v0413.js` with the 30 stable IDs in the catalogue table below and a browser/CommonJS export. At this step each entry may point to its final local path even before assets are added. Implement the core API exactly as listed above, with no DOM dependency in pure state functions.

- [ ] **Step 4: Integrate default/migrated save shape and runtime load order**

In `index.html`, load `cosmetics-catalog-v0413.js` then `cosmetics-core-v0413.js` before `app-v0167.js`. In `app-v0167.js`:
- add default `cosmetics` and `achievementTelemetryV0413` branches;
- merge/normalize them in `loadState()`;
- call `LuckyDexCosmeticsV0413.ensureState(migrated)` before return;
- keep `saveVersion` unchanged unless the project’s existing migration convention requires a bump; do not use the app save version as the release version.

- [ ] **Step 5: Run tests GREEN plus legacy load-state checks**

Run:
`node --test tests/v0413-cosmetics-core.test.cjs tests/v0404-regressions.test.cjs tests/v0412-release.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit when executing in a git worktree**

```bash
git add app/src/main/assets/cosmetics-core-v0413.js app/src/main/assets/cosmetics-catalog-v0413.js app/src/main/assets/app-v0167.js app/src/main/assets/index.html tests/v0413-cosmetics-core.test.cjs
git commit -m "feat: add LuckyDex sleeve cosmetics core"
```

### Task 2: Package the initial 30-sleeve catalogue

**Files:**
- Create: `app/src/main/assets/cosmetics/sleeves/*.webp`
- Modify: `app/src/main/assets/cosmetics-catalog-v0413.js`
- Create: `docs/COSMETICS_SOURCES_v0413.md`
- Test: `tests/v0413-cosmetics-assets.test.cjs`

**Interfaces:**
- Catalogue entries expose `{id,name,artPath,category,tier,unlockText,hidden,sourceAchievementId?,sourceEventId?}`.
- `artPath` is always app-relative under `cosmetics/sleeves/` and never `http:`/`https:`.

- [ ] **Step 1: Write failing asset/catalogue integrity tests**

Assert:
- exactly 30 unique catalogue IDs from the table below;
- every `artPath` exists and is non-empty;
- no `artPath` is remote, `data:`, or absolute filesystem path;
- `luckydex-default` exists and is non-secret;
- every hidden sleeve has `hidden:true` and no public unlock text exposed by catalogue presentation helper before discovery;
- all source achievement IDs referenced by sleeves are unique per reward binding unless explicitly shared.

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/v0413-cosmetics-assets.test.cjs`
Expected: FAIL on missing artwork files/incomplete entries.

- [ ] **Step 3: Add the 30 local artworks and provenance note**

Use locally packaged WebP files. Prefer authentic/reference-derived Pokémon/TCG/TCGP sleeve art where a stable source is available; when an exact official asset cannot be sourced cleanly, create a LuckyDex-original design rather than mislabeling invented art as official. Keep artwork visually readable at phone scale and avoid transparent padding that makes sleeves look undersized.

- [ ] **Step 4: Finish catalogue metadata and categories**

Use categories `luckydex`, `pokemon`, `tcg`, `tcgp`, `events`, `secrets`; use the exact stable IDs in the catalogue table below. Secret entries keep their true registry metadata internally but presentation APIs must mask it until discovery.

- [ ] **Step 5: Run asset tests GREEN**

Run: `node --test tests/v0413-cosmetics-assets.test.cjs tests/v0258-pack-wrapper.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit when available**

```bash
git add app/src/main/assets/cosmetics app/src/main/assets/cosmetics-catalog-v0413.js docs/COSMETICS_SOURCES_v0413.md tests/v0413-cosmetics-assets.test.cjs
git commit -m "feat: add initial LuckyDex sleeve catalogue"
```

### Task 3: Profile → Customise browser and secret-safe presentation

**Files:**
- Create: `app/src/main/assets/cosmetics-customise-v0413.js`
- Create: `app/src/main/assets/cosmetics-v0413.css`
- Modify: `app/src/main/assets/index.html:551-565,610-685`
- Modify: `app/src/main/assets/app-v0167.js:740-767`
- Test: `tests/v0413-customise-ui.test.cjs`

**Interfaces:**
- `LuckyDexCustomiseV0413.install({getState, save, showToast, escapeHtml, onBack}) -> boolean`
- `LuckyDexCustomiseV0413.render() -> void`
- `LuckyDexCustomiseV0413.show() -> void`
- `LuckyDexCustomiseV0413.hide() -> void`
- Consumes `LuckyDexCosmeticsV0413.activeSleeve/equipSleeve/isDiscovered` and catalogue entries.

- [ ] **Step 1: Write failing source/UI contract tests**

Assert the HTML/module contract contains:
- Profile card `#customiseSummaryCard` with `#customiseSummaryPreview`, `#customiseSummaryName`;
- subview `#profileCustomiseView` and back button `#customiseBackBtn`;
- ownership filters `all`, `owned`, `locked`;
- category filter control;
- two-column sleeve grid and detail panel hooks;
- masked secret presentation text exactly `???` before discovery;
- no empty future cosmetic tabs.

Add a pure presentation test to the module for:
- owned active → `EQUIPPED`;
- owned inactive → `EQUIP`;
- locked normal → requirement visible;
- undiscovered secret → name/art/requirement masked;
- discovered secret → true metadata visible.

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/v0413-customise-ui.test.cjs`
Expected: FAIL on missing UI/module.

- [ ] **Step 3: Add Profile entry and mobile-first Customise subview**

Place Customise adjacent to Achievements on Profile. Use a two-column catalogue grid, compact ownership/category controls, and a single selected-sleeve detail pane. Do not navigate away from the Profile page; switch subviews like Achievements already does.

- [ ] **Step 4: Wire equip behavior and Profile summary refresh**

Successful equip must call the cosmetics bridge save callback, update the summary card/detail state immediately, and leave all other Profile renderers functional. Direct UI attempts to equip locked sleeves remain disabled and the core still enforces rejection.

- [ ] **Step 5: Run UI contracts and Profile regressions GREEN**

Run: `node --test tests/v0413-customise-ui.test.cjs tests/v0341-bugfix-achievements.test.cjs tests/v0412-release.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit when available**

```bash
git add app/src/main/assets/cosmetics-customise-v0413.js app/src/main/assets/cosmetics-v0413.css app/src/main/assets/index.html app/src/main/assets/app-v0167.js tests/v0413-customise-ui.test.cjs
git commit -m "feat: add Profile sleeve customisation"
```

### Task 4: Shared active sleeve on pack-opening and Trade card backs

**Files:**
- Modify: `app/src/main/assets/cosmetics-core-v0413.js`
- Modify: `app/src/main/assets/pack-opening-v0160.js:315,331`
- Modify: `app/src/main/assets/pack-opening-v0160.css:12-17`
- Modify: `app/src/main/assets/trade-v0163.js:614-619`
- Modify: `app/src/main/assets/trade-v0163.css`
- Test: `tests/v0413-card-backs.test.cjs`

**Interfaces:**
- Add `LuckyDexCosmeticsV0413.cardBackInnerHtml(stateOverride?) -> string`.
- Add `LuckyDexCosmeticsV0413.defaultBackInnerHtml() -> string` for safe fallback.
- Both pack and Trade outer animation wrappers remain owned by their existing modules.

- [ ] **Step 1: Write failing card-back integration tests**

Assert:
- pack fallback reveal uses `cardBackInnerHtml`;
- pack cinematic `.pack-face-back` and `.pack-unrevealed-cover` use the shared helper;
- `trade-v0163.js` `fxCardBack()` uses the same helper;
- helper output contains active sleeve local asset and stable `data-sleeve-id`;
- invalid active ID returns default sleeve markup;
- missing artwork can fall back through an `onerror`/class hook to default presentation without deleting the active selection.

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/v0413-card-backs.test.cjs`
Expected: FAIL because current surfaces hard-code Lucky Dex blue backs.

- [ ] **Step 3: Implement shared card-back inner markup**

Keep the existing back containers and flip transforms. Replace only the inner emblem/text art with shared sleeve markup so animation geometry and reveal timing do not change.

- [ ] **Step 4: Preserve default visual fallback**

Keep the existing Lucky Dex blue/emblem CSS as the fallback layer underneath the sleeve image. A missing/corrupt sleeve art file should expose that fallback rather than a browser broken-image icon.

- [ ] **Step 5: Run card-back plus pack/trade regressions GREEN**

Run:
`node --test tests/v0413-card-backs.test.cjs tests/v0241-pack-layout.test.cjs tests/v0268-pack-ux.test.cjs tests/v024-trade-ui.test.cjs tests/v0270-trade-artwork-recovery.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit when available**

```bash
git add app/src/main/assets/cosmetics-core-v0413.js app/src/main/assets/pack-opening-v0160.js app/src/main/assets/pack-opening-v0160.css app/src/main/assets/trade-v0163.js app/src/main/assets/trade-v0163.css tests/v0413-card-backs.test.cjs
git commit -m "feat: apply global sleeve to card backs"
```

### Task 5: 30 new achievements, 10 secrets, additive sleeve rewards and retroactive reconciliation

**Files:**
- Create: `app/src/main/assets/achievements-expansion-v0413.js`
- Create: `app/src/main/assets/achievement-telemetry-v0413.js`
- Modify: `app/src/main/assets/achievements-v0341.js:189-231`
- Modify: `app/src/main/assets/adventure/adventure-wild-hunt.js:64-65`
- Modify: `app/src/main/assets/adventure/adventure-regional-ui.js:32`
- Modify: `app/src/main/assets/adventure/adventure-regional-engine.js:33`
- Modify: `app/src/main/assets/arcade-classics.js:37-38`
- Modify: `app/src/main/assets/arcade-amie.js:178-209`
- Modify: `app/src/main/assets/pack-flow-v0165.js` at committed-pack completion
- Modify: `app/src/main/assets/app-v0167.js:702-712`
- Test: `tests/v0413-achievements.test.cjs`
- Test: `tests/v0413-reconciliation.test.cjs`

**Interfaces:**
- `LuckyDexAchievementExpansionV0413.build(getState) -> achievement[]`
- `LuckyDexAchievementTelemetryV0413.ensure(state) -> telemetry`
- `LuckyDexAchievementTelemetryV0413.record(state, eventId, payload?) -> boolean`
- `LuckyDexCosmeticsV0413.reconcile(state, achievements) -> {unlockedSleeves:string[], discoveredSecrets:string[], claimTokens:string[]}`
- Achievement reward field for cosmetics is `reward.sleeve` containing a stable sleeve ID.
- A reward claim token is `achievement:<achievementId>:sleeve:<sleeveId>`.

- [ ] **Step 1: Write failing manifest tests for exactly 30 new achievements**

Assert the expansion module produces exactly the 30 IDs in the achievement table below, exactly 10 with `hidden:true`, no duplicate IDs against the existing v0.40.12 catalogue, and all reward sleeve IDs exist in the sleeve catalogue.

- [ ] **Step 2: Write failing reward/reconciliation tests**

Cover:
- claiming a new achievement with `{coins:..., sleeve:'...'}` grants both rewards;
- adding a sleeve to an already-claimed old achievement grants only the sleeve during reconciliation and never re-grants coins/tickets/cards/fixed products;
- running reconciliation twice produces no second unlock or user summary;
- undiscovered secret achievement/sleeve remains masked until its progress is complete/discovered;
- retroactive durable achievements complete from existing fields;
- telemetry-only achievements do not guess historical completion.

- [ ] **Step 3: Run and confirm RED**

Run: `node --test tests/v0413-achievements.test.cjs tests/v0413-reconciliation.test.cjs`
Expected: FAIL because expansion/telemetry/reconciliation do not exist.

- [ ] **Step 4: Implement expansion definitions and helpers**

Merge expansion rows during `achievements-v0341.js` sync after existing core/set achievements, deduplicated by ID. Extend `rewardText()` to append `Sleeve · <name>` only for non-secret presentation. Extend the overridden `claimAchievement()` to grant `reward.sleeve` after existing reward preconditions succeed and before final save/render.

- [ ] **Step 5: Add minimal event telemetry hooks**

Record only these new event conditions:
- `catch:first-throw` when a capture succeeds and `fight.flags.captureThrowsV0413` becomes exactly `1`; increment that counter for every ball attempt in both Wild Hunt and Regional Adventure;
- `battle:one-hp-win` when a terminal Adventure victory has the current `fight.leadKey` member alive at exactly `1` HP; record in both Wild Hunt reward settlement and Regional Adventure settlement;
- `voltorb:gift-cleared` when `voltorb.cleared && voltorb.gift?.revealed` at `finishVoltorb()`;
- `voltorb:gift-lost` when `voltorb.busted && voltorb.gift?.revealed` at `finishVoltorb()`;
- `berry:golden-perfect` when the Golden Berry was delivered and the completed Berry Picker run has `run.misses===0`;
- `pack:god-no-new` when a committed `pack.godPack` run finishes with `pack.cards.every(card=>!card._wasNew)`.

Do not infer any of these for pre-v0.40.13 history.

- [ ] **Step 6: Bind sleeve rewards to existing and new achievements**

Existing achievement sleeve bindings are the catalogue table entries with `sourceAchievementId`. Reconciliation sees an old claimed achievement and creates only the cosmetic claim token. New achievements use `reward.sleeve` directly where specified in the table.

- [ ] **Step 7: Run focused achievement suites GREEN**

Run:
`node --test tests/v0413-achievements.test.cjs tests/v0413-reconciliation.test.cjs tests/v0341-bugfix-achievements.test.cjs tests/v03511-ekans-achievements.test.cjs tests/v0360-dig-state-achievements.test.cjs tests/v0370-magikarp-state-achievements.test.cjs tests/v0380-rock-harden-state-achievements.test.cjs tests/v0390-arcade-achievement-review.test.cjs`
Expected: PASS.

- [ ] **Step 8: Commit when available**

```bash
git add app/src/main/assets/achievements-expansion-v0413.js app/src/main/assets/achievement-telemetry-v0413.js app/src/main/assets/achievements-v0341.js app/src/main/assets/app-v0167.js app/src/main/assets/arcade-classics.js app/src/main/assets/arcade-amie.js app/src/main/assets/pack-flow-v0165.js app/src/main/assets/adventure/adventure-wild-hunt.js app/src/main/assets/adventure/adventure-regional-ui.js app/src/main/assets/adventure/adventure-regional-engine.js tests/v0413-achievements.test.cjs tests/v0413-reconciliation.test.cjs
git commit -m "feat: expand achievements and sleeve rewards"
```

### Task 6: Startup recognition summary, import/reset safety and developer helper

**Files:**
- Modify: `app/src/main/assets/cosmetics-core-v0413.js`
- Modify: `app/src/main/assets/app-v0167.js:144-190,740-780, startup block near 1860+`
- Modify: `app/src/main/assets/cosmetics-customise-v0413.js`
- Test: `tests/v0413-reconciliation.test.cjs`

**Interfaces:**
- `LuckyDexCosmeticsV0413.consumeRecognitionSummary() -> {sleeves:string[], achievements:string[]} | null`
- `LuckyDexCosmeticsV0413.devUnlockAll({persist=false}={}) -> string[]`
- `devUnlockAll({persist:false})` is session/testing-only and must not write save; `persist:true` may be used in explicit development tests only.

- [ ] **Step 1: Extend failing tests for recognition/import/reset/dev helper**

Assert:
- multiple retroactive sleeve grants aggregate into one recognition payload;
- after payload consumption/reload it does not reappear unless new recognition occurred;
- importing a save with missing/malformed cosmetics normalizes it;
- importing a save with a valid active sleeve preserves it;
- reset returns to default-only cosmetics and clears v0.40.13 telemetry;
- `devUnlockAll()` with default `persist:false` exposes all sleeves to rendering for the session without changing serialized state.

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/v0413-reconciliation.test.cjs`
Expected: FAIL on the new summary/import/reset/helper assertions.

- [ ] **Step 3: Implement one compact startup summary**

After achievements are installed and reconciliation is complete, show one toast/banner text beginning `Previous accomplishments recognised` and summarizing counts, not one toast per unlock. Store only durable claim tokens; the transient summary itself must not become permanent save clutter.

- [ ] **Step 4: Normalize import and reset paths**

Ensure `confirmImportSave()` runs the same cosmetics/telemetry normalization before saving/re-rendering. Reset uses `cloneDefault()` and therefore returns to default-only cosmetics automatically.

- [ ] **Step 5: Add developer-only helper**

Expose `window.LuckyDexCosmeticsV0413.devUnlockAll`. Because v0.40.12 has no existing Developer Tools UI, do not add a normal Profile/Settings control. If execution discovers an existing hidden developer host not found during planning, attach a button there only.

- [ ] **Step 6: Run tests GREEN**

Run: `node --test tests/v0413-reconciliation.test.cjs tests/v0413-cosmetics-core.test.cjs tests/v0413-customise-ui.test.cjs`
Expected: PASS.

- [ ] **Step 7: Commit when available**

```bash
git add app/src/main/assets/cosmetics-core-v0413.js app/src/main/assets/cosmetics-customise-v0413.js app/src/main/assets/app-v0167.js tests/v0413-reconciliation.test.cjs
git commit -m "feat: reconcile prior sleeve rewards safely"
```

### Task 7: Integration hardening and cross-surface preservation

**Files:**
- Test: `tests/v0413-card-backs.test.cjs`
- Test: `tests/v0413-customise-ui.test.cjs`
- Test: `tests/v0413-achievements.test.cjs`
- Modify only implementation files required by genuine failures.

**Interfaces:**
- No new public interface. This task verifies Tasks 1–6 together.

- [ ] **Step 1: Add integration assertions before fixing anything**

Pin these cross-feature cases:
- equip sleeve A → pack and Trade both resolve sleeve A;
- equip sleeve B → both resolve B without reload;
- corrupt active ID → both resolve default while Customise remains usable;
- undiscovered secret sleeve never appears under a real name/art in All/Locked/category paths;
- an achievement claim that awards a sleeve updates Customise/Profile immediately;
- a previously claimed achievement reconciles sleeve ownership without changing profile currency totals.

- [ ] **Step 2: Run focused integration suites**

Run:
`node --test tests/v0413-cosmetics-core.test.cjs tests/v0413-cosmetics-assets.test.cjs tests/v0413-customise-ui.test.cjs tests/v0413-card-backs.test.cjs tests/v0413-achievements.test.cjs tests/v0413-reconciliation.test.cjs`
Expected: PASS after only root-cause fixes.

- [ ] **Step 3: Run preservation and high-risk regressions**

Run:
`node --test tests/adventure3-preservation.test.cjs tests/adventure3-shared-functions.test.cjs tests/v0340-preservation.test.cjs tests/v024-trade-ui.test.cjs tests/v0270-trade-artwork-recovery.test.cjs tests/v0341-bugfix-achievements.test.cjs tests/v0411-release.test.cjs tests/v0412-voltorb-gift.test.cjs tests/v0412-release.test.cjs`
Expected: PASS. Browser/Playwright-blocked tests remain reported separately rather than counted as passing.

- [ ] **Step 4: Syntax-check every changed/new JS file**

Run `node --check` across `cosmetics-*-v0413.js`, `achievement*-v0413.js`, and every modified JS file.
Expected: exit 0.

- [ ] **Step 5: Commit when available**

```bash
git add tests app/src/main/assets
git commit -m "test: harden LuckyDex cosmetics integration"
```

### Task 8: Release identity, report, final ZIP and fresh packaged-source verification

**Files:**
- Create: `tests/v0413-release.test.cjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/build.gradle`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `README.md`
- Create: `TEST_REPORT_v0.40.13.md`
- Produce: `/mnt/data/LuckyDex_source_v0.40.13.zip`

**Interfaces:**
- Release identity must be consistent everywhere: package `0.40.13`, Android `versionCode 4013`, `versionName '0.40.13'`, build user agent `LuckyDex-asset-builder/0.40.13`, `window.__LUCKYDEX_BUILD='0.40.13'`, visible HTML `v0.40.13`.

- [ ] **Step 1: Write failing release identity test**

Assert all release markers above plus required script/style inclusions for cosmetics/achievement expansion.

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/v0413-release.test.cjs`
Expected: FAIL while package remains `0.40.12`.

- [ ] **Step 3: Bump release identity and README**

Update only release markers and v0.40.13 release notes. Do not change signing identity/configuration.

- [ ] **Step 4: Run focused final suite**

Run all v0.40.13 tests plus v0.40.11/v0.40.12 release/regression tests.
Expected: PASS.

- [ ] **Step 5: Classify the full test inventory and run every runnable non-browser program**

Use the same environment classification method as v0.40.11/v0.40.12. Report runnable programs, passed tests/subtests, genuine failures, and browser/Playwright-blocked programs separately. Zero genuine failures are allowed.

- [ ] **Step 6: Run asset/preservation checks**

At minimum:
- `tests/adventure3-preservation.test.cjs`
- `tests/adventure3-shared-functions.test.cjs`
- `tests/v0340-preservation.test.cjs`
- Arcade Dash asset/course checks
- Fossil asset audits
- Rock Harden asset integrity
- any existing Python scene/asset pixel checks still runnable
- cosmetics asset integrity test

Expected: PASS.

- [ ] **Step 7: Build the source ZIP excluding generated build/cache directories**

Package the source root so `package.json` is at ZIP root. Exclude `.git`, Gradle caches/build outputs and temporary verification directories; include docs/spec/plan/report/tests and all local sleeve artwork.

- [ ] **Step 8: Extract the final ZIP to a fresh directory and repeat release/focused/full runnable verification from that extraction**

Do not declare the release complete based only on the working tree. Run `unzip -t` on the final ZIP and test the extracted copy.

- [ ] **Step 9: Finish `TEST_REPORT_v0.40.13.md` with exact fresh evidence**

Record:
- focused result;
- full runnable result;
- blocked-browser list/count;
- preservation results;
- syntax/ZIP integrity;
- SHA256 of final ZIP;
- manual phone-test checklist.

- [ ] **Step 10: Commit/tag only if operating inside the user’s git checkout and explicitly authorized**

Do not push or publish from this execution environment unless the user explicitly asks.

---

## Initial sleeve catalogue — exact stable IDs

| ID | Category | Availability / source |
| --- | --- | --- |
| `luckydex-default` | luckydex | Always unlocked; mandatory fallback |
| `luckydex-midnight` | luckydex | Always unlocked |
| `luckydex-cream` | luckydex | Always unlocked |
| `luckydex-pixel` | luckydex | Always unlocked |
| `kanto-red` | pokemon | Existing `regional_kanto` claimed/completed |
| `johto-gold` | pokemon | Existing `regional_johto` |
| `hoenn-emerald` | pokemon | Existing `regional_hoenn` |
| `shiny-charm` | pokemon | Existing `shiny_25` |
| `kanto-dex` | pokemon | Existing `dex_gen_1` |
| `type-wheel` | pokemon | New `v0413_types_all_18` |
| `eras` | pokemon | New `v0413_gens_all_9` |
| `shiny-tour` | pokemon | New `v0413_shiny_gens_3` |
| `tcg-master` | tcg | Existing `sets_tcg_10` |
| `dual-binder` | tcg | New `v0413_dual_set_complete` |
| `sealed-vault` | tcg | New `v0413_sealed_5` |
| `first-ball` | tcg | New `v0413_first_throw` |
| `pocket-master` | tcgp | Existing `sets_tcgp_5` |
| `god-pack` | tcgp | Existing `god_pack_1` |
| `dash-champion` | events | Existing `dash_all_types_gold` |
| `museum-fossil` | events | Existing `museum_exhibits_20` |
| `rock-solid` | events | Existing `rock_harden_all_difficulties` |
| `unown-code` | events | Existing `unown_perfect_5` |
| `link-cable` | events | New `v0413_trade_10` |
| `arcade-pass` | events | New `v0413_arcade_sampler_8` |
| `oak-trio` | secrets | New secret `v0413_secret_kanto_starters` |
| `eevee-spectrum` | secrets | New secret `v0413_secret_eevee_family` |
| `splash-school` | secrets | New secret `v0413_secret_magikarp_6` |
| `voltorb-lost` | secrets | New secret `v0413_secret_voltorb_gift_lost` |
| `golden-recipe` | secrets | New secret `v0413_secret_golden_berry_perfect` |
| `already-got-em` | secrets | New secret `v0413_secret_god_pack_no_new` |

## v0.40.13 achievement manifest — exactly 30 new entries

### Visible progression (10)

| ID | Name | Condition | Reward |
| --- | --- | --- | --- |
| `v0413_trade_1` | First Link | Complete 1 trade (`stats.trades`) | 250 coins |
| `v0413_trade_10` | Link Regular | Complete 10 trades | 700 coins + `link-cable` sleeve |
| `v0413_trade_50` | Trade Network | Complete 50 trades | 1,800 coins + 100 dust |
| `v0413_balls_100` | Pitcher | Throw 100 Poké Balls (`stats.ballsThrown`) | 400 coins |
| `v0413_balls_500` | Veteran Thrower | Throw 500 balls | 1,200 coins + 50 dust |
| `v0413_locations_10` | Road Trip | Visit 10 distinct durable locations (`stats.visitedLocations`) | 500 coins |
| `v0413_locations_25` | Cartographer | Visit 25 distinct locations | 1,250 coins + 1 ticket |
| `v0413_sealed_1` | Sealed Deal | Own at least 1 unopened sealed booster at once | 300 coins |
| `v0413_sealed_5` | Booster Vault | Own at least 5 sealed boosters at once | 800 coins + `sealed-vault` sleeve |
| `v0413_retreats_10` | Back From the Past | Record 10 expedition/past returns (`stats.expeditionRetreats`) | 700 coins |

### Visible challenges (10)

| ID | Name | Condition | Reward |
| --- | --- | --- | --- |
| `v0413_types_all_18` | Type Collector | Owned Pokémon collectively represent all 18 types | 1,200 coins + `type-wheel` sleeve |
| `v0413_gens_all_9` | Across the Eras | Own at least one species from every generation 1–9 | 1,500 coins + `eras` sleeve |
| `v0413_shiny_gens_3` | Shiny Tourist | Own a shiny Pokémon from 3 different generations | 1,000 coins + `shiny-tour` sleeve |
| `v0413_dual_set_complete` | Two Formats, One Binder | Complete ≥1 physical TCG set and ≥1 TCG Pocket set | 1,500 coins + `dual-binder` sleeve |
| `v0413_regional_trio` | Original Circuit | Have Kanto, Johto and Hoenn Regional clears | 2,000 coins + 2 tickets |
| `v0413_arcade_sampler_8` | Game Corner Passport | `state.arcade.records.games` contains at least 8 game keys with a non-empty `recent` history | 1,000 coins + `arcade-pass` sleeve |
| `v0413_one_hp_win` | By a Thread | Record `battle:one-hp-win` from v0.40.13 onward | 750 coins |
| `v0413_first_throw` | First Ball Wonder | Record `catch:first-throw` from v0.40.13 onward | 500 coins + `first-ball` sleeve |
| `v0413_voltorb_gift_clear` | Gift Secured | Reveal a Voltorb mini-gift and then clear that board | 750 coins + 50 dust |
| `v0413_charm_active` | Charmed Life | Have at least 3 Shiny Charm fragments | 900 coins |

### Hidden secrets (10)

| ID | True name | Hidden condition | Reward |
| --- | --- | --- | --- |
| `v0413_secret_kanto_starters` | Oak Would Be Proud | Own Bulbasaur, Charmander and Squirtle | 600 coins + `oak-trio` sleeve |
| `v0413_secret_eevee_family` | Evolutionary Overachiever | Own Eevee plus Vaporeon, Jolteon, Flareon, Espeon, Umbreon, Leafeon, Glaceon and Sylveon | 1,500 coins + `eevee-spectrum` sleeve |
| `v0413_secret_magikarp_6` | School of Splash | Own 6 copies of Magikarp | 500 coins + `splash-school` sleeve |
| `v0413_secret_zubat_10` | Cave Echo | Reach max consecutive Zubat streak 10 | 700 coins |
| `v0413_secret_failed_100` | Maybe Try a Master Ball? | Record 100 failed catches | 800 coins |
| `v0413_secret_big_hits_5` | This Pack Is Ridiculous | Reach 5 high-rarity hits in one pack | 1,500 coins + 1 ticket |
| `v0413_secret_card_copy_100` | Print Factory | Own 100 copies of one card | 1,000 coins + 150 dust |
| `v0413_secret_voltorb_gift_lost` | Should Have Cashed Out | Record `voltorb:gift-lost` | 500 coins + `voltorb-lost` sleeve |
| `v0413_secret_golden_berry_perfect` | Golden Recipe | Deliver a Golden Berry and finish that Berry Picker run with zero misses (`berry:golden-perfect`) | 1,000 coins + `golden-recipe` sleeve |
| `v0413_secret_god_pack_no_new` | Already Got ’Em | Open a committed God Pack where every card was already owned | 1,200 coins + `already-got-em` sleeve |

## Manual phone-test checklist for the eventual release

1. Upgrade a real v0.40.12 save and confirm one compact retroactive-recognition message, not a toast storm.
2. Profile → Customise shows 30 sleeves; All/Owned/Locked and categories work on a phone viewport.
3. Secret sleeves show only `???` until their paired secret is earned.
4. Equip two different sleeves in succession; each immediately changes pack-opening backs and Trade receive backs.
5. Force a bad active sleeve ID through an imported test save; pack and Trade still show the default back and the app stays usable.
6. Use `LuckyDexCosmeticsV0413.devUnlockAll()` during phone testing; verify it does not permanently alter the save unless explicitly invoked with persistence.
7. Claim one new achievement with coins + sleeve and confirm both rewards appear once.
8. Verify an old already-claimed eligible achievement grants only its new sleeve on upgrade, not duplicate currency/items.
9. Trigger at least one telemetry achievement (first-throw catch or Voltorb gift outcome) and one secret.
10. Export/import the save and restart the app; equipped sleeve, unlocks and discovered secrets persist.
