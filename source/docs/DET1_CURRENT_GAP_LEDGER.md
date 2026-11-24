# DET1 — whole-set gap ledger

Canonical prints: **18** | Playable: **16** | Gated: **2**
Printed attacks: **22** (22 distinct full signatures) | Abilities: **4** (4 distinct signatures)
Trainer rule signatures: **0** | Special Energy rule signatures: **0**
Canonical Git blob: `025e04912a2f16163043a77b92d86d15bcfa84d0`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Unimplemented Ability: Evasion Jutsu — det1-9
- **1 prints** — Unimplemented attack: Copy Anything — det1-17

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `det1-9` | Greninja | Unimplemented Ability: Evasion Jutsu |
| `det1-17` | Ditto | Unimplemented attack: Copy Anything |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
