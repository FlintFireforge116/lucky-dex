# SWSH11 — whole-set gap ledger

Canonical prints: **217** | Imported: **217** | Playable: **215** | Gated: **2** | Not imported: **0**
Printed attacks: **278** (237 distinct full signatures) | Abilities: **42** (32 distinct signatures)
Trainer rule signatures: **21** | Special Energy rule signatures: **1**
Canonical Git blob: `157da08c0435be1c0692faac35e3a7580e638afb`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Ability: Guardian of Love — swsh11-82, swsh11-178
- **2 prints** — Unimplemented attack: Blossom Tail — swsh11-82, swsh11-178

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh11-82` | Enamorus V | Unimplemented attack: Blossom Tail; Unimplemented Ability: Guardian of Love |
| `swsh11-178` | Enamorus V | Unimplemented attack: Blossom Tail; Unimplemented Ability: Guardian of Love |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
