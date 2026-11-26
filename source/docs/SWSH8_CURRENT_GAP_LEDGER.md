# SWSH8 — whole-set gap ledger

Canonical prints: **284** | Imported: **172** | Playable: **147** | Gated: **25** | Not imported: **112**
Printed attacks: **210** (177 distinct full signatures) | Abilities: **10** (6 distinct signatures)
Trainer rule signatures: **21** | Special Energy rule signatures: **3**
Canonical Git blob: `d88289e9b1469bc1c27cf268461f9efdec00134d`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **18 prints** — Unimplemented Trainer effect — swsh8-225, swsh8-229, swsh8-230, swsh8-231, swsh8-233, swsh8-234, swsh8-238, swsh8-239, swsh8-241, swsh8-242, swsh8-260, swsh8-261, swsh8-262, swsh8-264, swsh8-275, swsh8-276 …
- **2 prints** — Unimplemented Ability: Double Gunner — swsh8-79, swsh8-266
- **2 prints** — Unimplemented attack: G-Max Spiral — swsh8-79, swsh8-266
- **2 prints** — Unimplemented attack: Turn a Profit — swsh8-218, swsh8-272
- **1 prints** — Unimplemented Ability: Solar Revelation — swsh8-270
- **1 prints** — Unimplemented Ability: Two-Faced — swsh8-253
- **1 prints** — Unimplemented Special Energy rules — swsh8-244
- **1 prints** — Unimplemented attack: Shadow Impact — swsh8-253

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh8-79` | Inteleon VMAX | Unimplemented attack: G-Max Spiral; Unimplemented Ability: Double Gunner |
| `swsh8-218` | Greedent VMAX | Unimplemented attack: Turn a Profit |
| `swsh8-225` | Battle VIP Pass | Unimplemented Trainer effect |
| `swsh8-229` | Cram-o-matic | Unimplemented Trainer effect |
| `swsh8-230` | Cross Switcher | Unimplemented Trainer effect |
| `swsh8-231` | Crossceiver | Unimplemented Trainer effect |
| `swsh8-233` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-234` | Farewell Bell | Unimplemented Trainer effect |
| `swsh8-238` | Schoolboy | Unimplemented Trainer effect |
| `swsh8-239` | Schoolgirl | Unimplemented Trainer effect |
| `swsh8-241` | Sidney | Unimplemented Trainer effect |
| `swsh8-242` | Skaters' Park | Unimplemented Trainer effect |
| `swsh8-244` | Fusion Strike Energy | Unimplemented Special Energy rules |
| `swsh8-253` | Hoopa V | Unimplemented attack: Shadow Impact; Unimplemented Ability: Two-Faced |
| `swsh8-260` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-261` | Schoolboy | Unimplemented Trainer effect |
| `swsh8-262` | Schoolgirl | Unimplemented Trainer effect |
| `swsh8-264` | Sidney | Unimplemented Trainer effect |
| `swsh8-266` | Inteleon VMAX | Unimplemented attack: G-Max Spiral; Unimplemented Ability: Double Gunner |
| `swsh8-270` | Espeon VMAX | Unimplemented Ability: Solar Revelation |
| `swsh8-272` | Greedent VMAX | Unimplemented attack: Turn a Profit |
| `swsh8-275` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-276` | Schoolboy | Unimplemented Trainer effect |
| `swsh8-277` | Schoolgirl | Unimplemented Trainer effect |
| `swsh8-279` | Sidney | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
