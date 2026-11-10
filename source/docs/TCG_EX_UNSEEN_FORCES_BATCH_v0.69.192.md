# LuckyDex v0.69.192 — EX Unseen Forces playable batch 2

Date: 10 November 2026. Source baseline: v0.69.191. Target: v0.69.192.

## Scope and correctness

- Full catalogue stays at 145 printed ex10 cards; 87 are now `battleEnabled` / `deckEligible` (123 registered executable attacks on that subset). The other 58 remain explicitly PARTIAL and cannot be built into legal player or CPU battle decks. This is the next batch, **not** completion of the whole set.
- Newly enabled card IDs: ex10-8, -10, -13, -19, -36, -39, -41, -45, -46, -57, -72, -82, -84, -87, -89, -107, -108, -113, -114, -115, -D and -O.
- Adds or completes: Jolteon and Vaporeon multi-type basic-Energy bonuses and status, Vaporeon hand-only Energy attachment, Octillery retreat lock (opponent only, active only), Slowbro Dual Armor, Clefable next-turn bonus, Granbull Crushing Blow coin and Energy choice, Magcargo Extra Flame and Smokescreen, Quilava Smokescreen, Scyther Agility, Gligar free retreat only with no Energy, Slowpoke Fishing Tail, Energy Removal 2, Energy Switch, Poké Ball, Professor Elm's Training Method, Politoed ex targeted and scaling attacks, Scizor ex Steel Wing, three Pokémon Star's attack side effects, Unown D and O.
- Moves that select Pokémon favour actual board slots. Multi-stage card/energy selections name the Energy and destination. The opposing player chooses only where the printed card specifies that owner.
- Pokémon Star one-per-deck limit is already implemented in the shared Classic deck validator and remains enforced across different Star species. The set remains available for CPU deck and strategy filtering.
- Shared `selfHasEnergyType` now recognises actually attached Special Energy providing the required named type, in addition to basic Energy. Basic Energy discard and draw-deck destinations remain distinct.

## Test evidence

- `tests/v07192-unseen-forces-batch.test.cjs`: 19/19 passed; includes meaningful outcome assertions, weakness versus bench damage, alternate Special Energy discard, forced switch rules, and correct target instance.
- `tests/v07190-classic-unseen-forces.test.cjs`, `tests/v07191-unseen-forces-cpu-ai.test.cjs`, `tests/v07191-unseen-forces-attack-sweep.test.cjs`: passed with the enlarged card pool. The attack sweep checks each FULL attack can be initiated and choices resolved in one seeded board setup; it does not assert every printed branch.
- Selected recent cross-set v07172–v07189 suites: 251/251 passed (134 and 117 independent subsets), excluding unrelated absolute-path artwork tests.
- Selected older Base/Jungle/Fossil suites: 44/44 passed.
- One large parallel history-run attempt timed out without a final verdict; separate grouped runs are reported above, not falsely counted as completed.
- No real Android touch QA, APK install, or saved-data migration tests. The 58 remaining PARTIAL cards still require effect implementation and card-by-card reviews. Historical Neo Discovery failing expectations are not claimed to be fixed.

## In-app verification suggestions

1. Against an opponent with both Basic and Special attached Energy, use Granbull Crushing Blow on heads; choose which exact Energy to discard. Energy Removal 2 should first let you tap the opponent's Pokémon, then pick its Energy.
2. Use Energy Switch: tap the source, choose the attached Basic Energy type, then tap a different Pokémon; the source loses one and the target gains exactly one.
3. Use Politoed ex Upward Lick on an Active Fire Pokémon versus a Benched Fire Pokémon. Weakness applies to Active, never Bench. Check Scyther Agility prevents damage and effects on heads.
4. Create a single-Star deck with ex10-113/114/115, then verify the conditional disadvantage effects against actual Prize counts. Two different Stars in one deck must remain illegal.
5. With a complex still-PARTIAL Unown or Pokémon-ex, confirm the card can be inspected in collection but does not enter live normal/CPU/Test Lab combat until complete.

## Notes for next expansion work

Continue the other 58 EX Unseen Forces PARTIAL cards before advancing to EX Delta Species. Prioritise supported evolution-triggered Powers, correctly sourced Trainer/Tool effects and the rest of Unown Hidden Powers. Update the master rules and tests with each batch. CPU decision quality remains heuristic and is not guaranteed optimal by attack smoke tests.
