# TCG Pocket Battlefield v0.69.29 Implementation Plan

> Execute inline using superpowers:executing-plans, with test-first changes and a fresh read-only final review. User explicitly requests implementation without repeated design approval.

**Goal:** One coherent single-screen battlefield, delivered as changed/new files only over the supplied v0.69.28 source.

**Architecture:** Retain the current vanilla-JavaScript UI and all battle-engine modules. Replace competing battlefield CSS with one grid-based opponent/centre/player geometry. Add one small pure layout helper for count-aware hand poses, applied to the fixed hand anchor on render/resize. Preserve existing legal-action/drop dispatch and card-native controls.

**Tech stack:** Existing JavaScript/CSS, Node tests and Playwright/desktop Chrome.

**Spec:** User attachment `28be9f8b-6226-411c-bcda-c9530e3f4b5e/Pasted text.txt`, read completely. The supplied `lucky-dex-main.zip` is the sole baseline; product root is `lucky-dex-main/source/` inside that archive.

## Global constraints

- Release 0.69.29 / Android versionCode7010; preserve application ID and permanent signer.
- Preserve core/data/decks/AI/effects/Solo/progression, saves, ownership, alternate-art identity, achievements and rewards.
- No vertical battle scrolling; overlays may scroll internally.
- Manual opening Active required, Bench optional, no auto-fill.
- Stable three-slot Bench, centred Actives, separate hand/deck/discard/Energy anchors.
- Empty discard is an outline only; player deck uses equipped sleeve.
- Card-native attacks/retreat; legal Basic/evolution/Energy/centre drops; relevant target overlay only.
- No unrelated CSS cleanup, new cards/mechanics, Adventure or pack changes.
- Patch paths are source-relative, no unchanged assets/caches/Git; no deletion list unless files are actually deleted.
- Preserve existing GitHub workflow building from source; final commands target ~/lucky-dex/source without rsync or full ZIP commits.

## Approach

Chosen implementation: explicit responsive grid zones with cards sized to their allocated rows, not independent percentage offsets. A pure handFan(count,width,height) model supplies positions/angles and a horizontal scrolling span for large hands. The player's piles stack in a reserved left rail, leaving a large bottom hand anchor and dedicated lower-right Energy. Existing DOM action attributes remain the interaction boundary. This is the builder's implementation choice under the user's approved spatial brief.

Rejected: another appended override block (does not remove conflicting geometry); battle-engine rewrite/framework migration (unnecessary and prohibited).

## Review focus

- Shortest viewport with full benches and actionable Active must fit without overlap.
- Large hands must remain reachable, including the last card, without vertical growth.
- Resize and pointer cancellation must not leave stale ghosts or a hidden/blocked hand.
- Setup must never execute READY without a real selected Active.
- Drop dispatch must preserve core legality, including invalid Energy/evolution rejection and relevant multi-target selection.

## Tasks and verification

- [x] Baseline:14 existing focused programs pass; full-run baseline Adventure Map-tool failures recorded before edits.
- [x] RED: missing helper and overlapping opponent regions reproduced; gesture/CPU-close regressions added before fixes.
- [x] GREEN: pure layout helper, one anchored renderer and consolidated CSS; unused renderers retired in place.
- [x] Real UI setup, optional Bench, Basic/evolution/centre/Energy, attack/retreat, discards and cancellation pass. All five requested viewports and hand counts1/3/5/10/20 covered;34 fresh artwork/sheet screenshots captured.
- [x] Final19 focused programs pass;500 seeded matches plus20 repeat samples. Full project runner retains the same two unrelated Adventure Map-tool failures; later programs not reached.
- [x] One independent read-only review, one confirmed P2 fixed RED/GREEN. Final Android build/signature/version checks pass; supplied engine/signer/workflow unchanged.
- [x] Changed-only patch audit and source-reconstruction simulation implemented; final manifest/hash detached from archive. Exact Termux handoff accompanies delivery.

## Ledger

Isolation: fresh extraction at Cards/LuckyDex-v06929/lucky-dex-main/source. Parent Git master is unrelated to this new ZIP, so no worktree/commit from old source is used. User asked for patch-only delivery, not Git mutation. No AGENTS.md found in supplied archive.

Pre-flight: renderer uses the existing legalActions/applyAction boundary; layout helper touches geometry only. Core/AI/decks/progression stay byte-for-byte unchanged. No interface conflict found.

Review ledger: independent reviewer inspected UI/helper/CSS/tests and four real-art screenshots. One P2 global .empty padding leak expanded discard outlines beyond their button; actual inner-pile bounds failed before reset and passed afterwards. No further concrete blocker. Physical Android, artwork availability and packaging were not judged by that review. No additional review loop needed; builder verified final package/build separately. See docs/TCGP_BATTLEFIELD_v0.69.29.md for evidence and limitations.
