# LuckyDex v0.40.13 — Sleeves, Customise & Achievement Expansion

Date: 2026-10-13
Status: Approved
Baseline: LuckyDex v0.40.12

## 1. Purpose

v0.40.13 adds a durable cosmetic layer to LuckyDex, beginning with globally equipped card sleeves, and expands Achievements so cosmetics can be earned through progression, skill, collection play, Arcade play and hidden discoveries.

The feature must feel integrated with LuckyDex rather than bolted onto Profile. Sleeves are permanent trophies, not consumables, and previously completed progress must be recognised wherever the save contains reliable evidence.

The system should also be reusable for future cosmetic types such as profile frames or backgrounds without requiring Achievements, Adventure or Arcade code to own cosmetic state directly.

## 2. Product principles

1. **One global active sleeve.** The equipped sleeve is used everywhere LuckyDex renders a real card back.
2. **Cosmetics are permanent unlocks.** Once earned, a sleeve remains available forever.
3. **Rewards stay additive.** A sleeve does not replace useful existing coins, dust, tickets, packs or other rewards unless a later feature explicitly says so.
4. **Retroactivity is evidence-based.** Existing progress is recognised when durable saved data proves the requirement. LuckyDex never invents historical completion that it did not record.
5. **Secrets are genuinely secret.** Most unusual/random achievements show `???` until discovered and stay revealed permanently afterward.
6. **Offline-first presentation.** Sleeve artwork required for the feature is packaged locally; Customise must not depend on remote image URLs.
7. **Shared rendering.** Existing card-back surfaces consume one shared sleeve renderer rather than each implementing sleeve logic separately.
8. **Future-ready without overbuilding.** v0.40.13 implements sleeves only, but the state/API boundary must support later cosmetic categories cleanly.

## 3. Architecture

Use a dedicated cosmetics subsystem separate from Achievements.

### 3.1 Cosmetics core

A central cosmetics module owns:

- sleeve registry;
- unlock state;
- active sleeve selection;
- equip/unlock validation;
- unlock-source metadata;
- secret/hidden presentation metadata;
- shared card-back rendering helpers;
- safe fallback to the built-in default sleeve.

Other systems may request `unlockSleeve(id)` or render the currently active sleeve, but they do not directly mutate cosmetic state.

### 3.2 Customise UI

A dedicated Profile → Customise surface owns browsing, filtering, previewing and equipping cosmetics.

For v0.40.13 the screen contains Sleeves only. Do not show empty placeholder categories for future cosmetics.

### 3.3 Achievement expansion

Achievements may award cosmetics by referencing a sleeve ID. Achievement logic does not store sleeve ownership itself.

New achievements are split into:

- visible progression achievements;
- visible challenge achievements;
- hidden secret achievements.

### 3.4 Shared reward hook

Where the current achievement reward shape permits, extend it so a reward can include a sleeve ID in addition to existing reward fields. Existing reward behaviour must remain unchanged.

## 4. Saved state and migration

Add a cosmetics branch to persisted state. The exact shape may follow current project conventions, but must represent at least:

```js
state.cosmetics = {
  unlockedSleeves: [],
  activeSleeve: 'luckydex-default',
  discoveredSecrets: [],
  claimedCosmeticRewards: []
}
```

The migration must be idempotent.

On first load after upgrading to v0.40.13:

1. create missing cosmetics state;
2. guarantee the default sleeve is unlocked;
3. validate the active sleeve and fall back to default if missing/invalid;
4. reconcile previously completed achievements and durable progress;
5. grant every sleeve the save can prove the player has already earned;
6. record those grants so reloading cannot duplicate reward side effects;
7. preserve all unrelated player state exactly.

### 4.1 Retroactive evidence sources

Reconciliation may use:

- existing achievement claims/completion records;
- Adventure region/Gym/progression state;
- Pokédex progress;
- binder/set/card collection progress;
- Arcade records and durable game records;
- durable rare-event records;
- other already-persisted counters or milestones where the condition is unambiguous.

If a condition depends on behaviour that was not historically stored, it starts tracking from v0.40.13.

### 4.2 Retroactive user feedback

If migration unlocks multiple achievements/sleeves at once, show one compact summary such as **Previous accomplishments recognised** rather than firing a large sequence of individual toasts.

## 5. Sleeve catalogue

v0.40.13 should ship with a substantial initial sleeve catalogue rather than a token handful.

The catalogue should combine:

- LuckyDex-original sleeves;
- Pokémon-themed sleeves appropriate to the app;
- TCG-inspired sleeve designs;
- TCG Pocket-inspired sleeve designs;
- Arcade/event-themed sleeves;
- secret reward sleeves.

Each registry entry should provide at least:

- stable ID;
- display name;
- local artwork path;
- category/theme;
- rarity/tier if useful to presentation;
- unlock source text;
- hidden/secret state;
- optional achievement/reward source IDs.

The built-in LuckyDex Default sleeve is always available and cannot be deleted or locked.

## 6. Profile → Customise UX

Add a Customise entry to the main Profile screen near the existing Achievements entry.

The Profile entry should show:

- current sleeve preview;
- current sleeve name;
- clear tap target into Customise.

### 6.1 Sleeve browser

Use a compact mobile-first two-column grid.

Primary ownership filters:

- All;
- Owned;
- Locked.

Theme/category filters may include:

- LuckyDex;
- Pokémon;
- TCG;
- TCG Pocket;
- Events;
- Secrets.

The exact labels may be consolidated if the catalogue makes some categories too sparse.

### 6.2 Sleeve detail view

Tapping a sleeve opens a larger preview with one of these states:

- **Owned, inactive:** show `EQUIP`;
- **Owned, active:** show `EQUIPPED`;
- **Locked normal sleeve:** show artwork/name and the specific unlock requirement;
- **Undiscovered secret sleeve:** show `???` presentation without revealing the true artwork/name/requirement;
- **Discovered secret sleeve:** reveal normal artwork/name/description permanently.

Locked sleeves must not be equippable through UI or direct API calls.

## 7. Global sleeve rendering

Use one shared renderer/helper for real card backs.

v0.40.13 must wire at least the existing confirmed card-back surfaces:

1. pack-opening unrevealed card backs / `.pack-face-back` style surfaces;
2. Trade receive animation / `fxCardBack()`.

During implementation, audit the source for other genuine card-back surfaces and route them through the same renderer where appropriate.

Do not invent cosmetic use on card-front-only screens just to increase feature coverage.

Changing the active sleeve should affect all shared-renderer surfaces immediately and persist through save/reload.

## 8. Achievement expansion

Add approximately 25–35 genuinely new achievements in v0.40.13, with approximately 8–12 hidden secrets.

This is a target range, not a reason to include weak filler. Quality and variety matter more than hitting an exact number.

### 8.1 Visible progression achievements

Use meaningful durable milestones such as:

- Adventure progression;
- Gym/region completion;
- Pokédex milestones;
- binder/set completion;
- card collection milestones;
- Arcade records;
- rare-event discoveries;
- trading/dusting milestones where durable stats exist.

### 8.2 Visible challenge achievements

Prefer conditions that change how the player approaches the game rather than repetitive counters. Candidate families include:

- winning a battle at 1 HP;
- clearing a defined Adventure stretch without healing;
- perfecting a minigame;
- maintaining a catch chain;
- winning with a constrained party;
- Arcade-specific mastery conditions.

Exact achievements must be selected based on mechanics and counters the current source can reliably detect.

### 8.3 Secret achievements

Most weird/random achievements remain `???` until triggered.

Secret candidates may include:

- unusual battle outcomes;
- rare-event combinations;
- funny failure conditions;
- repeated encounters with the same species;
- peculiar Arcade successes/failures;
- counterintuitive actions;
- exceptionally lucky or unlucky sequences, if the save/runtime can detect them fairly.

Secrets should feel discoverable by play, not like invisible chores.

Once discovered, the real name, description and reward remain visible permanently.

## 9. Sleeve reward distribution

Sleeves should be distributed across the app rather than making Achievements the sole source.

Recommended spread:

- default/basic LuckyDex sleeves available immediately;
- achievement sleeves for milestone/challenge chains;
- Adventure-themed sleeves for meaningful region/Gym accomplishments;
- Arcade-themed sleeves tied to specific games or difficult feats;
- collection/set sleeves tied to TCG and TCG Pocket progress;
- a small set of secret-only sleeves;
- selected event/special-reward sleeves granted outside Achievements.

Existing useful rewards should remain intact. A sleeve is generally an additional trophy.

Avoid overusing boring numeric tiers. When an achievement chain has multiple stages, later stages should become more interesting where possible rather than simply multiplying the same counter.

## 10. Secret presentation rules

For undiscovered secret achievements and secret sleeves:

- show `???` rather than the real name;
- do not expose the requirement;
- do not expose the true sleeve artwork if it would reveal the secret;
- preserve discovered status permanently once earned/revealed.

Retroactive secret unlocks are allowed only when persisted history proves the secret condition.

## 11. Error handling and resilience

The cosmetics subsystem must fail safe.

Required behaviour:

- unknown/removed active sleeve ID → use default sleeve;
- malformed/missing cosmetics branch → repair via migration/defaults;
- duplicate unlock attempts → no duplicate side effects;
- unknown reward sleeve ID → do not corrupt save; log/ignore safely;
- missing artwork → use default card-back presentation rather than a broken image box;
- locked sleeve direct-equip attempt → reject without mutating state.

No cosmetics error may block pack opening, trading, Profile rendering or save loading.

## 12. Developer/testing support

Add a small developer-only helper inside the existing Developer Tools to unlock all sleeves temporarily or grant all sleeves for test purposes.

It must not affect normal progression and must be clearly separated from player-facing controls.

The helper exists so phone testing does not require legitimately earning dozens of cosmetics.

## 13. Test strategy

Use TDD for implementation changes.

At minimum, automated tests must cover:

### Migration and state

- old v0.40.12-style save migrates without data loss;
- migration may run repeatedly with identical result;
- default sleeve is always unlocked;
- invalid active sleeve falls back safely;
- retroactive unlocks are granted exactly once.

### Unlock/equip API

- owned sleeve equips;
- locked sleeve cannot equip;
- unknown sleeve cannot corrupt state;
- equip persists across save/reload;
- duplicate unlock is idempotent.

### Secrets

- undiscovered secret renders as `???`;
- secret requirement/artwork is not leaked before discovery;
- discovery persists;
- evidence-backed retroactive discovery works;
- unprovable historical secrets are not guessed.

### Achievement rewards

- existing achievement reward behaviour remains unchanged;
- cosmetic reward can be additive to existing reward;
- already-claimed eligible achievements reconcile cosmetic rewards on upgrade;
- cosmetic rewards cannot be claimed twice.

### Card-back rendering

- pack opening uses active sleeve;
- Trade receive animation uses active sleeve;
- changing active sleeve changes both surfaces;
- missing sleeve artwork falls back to default presentation.

### UI

- Profile Customise entry shows active sleeve;
- All/Owned/Locked filters work;
- category filters do not expose hidden secret metadata;
- Equip state reflects current sleeve;
- locked requirements are shown only for non-secret sleeves.

### Regression

Run the full existing runnable test suite, preservation checks, syntax checks and packaged-source verification before release. Browser/Playwright-blocked programs must remain reported separately and must not be counted as passes.

## 14. Release boundary

v0.40.13 includes:

- cosmetics core;
- global sleeve state;
- substantial initial sleeve catalogue;
- Profile → Customise sleeve UI;
- global card-back integration for current real card-back surfaces;
- retroactive unlock reconciliation;
- approximately 25–35 new achievements including approximately 8–12 secrets;
- sleeve reward distribution across existing systems where evidence/triggers are reliable;
- developer sleeve-unlock helper;
- migration, tests and release documentation.

v0.40.13 does **not** include:

- per-deck/per-mode sleeves;
- multiple simultaneously equipped sleeves;
- profile frames/backgrounds as player-facing features;
- online cosmetic downloads;
- wholesale replacement of existing achievement rewards;
- speculative retroactive completion without saved evidence;
- a generic all-reward inventory rewrite.

## 15. Success criteria

The release is successful when:

1. an existing v0.40.12 save upgrades without losing state;
2. previously earned eligible accomplishments immediately grant their sleeve rewards once;
3. the player can browse, preview and equip sleeves from Profile → Customise;
4. one active sleeve is used consistently by all integrated real card-back surfaces;
5. secret achievements remain genuinely hidden until earned;
6. new achievements provide a mix of progression, challenge and accidental discovery rather than repetitive counters;
7. cosmetics cannot break pack opening, Trade, Profile or save loading;
8. all runnable regression/preservation tests pass from the final packaged ZIP.
