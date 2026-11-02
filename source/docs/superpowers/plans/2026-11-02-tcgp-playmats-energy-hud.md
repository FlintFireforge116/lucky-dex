# TCGP Playmats, Energy Icons and Battlefield Cosmetics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unlockable Pocket playmats, slot-aligned battlefield rendering, anchored Tools, real Energy icons, and a compact turn HUD without changing battle rules.

**Architecture:** Extend the existing Cosmetics persistence/reconcile system with a separate playmat registry and reuse the existing Profile > Customise screen via Sleeves/Playmats tabs. Battle UI reads the active player mat and a deterministic CPU mat, applies top/bottom playmat crops, and positions board slots to the artwork geometry. A shared UI-assets module provides Energy icon URLs/fallbacks.

**Tech Stack:** Vanilla JavaScript, HTML/CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-02-tcgp-playmats-energy-hud-design.md`

## Global Constraints
- Keep existing saves/sleeves compatible.
- Do not modify TCG battle rules.
- Playmat/image failures fall back to the plain board.
- Tools remain tappable/inspectable and follow the owning Pokémon.
- Player and CPU halves may use different mats.

## Review Focus
- Old saves with no playmat fields migrate to the default mat.
- Locked mats cannot be equipped; progression reconciliation unlocks eligible mats.
- Missing remote playmat/energy images do not hide controls or card state.
- Slot alignment stays usable at 320–430px widths.
- Stadium/Tool/drag presentation anchors still resolve after the layout change.

### Task 1: Playmat catalogue and persistence
- Create `app/src/main/assets/cosmetics-playmats-v06958.js`.
- Modify `cosmetics-core-v0413.js` to normalise/unlock/equip/reconcile playmats separately from sleeves.
- Add tests for migration, unlock/equip, and progression unlocks.

### Task 2: Customise UI playmat tab
- Modify `cosmetics-customise-v0413.js`, `cosmetics-v0413.css`, and `index.html` so Customise switches between Sleeves and Playmats while retaining ownership/search filters.
- Add UI-structure tests.

### Task 3: Energy icon assets and HUD
- Create `tcgp-ui-assets.js` with real TCG energy-icon sources and HTML helper.
- Modify `tcgp-battle-ui.js` and `tcgp-battle.css` so attack costs, attached Energy, the Energy Zone and animation ghost use icon imagery with accessible text fallback.
- Remove redundant Energy wording from the bottom-right control and make End Turn fit.
- Add rendering tests.

### Task 4: Playmat battlefield geometry and Tool anchoring
- Modify battle UI/CSS to apply player/opponent mat halves and snap Active/Bench wrappers to Pocket slot coordinates.
- Hide custom empty slot borders when mat art is loaded; preserve fallback board styling if not.
- Anchor Tool stack to each card wrapper's right/lower edge and preserve inspect actions.
- Add layout/presentation-anchor tests.

### Task 5: Release integration and verification
- Add script tags and version marker 0.69.58.
- Run every current TCGP regression serially plus syntax checks.
- Reapply packaged patch to a clean 0.69.57 baseline and rerun release-specific tests.
