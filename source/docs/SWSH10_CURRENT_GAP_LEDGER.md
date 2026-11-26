# SWSH10 — whole-set gap ledger

Canonical prints: **216** | Imported: **155** | Playable: **141** | Gated: **14** | Not imported: **61**
Printed attacks: **195** (161 distinct full signatures) | Abilities: **25** (19 distinct signatures)
Trainer rule signatures: **15** | Special Energy rule signatures: **1**
Canonical Git blob: `888a5253d3bf05bc4107d52742003ce42f1980f3`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **11 prints** — Unimplemented Trainer effect — swsh10-138, swsh10-143, swsh10-149, swsh10-154, swsh10-157, swsh10-183, swsh10-184, swsh10-187, swsh10-201, swsh10-202, swsh10-205
- **1 prints** — Unimplemented Ability: Stand Sentry — swsh10-120
- **1 prints** — Unimplemented Special Energy rules — swsh10-216
- **1 prints** — Unimplemented attack: Axe Slash — swsh10-87

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh10-87` | Kleavor V | Unimplemented attack: Axe Slash |
| `swsh10-120` | Hoothoot | Unimplemented Ability: Stand Sentry |
| `swsh10-138` | Cyllene | Unimplemented Trainer effect |
| `swsh10-143` | Gardenia's Vigor | Unimplemented Trainer effect |
| `swsh10-149` | Kamado | Unimplemented Trainer effect |
| `swsh10-154` | Switch Cart | Unimplemented Trainer effect |
| `swsh10-157` | Unidentified Fossil | Unimplemented Trainer effect |
| `swsh10-183` | Cyllene | Unimplemented Trainer effect |
| `swsh10-184` | Gardenia's Vigor | Unimplemented Trainer effect |
| `swsh10-187` | Kamado | Unimplemented Trainer effect |
| `swsh10-201` | Cyllene | Unimplemented Trainer effect |
| `swsh10-202` | Gardenia's Vigor | Unimplemented Trainer effect |
| `swsh10-205` | Kamado | Unimplemented Trainer effect |
| `swsh10-216` | Double Turbo Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
