# Sealed Booster Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship LuckyDex v0.26.0 with fully local physical booster artwork, persistent sealed-pack rewards, Open Now / Save for Later after Fossil Dig, and a Sealed Packs collection view reusable by future minigames.

**Architecture:** Keep pack generation/opening in the existing pack pipeline, but introduce a small sealed-inventory model and app-level API around it. Booster art becomes deterministic local APK assets (`tcg-booster-art/<setId>.webp`) with an explicit checked-in manifest used by release audits; runtime no longer queries GitHub for pack art. Fossil Dig banks a sealed set reward and then hands each recovered pack to a post-dig choice queue rather than auto-granting cards.

**Tech Stack:** Android WebView app; JavaScript/HTML/CSS; Node `.cjs` regression tests; Python asset-verification scripts; Gradle/GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-07-sealed-booster-collection-design.md`

## Global Constraints

- Preserve Android `applicationId 'com.example.luckydex'` and the existing permanent LuckyDex signing keystore/certificate.
- Advance only to `versionCode 260` and `versionName '0.26.0'`.
- Save schema advances from `saveVersion: 6` to `saveVersion: 7` without losing existing Pokémon, cards, Arcade progress, profile, inventory, or settings.
- Fossil Dig loose-card chance remains 15%; buried-booster chance remains 4%.
- Excavated loose cards and boosters remain independent of ownership/discovery state.
- Card Shop remains buy-then-open; do not add Buy & Save.
- Only physical TCG boosters participate; do not add TCG Pocket sealed inventory.
- Known booster-eligible physical sets must never require runtime network discovery for booster artwork.
- Sealed pack contents are generated only when opened, not when won or saved.
- No sealed-pack trading, selling, grading/value simulation, or multiple wrapper variants in v0.26.0.

## Review Focus

- **Old/corrupt save data:** malformed `sealedPacks` rows, negative counts, missing names, or unknown set IDs must normalize safely without crashing or deleting unrelated progress. Covered in Task 2 migration tests.
- **Open failure before scene start:** missing/offline set/card data must leave the sealed count unchanged and show an error. Covered in Task 3 transactional-opening tests.
- **Duplicate user actions:** double-tap Open Now / OPEN PACK must consume at most one pack and create at most one active opening. Covered in Task 3 concurrency tests.
- **Multiple boosters from one dig:** each kept booster must receive its own Open Now / Save for Later decision and cave-in-lost boosters must never enter inventory. Covered in Task 4 queue/risk tests.
- **Artwork drift:** adding a new booster-eligible physical set without a local image must fail release verification rather than silently render the generic shell. Covered in Task 1 full-catalogue asset audit.

---

### Task 1: Replace runtime booster-art discovery with complete local assets

**Files:**
- Create: `app/src/main/assets/tcg-booster-art/<setId>.webp` for every genuine booster-eligible physical set
- Create: `app/src/main/assets/booster-art-manifest-v0260.json`
- Create: `app/src/main/assets/booster-art-v0260.js`
- Create: `scripts/verify_booster_art_v0260.py`
- Create: `tests/v0260-booster-art-coverage.test.cjs`
- Modify: `app/src/main/assets/index.html`
- Modify: `.github/workflows/build-apk.yml`
- Remove after replacement: `app/src/main/assets/booster-art-v0259.js`
- Remove after replacement: `app/src/main/assets/booster-art-index-v0259.json`
- Retire from build path: `scripts/build-booster-art-index.py`

**Interfaces:**
- Consumes: physical set IDs exactly as used by LuckyDex (`base1`, `ex1`, `bw1`, `xy1`, `sm1`, `swsh1`, `sv1`, etc.).
- Produces: `window.LuckyDexBoosterArt.ART` (explicit `setId -> local path` map), `setKey(setOrId) -> string`, and `pathFor(setOrId) -> string`; known physical sets resolve synchronously and unknown IDs return `''` without network access. The test must assert `ART` is identical to `booster-art-manifest-v0260.json` so the two explicit manifests cannot drift.

- [ ] **Step 1: Write the failing booster-art coverage test**

Create `tests/v0260-booster-art-coverage.test.cjs` asserting:
- `booster-art-manifest-v0260.json` exists and is a JSON object of `setId -> local asset path`.
- `base1`, one EX-era set, one BW-era set, one XY-era set, one SM-era set, one SWSH-era set, and one SV-era set are present.
- every manifest path begins `tcg-booster-art/`, exists under `app/src/main/assets`, and is larger than a small invalid-file floor (e.g. 4 KiB).
- `booster-art-v0260.js` contains no `github.com`, `raw.githubusercontent.com`, GitHub Contents API, or remote fallback.
- the JS `ART` map exactly equals the JSON manifest and `LuckyDexBoosterArt.pathFor({id:'base1'}) === 'tcg-booster-art/base1.webp'`.

- [ ] **Step 2: Run the new test and verify RED**

Run: `node tests/v0260-booster-art-coverage.test.cjs`
Expected: FAIL because the v0.26.0 manifest/module/assets do not yet exist.

- [ ] **Step 3: Materialize one representative pack image for every physical booster-eligible set**

Use the current LuckyDex physical set catalogue plus `LuckyDexCardAcquisition.setBoosterCatalogEligible(set)` semantics to determine required set IDs. For each required ID, choose one authentic English packshot and save it as exactly `app/src/main/assets/tcg-booster-art/<setId>.webp`; do not preserve remote filenames or variants. Exclude promo-only sets, galleries/subsets, energy-only sets, Trainer Kits/non-booster products, and other sets not sold/opened as a LuckyDex booster.

- [ ] **Step 4: Create the explicit manifest and synchronous local resolver**

Create `booster-art-manifest-v0260.json` with one entry per required set, each value exactly `tcg-booster-art/<setId>.webp`. Create `booster-art-v0260.js` with the same explicit `ART` map plus:

```js
setKey(setOrId) -> string
pathFor(setOrId) -> string
```

`pathFor` must consult only `ART`, be deterministic/local, and return `''` for missing/unsafe/unassigned IDs. The regression test compares the JS map to the JSON manifest exactly, preventing duplicate-source drift.

- [ ] **Step 5: Replace v0.25.9 runtime wiring**

Change `index.html` to load `booster-art-v0260.js`. Remove the GitHub artwork-index generation step from `.github/workflows/build-apk.yml`; replace it with `python3 scripts/verify_booster_art_v0260.py`. Retire the old v0.25.9 resolver/index from runtime.

- [ ] **Step 6: Implement the verifier**

`scripts/verify_booster_art_v0260.py` must fail non-zero if a manifest entry is missing its file, a file is too small/invalid, a manifest path escapes `tcg-booster-art/`, representative era IDs are absent, or a known required booster set lacks an entry. It should print required/covered/missing counts on success/failure.

- [ ] **Step 7: Run asset tests and verifier**

Run:
```bash
node tests/v0260-booster-art-coverage.test.cjs
python3 scripts/verify_booster_art_v0260.py
```
Expected: PASS, with zero missing required booster artworks and `base1.webp` present locally.

- [ ] **Step 8: Commit/checkpoint**

```bash
git add app/src/main/assets/tcg-booster-art app/src/main/assets/booster-art-manifest-v0260.json app/src/main/assets/booster-art-v0260.js app/src/main/assets/index.html scripts/verify_booster_art_v0260.py .github/workflows/build-apk.yml tests/v0260-booster-art-coverage.test.cjs
git commit -m "feat: bundle complete booster artwork"
```
If executing from a ZIP without `.git`, record the completed task in the handover instead of fabricating a commit.

### Task 2: Add save-v7 sealed inventory and reusable inventory model

**Files:**
- Create: `app/src/main/assets/sealed-packs-v0260.js`
- Create: `tests/v0260-sealed-pack-state.test.cjs`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/app-v0167.js:106-195`
- Modify: `tests/recovery-transactions.cjs`
- Modify: `tests/adventure-persistence.test.cjs`

**Interfaces:**
- Consumes: `state.sealedPacks` and stable set metadata `{id|setId, name|setName, source}`.
- Produces pure helpers on `window.LuckyDexSealedPacks`:
  - `normalize(raw) -> object`
  - `rows(raw) -> Array<{setId,setName,source,count}>`
  - `increment(raw,setMeta,amount=1) -> object`
  - `consume(raw,setId,amount=1) -> {inventory, consumed}`
- Produces app-level functions in `app-v0167.js`:
  - `grantSealedPack(setMeta, amount=1) -> number`
  - `getOwnedSealedPacks() -> Array<row>`
  - `openOwnedSealedPack(setId, options={}) -> Promise<boolean>` (implemented transactionally in Task 3; the optional context keeps the one-argument public API valid while allowing Fossil Dig to return to its reward queue)

- [ ] **Step 1: Write failing model/migration tests**

`tests/v0260-sealed-pack-state.test.cjs` must assert normalization drops zero/negative/malformed counts, preserves safe unknown set IDs as text rows, increments counts, and consumes exactly the requested amount without going negative. Add a migration fixture proving a v6 save with Pokémon/cards/custom sentinel data becomes v7 with `sealedPacks:{}` and all existing sentinel data unchanged.

- [ ] **Step 2: Run tests and verify RED**

Run: `node tests/v0260-sealed-pack-state.test.cjs`
Expected: FAIL because the model and save-v7 field do not exist.

- [ ] **Step 3: Implement `sealed-packs-v0260.js` pure helpers**

Use stable rows keyed by set ID. `normalize` must coerce `count` to a non-negative integer, omit zero-count rows, default source to `tcg`, retain a safe text `setName`, and never throw on non-object input.

- [ ] **Step 4: Migrate core app state to saveVersion 7**

In `app-v0167.js`:
- change `defaultState.saveVersion` to `7` and add `sealedPacks:{}`;
- merge/normalize `raw.sealedPacks` during `loadState()`;
- set `migrated.saveVersion=7` and `state.saveVersion=7` in `save()`;
- ensure import/export/reset paths naturally retain/clear sealed inventory with the top-level state;
- expose `grantSealedPack` and `getOwnedSealedPacks` via `window.LuckyDexSealedPackRewards` for future minigames.

- [ ] **Step 5: Load the model before app code**

Add `<script src="sealed-packs-v0260.js"></script>` before `app-v0167.js` in `index.html`.

- [ ] **Step 6: Run persistence tests**

Run:
```bash
node tests/v0260-sealed-pack-state.test.cjs
node tests/recovery-transactions.cjs
node tests/adventure-persistence.test.cjs
```
Expected: PASS; legacy saves retain their unrelated data and normalize to saveVersion 7.

- [ ] **Step 7: Commit/checkpoint**

```bash
git add app/src/main/assets/sealed-packs-v0260.js app/src/main/assets/app-v0167.js app/src/main/assets/index.html tests/v0260-sealed-pack-state.test.cjs tests/recovery-transactions.cjs tests/adventure-persistence.test.cjs
git commit -m "feat: add sealed booster inventory"
```

### Task 3: Add transaction-safe reward opening through the existing pack pipeline

**Files:**
- Create: `tests/v0260-sealed-pack-opening.test.cjs`
- Modify: `app/src/main/assets/pack-flow-v0165.js:721-820`
- Modify: `app/src/main/assets/app-v0167.js` near sealed reward API and pack completion routing

**Interfaces:**
- Consumes: `grantSealedPack`, `state.sealedPacks`, `LuckyDexSealedPacks.consume`, existing `buildBalancedPack`, `buildOfflinePackV13`, `preparedPack`, `renderSealedPack`, `commitPreparedPack`.
- Produces: `preparePackForSetV0260(setId, source='tcg', options={}) -> Promise<boolean>` where options include `{origin, returnTarget, entitlement}`; shop `preparePack()` delegates to it with normal entitlement, sealed rewards call it with `origin:'sealed-reward'`, `returnTarget:'collection-sealed'`, and no entitlement charge.
- Finalizes: `openOwnedSealedPack(setId, options={}) -> Promise<boolean>` consumes exactly one inventory item only after pack preparation succeeds. Supported options: `{returnTarget='collection-sealed', onReturn=null}`; `onReturn` is session-only and is never persisted.

- [ ] **Step 1: Write failing transactional-opening tests**

Assert:
- a sealed-reward preparation never calls/charges shop entitlement;
- an ordinary Card Shop purchase does not increment or otherwise mutate `state.sealedPacks`;
- successful preparation decrements exactly one owned pack and sets `preparedPack.origin === 'sealed-reward'` plus the requested `returnTarget`;
- a thrown/failed set resolution leaves count unchanged;
- two concurrent calls for the same one-count pack result in at most one success;
- `commitPreparedPack()` remains the only place that increments opened-pack/card stats, so saving a pack does not increment `state.stats.packs`.

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/v0260-sealed-pack-opening.test.cjs`
Expected: FAIL because reward-mode pack preparation is not implemented.

- [ ] **Step 3: Refactor pack preparation around `preparePackForSetV0260`**

Extract the existing set/card-resolution branch from `preparePack()` into `preparePackForSetV0260(setId, source, options)`. Keep shop behavior byte-for-byte equivalent from the user’s perspective. Only the entitlement/origin/return target varies.

- [ ] **Step 4: Implement transactional `openOwnedSealedPack`**

Validate ownership, guard the set ID against duplicate in-flight opens, prepare the reward pack first, then decrement one sealed count and save only after `preparedPack` is ready and the sealed pack scene can render. On preparation failure, leave inventory untouched and show an error. Do not refund after the opening scene has successfully started.

- [ ] **Step 5: Route close/summary by opening origin**

For `preparedPack.returnTarget === 'collection-sealed'`, summary and exit controls return to Collection with `collectionMode='sealed'`. If an ephemeral `onReturn` callback was supplied (Fossil Dig), invoke it after pack cleanup so the next reward decision resumes. Ordinary shop packs still say/route BACK TO PACK SHOP. Exiting a consumed reward pack must not re-add it.

- [ ] **Step 6: Make sealed wrapper art fully local**

Change `renderSealedPack()` to use `LuckyDexBoosterArt.pathFor(set)` for physical TCG packs. The generic shell remains only for unknown/corrupt IDs or non-physical sources; `base1` and every manifest-covered set must render the local image.

- [ ] **Step 7: Run pack-opening regression tests**

Run:
```bash
node tests/v0260-sealed-pack-opening.test.cjs
node tests/v0259-global-excavation-booster-art.test.cjs
node tests/v0241-pack-layout.test.cjs
node tests/v0242-pack-declutter.test.cjs
```
Expected: PASS, with shop flow unchanged and reward mode free/transactional.

- [ ] **Step 8: Commit/checkpoint**

```bash
git add app/src/main/assets/pack-flow-v0165.js app/src/main/assets/app-v0167.js tests/v0260-sealed-pack-opening.test.cjs
git commit -m "feat: open owned sealed boosters"
```

### Task 4: Change Fossil Dig from auto-open to sealed reward + post-dig decisions

**Files:**
- Create: `tests/v0260-fossil-sealed-rewards.test.cjs`
- Modify: `app/src/main/assets/arcade-fossil-museum.js:135-185`
- Modify: `app/src/main/assets/app-v0167.js` Fossil Museum bridge
- Modify: `app/src/main/assets/styles-v013.css` or `app/src/main/assets/arcade.css` for the reward-choice card

**Interfaces:**
- Consumes: `LuckyDexFossilMuseumBridge.grantSealedPack`, `openOwnedSealedPack`, `LuckyDexBoosterArt.pathFor`, existing cave-in `keptIds/lostIds` result.
- Produces: Fossil bridge methods `grantSealedPack(setMeta, amount=1)` and `openOwnedSealedPack(setId, options={})`; museum-local queue `pendingSealedRewards` containing only kept/recovered boosters.

- [ ] **Step 1: Write failing Fossil sealed-reward tests**

Assert:
- banking a kept `tcg-booster` calls `grantSealedPack` and never `grantBooster`/card auto-grant;
- haul copy is `<Set> Booster` + `Sealed pack recovered`;
- lost booster IDs from cave-in are never granted;
- manual-safe and normal-complete endings both grant kept boosters;
- multiple kept boosters are queued one at a time;
- Open Now calls `openOwnedSealedPack(setId,{returnTarget:'fossil-result',onReturn})` and advances/resumes the queue only when opening successfully starts;
- Save for Later advances the queue without changing the already-banked count.

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/v0260-fossil-sealed-rewards.test.cjs`
Expected: FAIL because Fossil Dig still auto-opens booster cards.

- [ ] **Step 3: Replace the bridge’s booster auto-grant path**

Remove `grantBooster: grantFossilBoosterV0258` from the Fossil bridge path and expose `grantSealedPack` / `openOwnedSealedPack`. Do not generate cards during excavation or banking.

- [ ] **Step 4: Bank kept boosters as sealed inventory**

In `bankRecoveredFind`, the booster branch stores only set metadata, records the sealed haul entry, and appends the reward to `pendingSealedRewards`. All non-booster reward banking remains unchanged.

- [ ] **Step 5: Add the post-dig Open Now / Save for Later queue UI**

After ordinary result banking, if `pendingSealedRewards.length > 0`, show the current pack’s local art, set name, owned quantity, `OPEN NOW`, and `SAVE FOR LATER`. `OPEN NOW` passes an `onReturn` callback so completing/exiting that pack resumes the next Fossil reward decision instead of dumping the user into Collection. Process multiple rewards sequentially; only after the queue is exhausted are replay/back final.

- [ ] **Step 6: Preserve excavation visuals**

Use `LuckyDexBoosterArt.pathFor(find.boosterReward.set)` for the buried booster sprite so the object in the wall matches the set that will be banked. No remote art resolution is allowed.

- [ ] **Step 7: Run Fossil regressions**

Run:
```bash
node tests/v0260-fossil-sealed-rewards.test.cjs
node tests/v0257-alpha-hitbox-card-rate.test.cjs
node tests/v0254-fossil-card-assets.test.cjs
node tests/v0257-complete-dig-asset-audit.test.cjs
```
Expected: PASS; 15% loose-card and 4% booster rates remain unchanged.

- [ ] **Step 8: Commit/checkpoint**

```bash
git add app/src/main/assets/arcade-fossil-museum.js app/src/main/assets/app-v0167.js app/src/main/assets/styles-v013.css tests/v0260-fossil-sealed-rewards.test.cjs
git commit -m "feat: save excavated boosters sealed"
```

### Task 5: Add Sealed Packs to Collection

**Files:**
- Create: `tests/v0260-sealed-pack-collection.test.cjs`
- Modify: `app/src/main/assets/index.html:300-320`
- Modify: `app/src/main/assets/app-v0167.js:528-575` and the later `rebuildCollectionControls` override around `1212`
- Modify: `app/src/main/assets/collection-trade-v0167.css`
- Modify: `app/src/main/assets/binder-controls.js` only if needed for sealed-mode filter events

**Interfaces:**
- Consumes: `getOwnedSealedPacks()`, `openOwnedSealedPack(setId)`, `LuckyDexBoosterArt.pathFor(setId)`.
- Produces: `collectionMode === 'sealed'` UI with search/set filter, progress summary, pack tiles, count badge, and `OPEN PACK` action.

- [ ] **Step 1: Write failing Collection UI contract tests**

Assert:
- Collection segmented control contains `data-collection="sealed"` with label `Sealed Packs`;
- sealed mode reads `state.sealedPacks`, not `state.cards`;
- binder quick filters and team controls are hidden in sealed mode;
- a tile contains local art path, set name, `×<count>`, and an `OPEN PACK` action;
- empty state is safe;
- unknown/corrupt set IDs render text/placeholder safely and do not throw;
- opening from the tile calls `openOwnedSealedPack` directly rather than navigating through shop.

- [ ] **Step 2: Run test and verify RED**

Run: `node tests/v0260-sealed-pack-collection.test.cjs`
Expected: FAIL because no sealed Collection mode exists.

- [ ] **Step 3: Add the third Collection segment and controls behavior**

Add `<button data-collection="sealed">Sealed Packs</button>`. Update both the primary and late override of `rebuildCollectionControls()` so sealed mode gets a simple `All sealed packs` filter and owned-set grouping, while Pokémon/Card controls continue unchanged.

- [ ] **Step 4: Render sealed progress and tiles**

In `renderCollectionProgress`, sealed mode shows total pack count and unique sealed set count. In `renderCollection`, filter/search `getOwnedSealedPacks()` rows and render responsive tiles with `LuckyDexBoosterArt.pathFor(setId)`, count badge, set name, and `OPEN PACK`.

- [ ] **Step 5: Wire Open Pack and return behavior**

Clicking the sealed tile/action calls `openOwnedSealedPack(setId)`. After pack completion or close, Collection reopens in sealed mode with the decremented quantity reflected; zero-count rows disappear.

- [ ] **Step 6: Add sealed tile styling**

Extend `collection-trade-v0167.css` with `.collection-item.sealed-pack-item` (or equivalent) using contained pack art, readable count badge, and mobile-safe button sizing. Do not reuse card aspect ratio in a way that stretches booster artwork.

- [ ] **Step 7: Run Collection regressions**

Run:
```bash
node tests/v0260-sealed-pack-collection.test.cjs
node tests/v0241-pack-layout.test.cjs
node tests/v0242-pack-declutter.test.cjs
```
Expected: PASS; Pokémon and Card Binder modes remain intact.

- [ ] **Step 8: Commit/checkpoint**

```bash
git add app/src/main/assets/index.html app/src/main/assets/app-v0167.js app/src/main/assets/collection-trade-v0167.css app/src/main/assets/binder-controls.js tests/v0260-sealed-pack-collection.test.cjs
git commit -m "feat: add sealed packs collection"
```

### Task 6: Release identity, full regression, and GitHub-ready source

**Files:**
- Create: `tests/v0260-release.test.cjs`
- Create: `TEST_REPORT_v0.26.0.md`
- Modify: `app/build.gradle`
- Modify: `README.md` only where current version/build behavior is documented

**Interfaces:**
- Consumes: all previous tasks.
- Produces: update-compatible LuckyDex v0.26.0 source with release evidence and no runtime booster-art dependency.

- [ ] **Step 1: Write failing release test**

Assert:
- `applicationId 'com.example.luckydex'` unchanged;
- `versionCode 260` and `versionName '0.26.0'`;
- permanent keystore path/signing config remains unchanged;
- workflow still verifies the established keystore SHA/certificate;
- workflow runs local booster-art verification before APK build;
- no workflow step rebuilds a remote runtime booster-art index.

- [ ] **Step 2: Run release test and verify RED**

Run: `node tests/v0260-release.test.cjs`
Expected: FAIL while Gradle still reports v0.25.9/259.

- [ ] **Step 3: Advance only the Android version fields**

Set `versionCode 260` and `versionName '0.26.0'`. Do not change `applicationId`, keystore file, alias, passwords, signing block, expected keystore SHA, or certificate fingerprint.

- [ ] **Step 4: Run targeted v0.26.0 suite**

Run:
```bash
node tests/v0260-booster-art-coverage.test.cjs
node tests/v0260-sealed-pack-state.test.cjs
node tests/v0260-sealed-pack-opening.test.cjs
node tests/v0260-fossil-sealed-rewards.test.cjs
node tests/v0260-sealed-pack-collection.test.cjs
node tests/v0260-release.test.cjs
python3 scripts/verify_booster_art_v0260.py
python3 scripts/verify_fossil_museum_v0250_assets.py
```
Expected: all PASS.

- [ ] **Step 5: Run syntax and complete non-browser regressions**

Run:
```bash
node --check app/src/main/assets/app-v0167.js
node --check app/src/main/assets/pack-flow-v0165.js
node --check app/src/main/assets/arcade-fossil-museum.js
node --check app/src/main/assets/sealed-packs-v0260.js
node --check app/src/main/assets/booster-art-v0260.js
npm test
```
Expected: all available non-browser tests PASS. If Playwright is unavailable locally, state that explicitly and rely on `.github/workflows/build-apk.yml` for the browser suite; do not claim those tests ran locally.

- [ ] **Step 6: Verify Android update identity**

Run the existing signing-key SHA/certificate verification commands from `.github/workflows/build-apk.yml` against `app/luckydex-dev.keystore`. Confirm the package ID and signer match the established LuckyDex identity before packaging.

- [ ] **Step 7: Write `TEST_REPORT_v0.26.0.md`**

Record exact commands, pass counts, any unavailable browser/Gradle checks, booster-art required/covered counts, and the confirmed package/signing/version identity.

- [ ] **Step 8: Produce the GitHub-ready source ZIP**

Package the source tree without build outputs, caches, `.gradle`, or `node_modules`. Confirm the ZIP contains the local `tcg-booster-art/` directory, v0.26.0 manifest/module, spec, plan, workflow, and permanent signing configuration.

- [ ] **Step 9: Commit/checkpoint**

```bash
git add app/build.gradle README.md TEST_REPORT_v0.26.0.md tests/v0260-release.test.cjs
git commit -m "release: LuckyDex v0.26.0"
```
If the execution workspace has no `.git`, skip only the commit command and report that limitation; all verification and packaging steps still apply.
