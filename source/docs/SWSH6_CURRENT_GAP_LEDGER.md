# SWSH6 — whole-set gap ledger

Canonical prints: **233** | Playable: **230** | Gated: **3**
Printed attacks: **251** (194 distinct full signatures) | Abilities: **44** (28 distinct signatures)
Trainer rule signatures: **30** | Special Energy rule signatures: **6**
Canonical Git blob: `0371b6d2d209187306ff6e1a1ef9a09a2a1d8121`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Trainer effect — swsh6-152, swsh6-228
- **1 prints** — Unimplemented Ability: Brazen Tail — swsh6-128

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh6-128` | Greedent | Unimplemented Ability: Brazen Tail |
| `swsh6-152` | Rugged Helmet | Unimplemented Trainer effect |
| `swsh6-228` | Rugged Helmet | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
