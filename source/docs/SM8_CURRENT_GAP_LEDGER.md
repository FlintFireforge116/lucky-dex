# SM8 — whole-set gap ledger

Canonical prints: **240** | Playable: **229** | Gated: **11**
Printed attacks: **315** (243 distinct full signatures) | Abilities: **61** (45 distinct signatures)
Trainer rule signatures: **28** | Special Energy rule signatures: **1**
Canonical Git blob: `354284780f7771d1a2530ef766e57228c06805cd`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Prism Star attack/Ability or Trainer effect not yet implemented — sm8-144
- **1 prints** — Unimplemented Ability: Blazing Energy — sm8-42
- **1 prints** — Unimplemented Ability: Distortion Door — sm8-97
- **1 prints** — Unimplemented Ability: Floral Path to the Sky — sm8-13
- **1 prints** — Unimplemented Ability: Harmonics — sm8-67
- **1 prints** — Unimplemented Ability: Mountain Pass — sm8-165
- **1 prints** — Unimplemented Ability: Path of Life — sm8-144
- **1 prints** — Unimplemented Ability: Vessel of Life — sm8-95
- **1 prints** — Unimplemented attack: Happy Delivery — sm8-57
- **1 prints** — Unimplemented attack: Lost Flame — sm8-42
- **1 prints** — Unimplemented attack: Nightcap — sm8-106
- **1 prints** — Unimplemented attack: Polka-Dot Search — sm8-136
- **1 prints** — Unimplemented attack: Stunning Likeness — sm8-157

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm8-13` | Skiploom | Unimplemented Ability: Floral Path to the Sky |
| `sm8-42` | Typhlosion | Unimplemented attack: Lost Flame; Unimplemented Ability: Blazing Energy |
| `sm8-57` | Delibird | Unimplemented attack: Happy Delivery |
| `sm8-67` | Primarina | Unimplemented Ability: Harmonics |
| `sm8-95` | Shedinja | Unimplemented Ability: Vessel of Life |
| `sm8-97` | Giratina | Unimplemented Ability: Distortion Door |
| `sm8-106` | Nihilego | Unimplemented attack: Nightcap |
| `sm8-136` | Azumarill | Unimplemented attack: Polka-Dot Search |
| `sm8-144` | Xerneas ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Ability: Path of Life |
| `sm8-157` | Smeargle | Unimplemented attack: Stunning Likeness |
| `sm8-165` | Trumbeak | Unimplemented Ability: Mountain Pass |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
