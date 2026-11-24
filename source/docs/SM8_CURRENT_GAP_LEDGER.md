# SM8 — whole-set gap ledger

Canonical prints: **240** | Playable: **103** | Gated: **137**
Printed attacks: **315** (243 distinct full signatures) | Abilities: **61** (45 distinct signatures)
Trainer rule signatures: **28** | Special Energy rule signatures: **1**
Canonical Git blob: `354284780f7771d1a2530ef766e57228c06805cd`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **40 prints** — Unimplemented Trainer effect — sm8-169, sm8-170, sm8-171, sm8-172, sm8-172a, sm8-173, sm8-174, sm8-175, sm8-176, sm8-177, sm8-178, sm8-179, sm8-180, sm8-181, sm8-182, sm8-183 …
- **7 prints** — Prism Star attack/Ability or Trainer effect not yet implemented — sm8-19, sm8-144, sm8-154, sm8-178, sm8-180, sm8-182, sm8-191
- **3 prints** — Unimplemented Ability: Crushing Charge — sm8-44, sm8-198, sm8-218
- **3 prints** — Unimplemented Ability: Double Drive — sm8-130, sm8-204, sm8-224
- **3 prints** — Unimplemented Ability: Lost Out — sm8-121, sm8-203, sm8-223
- **3 prints** — Unimplemented Ability: Mirror Counter — sm8-98, sm8-202, sm8-222
- **3 prints** — Unimplemented Ability: Phantom Winds — sm8-60, sm8-200, sm8-220
- **3 prints** — Unimplemented Ability: Protective Shell — sm8-17, sm8-195, sm8-215
- **3 prints** — Unimplemented Ability: Thunderclap Zone — sm8-86, sm8-201, sm8-221
- **3 prints** — Unimplemented attack: Breeze Away-GX — sm8-34, sm8-197, sm8-217
- **3 prints** — Unimplemented attack: Burst-GX — sm8-52, sm8-199, sm8-219
- **3 prints** — Unimplemented attack: Cure Stream — sm8-60, sm8-200, sm8-220
- **3 prints** — Unimplemented attack: Dream Fear-GX — sm8-149, sm8-206, sm8-226
- **3 prints** — Unimplemented attack: Dusty Ruckus — sm8-121, sm8-203, sm8-223
- **3 prints** — Unimplemented attack: Full Voltage-GX — sm8-86, sm8-201, sm8-221
- **3 prints** — Unimplemented attack: Jungle Heal-GX — sm8-22, sm8-196, sm8-216
- **3 prints** — Unimplemented attack: Lava Flow — sm8-44, sm8-198, sm8-218
- **3 prints** — Unimplemented attack: Leaf Cyclone — sm8-22, sm8-196, sm8-216
- **3 prints** — Unimplemented attack: Lost Purge-GX — sm8-159, sm8-207, sm8-227
- **3 prints** — Unimplemented attack: Mind Blown — sm8-52, sm8-199, sm8-219
- **2 prints** — Unimplemented attack: Cursed Drop — sm8-96, sm8-103
- **1 prints** — Unimplemented Ability: Almighty Evolution — sm8-154
- **1 prints** — Unimplemented Ability: Blazing Energy — sm8-42
- **1 prints** — Unimplemented Ability: Charging Up — sm8-108
- **1 prints** — Unimplemented Ability: Charmed Charm — sm8-150
- **1 prints** — Unimplemented Ability: DAMAGE — sm8-90
- **1 prints** — Unimplemented Ability: Distortion Door — sm8-97
- **1 prints** — Unimplemented Ability: Effect Spore — sm8-148
- **1 prints** — Unimplemented Ability: Floral Path to the Sky — sm8-13
- **1 prints** — Unimplemented Ability: Fresh Squeezed — sm8-16
- **1 prints** — Unimplemented Ability: HAND — sm8-91
- **1 prints** — Unimplemented Ability: Happiness Supplement — sm8-153
- **1 prints** — Unimplemented Ability: Harmonics — sm8-67
- **1 prints** — Unimplemented Ability: Hazardous Evolution — sm8-28
- **1 prints** — Unimplemented Ability: MISSING — sm8-92
- **1 prints** — Unimplemented Ability: Molting — sm8-30
- **1 prints** — Unimplemented Ability: Mountain Pass — sm8-165
- **1 prints** — Unimplemented Ability: Mysterious Buzz — sm8-146
- **1 prints** — Unimplemented Ability: Path of Life — sm8-144
- **1 prints** — Unimplemented Ability: Quick-Ripening Herb — sm8-8
- **1 prints** — Unimplemented Ability: Shady Tail — sm8-93
- **1 prints** — Unimplemented Ability: Sturdy — sm8-112
- **1 prints** — Unimplemented Ability: Unit Color 1 — sm8-161
- **1 prints** — Unimplemented Ability: Unit Color 3 — sm8-162
- **1 prints** — Unimplemented Ability: Unseen Flash — sm8-78
- **1 prints** — Unimplemented Ability: Vessel of Life — sm8-95
- **1 prints** — Unimplemented Special Energy rules — sm8-194
- **1 prints** — Unimplemented attack: Assisting Heater — sm8-38
- **1 prints** — Unimplemented attack: Attack Operation — sm8-46
- **1 prints** — Unimplemented attack: Butterfly Edge — sm8-26
- **1 prints** — Unimplemented attack: Charmed Slap — sm8-134
- **1 prints** — Unimplemented attack: Commanding Queen — sm8-32
- **1 prints** — Unimplemented attack: Diamond Gate — sm8-117
- **1 prints** — Unimplemented attack: Dream Away — sm8-151
- **1 prints** — Unimplemented attack: Dream's Touch — sm8-148
- **1 prints** — Unimplemented attack: Empty Threat — sm8-119
- **1 prints** — Unimplemented attack: Energy Drink — sm8-16
- **1 prints** — Unimplemented attack: Energy Gaze — sm8-88
- **1 prints** — Unimplemented attack: Eye Opener — sm8-107
- **1 prints** — Unimplemented attack: Get Lost — sm8-94
- **1 prints** — Unimplemented attack: Giganticannon — sm8-166
- **1 prints** — Unimplemented attack: Happy Delivery — sm8-57
- **1 prints** — Unimplemented attack: Lost Blast — sm8-124
- **1 prints** — Unimplemented attack: Lost Flame — sm8-42
- **1 prints** — Unimplemented attack: Lost Voltage — sm8-79
- **1 prints** — Unimplemented attack: Make a Mess — sm8-137
- **1 prints** — Unimplemented attack: Memory Melt — sm8-55
- **1 prints** — Unimplemented attack: Milk Cannon — sm8-158
- **1 prints** — Unimplemented attack: Miracle Harmony — sm8-104
- **1 prints** — Unimplemented attack: Nightcap — sm8-106
- **1 prints** — Unimplemented attack: Nuzzle Shot — sm8-84
- **1 prints** — Unimplemented attack: Overshort — sm8-80
- **1 prints** — Unimplemented attack: Peck Off — sm8-163
- **1 prints** — Unimplemented attack: Polka-Dot Search — sm8-136
- **1 prints** — Unimplemented attack: Powerful Slap — sm8-153
- **1 prints** — Unimplemented attack: Quick Hunt — sm8-96
- **1 prints** — Unimplemented attack: Salvage — sm8-74
- **1 prints** — Unimplemented attack: Shadow Impact — sm8-97
- **1 prints** — Unimplemented attack: Spider Scram — sm8-9
- **1 prints** — Unimplemented attack: Spirit Juggling — sm8-100
- **1 prints** — Unimplemented attack: Stunning Likeness — sm8-157
- **1 prints** — Unimplemented attack: Sympathetic Slap — sm8-152
- **1 prints** — Unimplemented attack: Thorny Eruption — sm8-124
- **1 prints** — Unimplemented attack: Time Distortion — sm8-19
- **1 prints** — Unimplemented attack: Trapping Thread — sm8-10
- **1 prints** — Unimplemented attack: Turn Back Time — sm8-127
- **1 prints** — Unimplemented attack: Venom Fever — sm8-69

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm8-8` | Meganium | Unimplemented Ability: Quick-Ripening Herb |
| `sm8-9` | Spinarak | Unimplemented attack: Spider Scram |
| `sm8-10` | Ariados | Unimplemented attack: Trapping Thread |
| `sm8-13` | Skiploom | Unimplemented Ability: Floral Path to the Sky |
| `sm8-16` | Shuckle | Unimplemented attack: Energy Drink; Unimplemented Ability: Fresh Squeezed |
| `sm8-17` | Shuckle-GX | Unimplemented Ability: Protective Shell |
| `sm8-19` | Celebi ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Time Distortion |
| `sm8-22` | Sceptile-GX | Unimplemented attack: Leaf Cyclone; Unimplemented attack: Jungle Heal-GX |
| `sm8-26` | Beautifly | Unimplemented attack: Butterfly Edge |
| `sm8-28` | Dustox | Unimplemented Ability: Hazardous Evolution |
| `sm8-30` | Ninjask | Unimplemented Ability: Molting |
| `sm8-32` | Vespiquen | Unimplemented attack: Commanding Queen |
| `sm8-34` | Virizion-GX | Unimplemented attack: Breeze Away-GX |
| `sm8-38` | Moltres | Unimplemented attack: Assisting Heater |
| `sm8-42` | Typhlosion | Unimplemented attack: Lost Flame; Unimplemented Ability: Blazing Energy |
| `sm8-44` | Magcargo-GX | Unimplemented attack: Lava Flow; Unimplemented Ability: Crushing Charge |
| `sm8-46` | Houndoom | Unimplemented attack: Attack Operation |
| `sm8-52` | Blacephalon-GX | Unimplemented attack: Mind Blown; Unimplemented attack: Burst-GX |
| `sm8-55` | Slowking | Unimplemented attack: Memory Melt |
| `sm8-57` | Delibird | Unimplemented attack: Happy Delivery |
| `sm8-60` | Suicune-GX | Unimplemented attack: Cure Stream; Unimplemented Ability: Phantom Winds |
| `sm8-67` | Primarina | Unimplemented Ability: Harmonics |
| `sm8-69` | Toxapex | Unimplemented attack: Venom Fever |
| `sm8-74` | Lanturn | Unimplemented attack: Salvage |
| `sm8-78` | Ampharos | Unimplemented Ability: Unseen Flash |
| `sm8-79` | Raikou | Unimplemented attack: Lost Voltage |
| `sm8-80` | Pachirisu | Unimplemented attack: Overshort |
| `sm8-84` | Dedenne | Unimplemented attack: Nuzzle Shot |
| `sm8-86` | Zeraora-GX | Unimplemented attack: Full Voltage-GX; Unimplemented Ability: Thunderclap Zone |
| `sm8-88` | Xatu | Unimplemented attack: Energy Gaze |
| `sm8-90` | Unown | Unimplemented Ability: DAMAGE |
| `sm8-91` | Unown | Unimplemented Ability: HAND |
| `sm8-92` | Unown | Unimplemented Ability: MISSING |
| `sm8-93` | Wobbuffet | Unimplemented Ability: Shady Tail |
| `sm8-94` | Girafarig | Unimplemented attack: Get Lost |
| `sm8-95` | Shedinja | Unimplemented Ability: Vessel of Life |
| `sm8-96` | Sableye | Unimplemented attack: Quick Hunt; Unimplemented attack: Cursed Drop |
| `sm8-97` | Giratina | Unimplemented attack: Shadow Impact; Unimplemented Ability: Distortion Door |
| `sm8-98` | Sigilyph-GX | Unimplemented Ability: Mirror Counter |
| `sm8-100` | Cofagrigus | Unimplemented attack: Spirit Juggling |
| `sm8-103` | Chandelure | Unimplemented attack: Cursed Drop |
| `sm8-104` | Meloetta | Unimplemented attack: Miracle Harmony |
| `sm8-106` | Nihilego | Unimplemented attack: Nightcap |
| `sm8-107` | Poipole | Unimplemented attack: Eye Opener |
| `sm8-108` | Naganadel | Unimplemented Ability: Charging Up |
| `sm8-112` | Donphan | Unimplemented Ability: Sturdy |
| `sm8-117` | Carbink | Unimplemented attack: Diamond Gate |
| `sm8-119` | Alolan Persian | Unimplemented attack: Empty Threat |
| `sm8-121` | Tyranitar-GX | Unimplemented attack: Dusty Ruckus; Unimplemented Ability: Lost Out |
| `sm8-124` | Forretress | Unimplemented attack: Thorny Eruption; Unimplemented attack: Lost Blast |
| `sm8-127` | Dialga | Unimplemented attack: Turn Back Time |
| `sm8-130` | Genesect-GX | Unimplemented Ability: Double Drive |
| `sm8-134` | Wigglytuff | Unimplemented attack: Charmed Slap |
| `sm8-136` | Azumarill | Unimplemented attack: Polka-Dot Search |
| `sm8-137` | Snubbull | Unimplemented attack: Make a Mess |
| `sm8-144` | Xerneas ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Ability: Path of Life |
| `sm8-146` | Ribombee | Unimplemented Ability: Mysterious Buzz |
| `sm8-148` | Shiinotic | Unimplemented attack: Dream's Touch; Unimplemented Ability: Effect Spore |
| `sm8-149` | Mimikyu-GX | Unimplemented attack: Dream Fear-GX |
| `sm8-150` | Tapu Lele | Unimplemented Ability: Charmed Charm |
| `sm8-151` | Tapu Fini | Unimplemented attack: Dream Away |
| `sm8-152` | Chansey | Unimplemented attack: Sympathetic Slap |
| `sm8-153` | Blissey | Unimplemented attack: Powerful Slap; Unimplemented Ability: Happiness Supplement |
| `sm8-154` | Ditto ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Ability: Almighty Evolution |
| `sm8-157` | Smeargle | Unimplemented attack: Stunning Likeness |
| `sm8-158` | Miltank | Unimplemented attack: Milk Cannon |
| `sm8-159` | Lugia-GX | Unimplemented attack: Lost Purge-GX |
| `sm8-161` | Kecleon | Unimplemented Ability: Unit Color 1 |
| `sm8-162` | Kecleon | Unimplemented Ability: Unit Color 3 |
| `sm8-163` | Pikipek | Unimplemented attack: Peck Off |
| `sm8-165` | Trumbeak | Unimplemented Ability: Mountain Pass |
| `sm8-166` | Toucannon | Unimplemented attack: Giganticannon |
| `sm8-169` | Choice Helmet | Unimplemented Trainer effect |
| `sm8-170` | Counter Gain | Unimplemented Trainer effect |
| `sm8-171` | Custom Catcher | Unimplemented Trainer effect |
| `sm8-172` | Electropower | Unimplemented Trainer effect |
| `sm8-172a` | Electropower | Unimplemented Trainer effect |
| `sm8-173` | Faba | Unimplemented Trainer effect |
| `sm8-174` | Fairy Charm Grass | Unimplemented Trainer effect |
| `sm8-175` | Fairy Charm Psychic | Unimplemented Trainer effect |
| `sm8-176` | Fairy Charm Fighting | Unimplemented Trainer effect |
| `sm8-177` | Fairy Charm Dragon | Unimplemented Trainer effect |
| `sm8-178` | Heat Factory ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Trainer effect |
| `sm8-179` | Kahili | Unimplemented Trainer effect |
| `sm8-180` | Life Forest ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Trainer effect |
| `sm8-181` | Lost Blender | Unimplemented Trainer effect |
| `sm8-182` | Lusamine ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Trainer effect |
| `sm8-183` | Mina | Unimplemented Trainer effect |
| `sm8-184` | Mixed Herbs | Unimplemented Trainer effect |
| `sm8-185` | Moomoo Milk | Unimplemented Trainer effect |
| `sm8-186` | Morty | Unimplemented Trainer effect |
| `sm8-187` | Net Ball | Unimplemented Trainer effect |
| `sm8-187a` | Net Ball | Unimplemented Trainer effect |
| `sm8-189` | Sightseer | Unimplemented Trainer effect |
| `sm8-189a` | Sightseer | Unimplemented Trainer effect |
| `sm8-190` | Spell Tag | Unimplemented Trainer effect |
| `sm8-191` | Thunder Mountain ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Trainer effect |
| `sm8-192` | Wait and See Hammer | Unimplemented Trainer effect |
| `sm8-193` | Whitney | Unimplemented Trainer effect |
| `sm8-194` | Memory Energy | Unimplemented Special Energy rules |
| `sm8-195` | Shuckle-GX | Unimplemented Ability: Protective Shell |
| `sm8-196` | Sceptile-GX | Unimplemented attack: Leaf Cyclone; Unimplemented attack: Jungle Heal-GX |
| `sm8-197` | Virizion-GX | Unimplemented attack: Breeze Away-GX |
| `sm8-198` | Magcargo-GX | Unimplemented attack: Lava Flow; Unimplemented Ability: Crushing Charge |
| `sm8-199` | Blacephalon-GX | Unimplemented attack: Mind Blown; Unimplemented attack: Burst-GX |
| `sm8-200` | Suicune-GX | Unimplemented attack: Cure Stream; Unimplemented Ability: Phantom Winds |
| `sm8-201` | Zeraora-GX | Unimplemented attack: Full Voltage-GX; Unimplemented Ability: Thunderclap Zone |
| `sm8-202` | Sigilyph-GX | Unimplemented Ability: Mirror Counter |
| `sm8-203` | Tyranitar-GX | Unimplemented attack: Dusty Ruckus; Unimplemented Ability: Lost Out |
| `sm8-204` | Genesect-GX | Unimplemented Ability: Double Drive |
| `sm8-206` | Mimikyu-GX | Unimplemented attack: Dream Fear-GX |
| `sm8-207` | Lugia-GX | Unimplemented attack: Lost Purge-GX |
| `sm8-208` | Faba | Unimplemented Trainer effect |
| `sm8-210` | Kahili | Unimplemented Trainer effect |
| `sm8-211` | Mina | Unimplemented Trainer effect |
| `sm8-212` | Morty | Unimplemented Trainer effect |
| `sm8-214` | Whitney | Unimplemented Trainer effect |
| `sm8-215` | Shuckle-GX | Unimplemented Ability: Protective Shell |
| `sm8-216` | Sceptile-GX | Unimplemented attack: Leaf Cyclone; Unimplemented attack: Jungle Heal-GX |
| `sm8-217` | Virizion-GX | Unimplemented attack: Breeze Away-GX |
| `sm8-218` | Magcargo-GX | Unimplemented attack: Lava Flow; Unimplemented Ability: Crushing Charge |
| `sm8-219` | Blacephalon-GX | Unimplemented attack: Mind Blown; Unimplemented attack: Burst-GX |
| `sm8-220` | Suicune-GX | Unimplemented attack: Cure Stream; Unimplemented Ability: Phantom Winds |
| `sm8-221` | Zeraora-GX | Unimplemented attack: Full Voltage-GX; Unimplemented Ability: Thunderclap Zone |
| `sm8-222` | Sigilyph-GX | Unimplemented Ability: Mirror Counter |
| `sm8-223` | Tyranitar-GX | Unimplemented attack: Dusty Ruckus; Unimplemented Ability: Lost Out |
| `sm8-224` | Genesect-GX | Unimplemented Ability: Double Drive |
| `sm8-226` | Mimikyu-GX | Unimplemented attack: Dream Fear-GX |
| `sm8-227` | Lugia-GX | Unimplemented attack: Lost Purge-GX |
| `sm8-229` | Choice Helmet | Unimplemented Trainer effect |
| `sm8-230` | Counter Gain | Unimplemented Trainer effect |
| `sm8-231` | Custom Catcher | Unimplemented Trainer effect |
| `sm8-232` | Electropower | Unimplemented Trainer effect |
| `sm8-233` | Lost Blender | Unimplemented Trainer effect |
| `sm8-234` | Net Ball | Unimplemented Trainer effect |
| `sm8-235` | Spell Tag | Unimplemented Trainer effect |
| `sm8-236` | Wait and See Hammer | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
