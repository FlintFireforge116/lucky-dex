# LuckyDex v0.25.3 Rarity, Museum, and Tile Puzzle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.25.3 with one authoritative card-rarity model, jackpot-grade Secret Rare reveals, a true fullscreen authentic Oreburgh Museum, and a curated offline Tile Puzzle image library.

**Architecture:** Keep the three approved workstreams independent. Add one shared card-classification module consumed by pack/economy/trade/UI code; make the Museum a landscape scene with overlay controls and case-relative pixel exhibits; replace Tile Puzzle's generated composite source canvas with a small static manifest of coherent local Pokémon scenes. A final integration task owns versioning, signer preservation, regression and packaging.

**Tech Stack:** Android WebView; vanilla JavaScript/HTML/CSS; local PNG/JPG assets; Node `.cjs` regression tests.

**Spec:** `docs/superpowers/specs/2026-10-06-v0253-rarity-museum-tile-design.md`

## Global Constraints

- Preserve `applicationId 'com.example.luckydex'` and the permanent keystore bytes unchanged.
- Release target is **v0.25.3 / versionCode 253**.
- Existing saves/cards/museum discoveries/Arcade records remain readable without destructive migration.
- All new runtime visuals ship locally in the APK; no runtime network dependency.
- Promo remains a separate acquisition/trade class and v0.24.8 promo economy remains unchanged.
- Fossil Dig cave-in/reward mechanics from v0.25.2 remain unchanged.
- Tile Puzzle rules/rewards remain unchanged: Easy 4×5, Normal 5×6, Hard 6×8.
- This extracted source has no Git history. During Native execution, replace commit steps with a ledger checkpoint naming changed files and passing command; do not fabricate commits.

## Review Focus

1. A source rarity string containing `Holo` must not let finish semantics overwrite the printed rarity class; Task 1 tests `Common + Reverse Holo`, `Rare Holo`, and source-vs-fallback precedence.
2. Secret cards with an additional Gold/Hyper/Crown trait must stay Secret while using the chase visual style; Task 1/2 test both classification and reveal wording.
3. Promo cards must continue to match only Promo in trading and keep promo-specific Dust economics; Task 2 runs the v0.24.7/v0.24.8 contracts plus new shared-model assertions.
4. Museum exhibit sprites must never escape or overlap their real case surfaces at narrow/wide landscape aspect ratios; Task 4 tests slot bounds and produces an all-exhibits visual sanity render.
5. Curated Tile Puzzle scenes with different aspect ratios must remain readable at 4×5, 5×6 and 6×8; Task 5 tests the manifest and produces representative sliced previews.

---

## Workstream A — Canonical rarity and Secret Rare treatment

### Task 1: Shared normalized card classification

**Files:**
- Create: `app/src/main/assets/card-rarity-v0253.js`
- Modify: `app/src/main/assets/index.html`
- Test: `tests/v0253-card-rarity.test.cjs`

**Interfaces:**
- Produces `window.LuckyDexCardRarity` / CommonJS API with:
  - `classify(card, set?) -> { originalRarity, rarityClass, tier, finish, chaseTraits, impactTier, impactStyle, revealLabel, isRareHit }`
  - `tier(cardOrRarity) -> 0..6`
  - `finish(card) -> 'normal'|'holo'|'reverse-holo'|'textured'|'special-foil'`
  - `tradeClass(card,set?) -> 'promo'|'achievement'|0..6`
  - `dustTier(card) -> 0..6`
- `rarityClass` stable values: `common`, `uncommon`, `rare`, `double-rare`, `ultra`, `illustration`, `special-illustration`, `secret`, `promo`, `unknown`.
- Source `card.rarity` is authoritative when present; name/other text inference is fallback only when source rarity is empty/unknown.

- [ ] **Step 1: Write the failing classification contract**
  - Assert `Common + _foil:'Reverse Holo'` => `rarityClass:'common'`, `tier:0`, `finish:'reverse-holo'`.
  - Assert `Rare Holo` => printed class `rare`, `finish:'holo'`, tier 2.
  - Assert source `rarity:'Common'` on a card named `Secret Rare Something` remains Common.
  - Assert missing rarity + secret-style fallback can classify Secret.
  - Assert plain `Secret Rare` => `rarityClass:'secret'`, `impactTier:6`, `revealLabel:'SECRET RARE'`.
  - Assert `Gold Secret Rare` preserves `rarityClass:'secret'`, includes `gold`, uses `impactStyle:'gold'`, and label contains both `GOLD` and `SECRET RARE`.
  - Assert Promo => `tradeClass:'promo'`.

- [ ] **Step 2: Run `node tests/v0253-card-rarity.test.cjs`**
  - Expected: FAIL because `card-rarity-v0253.js`/API does not exist.

- [ ] **Step 3: Implement `LuckyDexCardRarity` and load it before acquisition/pack/app/trade scripts**
  - Normalize era labels without discarding `originalRarity`.
  - Derive finish independently from `_foil`, finish metadata, and explicit source rarity wording where necessary.
  - Keep a small `OVERRIDES` map keyed by canonical card id for known bad upstream rows; default empty is valid.

- [ ] **Step 4: Re-run the Task 1 test**
  - Expected: PASS.

- [ ] **Step 5: Ledger checkpoint**
  - Record changed files and `node tests/v0253-card-rarity.test.cjs` result.

### Task 2: Make pack/economy/trade/UI consume the shared model

**Files:**
- Modify: `app/src/main/assets/pack-opening-v0160.js`
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/pack-flow-v0165.js`
- Modify: `app/src/main/assets/trade-v0163.js`
- Modify: `app/src/main/assets/card-acquisition-v0246.js` only where promo value-band classification needs the shared traits while preserving existing costs.
- Modify: `app/src/main/assets/pack-opening-v0160.css`
- Test: `tests/v0253-rarity-consumers.test.cjs`
- Regression: `tests/v0245-pull-promos-small-packs.test.cjs`, `tests/v0247-trade-dust-promo-search.test.cjs`, `tests/v0248-promo-economy-filter.test.cjs`

**Interfaces:**
- Consumes Task 1 `LuckyDexCardRarity.classify/tier/tradeClass/dustTier`.
- `LuckyDexPack.profileFor(card)` remains public for compatibility but delegates rarity/impact decisions to the shared classifier.
- Existing global `rarityTier()` remains as compatibility wrapper and delegates to `LuckyDexCardRarity.tier(...)`.

- [ ] **Step 1: Write failing consumer tests**
  - `profileFor({rarity:'Secret Rare'})` => maximum level with explicit Secret label/style.
  - Gold Secret => maximum gold-style reveal with Secret wording.
  - Common Reverse Holo => reveal can show reverse finish but economy/trade tier remains Common.
  - Static assertions require pack targeting, Dust, Rare Hits, collection badges and trade matching to call the shared classifier/wrapper rather than their own rarity regex tables.
  - Rare Hits store/display explicit Secret Rare wording.

- [ ] **Step 2: Run new and three regression files**
  - Expected new test: FAIL on current fuzzy consumers; older promo/trade tests remain green before implementation.

- [ ] **Step 3: Replace consumer rarity decisions with shared API**
  - Preserve pack plan numeric tiers and promo economics.
  - Update `profileFor` timing/particles so Secret uses level 6 maximum impact.
  - Keep Gold/Hyper/Crown style while Secret remains explicit in label.
  - Update collection modal badge/tier label and Rare Hits wording to use normalized classification.

- [ ] **Step 4: Add Secret-specific persistent/reveal CSS**
  - Add a `secret`/trait class or data attribute without removing existing gold/prismatic/legend styles.

- [ ] **Step 5: Run Task 2 tests + regressions**
  - Expected: all PASS.

- [ ] **Step 6: Ledger checkpoint**

---

## Workstream B — Fullscreen authentic Oreburgh Museum

### Task 3: Replace inconsistent museum/mining art with authentic pixel assets

**Files:**
- Modify: `app/src/main/assets/arcade-fossil-museum-core.js`
- Create/modify: `app/src/main/assets/arcade/fossil-museum-v0253/manifest.json`
- Create/modify: `app/src/main/assets/arcade/fossil-museum-v0253/items/*`
- Create: `app/src/main/assets/arcade/fossil-museum-v0253/SOURCES.md`
- Test: `tests/v0253-museum-assets.test.cjs`

**Interfaces:**
- Item ids and excavation masks from v0.25.2 remain unchanged.
- `item.sprite` changes only to an authentic local pixel asset path.

- [ ] **Step 1: Write the failing asset/style contract**
  - Require every museum-eligible fossil/relic/stone to resolve to the v0.25.3 authentic manifest.
  - Reject references to `fossil-museum-v0252/mining/` for museum/excavation presentation.
  - Require source/provenance entry for each new/copied authentic sprite.
  - Require all files listed by the manifest to exist and decode as images.

- [ ] **Step 2: Run `node tests/v0253-museum-assets.test.cjs`**
  - Expected: FAIL because the v0.25.3 authentic manifest does not exist.

- [ ] **Step 3: Build the authentic pixel asset set**
  - Prefer existing genuine project assets (`arcade/sprites/items`, `fossil-museum-v0250/items`) when correct.
  - Where a more accurate sprite is required, add the authentic game/item sprite locally and document source in `SOURCES.md`.
  - Do not generate painterly replacements or anti-aliased enlargements.

- [ ] **Step 4: Point core item records at the authentic assets without changing masks/rewards**

- [ ] **Step 5: Run the asset contract**
  - Expected: PASS.

- [ ] **Step 6: Generate a contact sheet for visual sanity**
  - Save to the execution workspace, not runtime assets.
  - Inspect for HD/painterly mismatches and tiny/blurred accidental scaling.

- [ ] **Step 7: Ledger checkpoint**

### Task 4: Rebuild Museum as a fullscreen landscape scene with real case-relative slots

**Files:**
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/arcade.css`
- Modify: `app/src/main/assets/arcade-fossil-museum.js`
- Test: `tests/v0253-museum-fullscreen.test.cjs`

**Interfaces:**
- Consumes Task 3 local sprites.
- Preserves `open('museum')`, `close('museum')`, `renderMuseum()` and Android `setOrientation('landscape'/'portrait')` behavior.
- `MUSEUM_CASES` stays limited to `topA/topB/topC`, `outerTop/outerMid/outerLow`, `innerUpper/innerLower`, `pedestal`.

- [ ] **Step 1: Write failing fullscreen/placement tests**
  - Museum markup contains no permanent `museum-info-v0252` side panel/copy column.
  - Back control and exhibit count are overlay controls over the scene.
  - Plaque is hidden overlay/bottom-sheet markup, not layout column content.
  - CSS gives scene stage the available landscape surface and applies `image-rendering: pixelated` to room/exhibits.
  - Case ids are exactly the 3 rear + 3 right + 2 inner + pedestal set.
  - Every placement references an existing slot, stays within its case slot bounds, and no pair of slots overlaps beyond the test tolerance.
  - Open Museum requests landscape; close requests portrait.

- [ ] **Step 2: Run `node tests/v0253-museum-fullscreen.test.cjs`**
  - Expected: FAIL on existing side-column layout.

- [ ] **Step 3: Replace museum HTML/CSS with scene-first fullscreen composition**
  - Room stage is the primary surface; small Back + count overlays only.
  - Plaque overlays the lower scene and closes without resizing the room.
  - Use nearest-neighbour rendering and bounded sprite sizes from case slots.

- [ ] **Step 4: Tighten case-relative slot geometry and exhibit scaling**
  - Use only authentic furniture; do not add display cases.
  - Odd Keystone remains pedestal-prominent.

- [ ] **Step 5: Run Task 4 test**
  - Expected: PASS.

- [ ] **Step 6: Render an all-exhibits museum sanity image**
  - Verify no overlap/floor/doorway placements and that the room is visually dominant at a representative phone landscape size.

- [ ] **Step 7: Ledger checkpoint**

---

## Workstream C — Curated Tile Puzzle scenes

### Task 5: Replace synthetic Tile Puzzle generator with curated local scene manifest

**Files:**
- Create: `app/src/main/assets/arcade-tile-scenes-v0253.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/arcade-amie.js`
- Modify: `app/src/main/assets/arcade-amie.css` only if preview sizing needs it.
- Test: `tests/v0253-tile-puzzle-scenes.test.cjs`

**Interfaces:**
- `window.LuckyDexTileScenesV0253` exposes an immutable array of `{id,title,src,position?}` local scene entries.
- Initial curated pool uses coherent existing local Pokémon/game scenes, including at least: Celadon Game Corner, Goldenrod Game Corner, Ruins of Alph, Indigo Plateau, Lilycove Contest Hall, Oreburgh Museum, Moon Stage, and Kalos Amie Garden where the source image passes readability checks.
- `prepareTile(running)` selects one manifest entry, avoiding immediate repeat when pool length > 1.
- Board/swap/reward APIs remain unchanged.

- [ ] **Step 1: Write the failing Tile Puzzle contract**
  - Manifest has at least 8 unique local scenes and every path exists.
  - `arcade-amie.js` no longer calls the synthetic `participants(3)` / berry-prop composition for Tile Puzzle.
  - Tile source draws the selected scene image only.
  - Immediate scene repeat is avoided when another scene is available.
  - Easy/Normal/Hard dimensions remain 4×5 / 5×6 / 6×8.

- [ ] **Step 2: Run `node tests/v0253-tile-puzzle-scenes.test.cjs`**
  - Expected: FAIL because manifest does not exist and synthetic composition remains.

- [ ] **Step 3: Implement the curated scene manifest and load it before `arcade-amie.js`**

- [ ] **Step 4: Replace Tile Puzzle source generation**
  - Load selected local image, draw with aspect-preserving cover/position, use scene title in target preview.
  - Keep existing board generation, tap-to-swap, timer, scoring and rewards.

- [ ] **Step 5: Run Task 5 test**
  - Expected: PASS.

- [ ] **Step 6: Generate representative 4×5, 5×6, 6×8 sliced previews**
  - Inspect at least three different scenes for readability and crop quality.

- [ ] **Step 7: Ledger checkpoint**

---

## Integration and release

### Task 6: Compatibility, offline integrity, and v0.25.3 release

**Files:**
- Modify: `app/build.gradle`
- Modify: `package.json`
- Modify only superseded older tests where they encode retired v0.25.2 museum side-column/synthetic-tile/rarity behavior; preserve the behavior they still protect.
- Create: `TEST_REPORT_v0.25.3.md`
- Create: `V0253_REPORT.md`
- Test: `tests/v0253-release.test.cjs`

**Interfaces:**
- Consumes Tasks 1–5.
- Produces GitHub-ready `LuckyDex_source.zip` and `LuckyDex_source_v0.25.3.zip` at repository root packaging level.

- [ ] **Step 1: Write failing release contract**
  - Require `versionCode 253`, `versionName '0.25.3'`, package version `0.25.3`.
  - Require `applicationId 'com.example.luckydex'` unchanged.
  - Require canonical keystore SHA-256 unchanged.
  - Require script ordering: rarity module before acquisition/pack/app/trade; Tile scene manifest before `arcade-amie.js`.

- [ ] **Step 2: Run release contract**
  - Expected: FAIL on current 252/0.25.2 metadata.

- [ ] **Step 3: Bump release metadata and update only superseded historical assertions**

- [ ] **Step 4: Run targeted v0.25.3 tests and key compatibility suites**
  - `node tests/v0253-card-rarity.test.cjs`
  - `node tests/v0253-rarity-consumers.test.cjs`
  - `node tests/v0253-museum-assets.test.cjs`
  - `node tests/v0253-museum-fullscreen.test.cjs`
  - `node tests/v0253-tile-puzzle-scenes.test.cjs`
  - `node tests/v0253-release.test.cjs`
  - v0.24.7, v0.24.8, v0.25.0–v0.25.2 compatibility files relevant to these systems.
  - Expected: PASS.

- [ ] **Step 5: Run the full project test command**
  - Run `npm test` if Playwright dependency is available.
  - If Playwright is unavailable, run every `.cjs` test individually and classify only `Cannot find module 'playwright'` as environment skips; any other non-zero result is a failure.

- [ ] **Step 6: Run JS syntax + offline asset-integrity checks and visual sanity outputs**
  - Ensure all new local scene/item paths resolve.

- [ ] **Step 7: Verify signer/application identity on the exact tree to be zipped**
  - `sha256sum app/luckydex-dev.keystore` must equal `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.

- [ ] **Step 8: Write release/test reports, package both ZIP names, and verify archive integrity**
  - ZIP root contains repository files directly, not a nested parent folder.
  - Archived `build.gradle`, `package.json`, and keystore match the verified tree.

- [ ] **Step 9: Final whole-change review**
  - Review rarity separation, Secret treatment, museum visual consistency/fullscreen behavior, and Tile scene readability against the approved spec.

- [ ] **Step 10: Ledger checkpoint and handoff**

## Self-review result

- **Spec coverage:** all canonical rarity/finish, Secret Rare, downstream consumers, fullscreen museum, authentic pixel assets, real case slots, curated Tile scenes, offline/update, visual sanity and release requirements map to Tasks 1–6.
- **Type consistency:** Tasks 2 and release tests consume exactly the Task 1 classification API; museum and Tile workstreams do not depend on rarity internals.
- **Review focus:** all five high-risk cases have explicit task tests.
- **Scope:** no achievements, museum avatar, cave-in redesign, Tile ruleset change, or promo economy redesign is included.
