# Adventure 2.0 Kanto Chapter 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the reusable Adventure 2.0 authored-content systems and fully author Kanto Chapter 1 (Pallet Town → Pewter City) without replacing the existing battle/progression engine.

**Architecture:** Add a small authored-state/event module and a Kanto Chapter 1 registry beside the existing regional engine. Location flow asks the authored layer for context-sensitive actions; the regional UI renders a shared mobile-safe event shell. State is additive under `save.adventureRegional.authored`, while existing journeys, battles, Fishing, Wild Hunt and saves remain authoritative.

**Tech Stack:** Vanilla JavaScript IIFEs/CommonJS-compatible modules, HTML/CSS assets, Node `node:test` regression tests.

**Spec:** `docs/Adventure_2_Kanto_Authored_Design.md`

## Global Constraints

- Baseline is LuckyDex v0.69.16; preserve existing Kanto journey, badges, battle engine, Fishing, Wild Hunt and Journey moves.
- Additive save state only under `save.adventureRegional.authored`; old saves must not reset or move backwards.
- No exact species may be required for main progression.
- Party interactions use broad, explainable capability tags and acknowledge the qualifying Pokémon by name.
- One-time authored rewards cannot be reclaimed through backtracking/replay.
- Deterministic authored events do not receive Developer force toggles.
- Mobile choices remain large/tappable and active event state survives normal rerender/background recovery.
- Chapter 1 is the proof slice; do not author Chapters 2–9 in this release.

## Review Focus

- Existing saves already past Pewter should not be forced to replay Pallet/Route 1 story introductions.
- Backtracking into Chapter 1 must expose unresolved optional discoveries/requests but not duplicate claimed rewards.
- A party with no matching capability must still have a valid event choice/result and preserve progression.
- Fishing/local encounter actions must remain visible alongside authored actions at eligible locations.
- Event state must be serializable and safe if the UI rerenders between opening an event and choosing a result.

---

### Task 1: Authored save state and party capability model

**Files:**
- Create: `app/src/main/assets/adventure/adventure-authored-events.js`
- Test: `tests/v06917-adventure-authored-core.test.cjs`

**Interfaces:**
- Produces: `LuckyDexAdventureAuthored.ensureState(save)`, `partyCapabilities(save, journey)`, `qualifyingMember(save, journey, capability)`, `completeEvent(save,id,result)`, `stats(save)`.

- [x] Write failing tests for additive normalization, late-Kanto migration, capability derivation/overrides, and one-time completion.
- [x] Run the focused test and verify RED.
- [x] Implement schema/state normalization, Kanto legacy migration, capability derivation, and completion helpers.
- [x] Run the focused test and verify GREEN.

### Task 2: Kanto Chapter 1 authored registry and resolver

**Files:**
- Create: `app/src/main/assets/adventure/adventure-kanto-events.js`
- Modify: `app/src/main/assets/index.html`
- Test: `tests/v06917-adventure-kanto-ch1.test.cjs`

**Interfaces:**
- Consumes Task 1 state/capability helpers.
- Produces: `LuckyDexKantoAuthored.events`, `eligible(save,journey,place)`, `open(save,journey,eventId)`, `choose(save,journey,eventId,choiceId)`.

- [x] Write failing tests for Pallet departure/Researcher, Route 1 Rival + party discovery, Viridian request, Viridian Forest branching discovery, legacy skip and no hard capability gate.
- [x] Run and verify RED.
- [x] Implement deterministic Chapter 1 events, rewards, recurring-character flags, request/discovery progression and event serialization.
- [x] Add script loading order after species/engine prerequisites and before location flow/UI.
- [x] Run and verify GREEN.

### Task 3: Location-flow integration and authored event shell

**Files:**
- Modify: `app/src/main/assets/adventure/adventure-location-activities.js`
- Modify: `app/src/main/assets/adventure/adventure-location-flow.js`
- Modify: `app/src/main/assets/adventure/adventure-regional-ui.js`
- Modify: `app/src/main/assets/adventure/adventure-activities.css`
- Test: `tests/v06917-adventure-authored-ui.test.cjs`

**Interfaces:**
- Consumes Task 2 `eligible/open/choose`.
- Produces: authored action descriptors from `actionsFor`, `perform(...).authoredEvent`, and UI `authoredEvent()` rendering/choice dispatch.

- [x] Write failing tests that authored actions outrank generic Explore, coexist with Fishing/hunting, produce mobile-safe choices, and serialize/rerender active event state.
- [x] Run and verify RED.
- [x] Integrate contextual actions and shared event shell without changing battle flow.
- [x] Add concise mobile CSS (>=44px choice targets, no viewport clipping).
- [x] Run and verify GREEN.

### Task 4: Backtracking/completion visibility and Chapter 1 persistence

**Files:**
- Modify: `app/src/main/assets/adventure/adventure-location-flow.js`
- Modify: `app/src/main/assets/adventure/adventure-regional-ui.js`
- Test: `tests/v06917-adventure-backtrack.test.cjs`

**Interfaces:**
- Consumes authored `stats/eligible` and event state.
- Produces: `authoredSummary(save,journey,place)` from location flow and concise journey-map markers.

- [x] Write failing tests for unresolved Chapter 1 backtrack content, no duplicate rewards, discovery/request summary counts, and late-save recurring-character state.
- [x] Run and verify RED.
- [x] Add completion summaries/markers and ensure backtracking only offers valid unresolved content.
- [x] Run and verify GREEN.

### Task 5: Release metadata and regression verification

**Files:**
- Modify: `package.json`
- Modify: `app/build.gradle`
- Modify: `app/src/main/assets/app-v0167.js`
- Create: `tests/v06917-release.test.cjs`

**Interfaces:**
- Produces LuckyDex source v0.69.17.

- [x] Write failing release test for version metadata and required Adventure 2.0 scripts.
- [x] Run and verify RED.
- [x] Update version metadata to `0.69.17` and build marker consistently.
- [x] Run focused Adventure 2.0 tests plus existing regional/location/migration/fishing/v0.69.16 regressions.
- [x] Run JS syntax checks and package ZIP integrity check.
