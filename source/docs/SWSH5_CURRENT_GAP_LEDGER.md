# SWSH5 — whole-set gap ledger

Canonical prints: **183** | Playable: **179** | Gated: **4**
Printed attacks: **234** (189 distinct full signatures) | Abilities: **28** (20 distinct signatures)
Trainer rule signatures: **19** | Special Energy rule signatures: **2**
Canonical Git blob: `41dbfbb564cdae9a8aca473b02589dcc18c8e351`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Ability: Lustrous Body — swsh5-110, swsh5-171
- **1 prints** — Unimplemented Ability: Deep Sea King — swsh5-33
- **1 prints** — Unimplemented Trainer effect — swsh5-136

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh5-33` | Kingdra | Unimplemented Ability: Deep Sea King |
| `swsh5-110` | Corviknight VMAX | Unimplemented Ability: Lustrous Body |
| `swsh5-136` | Tool Jammer | Unimplemented Trainer effect |
| `swsh5-171` | Corviknight VMAX | Unimplemented Ability: Lustrous Body |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
