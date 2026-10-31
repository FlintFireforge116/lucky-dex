# Pocket deck workspace and current catalogue implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the prototype builder with a mobile visual deck workspace and update released Pocket cards without guessing mechanics.

**Architecture:** Keep the existing vanilla JS/UMD app, battle core and persistence. Separate pure collection/deck workspace queries from rendering; construct and compare synergy-aware candidate decks. Extend shared type predicates rather than inventing a second battle engine.

**Tech Stack:** JavaScript, Node test runner, Playwright, existing Android WebView/Gradle.

**Spec:** User attachment `C:/Users/sjwal/.codex/attachments/8a5eeab4-3cf1-4290-9708-1401272b0fa8/Pasted text.txt`.

## Global constraints

- Current v0.69.35 source is the only product baseline. Preserve mechanics, ownership and unrelated features.
- Exactly 20 cards, maximum two printed names, minimum one Basic, no fabricated ownership or PARTIAL legality.
- Current release cutoff 2026-10-30; include only verified released prints. Keep print and canonical counts separate.
- Keep the existing signer/workflow; final version 0.69.36 / Android 7017 only with verified output.

## Review focus

- Alternate prints and same-name different mechanics must not bypass ownership/copy limits.
- An incomplete saved draft must survive editing but must never be playable as a legal deck.
- Search, filters and pagination must combine without hiding cards past result 100.
- Dual types must affect type targets/weakness, not manufacture Energy requirements.
- Test recipes must disclose prerequisites/blockers instead of claiming an arbitrary legal list exercises a mechanic.

### Task 1: Pure workspace queries and saved decks

Files: new `app/src/main/assets/tcgp-deck-workspace.js`, tests `tests/v06936-tcgp-workspace.test.cjs`; existing decks state for draft/duplicate/delete persistence.

Interfaces: query(rows,{search,filters,sort,cards,page,pageSize,developer}) -> {rows,total,pages,page}; edit(cards,id,delta,rows) -> {ok,cards,error}; recipe(cards,rows) -> {owned,total,missing}; saveDraft/duplicate/remove/activate state operations preserve existing records.

- [ ] Write tests for combined Water/Basic/ex/set/owned/text query, all types, category/stage/quantity/status filters, pagination past100, alias copy/ownership bounds, recipes and multi-save operations.
- [ ] Run RED, implement, run GREEN.

### Task 2: Synergy candidate construction and test setups

Files: `tcgp-battle-decks.js`, tests `v06936-tcgp-autobuild.test.cjs`.

Interfaces: preserve buildQuickDeck(rows,options), add mode existing/cards preservation and buildTestSetup(rows,{cardId}) returning player recipe/opponent recipe/prerequisites/blockers and legal readiness separately.

- [ ] Test complete family ratios, compatible support, no unrelated stat fillers, repair preserves cards, focus usability, ownership, test prerequisites and PARTIAL blockers.
- [ ] Run RED, implement candidate evaluation by legality/Energy/evolution/setup/support/synergy/dead risk, run GREEN plus old deck tests.

### Task 3: Authoritative visual editor

Files: new `tcgp-deck-editor.js`/`.css`; integrate through `tcgp-battle-ui.js` and `index.html`, retire old builder renderer/styles.

Interfaces: editor receives data/decks/workspace and host callbacks for state/ownership/art/rules/save/battle/home; owns draft edit state, sheets, filters, saved deck management and scroll-preserving incremental updates.

- [ ] Browser tests for sticky visual My Deck/art/quantity, inspect/remove/add, filter combinations/load more, save/duplicate/new/edit/delete/active, recipes/autobuild, no scrolling jump and offline app behavior.
- [ ] Run RED, implement, run GREEN; inspect actual 360/393/430 portrait screenshots.

### Task 4: Current data and multi-type engine

Files: imports/provenance/cutoff and deterministic adapter, normalizer/validator/data/effects/core/UI type assumptions; new dual-type/import regression tests.

- [ ] Verify pinned licensed primary sources and individual release gates, write import/dual-type/target/weakness/Energy regressions, run RED.
- [ ] Import C1 and released promos only; preserve exact rules and unknown blockers. Add shared typesOf/hasType helpers and use all relevant call sites; run GREEN.
- [ ] Audit all remaining PARTIAL text by mechanic family, add safely reusable compositions with tests; explain v034/v035 actual baseline mismatch from recorded evidence.

### Task 5: Verification and packaging

- [ ] Run all existing/new tests, catalogue reproducibility, execution/stress tests, mobile/offline QA and APK build; record every failing program explicitly.
- [ ] Fresh whole-change review; reproduce important findings RED→GREEN and run regression tests.
- [ ] Generate changed-only source-relative patch against untouched v035, audit reconstruction, signer/APK and version; deliver coverage and limitations honestly.

## Execution ledger

Ruling: User explicitly requests direct implementation, so no extra design-approval round. Native inline execution; independent read-only current-data research uses the parallel-agent skill.

Ruling: Parent Cards Git is an unborn unrelated export collection. Use a new isolated `LuckyDex-v06936/source` copy of untouched v035, not a Git worktree or new baseline from an older ZIP. No commits/pushes. Baseline source and prior full-suite failure evidence remain intact.

Pre-flight: Tasks1/3 use workspace query/edit signatures; Tasks2/3 use the existing builder return shape; Task4 shared types feed both tasks. The editor defers all legality/ownership to pure model and decks APIs.

## Completion ledger

- Task1 complete: workspace tests observed RED (missing query/model), then GREEN; canonical aliases, ownership/name/20-card bounds, drafts, recipes and multi-save lifecycle verified. Review regressions additionally cover invalid Energy readiness, numeric acquisition timestamps and linked-set search.
- Task2 complete: family-ratio/repair/test-setup tests observed RED, then GREEN. Real legal Stage2 progression, opposing ex test pair, Burn/Confusion and Tool/Stadium/Supporter prerequisites, owned evolution variants and async cancellation are covered. One authoritative candidate generator serves synchronous tests and yielding production work.
- Task3 complete: mobile browser tests observed RED for missing My Deck/filters, then GREEN. Review RED→GREEN covers pending-build lifetime, tray scrollLeft, Developer diagnostics and test rematch preservation. Final visual RED→GREEN covers separated attack name/damage. Twelve real-art portrait captures inspected; networking-disabled editor smoke passes. No physical-device test claimed.
- Task4 complete as an honest progress pass: C1 release/type tests observed RED, then GREEN; current source imports validate with2450 identities/4534 obtainable prints. Ten old PARTIAL identities resolved, no old FULL regression,743 unresolved detailed-rule identities retained and audited. Future promos remain excluded; no100%-coverage claim.
- Task5 verification: full continuing run740/740 programs; fresh final Pocket44/44 pass. Combined742 unique programs with574 latest passes and168 unresolved historical/current-browser failures, individually indexed. All new runtime/data tests remain in regression coverage. Native debug build and existing v2 signer verified; final source reconstruction package audit is the remaining release check.

Final review: six Important findings reproduced and fixed through RED→GREEN tests. Three nominal Minor findings were regraded functional/Important because they broke requested acquisition sorting, linked-set search and Developer-only diagnostics; all fixed in the same pass. No deferred minor finding.

Final review set-asides: external source verification stays with the centrally recorded primary-source research (not a second claim of reviewer certification); existing shop/pack acquisition remains unchanged; full-suite/APK/packaging verification is performed centrally. See implementation-report rulings and costs. No further external source/app actions are authorized or needed.
