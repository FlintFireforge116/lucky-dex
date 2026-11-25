# SWSH6 — whole-set gap ledger

Canonical prints: **233** | Playable: **220** | Gated: **13**
Printed attacks: **251** (194 distinct full signatures) | Abilities: **44** (28 distinct signatures)
Trainer rule signatures: **30** | Special Energy rule signatures: **6**
Canonical Git blob: `0371b6d2d209187306ff6e1a1ef9a09a2a1d8121`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **5 prints** — Unimplemented Trainer effect — swsh6-149, swsh6-152, swsh6-196, swsh6-219, swsh6-228
- **1 prints** — Unimplemented Ability: Brazen Tail — swsh6-128
- **1 prints** — Unimplemented Ability: Shining Arcana — swsh6-61
- **1 prints** — Unimplemented Ability: Throwing Coach — swsh6-88
- **1 prints** — Unimplemented attack: Ghostly Cries — swsh6-103
- **1 prints** — Unimplemented attack: Rapid Strike Tentacles — swsh6-70
- **1 prints** — Unimplemented attack: Resolute Spite — swsh6-63
- **1 prints** — Unimplemented attack: Seismic Rift — swsh6-111
- **1 prints** — Unimplemented attack: Two-Hit KO — swsh6-31

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh6-31` | Weavile | Unimplemented attack: Two-Hit KO |
| `swsh6-61` | Gardevoir | Unimplemented Ability: Shining Arcana |
| `swsh6-63` | Banette | Unimplemented attack: Resolute Spite |
| `swsh6-70` | Malamar | Unimplemented attack: Rapid Strike Tentacles |
| `swsh6-88` | Passimian | Unimplemented Ability: Throwing Coach |
| `swsh6-103` | Spiritomb | Unimplemented attack: Ghostly Cries |
| `swsh6-111` | Aggron | Unimplemented attack: Seismic Rift |
| `swsh6-128` | Greedent | Unimplemented Ability: Brazen Tail |
| `swsh6-149` | Peonia | Unimplemented Trainer effect |
| `swsh6-152` | Rugged Helmet | Unimplemented Trainer effect |
| `swsh6-196` | Peonia | Unimplemented Trainer effect |
| `swsh6-219` | Peonia | Unimplemented Trainer effect |
| `swsh6-228` | Rugged Helmet | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
