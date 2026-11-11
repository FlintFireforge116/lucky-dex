# LuckyDex v0.69.193 — Classic deck-builder evolution and Dual Armor audit

Baseline: v0.69.192; patch target: v0.69.193; extraction root: `source/`.

## Reproduction and fix

The user's screenshot exactly matches Test Lab all-battle-ready EX Unseen Forces (`sets:["ex10"]`, Fire filter, random seed 12) in v0.69.192: 4 Cyndaquil, 3 Quilava, 0 Typhlosion, and two off-type Scyther. EX Unseen Forces Typhlosion (`ex10-17`) is currently PARTIAL/battle-disabled, but the old builder mistook Quilava for a legitimate terminal evolution because it looked only at the filtered playable pool.

The builder now refuses to feature an unfinished evolvable line. When the user chooses additional compatible sets and a Typhlosion is owned and battle-ready, a focused Quilava receives the complete Cyndaquil–Quilava–Typhlosion chain. Random automatic builds that cannot finish the line choose another legal family. Explicitly user-focused standalone Basic strategies in restricted historical sets and Basic-only filters are preserved. Off-type, unaccompanied evolving Basics are no longer fallback filler.

## Conditional type changes

Classic Dual Armor applies only if its printed activation Energy is attached. The strategy builder, manual-deck automatic Energy recommendation, metadata and CPU all distinguish printed type, conditional granted type, printed attack Energy costs and actual available Energy Zone types:

* EX10 Magcargo: Fire attacks; Fighting Energy enables its additional Fighting type.
* EX10 Slowbro: Water attacks; Psychic Energy enables the additional Psychic type.
* EX7 Rocket's Scyther ex and Scizor ex: Grass and Metal respectively activate their Dual Armor Bodies.

Auto builds include the useful trigger without inventing a third type. Incompatible explicit Energy-type filters prevent picking that core. A manual-only Fire Magcargo deck remains legal, as optional Dual Armor activation is not a printed attack cost. CPU opponents preserve the full Energy type plan instead of truncating it to the requested type.

## Regression coverage

* `tests/v07193-classic-evolution-dual-armor.test.cjs`: exact screenshot seed, gated Stage 2, full cross-set evolution, Magcargo/Slowbro/Rocket type activation, manual vs auto Energy, metadata conditional type and CPU plans (10 tests).
* `tests/v07191-unseen-forces-cpu-ai.test.cjs`: late-game Energy Recycle test uses pinned original 30-card fixture rather than silently changing battle length when seeded autobuilds change.
* Focused older Classic builder, Jungle, Fossil, EX10 combat/CPU and extended-batch regression suites.

This patch makes NO changes to Pocket rules, ownership, saves, battle effects, card art, manual deck editing, or the 58 still-gated EX10 cards. Android touch testing was not available.
