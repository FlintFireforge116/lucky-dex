# SWSH8 — whole-set gap ledger

Canonical prints: **284** | Imported: **135** | Playable: **114** | Gated: **21** | Not imported: **149**
Printed attacks: **151** (143 distinct full signatures) | Abilities: **0** (0 distinct signatures)
Trainer rule signatures: **21** | Special Energy rule signatures: **3**
Canonical Git blob: `d88289e9b1469bc1c27cf268461f9efdec00134d`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **20 prints** — Unimplemented Trainer effect — swsh8-225, swsh8-229, swsh8-230, swsh8-231, swsh8-233, swsh8-234, swsh8-236, swsh8-238, swsh8-239, swsh8-241, swsh8-242, swsh8-260, swsh8-261, swsh8-262, swsh8-264, swsh8-275 …
- **1 prints** — Unimplemented Special Energy rules — swsh8-244

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh8-225` | Battle VIP Pass | Unimplemented Trainer effect |
| `swsh8-229` | Cram-o-matic | Unimplemented Trainer effect |
| `swsh8-230` | Cross Switcher | Unimplemented Trainer effect |
| `swsh8-231` | Crossceiver | Unimplemented Trainer effect |
| `swsh8-233` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-234` | Farewell Bell | Unimplemented Trainer effect |
| `swsh8-236` | Power Tablet | Unimplemented Trainer effect |
| `swsh8-238` | Schoolboy | Unimplemented Trainer effect |
| `swsh8-239` | Schoolgirl | Unimplemented Trainer effect |
| `swsh8-241` | Sidney | Unimplemented Trainer effect |
| `swsh8-242` | Skaters' Park | Unimplemented Trainer effect |
| `swsh8-244` | Fusion Strike Energy | Unimplemented Special Energy rules |
| `swsh8-260` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-261` | Schoolboy | Unimplemented Trainer effect |
| `swsh8-262` | Schoolgirl | Unimplemented Trainer effect |
| `swsh8-264` | Sidney | Unimplemented Trainer effect |
| `swsh8-275` | Elesa's Sparkle | Unimplemented Trainer effect |
| `swsh8-276` | Schoolboy | Unimplemented Trainer effect |
| `swsh8-277` | Schoolgirl | Unimplemented Trainer effect |
| `swsh8-279` | Sidney | Unimplemented Trainer effect |
| `swsh8-281` | Power Tablet | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
