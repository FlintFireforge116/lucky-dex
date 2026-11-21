# v0.69.346 — XY Primal Clash abilities and physical-zone actions

Baseline: successful v0.69.345 GitHub build.

* Implemented all seven remaining unique Primal Clash activated/evolution-triggered Abilities: Nurture and Heal, Captivating Rhythm, Diving Search, Sparkling Ripples, Energy Connect, Unruly Claw and Sand Flap.
* Every search, discard, reveal, shuffle, attachment or Energy movement is made against a real card reference or the actual Basic Energy ledger; a printed card is never fabricated. Energy Connect is repeatable but is not advertised when all Bench Basic Energy is exhausted.
* Added seven more printed attacks: Indomitable Blaze, Float On, Powerful Storm, Dwindling Wave, Drench, Derail and Rototiller. Derail cannot discard a Special Energy protected from opposing attack effects. Rototiller shuffles the chosen real discard ref into deck.
* Evolution Abilities fire only when evolving from hand, and both optional triggers can be declined.
* All Ω Barrier prints remain conservatively gated. The generic protection hook is tested, but the full set of older bespoke Trainer paths is not audited; do not auto-deck these prints yet. Other incomplete printed attacks and Trainers remain gated. No claim of complete 164-print gameplay coverage.
* The official 164-print/217-attack/13-Ability/22-Ancient-Trait identity catalogue remains the authoritative build-time gate. Tests include live battle-state choices and cross-era regression.

Release requires GitHub APK confirmation after pushing the patch.
