# SMA — whole-set gap ledger

Canonical prints: **94** | Playable: **92** | Gated: **2**
Printed attacks: **164** (163 distinct full signatures) | Abilities: **33** (33 distinct signatures)
Trainer rule signatures: **10** | Special Energy rule signatures: **0**
Canonical Git blob: `05b21c57ba622d5f5180e825e2d7edd14e156208`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Unimplemented Ability: Roadblock — sma-SV20
- **1 prints** — Unimplemented attack: Eternal Light-GX — sma-SV50

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sma-SV20` | Sudowoodo | Unimplemented Ability: Roadblock |
| `sma-SV50` | Ho-Oh-GX | Unimplemented attack: Eternal Light-GX |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
