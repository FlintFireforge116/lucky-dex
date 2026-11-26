# SWSH8 — whole-set gap ledger

Canonical prints: **284** | Imported: **284** | Playable: **258** | Gated: **26** | Not imported: **0**
Printed attacks: **391** (352 distinct full signatures) | Abilities: **30** (26 distinct signatures)
Trainer rule signatures: **21** | Special Energy rule signatures: **3**
Canonical Git blob: `d88289e9b1469bc1c27cf268461f9efdec00134d`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **10 prints** — Unimplemented Trainer effect — swsh8-230, swsh8-231, swsh8-233, swsh8-234, swsh8-241, swsh8-242, swsh8-260, swsh8-264, swsh8-275, swsh8-279
- **2 prints** — Unimplemented Ability: Double Gunner — swsh8-79, swsh8-266
- **2 prints** — Unimplemented attack: G-Max Spiral — swsh8-79, swsh8-266
- **1 prints** — Required Pokémon V evolution parent is not yet enabled — swsh8-270
- **1 prints** — Unimplemented Ability: Desperate Blast — swsh8-137
- **1 prints** — Unimplemented Ability: Expert in Roundness — swsh8-203
- **1 prints** — Unimplemented Ability: Maximum Downer — swsh8-108
- **1 prints** — Unimplemented Ability: Pitch a Pyukumuku — swsh8-77
- **1 prints** — Unimplemented Ability: Rapid Strike Canceler — swsh8-67
- **1 prints** — Unimplemented Ability: Slimy Room — swsh8-197
- **1 prints** — Unimplemented Special Energy rules — swsh8-244
- **1 prints** — Unimplemented attack: Bone Block — swsh8-173
- **1 prints** — Unimplemented attack: Force Regeneration — swsh8-118
- **1 prints** — Unimplemented attack: Healing Circle — swsh8-11
- **1 prints** — Unimplemented attack: Melodious Echo — swsh8-124
- **1 prints** — Unimplemented attack: Multishot Star — swsh8-53
- **1 prints** — Unimplemented attack: Photon Boost — swsh8-120

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh8-11` | Leavanny | Unimplemented attack: Healing Circle |
| `swsh8-53` | Starmie | Unimplemented attack: Multishot Star |
| `swsh8-67` | Gorebyss | Unimplemented Ability: Rapid Strike Canceler |
| `swsh8-77` | Pyukumuku | Unimplemented Ability: Pitch a Pyukumuku |
| `swsh8-79` | Inteleon VMAX | Unimplemented attack: G-Max Spiral; Unimplemented Ability: Double Gunner |
| `swsh8-108` | Toxtricity | Unimplemented Ability: Maximum Downer |
| `swsh8-118` | Galarian Cursola | Unimplemented attack: Force Regeneration |
| `swsh8-120` | Deoxys | Unimplemented attack: Photon Boost |
| `swsh8-124` | Meloetta | Unimplemented attack: Melodious Echo |
| `swsh8-137` | Golem | Unimplemented Ability: Desperate Blast |
| `swsh8-173` | Mandibuzz | Unimplemented attack: Bone Block |
| `swsh8-197` | Goodra | Unimplemented Ability: Slimy Room |
| `swsh8-203` | Blissey | Unimplemented Ability: Expert in Roundness |
| `swsh8-230` | Cross Switcher | Unimplemented Trainer effect |
| `swsh8-231` | Crossceiver | Unimplemented Trainer effect |
| `swsh8-233` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-234` | Farewell Bell | Unimplemented Trainer effect |
| `swsh8-241` | Sidney | Unimplemented Trainer effect |
| `swsh8-242` | Skaters' Park | Unimplemented Trainer effect |
| `swsh8-244` | Fusion Strike Energy | Unimplemented Special Energy rules |
| `swsh8-260` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-264` | Sidney | Unimplemented Trainer effect |
| `swsh8-266` | Inteleon VMAX | Unimplemented attack: G-Max Spiral; Unimplemented Ability: Double Gunner |
| `swsh8-270` | Espeon VMAX | Required Pokémon V evolution parent is not yet enabled |
| `swsh8-275` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-279` | Sidney | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
