# SWSH9 — whole-set gap ledger

Canonical prints: **186** | Imported: **186** | Playable: **181** | Gated: **5** | Not imported: **0**
Printed attacks: **235** (202 distinct full signatures) | Abilities: **34** (25 distinct signatures)
Trainer rule signatures: **22** | Special Energy rule signatures: **1**
Canonical Git blob: `6c33800813e0375da544c26d2e97992a768c015f`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Trainer effect — swsh9-131, swsh9-137
- **2 prints** — Unimplemented attack: Dynamic Spark — swsh9-45, swsh9-158
- **2 prints** — Unimplemented attack: Fast Charge — swsh9-45, swsh9-158
- **1 prints** — Unimplemented Special Energy rules — swsh9-151

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh9-45` | Raichu V | Unimplemented attack: Fast Charge; Unimplemented attack: Dynamic Spark |
| `swsh9-131` | Blunder Policy | Unimplemented Trainer effect |
| `swsh9-137` | Collapsed Stadium | Unimplemented Trainer effect |
| `swsh9-151` | Double Turbo Energy | Unimplemented Special Energy rules |
| `swsh9-158` | Raichu V | Unimplemented attack: Fast Charge; Unimplemented attack: Dynamic Spark |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
