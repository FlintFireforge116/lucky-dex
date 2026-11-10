# LuckyDex Classic — v0.69.190 release notes

Baseline: v0.69.189. Version: v0.69.190. Date: 2026-11-10.

## Old Classic fixes
- Generic deck search (e.g. Base Set Computer Search) only searches cards actually in the physical draw deck. The infinite Basic Energy Zone is available only to applicable Basic Energy searches/acceleration.
- Focused Basic/Stage-1 builds (including Jungle Scyther) need not force inclusion of later evolution lines.
- Sparse Fossil focus builds can supplement with a compatible secondary type when the player's request is not strictly mono-type.
- Neo Discovery Scizor/Tyranitar focus lines include essential pre-evolution Energy types in the Energy Zone instead of requiring older Special Darkness/Metal cards for a Basic Energy cost.

## EX Unseen Forces (ex10)
- 145 uniquely registered cards: 117 numbered prints plus 28 letter/symbol Unown cards.
- All printed card text and catalogue entries are registered for collection/card inspection, with set picker, manual builder and CPU filter integration.
- 65 battleEnabled/deckEligible cards, with 89 attacks on those cards. Remaining 80 are intentionally supportStatus=PARTIAL and excluded from legal battle decks to avoid fake or unsupported effects. Do not claim complete playable coverage.
- All 28 Unown prints have distinct set/number identities. Same-name deck copy limits still apply. The shared Shuffle ability supports the allowed once-per-turn cross-form switch. A subset of letter-specific attacks is ready; the rest are gated.
- New battle effect support includes selected targeted attacks, Energy Zone-aware Basic Energy search, real counter placement, attack locks, optional outcome labels, and specific ex10 interactions covered by tests.
- Pokémon Star (including globally restricted copies) and many evolution-triggered Powers or unusual Trainer/Tools remain PARTIAL and cannot be included in legal battle decks until rule coverage is implemented and tested.

## Tests actually run (Node)
- Selected recent-era suite `v0717*.test.cjs`, `v0718*.test.cjs`, and `v07190-classic-unseen-forces.test.cjs`: 283 passing, 0 failing.
- Focused ex10/ex9/Energy/Deoxys/Rocket suite: 115 passing, 0 failing.
- Older selected Base Trainer/Jungle/Fossil/Neo suite: 51 passing, 5 failing; all five failing Neo Discovery tests also failed on the v0.69.189 baseline, chiefly due to superseded Basic Darkness/Metal Zone assumptions (and a pre-existing CPU completion test). Current source fixes two additional Neo cases that previously failed on the baseline.
- No physical Android UI/touch testing performed. Artwork downloads and host packaging/install not tested on device.

## Targeted in-app checks
1. Base Set Computer Search must not offer infinite Basic Energy Zone entries as if they are physical cards; a dedicated Energy Search should still use the Zone.
2. Jungle Scyther focused 30-card auto deck should build without forcing Scizor; Fossil sparse focus should build when a legal compatible mixed type is available.
3. In ex10, build a legal deck from FULL cards, switch Unown forms with Shuffle, verify no second Shuffle in the same turn, and verify Energy Search gives Basic Energy in hand.
4. Any ex10 card marked PARTIAL should be visible in catalogue but impossible to enter normal battle decks.

## Continuing work
Implement and validate the 80 remaining EX Unseen Forces cards. Add effects/test cases and flip `battleEnabled` only when behaviour is actually supported. Update `docs/LUCKYDEX_MASTER_RULES.txt` in the same patch.
