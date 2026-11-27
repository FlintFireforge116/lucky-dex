# SWSH11 — whole-set gap ledger

Canonical prints: **217** | Imported: **217** | Playable: **209** | Gated: **8** | Not imported: **0**
Printed attacks: **278** (237 distinct full signatures) | Abilities: **42** (32 distinct signatures)
Trainer rule signatures: **21** | Special Energy rule signatures: **1**
Canonical Git blob: `157da08c0435be1c0692faac35e3a7580e638afb`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **4 prints** — Unimplemented Trainer effect — swsh11-165, swsh11-167, swsh11-195, swsh11-210
- **2 prints** — Unimplemented Ability: Guardian of Love — swsh11-82, swsh11-178
- **2 prints** — Unimplemented attack: Blossom Tail — swsh11-82, swsh11-178
- **1 prints** — Unimplemented Ability: Jamming Attachment — swsh11-20
- **1 prints** — Unimplemented attack: Destructive Finish — swsh11-124

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh11-20` | Orbeetle | Unimplemented Ability: Jamming Attachment |
| `swsh11-82` | Enamorus V | Unimplemented attack: Blossom Tail; Unimplemented Ability: Guardian of Love |
| `swsh11-124` | Radiant Steelix | Unimplemented attack: Destructive Finish |
| `swsh11-165` | Panic Mask | Unimplemented Trainer effect |
| `swsh11-167` | Thorton | Unimplemented Trainer effect |
| `swsh11-178` | Enamorus V | Unimplemented attack: Blossom Tail; Unimplemented Ability: Guardian of Love |
| `swsh11-195` | Thorton | Unimplemented Trainer effect |
| `swsh11-210` | Thorton | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
