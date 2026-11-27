# SWSH12PT5 — whole-set gap ledger

Canonical prints: **160** | Imported: **117** | Playable: **100** | Gated: **17** | Not imported: **43**
Printed attacks: **129** (128 distinct full signatures) | Abilities: **11** (11 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **8**
Canonical Git blob: `6d0748e2be253b335093187554e6a947a66c3089`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Trainer effect — swsh12pt5-126, swsh12pt5-143
- **1 prints** — Unimplemented Ability: Conversion Star — swsh12pt5-46
- **1 prints** — Unimplemented Ability: Excited Heart — swsh12pt5-20
- **1 prints** — Unimplemented Ability: Explosiveness — swsh12pt5-44
- **1 prints** — Unimplemented Ability: Shocking Block — swsh12pt5-51
- **1 prints** — Unimplemented Ability: Star Order — swsh12pt5-143
- **1 prints** — Unimplemented Ability: Sun Energy — swsh12pt5-69
- **1 prints** — Unimplemented Ability: Witch's Domain — swsh12pt5-66
- **1 prints** — Unimplemented attack: Dynamic Wave — swsh12pt5-36
- **1 prints** — Unimplemented attack: Ember Star — swsh12pt5-23
- **1 prints** — Unimplemented attack: Fireball Fever — swsh12pt5-23
- **1 prints** — Unimplemented attack: Horoscope — swsh12pt5-65
- **1 prints** — Unimplemented attack: Lightning Storm Star — swsh12pt5-55
- **1 prints** — Unimplemented attack: Lost Claw — swsh12pt5-76
- **1 prints** — Unimplemented attack: Midnight Fang — swsh12pt5-74
- **1 prints** — Unimplemented attack: Psypump — swsh12pt5-59
- **1 prints** — Unimplemented attack: Reactive Pulse — swsh12pt5-54
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
| `swsh12pt5-51` | Radiant Charjabug | Unimplemented Ability: Shocking Block |
| `swsh12pt5-54` | Zeraora VMAX | Unimplemented attack: Reactive Pulse |
| `swsh12pt5-55` | Zeraora VSTAR | Unimplemented attack: Lightning Storm Star |
| `swsh12pt5-59` | Mewtwo | Unimplemented attack: Psypump |
| `swsh12pt5-65` | Hatterene V | Unimplemented attack: Horoscope |
| `swsh12pt5-66` | Hatterene VMAX | Unimplemented Ability: Witch's Domain |
| `swsh12pt5-69` | Solrock | Unimplemented Ability: Sun Energy |
| `swsh12pt5-74` | Lycanroc | Unimplemented attack: Midnight Fang |
| `swsh12pt5-76` | Absol | Unimplemented attack: Lost Claw |
| `swsh12pt5-126` | Digging Duo | Unimplemented Trainer effect |
| `swsh12pt5-143` | Sky Seal Stone | Unimplemented Ability: Star Order; Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
