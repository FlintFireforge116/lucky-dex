# XY Primal Clash Stage 5 — v0.69.347

Baseline: successful GitHub APK build v0.69.346 (workflow #635).

## Verified mechanics this release

New physical-card/zone rules: Archie's Ace in the Hole and Maxie's Hidden Ball Trick (both alternate prints), Teammates (both prints); Illumise Helping Hand, Electrike Charge, Torchic Flare Bonus, Ludicolo Astonish, Milotic Aqua Swirl, Nidoqueen Poison Fang, Starmie Synchro Star, Medicham Pure Power, Diggersby Ear Dig, Excadrill Straight Claw, Kingdra Gather Strength, and Florges-EX Lead.

* Last-card Supporters are legal only if actually usable; deck builder avoids dead conditional Aces without matching species and discard setup.
* Teammates references the prior turn KO ledger rather than assuming a KO just happened; draws two selected unique physical deck cards and shuffles.
* Basic Energy SEARCH actions draw from the separate Classic Energy Zone, distinct from physical discard and from-hand effects.
* Synchro Star counts attached ENERGY CARDS (not how many symbols DCE provides); Pure Power allows assigning its four counters one at a time; optional and selection prompts resolve before turn completion.

## Exclusions and next audit

This is **not** the final 164-print gameplay sign-off. Ω Barrier cards remain excluded until all old custom Trainer effects are covered by the protection guard. Other special effects (Beedrill Allergic Shock, Blaziken Spreading Flames, Camerupt-EX Explosive Jet, Kingdra Dragon Blast, Clamperl Shell Protection, and other bespoke effects) also remain excluded. The pinned catalogue source and its complete count/metadata tests remain authoritative and enabled in GitHub.

## Testing

New regression suite: `node --test tests/v07347-primal-clash-trainers-attacks.test.cjs` and all earlier set suites. No APK build is claimed until CI confirms it.
