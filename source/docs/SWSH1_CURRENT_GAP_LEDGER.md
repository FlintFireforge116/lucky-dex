# SWSH1 — whole-set gap ledger

Canonical prints: **216** | Playable: **215** | Gated: **1**
Printed attacks: **277** (244 distinct full signatures) | Abilities: **25** (20 distinct signatures)
Trainer rule signatures: **30** | Special Energy rule signatures: **1**
Canonical Git blob: `c43bc9ff9daa80e41bcd8952080b79825e8caa8f`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Unimplemented Special Energy rules — swsh1-186

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh1-186` | Aurora Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
