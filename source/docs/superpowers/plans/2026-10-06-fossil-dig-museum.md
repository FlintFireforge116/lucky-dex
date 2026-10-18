# Fossil Dig + Oreburgh Museum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current one-tap Fossil Dig with layered Underground-style excavation and add a persistent, authentic DPPt Oreburgh Mining Museum room that visibly fills as archaeological finds are discovered.

**Architecture:** Split the feature into a pure/testable excavation core (`arcade-fossil-museum-core.js`) and a DOM/runtime owner (`arcade-fossil-museum.js`). The core owns catalogue data, masks, generation, strikes, recovery, and museum bookkeeping; the runtime owns the 12×9 wall, tool interaction, result routing, and the museum-room overlays. Existing Arcade navigation remains authoritative; Oreburgh simply gains two activities (`fossil` and `museum`) and both return to the same venue.

**Tech Stack:** Vanilla JavaScript/HTML/CSS, existing LuckyDex Arcade platform/session modules, Node `assert` regression tests, Playwright browser/device tests, local PNG assets and Python/Node asset verification.

**Spec:** `docs/superpowers/specs/2026-10-06-fossil-dig-museum-design.md`

## Global Constraints

- Fossil Dig board is **12 columns × 9 rows** and normally contains **3–6 buried objects**.
- Rock depth is layered (2–4 starting layers); objects are multi-cell masks and never overlap.
- Pickaxe is precise and safer; hammer is broad and costs approximately **2–3×** as much wall stability.
- Initial tuning: pickaxe removes 3 depth from one cell for 3 stability; hammer removes 2 at centre + 1 in the surrounding 3×3 for 8 stability.
- Wall stability starts at **100**; collapse at 0 ends the run immediately, awards only already-completed finds, and never awards partial finds.
- First museum archaeological copy is auto-donated; later copies increment `foundCount` and are automatically sold for Lucky Coins.
- TCG cards are rare dig finds, go only to the normal Card Collection, and are never museum exhibits.
- Adventure rewards are limited to inventory keys the app already supports (`pokeball`, `greatball`, `ultraball`, `berry`, `potion`); Fossil Dig must not invent a second inventory.
- Museum uses the **authentic Gen IV Oreburgh Mining Museum room**, with **no avatar** and **completely blank cases** until an exhibit is found.
- Achievements, fossil revival, freeform exhibit placement, museum NPC movement, and artifact trading remain deferred.
- Existing save data must migrate without reset; Android `applicationId` and permanent signing identity must remain unchanged.
- Release target: **v0.25.0 / versionCode 250**.

## Review Focus

- **Dense/random placement failure:** when a requested object cannot fit, generation retries and then safely falls back to a valid 3-object site; it never hangs or overlaps masks. Covered in Task 2 generation tests.
- **Repeated input / double award:** repeated taps, a strike after collapse, or replay/result callbacks cannot recover or pay the same object twice. Covered in Tasks 2 and 4 tests.
- **Old save with malformed/missing museum state:** `ensureArcadeState` repairs only museum defaults and preserves all unrelated Arcade/profile/card/inventory data. Covered in Task 3 migration tests.
- **TCG catalogue unavailable/offline:** Fossil Dig still starts and plays; an unresolved card find is replaced by a normal treasure before the wall is shown, never by a broken card placeholder. Covered in Task 3 runtime-bridge tests.
- **Narrow phone / reduced motion:** 12×9 board and museum room fit at 320–360 CSS px without page-level horizontal scroll; reduced motion removes shake/flash while leaving all controls usable. Covered in Tasks 4 and 5 Playwright tests.

---

### Task 1: Add authentic museum/mining assets and a verified item-sprite set

**Files:**
- Create: `app/src/main/assets/arcade/fossil-museum-v0250/oreburgh-museum-dppt-empty.png`
- Create: `app/src/main/assets/arcade/fossil-museum-v0250/items/*.png`
- Create: `app/src/main/assets/arcade/fossil-museum-v0250/manifest.json`
- Create: `app/src/main/assets/arcade/fossil-museum-v0250/SOURCES.md`
- Create: `scripts/verify_fossil_museum_v0250_assets.py`
- Modify: `scripts/run-tests.cjs`
- Test: `tests/v0250-fossil-assets.test.cjs`

**Interfaces:**
- Consumes: approved visual direction and existing `arcade/authentic-v0200/mining/*` textures.
- Produces: stable local asset paths used by the catalogue in Task 2; `verify_fossil_museum_v0250_assets.py` exits 0 only when all manifest entries exist and image dimensions are non-zero.

- [ ] **Step 1: Write the failing asset contract test**

Create `tests/v0250-fossil-assets.test.cjs` asserting that the new museum room, manifest, and source document exist, and that the manifest resolves every required catalogue sprite to an existing local file (either an already-shipped `arcade/sprites/items/*` asset or a new `arcade/fossil-museum-v0250/items/*` asset). Required museum-capable IDs: `helix-fossil`, `dome-fossil`, `old-amber`, `root-fossil`, `claw-fossil`, `skull-fossil`, `armor-fossil`, `cover-fossil`, `plume-fossil`, `jaw-fossil`, `sail-fossil`, `fossilized-bird`, `fossilized-dino`, `fossilized-drake`, `fossilized-fish`, `odd-keystone`, `relic-copper`, `relic-silver`, `relic-gold`, `relic-vase`, `relic-band`, `relic-statue`, `relic-crown`, `hard-stone`, `everstone`, `fire-stone`, `water-stone`, `thunder-stone`, `leaf-stone`, `moon-stone`. Required non-museum IDs: `poke-ball`, `great-ball`, `ultra-ball`, `nugget`, `big-nugget`, `pearl`, `big-pearl`, `stardust`, `star-piece`, `rare-bone`, `comet-shard`.

- [ ] **Step 2: Run the test and verify RED**

Run: `node tests/v0250-fossil-assets.test.cjs`

Expected: FAIL because `arcade/fossil-museum-v0250/` does not exist.

- [ ] **Step 3: Source and prepare the room and item assets**

Use a clean DPPt Oreburgh Mining Museum interior or reconstruct the exact room from authentic DPPt map/tile material; remove player/NPC sprites and any contents that would reveal future LuckyDex exhibits while preserving the recognisable room, counters, floor, cases, walls, and central display. Reuse existing `arcade/sprites/items/*.png` where the exact sprite already exists; put missing sprites in the new folder. Record every original source URL/file and any crop/cleanup/transformation in `SOURCES.md` and `manifest.json`. Do not add a runtime network dependency.

- [ ] **Step 4: Add the asset verifier and wire it into the full suite**

`verify_fossil_museum_v0250_assets.py` must validate the manifest, every referenced local file, and non-zero image dimensions. Add it after the existing Arcade/venue/adventure asset checks in `scripts/run-tests.cjs`.

- [ ] **Step 5: Run asset checks and verify GREEN**

Run: `node tests/v0250-fossil-assets.test.cjs && python3 scripts/verify_fossil_museum_v0250_assets.py`

Expected: both commands PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade/fossil-museum-v0250 scripts/verify_fossil_museum_v0250_assets.py scripts/run-tests.cjs tests/v0250-fossil-assets.test.cjs
git commit -m "assets: add Oreburgh museum excavation set"
```

---

### Task 2: Build the pure excavation/catalogue core

**Files:**
- Create: `app/src/main/assets/arcade-fossil-museum-core.js`
- Test: `tests/v0250-fossil-core.test.cjs`

**Interfaces:**
- Consumes: local asset paths from Task 1.
- Produces: `LuckyDexFossilMuseumCore` / CommonJS API with `BOARD_DEFAULTS`, `TOOL_RULES`, `CATALOGUE`, `generateDigSite(options)`, `strike(site,index,toolId)`, `isFindRecovered(site,find)`, `completeRecoveredFinds(site)`, `ensureMuseumState(arcade)`, and `recordMuseumFind(museum,item,now)`.

- [ ] **Step 1: Write failing pure-model tests**

Create `tests/v0250-fossil-core.test.cjs` with independent assertions that:
- defaults are `{rows:9, cols:12, minFinds:3, maxFinds:6, minDepth:2, maxDepth:4, stability:100}`;
- generated cells total 108 and each depth is 2–4;
- generated normal sites contain 3–6 finds;
- every find mask is in-bounds and no two occupied mask cells overlap;
- seeded/deterministic retry input that initially cannot place a large mask still returns a valid non-overlapping site instead of looping;
- pickaxe touches exactly one cell and costs 3 stability;
- hammer touches only the target 3×3 neighbourhood, applies centre damage 2 / neighbour damage 1, and costs 8 stability;
- partial reveal does not recover a find;
- zero depth on every mask cell recovers it once;
- a strike at/after collapse changes nothing;
- `completeRecoveredFinds()` returns only newly completed find IDs and never repeats them.

- [ ] **Step 2: Run the test and verify RED**

Run: `node tests/v0250-fossil-core.test.cjs`

Expected: FAIL because `arcade-fossil-museum-core.js` is missing.

- [ ] **Step 3: Implement the catalogue and pure excavation model**

Create a UMD/CommonJS-safe module. Catalogue entries must expose at least `{id,name,category,weight,sprite,mask,museumEligible,duplicateCoins,flavour,rewardDestination}`. Initial museum catalogue must include all fossils, Odd Keystone, seven Relic items, Hard Stone, Everstone, Fire/Water/Thunder/Leaf/Moon Stones. Non-museum catalogue must include Poké/Great/Ultra Ball, direct coin caches, the listed sellable treasures, and a rare `tcg-card` special find. Keep all balance values on catalogue/config data: normal fossil duplicate 60 coins, Galar fossil piece 75, Odd Keystone 180, Relics 60/90/130/110/130/160/220 (Copper/Silver/Gold/Vase/Band/Statue/Crown), geology 40 each; treasures 100/250/60/130/40/100/160/220 (Nugget/Big Nugget/Pearl/Big Pearl/Stardust/Star Piece/Rare Bone/Comet Shard). `tcg-card` uses weight 1 while ordinary fossils/treasures use weights 8–14, keeping card digs rare.

`generateDigSite({rng=Math.random, rows=9, cols=12, minFinds=3, maxFinds=6, catalogue=CATALOGUE})` returns a serialisable model with `depths`, `finds`, `stability:100`, `finished:false`, `collapsed:false`, and a set/array of already-awarded find IDs. Placement uses bounded retries and a deterministic fallback that guarantees at least 3 valid objects from small masks.

- [ ] **Step 4: Implement strike/recovery helpers**

`strike(site,index,'pickaxe'|'hammer')` returns `{changedIndices,recoveredIds,collapsed,allRecovered}` while mutating or returning the site consistently; invalid/repeated-after-finish input returns an empty result. Clamp depth to 0 and stability to 0–100.

- [ ] **Step 5: Run the pure tests and verify GREEN**

Run: `node tests/v0250-fossil-core.test.cjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-fossil-museum-core.js tests/v0250-fossil-core.test.cjs
git commit -m "feat: add layered fossil excavation core"
```

---

### Task 3: Add museum persistence and reward bridges without breaking old saves

**Files:**
- Modify: `app/src/main/assets/arcade-platform.js`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/arcade-fossil-museum-core.js`
- Test: `tests/v0250-fossil-rewards.test.cjs`
- Test: `tests/v0250-save-migration.test.cjs`

**Interfaces:**
- Consumes: Task 2 `ensureMuseumState()` / `recordMuseumFind()` and the existing LuckyDex card/inventory/coin state.
- Produces: `window.LuckyDexFossilMuseumBridge` with `getState()`, `save()`, `grantCoins(amount,label)`, `grantInventory(key,amount)`, `resolveBuriedCard()`, `grantCard(card,set)`, `showToast(message)`, and `vibrate(pattern)`.

- [ ] **Step 1: Write failing museum migration tests**

In `tests/v0250-save-migration.test.cjs`, require `arcade-platform.js` and assert that `ensureArcadeState()` adds `museum:{exhibits:{}}` to an old Arcade object while preserving unrelated fields and existing exhibit records/counts.

- [ ] **Step 2: Write failing reward-bookkeeping tests**

In `tests/v0250-fossil-rewards.test.cjs`, assert:
- first `recordMuseumFind()` sets `discovered:true`, `foundCount:1`, returns `isNew:true`, and awards 0 duplicate coins;
- second copy increments to 2 and returns the catalogue `duplicateCoins` value;
- partial/non-recovered finds never call bookkeeping;
- unknown/invalid museum items do not corrupt state.

- [ ] **Step 3: Run both tests and verify RED**

Run: `node tests/v0250-save-migration.test.cjs && node tests/v0250-fossil-rewards.test.cjs`

Expected: FAIL because museum defaults/recording are not implemented.

- [ ] **Step 4: Add museum defaults and backward-compatible migration**

Add `museum:{exhibits:{}}` to `ARCADE_DEFAULTS` and merge it in `ensureArcadeState()`. Mirror the default in `app-v0167.js` so reset/new-save paths create the same shape. Preserve all current save keys and do not increment/reset unrelated data.

- [ ] **Step 5: Add the Fossil Museum bridge in `app-v0167.js`**

Expose the exact bridge methods above. `grantInventory` accepts only existing inventory keys. `grantCoins` uses the existing Lucky Coin awarding path with game/source `fossil`. `grantCard` stores one card in `state.cards` using the existing physical-card identity/metadata conventions and updates card stats/rare-hit XP without incrementing pack count. `resolveBuriedCard()` chooses from the existing physical card catalogue, filters through `LuckyDexCardAcquisition.boosterEligible`, weights rarity tiers at 50% Common, 28% Uncommon, 15% Rare, 5% Double Rare, 1.5% Illustration/Ultra, and 0.5% Special/Jackpot combined, and returns `null` if the catalogue/art cannot be resolved; it must not require a successful network request for the dig to continue.

- [ ] **Step 6: Add unresolved-card fallback behavior to the core/runtime contract**

Define the rule that a generated `tcg-card` find must be hydrated before the wall becomes interactive; if bridge resolution returns `null`, replace that find with a normal treasure of a compatible mask size before rendering.

- [ ] **Step 7: Run reward/migration tests and verify GREEN**

Run: `node tests/v0250-save-migration.test.cjs && node tests/v0250-fossil-rewards.test.cjs`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/src/main/assets/arcade-platform.js app/src/main/assets/app-v0167.js app/src/main/assets/arcade-fossil-museum-core.js tests/v0250-fossil-rewards.test.cjs tests/v0250-save-migration.test.cjs
git commit -m "feat: persist museum finds and route excavation rewards"
```

---

### Task 4: Build the interactive 12×9 Fossil Dig runtime and haul results

**Files:**
- Create: `app/src/main/assets/arcade-fossil-museum.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/arcade.css`
- Modify: `app/src/main/assets/arcade-session.js`
- Test: `tests/arcade-session.test.cjs`
- Test: `tests/v0250-fossil-browser.test.cjs`

**Interfaces:**
- Consumes: Task 2 core API, Task 3 bridge, existing `LuckyDexArcadeSession` and `LuckyDexArcadeWorld`.
- Produces: `window.LuckyDexFossilMuseum` with `open(activityId)`, `close(activityId)`, `startDig()`, `selectTool(toolId)`, `strikeCell(index)`, `finishDig(reason)`, `renderMuseum()`, and test-only `currentDig()` getter.

- [ ] **Step 1: Extend result-sheet tests first**

Update `tests/arcade-session.test.cjs` with a failing test for optional structured `details:[{title,subtitle,kind}]`. Existing result models with no details must remain unchanged; result rendering must clear old details between games.

- [ ] **Step 2: Run result-session test and verify RED**

Run: `node tests/arcade-session.test.cjs`

Expected: FAIL on missing `details` support.

- [ ] **Step 3: Implement structured haul rows in Arcade Session**

Add `#arcadeResultDetails` to `index.html`. Extend `resultModel()` / `showResult()` so Fossil Dig can show actual finds without accepting arbitrary HTML. Keep all existing game calls compatible.

- [ ] **Step 4: Write the failing Fossil Dig browser test**

Create `tests/v0250-fossil-browser.test.cjs` to assert at 360×720 and 320×700:
- `openGame('fossil')` shows a 12×9 board with no page-level horizontal scroll;
- wall starts at 100% stability;
- tool buttons are at least ~44 CSS px tall and change active tool;
- pickaxe changes only one cell's depth and stability by 3;
- hammer changes a local 3×3 area and stability by 8;
- visible rock-layer state changes after a hit;
- fully exposing a known injected test find produces one find banner/result entry and cannot be awarded twice;
- collapse at 0 ends the run and excludes an injected partially exposed find from haul/rewards;
- results list actual haul rows rather than one generic fossil count;
- reduced-motion context still permits tool switching/strikes and does not require animations.

- [ ] **Step 5: Run the browser test and verify RED**

Run: `node tests/v0250-fossil-browser.test.cjs`

Expected: FAIL because the new owner/UI does not exist yet.

- [ ] **Step 6: Implement `arcade-fossil-museum.js` Fossil Dig mode**

Render the object sprites as coherent absolutely-positioned objects beneath 108 rock buttons. Each rock button reflects depth using `data-depth`/CSS classes; shallow layers become visually thinner so underlying object art peeks through. Keep cell buttons as the input hit targets. Add the red hammer / blue pickaxe selector, `ITEMS FOUND x/y`, and `WALL STABILITY n%`; remove all `DIGS LEFT` and one-tap help copy. Add impact feedback/haptics with `prefers-reduced-motion` fallbacks.

On full recovery, route each find exactly once: museum item via `recordMuseumFind`, duplicate museum/treasure via coins, inventory through bridge, card through bridge. On all-recovered or collapse, call Arcade Session with structured haul details.

- [ ] **Step 7: Run session + Fossil browser tests and verify GREEN**

Run: `node tests/arcade-session.test.cjs && node tests/v0250-fossil-browser.test.cjs`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/src/main/assets/arcade-fossil-museum.js app/src/main/assets/index.html app/src/main/assets/arcade.css app/src/main/assets/arcade-session.js tests/arcade-session.test.cjs tests/v0250-fossil-browser.test.cjs
git commit -m "feat: rebuild Fossil Dig as layered excavation"
```

---

### Task 5: Build the one-room persistent Oreburgh Museum viewer

**Files:**
- Modify: `app/src/main/assets/arcade-fossil-museum.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/arcade.css`
- Test: `tests/v0250-museum-browser.test.cjs`

**Interfaces:**
- Consumes: Task 1 room asset; Task 2 `CATALOGUE`; Task 3 `state.arcade.museum.exhibits`.
- Produces: fixed `MUSEUM_SLOTS` mapping from museum item ID to normalised room coordinates and `renderMuseum()` / plaque interaction.

- [ ] **Step 1: Write the failing museum browser test**

Create `tests/v0250-museum-browser.test.cjs` asserting:
- opening the museum activity shows one top-down Oreburgh room and **no avatar/joystick/walking controls**;
- a fresh save renders zero exhibit sprites, zero silhouettes, zero `?`/locked placeholder labels, and no clickable empty slots;
- injecting `helix-fossil:{discovered:true,foundCount:4}` renders exactly its exhibit at a physical room slot;
- tapping it opens a compact plaque with `HELIX FOSSIL`, original LuckyDex flavour text, and `Excavated: 4`;
- adding Odd Keystone renders its prominent standalone slot;
- reloading preserves the same exhibits;
- room fits at 320–360 CSS px without page-level horizontal scrolling.

- [ ] **Step 2: Run the museum browser test and verify RED**

Run: `node tests/v0250-museum-browser.test.cjs`

Expected: FAIL because museum activity/UI is absent.

- [ ] **Step 3: Add museum host/plaque markup and fixed exhibit-slot data**

Add `#museumGame`, `#oreburghMuseumRoom`, and one reusable plaque/dialog/sheet host. `MUSEUM_SLOTS` groups Kanto, Hoenn, Sinnoh, Unova/Kalos, Galar, Odd Keystone, Relics, and geological curios across the authentic room's existing cases/pedestals. Empty slots have no DOM marker visible/clickable to the player; occupied slots alone render `<button>` overlays with item sprites.

- [ ] **Step 4: Implement museum rendering and plaque interaction**

Scale all positions relative to the room image so phone/desktop layout remains aligned. Plaques show item name, concise original flavour text from the catalogue, and `Excavated: N`. No long copied canonical descriptions.

- [ ] **Step 5: Run the museum browser test and verify GREEN**

Run: `node tests/v0250-museum-browser.test.cjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/arcade-fossil-museum.js app/src/main/assets/index.html app/src/main/assets/arcade.css tests/v0250-museum-browser.test.cjs
git commit -m "feat: add persistent Oreburgh museum room"
```

---

### Task 6: Wire Oreburgh as a two-activity venue and retire the legacy Fossil owner

**Files:**
- Modify: `app/src/main/assets/arcade-world.js`
- Modify: `app/src/main/assets/arcade-classics.js`
- Modify: `app/src/main/assets/arcade-session.js`
- Modify: `app/src/main/assets/index.html`
- Test: `tests/arcade-classics.test.cjs`
- Test: `tests/v0250-oreburgh-navigation.test.cjs`

**Interfaces:**
- Consumes: Task 4/5 `LuckyDexFossilMuseum.open/close` API.
- Produces: Oreburgh venue activities `['fossil','museum']`; both owned by `LuckyDexFossilMuseum`; legacy Classics module no longer exposes or installs Fossil code.

- [ ] **Step 1: Write failing navigation/ownership tests**

`tests/v0250-oreburgh-navigation.test.cjs` must assert the Oreburgh venue lists both **Fossil Dig** and **Museum Collection**, each opens its corresponding screen, and Back returns to `oreburghMuseum` rather than Arcade world root. Update `tests/arcade-classics.test.cjs` to require that old `revealFossilCell` / `makeFossil` exports are absent.

- [ ] **Step 2: Run tests and verify RED**

Run: `node tests/arcade-classics.test.cjs && node tests/v0250-oreburgh-navigation.test.cjs`

Expected: FAIL because Arcade World still routes Fossil to Classics and has no museum activity.

- [ ] **Step 3: Rewire Arcade World**

Set Oreburgh `games:['fossil','museum']`; rename the Fossil activity to `Fossil Dig`, add `museum:'Museum Collection'`, and use objectives `Excavate buried Pokémon-world finds before the wall collapses.` / `Inspect the artifacts you've unearthed.` Route both owners to `LuckyDexFossilMuseum`. Give Oreburgh an `activityLabel:'ACTIVITIES'` (or equivalent) so the world summary says `2 ACTIVITIES`, not `2 GAMES`. Update Fossil Arcade Session copy to wall stability/recovered finds rather than digs-left language.

- [ ] **Step 4: Delete legacy Fossil Dig from `arcade-classics.js`**

Remove fossil state, generator, render/strike/finish/install code, and remove `fossil` from Classics `open()` / `hideClassics()`. Keep Voltorb and Berry behavior unchanged.

- [ ] **Step 5: Insert script load order**

Load `arcade-fossil-museum-core.js` then `arcade-fossil-museum.js` after Arcade platform/session and before `arcade-world.js`, so owners exist when world navigation runs.

- [ ] **Step 6: Run navigation/ownership tests and verify GREEN**

Run: `node tests/arcade-classics.test.cjs && node tests/v0250-oreburgh-navigation.test.cjs`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/arcade-world.js app/src/main/assets/arcade-classics.js app/src/main/assets/arcade-session.js app/src/main/assets/index.html tests/arcade-classics.test.cjs tests/v0250-oreburgh-navigation.test.cjs
git commit -m "refactor: move Oreburgh activities to fossil museum owner"
```

---

### Task 7: Add end-to-end reward routing, persistence, and regression coverage

**Files:**
- Modify: `tests/v0250-fossil-browser.test.cjs`
- Modify: `tests/v0250-museum-browser.test.cjs`
- Create: `tests/v0250-fossil-routing-browser.test.cjs`
- Modify/remove superseded expectations: `tests/v0223-fossil.test.cjs`

**Interfaces:**
- Consumes: completed Fossil/Museum runtime and bridge.
- Produces: browser-level proof that the full Dig → reward → Museum/Collection/Inventory loop works and persists.

- [ ] **Step 1: Write failing end-to-end routing cases**

Create deterministic/injected dig sites and assert:
- first Helix Fossil becomes museum `discovered:true,foundCount:1` and grants no duplicate coins;
- second Helix increments count to 2 and adds exactly its configured duplicate coin value;
- a Nugget is sold and appears by name/value in haul;
- Great Ball increments `state.inventory.greatball`;
- a resolved buried TCG card increments that card's binder count but does not increment `state.stats.packs`;
- a partially uncovered TCG card followed by collapse does not enter the binder;
- after reload, museum state, inventory, coins, and card grant persist;
- an unavailable card catalogue causes treasure fallback and still produces a playable site.

- [ ] **Step 2: Run routing test and verify RED if any integration is incomplete**

Run: `node tests/v0250-fossil-routing-browser.test.cjs`

Expected: if any cross-module contract is incomplete, FAIL on that exact routing/persistence assertion; if it already passes because earlier task tests drove the same behavior, record it as fresh integration verification and do not manufacture a failure.

- [ ] **Step 3: Make the smallest runtime/bridge corrections required**

Do not add new feature scope; fix only routing, idempotence, persistence, or fallback behavior exposed by the test.

- [ ] **Step 4: Retire the old 6×7 one-tap browser test contract**

Replace `tests/v0223-fossil.test.cjs` assertions that require one-square fossils / `digs` with compatibility assertions that Fossil Dig still opens/replays/back-navigates without duplicate rewards under the new owner.

- [ ] **Step 5: Run all Fossil/Museum browser tests and verify GREEN**

Run: `node tests/v0250-fossil-browser.test.cjs && node tests/v0250-museum-browser.test.cjs && node tests/v0250-fossil-routing-browser.test.cjs && node tests/v0223-fossil.test.cjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/v0250-fossil-browser.test.cjs tests/v0250-museum-browser.test.cjs tests/v0250-fossil-routing-browser.test.cjs tests/v0223-fossil.test.cjs app/src/main/assets
git commit -m "test: cover Fossil Dig museum reward loop"
```

---

### Task 8: Release bump, signer guard, full verification, and package

**Files:**
- Modify: `app/build.gradle`
- Modify: `package.json`
- Create: `TEST_REPORT_v0.25.0.md`
- Create: `V0250_REPORT.md`
- Test: `tests/v0250-release.test.cjs`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: GitHub-ready LuckyDex source ZIP that updates v0.24.8 in place and documents verification.

- [ ] **Step 1: Write the failing release contract test**

Assert `versionCode 250`, `versionName '0.25.0'`, package version `0.25.0`, `applicationId 'com.example.luckydex'`, permanent debug signing config remains wired, and the canonical keystore SHA/certificate fingerprint match the existing v0.24.8 signing guard.

- [ ] **Step 2: Run release test and verify RED**

Run: `node tests/v0250-release.test.cjs`

Expected: FAIL on version 248 / 0.24.8.

- [ ] **Step 3: Bump only release metadata**

Set Android to versionCode 250 / versionName 0.25.0 and package version to 0.25.0. Do not change package ID, keystore, alias, passwords, or signing config.

- [ ] **Step 4: Run release test and JS syntax checks**

Run:

```bash
node tests/v0250-release.test.cjs
node --check app/src/main/assets/arcade-fossil-museum-core.js
node --check app/src/main/assets/arcade-fossil-museum.js
node --check app/src/main/assets/arcade-world.js
node --check app/src/main/assets/arcade-classics.js
node --check app/src/main/assets/arcade-session.js
```

Expected: all PASS / exit 0.

- [ ] **Step 5: Run the complete project suite**

Run: `npm test`

Expected: all installed/runnable Node + Playwright + asset verification tests PASS. If the local environment lacks Playwright/browser dependencies, separately run every non-browser `.cjs` program and all four asset verifiers, record the skipped dependency-bound tests by filename in `TEST_REPORT_v0.25.0.md`, and leave browser verification to the GitHub Actions environment rather than claiming it ran.

- [ ] **Step 6: Verify signer and package integrity**

Run the existing v0.24.3 signing test plus `sha256sum app/luckydex-dev.keystore`; compare with the canonical signer. Create the source ZIP with repository files at archive root and exclude `.git`, `node_modules`, and temporary working files. Test the ZIP with `unzip -t` and inspect `app/build.gradle` inside it.

- [ ] **Step 7: Write release/test reports**

`V0250_REPORT.md` summarises gameplay, museum, reward routing, save compatibility, assets/provenance, and version/signing. `TEST_REPORT_v0.25.0.md` lists exact fresh commands/results and any dependency-bound skips.

- [ ] **Step 8: Commit**

```bash
git add app/build.gradle package.json tests/v0250-release.test.cjs V0250_REPORT.md TEST_REPORT_v0.25.0.md
git commit -m "release: LuckyDex v0.25.0 fossil museum"
```
