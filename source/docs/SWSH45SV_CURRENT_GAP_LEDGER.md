# SWSH45SV — whole-set gap ledger

Canonical prints: **122** | Playable: **120** | Gated: **2**
Printed attacks: **175** (174 distinct full signatures) | Abilities: **39** (37 distinct signatures)
Trainer rule signatures: **0** | Special Energy rule signatures: **0**
Canonical Git blob: `2109b7363a8736dc66cbbaa739ca98df98be7dfe`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Required Pokémon V evolution parent is not yet enabled — swsh45sv-SV119
- **1 prints** — Unimplemented Ability: V Transformation — swsh45sv-SV118

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh45sv-SV118` | Ditto V | Unimplemented Ability: V Transformation |
| `swsh45sv-SV119` | Ditto VMAX | Required Pokémon V evolution parent is not yet enabled |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
