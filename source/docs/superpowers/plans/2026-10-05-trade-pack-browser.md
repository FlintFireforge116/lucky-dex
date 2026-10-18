# LuckyDex Trade Market + Pack Browser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace per-filter Trade board generation with one persistent four-hour market snapshot and add a searchable, sortable Pack set browser without disturbing pack opening, saves, signing identity, or card ownership.

**Architecture:** `trade-v0163.js` remains the only Trade runtime owner; it will own one `state.trade.market` snapshot and synchronously filter it for all UI controls. `pack-flow-v0165.js` remains the pack-opening orchestrator; a small Pack Browser helper/model will render the visible set list while the existing hidden `#setSelect` remains the compatibility value consumed by the pack engine. New-set discovery crosses the boundary through one explicit `LuckyDexTrade.noteOpenedSet(meta)` hook called after a pack is committed.

**Tech Stack:** Android WebView, vanilla JavaScript/HTML/CSS, localStorage save state, Node `.cjs` regression tests, Playwright browser tests where available.

**Spec:** `docs/superpowers/specs/2026-10-05-trade-pack-browser-design.md`

## Global Constraints

- Keep `applicationId` exactly `com.example.luckydex`.
- Keep localStorage save key exactly `luckyDexSave`.
- Keep the existing GitHub signing path/keystore contract unchanged.
- Increment `versionCode` above 232; target `versionName 0.24.0` and `versionCode 240`.
- Preserve unknown save fields, collection ownership, `state.trade.openedSets`, `state.trade.totalTrades`, and old `state.trade.boards` data without using old boards as live data.
- Do not require uninstall/reinstall.
- `trade-v0163.js` stays the single Trade runtime owner; `pack-flow-v0165.js` stays the single pack-opening engine.
- Filter changes never regenerate Trade data or alter the four-hour timer.
- Essential behavior must work offline from cached/local catalogues when those catalogues are already available.

## Review Focus

- **One discovered set:** Across Sets must be legitimately empty while Same Set continues to show listings, without poisoning the whole market snapshot. Covered by Task 1 tests.
- **Transient catalogue failure:** a failed refresh must preserve the last valid non-empty market and retry later in the same slot. Covered by Task 1 tests.
- **New set opened mid-slot:** adding a newly discovered set must append deterministic listings without deleting accepted/current listings or duplicating IDs. Covered by Task 2 tests.
- **Incomplete Pack metadata:** null release dates/counts/history metrics must sort deterministically and never drop a set. Covered by Task 4 tests.
- **Source changes:** switching Physical/Pocket while search/sort/filter state is active must show only the new source catalogue with no stale rows and keep the existing pack opening selection/HUD coherent. Covered by Task 5 tests.

---

### Task 1: Replace per-view Trade boards with one persisted market snapshot

**Files:**
- Modify: `app/src/main/assets/trade-v0163.js:9-361`
- Create: `tests/v024-trade-market.test.cjs`

**Interfaces:**
- Produces `ensureMarket(force = false) -> Promise<Array<Listing>>` inside `trade-v0163.js`.
- Produces `currentMarket() -> Array<Listing>` and keeps `LuckyDexTrade.current()` mapped to that array for compatibility.
- Produces persisted `state.trade.market = {version, slot, generatedAt, expiresAt, openedSetFingerprint, listings}`.
- Later tasks consume listing metadata: `source`, `sameSet`, `featured`, `accepted`, `offer`, `request`, `offerTier`, `reqTier`.

- [ ] **Step 1: Write failing market-state tests**

Create `tests/v024-trade-market.test.cjs` with assertions that:
- `ensureTradeState()` preserves legacy `boards` but initializes `market` lazily;
- one discovered set can build same-set listings and leaves across-set filtering empty without a separate cache;
- a valid market survives a subsequent simulated catalogue/build failure;
- an initial failed build is not persisted as a valid empty market and a second attempt in the same slot can succeed;
- the same slot + opened-set fingerprint yields stable listing IDs.

- [ ] **Step 2: Run the market-state test and verify RED**

Run: `node tests/v024-trade-market.test.cjs`

Expected: FAIL because `state.trade.market` / `ensureMarket` semantics do not exist and the old code persists per-view `boards[key]` arrays.

- [ ] **Step 3: Implement one-market generation in `trade-v0163.js`**

Refactor the old `buildBoard(mode, sourceFilter, slot)` / `ensureBoard()` path into:
- a market builder that deterministically creates same-set and across-set rows for each discovered source (`tcg`, `tcgp`) that can support them;
- stable listing metadata `source`, `sameSet`, `featured`;
- `openedSetFingerprint` derived from sorted discovered-set identities;
- atomic replacement only after a valid snapshot is ready;
- preservation of the previous valid snapshot on failure;
- lazy migration that stops reading `state.trade.boards` as live data but never deletes the old field.

Keep the current card-catalogue resolution and rarity matching functions as the source of card candidates.

- [ ] **Step 4: Run the market-state test and verify GREEN**

Run: `node tests/v024-trade-market.test.cjs`

Expected: PASS.

- [ ] **Step 5: Run existing Trade transaction/refresh regressions**

Run: `node tests/recovery-transactions.cjs && node tests/recovery-trade-refresh.cjs`

Expected: PASS when Playwright is installed; if local Playwright is unavailable, record that explicitly and run these in the final CI/full-suite gate.

- [ ] **Step 6: Commit/checkpoint**

Commit in a git-backed workspace as `refactor: use one persistent trade market`. If executing from the source archive without `.git`, record a file checkpoint before Task 2.

---

### Task 2: Make Trade controls pure filters and augment the market when a new set opens

**Files:**
- Modify: `app/src/main/assets/trade-v0163.js:400-696`
- Modify: `app/src/main/assets/app-v0167.js:365-389,1058-1070`
- Extend test: `tests/v024-trade-market.test.cjs`

**Interfaces:**
- Consumes Task 1 `currentMarket()` and listing metadata.
- Produces `filterMarket(listings, {mode, source, view, search}) -> Array<Listing>`.
- Produces `LuckyDexTrade.noteOpenedSet({source, setId, setName}) -> Promise<boolean>`; returns `true` only when a previously undiscovered set was added.
- Pack commit calls `LuckyDexTrade.noteOpenedSet(...)` after collection mutation is safely committed.

- [ ] **Step 1: Add failing filter/augmentation tests**

Extend `tests/v024-trade-market.test.cjs` to prove:
- Same/Across, All/Physical/Pocket, Featured/All/Can Trade/Spares and Search all filter the same in-memory listing array;
- switching filters does not call the market builder and does not change `market.slot` / `expiresAt`;
- two discovered physical sets produce at least one across-set physical listing;
- `noteOpenedSet()` appends deterministic rows involving the new set, preserves all existing listing IDs/accepted flags, updates the fingerprint, and does nothing on a repeated notification;
- accepted listings stay accepted when switching filters and card mutation occurs only once.

- [ ] **Step 2: Run the filter/augmentation test and verify RED**

Run: `node tests/v024-trade-market.test.cjs`

Expected: FAIL because current button handlers call `renderTradeBoard()` which can invoke board generation, and no new-set augmentation hook exists.

- [ ] **Step 3: Implement synchronous filtering and new-set augmentation**

Update `trade-v0163.js` so:
- `renderTradeBoard()` ensures/refreshes the market only on entry/slot refresh, then renders `filterMarket(currentMarket(), currentControls)`;
- filter/search button handlers only call a synchronous re-render of the current market;
- counts derive from the same market and the appropriate higher-level filters;
- `current()` remains compatible for transaction tests by returning the full market array;
- `noteOpenedSet(meta)` registers the set and, when the current slot has a valid market, deterministically appends a small set of rows involving that set rather than rebuilding the snapshot.

Call `LuckyDexTrade.noteOpenedSet({source,setId:set.id,setName:set.name})` from the committed pack flow after `commitPreparedPack()` succeeds; never call it for cancelled/debug packs.

- [ ] **Step 4: Run the filter/augmentation test and verify GREEN**

Run: `node tests/v024-trade-market.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit/checkpoint**

Commit as `feat: filter one trade market and augment new sets`, or record an archive checkpoint.

---

### Task 3: Simplify the Trade page around the listings

**Files:**
- Modify: `app/src/main/assets/index.html:248-275`
- Modify: `app/src/main/assets/trade-v0163.css`
- Modify: `app/src/main/assets/trade-browser-v0169.css`
- Create: `tests/v024-trade-ui.test.cjs`

**Interfaces:**
- Consumes Task 2 counts/filter rendering.
- Produces the same existing DOM IDs used by `trade-v0163.js`: `tradeCountdown`, mode/source/view buttons, `tradeSearch`, count IDs, `tradeDiscoveryText`, `tradeOfferList`.

- [ ] **Step 1: Write failing Trade UI structure test**

Create `tests/v024-trade-ui.test.cjs` asserting:
- `.trade-intro` / “Global market…” copy is absent from `index.html`;
- timer, mode/view/source/search controls remain present exactly once;
- `tradeDiscoveryText` is the only compact summary line before `tradeOfferList`;
- CSS no longer reserves the large intro-panel vertical block;
- at 360×800 in a browser smoke, the first populated trade card begins materially higher than the v0.23.2 screenshot baseline and bottom navigation remains visible.

- [ ] **Step 2: Run UI test and verify RED**

Run: `node tests/v024-trade-ui.test.cjs`

Expected: FAIL because `.trade-intro` still exists and current spacing is built around it.

- [ ] **Step 3: Remove explanatory clutter and compact the filters**

Delete the intro panel from `index.html`; tighten title/filter/status spacing in Trade CSS without changing trade-card internals or the exchange animation. Keep the status text concise (`N live · N featured · N ready`) instead of five separate dashboard-style chips where practical.

- [ ] **Step 4: Run UI test and verify GREEN**

Run: `node tests/v024-trade-ui.test.cjs`

Expected: PASS for static checks; browser geometry assertions PASS where Playwright is available.

- [ ] **Step 5: Commit/checkpoint**

Commit as `style: simplify trade market browser`, or record an archive checkpoint.

---

### Task 4: Add Pack Browser data model, sort rules, and persisted metrics

**Files:**
- Modify: `app/src/main/assets/app-v0167.js:109-153,365-389`
- Modify: `app/src/main/assets/pack-flow-v0165.js:1-112`
- Create: `tests/v024-pack-browser.test.cjs`

**Interfaces:**
- Produces `state.ui.packBrowser = {sortKey, sortDir}` with defaults `releaseDate` / `desc`.
- Produces `state.ui.packMetrics["<source>:<setId>"] = {packsOpened, lastOpened}` for future pack commits; absent historical metrics resolve to zero/null.
- Produces `packBrowserRows(source, query, sortKey, sortDir) -> Array<SetRow>` and `packSetMetrics(set, source) -> {owned,total,completion,packsOpened,lastOpened}`.
- Task 5 consumes these functions for rendering.

- [ ] **Step 1: Write failing Pack Browser model tests**

Create `tests/v024-pack-browser.test.cjs` with representative sets and assert:
- case-insensitive search matches name and set id/code;
- Release Date asc/desc reverses oldest/newest correctly;
- Name asc/desc gives A→Z / Z→A;
- Set Size numeric sort works;
- Completion %, Packs Opened and Recently Opened use deterministic zero/null fallbacks and stable tie-breaking by name/id;
- search + sort compose;
- malformed/missing metadata never drops a set;
- sort preference survives a save/load merge without deleting unrelated `state.ui` fields.

- [ ] **Step 2: Run model tests and verify RED**

Run: `node tests/v024-pack-browser.test.cjs`

Expected: FAIL because pack browser state/model functions do not exist.

- [ ] **Step 3: Implement additive UI state and Pack Browser model**

Deep-merge `state.ui` in `loadState()` so unknown UI fields survive. Add Pack Browser defaults and per-set metrics without incrementing/changing card ownership. In `pack-flow-v0165.js`, implement pure search/sort/metric helpers that operate on `setCache[source]`; preserve `renderSetOptionsV13()` as the hidden/select synchronization source.

Record `packsOpened` and `lastOpened = Date.now()` exactly once after a real pack commit; debug previews and cancelled packs must not change metrics.

- [ ] **Step 4: Run model tests and verify GREEN**

Run: `node tests/v024-pack-browser.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit/checkpoint**

Commit as `feat: add pack browser model and metrics`, or record an archive checkpoint.

---

### Task 5: Build the visible Pack Set Browser while keeping `setSelect` authoritative

**Files:**
- Modify: `app/src/main/assets/index.html:216-246`
- Modify: `app/src/main/assets/pack-flow-v0165.js:41-110`
- Modify: `app/src/main/assets/styles-v013.css:269-285`
- Extend test: `tests/v024-pack-browser.test.cjs`

**Interfaces:**
- Consumes Task 4 `packBrowserRows()` / preferences / metrics.
- Keeps `#setSelect` as the value consumed by `preparePack()` and existing HUD/format logic.
- Produces visible controls: `#packSetSearch`, `#packSortKey`, `#packSortDir`, `#packSetBrowser`.

- [ ] **Step 1: Add failing DOM synchronization/source-switch tests**

Extend `tests/v024-pack-browser.test.cjs` to assert:
- visible controls exist and the old native set select remains in DOM but is visually implementation-only;
- selecting a browser row sets `#setSelect.value`, dispatches the same change/update path used by the current pack HUD, and preserves `preparePack()` compatibility;
- switching Physical/Pocket refreshes visible rows with no stale source entries;
- changing search/sort does not change the selected set unless that set is no longer present;
- sort direction button label/ARIA state reflects asc/desc.

- [ ] **Step 2: Run Pack Browser tests and verify RED**

Run: `node tests/v024-pack-browser.test.cjs`

Expected: FAIL because the visible browser controls and selection synchronization do not exist.

- [ ] **Step 3: Add Pack Browser markup and rendering**

In `index.html`, keep `#cardSource` visible and keep `#setSelect` hidden/accessibility-safe as the compatibility value. Add compact search, sort-key select/button, direction toggle, and tappable set-row container. In `pack-flow-v0165.js`, call the browser render whenever `renderSetOptionsV13()` updates a source catalogue and whenever source/search/sort changes.

Rows show set name plus concise metadata (release date/year, card count, owned/total or completion where cheap). Do not create giant cards or a second pack-opening flow.

- [ ] **Step 4: Style the Pack Browser for phone use**

Update `styles-v013.css` so the toolbar fits at 360×800, the set list scrolls inside the selector card when needed, the selected row is obvious, and the existing format/price/open button remain accessible without relying on the old native select.

- [ ] **Step 5: Run Pack Browser tests and verify GREEN**

Run: `node tests/v024-pack-browser.test.cjs`

Expected: PASS.

- [ ] **Step 6: Commit/checkpoint**

Commit as `feat: add searchable sortable pack set browser`, or record an archive checkpoint.

---

### Task 6: Release metadata, compatibility, full regression, and packaging

**Files:**
- Modify: `app/build.gradle:11-12`
- Modify: `package.json:2`
- Create: `tests/v024-compat.test.cjs`
- Create: `TEST_REPORT_v0.24.0.md`
- Create: `V0240_REPORT.md`

**Interfaces:**
- Consumes all prior tasks.
- Produces v0.24.0 source package preserving the Android/save identity.

- [ ] **Step 1: Write failing compatibility/release test**

Create `tests/v024-compat.test.cjs` asserting:
- `applicationId 'com.example.luckydex'`;
- `versionCode 240` and `versionName '0.24.0'`;
- package version `0.24.0`;
- save key string `luckyDexSave` unchanged;
- `.github/workflows/build-apk.yml` still references the existing signing secret/keystore contract and no new signing identity is introduced;
- old `state.trade.boards` can remain in a fixture while new market/save/UI fields load without collection loss.

- [ ] **Step 2: Run compatibility test and verify RED**

Run: `node tests/v024-compat.test.cjs`

Expected: FAIL on old v0.23.2 metadata.

- [ ] **Step 3: Bump release metadata only**

Set `versionCode 240`, `versionName '0.24.0'`, and package version `0.24.0`; do not change application ID, save key, or signing workflow.

- [ ] **Step 4: Run targeted v0.24 tests**

Run: `node tests/v024-trade-market.test.cjs && node tests/v024-trade-ui.test.cjs && node tests/v024-pack-browser.test.cjs && node tests/v024-compat.test.cjs`

Expected: PASS.

- [ ] **Step 5: Run full active suite**

Run: `npm test`

Expected: all active `.cjs` tests and offline asset checks PASS. If the local archive environment lacks Playwright/browser dependencies, run all non-browser tests locally, record the exact blocked browser tests, and require GitHub CI to run them before APK installation.

- [ ] **Step 6: Run syntax/integrity checks**

Run the existing JS syntax checks, duplicate-ID check, ZIP CRC verification, and asset integrity scripts used by prior LuckyDex releases.

Expected: zero syntax errors, zero duplicate IDs, valid ZIP, asset audits PASS.

- [ ] **Step 7: Phone QA where browser runtime is available**

At 360×800, 393×873, 412×915 verify:
- Trade cards begin substantially higher than v0.23.2;
- Same/Across/source/view/search switch instantly with no spinner and timer unchanged;
- filter counts agree with visible listings;
- Pack search/sort/direction controls fit without clipping;
- large Physical and Pocket catalogues remain usable;
- choosing a set updates format/price/open flow;
- bottom navigation and system-bar safe areas remain correct.

- [ ] **Step 8: Package and verify from a fresh extraction**

Create `LuckyDex_source.zip` and `LuckyDex_v0.24.0_SOURCE.zip`, SHA-256 files, reports, then extract the exact ZIP and rerun the targeted tests and metadata checks against that extraction.

- [ ] **Step 9: Final commit/checkpoint**

Commit as `release: LuckyDex v0.24.0 trade and pack browser`, or archive the verified source package if no git metadata is present.
