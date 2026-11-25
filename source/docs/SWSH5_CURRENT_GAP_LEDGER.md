# SWSH5 — whole-set gap ledger

Canonical prints: **183** | Playable: **152** | Gated: **31**
Printed attacks: **234** (189 distinct full signatures) | Abilities: **28** (20 distinct signatures)
Trainer rule signatures: **19** | Special Energy rule signatures: **2**
Canonical Git blob: `41dbfbb564cdae9a8aca473b02589dcc18c8e351`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **13 prints** — Unimplemented Trainer effect — swsh5-130, swsh5-131, swsh5-132, swsh5-133, swsh5-134, swsh5-135, swsh5-136, swsh5-161, swsh5-162, swsh5-163, swsh5-175, swsh5-176, swsh5-177
- **2 prints** — Unimplemented Ability: Dummy Doll — swsh5-62, swsh5-148
- **2 prints** — Unimplemented Ability: Lustrous Body — swsh5-110, swsh5-171
- **2 prints** — Unimplemented Ability: Stance Change — swsh5-107, swsh5-108
- **2 prints** — Unimplemented attack: Double Dip Fangs — swsh5-117, swsh5-157
- **2 prints** — Unimplemented attack: Jealous Eyes — swsh5-62, swsh5-148
- **1 prints** — Unimplemented Ability: Deep Sea King — swsh5-33
- **1 prints** — Unimplemented Ability: Ear Moves — swsh5-61
- **1 prints** — Unimplemented Ability: Metal Transfer — swsh5-102
- **1 prints** — Unimplemented Ability: Overheater — swsh5-30
- **1 prints** — Unimplemented attack: Ball Juggling — swsh5-35
- **1 prints** — Unimplemented attack: Defiant Spark — swsh5-53
- **1 prints** — Unimplemented attack: Electrostep — swsh5-48
- **1 prints** — Unimplemented attack: Evomancy — swsh5-65
- **1 prints** — Unimplemented attack: Full Metal Blade — swsh5-107
- **1 prints** — Unimplemented attack: Matchless Maelstrom — swsh5-131
- **1 prints** — Unimplemented attack: Power Split — swsh5-58
- **1 prints** — Unimplemented attack: Selickt — swsh5-114

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh5-30` | Centiskorch | Unimplemented Ability: Overheater |
| `swsh5-33` | Kingdra | Unimplemented Ability: Deep Sea King |
| `swsh5-35` | Galarian Mr. Rime | Unimplemented attack: Ball Juggling |
| `swsh5-48` | Luxray | Unimplemented attack: Electrostep |
| `swsh5-53` | Boltund | Unimplemented attack: Defiant Spark |
| `swsh5-58` | Claydol | Unimplemented attack: Power Split |
| `swsh5-61` | Meowstic | Unimplemented Ability: Ear Moves |
| `swsh5-62` | Mimikyu V | Unimplemented attack: Jealous Eyes; Unimplemented Ability: Dummy Doll |
| `swsh5-65` | Orbeetle | Unimplemented attack: Evomancy |
| `swsh5-102` | Bronzong | Unimplemented Ability: Metal Transfer |
| `swsh5-107` | Aegislash | Unimplemented attack: Full Metal Blade; Unimplemented Ability: Stance Change |
| `swsh5-108` | Aegislash | Unimplemented Ability: Stance Change |
| `swsh5-110` | Corviknight VMAX | Unimplemented Ability: Lustrous Body |
| `swsh5-114` | Lickilicky | Unimplemented attack: Selickt |
| `swsh5-117` | Stoutland V | Unimplemented attack: Double Dip Fangs |
| `swsh5-130` | Phoebe | Unimplemented Trainer effect |
| `swsh5-131` | Rapid Strike Scroll of Swirls | Unimplemented attack: Matchless Maelstrom; Unimplemented Trainer effect |
| `swsh5-132` | Rapid Strike Style Mustard | Unimplemented Trainer effect |
| `swsh5-133` | Single Strike Scroll of Scorn | Unimplemented Trainer effect |
| `swsh5-134` | Single Strike Style Mustard | Unimplemented Trainer effect |
| `swsh5-135` | Sordward & Shielbert | Unimplemented Trainer effect |
| `swsh5-136` | Tool Jammer | Unimplemented Trainer effect |
| `swsh5-148` | Mimikyu V | Unimplemented attack: Jealous Eyes; Unimplemented Ability: Dummy Doll |
| `swsh5-157` | Stoutland V | Unimplemented attack: Double Dip Fangs |
| `swsh5-161` | Phoebe | Unimplemented Trainer effect |
| `swsh5-162` | Rapid Strike Style Mustard | Unimplemented Trainer effect |
| `swsh5-163` | Single Strike Style Mustard | Unimplemented Trainer effect |
| `swsh5-171` | Corviknight VMAX | Unimplemented Ability: Lustrous Body |
| `swsh5-175` | Phoebe | Unimplemented Trainer effect |
| `swsh5-176` | Rapid Strike Style Mustard | Unimplemented Trainer effect |
| `swsh5-177` | Single Strike Style Mustard | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
