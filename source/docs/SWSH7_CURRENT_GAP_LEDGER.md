# SWSH7 — whole-set gap ledger

Canonical prints: **237** | Playable: **205** | Gated: **32**
Printed attacks: **309** (228 distinct full signatures) | Abilities: **44** (30 distinct signatures)
Trainer rule signatures: **25** | Special Energy rule signatures: **4**
Canonical Git blob: `6d9bff55310a38314eb3f627a2efc4f5d236c5f2`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **6 prints** — Unimplemented Trainer effect — swsh7-146, swsh7-151, swsh7-155, swsh7-157, swsh7-159, swsh7-160
- **3 prints** — Unimplemented attack: Yoga Loop — swsh7-83, swsh7-185, swsh7-186
- **2 prints** — Required Pokémon V evolution parent is not yet enabled — swsh7-59, swsh7-210
- **2 prints** — Unimplemented Ability: Rubbish Collecting — swsh7-101, swsh7-216
- **2 prints** — Unimplemented attack: Primeval Beak — swsh7-58, swsh7-178
- **1 prints** — Unimplemented Ability: Dew Guard — swsh7-38
- **1 prints** — Unimplemented Ability: Fluffy Barrage — swsh7-4
- **1 prints** — Unimplemented Ability: Fumbling Hands — swsh7-105
- **1 prints** — Unimplemented Ability: Phantom Transformation — swsh7-103
- **1 prints** — Unimplemented Ability: Rapid Strike Connection — swsh7-73
- **1 prints** — Unimplemented Ability: Solar Evolution — swsh7-3
- **1 prints** — Unimplemented Special Energy rules — swsh7-165
- **1 prints** — Unimplemented attack: Big Sparking — swsh7-50
- **1 prints** — Unimplemented attack: Electron Crush — swsh7-56
- **1 prints** — Unimplemented attack: Extreme Freeze — swsh7-116
- **1 prints** — Unimplemented attack: Judgment Surge — swsh7-118
- **1 prints** — Unimplemented attack: Live Painting — swsh7-128
- **1 prints** — Unimplemented attack: Mirror Pain — swsh7-66
- **1 prints** — Unimplemented attack: Pandemonium — swsh7-77
- **1 prints** — Unimplemented attack: Shadow Flicker — swsh7-80
- **1 prints** — Unimplemented attack: Tricky Steps — swsh7-79
- **1 prints** — Unimplemented attack: Zapper Kick — swsh7-82

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh7-3` | Skiploom | Unimplemented Ability: Solar Evolution |
| `swsh7-4` | Jumpluff | Unimplemented Ability: Fluffy Barrage |
| `swsh7-38` | Milotic | Unimplemented Ability: Dew Guard |
| `swsh7-50` | Raichu | Unimplemented attack: Big Sparking |
| `swsh7-56` | Ampharos | Unimplemented attack: Electron Crush |
| `swsh7-58` | Dracozolt V | Unimplemented attack: Primeval Beak |
| `swsh7-59` | Dracozolt VMAX | Required Pokémon V evolution parent is not yet enabled |
| `swsh7-66` | Wobbuffet | Unimplemented attack: Mirror Pain |
| `swsh7-73` | Florges | Unimplemented Ability: Rapid Strike Connection |
| `swsh7-77` | Gourgeist | Unimplemented attack: Pandemonium |
| `swsh7-79` | Ribombee | Unimplemented attack: Tricky Steps |
| `swsh7-80` | Marshadow | Unimplemented attack: Shadow Flicker |
| `swsh7-82` | Galarian Zapdos | Unimplemented attack: Zapper Kick |
| `swsh7-83` | Medicham V | Unimplemented attack: Yoga Loop |
| `swsh7-101` | Garbodor VMAX | Unimplemented Ability: Rubbish Collecting |
| `swsh7-103` | Zoroark | Unimplemented Ability: Phantom Transformation |
| `swsh7-105` | Thievul | Unimplemented Ability: Fumbling Hands |
| `swsh7-116` | Kyurem | Unimplemented attack: Extreme Freeze |
| `swsh7-118` | Zygarde | Unimplemented attack: Judgment Surge |
| `swsh7-128` | Smeargle | Unimplemented attack: Live Painting |
| `swsh7-146` | Dream Ball | Unimplemented Trainer effect |
| `swsh7-151` | Moon & Sun Badge | Unimplemented Trainer effect |
| `swsh7-155` | Ribbon Badge | Unimplemented Trainer effect |
| `swsh7-157` | Shopping Center | Unimplemented Trainer effect |
| `swsh7-159` | Snow Leaf Badge | Unimplemented Trainer effect |
| `swsh7-160` | Spirit Mask | Unimplemented Trainer effect |
| `swsh7-165` | Treasure Energy | Unimplemented Special Energy rules |
| `swsh7-178` | Dracozolt V | Unimplemented attack: Primeval Beak |
| `swsh7-185` | Medicham V | Unimplemented attack: Yoga Loop |
| `swsh7-186` | Medicham V | Unimplemented attack: Yoga Loop |
| `swsh7-210` | Dracozolt VMAX | Required Pokémon V evolution parent is not yet enabled |
| `swsh7-216` | Garbodor VMAX | Unimplemented Ability: Rubbish Collecting |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
