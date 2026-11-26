# SWSH9 — whole-set gap ledger

Canonical prints: **186** | Imported: **121** | Playable: **113** | Gated: **8** | Not imported: **65**
Printed attacks: **162** (144 distinct full signatures) | Abilities: **14** (10 distinct signatures)
Trainer rule signatures: **12** | Special Energy rule signatures: **1**
Canonical Git blob: `6c33800813e0375da544c26d2e97992a768c015f`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Unimplemented Ability: Fighting Instinct — swsh9-182
- **1 prints** — Unimplemented Ability: Sudden Cyclone — swsh9-126
- **1 prints** — Unimplemented Special Energy rules — swsh9-151
- **1 prints** — Unimplemented Trainer effect — swsh9-129
- **1 prints** — Unimplemented attack: Block Slider — swsh9-44
- **1 prints** — Unimplemented attack: Draconic Impulse — swsh9-106
- **1 prints** — Unimplemented attack: Explosive Bolt — swsh9-47
- **1 prints** — Unimplemented attack: High-Voltage Current — swsh9-47
- **1 prints** — Unimplemented attack: Showboating Pose — swsh9-127
- **1 prints** — Unimplemented attack: Thunderous Kick — swsh9-182

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh9-44` | Eiscue | Unimplemented attack: Block Slider |
| `swsh9-47` | Electivire | Unimplemented attack: Explosive Bolt; Unimplemented attack: High-Voltage Current |
| `swsh9-106` | Flygon V | Unimplemented attack: Draconic Impulse |
| `swsh9-126` | Tornadus | Unimplemented Ability: Sudden Cyclone |
| `swsh9-127` | Hawlucha | Unimplemented attack: Showboating Pose |
| `swsh9-129` | Acerola's Premonition | Unimplemented Trainer effect |
| `swsh9-151` | Double Turbo Energy | Unimplemented Special Energy rules |
| `swsh9-182` | Galarian Zapdos V | Unimplemented attack: Thunderous Kick; Unimplemented Ability: Fighting Instinct |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
