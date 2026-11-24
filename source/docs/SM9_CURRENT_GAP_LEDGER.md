# SM9 — whole-set gap ledger

Canonical prints: **198** | Playable: **187** | Gated: **11**
Printed attacks: **260** (204 distinct full signatures) | Abilities: **36** (32 distinct signatures)
Trainer rule signatures: **26** | Special Energy rule signatures: **0**
Canonical Git blob: `f36aeea32bbf75861d1e3d4665e7deea4ea26d7e`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **8 prints** — Unimplemented Trainer effect — sm9-148, sm9-149, sm9-150, sm9-154, sm9-178, sm9-179, sm9-181, sm9-195
- **1 prints** — Unimplemented Ability: Scoop-Up Block — sm9-66
- **1 prints** — Unimplemented attack: Copycat — sm9-112
- **1 prints** — Unimplemented attack: Electromagnetic Bomb — sm9-37

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm9-37` | Alolan Golem | Unimplemented attack: Electromagnetic Bomb |
| `sm9-66` | Mr. Mime | Unimplemented Ability: Scoop-Up Block |
| `sm9-112` | Mimikyu | Unimplemented attack: Copycat |
| `sm9-148` | Metal Goggles | Unimplemented Trainer effect |
| `sm9-149` | Morgan | Unimplemented Trainer effect |
| `sm9-150` | Nanu | Unimplemented Trainer effect |
| `sm9-154` | Sabrina's Suggestion | Unimplemented Trainer effect |
| `sm9-178` | Morgan | Unimplemented Trainer effect |
| `sm9-179` | Nanu | Unimplemented Trainer effect |
| `sm9-181` | Sabrina's Suggestion | Unimplemented Trainer effect |
| `sm9-195` | Metal Goggles | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
