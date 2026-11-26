# SWSH9 — whole-set gap ledger

Canonical prints: **186** | Imported: **85** | Playable: **82** | Gated: **3** | Not imported: **101**
Printed attacks: **116** (105 distinct full signatures) | Abilities: **4** (3 distinct signatures)
Trainer rule signatures: **9** | Special Energy rule signatures: **1**
Canonical Git blob: `6c33800813e0375da544c26d2e97992a768c015f`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented attack: Star Blaze — swsh9-18, swsh9-174
- **2 prints** — VSTAR integration awaiting dedicated outcome tests — swsh9-18, swsh9-174
- **1 prints** — Unimplemented Special Energy rules — swsh9-151

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh9-18` | Charizard VSTAR | Unimplemented attack: Star Blaze; VSTAR integration awaiting dedicated outcome tests |
| `swsh9-151` | Double Turbo Energy | Unimplemented Special Energy rules |
| `swsh9-174` | Charizard VSTAR | Unimplemented attack: Star Blaze; VSTAR integration awaiting dedicated outcome tests |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
