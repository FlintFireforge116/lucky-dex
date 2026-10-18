# LuckyDex v0.40.4 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a verified first continuation slice covering Adventure action/navigation cleanup, battle foundations, Mart quantities/Premier Balls, and low-risk regressions.

**Architecture:** Keep the current Adventure owners and save models. Change behaviour at the existing location-flow, battle reducer/UI, and tools transaction boundaries instead of introducing parallel systems. Small app-shell regressions stay in their current owners.

**Tech Stack:** Vanilla JavaScript, HTML/CSS, Node `node:test`, Android WebView assets.

**Spec:** `docs/superpowers/specs/2026-10-13-luckydex-v0404-foundation-design.md`

## Global Constraints

- Preserve v0.40.3 saves and economy integrity.
- Preserve existing Adventure node IDs and reward claims.
- TDD for every behaviour change.
- No external asset dependency in this slice.

## Review Focus

- Required wild encounters still block onward travel until completed.
- Optional cache/rare actions cannot duplicate rewards after reload.
- Sticky battle drawers reset only when the player explicitly closes them or battle ends.
- Mart quantity changes cannot overspend or duplicate Premier Balls.
- Existing daily saves containing the removed regional-clear task remain renderable/reset safely.

---

### Task 1: Adventure actions and journey map

**Files:**
- Modify: `app/src/main/assets/adventure/adventure-location-flow.js`
- Modify: `app/src/main/assets/adventure/adventure-regional-ui.js`
- Modify: `app/src/main/assets/adventure/adventure3.css`
- Test: `tests/adventure-location-flow-v0404.test.cjs`

**Interfaces:**
- Consumes: existing RegionalEngine nodes and bundled `adventure/art/adventure-map.png`.
- Produces: `EXPLORE AREA` local action semantics and `journey-map` view.

- [ ] Write focused failing location-flow tests.
- [ ] Run them and verify RED.
- [ ] Implement minimal action merge and map view.
- [ ] Run tests and verify GREEN.

### Task 2: Battle mechanics and UI persistence

**Files:**
- Modify: `app/src/main/assets/adventure/adventure-battle.js`
- Modify: `app/src/main/assets/adventure/adventure-regional-ui.js`
- Modify: `app/src/main/assets/adventure/adventure-wild-hunt.js`
- Modify: `app/src/main/assets/adventure/adventure3.css`
- Test: `tests/adventure-battle-v0404.test.cjs`

**Interfaces:**
- Consumes: move metadata `effect.minHits/maxHits`, `effect.ailment='yawn'`, collection `xp`, progression XP requirement.
- Produces: generic multi-hit and delayed-yawn behaviour plus sticky drawers and EXP HUD.

- [ ] Write failing reducer/UI-source tests.
- [ ] Run RED.
- [ ] Implement mechanics and persistence.
- [ ] Run GREEN plus existing battle tests.

### Task 3: Mart quantities and Premier Balls

**Files:**
- Modify: `app/src/main/assets/adventure/adventure-tools.js`
- Modify: `app/src/main/assets/adventure/adventure-tools.css`
- Test: `tests/adventure-tools-v0404.test.cjs`

**Interfaces:**
- Consumes: existing transaction prepare/confirm boundary.
- Produces: quantity-aware quotes and `premierball` inventory grants for Poké Ball purchases.

- [ ] Write failing transaction tests.
- [ ] Run RED.
- [ ] Implement quantity quoting/UI and atomic bonus grant.
- [ ] Run GREEN plus existing tools tests.

### Task 4: Low-risk app regressions

**Files:**
- Modify: `app/src/main/assets/app-v0167.js`
- Modify: relevant shared CSS if required.
- Test: `tests/v0404-regressions.test.cjs`

**Interfaces:**
- Consumes: existing daily pool, collection mode switch, persistent bottom nav.
- Produces: no regional-clear daily; deterministic binder redraw; bottom-nav-safe Arcade content.

- [ ] Write failing source/logic regression tests.
- [ ] Run RED.
- [ ] Implement minimal fixes.
- [ ] Run GREEN.

### Task 5: Release verification and packaging

**Files:**
- Modify: version/build metadata and release/test report.
- Create: `TEST_REPORT_v0.40.4.md`

- [ ] Run all non-browser focused tests for changed owners.
- [ ] Attempt full suite and record environment blockers exactly.
- [ ] Verify source archive contents and version strings.
- [ ] Package versioned source ZIP.

### Task 6: Rock Harden hazard expansion

**Files:**
- Modify: `app/src/main/assets/arcade-rock-harden-core.js`
- Modify: `app/src/main/assets/arcade-rock-harden.js`
- Modify: `app/src/main/assets/arcade-rock-harden.css`
- Modify: `app/src/main/assets/index.html`
- Test: `tests/v0404-rock-harden-expansion.test.cjs`

**Interfaces:**
- Produces: wave `hazardKey`, `hazardKind`, `asset`, `telegraphLeadMs`, damage/heal metadata; runtime consumes those fields without altering legacy save state.

- [ ] Write failing core tests for hard per-wave fall-speed variation, healing berries, and higher-damage Pokémon hazards.
- [ ] Run the test and verify the new behaviours fail on the v0.40.3 core.
- [ ] Add hazard definitions and generic impact handling; CPU skips Harden for berry waves.
- [ ] Render each hazard from its local asset and update Rock Harden instructions for berry behaviour.
- [ ] Run the new test, legacy Rock Harden non-browser tests, and syntax checks.
