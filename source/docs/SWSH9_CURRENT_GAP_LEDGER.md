# SWSH9 — whole-set gap ledger

Canonical prints: **186** | Imported: **186** | Playable: **158** | Gated: **28** | Not imported: **0**
Printed attacks: **235** (202 distinct full signatures) | Abilities: **34** (25 distinct signatures)
Trainer rule signatures: **22** | Special Energy rule signatures: **1**
Canonical Git blob: `6c33800813e0375da544c26d2e97992a768c015f`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **9 prints** — Unimplemented Trainer effect — swsh9-131, swsh9-133, swsh9-137, swsh9-144, swsh9-148, swsh9-149, swsh9-172, swsh9-180, swsh9-185
- **3 prints** — Unimplemented Ability: Boss Pockets — swsh9-88, swsh9-161, swsh9-162
- **2 prints** — Unimplemented attack: Dynamic Spark — swsh9-45, swsh9-158
- **2 prints** — Unimplemented attack: Fast Charge — swsh9-45, swsh9-158
- **1 prints** — Unimplemented Ability: Additional Order — swsh9-71
- **1 prints** — Unimplemented Ability: Curative Bower — swsh9-5
- **1 prints** — Unimplemented Ability: Emergency Surfacing — swsh9-37
- **1 prints** — Unimplemented Ability: Roaring Resolve — swsh9-79
- **1 prints** — Unimplemented Ability: Special Transfer — swsh9-62
- **1 prints** — Unimplemented Ability: Wave Veil — swsh9-41
- **1 prints** — Unimplemented Special Energy rules — swsh9-151
- **1 prints** — Unimplemented attack: Aura Sphere Volley — swsh9-79
- **1 prints** — Unimplemented attack: Explosive Bolt — swsh9-47
- **1 prints** — Unimplemented attack: High-Voltage Current — swsh9-47
- **1 prints** — Unimplemented attack: Lightning Blast — swsh9-157
- **1 prints** — Unimplemented attack: Moonlit Miracle — swsh9-54
- **1 prints** — Unimplemented attack: Rainbow Flavor — swsh9-71
- **1 prints** — Unimplemented attack: Ransack — swsh9-87
- **1 prints** — Unimplemented attack: Ticking Terror — swsh9-89
- **1 prints** — Unimplemented attack: Tri Recharge — swsh9-66
- **1 prints** — Unimplemented attack: Ultra Evolution — swsh9-110

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh9-5` | Tropius | Unimplemented Ability: Curative Bower |
| `swsh9-37` | Empoleon | Unimplemented Ability: Emergency Surfacing |
| `swsh9-41` | Manaphy | Unimplemented Ability: Wave Veil |
| `swsh9-45` | Raichu V | Unimplemented attack: Fast Charge; Unimplemented attack: Dynamic Spark |
| `swsh9-47` | Electivire | Unimplemented attack: Explosive Bolt; Unimplemented attack: High-Voltage Current |
| `swsh9-54` | Clefable | Unimplemented attack: Moonlit Miracle |
| `swsh9-62` | Dusknoir | Unimplemented Ability: Special Transfer |
| `swsh9-66` | Sigilyph | Unimplemented attack: Tri Recharge |
| `swsh9-71` | Alcremie | Unimplemented attack: Rainbow Flavor; Unimplemented Ability: Additional Order |
| `swsh9-79` | Lucario | Unimplemented attack: Aura Sphere Volley; Unimplemented Ability: Roaring Resolve |
| `swsh9-87` | Weavile | Unimplemented attack: Ransack |
| `swsh9-88` | Honchkrow V | Unimplemented Ability: Boss Pockets |
| `swsh9-89` | Spiritomb | Unimplemented attack: Ticking Terror |
| `swsh9-110` | Axew | Unimplemented attack: Ultra Evolution |
| `swsh9-131` | Blunder Policy | Unimplemented Trainer effect |
| `swsh9-133` | Café Master | Unimplemented Trainer effect |
| `swsh9-137` | Collapsed Stadium | Unimplemented Trainer effect |
| `swsh9-144` | Magma Basin | Unimplemented Trainer effect |
| `swsh9-148` | Roseanne's Backup | Unimplemented Trainer effect |
| `swsh9-149` | Team Yell's Cheer | Unimplemented Trainer effect |
| `swsh9-151` | Double Turbo Energy | Unimplemented Special Energy rules |
| `swsh9-157` | Pikachu V | Unimplemented attack: Lightning Blast |
| `swsh9-158` | Raichu V | Unimplemented attack: Fast Charge; Unimplemented attack: Dynamic Spark |
| `swsh9-161` | Honchkrow V | Unimplemented Ability: Boss Pockets |
| `swsh9-162` | Honchkrow V | Unimplemented Ability: Boss Pockets |
| `swsh9-172` | Roseanne's Backup | Unimplemented Trainer effect |
| `swsh9-180` | Roseanne's Backup | Unimplemented Trainer effect |
| `swsh9-185` | Magma Basin | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
