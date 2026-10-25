# TCG Pocket Battle Flow UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give players explicit Bench-slot placement and KO promotion choice, while making every player/CPU battle action visibly readable in sequence.

**Architecture:** Preserve the compact `bench` array for compatibility, add a stable `benchSlot` field on benched Pokémon and helper lookups so physical Bench positions are independent of array order. Add a short-lived `promote` battle phase after KO. Expand structured core logs and make the UI execute CPU turns one action at a time while presenting the newest action in a dedicated battlefield event banner.

**Tech Stack:** Vanilla JavaScript, HTML/CSS assets, Node test runner, existing LuckyDex TCG Pocket engine.

**Spec:** User feedback in current project conversation, 2026-10-25.

## Global Constraints

- Baseline is LuckyDex v0.69.30.
- Preserve existing battle engine rules except the explicit Bench/promotion UX changes.
- Mobile-first single-screen battlefield; no battle page scrolling.
- Do not use Codex.
- Deliver changed/new files only as `LuckyDex_patch_v0.69.31.zip`.
- Release target: versionName 0.69.31, versionCode 7012.

## Review Focus

- A Pokémon placed directly into Bench 3 remains in physical Bench 3 after rerenders and later actions.
- Sparse physical Bench positions still allow exactly three occupied Pokémon and correct Energy/evolution/retreat targeting.
- KO with multiple benched Pokémon pauses for the correct side to choose a replacement; KO with no Bench still ends immediately.
- CPU action playback cannot continue while the player is choosing a promoted Active.
- CPU multi-action turns remain deterministic and terminate without stalling.

---

### Task 1: Stable Bench slots

**Files:**
- Modify: `app/src/main/assets/tcgp-battle-core.js`
- Modify: `app/src/main/assets/tcgp-battle-ui.js`
- Test: `tests/v06931-tcgp-bench-slots.test.cjs`

**Interfaces:**
- Produces `benchSlot` on benched Pokémon and physical `benchIndex` actions 0..2.
- Produces core helpers `benchSlotAt(side, benchIndex)` and `benchArrayIndex(side, benchIndex)`.

- [ ] Write failing tests for setup/live placement into Bench 1/2/3 and stable targeting.
- [ ] Run tests and verify failure on the old “next compact slot only” behaviour.
- [ ] Implement physical Bench slot helpers and slot-specific legal actions.
- [ ] Update UI direct-drop lookup/rendering to use physical slots.
- [ ] Run tests and verify pass.

### Task 2: Manual KO promotion

**Files:**
- Modify: `app/src/main/assets/tcgp-battle-core.js`
- Modify: `app/src/main/assets/tcgp-battle-ai.js`
- Modify: `app/src/main/assets/tcgp-battle-ui.js`
- Test: `tests/v06931-tcgp-promotion.test.cjs`

**Interfaces:**
- Produces battle phase `promote`, `promotionSide`, and legal action `{type:'promote', benchIndex}`.

- [ ] Write failing tests showing KO no longer auto-shifts Bench 1 and that either physical Bench slot can be promoted.
- [ ] Run tests and verify failure.
- [ ] Implement promotion phase and AI promotion selection.
- [ ] Expose player PROMOTE controls on occupied Bench Pokémon.
- [ ] Run tests and verify pass.

### Task 3: Readable action playback

**Files:**
- Modify: `app/src/main/assets/tcgp-battle-core.js`
- Modify: `app/src/main/assets/tcgp-battle-ai.js`
- Modify: `app/src/main/assets/tcgp-battle-ui.js`
- Modify: `app/src/main/assets/tcgp-battle.css`
- Test: `tests/v06931-tcgp-action-log.test.cjs`

**Interfaces:**
- Core log entries cover setup placement, Bench placement, evolution, Trainer use, Energy attachment, retreat, attack, KO and promotion.
- UI consumes log entries through a single action-summary formatter and CPU performs one action per visible playback step.

- [ ] Write failing tests for structured log entries and UI action-summary strings.
- [ ] Run tests and verify failure.
- [ ] Add structured log entries for all visible actions.
- [ ] Change CPU execution from whole-turn instant resolution to one-action scheduling.
- [ ] Add battlefield action banner and readable player attack controls with attack name/cost/damage.
- [ ] Run tests and verify pass.

### Task 4: Release and regression verification

**Files:**
- Modify: release metadata files already used by v0.69.30.
- Create: `README.md` / feedback notes as appropriate.

- [ ] Bump to v0.69.31 / 7012 consistently.
- [ ] Run focused TCG Battle tests and JS syntax checks.
- [ ] Package changed/new files only.
