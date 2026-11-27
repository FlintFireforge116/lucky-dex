# SWSH12 — whole-set gap ledger

Canonical prints: **215** | Imported: **215** | Playable: **199** | Gated: **16** | Not imported: **0**
Printed attacks: **280** (231 distinct full signatures) | Abilities: **38** (29 distinct signatures)
Trainer rule signatures: **19** | Special Energy rule signatures: **2**
Canonical Git blob: `a57779d463a4f8ddf2bc21ad4ae66e9f4c3eaac2`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **5 prints** — Unimplemented Trainer effect — swsh12-154, swsh12-156, swsh12-160, swsh12-163, swsh12-214
- **2 prints** — Unimplemented Ability: Legacy Star — swsh12-136, swsh12-201
- **2 prints** — Unimplemented Ability: Reviving Flame — swsh12-140, swsh12-187
- **2 prints** — Unimplemented attack: Apex Dragon — swsh12-136, swsh12-201
- **2 prints** — Unimplemented attack: Rainbow Burn — swsh12-140, swsh12-187
- **2 prints** — Unimplemented attack: Star Cipher — swsh12-66, swsh12-199
- **2 prints** — Unimplemented attack: Tri Power — swsh12-66, swsh12-199
- **1 prints** — Unimplemented Ability: Bully of the Sands — swsh12-113
- **1 prints** — Unimplemented Ability: Emergency Entry — swsh12-119
- **1 prints** — Unimplemented Ability: Persistent Cells — swsh12-78
- **1 prints** — Unimplemented Ability: Star Alchemy — swsh12-156
- **1 prints** — Unimplemented Ability: Surprise Spores — swsh12-12
- **1 prints** — Unimplemented attack: Cell Fork — swsh12-78
- **1 prints** — Unimplemented attack: Double-Edge — swsh12-113
- **1 prints** — Unimplemented attack: Dragon Launcher — swsh12-89
- **1 prints** — Unimplemented attack: Meteor Mash — swsh12-119
- **1 prints** — Unimplemented attack: Star Gravity — swsh12-154

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh12-12` | Amoonguss | Unimplemented Ability: Surprise Spores |
| `swsh12-66` | Unown VSTAR | Unimplemented attack: Tri Power; Unimplemented attack: Star Cipher |
| `swsh12-78` | Reuniclus | Unimplemented attack: Cell Fork; Unimplemented Ability: Persistent Cells |
| `swsh12-89` | Dragapult | Unimplemented attack: Dragon Launcher |
| `swsh12-113` | Krookodile | Unimplemented attack: Double-Edge; Unimplemented Ability: Bully of the Sands |
| `swsh12-119` | Metagross | Unimplemented attack: Meteor Mash; Unimplemented Ability: Emergency Entry |
| `swsh12-136` | Regidrago VSTAR | Unimplemented attack: Apex Dragon; Unimplemented Ability: Legacy Star |
| `swsh12-140` | Ho-Oh V | Unimplemented attack: Rainbow Burn; Unimplemented Ability: Reviving Flame |
| `swsh12-154` | Earthen Seal Stone | Unimplemented attack: Star Gravity; Unimplemented Trainer effect |
| `swsh12-156` | Forest Seal Stone | Unimplemented Ability: Star Alchemy; Unimplemented Trainer effect |
| `swsh12-160` | Leafy Camo Poncho | Unimplemented Trainer effect |
| `swsh12-163` | Quad Stone | Unimplemented Trainer effect |
| `swsh12-187` | Ho-Oh V | Unimplemented attack: Rainbow Burn; Unimplemented Ability: Reviving Flame |
| `swsh12-199` | Unown VSTAR | Unimplemented attack: Tri Power; Unimplemented attack: Star Cipher |
| `swsh12-201` | Regidrago VSTAR | Unimplemented attack: Apex Dragon; Unimplemented Ability: Legacy Star |
| `swsh12-214` | Leafy Camo Poncho | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
