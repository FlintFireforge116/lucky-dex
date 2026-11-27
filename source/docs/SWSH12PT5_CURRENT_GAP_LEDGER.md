# SWSH12PT5 — whole-set gap ledger

Canonical prints: **160** | Imported: **87** | Playable: **79** | Gated: **8** | Not imported: **73**
Printed attacks: **81** (80 distinct full signatures) | Abilities: **8** (8 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **8**
Canonical Git blob: `6d0748e2be253b335093187554e6a947a66c3089`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Trainer effect — swsh12pt5-126, swsh12pt5-143
- **1 prints** — Unimplemented Ability: Conversion Star — swsh12pt5-46
- **1 prints** — Unimplemented Ability: Excited Heart — swsh12pt5-20
- **1 prints** — Unimplemented Ability: Explosiveness — swsh12pt5-44
- **1 prints** — Unimplemented Ability: Star Order — swsh12pt5-143
- **1 prints** — Unimplemented attack: Dynamic Wave — swsh12pt5-36
- **1 prints** — Unimplemented attack: Ember Star — swsh12pt5-23
- **1 prints** — Unimplemented attack: Fireball Fever — swsh12pt5-23
- **1 prints** — Unimplemented attack: Shorting Spark — swsh12pt5-42

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh12pt5-20` | Radiant Charizard | Unimplemented Ability: Excited Heart |
| `swsh12pt5-23` | Simisear VSTAR | Unimplemented attack: Fireball Fever; Unimplemented attack: Ember Star |
| `swsh12pt5-36` | Kyogre | Unimplemented attack: Dynamic Wave |
| `swsh12pt5-42` | Luxio | Unimplemented attack: Shorting Spark |
| `swsh12pt5-44` | Luxray | Unimplemented Ability: Explosiveness |
| `swsh12pt5-46` | Rotom VSTAR | Unimplemented Ability: Conversion Star |
| `swsh12pt5-126` | Digging Duo | Unimplemented Trainer effect |
| `swsh12pt5-143` | Sky Seal Stone | Unimplemented Ability: Star Order; Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
