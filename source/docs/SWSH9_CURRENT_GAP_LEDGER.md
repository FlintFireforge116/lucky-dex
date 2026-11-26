# SWSH9 — whole-set gap ledger

Canonical prints: **186** | Imported: **186** | Playable: **185** | Gated: **1** | Not imported: **0**
Printed attacks: **235** (202 distinct full signatures) | Abilities: **34** (25 distinct signatures)
Trainer rule signatures: **22** | Special Energy rule signatures: **1**
Canonical Git blob: `6c33800813e0375da544c26d2e97992a768c015f`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Unimplemented Special Energy rules — swsh9-151

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh9-151` | Double Turbo Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
