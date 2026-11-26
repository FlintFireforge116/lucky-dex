# SWSH10 — whole-set gap ledger

Canonical prints: **216** | Imported: **216** | Playable: **212** | Gated: **4** | Not imported: **0**
Printed attacks: **264** (211 distinct full signatures) | Abilities: **44** (35 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **1**
Canonical Git blob: `888a5253d3bf05bc4107d52742003ce42f1980f3`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Unimplemented Ability: Resonant Evolution — swsh10-119
- **1 prints** — Unimplemented Ability: Stand Sentry — swsh10-120
- **1 prints** — Unimplemented Ability: Wish Connector — swsh10-170
- **1 prints** — Unimplemented Special Energy rules — swsh10-216
- **1 prints** — Unimplemented attack: Hypnostrike — swsh10-170

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh10-119` | Eevee | Unimplemented Ability: Resonant Evolution |
| `swsh10-120` | Hoothoot | Unimplemented Ability: Stand Sentry |
| `swsh10-170` | Jirachi V | Unimplemented attack: Hypnostrike; Unimplemented Ability: Wish Connector |
| `swsh10-216` | Double Turbo Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
