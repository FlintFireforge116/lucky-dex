# LuckyDex v0.69.505 — Chilling Reign stage 1

The canonical Pokémon TCG catalogue is pinned to commit `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`, blob `0371b6d2d209187306ff6e1a1ef9a09a2a1d8121`. The offline compact catalogue has SHA-256 `dee9e3b533c485f1edbb7314b24de9aee192b4e2def2dd1a3bbd4f6018bc8d25`. No device-side download is required.

- 233 canonical prints (125 supported, 108 explicitly gated), 251 printed attacks, 44 printed Abilities, 59 Trainers, 6 Energy prints.
- Player/CPU set selectors, catalogue, owned-card projection and legal deck builders include `swsh6`. Basic Energy uses the existing hybrid Energy Zone model rather than taking up deck slots. Alternate prints retain collector number and art; V and VMAX prize/stage metadata are preserved.
- Full-signature descriptor reuse and exact reprints preserve previously implemented mechanics. The first pass includes Rapid/Single Strike metadata, Ice Rider Calyrex V, Celebi V/VMAX, Metagross V/VMAX, Tornadus V/VMAX, Quick Shooting, Brawly, Doctor and the type-specific Gloves. There are no changes to shared battle core/effect handlers in this batch.
- See `SWSH6_CURRENT_GAP_LEDGER.md` for remaining blockers. Prioritize unique Trainer and Special Energy signatures and V/VMAX pairs, then remaining reactive Abilities. Gated prints cannot enter decks. Do not treat descriptor validation or attack execution smoke as proof of complete printed-rule fidelity. Independent outcome audit remains required.
- New integration and outcome tests cover canonical costs and text, descriptors, V/VMAX metadata, art/ownership projection, deck legality, bilateral enabled attack smoke, retreat/Strike counting, energy discard, damage thresholds, Rapid Strike bench search, targeted counters, Grass-only healing, conditional Tools, Active-only retreat modifier and Doctor.
- APK compilation and physical-device testing are separate from the offline release preparation.

Validation: exact `sh scripts/prepare-swsh6.sh` exited 0, 29/29 historical/new source gates, 1564/1564 test invocations passed, zero failed/skipped/cancelled. New Chilling Reign suites 21/21. Standalone manifest unit suite 12/12. The release is partial; full APK/device verification and independent whole-set audit remain outstanding.
