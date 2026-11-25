# SWSH45 — whole-set gap ledger

Canonical prints: **73** | Playable: **67** | Gated: **6**
Printed attacks: **81** (79 distinct full signatures) | Abilities: **15** (15 distinct signatures)
Trainer rule signatures: **13** | Special Energy rule signatures: **0**
Canonical Git blob: `c04fe1c9abcc2e15866506f2d933f382280f0401`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **4 prints** — Unimplemented Trainer effect — swsh45-57, swsh45-61, swsh45-62, swsh45-65
- **1 prints** — Required Pokémon V evolution parent is not yet enabled — swsh45-51
- **1 prints** — Unimplemented Ability: V Transformation — swsh45-50

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh45-50` | Ditto V | Unimplemented Ability: V Transformation |
| `swsh45-51` | Ditto VMAX | Required Pokémon V evolution parent is not yet enabled |
| `swsh45-57` | Ball Guy | Unimplemented Trainer effect |
| `swsh45-61` | Rusted Shield | Unimplemented Trainer effect |
| `swsh45-62` | Rusted Sword | Unimplemented Trainer effect |
| `swsh45-65` | Ball Guy | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
