# SM75 — whole-set gap ledger

Canonical prints: **80** | Playable: **67** | Gated: **13**
Printed attacks: **115** (91 distinct full signatures) | Abilities: **18** (16 distinct signatures)
Trainer rule signatures: **7** | Special Energy rule signatures: **0**
Canonical Git blob: `aea328fd17b49d6b4e84c6786c764301d3efa8e3`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Trainer effect — sm75-64, sm75-70
- **1 prints** — Prism Star attack/Ability or Trainer effect not yet implemented — sm75-7
- **1 prints** — Unimplemented Ability: Commotion — sm75-20
- **1 prints** — Unimplemented Ability: Downpour — sm75-24
- **1 prints** — Unimplemented Ability: Dragon Guard — sm75-39
- **1 prints** — Unimplemented Ability: Meet Up — sm75-31
- **1 prints** — Unimplemented Ability: Murmurs of the Sea — sm75-30
- **1 prints** — Unimplemented Ability: Wash Out — sm75-26
- **1 prints** — Unimplemented Ability: Weed Out — sm75-33
- **1 prints** — Unimplemented attack: Bubble Shoot — sm75-27
- **1 prints** — Unimplemented attack: Dark Destruction — sm75-33
- **1 prints** — Unimplemented attack: Dragon Wisdom — sm75-51
- **1 prints** — Unimplemented attack: Explosive Jet — sm75-50
- **1 prints** — Unimplemented attack: Infinity — sm75-7
- **1 prints** — Unimplemented attack: Riptide — sm75-24
- **1 prints** — Unimplemented attack: Wild Tail — sm75-20

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm75-7` | Victini ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Infinity |
| `sm75-20` | Gyarados | Unimplemented attack: Wild Tail; Unimplemented Ability: Commotion |
| `sm75-24` | Feraligatr | Unimplemented attack: Riptide; Unimplemented Ability: Downpour |
| `sm75-26` | Quagsire | Unimplemented Ability: Wash Out |
| `sm75-27` | Corsola | Unimplemented attack: Bubble Shoot |
| `sm75-30` | Phione | Unimplemented Ability: Murmurs of the Sea |
| `sm75-31` | Wishiwashi | Unimplemented Ability: Meet Up |
| `sm75-33` | Hydreigon | Unimplemented attack: Dark Destruction; Unimplemented Ability: Weed Out |
| `sm75-39` | Flygon | Unimplemented Ability: Dragon Guard |
| `sm75-50` | Turtonator | Unimplemented attack: Explosive Jet |
| `sm75-51` | Drampa | Unimplemented attack: Dragon Wisdom |
| `sm75-64` | Zinnia | Unimplemented Trainer effect |
| `sm75-70` | Zinnia | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
