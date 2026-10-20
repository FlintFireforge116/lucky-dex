# Fishing Minigame v0.68.0 Implementation Plan

**Goal:** Replace Adventure's overbuilt fishing activity with a quick Gen III-style encounter interaction and add a full Fishing Arcade minigame with regional pools, skill catches, size/value collection, shop gear, treasure/junk, achievements, records, help, and rare-event developer forcing.

**Architecture:** Adventure fishing remains a lightweight encounter trigger. The Arcade game uses a pure `arcade-fishing-core.js` for catalog/state/economy/catch simulation and a DOM UI in `arcade-fishing.js`; it plugs into the existing Arcade World, help, records, achievements, save state, and rare reward bridge.

**Tech Stack:** Vanilla JS/CSS/HTML, existing LuckyDex state/reward/Arcade systems, Node test runner.

## Tasks
1. Write failing integration/core tests for registration, all-Water catalog coverage, size/value, gear shop, treasure/junk/rare forcing, book, records, achievements, help, and simplified Adventure fishing.
2. Implement Fishing core/state/economy/catch simulation.
3. Implement Arcade Fishing UI, book, shop and skill loop; register venue/help/records/session/scripts/styles.
4. Add achievements and Developer rare-event settings.
5. Simplify Adventure fishing to Gen III message flow and normal battle handoff.
6. Normalize v0.68.0 release metadata, run focused regressions/stress checks, package source/report/Termux handoff.
