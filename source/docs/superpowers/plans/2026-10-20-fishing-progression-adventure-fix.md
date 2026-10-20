# Fishing Progression + Adventure Fishing v0.69.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LuckyDex v0.69.0 with authored, progressive Fishing Lodge locations and rod-gated local pools, while simplifying Adventure Fishing to an automatic Gen III-style encounter sequence and fixing Adventure Struggle so it is used only when every move is out of PP.

**Architecture:** Introduce one focused Fishing location-data module that owns region order, spot order, authored species pools, rod minimums, progression targets and exact spot artwork. Keep persistence, migration, encounter rolling and progression updates inside `arcade-fishing-core.js`, with the existing Fishing UI consuming only core APIs rather than duplicating unlock logic. Adventure Fishing remains separate from the Arcade minigame and becomes a small timed state machine that hands successful hooks to the existing regional battle engine.

**Tech Stack:** Existing LuckyDex vanilla JavaScript/CSS/HTML, Node `node:test` regression tests, Android WebView assets, existing Adventure battle engine.

**Spec:** `docs/superpowers/specs/2026-10-20-fishing-progression-adventure-fix-design.md`

## Global Constraints

- Target release is exactly **LuckyDex v0.69.0** with Android **versionCode 6900**.
- No Codex unless the user explicitly requests it or the task is literally impossible without Codex.
- Preserve existing Fishing Book discoveries, specimen sizes, counts, values, junk/treasure discoveries, rods, bait, Fishing Tokens, Lucky Coins, achievements, settings and Developer force flags.
- Migration from v0.68.x must be deterministic and idempotent.
- Only Kanto and its first spot are unlocked on a genuinely fresh Fishing save.
- Each region has exactly four ordered Fishing spots; catching **3 distinct local Pokémon species** at the current spot unlocks the next spot.
- Regions unlock strictly Kanto → Johto → Hoenn → Sinnoh → Unova → Kalos → Alola → Galar → Paldea.
- Every authored spot must have at least one genuinely local Old Rod species.
- Locked regions/spots remain visible but disabled and must state the next requirement without exposing uncaught species names.
- Rod quality gates species within the selected local pool; it never substitutes arbitrary region-wide catches.
- Every named Fishing spot must have explicit water-appropriate scene metadata and a local fallback.
- Adventure Fishing must auto-resolve one cast without `CAST AGAIN`, confirmation `A`, or an indefinite waiting state.
- Adventure Fishing successful hooks must continue through the existing Adventure wild battle/capture engine.
- Struggle is legal only when no known move has PP remaining; a normal move and Struggle must never occur as two actions in one turn.
- Continue using the shared Arcade first-open/ⓘ help and shared records systems.
- Do not claim the complete repository suite passed if Playwright or another environment dependency remains unavailable.
- Every handoff includes the matching Termux commands automatically.

## Review Focus

- **Existing v0.68.x player already has catches scattered across regions:** migration must reconstruct useful unlock progress without deleting history or relocking recorded data into an invalid selected location. Covered in Task 2 migration tests.
- **Direct UI/action dispatch attempts to choose a locked region or spot:** core validation must reject it even if someone bypasses the disabled HTML control. Covered in Task 3 runtime tests.
- **Authored-data mistake leaves a spot with no Old Rod catch or a higher-tier species tagged Old Rod:** catalogue construction must fail tests rather than silently borrowing from another location. Covered in Task 1 data-validation tests.
- **Adventure Fishing screen closes while an automatic outcome timer is pending:** no delayed callback may reopen UI, start a battle, or mutate the save after disposal. Covered in Task 4 lifecycle test.
- **Status-only move with PP versus fully exhausted moves:** Splash must prevent Struggle, but zero PP across all moves must produce exactly one Struggle action. Covered in Task 5 battle tests.

---

### Task 1: Authored Fishing location catalogue

**Files:**
- Create: `app/src/main/assets/arcade-fishing-locations.js`
- Modify: `app/src/main/assets/index.html` (load the new module before `arcade-fishing-core.js`)
- Modify: `app/src/main/assets/arcade-fishing-core.js`
- Test: `tests/v0690-fishing-location-data.test.cjs`

**Interfaces:**
- Produces: `LuckyDexFishingLocations.REGION_ORDER: string[]`
- Produces: `LuckyDexFishingLocations.REGIONS: Record<string, RegionDefinition>`
- Produces: `LuckyDexFishingLocations.buildCatalog(speciesById) -> {regions}`
- Each area returned by `buildCatalog` has `id`, `name`, `region`, `order`, `scene`, `fallbackBackdrop`, `backdropPosition`, `regionalTarget`, and `pool`.
- Each `pool` entry has `speciesId`, `minRod`, `weight`, optional `baitAffinity`, optional `sizeBias`.
- `arcade-fishing-core.js` consumes the catalogue and exposes the same public `buildCatalog(speciesById)` entry point so existing callers do not need to know about the new module.
- Produces: `availablePool(area, rodId) -> PoolEntry[]`; this filters the authored `area.pool` by each entry's `minRod`.
- Existing `rollCatch(...)` must draw Pokémon only from `availablePool(area, rod)`; the old region-wide fallback is removed for authored spots.

- [ ] **Step 1: Write the failing authored-catalogue tests**

Create `tests/v0690-fishing-location-data.test.cjs` with assertions that:
- `REGION_ORDER` is exactly `['kanto','johto','hoenn','sinnoh','unova','kalos','alola','galar','paldea']`;
- each region has exactly four ordered areas with unique IDs;
- every area has an explicit scene, fallback and crop/object-position value;
- every area has a non-empty authored pool;
- every area contains at least one entry with `minRod:'old'`;
- representative Kanto ecology is pinned:
  - Cerulean contains Magikarp (129), Goldeen (118), Psyduck (54), Poliwag (60);
  - Vermilion contains Tentacool (72), Krabby (98), Horsea (116), Shellder (90);
  - Safari Pond contains at least Magikarp/Poliwag/Psyduck and gates Dratini (147) above Old Rod;
  - Seafoam contains Shellder (90) and Seel (86);
- representative evolved species cannot be tagged Old Rod (`61`, `130`, `134`);
- two areas in the same region have materially different species sets;
- Safari Pond uses a water-containing Safari scene mapping rather than the dry Safari centre image.

- [ ] **Step 2: Run the new test and verify it fails**

Run: `node tests/v0690-fishing-location-data.test.cjs`

Expected: FAIL because `arcade-fishing-locations.js` and authored pool entries do not yet exist.

- [ ] **Step 3: Implement `arcade-fishing-locations.js` and route `buildCatalog` through it**

Create the data module with the exact region order and four authored spots per existing region. Move the current `AREA_ART`/round-robin responsibility out of `arcade-fishing-core.js`. Use existing local/canonical LuckyDex assets first; use exact remote canonical maps only with local fallbacks. Store per-entry rod minimums in the authored pool instead of deriving the area list by round robin.

Keep `Core.buildCatalog(speciesById)` as the compatibility façade and make it return area `.species` as the authored species IDs in addition to `.pool`, so older Fishing tests and UI code that read `area.species` continue to work. Add `availablePool(area, rodId)` and route the Pokémon branch of `rollCatch(...)` through it. If an authored spot has no eligible entry for the selected rod, treat that as invalid catalogue data in tests; do not borrow a species from another spot/region.

- [ ] **Step 4: Run authored-catalogue and existing rod/pool tests**

Run:
```bash
node tests/v0690-fishing-location-data.test.cjs
node tests/v0684-fishing-tuning.test.cjs
node tests/v0686-fishing-authentic-art.test.cjs
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/main/assets/arcade-fishing-locations.js app/src/main/assets/arcade-fishing-core.js app/src/main/assets/index.html tests/v0690-fishing-location-data.test.cjs
git commit -m "feat: author Fishing Lodge location pools"
```

---

### Task 2: Fishing progression state, migration and catch credit

**Files:**
- Modify: `app/src/main/assets/arcade-fishing-core.js`
- Test: `tests/v0690-fishing-progression.test.cjs`

**Interfaces:**
- Produces: `ensureProgression(save, catalog) -> progression`
- Produces: `isRegionUnlocked(progression, regionId) -> boolean`
- Produces: `isAreaUnlocked(progression, regionId, areaId) -> boolean`
- Produces: `progressForArea(progression, areaId) -> {uniqueCaught:number,target:number,complete:boolean}`
- Produces: `unlockRequirement(save, catalog, regionId?, areaId?) -> string`
- Produces: `selectRegion(save, catalog, regionId) -> boolean` and `selectArea(save, catalog, areaId) -> boolean`; both reject locked targets without mutating selection.
- Produces: `recordProgressionCatch(save, catalog, area, speciesId) -> {spotUnlocked?:string, regionUnlocked?:string, changed:boolean}`
- `ensureState(save)` preserves existing v0.68.x state and adds `progression` without resetting unrelated fields.
- `recordCatch(...)` calls `recordProgressionCatch` only for successfully landed Pokémon catches, after the Fishing Book entry has been persisted.

- [ ] **Step 1: Write failing progression and migration tests**

Create `tests/v0690-fishing-progression.test.cjs` covering:
- fresh save unlocks only Kanto + Kanto spot 1;
- three distinct local species at spot 1 unlock spot 2;
- duplicate catches do not increment the distinct count;
- catches that are not in that area's authored pool do not count toward that spot;
- completing the fourth spot plus the configured Kanto regional species target unlocks Johto;
- region target comes from catalogue data, not a UI literal;
- upgraded rods/bait/book/token balances survive `ensureState`;
- an existing v0.68.x book is scanned against authored pools and credited deterministically;
- migration runs twice with byte-equivalent progression output;
- an existing `selectedRegion`/`selectedArea` that is now locked is moved to the nearest unlocked valid selection without deleting its book/history.

- [ ] **Step 2: Run the progression test and verify it fails**

Run: `node tests/v0690-fishing-progression.test.cjs`

Expected: FAIL because progression APIs do not exist.

- [ ] **Step 3: Add additive progression state and deterministic migration**

Add the progression object under `save.arcade.fishing.progression`. Preserve all existing v0.68.x top-level Fishing state. Reconstruct species credit from existing book entries by matching caught species against authored area pools in deterministic region/spot order; do not invent additional catch counts.

Use a Set-like unique ID array per spot in persisted JSON; normalize/sort IDs before save so repeated migrations are stable.

- [ ] **Step 4: Credit successful catches and unlock sequentially**

Update `recordCatch` so a landed Pokémon:
1. updates its existing Book/specimen/value records;
2. credits the currently selected authored spot if the species belongs there;
3. unlocks only the immediate next spot after 3 distinct local species;
4. unlocks only the immediate next region after all four spots are open and the regional target is met.

Return unlock metadata from `recordProgressionCatch`; do not make the UI calculate progression itself.

- [ ] **Step 5: Run progression plus existing save/economy tests**

Run:
```bash
node tests/v0690-fishing-progression.test.cjs
node tests/v0680-fishing-core.test.cjs
node tests/v0682-fishing-balance-economy.test.cjs
node tests/v0683-fishing-runtime.test.cjs
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-fishing-core.js tests/v0690-fishing-progression.test.cjs
git commit -m "feat: add Fishing Lodge progression"
```

---

### Task 3: Progression-aware Fishing setup UI

**Files:**
- Modify: `app/src/main/assets/index.html:943-1010`
- Modify: `app/src/main/assets/arcade-fishing.js`
- Modify: `app/src/main/assets/arcade-fishing.css`
- Modify: `app/src/main/assets/arcade-help.js`
- Test: `tests/v0690-fishing-progression-ui.test.cjs`
- Test: `tests/v0690-fishing-progression-runtime.test.cjs`

**Interfaces:**
- Consumes Task 2 APIs from `LuckyDexFishingCore`.
- Setup UI dispatches region/spot selection through a validated helper rather than assigning `selectedRegion`/`selectedArea` directly.
- Produces in UI:
  - visible locked/unlocked region cards in canonical order;
  - four ordered spot cards for the selected unlocked region;
  - spot progress `N / 3 local species` until that spot unlocks the next one;
  - regional completion summary and next-region requirement;
  - current rod-accessible local species count;
  - rod/bait selection only after an unlocked spot is chosen.

- [ ] **Step 1: Write failing static UI tests**

In `v0690-fishing-progression-ui.test.cjs`, assert:
- unrestricted Region/Area `<select>` controls are removed or no longer act as the primary region/spot chooser;
- dedicated region and spot containers exist;
- locked cards have a disabled/locked state and requirement copy area;
- help text says that spots unlock after 3 distinct local species and stronger rods reveal more catches at old spots;
- setup CSS contains explicit locked/unlocked card styling and does not expose uncaught species names.

- [ ] **Step 2: Write failing runtime selection tests**

In `v0690-fishing-progression-runtime.test.cjs`, create a DOM stub and assert:
- fresh open shows Kanto and Cerulean (first spot) as selectable;
- direct click/action dispatch for locked Kanto spot 2 does not change `selectedArea`;
- direct dispatch for Johto while locked does not change `selectedRegion`;
- the UI uses `Core.selectRegion` / `Core.selectArea` instead of assigning selection fields directly;
- after recording the third distinct local catch and rerendering, Kanto spot 2 becomes selectable;
- selecting an unlocked old spot with Super Rod reports a larger rod-accessible local count than Old Rod where the authored pool supports it;
- lock copy contains only counts/place names, not hidden species names.

- [ ] **Step 3: Run both UI tests and verify they fail**

Run:
```bash
node tests/v0690-fishing-progression-ui.test.cjs
node tests/v0690-fishing-progression-runtime.test.cjs
```

Expected: FAIL on the current unrestricted selectors.

- [ ] **Step 4: Replace unrestricted location selectors with progression cards**

Update the setup markup and renderer. Keep rod/bait controls and `START FISHING`. Render locked regions/spots from core progression state. Route click handling through a core unlock check before mutating selection. Keep the current play screen, Angler’s Log, Tackle Shop, wallet and result flow unchanged.

- [ ] **Step 5: Update Fishing help copy**

Revise only the Fishing entry in `arcade-help.js` to describe sequential region/spot progression, 3-distinct-species spot unlocks, revisiting with better rods, and the fact that locked cards never reveal undiscovered species.

- [ ] **Step 6: Run new UI tests plus existing Fishing UX/runtime/book tests**

Run:
```bash
node tests/v0690-fishing-progression-ui.test.cjs
node tests/v0690-fishing-progression-runtime.test.cjs
node tests/v0681-fishing-ux.test.cjs
node tests/v0681-fishing-runtime.test.cjs
node tests/v0681-fishing-book.test.cjs
node tests/v0683-fishing-polish.test.cjs
```

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/index.html app/src/main/assets/arcade-fishing.js app/src/main/assets/arcade-fishing.css app/src/main/assets/arcade-help.js tests/v0690-fishing-progression-ui.test.cjs tests/v0690-fishing-progression-runtime.test.cjs
git commit -m "feat: add Fishing Lodge progression UI"
```

---

### Task 4: Automatic Gen III-style Adventure Fishing flow

**Files:**
- Modify: `app/src/main/assets/adventure/adventure-fishing.js`
- Test: `tests/v0690-adventure-fishing-flow.test.cjs`
- Modify if stale expectations require it: `tests/v0671-fishing-mobile-polish.test.cjs`, `tests/v0672-fishing-gen3-presentation.test.cjs`

**Interfaces:**
- Keeps `open(save, place, options)`, `dispose(silent)`, and `completeOutcome(...)`.
- Adds an internal outcome scheduler owned by the Fishing session; all scheduled callbacks check that their session is still active.
- A cast resolves to exactly one terminal route:
  - no bite → readable message → automatic return/close;
  - bite escape → two-message sequence → automatic return/close;
  - hook → two-message sequence → exactly one `enterFishingWild` handoff.
- No outcome state exposes `CAST AGAIN`, `A`, or another confirmation button.

- [ ] **Step 1: Write failing automatic-flow tests**

Create `tests/v0690-adventure-fishing-flow.test.cjs` with a deterministic fake clock/timer layer and assert:
- no-bite displays `Not even a nibble...` and automatically closes/returns after the configured readable delay;
- escaped bite displays `Oh! A bite!` then `It got away...` and automatically closes;
- successful hook displays `Oh! A bite!` then `A Pokémon's on the hook!`, then calls the existing encounter handoff exactly once;
- controls never contain `CAST AGAIN` or `>A<`/confirmation-A during outcome states;
- closing/disposal before a pending timer fires prevents any later save mutation or battle handoff;
- repeated timer ticks/rendering cannot produce a duplicate battle.

- [ ] **Step 2: Run the new flow test and verify it fails**

Run: `node tests/v0690-adventure-fishing-flow.test.cjs`

Expected: FAIL because the current implementation waits on `CAST AGAIN` / `A`.

- [ ] **Step 3: Replace outcome controls with session-scoped automatic timers**

Keep rod selection and the initial `CAST LINE` control. After cast, hide/disable player outcome controls and progress the message state automatically. Use a single session token/timer registry so `dispose()` cancels pending callbacks and a stale callback cannot hand off a battle after the player leaves.

Successful hook must call the existing `completeOutcome`/`LuckyDexRegionalEngine.enterFishingWild` boundary; do not duplicate battle creation.

- [ ] **Step 4: Run Adventure Fishing regressions**

Run:
```bash
node tests/v0690-adventure-fishing-flow.test.cjs
node tests/v0670-fishing-integration.test.cjs
node tests/v0671-fishing-mobile-polish.test.cjs
node tests/v0672-fishing-gen3-presentation.test.cjs
```

Expected: all PASS after updating only stale assertions that explicitly require the rejected `CAST AGAIN`/`A` flow.

- [ ] **Step 5: Commit**

```bash
git add app/src/main/assets/adventure/adventure-fishing.js tests/v0690-adventure-fishing-flow.test.cjs tests/v0671-fishing-mobile-polish.test.cjs tests/v0672-fishing-gen3-presentation.test.cjs
git commit -m "fix: auto-resolve Adventure fishing"
```

---

### Task 5: Correct Adventure Struggle legality and one-action turns

**Files:**
- Modify: `app/src/main/assets/adventure/adventure-battle.js`
- Test: `tests/v0690-adventure-struggle.test.cjs`

**Interfaces:**
- Replace the current semantic meaning of `canStruggle(p)` with: true only when `readyMoves(p)` is empty.
- `enemyMove(fight, player)` may return move `165` only when `readyMoves(enemy)` is empty.
- Player move menus/previews expose Struggle only under the same all-PP-exhausted rule.
- `act(...)` must still resolve exactly one selected move/opponent move per battler per turn.

- [ ] **Step 1: Write failing Magikarp/Struggle tests**

Create `tests/v0690-adventure-struggle.test.cjs` using the public `create`/`act` reducer and assert:
- a Pokémon with only Splash and positive PP does not expose/execute Struggle;
- Magikarp with Splash + Tackle and Tackle PP can act without a Struggle fallback;
- if every known move is at 0 PP, Struggle becomes available and can execute;
- one enemy turn produces exactly one enemy move event/action: never Tackle followed by Struggle in the same turn;
- status-only support moves remain valid AI choices when they have PP.

- [ ] **Step 2: Run the new battle test and verify it fails**

Run: `node tests/v0690-adventure-struggle.test.cjs`

Expected: FAIL because current `canStruggle` checks for a damaging move rather than any ready move.

- [ ] **Step 3: Fix Struggle legality consistently across battle selection, validation and preview**

Change the shared predicate once and use it for:
- enemy fallback;
- player command validation;
- move menu generation;
- first-move preview.

Do not special-case Magikarp. Preserve all existing damage/recoil mechanics for move `165`.

- [ ] **Step 4: Run battle regressions**

Run:
```bash
node tests/v0690-adventure-struggle.test.cjs
node tests/adventure-battle.test.cjs
node tests/adventure-real-battle.test.cjs
node tests/adventure-battle-v0411.test.cjs
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/main/assets/adventure/adventure-battle.js tests/v0690-adventure-struggle.test.cjs
git commit -m "fix: use Struggle only when all moves are exhausted"
```

---

### Task 6: v0.69.0 release normalization, stress and handoff

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/build.gradle`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/v0690-release.test.cjs`
- Create: `tests/v0690-fishing-progression-stress.test.cjs`
- Create: `TEST_REPORT_v0.69.0.md` during release packaging, outside canonical source if that remains the repository convention.
- Create: `TERMUX_UPDATE_v0.69.0.sh` during handoff.

**Interfaces:**
- All visible/runtime/build identities are `0.69.0`.
- Android `versionCode` is `6900`.
- Source ZIP remains a delivery artifact; canonical GitHub source stays unpacked under `source/`.

- [ ] **Step 1: Write the failing release identity test**

Create `tests/v0690-release.test.cjs` asserting:
- `package.json`, root package-lock package, Gradle versionName, runtime build marker and both visible HTML version strings are `0.69.0`;
- Gradle versionCode is `6900`;
- asset-builder User-Agent is `LuckyDex-asset-builder/0.69.0`.

- [ ] **Step 2: Run the release test and verify it fails**

Run: `node tests/v0690-release.test.cjs`

Expected: FAIL while the tree still identifies as v0.68.6.

- [ ] **Step 3: Normalize all release metadata to v0.69.0 / 6900**

Update only the canonical version locations pinned by the release test.

- [ ] **Step 4: Run focused Fishing, Adventure Fishing, battle and shared Arcade suites**

Run:
```bash
node tests/v0690-release.test.cjs
node tests/v0690-fishing-location-data.test.cjs
node tests/v0690-fishing-progression.test.cjs
node tests/v0690-fishing-progression-ui.test.cjs
node tests/v0690-fishing-progression-runtime.test.cjs
node tests/v0690-adventure-fishing-flow.test.cjs
node tests/v0690-adventure-struggle.test.cjs
node tests/v0680-fishing-stress.test.cjs
node tests/v0580-arcade-help.test.cjs
node tests/v0580-arcade-help-integration.test.cjs
```

Then run every existing `arcade-records*.test.cjs`/records regression script that the repository currently uses.

Expected: all runnable focused tests PASS.

- [ ] **Step 5: Run the existing broader Fishing regression sweep**

Run all `tests/v068*-fishing-*.test.cjs` and `tests/v067*-fishing-*.test.cjs` Node-runnable programs. If an older test encodes a deliberately replaced requirement, update that test narrowly to the approved v0.69.0 behavior; do not weaken unrelated assertions.

Expected: no new Fishing regression failures.

- [ ] **Step 6: Write and run progression and pool stress checks**

Create `tests/v0690-fishing-progression-stress.test.cjs` and make it deterministically:
- walks every region/spot and confirms a fresh player can unlock spots sequentially using species actually present in that spot;
- confirms every region can reach its configured target without requiring a locked-only species;
- samples each rod at each spot and confirms all rolled Pokémon belong to that authored local pool and satisfy their `minRod`;
- verifies migration is idempotent across at least 1,000 representative synthetic v0.68.x Fishing states.

Expected: zero unreachable spots/regions, zero out-of-pool catches, zero non-idempotent migrations.

- [ ] **Step 7: Attempt the repository-wide test command and classify blockers**

Run: `npm test`

Expected: if Playwright is still unavailable, record the exact first blocked browser test/dependency in `TEST_REPORT_v0.69.0.md`; do not call this a full-suite pass.

- [ ] **Step 8: Package from the verified canonical tree and verify the delivery ZIP**

Create `LuckyDex_source_v0.69.0.zip` from the exact verified source tree. Extract it into a fresh directory and rerun:
```bash
node tests/v0690-release.test.cjs
node tests/v0690-fishing-location-data.test.cjs
node tests/v0690-fishing-progression.test.cjs
node tests/v0690-adventure-fishing-flow.test.cjs
node tests/v0690-adventure-struggle.test.cjs
```

Expected: all PASS from the delivered files.

- [ ] **Step 9: Produce the matching full Termux handoff**

The script must:
- `git fetch origin`
- `git pull --rebase origin main`
- replace `source/` with `LuckyDex_source_v0.69.0.zip`
- verify `versionCode 6900`, `versionName '0.69.0'`, and the new authored location/progression files/tests
- `git add -A source`
- commit with `Update LuckyDex to v0.69.0 - Fishing progression and Adventure fixes`
- push `origin main`

- [ ] **Step 10: Commit release metadata/tests**

```bash
git add package.json package-lock.json app/build.gradle app/src/main/assets/app-v0167.js app/src/main/assets/index.html tests/v0690-release.test.cjs
git commit -m "chore: release LuckyDex v0.69.0"
```
