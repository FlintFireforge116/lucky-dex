# SWSH8 — whole-set gap ledger

Canonical prints: **284** | Imported: **284** | Playable: **269** | Gated: **15** | Not imported: **0**
Printed attacks: **391** (352 distinct full signatures) | Abilities: **30** (26 distinct signatures)
Trainer rule signatures: **21** | Special Energy rule signatures: **3**
Canonical Git blob: `d88289e9b1469bc1c27cf268461f9efdec00134d`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **4 prints** — Unimplemented Trainer effect — swsh8-233, swsh8-234, swsh8-260, swsh8-275
- **2 prints** — Unimplemented Ability: Double Gunner — swsh8-79, swsh8-266
- **2 prints** — Unimplemented attack: G-Max Spiral — swsh8-79, swsh8-266
- **1 prints** — Required Pokémon V evolution parent is not yet enabled — swsh8-270
- **1 prints** — Unimplemented Ability: Desperate Blast — swsh8-137
- **1 prints** — Unimplemented Ability: Pitch a Pyukumuku — swsh8-77
- **1 prints** — Unimplemented Ability: Slimy Room — swsh8-197
- **1 prints** — Unimplemented Special Energy rules — swsh8-244
- **1 prints** — Unimplemented attack: Force Regeneration — swsh8-118
- **1 prints** — Unimplemented attack: Melodious Echo — swsh8-124
- **1 prints** — Unimplemented attack: Multishot Star — swsh8-53
- **1 prints** — Unimplemented attack: Photon Boost — swsh8-120

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh8-53` | Starmie | Unimplemented attack: Multishot Star |
| `swsh8-77` | Pyukumuku | Unimplemented Ability: Pitch a Pyukumuku |
| `swsh8-79` | Inteleon VMAX | Unimplemented attack: G-Max Spiral; Unimplemented Ability: Double Gunner |
| `swsh8-118` | Galarian Cursola | Unimplemented attack: Force Regeneration |
| `swsh8-120` | Deoxys | Unimplemented attack: Photon Boost |
| `swsh8-124` | Meloetta | Unimplemented attack: Melodious Echo |
| `swsh8-137` | Golem | Unimplemented Ability: Desperate Blast |
| `swsh8-197` | Goodra | Unimplemented Ability: Slimy Room |
| `swsh8-233` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-234` | Farewell Bell | Unimplemented Trainer effect |
| `swsh8-244` | Fusion Strike Energy | Unimplemented Special Energy rules |
| `swsh8-260` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-266` | Inteleon VMAX | Unimplemented attack: G-Max Spiral; Unimplemented Ability: Double Gunner |
| `swsh8-270` | Espeon VMAX | Required Pokémon V evolution parent is not yet enabled |
| `swsh8-275` | Elesa's Sparkle | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
