# SWSH4 — whole-set gap ledger

Canonical prints: **203** | Playable: **188** | Gated: **15**
Printed attacks: **269** (238 distinct full signatures) | Abilities: **29** (28 distinct signatures)
Trainer rule signatures: **18** | Special Energy rule signatures: **4**
Canonical Git blob: `182400b1d8f17a3f99a27dd00a060ad06ea98469`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Trainer effect — swsh4-152, swsh4-201
- **1 prints** — Unimplemented Ability: Buzzap Generator — swsh4-46
- **1 prints** — Unimplemented Ability: Cast-off Shell — swsh4-14
- **1 prints** — Unimplemented Ability: Elusive Master — swsh4-3
- **1 prints** — Unimplemented Ability: Incandescent Awakening — swsh4-26
- **1 prints** — Unimplemented Ability: Resolute Spear — swsh4-174
- **1 prints** — Unimplemented Ability: Shell Survival — swsh4-66
- **1 prints** — Unimplemented Ability: Shifty Substitution — swsh4-12
- **1 prints** — Unimplemented Ability: Spectral Breach — swsh4-71
- **1 prints** — Unimplemented Ability: Thunderous Awakening — swsh4-47
- **1 prints** — Unimplemented Ability: Torrential Awakening — swsh4-30
- **1 prints** — Unimplemented attack: Electrified Bite Mark — swsh4-59
- **1 prints** — Unimplemented attack: Electro Sprinkler — swsh4-59
- **1 prints** — Unimplemented attack: Flying Fury — swsh4-76
- **1 prints** — Unimplemented attack: Life Squeeze — swsh4-66
- **1 prints** — Unimplemented attack: Mini-Metronome — swsh4-63

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh4-3` | Beedrill | Unimplemented Ability: Elusive Master |
| `swsh4-12` | Shiftry | Unimplemented Ability: Shifty Substitution |
| `swsh4-14` | Ninjask | Unimplemented Ability: Cast-off Shell |
| `swsh4-26` | Flareon | Unimplemented Ability: Incandescent Awakening |
| `swsh4-30` | Vaporeon | Unimplemented Ability: Torrential Awakening |
| `swsh4-46` | Electrode | Unimplemented Ability: Buzzap Generator |
| `swsh4-47` | Jolteon | Unimplemented Ability: Thunderous Awakening |
| `swsh4-59` | Eelektross | Unimplemented attack: Electrified Bite Mark; Unimplemented attack: Electro Sprinkler |
| `swsh4-63` | Clefairy | Unimplemented attack: Mini-Metronome |
| `swsh4-66` | Shedinja | Unimplemented attack: Life Squeeze; Unimplemented Ability: Shell Survival |
| `swsh4-71` | Dusknoir | Unimplemented Ability: Spectral Breach |
| `swsh4-76` | Whimsicott | Unimplemented attack: Flying Fury |
| `swsh4-152` | Hero's Medal | Unimplemented Trainer effect |
| `swsh4-174` | Galarian Sirfetch'd V | Unimplemented Ability: Resolute Spear |
| `swsh4-201` | Hero's Medal | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
