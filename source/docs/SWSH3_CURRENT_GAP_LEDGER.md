# SWSH3 — whole-set gap ledger

Canonical prints: **201** | Playable: **138** | Gated: **63**
Printed attacks: **274** (240 distinct full signatures) | Abilities: **32** (27 distinct signatures)
Trainer rule signatures: **17** | Special Energy rule signatures: **4**
Canonical Git blob: `347f057fe4bc8cd952fda99aa12a1d9c5fa1c550`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **19 prints** — Unimplemented Trainer effect — swsh3-157, swsh3-158, swsh3-159, swsh3-161, swsh3-162, swsh3-163, swsh3-166, swsh3-167, swsh3-168, swsh3-170, swsh3-171, swsh3-172, swsh3-186, swsh3-188, swsh3-189, swsh3-195 …
- **3 prints** — Unimplemented Ability: Sky Circus — swsh3-11, swsh3-145, swsh3-149
- **3 prints** — Unimplemented Special Energy rules — swsh3-174, swsh3-175, swsh3-176
- **2 prints** — Required Rare Fossil evolution parent is not yet enabled — swsh3-54, swsh3-65
- **2 prints** — Unimplemented Ability: Dark Asset — swsh3-104, swsh3-182
- **2 prints** — Unimplemented Ability: Eternal Zone — swsh3-117, swsh3-192
- **2 prints** — Unimplemented Ability: Metal Skin — swsh3-128, swsh3-184
- **2 prints** — Unimplemented attack: G-Max Centiferno — swsh3-34, swsh3-191
- **2 prints** — Unimplemented attack: Radiating Heat — swsh3-33, swsh3-179
- **2 prints** — Unimplemented attack: Trapping Bite — swsh3-128, swsh3-184
- **1 prints** — Unimplemented Ability: Biting Whirlpool — swsh3-66
- **1 prints** — Unimplemented Ability: Dark Squall — swsh3-110
- **1 prints** — Unimplemented Ability: Deep Forest Camo — swsh3-13
- **1 prints** — Unimplemented Ability: Double Type — swsh3-24
- **1 prints** — Unimplemented Ability: Flying Taxi — swsh3-156
- **1 prints** — Unimplemented Ability: Heal Jamming — swsh3-81
- **1 prints** — Unimplemented Ability: Labyrinth of Sand — swsh3-91
- **1 prints** — Unimplemented Ability: Primal Law — swsh3-53
- **1 prints** — Unimplemented Ability: Resistance Shade — swsh3-92
- **1 prints** — Unimplemented Ability: Scorching Feathers — swsh3-32
- **1 prints** — Unimplemented Ability: Shuffle Dance — swsh3-36
- **1 prints** — Unimplemented Ability: Spider Net — swsh3-103
- **1 prints** — Unimplemented Ability: Sturdy — swsh3-123
- **1 prints** — Unimplemented Ability: Tea Break — swsh3-83
- **1 prints** — Unimplemented attack: Aurora Loop — swsh3-37
- **1 prints** — Unimplemented attack: Bend — swsh3-75
- **1 prints** — Unimplemented attack: Captivating Tail — swsh3-142
- **1 prints** — Unimplemented attack: Desert Geyser — swsh3-91
- **1 prints** — Unimplemented attack: Feather Slice — swsh3-149
- **1 prints** — Unimplemented attack: Fossil Search — swsh3-40
- **1 prints** — Unimplemented attack: Frozen Heat — swsh3-28
- **1 prints** — Unimplemented attack: G-Max Drill — swsh3-115
- **1 prints** — Unimplemented attack: Hard Times Slash — swsh3-18
- **1 prints** — Unimplemented attack: Hurricane Blender — swsh3-147
- **1 prints** — Unimplemented attack: Power Accelerator — swsh3-116
- **1 prints** — Unimplemented attack: Rocket Evolution — swsh3-87
- **1 prints** — Unimplemented attack: Smack and Run — swsh3-153
- **1 prints** — Unimplemented attack: Spiky Knuckle — swsh3-114
- **1 prints** — Unimplemented attack: Turbo Drive — swsh3-24

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh3-11` | Rowlet | Unimplemented Ability: Sky Circus |
| `swsh3-13` | Decidueye | Unimplemented Ability: Deep Forest Camo |
| `swsh3-18` | Golisopod | Unimplemented attack: Hard Times Slash |
| `swsh3-24` | Blaziken | Unimplemented attack: Turbo Drive; Unimplemented Ability: Double Type |
| `swsh3-28` | Galarian Darmanitan | Unimplemented attack: Frozen Heat |
| `swsh3-32` | Talonflame | Unimplemented Ability: Scorching Feathers |
| `swsh3-33` | Centiskorch V | Unimplemented attack: Radiating Heat |
| `swsh3-34` | Centiskorch VMAX | Unimplemented attack: G-Max Centiferno |
| `swsh3-36` | Galarian Mr. Rime | Unimplemented Ability: Shuffle Dance |
| `swsh3-37` | Suicune | Unimplemented attack: Aurora Loop |
| `swsh3-40` | Relicanth | Unimplemented attack: Fossil Search |
| `swsh3-53` | Dracovish | Unimplemented Ability: Primal Law |
| `swsh3-54` | Arctovish | Required Rare Fossil evolution parent is not yet enabled |
| `swsh3-65` | Dracozolt | Required Rare Fossil evolution parent is not yet enabled |
| `swsh3-66` | Arctozolt | Unimplemented Ability: Biting Whirlpool |
| `swsh3-75` | Gothitelle | Unimplemented attack: Bend |
| `swsh3-81` | Mimikyu | Unimplemented Ability: Heal Jamming |
| `swsh3-83` | Polteageist | Unimplemented Ability: Tea Break |
| `swsh3-87` | Pupitar | Unimplemented attack: Rocket Evolution |
| `swsh3-91` | Flygon | Unimplemented attack: Desert Geyser; Unimplemented Ability: Labyrinth of Sand |
| `swsh3-92` | Solrock | Unimplemented Ability: Resistance Shade |
| `swsh3-103` | Ariados | Unimplemented Ability: Spider Net |
| `swsh3-104` | Crobat V | Unimplemented Ability: Dark Asset |
| `swsh3-110` | Hydreigon | Unimplemented Ability: Dark Squall |
| `swsh3-114` | Grimmsnarl V | Unimplemented attack: Spiky Knuckle |
| `swsh3-115` | Grimmsnarl VMAX | Unimplemented attack: G-Max Drill |
| `swsh3-116` | Eternatus V | Unimplemented attack: Power Accelerator |
| `swsh3-117` | Eternatus VMAX | Unimplemented Ability: Eternal Zone |
| `swsh3-123` | Aggron | Unimplemented Ability: Sturdy |
| `swsh3-128` | Galarian Stunfisk V | Unimplemented attack: Trapping Bite; Unimplemented Ability: Metal Skin |
| `swsh3-142` | Delcatty | Unimplemented attack: Captivating Tail |
| `swsh3-145` | Starly | Unimplemented Ability: Sky Circus |
| `swsh3-147` | Staraptor | Unimplemented attack: Hurricane Blender |
| `swsh3-149` | Swanna | Unimplemented attack: Feather Slice; Unimplemented Ability: Sky Circus |
| `swsh3-153` | Greedent | Unimplemented attack: Smack and Run |
| `swsh3-156` | Corviknight | Unimplemented Ability: Flying Taxi |
| `swsh3-157` | Big Parasol | Unimplemented Trainer effect |
| `swsh3-158` | Billowing Smoke | Unimplemented Trainer effect |
| `swsh3-159` | Bird Keeper | Unimplemented Trainer effect |
| `swsh3-161` | Familiar Bell | Unimplemented Trainer effect |
| `swsh3-162` | Glimwood Tangle | Unimplemented Trainer effect |
| `swsh3-163` | Kabu | Unimplemented Trainer effect |
| `swsh3-166` | Pokémon Breeder's Nurturing | Unimplemented Trainer effect |
| `swsh3-167` | Rare Fossil | Unimplemented Trainer effect |
| `swsh3-168` | Rose | Unimplemented Trainer effect |
| `swsh3-170` | Spikemuth | Unimplemented Trainer effect |
| `swsh3-171` | Struggle Gloves | Unimplemented Trainer effect |
| `swsh3-172` | Turbo Patch | Unimplemented Trainer effect |
| `swsh3-174` | Heat Fire Energy | Unimplemented Special Energy rules |
| `swsh3-175` | Hiding Darkness Energy | Unimplemented Special Energy rules |
| `swsh3-176` | Powerful Colorless Energy | Unimplemented Special Energy rules |
| `swsh3-179` | Centiskorch V | Unimplemented attack: Radiating Heat |
| `swsh3-182` | Crobat V | Unimplemented Ability: Dark Asset |
| `swsh3-184` | Galarian Stunfisk V | Unimplemented attack: Trapping Bite; Unimplemented Ability: Metal Skin |
| `swsh3-186` | Kabu | Unimplemented Trainer effect |
| `swsh3-188` | Pokémon Breeder's Nurturing | Unimplemented Trainer effect |
| `swsh3-189` | Rose | Unimplemented Trainer effect |
| `swsh3-191` | Centiskorch VMAX | Unimplemented attack: G-Max Centiferno |
| `swsh3-192` | Eternatus VMAX | Unimplemented Ability: Eternal Zone |
| `swsh3-195` | Pokémon Breeder's Nurturing | Unimplemented Trainer effect |
| `swsh3-196` | Rose | Unimplemented Trainer effect |
| `swsh3-199` | Big Parasol | Unimplemented Trainer effect |
| `swsh3-200` | Turbo Patch | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
