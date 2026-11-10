# LuckyDex v0.69.184 — Classic TCG targeting and Trainer lock clarity

## User-reported case

- Opponent Manectric ex (EX Deoxys 101) uses **Disconnect**: its printed effect blocks all non-Supporter Trainers on the defender's **next** turn. Energy Charge (ex8-86) and Master Ball (ex8-88) are Items, so the screenshot's unplayable state is correct.
- We verified it does *not* remain locked beyond the next turn, and using a Supporter alone does not block ordinary Trainers. The screen now displays the existing lock and explains that Supporters remain allowed.
- Similar EX Deoxys Electrike (ex8-59) and Rocket Returns Trainer restrictions benefit from the same notice. This changes messaging only, not printed rules.

## Direct board targeting

- Attacks such as Salamence ex's **Flame Jet** now offer a tap-on-the-Pokémon target choice rather than a duplicate-name text menu. A target is identified by the existing legal action's unique Pokémon UID and board index, so identical species in separate slots are distinct.
- The same generic board locator applies to other UID-based effects and their attack choices, across Classic expansions and both player/CPU boards, including current Active alternatives.
- Non-Pokémon choices (e.g., discard Energy versus keep Energy) retain the normal choice menu. Multiple attributes or multi-card decisions remain separate and are not reinterpreted as a Pokémon target.
- Existing direct board selection during an effect choice is preserved.

## Regression tests

- `tests/v07184-board-targets-trainer-lock.test.cjs` verifies exact on-board Flame Jet choices and damage; duplicate names; UID-based choices on either side; Disconnect turn duration, Items and Supporters; and normal post-Supporter Item legality.
- Existing EX Deoxys, Rocket Returns, FireRed & LeafGreen, and shared Classic/Pocket UI tests remain passing.

This patch overlays the unpacked canonical `source/` tree after version 0.69.183. No GitHub actions were performed on the user's behalf.
