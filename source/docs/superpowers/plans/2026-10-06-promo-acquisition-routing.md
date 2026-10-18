# Promo Acquisition Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route every physical-TCG card by card metadata into booster, Promo Vault, or Achievement Reward acquisition, with Ancient Mew protected as an achievement reward and existing collections preserved.

**Architecture:** Add one browser/Node-compatible acquisition policy module and make booster construction, Promo Vault loading, achievement rewards, and collection display consume it. Keep saved card IDs/counts intact; classification changes acquisition/display only.

**Tech Stack:** Android WebView, vanilla JavaScript, CommonJS Node tests, Gradle Android app.

**Spec:** Agreed in chat on 2026-10-06: card-level routing; Ancient Mew achievement-only; ordinary promos Dust-buyable; no deletion of owned copies; v0.24.6/versionCode 246/permanent signer.

## Global Constraints

- Existing owned cards and counts must not be deleted or reset.
- Promo cards must never be pulled from normal physical boosters, even inside a non-promo-named set.
- Achievement-only cards must be neither booster-pullable nor Dust-purchasable.
- Ordinary promo cards remain available from Promo Vault.
- Version must be `0.24.6` / `246` and retain existing `luckydex-dev.keystore` signing configuration.

## Review Focus

- Generic/miscellaneous sets containing both normal and promo cards must filter only the promo cards.
- Pure promo sets must stay out of the normal booster catalogue.
- An achievement-only card accidentally loaded into Promo Vault must be suppressed.
- Existing Ancient Mew copies must retain their original ID/count while displaying as Achievement Rewards.
- Offline cached physical packs must enforce the same acquisition filter as online/library packs.

---

### Task 1: Card acquisition policy and booster filtering

**Files:**
- Create: `app/src/main/assets/card-acquisition-v0246.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/src/main/assets/app-v0167.js`
- Test: `tests/v0246-promo-routing.test.cjs`

**Interfaces:**
- Produces: `LuckyDexCardAcquisition.classify(card,set)`, `boosterEligible(card,set)`, `promoVaultEligible(card,set)`, `achievementEligible(card,set)`, `displaySetName(card)`, `displaySetKey(card)`.
- Consumers: Task 2 Promo Vault/achievement flow and collection UI.

- [ ] Write tests proving Ancient Mew => `achievement_reward`, generic `rarity: Promo` => `promo_vault`, normal cards => `booster`, and display grouping preserves card identity.
- [ ] Run the new test and verify RED because the policy module does not exist.
- [ ] Implement the policy module and load it before pack/app scripts.
- [ ] Filter physical pack briefs and offline cached pools through `boosterEligible` while leaving TCG Pocket untouched.
- [ ] Run the new test and full Node suite; verify GREEN.

### Task 2: Promo Vault and achievement rewards

**Files:**
- Modify: `app/src/main/assets/pack-flow-v0165.js`
- Modify: `app/src/main/assets/app-v0167.js`
- Test: `tests/v0246-promo-routing.test.cjs`

**Interfaces:**
- Consumes: Task 1 classification helpers.
- Produces: Promo Vault card-level filtering and achievement-card grant path that does not overwrite existing owned copies.

- [ ] Extend failing tests to prove Promo Vault excludes achievement rewards and card-level promos can be surfaced from non-promo-named catalog sets.
- [ ] Run test and verify RED against v0.24.5 flow.
- [ ] Build Promo Vault candidate sets using set names plus known per-card promo metadata when sets are prepared; filter loaded cards through `promoVaultEligible`.
- [ ] Add reward-card metadata to appropriate existing achievements and grant only when the card is not already owned; Ancient Mew is the guaranteed curated reward.
- [ ] Make reward text show the card reward and mark granted reward cards `_achievementReward` without changing pre-existing card IDs/counts.
- [ ] Run targeted and full tests; verify GREEN.

### Task 3: Collection grouping, release metadata, and packaging

**Files:**
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: `app/src/main/assets/index.html`
- Modify: `app/build.gradle`
- Modify: `package.json`
- Create: `TEST_REPORT_v0.24.6.md`
- Create: `V0246_REPORT.md`

**Interfaces:**
- Consumes: Task 1 display grouping.
- Produces: visible `Achievement Rewards` grouping and v0.24.6 release artifact.

- [ ] Add static regression assertions for collection grouping, versionCode/versionName, UI version labels, and signer retention.
- [ ] Run targeted test and verify RED before version/display changes.
- [ ] Use acquisition display helpers in collection set key/name/progress paths so achievement cards group under `Achievement Rewards` without rewriting saved metadata.
- [ ] Bump UI/package/Gradle version to 0.24.6 / 246 and retain existing signer.
- [ ] Run full Node suite and any available Android build verification.
- [ ] Package `LuckyDex_source_v0.24.6.zip` and, if local Android tooling is available, a signed debug APK.
