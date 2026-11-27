# SWSH12PT5 — whole-set gap ledger

Canonical prints: **160** | Imported: **160** | Playable: **142** | Gated: **18** | Not imported: **0**
Printed attacks: **194** (192 distinct full signatures) | Abilities: **21** (20 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **8**
Canonical Git blob: `6d0748e2be253b335093187554e6a947a66c3089`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Trainer effect — swsh12pt5-126, swsh12pt5-143
- **1 prints** — Unimplemented Ability: Climactic Gate — swsh12pt5-105
- **1 prints** — Unimplemented Ability: Explosiveness — swsh12pt5-44
- **1 prints** — Unimplemented Ability: Shocking Block — swsh12pt5-51
- **1 prints** — Unimplemented Ability: Star Guardian — swsh12pt5-114
- **1 prints** — Unimplemented Ability: Star Order — swsh12pt5-143
- **1 prints** — Unimplemented Ability: Sudden Transformation — swsh12pt5-107
- **1 prints** — Unimplemented Ability: Witch's Domain — swsh12pt5-66
- **1 prints** — Unimplemented attack: Counter Press — swsh12pt5-89
- **1 prints** — Unimplemented attack: Dynamic Wave — swsh12pt5-36
- **1 prints** — Unimplemented attack: Ember Star — swsh12pt5-23
- **1 prints** — Unimplemented attack: Fireball Fever — swsh12pt5-23
- **1 prints** — Unimplemented attack: Gather Flowers — swsh12pt5-115
- **1 prints** — Unimplemented attack: Horoscope — swsh12pt5-65
- **1 prints** — Unimplemented attack: Lightning Storm Star — swsh12pt5-55
- **1 prints** — Unimplemented attack: Primate Acting — swsh12pt5-119
- **1 prints** — Unimplemented attack: Rocket Poison — swsh12pt5-82
- **1 prints** — Unimplemented attack: Shorting Spark — swsh12pt5-42
- **1 prints** — Unimplemented attack: Stakeout Headbutt — swsh12pt5-118

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh12pt5-23` | Simisear VSTAR | Unimplemented attack: Fireball Fever; Unimplemented attack: Ember Star |
| `swsh12pt5-36` | Kyogre | Unimplemented attack: Dynamic Wave |
| `swsh12pt5-42` | Luxio | Unimplemented attack: Shorting Spark |
| `swsh12pt5-44` | Luxray | Unimplemented Ability: Explosiveness |
| `swsh12pt5-51` | Radiant Charjabug | Unimplemented Ability: Shocking Block |
| `swsh12pt5-55` | Zeraora VSTAR | Unimplemented attack: Lightning Storm Star |
| `swsh12pt5-65` | Hatterene V | Unimplemented attack: Horoscope |
| `swsh12pt5-66` | Hatterene VMAX | Unimplemented Ability: Witch's Domain |
| `swsh12pt5-82` | Dragalge | Unimplemented attack: Rocket Poison |
| `swsh12pt5-89` | Aggron | Unimplemented attack: Counter Press |
| `swsh12pt5-105` | Radiant Eternatus | Unimplemented Ability: Climactic Gate |
| `swsh12pt5-107` | Ditto | Unimplemented Ability: Sudden Transformation |
| `swsh12pt5-114` | Regigigas VSTAR | Unimplemented Ability: Star Guardian |
| `swsh12pt5-115` | Shaymin | Unimplemented attack: Gather Flowers |
| `swsh12pt5-118` | Gumshoos | Unimplemented attack: Stakeout Headbutt |
| `swsh12pt5-119` | Oranguru | Unimplemented attack: Primate Acting |
| `swsh12pt5-126` | Digging Duo | Unimplemented Trainer effect |
| `swsh12pt5-143` | Sky Seal Stone | Unimplemented Ability: Star Order; Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
