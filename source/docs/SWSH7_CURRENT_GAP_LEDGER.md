# SWSH7 — whole-set gap ledger

Canonical prints: **237** | Playable: **232** | Gated: **5**
Printed attacks: **309** (228 distinct full signatures) | Abilities: **44** (30 distinct signatures)
Trainer rule signatures: **25** | Special Energy rule signatures: **4**
Canonical Git blob: `6d9bff55310a38314eb3f627a2efc4f5d236c5f2`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Required Pokémon V evolution parent is not yet enabled — swsh7-59, swsh7-210
- **2 prints** — Unimplemented attack: Primeval Beak — swsh7-58, swsh7-178
- **1 prints** — Unimplemented Ability: Dew Guard — swsh7-38

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh7-38` | Milotic | Unimplemented Ability: Dew Guard |
| `swsh7-58` | Dracozolt V | Unimplemented attack: Primeval Beak |
| `swsh7-59` | Dracozolt VMAX | Required Pokémon V evolution parent is not yet enabled |
| `swsh7-178` | Dracozolt V | Unimplemented attack: Primeval Beak |
| `swsh7-210` | Dracozolt VMAX | Required Pokémon V evolution parent is not yet enabled |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
