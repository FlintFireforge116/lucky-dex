# TCG Pocket Battle Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one complete LuckyDex TCG Pocket Solo Battle loop using owned battle-enabled cards against a Genetic Apex Beginner CPU deck.

**Architecture:** Add isolated UMD modules for gameplay data, deck legality, battle state/rules, effects, Beginner AI and UI. Keep `state.cards` as collection ownership; store only TCG Battle-specific progression under `state.tcgpBattle`.

**Tech Stack:** Vanilla JavaScript/HTML/CSS, CommonJS-compatible UMD modules, Node `.cjs` regression tests.

**Spec:** `docs/superpowers/specs/2026-10-23-tcgp-battle-slice-design.md`

## Global Constraints
- No Codex.
- Existing LuckyDex saves and Pocket pack/binder behaviour must remain compatible.
- Mobile controls must remain usable without scrolling critical actions off-screen.
- Unsupported card effects must be disabled, never silently approximated.
- AI must not cheat hidden information or RNG.
- First-open instructions + reusable help are required.

## Review Focus
- Alternate art must consume the same two-copy deck limit as its gameplay card.
- A deck with fewer than 20 cards or no Basic Pokémon must not start.
- First-player first turn must not receive Energy; a zero-cost attack remains legal.
- KO promotion must resolve before normal actions continue.
- Returning from/suspending the app must not corrupt an in-progress battle snapshot.

---

### Task 1: Gameplay catalogue and collection mapping
**Files:** Create `app/src/main/assets/tcgp-battle-data.js`; Test `tests/v06920-tcgp-battle-data.test.cjs`.
- [ ] Write failing tests for canonical gameplay identity, alternate-art mapping and supported/unsupported ownership projection.
- [ ] Run the test and verify failure.
- [ ] Implement the compact A1 gameplay catalogue and mapping helpers.
- [ ] Run the test and verify pass.

### Task 2: Deck legality and save migration
**Files:** Create `app/src/main/assets/tcgp-battle-decks.js`; Modify `app/src/main/assets/app-v0167.js`; Test `tests/v06920-tcgp-battle-decks.test.cjs`.
- [ ] Write failing tests for 20 cards, two-copy name limit, Basic requirement, ownership quantities and safe `tcgpBattle` defaults.
- [ ] Verify failure.
- [ ] Implement deck helpers and migration/defaults.
- [ ] Verify pass.

### Task 3: Headless Pocket rules engine and effects
**Files:** Create `app/src/main/assets/tcgp-battle-effects.js`, `tcgp-battle-core.js`; Test `tests/v06920-tcgp-battle-core.test.cjs`.
- [ ] Write failing tests for setup, guaranteed Basic, Energy Zone, bench limit, evolution timing, retreat, damage/Weakness, heal, KO/points and 50-turn draw.
- [ ] Verify failure.
- [ ] Implement deterministic seeded engine and first effect primitives.
- [ ] Verify pass.

### Task 4: Beginner Solo deck and AI
**Files:** Create `app/src/main/assets/tcgp-battle-solo.js`, `tcgp-battle-ai.js`; Test `tests/v06920-tcgp-battle-ai.test.cjs`.
- [ ] Write failing tests for canonical Ivysaur 20-card deck and legal Beginner AI actions.
- [ ] Verify failure.
- [ ] Implement opponent deck plus simple legal-action scorer.
- [ ] Run simulations and verify no illegal actions/deadlocks.

### Task 5: Mobile deck/battle UI and help
**Files:** Create `app/src/main/assets/tcgp-battle-ui.js`, `tcgp-battle.css`; Modify `index.html`; Test `tests/v06920-tcgp-battle-ui.test.cjs`.
- [ ] Write failing static/runtime tests for Card Shop entry, deck builder, help, battle board and result view.
- [ ] Verify failure.
- [ ] Implement subview and interaction wiring.
- [ ] Verify pass.

### Task 6: Rewards, records, release and regression
**Files:** Modify achievements/records only as needed; update release metadata to `0.69.20`; Test `tests/v06920-release.test.cjs`.
- [ ] Write failing tests for first clear, stats, no duplicate reward and version consistency.
- [ ] Verify failure.
- [ ] Implement reward/stat persistence and metadata bump.
- [ ] Run focused TCGP tests, relevant pack/binder/save tests, syntax checks, full available suite and ZIP integrity.
