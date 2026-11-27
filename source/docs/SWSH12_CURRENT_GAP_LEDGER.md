# SWSH12 — whole-set gap ledger

Canonical prints: **215** | Imported: **103** | Playable: **72** | Gated: **31** | Not imported: **112**
Printed attacks: **110** (107 distinct full signatures) | Abilities: **11** (11 distinct signatures)
Trainer rule signatures: **19** | Special Energy rule signatures: **2**
Canonical Git blob: `a57779d463a4f8ddf2bc21ad4ae66e9f4c3eaac2`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **12 prints** — Unimplemented Trainer effect — swsh12-154, swsh12-155, swsh12-156, swsh12-157, swsh12-160, swsh12-163, swsh12-166, swsh12-190, swsh12-194, swsh12-205, swsh12-208, swsh12-214
- **3 prints** — Unimplemented Special Energy rules — swsh12-168, swsh12-169, swsh12-215
- **2 prints** — Unimplemented attack: Four as One — swsh12-14, swsh12-46
- **1 prints** — Unimplemented Ability: Hidden Threads — swsh12-4
- **1 prints** — Unimplemented Ability: Needle Line — swsh12-15
- **1 prints** — Unimplemented Ability: Painful Spoons — swsh12-59
- **1 prints** — Unimplemented Ability: Selfish Lips — swsh12-62
- **1 prints** — Unimplemented Ability: Spiteful Magic — swsh12-64
- **1 prints** — Unimplemented Ability: Star Alchemy — swsh12-156
- **1 prints** — Unimplemented Ability: Surprise Spores — swsh12-12
- **1 prints** — Unimplemented attack: Eerie Voice — swsh12-64
- **1 prints** — Unimplemented attack: Gritty Claws — swsh12-31
- **1 prints** — Unimplemented attack: Pika Strike — swsh12-49
- **1 prints** — Unimplemented attack: Primal Guidance — swsh12-35
- **1 prints** — Unimplemented attack: Regal Blender — swsh12-8
- **1 prints** — Unimplemented attack: Secret Attack — swsh12-32
- **1 prints** — Unimplemented attack: Silvery Snow Star — swsh12-34
- **1 prints** — Unimplemented attack: Snow Mirage — swsh12-34
- **1 prints** — Unimplemented attack: Sparkling Wing — swsh12-24
- **1 prints** — Unimplemented attack: Star Gravity — swsh12-154
- **1 prints** — Unimplemented attack: Star Winder — swsh12-8
- **1 prints** — Unimplemented attack: Victory Symbol — swsh12-65

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh12-4` | Ariados | Unimplemented Ability: Hidden Threads |
| `swsh12-8` | Serperior VSTAR | Unimplemented attack: Regal Blender; Unimplemented attack: Star Winder |
| `swsh12-12` | Amoonguss | Unimplemented Ability: Surprise Spores |
| `swsh12-14` | Virizion | Unimplemented attack: Four as One |
| `swsh12-15` | Chesnaught V | Unimplemented Ability: Needle Line |
| `swsh12-24` | Reshiram V | Unimplemented attack: Sparkling Wing |
| `swsh12-31` | Torracat | Unimplemented attack: Gritty Claws |
| `swsh12-32` | Incineroar | Unimplemented attack: Secret Attack |
| `swsh12-34` | Alolan Vulpix VSTAR | Unimplemented attack: Snow Mirage; Unimplemented attack: Silvery Snow Star |
| `swsh12-35` | Omastar V | Unimplemented attack: Primal Guidance |
| `swsh12-46` | Keldeo | Unimplemented attack: Four as One |
| `swsh12-49` | Pikachu | Unimplemented attack: Pika Strike |
| `swsh12-59` | Radiant Alakazam | Unimplemented Ability: Painful Spoons |
| `swsh12-62` | Jynx | Unimplemented Ability: Selfish Lips |
| `swsh12-64` | Mismagius | Unimplemented attack: Eerie Voice; Unimplemented Ability: Spiteful Magic |
| `swsh12-65` | Unown V | Unimplemented attack: Victory Symbol |
| `swsh12-154` | Earthen Seal Stone | Unimplemented attack: Star Gravity; Unimplemented Trainer effect |
| `swsh12-155` | Emergency Jelly | Unimplemented Trainer effect |
| `swsh12-156` | Forest Seal Stone | Unimplemented Ability: Star Alchemy; Unimplemented Trainer effect |
| `swsh12-157` | Furisode Girl | Unimplemented Trainer effect |
| `swsh12-160` | Leafy Camo Poncho | Unimplemented Trainer effect |
| `swsh12-163` | Quad Stone | Unimplemented Trainer effect |
| `swsh12-166` | Wallace | Unimplemented Trainer effect |
| `swsh12-168` | Regenerative Energy | Unimplemented Special Energy rules |
| `swsh12-169` | V Guard Energy | Unimplemented Special Energy rules |
| `swsh12-190` | Furisode Girl | Unimplemented Trainer effect |
| `swsh12-194` | Wallace | Unimplemented Trainer effect |
| `swsh12-205` | Furisode Girl | Unimplemented Trainer effect |
| `swsh12-208` | Wallace | Unimplemented Trainer effect |
| `swsh12-214` | Leafy Camo Poncho | Unimplemented Trainer effect |
| `swsh12-215` | V Guard Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
