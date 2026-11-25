# SWSH6 — whole-set gap ledger

Canonical prints: **233** | Playable: **193** | Gated: **40**
Printed attacks: **251** (194 distinct full signatures) | Abilities: **44** (28 distinct signatures)
Trainer rule signatures: **30** | Special Energy rule signatures: **6**
Canonical Git blob: `0371b6d2d209187306ff6e1a1ef9a09a2a1d8121`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **11 prints** — Unimplemented Trainer effect — swsh6-130, swsh6-136, swsh6-137, swsh6-149, swsh6-152, swsh6-187, swsh6-196, swsh6-211, swsh6-219, swsh6-225, swsh6-228
- **3 prints** — Unimplemented attack: Blissful Blast — swsh6-119, swsh6-182, swsh6-183
- **3 prints** — Unimplemented attack: Cross Fist — swsh6-53, swsh6-165, swsh6-166
- **3 prints** — Unimplemented attack: Max Blaze — swsh6-21, swsh6-200, swsh6-201
- **2 prints** — Unimplemented Ability: Hidden Claw — swsh6-104, swsh6-180
- **2 prints** — Unimplemented attack: G-Max Cyclone — swsh6-90, swsh6-206
- **1 prints** — Unimplemented Ability: Brazen Tail — swsh6-128
- **1 prints** — Unimplemented Ability: Mysterious Potion — swsh6-98
- **1 prints** — Unimplemented Ability: Shining Arcana — swsh6-61
- **1 prints** — Unimplemented Ability: Throwing Coach — swsh6-88
- **1 prints** — Unimplemented Ability: Witch Rondo — swsh6-73
- **1 prints** — Unimplemented attack: Coordinated Bolt — swsh6-51
- **1 prints** — Unimplemented attack: Follow the Scent — swsh6-68
- **1 prints** — Unimplemented attack: Gale Claws — swsh6-120
- **1 prints** — Unimplemented attack: Ghostly Cries — swsh6-103
- **1 prints** — Unimplemented attack: Package Delivery — swsh6-32
- **1 prints** — Unimplemented attack: Rapid Strike Tentacles — swsh6-70
- **1 prints** — Unimplemented attack: Resolute Spite — swsh6-63
- **1 prints** — Unimplemented attack: Seismic Rift — swsh6-111
- **1 prints** — Unimplemented attack: Strong Tail — swsh6-102
- **1 prints** — Unimplemented attack: Triple Heads — swsh6-77
- **1 prints** — Unimplemented attack: Two-Hit KO — swsh6-31

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh6-21` | Blaziken VMAX | Unimplemented attack: Max Blaze |
| `swsh6-31` | Weavile | Unimplemented attack: Two-Hit KO |
| `swsh6-32` | Delibird | Unimplemented attack: Package Delivery |
| `swsh6-51` | Zebstrika | Unimplemented attack: Coordinated Bolt |
| `swsh6-53` | Zeraora V | Unimplemented attack: Cross Fist |
| `swsh6-61` | Gardevoir | Unimplemented Ability: Shining Arcana |
| `swsh6-63` | Banette | Unimplemented attack: Resolute Spite |
| `swsh6-68` | Slurpuff | Unimplemented attack: Follow the Scent |
| `swsh6-70` | Malamar | Unimplemented attack: Rapid Strike Tentacles |
| `swsh6-73` | Hatterene | Unimplemented Ability: Witch Rondo |
| `swsh6-77` | Dugtrio | Unimplemented attack: Triple Heads |
| `swsh6-88` | Passimian | Unimplemented Ability: Throwing Coach |
| `swsh6-90` | Sandaconda VMAX | Unimplemented attack: G-Max Cyclone |
| `swsh6-98` | Galarian Slowking | Unimplemented Ability: Mysterious Potion |
| `swsh6-102` | Seviper | Unimplemented attack: Strong Tail |
| `swsh6-103` | Spiritomb | Unimplemented attack: Ghostly Cries |
| `swsh6-104` | Liepard V | Unimplemented Ability: Hidden Claw |
| `swsh6-111` | Aggron | Unimplemented attack: Seismic Rift |
| `swsh6-119` | Blissey V | Unimplemented attack: Blissful Blast |
| `swsh6-120` | Zangoose | Unimplemented attack: Gale Claws |
| `swsh6-128` | Greedent | Unimplemented Ability: Brazen Tail |
| `swsh6-130` | Avery | Unimplemented Trainer effect |
| `swsh6-136` | Echoing Horn | Unimplemented Trainer effect |
| `swsh6-137` | Expedition Uniform | Unimplemented Trainer effect |
| `swsh6-149` | Peonia | Unimplemented Trainer effect |
| `swsh6-152` | Rugged Helmet | Unimplemented Trainer effect |
| `swsh6-165` | Zeraora V | Unimplemented attack: Cross Fist |
| `swsh6-166` | Zeraora V | Unimplemented attack: Cross Fist |
| `swsh6-180` | Liepard V | Unimplemented Ability: Hidden Claw |
| `swsh6-182` | Blissey V | Unimplemented attack: Blissful Blast |
| `swsh6-183` | Blissey V | Unimplemented attack: Blissful Blast |
| `swsh6-187` | Avery | Unimplemented Trainer effect |
| `swsh6-196` | Peonia | Unimplemented Trainer effect |
| `swsh6-200` | Blaziken VMAX | Unimplemented attack: Max Blaze |
| `swsh6-201` | Blaziken VMAX | Unimplemented attack: Max Blaze |
| `swsh6-206` | Sandaconda VMAX | Unimplemented attack: G-Max Cyclone |
| `swsh6-211` | Avery | Unimplemented Trainer effect |
| `swsh6-219` | Peonia | Unimplemented Trainer effect |
| `swsh6-225` | Echoing Horn | Unimplemented Trainer effect |
| `swsh6-228` | Rugged Helmet | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
