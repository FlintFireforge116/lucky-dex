# SWSH3 — whole-set gap ledger

Canonical prints: **201** | Playable: **199** | Gated: **2**
Printed attacks: **274** (240 distinct full signatures) | Abilities: **32** (27 distinct signatures)
Trainer rule signatures: **17** | Special Energy rule signatures: **4**
Canonical Git blob: `347f057fe4bc8cd952fda99aa12a1d9c5fa1c550`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Ability: Eternal Zone — swsh3-117, swsh3-192

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh3-117` | Eternatus VMAX | Unimplemented Ability: Eternal Zone |
| `swsh3-192` | Eternatus VMAX | Unimplemented Ability: Eternal Zone |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
