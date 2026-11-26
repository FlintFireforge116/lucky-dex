# SWSH10 — whole-set gap ledger

Canonical prints: **216** | Imported: **216** | Playable: **197** | Gated: **19** | Not imported: **0**
Printed attacks: **264** (211 distinct full signatures) | Abilities: **44** (35 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **1**
Canonical Git blob: `888a5253d3bf05bc4107d52742003ce42f1980f3`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **6 prints** — Unimplemented Trainer effect — swsh10-144, swsh10-145, swsh10-146, swsh10-152, swsh10-185, swsh10-203
- **2 prints** — Unimplemented Ability: Frontier Road — swsh10-134, swsh10-180
- **2 prints** — Unimplemented attack: Psyshield Bash — swsh10-134, swsh10-180
- **1 prints** — Unimplemented Ability: Ancient Wisdom — swsh10-130
- **1 prints** — Unimplemented Ability: Baffling — swsh10-104
- **1 prints** — Unimplemented Ability: Mental Shroud — swsh10-66
- **1 prints** — Unimplemented Ability: Princess's Curtain — swsh10-68
- **1 prints** — Unimplemented Ability: Resonant Evolution — swsh10-119
- **1 prints** — Unimplemented Ability: Stand Sentry — swsh10-120
- **1 prints** — Unimplemented Ability: Wish Connector — swsh10-170
- **1 prints** — Unimplemented Special Energy rules — swsh10-216
- **1 prints** — Unimplemented attack: Borne Ashore — swsh10-34
- **1 prints** — Unimplemented attack: Entangled Dive — swsh10-29
- **1 prints** — Unimplemented attack: Gigaton Break — swsh10-130
- **1 prints** — Unimplemented attack: Honey Rush — swsh10-12
- **1 prints** — Unimplemented attack: Hypnostrike — swsh10-170

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh10-12` | Vespiquen | Unimplemented attack: Honey Rush |
| `swsh10-29` | Golduck | Unimplemented attack: Entangled Dive |
| `swsh10-34` | Mantine | Unimplemented attack: Borne Ashore |
| `swsh10-66` | Mesprit | Unimplemented Ability: Mental Shroud |
| `swsh10-68` | Diancie | Unimplemented Ability: Princess's Curtain |
| `swsh10-104` | Thievul | Unimplemented Ability: Baffling |
| `swsh10-119` | Eevee | Unimplemented Ability: Resonant Evolution |
| `swsh10-120` | Hoothoot | Unimplemented Ability: Stand Sentry |
| `swsh10-130` | Regigigas | Unimplemented attack: Gigaton Break; Unimplemented Ability: Ancient Wisdom |
| `swsh10-134` | Wyrdeer V | Unimplemented attack: Psyshield Bash; Unimplemented Ability: Frontier Road |
| `swsh10-144` | Grant | Unimplemented Trainer effect |
| `swsh10-145` | Gutsy Pickaxe | Unimplemented Trainer effect |
| `swsh10-146` | Hisuian Heavy Ball | Unimplemented Trainer effect |
| `swsh10-152` | Supereffective Glasses | Unimplemented Trainer effect |
| `swsh10-170` | Jirachi V | Unimplemented attack: Hypnostrike; Unimplemented Ability: Wish Connector |
| `swsh10-180` | Wyrdeer V | Unimplemented attack: Psyshield Bash; Unimplemented Ability: Frontier Road |
| `swsh10-185` | Grant | Unimplemented Trainer effect |
| `swsh10-203` | Grant | Unimplemented Trainer effect |
| `swsh10-216` | Double Turbo Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
