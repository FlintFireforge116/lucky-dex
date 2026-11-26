# v0.69.560 — Double Turbo Energy release / Lost Origin stage 1

- Brilliant Stars 186/186; Astral Radiance 216/216. Both Double Turbo Energy prints enabled using the existing physical attachment implementation. Targeted DTE checks include stacking, Weakness/Resistance, non-damage effects and real card attachments. Prior diagnostic: 372 damaging outcomes, 0 unexplained differences, 50 unexercised. The latter are residual coverage limitations rather than known bugs.
- Lost Origin main set: 217 canonical prints, 105 imported (65 Pokémon, 39 Trainers, 1 Special Energy), 67 playable, 38 gated, 112 not imported. Gallery separate. Exact source packet checksums validated against pinned upstream blob 157da08c0435be1c0692faac35e3a7580e638afb.
- New effects include Colress's Experiment, Tool Box, Lost Provisions and Ace Spark; reuse existing exact mechanics for other verified prints. Remaining complex Lost Zone effects, special energy and unimplemented Pokémon remain gated. See generated current gap ledger.
- Four narrow-pool types (Grass, Fire, Water, Lightning) pass both player and CPU generation; other types await later Pokémon imports.
- Prior pre-existing optional historical failures are not addressed here. APK/device validation remains separate.
