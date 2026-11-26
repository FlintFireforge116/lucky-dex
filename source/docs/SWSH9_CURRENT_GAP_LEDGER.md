# SWSH9 — whole-set gap ledger

Canonical prints: **186** | Imported: **186** | Playable: **176** | Gated: **10** | Not imported: **0**
Printed attacks: **235** (202 distinct full signatures) | Abilities: **34** (25 distinct signatures)
Trainer rule signatures: **22** | Special Energy rule signatures: **1**
Canonical Git blob: `6c33800813e0375da544c26d2e97992a768c015f`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **3 prints** — Unimplemented Trainer effect — swsh9-131, swsh9-133, swsh9-137
- **2 prints** — Unimplemented attack: Dynamic Spark — swsh9-45, swsh9-158
- **2 prints** — Unimplemented attack: Fast Charge — swsh9-45, swsh9-158
- **1 prints** — Unimplemented Ability: Additional Order — swsh9-71
- **1 prints** — Unimplemented Ability: Emergency Surfacing — swsh9-37
- **1 prints** — Unimplemented Special Energy rules — swsh9-151
- **1 prints** — Unimplemented attack: Moonlit Miracle — swsh9-54
- **1 prints** — Unimplemented attack: Rainbow Flavor — swsh9-71
- **1 prints** — Unimplemented attack: Ticking Terror — swsh9-89

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh9-37` | Empoleon | Unimplemented Ability: Emergency Surfacing |
| `swsh9-45` | Raichu V | Unimplemented attack: Fast Charge; Unimplemented attack: Dynamic Spark |
| `swsh9-54` | Clefable | Unimplemented attack: Moonlit Miracle |
| `swsh9-71` | Alcremie | Unimplemented attack: Rainbow Flavor; Unimplemented Ability: Additional Order |
| `swsh9-89` | Spiritomb | Unimplemented attack: Ticking Terror |
| `swsh9-131` | Blunder Policy | Unimplemented Trainer effect |
| `swsh9-133` | Café Master | Unimplemented Trainer effect |
| `swsh9-137` | Collapsed Stadium | Unimplemented Trainer effect |
| `swsh9-151` | Double Turbo Energy | Unimplemented Special Energy rules |
| `swsh9-158` | Raichu V | Unimplemented attack: Fast Charge; Unimplemented attack: Dynamic Spark |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
