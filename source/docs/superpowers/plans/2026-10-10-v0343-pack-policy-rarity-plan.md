# LuckyDex v0.34.3 Pack Policy & Rarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace LuckyDex's rigid physical/Pocket pack generator with a data-driven pack policy that models real product sizes/slots/subsets/prices, while auditing all card rarities and giving each rarity an appropriate reveal profile.

**Architecture:** Add one pure UMD policy module, `pack-policy-v0343.js`, as the source of truth for product resolution, slot descriptors, subset-parent mapping, price, pack size, rate family and purchase eligibility. Keep card acquisition/network hydration in `app-v0167.js`; it consumes policy slot descriptors rather than inventing numeric tier plans. Keep `card-rarity-v0253.js` as the canonical printed-rarity classifier, but separate economy tier from reveal rank so Illustration Rare can be more dramatic than Ultra Rare without distorting trade/dust balance.

**Tech Stack:** Vanilla JavaScript/UMD, Android WebView, Node.js CJS tests, existing LuckyDex pack/reveal modules.

**Spec:** `docs/superpowers/specs/2026-10-10-luckydex-v0343-release-design.md`

## Global Constraints

- Baseline source: `LuckyDex_source_v0.34.2.zip`.
- Keep Android application/package identity unchanged for in-place updates.
- Preserve all existing saves, collection ownership, sealed packs, currencies, achievements, Adventure progress, Arcade progress, and v0.34.1/v0.34.2 stability fixes.
- No online-only pack simulation: cached/installed sets must still open when the current code already supports them offline.
- No promo cards may become ordinary booster pulls unless the real product explicitly collates them into that pack.
- Existing Card Binder set-picker redesign remains unchanged.
- Current God Pack system remains a separate pack-level LuckyDex event; normal pack realism must not accidentally increase its frequency.
- Version name: `0.34.3`; version code: `343`.

## Review Focus

- Unknown/future rarity strings must be diagnostic `unknown`, never silently downgraded to Uncommon.
- A subset represented as its own catalogue row must remain collectible/searchable while disappearing as a standalone booster product.
- Offline sealed-pack opening must use the same profile/slot policy as online opening and never charge coins/tickets.
- Same card identity may only repeat when the data model can distinguish a legitimate parallel finish/printing.
- God Pack odds stay exactly `1/1000`; the new policy may change card count but not pack-level trigger frequency.

---

### Task 1: Add the pure pack-policy source of truth

**Files:**
- Create: `app/src/main/assets/pack-policy-v0343.js`
- Modify: `app/src/main/assets/index.html:475-483`
- Test: `tests/v0343-pack-policy.test.cjs`

**Interfaces:**
- Produces: `LuckyDexPackPolicy.resolve(set, source='tcg') -> PackProfile`
- Produces: `LuckyDexPackPolicy.packSizeFor(set, source='tcg') -> number`
- Produces: `LuckyDexPackPolicy.priceFor(set, source='tcg') -> number`
- Produces: `LuckyDexPackPolicy.slotPlan(set, {source='tcg', luckyPack=false}={}) -> SlotDescriptor[]`
- Produces: `LuckyDexPackPolicy.isPurchasable(set, source='tcg') -> boolean`
- Produces: `LuckyDexPackPolicy.parentFor(set) -> {id?:string,name:string}|null`
- Produces: `LuckyDexPackPolicy.rateFamilyFor(set, source='tcg') -> string`

- [ ] **Step 1: Write the failing policy-resolution test**

Create assertions for `wotc_11=11/650`, `ecard_ex_9=9/550`, `dp_bw_xy_10=10/600`, `sm_swsh_10=10/600`, `sv_10=10/600`, Dragon Vault `5/400`, Double Crisis `7/450`, Detective Pikachu `4/325`, Generations `10/650`, Celebrations `4/375`, and 30th Celebration `6/500`.

- [ ] **Step 2: Run the new test and verify RED**

Run: `node tests/v0343-pack-policy.test.cjs`
Expected: FAIL because `pack-policy-v0343.js` does not exist.

- [ ] **Step 3: Implement `pack-policy-v0343.js`**

Define explicit special-product overrides first, then subset mapping, then era/date fallback. `PackProfile` must expose at least `{id,source,cardCount,price,rateFamily,purchasable,parent,slots}`. Physical fallback is `sv_10`; Pocket profiles remain separate.

- [ ] **Step 4: Load the policy before pack-opening/app code**

Insert `<script src="pack-policy-v0343.js"></script>` after `card-rarity-v0253.js` and before `pack-opening-v0160.js` / `app-v0167.js` consumers.

- [ ] **Step 5: Run the policy test and verify GREEN**

Run: `node tests/v0343-pack-policy.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/pack-policy-v0343.js app/src/main/assets/index.html tests/v0343-pack-policy.test.cjs
git commit -m "feat: add v0.34.3 pack policy"
```

### Task 2: Model subset-parent products and slot structures

**Files:**
- Modify: `app/src/main/assets/pack-policy-v0343.js`
- Modify: `app/src/main/assets/pack-flow-v0165.js:514-586`
- Modify: `app/src/main/assets/card-acquisition-v0246.js`
- Test: `tests/v0343-pack-collation.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexPackPolicy.resolve`, `slotPlan`, `isPurchasable`, `parentFor`.
- Produces: slot descriptors with exact fields `{id,pool,allowedClasses,finish,replacements,rareOrHigher,allowParallelRepeat}`.

- [ ] **Step 1: Write failing subset/shop tests**

Assert Brilliant Stars/Astral Radiance/Lost Origin/Silver Tempest Trainer Galleries, Crown Zenith Galarian Gallery, Hidden Fates Shiny Vault, Celebrations Classic Collection and 30th Celebration Classic Collection are not standalone purchasable boosters, while `parentFor()` resolves each to the correct parent product.

- [ ] **Step 2: Write failing slot-plan tests**

Assert Generations yields `8 core + 2 subset`, Scarlet & Violet yields `4 common + 3 uncommon + 3 foil/replacement`, 30th Celebration yields `5 core foil + 1 energy`, and the other special products expose the required counts.

- [ ] **Step 3: Run and verify RED**

Run: `node tests/v0343-pack-collation.test.cjs`
Expected: FAIL on subset/product/slot assertions.

- [ ] **Step 4: Implement subset mappings and slot descriptors**

Keep subset collection identity untouched; only filter booster-shop rows and pack collation. Do not infer special profiles from set size.

- [ ] **Step 5: Update physical pack catalogue filtering**

Make pack-shop lists call `LuckyDexPackPolicy.isPurchasable(set,'tcg')` in addition to existing promo eligibility.

- [ ] **Step 6: Add Pocket-separation assertions**

Assert Pocket profiles do not reuse physical slot descriptors, preserve cards 1–3 low-rarity positioning, preserve richer card 4/5 tables, and keep known 4-card Deluxe handling separate. If the local dataset exposes a bonus-card variant, assert its count/profile explicitly.

- [ ] **Step 7: Run and verify GREEN**

Run: `node tests/v0343-pack-collation.test.cjs`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/src/main/assets/pack-policy-v0343.js app/src/main/assets/pack-flow-v0165.js app/src/main/assets/card-acquisition-v0246.js tests/v0343-pack-collation.test.cjs
git commit -m "feat: model physical booster collation"
```

### Task 3: Replace numeric physical-tier plans with slot-driven pack building

**Files:**
- Modify: `app/src/main/assets/app-v0167.js:1144-1206,1433-1463`
- Modify: `app/src/main/assets/god-pack-v0291.js`
- Test: `tests/v0343-pack-builder.test.cjs`
- Test: `tests/v0291-god-pack.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexPackPolicy.slotPlan(set,{source,luckyPack})`.
- Produces: `pickCardForDescriptorV0343(briefs, descriptor, chosen, signal, set, source) -> Promise<Card>`.
- Produces: updated `buildBalancedPack(...)` and `buildOfflinePackV13(...)` with identical profile semantics.

- [ ] **Step 1: Write failing builder tests**

Use synthetic sets with explicit rarity/finish/subset metadata and assert output count, source pool, guaranteed rare-or-higher behavior, subset inclusion, and no same-print duplicate where alternatives exist.

- [ ] **Step 2: Add a legitimate parallel-repeat test**

Assert normal + reverse of the same underlying card is allowed only when the two records/finish descriptors are distinguishable and `allowParallelRepeat` permits it.

- [ ] **Step 3: Run and verify RED**

Run: `node tests/v0343-pack-builder.test.cjs`
Expected: FAIL because `buildBalancedPack` still consumes `[tier,variant]` pairs.

- [ ] **Step 4: Implement `pickCardForDescriptorV0343` and update online builder**

Select from descriptor-eligible cards first; only fall back within the descriptor's declared replacement/fallback rules. Remove physical use of `hitTierForSource('tcg')` and `physicalPackSlotsV250`.

- [ ] **Step 5: Update offline builder to use the same descriptors**

Cached/offline packs must use the same profile, subset and finish semantics; only artwork/network hydration differs.

- [ ] **Step 6: Update God Pack count lookup only**

Use `LuckyDexPackPolicy.packSizeFor(set,source)` for physical card count while retaining `PRODUCTION_DENOMINATOR=1000` and existing God Pack target logic.

- [ ] **Step 7: Run builder and God Pack tests**

Run: `node tests/v0343-pack-builder.test.cjs && node tests/v0291-god-pack.test.cjs`
Expected: PASS; God Pack odds assertion remains `1000`.

- [ ] **Step 8: Commit**

```bash
git add app/src/main/assets/app-v0167.js app/src/main/assets/god-pack-v0291.js tests/v0343-pack-builder.test.cjs tests/v0291-god-pack.test.cjs
git commit -m "feat: build packs from slot policy"
```

### Task 4: Make price/card count/entitlements consume the policy

**Files:**
- Modify: `app/src/main/assets/app-v0167.js:15,446-451,1194-1212,1478-1495`
- Modify: `app/src/main/assets/pack-flow-v0165.js:738-812`
- Test: `tests/v0343-pack-entitlement.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexPackPolicy.priceFor`, `packSizeFor`, `resolve`.
- Produces: `packEntitlement(set?, source?) -> {mode,label,cost}` while preserving no-arg DOM compatibility.

- [ ] **Step 1: Write failing entitlement/price tests**

Assert 11-card WotC costs 650, 4-card Celebrations costs 375, daily/ticket mode returns cost 0 but still builds the selected profile, and sealed packs consume sealed inventory without touching coins/tickets.

- [ ] **Step 2: Run and verify RED**

Run: `node tests/v0343-pack-entitlement.test.cjs`
Expected: FAIL because physical packs still use `PACK_COST.tcg=600`.

- [ ] **Step 3: Remove physical global-price assumptions**

Keep Pocket's existing price branch; resolve physical price from the selected set policy. Update pack button copy, pack count badge/title, offline readiness count and purchase validation from the same profile.

- [ ] **Step 4: Preserve entitlement timing**

Do not spend currency until the existing commit path calls `consumePackEntitlement()`; daily/ticket/sealed logic stays transactional.

- [ ] **Step 5: Run and verify GREEN**

Run: `node tests/v0343-pack-entitlement.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/app-v0167.js app/src/main/assets/pack-flow-v0165.js tests/v0343-pack-entitlement.test.cjs
git commit -m "feat: price packs by product profile"
```

### Task 5: Audit canonical rarity classes and separate reveal rank from economy tier

**Files:**
- Modify: `app/src/main/assets/card-rarity-v0253.js`
- Test: `tests/v0343-rarity-audit.test.cjs`
- Test: `tests/v0253-card-rarity.test.cjs`

**Interfaces:**
- Produces: `LuckyDexCardRarity.classify(card,set?)` retaining `{rarityClass,tier,finish,impactTier,impactStyle,revealLabel}` and adding `{revealRank,revealStyle}`.
- Compatibility: `tier()` remains economy/trade/dust tier; reveal ordering uses `revealRank`.

- [ ] **Step 1: Write failing rarity fixture tests**

Cover Common, Uncommon, Rare/Holo, Double Rare, Ultra Rare, Illustration Rare, Special Illustration Rare, Secret/Hyper/Gold/Crown, LEGEND, Prime, LV.X, BREAK, Shining, Radiant, Amazing Rare, ACE SPEC, Character/Trainer Gallery and Pocket Diamond/Star/Shiny/Crown labels.

- [ ] **Step 2: Add explicit ordering assertions**

Assert `Double Rare < Ultra Rare < Illustration Rare < Special Illustration Rare` by `revealRank`, and `LEGEND` resolves to a dedicated non-unknown class/style/label `LEGEND PULL`.

- [ ] **Step 3: Run and verify RED**

Run: `node tests/v0343-rarity-audit.test.cjs`
Expected: FAIL for LEGEND and IR-vs-Ultra ordering.

- [ ] **Step 4: Expand classifier aliases and reveal metadata**

Keep finish decoration orthogonal to printed rarity. Unknown strings return `rarityClass:'unknown'` plus a diagnostic label/value; do not map unknown to Uncommon behavior.

- [ ] **Step 5: Run canonical rarity regressions**

Run: `node tests/v0343-rarity-audit.test.cjs && node tests/v0253-card-rarity.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/card-rarity-v0253.js tests/v0343-rarity-audit.test.cjs tests/v0253-card-rarity.test.cjs
git commit -m "feat: audit card rarity classification"
```

### Task 6: Give every rarity an appropriate reveal profile

**Files:**
- Modify: `app/src/main/assets/pack-opening-v0160.js`
- Modify: `app/src/main/assets/pack-opening-v0160.css`
- Test: `tests/v0343-rarity-reveal.test.cjs`
- Test: `tests/v0253-rarity-consumers.test.cjs`

**Interfaces:**
- Consumes: `LuckyDexCardRarity.classify(card).revealRank/revealStyle/revealLabel`.
- Produces: `LuckyDexPack.profileFor(card) -> RevealProfile` with style-specific timing/effects/haptic data.

- [ ] **Step 1: Write failing reveal-profile tests**

Assert IR's reveal duration/effect strength exceeds Ultra and Double Rare, SIR exceeds IR, LEGEND uses `style:'legend'` and `label:'LEGEND PULL'`, and finishes add polish without changing economy rarity.

- [ ] **Step 2: Run and verify RED**

Run: `node tests/v0343-rarity-reveal.test.cjs`
Expected: FAIL because IR/Ultra currently share impact tier 4 and LEGEND falls through shared classification.

- [ ] **Step 3: Refactor `profileFor(card)` around reveal rank/style**

Create distinct style treatments for Double Rare, Ultra, Illustration, SIR, historic chase families, LEGEND, rainbow/prismatic, Secret, Gold/Hyper and Crown. Preserve existing fallback static reveal and reveal-session crash containment.

- [ ] **Step 4: Add CSS hooks for the new styles**

Add persistent classes/effects without introducing image blur or breaking reduced/recovered static reveal.

- [ ] **Step 5: Run reveal and existing consumer tests**

Run: `node tests/v0343-rarity-reveal.test.cjs && node tests/v0253-rarity-consumers.test.cjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/pack-opening-v0160.js app/src/main/assets/pack-opening-v0160.css tests/v0343-rarity-reveal.test.cjs tests/v0253-rarity-consumers.test.cjs
git commit -m "feat: differentiate rarity reveal theatrics"
```

### Task 7: Add rate families and diagnostics

**Files:**
- Modify: `app/src/main/assets/pack-policy-v0343.js`
- Modify: `app/src/main/assets/app-v0167.js`
- Create: `scripts/audit-v0343-pack-policy.cjs`
- Test: `tests/v0343-pack-diagnostics.test.cjs`

**Interfaces:**
- Produces: `LuckyDexPackPolicy.rateFamilyFor(set,source)` and `LuckyDexPackPolicy.diagnostics(sets,rarities) -> DiagnosticRow[]`.
- Consumes: slot replacement weights to model classic, EX/e-Card, DP/BW/XY, SM/SWSH, SV standard, SV high-density, celebration/all-holo and HGSS LEGEND families.

- [ ] **Step 1: Write failing diagnostic tests**

Assert every supplied physical fixture resolves a profile, every subset resolves parent-or-standalone, `LEGEND` is never unknown, and an invented future rarity is reported as unknown rather than treated as ordinary.

- [ ] **Step 2: Run and verify RED**

Run: `node tests/v0343-pack-diagnostics.test.cjs`
Expected: FAIL until diagnostics exist.

- [ ] **Step 3: Implement named simulation families**

Document exact LuckyDex simulation weights in code comments/constants. HGSS LEGEND must have an explicit documented rare-chase rate family rather than generic tier weighting.

- [ ] **Step 4: Add the audit script**

The script reports unknown profiles/rarities and exits nonzero for policy gaps in the local catalogue fixtures it can inspect.

- [ ] **Step 5: Run and verify GREEN**

Run: `node tests/v0343-pack-diagnostics.test.cjs && node scripts/audit-v0343-pack-policy.cjs`
Expected: PASS / no unresolved known labels in audited fixtures.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/assets/pack-policy-v0343.js app/src/main/assets/app-v0167.js scripts/audit-v0343-pack-policy.cjs tests/v0343-pack-diagnostics.test.cjs
git commit -m "test: audit pack profiles and rarity policy"
```
