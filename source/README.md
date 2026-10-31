# LuckyDex v0.69.37 � Pocket QA, decks and Solo progression

Built only from the supplied `lucky-dex-main.zip` (SHA256 `40bbd6a980e3a8bd64cd4ce7af87abbfc9dcff8ec34635bc2a4a507ad7ef4e70`). The user confirmed its v0.69.36 features despite stale v0.69.35/7016 labels. This release uses Android **7018**, the existing application ID and permanent signer.

The existing portrait workspace now protects unsaved edits with Save/Discard/Cancel, supports rename/duplicate/delete/active-deck previews and owned artwork selection, and provides 16 coherent ownership-aware recipes. Filter clearing retains the Owned setting and dual-type filters accept at most two types. Selected artwork remains cosmetic throughout battle.

Solo has 16 challenges across Beginner, Intermediate, Advanced and Expert, using the same legal engine with progressively stronger public-information evaluation. Two distinct clears unlock the next tier. First-clear rewards, persistent replay protection, expanded records and 15 normal achievements integrate with the existing save/economy. Developer test battles do not award progression. Battle inspection covers physical Bench slots, both discard piles, Tools and Stadiums; both decks use the selected sleeve.

Reviewed cutoff **2026-10-30**: **4,534 released prints / 2,450 identities; 1,833 FULL, 617 PARTIAL, 0 UNSUPPORTED**. This resolves 126 previously PARTIAL identities with no FULL regressions. First Partners launched October 31, beyond the reviewed inventory; its card-by-card source is not supplied or imported. This build does not claim complete latest-release coverage or 100% mechanics.

Run `node scripts/verify-pass-v06937.cjs --tag=verified` for the 58 relevant regression programs, `node scripts/verify-tcgp-catalogue.cjs` for source/schema/coverage integrity, and `node scripts/benchmark-tcgp-v06937.cjs` for host browser timings (Playwright and Chrome required). The unchanged `node scripts/run-tests.cjs` runs the whole historical repository suite; it is not claimed green by this pass. See [implementation and QA report](docs/TCGP_IMPLEMENTATION_REPORT_v06937.md), [database guide](docs/TCGP_CARD_DATABASE.md), and [generated coverage](docs/TCGP_CARD_COVERAGE.md).

Apply the changed-files patch inside canonical `source/`; retain all existing assets and the permanent keystore. The accompanying APK is a recovery/testing candidate: no Android device was available for installation testing.

---

## Historical release notes (not the current source or coverage)

# LuckyDex v0.69.36 — visual Pocket decks and Dual Fusion

Continues the actual current v0.69.35 source; Android7017, unchanged application ID and permanent signer. No older baseline is restored.

The portrait deck workspace has a persistent illustrated My Deck tray, independent collection scrolling, combined filters/search/sorts, pagination, card inspection, automatic/manual Energy, multiple saved decks/drafts and local ownership-aware recipes. Autobuild compares Energy/evolution archetypes, complete family cores and contextual support; it can build around a card/type or repair an existing deck without replacing key cards. Candidate work yields between attempts so editing and cancellation remain responsive. Developer setups show exact PARTIAL blockers, select owned evolution versions and include supported conditional prerequisites and paired practice opponents, without granting cards or rewards.

Cutoff2026-10-30: **4534 obtainable prints /2450 gameplay identities;1707 FULL,743 PARTIAL,0 UNSUPPORTED**. All217 C1 prints and newly obtainable P-B-103 are mapped. Future Promo-C prints and October31 First Partners remain excluded. Genuine type arrays drive effects, weakness, filters and display; Energy still follows actual attack costs. All1605 prior FULL identities remain FULL, ten prior PARTIAL identities are resolved, and92 new identities are FULL. This is not a100%-coverage claim.

Verification commands: `node scripts/verify-pass-v06936.cjs --tag=verified` for all focused Pocket regressions, `node scripts/verify-pass-v06936.cjs --all --tag=all` to record every historical test program, and the unchanged standard `node scripts/run-tests.cjs`. The full historical suite is not green; see `docs/TCGP_TEST_RESULTS_v06936.md` for every failure, and `docs/TCGP_CURRENT_POOL_v06936.md` for source/release gates and the v034/v035 baseline mismatch. Delivery is a changed-only patch applied **inside canonical source/**, not a replacement full repository ZIP.

## Historical v0.69.35 pass

This pass uses only the supplied `EGG_EMERGENCY_0654_NOTES.zip`. Its actual version was v0.69.33/7014, despite the prompt referring to v0.69.34; no unavailable intermediate code was restored. Release v0.69.35 uses Android7016, the same application ID and permanent signer.

The reviewed catalogue now has **1,605 FULL, 714 PARTIAL, 0 UNSUPPORTED** gameplay identities at the existing2026-10-27 cutoff: **460 more FULL** than this supplied baseline. A pinned MIT source fills all631 missing detailed identities via exact collector-number/design-key joins, without replacing reviewed TCGdex records. Unknown text is not guessed, and714 identities remain disabled pending complete mechanics.

Quick Build selects owned compatible attackers, complete evolution chains, Trainers and cost-based Energy rather than alphabetical cards/Grass. Manual Energy choices persist with strategic warnings; automatic mode follows edits. Developer controls focus FULL owned decks by card/Pokémon ID, type, set or mechanic. PARTIAL focus exposes blockers but does not yet produce a playable PARTIAL-card test deck. Attacks remain inspectable when unpaid, show needs versus attached Energy, and become actionable through the real engine. Attached/current/next Energy are typed. Routine battle narration expires after1.6seconds.

Run `node scripts/tcgp-pass-tests.cjs --tag=verified` for focused regressions; `node scripts/run-tests.cjs` remains the standard complete runner. `--all` on the pass runner continues across failures and records every program. See `docs/TCGP_IMPLEMENTATION_REPORT_v06935.md`, `generated/tcgp-implementation-audit-v06935.json` (every initial non-FULL identity), and `generated/tcgp-human-review-v06935.json` (every remaining non-FULL card). This is an implemented progress release, not a100%-completion claim.

Delivery is a source-relative changed-only patch over canonical `source/`. Do not replace the tree or commit a full source ZIP. Older release notes below are history, not the current baseline.

---

# LuckyDex v0.69.33 — expanded Pocket battle catalogue

Based solely on the newly supplied canonical v0.69.32 source. Android versionCode 7014; application ID and signer unchanged. This release maps 4,316 currently obtainable Pocket prints across 24 set/promo namespaces to 2,319 gameplay identities, retaining print ownership and alternate art. Support is explicit: **1,145 FULL, 543 PARTIAL, 631 UNSUPPORTED**. Non-FULL cards are visible with exact reasons and excluded from legal decks; this is not an all-cards-implemented claim.

The existing Battle Lab gains reusable mechanics, validated offline generated data, exact aliases, saved 1–3-type Energy, rules/ability inspection and searchable paged owned browsing. No card image binaries or runtime card-data API dependency are added. Existing setup/drag/Bench/promotion/narration/rewards and unrelated minigames are preserved.

See [database/update guide](docs/TCGP_CARD_DATABASE.md), [coverage and every exception](docs/TCGP_CARD_COVERAGE.md), [sources/licences](docs/TCGP_CARD_SOURCES.md), and [implementation/test report with Termux handoff](docs/TCGP_IMPLEMENTATION_REPORT_v06933.md). Delivery is `LuckyDex_patch_v0.69.33.zip`, with changed/new paths relative to `source/` only. Keep `source/` as the canonical build input.

---

# LuckyDex v0.69.31 — TCG Pocket Battle Flow UX

This release builds on the v0.69.30 free-drag battlefield and makes battle flow readable and player-directed. Benched Pokémon now retain a stable physical Bench slot (1–3), so the player can place a Basic into any open Bench position instead of being forced into the next compact slot. After a Knock Out, the defending side must choose which Benched Pokémon becomes Active; the player gets explicit PROMOTE controls and the CPU chooses through its normal AI legality path.

Battle actions are now narrated visibly. CPU turns resolve one action at a time instead of completing the entire turn invisibly in one engine call, and the battlefield shows a readable action banner for placements, Trainer cards, Energy attachments, retreats, attacks and promotions. Player attack controls also show move name, Energy requirement and damage together.

The compact internal Bench array is preserved for compatibility; a `benchSlot` field provides stable physical board positions without introducing sparse-array assumptions into existing battle logic.

## Release

- versionName: `0.69.31`
- versionCode: `7012`
- canonical GitHub source remains `source/`
- delivery is a changed-files-only patch ZIP

## Verification

Focused TCG Battle core/UI/regression tests and JavaScript syntax checks are run before packaging. Browser-backed Playwright tests are not claimed in environments where Playwright is unavailable.
