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
