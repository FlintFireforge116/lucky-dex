# LuckyDex v0.69.195 — Classic hand cap and EX Unseen Forces Tool fixes

Baseline: v0.69.194. Changed-files ZIP is **relative to `source/`**. No saves, card art, collection records or Pocket gameplay are modified.

## Changes

1. Classic TCG has a hard 8-card hand cap for both player and CPU. The Pocket format retains its existing limit of 10.
2. Ordinary draw operations stop if the hand is full; the draw deck isn't consumed. On a turn draw that is blocked by the cap, `drawSkipped` records the `hand-full` reason.
3. Rare mandatory multi-card effects (e.g. Unown O returning Pokémon and attached Energy) can temporarily add multiple hand entries. After each real battle action/choice the engine trims both hands to eight, keeping the **newest** returned/awarded cards to preserve that card's effect. Any **oldest excess cards** are moved **intact** to the bottom of that player's physical draw deck; the event log records card IDs and count. Existing in-progress Classic battle states with a null hand limit migrate on the next action.
4. Energy Root (ex10-83), Fluffy Berry (ex10-85) and Solid Rage (ex10-92) now have persistent, valid `duration:'whileInPlay'` modifier effects. Previously all three failed effect validation and were unplayable despite being battle-enabled.
5. EX Unseen Forces Tool eligibility is enforced in the Tool action generator, not the Energy attachment generator. Energy Root attaches to ordinary Pokémon with Powers/Bodies, suppresses those abilities and still grants +20 maximum HP. Printed exclusions for Pokémon-ex and owner-/Dark-named cards remain. Other compatible Tools enforce their evolution and target limits.
6. The shared deck-builder's themed Trainer evaluation and Classic builder avoid Energy Root if all otherwise legal Pokémon would lose an ability. Manual inclusion and attachment remain legal.
7. The old EX10 long-running CPU simulation fixture used an assertion about how many actions a match must take; this now accounts for the intentional hand-size change while retaining checks that AI finishes or completes a bounded sequence without getting stuck. Unown O's required return-to-hand test stays outcome-level, and now passes at the cap.

## Automated tests

- `node --test tests/v07195-classic-hand-cap-and-tools.test.cjs` — 7/7 passed (Classic and Pocket hand limit, ordinary drawing, CPU/player overflow, Energy Root, target eligibility, other Tool validation and deck-builder scoring).
- `node --test tests/v07194-unseen-forces-remaining.test.cjs tests/v07193-classic-evolution-dual-armor.test.cjs tests/v07192-unseen-forces-batch.test.cjs tests/v07191-unseen-forces-cpu-ai.test.cjs tests/v07190-classic-unseen-forces.test.cjs tests/v07189-ex9-energy-audit.test.cjs tests/v07188-classic-energy-routing.test.cjs tests/v07195-classic-hand-cap-and-tools.test.cjs` — 120/120 passed before final version metadata changes.
- Selected Base Trainer/Jungle/Fossil/AI checks and new tests — 47/47 passed.

## In-app checks recommended

1. Start an EX Unseen Forces match, draw/search until hand shows 8 cards. Further ordinary draw effects must leave the hand at 8 and preserve the next draw deck card.
2. Attach Energy Root to Granbull or Quagsire: it should be legal, +20 maximum HP should remain, and the Poké-Body should be disabled. It should still reject Pokémon-ex and Dark-/owner-named targets.
3. Make a deck comprised solely of Pokémon with Powers/Bodies and auto-build: Energy Root should not be chosen automatically. It remains manually playable.
4. Run an Advanced or Expert CPU match and watch the hand cap and Energy/Supporter decisions.
5. Test Unown O with a full hand: it and its attached Energy should return; older excess cards should appear at the bottom of the draw deck, not vanish.

Actual Android touchscreen QA has **not** been run here. The hand-cap destination for overflow is a LuckyDex adaptation, not an official tabletop TCG rule. The master rules document has been updated to v2.0.
