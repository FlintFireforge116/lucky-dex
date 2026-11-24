# SM10 — whole-set gap ledger

Canonical prints: **238** | Playable: **220** | Gated: **18**
Printed attacks: **338** (250 distinct full signatures) | Abilities: **53** (41 distinct signatures)
Trainer rule signatures: **26** | Special Energy rule signatures: **1**
Canonical Git blob: `2293c98b7086a4137928be1fa358ccad9209d006`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **4 prints** — Unimplemented Trainer effect — sm10-166, sm10-168, sm10-186, sm10-188
- **3 prints** — Unimplemented Ability: Force Canceler — sm10-163, sm10-208, sm10-228
- **3 prints** — Unimplemented attack: Discovery-GX — sm10-163, sm10-208, sm10-228
- **1 prints** — Unimplemented Ability: Battery — sm10-58
- **1 prints** — Unimplemented Ability: Crazy Code — sm10-157
- **1 prints** — Unimplemented Ability: Detention Gas — sm10-74
- **1 prints** — Unimplemented Ability: Hypnotic Pendulum — sm10-72
- **1 prints** — Unimplemented Ability: Stealthy Body — sm10-59
- **1 prints** — Unimplemented Ability: Swelling Spite — sm10-67
- **1 prints** — Unimplemented attack: Electricannon — sm10-59
- **1 prints** — Unimplemented attack: Extra-Tight Press — sm10-125
- **1 prints** — Unimplemented attack: Grandiose Fangs — sm10-114
- **1 prints** — Unimplemented attack: Hypnotic Reign — sm10-119
- **1 prints** — Unimplemented attack: Splattering Sludge — sm10-74
- **1 prints** — Unimplemented attack: Surprise Fist — sm10-53
- **1 prints** — Unimplemented attack: Wicked Tentacles — sm10-41

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm10-41` | Tentacruel | Unimplemented attack: Wicked Tentacles |
| `sm10-53` | Pyukumuku | Unimplemented attack: Surprise Fist |
| `sm10-58` | Charjabug | Unimplemented Ability: Battery |
| `sm10-59` | Vikavolt | Unimplemented attack: Electricannon; Unimplemented Ability: Stealthy Body |
| `sm10-67` | Gastly | Unimplemented Ability: Swelling Spite |
| `sm10-72` | Hypno | Unimplemented Ability: Hypnotic Pendulum |
| `sm10-74` | Weezing | Unimplemented attack: Splattering Sludge; Unimplemented Ability: Detention Gas |
| `sm10-114` | Sandile | Unimplemented attack: Grandiose Fangs |
| `sm10-119` | Malamar | Unimplemented attack: Hypnotic Reign |
| `sm10-125` | Aggron | Unimplemented attack: Extra-Tight Press |
| `sm10-157` | Porygon-Z | Unimplemented Ability: Crazy Code |
| `sm10-163` | Celesteela-GX | Unimplemented attack: Discovery-GX; Unimplemented Ability: Force Canceler |
| `sm10-166` | Devolution Spray Z | Unimplemented Trainer effect |
| `sm10-168` | Dust Island | Unimplemented Trainer effect |
| `sm10-186` | Stealthy Hood | Unimplemented Trainer effect |
| `sm10-188` | Ultra Forest Kartenvoy | Unimplemented Trainer effect |
| `sm10-208` | Celesteela-GX | Unimplemented attack: Discovery-GX; Unimplemented Ability: Force Canceler |
| `sm10-228` | Celesteela-GX | Unimplemented attack: Discovery-GX; Unimplemented Ability: Force Canceler |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
