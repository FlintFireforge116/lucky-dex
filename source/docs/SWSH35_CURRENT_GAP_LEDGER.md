# SWSH35 — whole-set gap ledger

Canonical prints: **80** | Playable: **75** | Gated: **5**
Printed attacks: **89** (80 distinct full signatures) | Abilities: **12** (8 distinct signatures)
Trainer rule signatures: **19** | Special Energy rule signatures: **0**
Canonical Git blob: `27d5a373d5274cd0dde9e681de419157026addb8`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **3 prints** — Unimplemented Trainer effect — swsh35-64, swsh35-66, swsh35-80
- **1 prints** — Unimplemented Ability: Wicked Ruler — swsh35-37
- **1 prints** — Unimplemented attack: Adornment — swsh35-23
- **1 prints** — Unimplemented attack: G-Max Whisk — swsh35-23

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh35-23` | Alcremie VMAX | Unimplemented attack: Adornment; Unimplemented attack: G-Max Whisk |
| `swsh35-37` | Galarian Obstagoon | Unimplemented Ability: Wicked Ruler |
| `swsh35-64` | Rotom Phone | Unimplemented Trainer effect |
| `swsh35-66` | Suspicious Food Tin | Unimplemented Trainer effect |
| `swsh35-80` | Suspicious Food Tin | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
