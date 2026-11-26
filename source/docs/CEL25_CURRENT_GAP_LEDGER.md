# CEL25 — whole-set gap ledger

Canonical prints: **25** | Playable: **21** | Gated: **4**
Printed attacks: **35** (33 distinct full signatures) | Abilities: **6** (5 distinct signatures)
Trainer rule signatures: **1** | Special Energy rule signatures: **0**
Canonical Git blob: `acf67f8e6a03676a02c81faaa7eefcc68a0ea97a`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Unimplemented attack: Aqua Storm — cel25-3
- **1 prints** — Unimplemented attack: Breath of Life — cel25-12
- **1 prints** — Unimplemented attack: Cry of Destruction — cel25-19
- **1 prints** — Unimplemented attack: Lunar Pain — cel25-15

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `cel25-3` | Kyogre | Unimplemented attack: Aqua Storm |
| `cel25-12` | Xerneas | Unimplemented attack: Breath of Life |
| `cel25-15` | Lunala | Unimplemented attack: Lunar Pain |
| `cel25-19` | Yveltal | Unimplemented attack: Cry of Destruction |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
