# SWSH4 — whole-set gap ledger

Canonical prints: **203** | Playable: **199** | Gated: **4**
Printed attacks: **269** (238 distinct full signatures) | Abilities: **29** (28 distinct signatures)
Trainer rule signatures: **18** | Special Energy rule signatures: **4**
Canonical Git blob: `182400b1d8f17a3f99a27dd00a060ad06ea98469`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Unimplemented Ability: Cast-off Shell — swsh4-14
- **1 prints** — Unimplemented Ability: Shell Survival — swsh4-66
- **1 prints** — Unimplemented Ability: Shifty Substitution — swsh4-12
- **1 prints** — Unimplemented Ability: Spectral Breach — swsh4-71
- **1 prints** — Unimplemented attack: Life Squeeze — swsh4-66

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh4-12` | Shiftry | Unimplemented Ability: Shifty Substitution |
| `swsh4-14` | Ninjask | Unimplemented Ability: Cast-off Shell |
| `swsh4-66` | Shedinja | Unimplemented attack: Life Squeeze; Unimplemented Ability: Shell Survival |
| `swsh4-71` | Dusknoir | Unimplemented Ability: Spectral Breach |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
