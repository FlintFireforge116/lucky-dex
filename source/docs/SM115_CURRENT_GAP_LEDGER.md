# SM115 — whole-set gap ledger

Canonical prints: **69** | Playable: **54** | Gated: **15**
Printed attacks: **82** (77 distinct full signatures) | Abilities: **3** (3 distinct signatures)
Trainer rule signatures: **15** | Special Energy rule signatures: **0**
Canonical Git blob: `6d345da06f1218f06a92f64a86e53062263bd5de`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **8 prints** — Unimplemented Trainer effect — sm115-54, sm115-55, sm115-58, sm115-61, sm115-62, sm115-63, sm115-64, sm115-68
- **3 prints** — Unimplemented attack: Sky Legends-GX — sm115-44, sm115-66, sm115-69
- **1 prints** — Unimplemented Ability: Electromagnetic Wall — sm115-23
- **1 prints** — Unimplemented Ability: Last Pattern — sm115-27
- **1 prints** — Unimplemented Ability: Surrender Now — sm115-29
- **1 prints** — Unimplemented attack: Hurricane Call — sm115-24
- **1 prints** — Unimplemented attack: Rocket Tail — sm115-27

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm115-23` | Jolteon | Unimplemented Ability: Electromagnetic Wall |
| `sm115-24` | Zapdos | Unimplemented attack: Hurricane Call |
| `sm115-27` | Arbok | Unimplemented attack: Rocket Tail; Unimplemented Ability: Last Pattern |
| `sm115-29` | Weezing | Unimplemented Ability: Surrender Now |
| `sm115-44` | Moltres & Zapdos & Articuno-GX | Unimplemented attack: Sky Legends-GX |
| `sm115-54` | Brock's Pewter City Gym | Unimplemented Trainer effect |
| `sm115-55` | Brock's Training | Unimplemented Trainer effect |
| `sm115-58` | Jessie & James | Unimplemented Trainer effect |
| `sm115-61` | Misty's Cerulean City Gym | Unimplemented Trainer effect |
| `sm115-62` | Misty's Determination | Unimplemented Trainer effect |
| `sm115-63` | Misty's Water Command | Unimplemented Trainer effect |
| `sm115-64` | Pokémon Center Lady | Unimplemented Trainer effect |
| `sm115-66` | Moltres & Zapdos & Articuno-GX | Unimplemented attack: Sky Legends-GX |
| `sm115-68` | Jessie & James | Unimplemented Trainer effect |
| `sm115-69` | Moltres & Zapdos & Articuno-GX | Unimplemented attack: Sky Legends-GX |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
