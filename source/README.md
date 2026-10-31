# LuckyDex v0.69.35 — executable cards and coherent decks

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
