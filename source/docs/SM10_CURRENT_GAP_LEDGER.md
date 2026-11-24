# SM10 — whole-set gap ledger

Canonical prints: **238** | Playable: **105** | Gated: **133**
Printed attacks: **338** (250 distinct full signatures) | Abilities: **53** (41 distinct signatures)
Trainer rule signatures: **26** | Special Energy rule signatures: **1**
Canonical Git blob: `2293c98b7086a4137928be1fa358ccad9209d006`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **29 prints** — Unimplemented Trainer effect — sm10-164, sm10-165, sm10-166, sm10-167, sm10-168, sm10-169, sm10-170, sm10-171, sm10-174, sm10-175, sm10-178, sm10-179, sm10-180, sm10-181, sm10-183, sm10-184 …
- **4 prints** — Unimplemented Ability: Dedechange — sm10-57, sm10-195, sm10-195a, sm10-219
- **4 prints** — Unimplemented attack: Beast Game-GX — sm10-1, sm10-191, sm10-192, sm10-215
- **4 prints** — Unimplemented attack: Dark Union-GX — sm10-107, sm10-200, sm10-201, sm10-222
- **4 prints** — Unimplemented attack: Elegant Sole — sm10-1, sm10-191, sm10-192, sm10-215
- **4 prints** — Unimplemented attack: Fairy Song — sm10-130, sm10-204, sm10-205, sm10-225
- **4 prints** — Unimplemented attack: Kaleidostorm — sm10-130, sm10-204, sm10-205, sm10-225
- **4 prints** — Unimplemented attack: Tingly Return-GX — sm10-57, sm10-195, sm10-195a, sm10-219
- **3 prints** — Unimplemented Ability: Cat Walk — sm10-149, sm10-207, sm10-227
- **3 prints** — Unimplemented Ability: Force Canceler — sm10-163, sm10-208, sm10-228
- **3 prints** — Unimplemented Ability: Ruler of the Night — sm10-109, sm10-202, sm10-223
- **3 prints** — Unimplemented attack: Discovery-GX — sm10-163, sm10-208, sm10-228
- **3 prints** — Unimplemented attack: Feather Storm — sm10-109, sm10-202, sm10-223
- **3 prints** — Unimplemented attack: Full Metal Wall-GX — sm10-120, sm10-203, sm10-224
- **3 prints** — Unimplemented attack: Shinobi Mastery — sm10-12, sm10-193, sm10-216
- **3 prints** — Unimplemented attack: Unfair-GX — sm10-109, sm10-202, sm10-223
- **2 prints** — Unimplemented Special Energy rules — sm10-190, sm10-234
- **2 prints** — Unimplemented attack: Giant Geyser-GX — sm10-35, sm10-218
- **2 prints** — Unimplemented attack: Rocket Splash — sm10-35, sm10-218
- **1 prints** — Unimplemented Ability: Battery — sm10-58
- **1 prints** — Unimplemented Ability: Bench Barrier — sm10-76
- **1 prints** — Unimplemented Ability: Bratty Kick — sm10-100
- **1 prints** — Unimplemented Ability: Crazy Code — sm10-157
- **1 prints** — Unimplemented Ability: Detention Gas — sm10-74
- **1 prints** — Unimplemented Ability: Emerge — sm10-3
- **1 prints** — Unimplemented Ability: Excitable Draw — sm10-131
- **1 prints** — Unimplemented Ability: Fairy Feast — sm10-138
- **1 prints** — Unimplemented Ability: Fast-Flight Configuration — sm10-127
- **1 prints** — Unimplemented Ability: Gathering of Cats — sm10-148
- **1 prints** — Unimplemented Ability: Greedy Evolution — sm10-111
- **1 prints** — Unimplemented Ability: Hypnotic Pendulum — sm10-72
- **1 prints** — Unimplemented Ability: Intimidating Fang — sm10-113
- **1 prints** — Unimplemented Ability: Irresistible Aroma — sm10-7
- **1 prints** — Unimplemented Ability: Lazy Eating — sm10-158
- **1 prints** — Unimplemented Ability: Metal Eater — sm10-129
- **1 prints** — Unimplemented Ability: Mind Report — sm10-75
- **1 prints** — Unimplemented Ability: Mysterious Message — sm10-78
- **1 prints** — Unimplemented Ability: Playhouse Heal — sm10-161
- **1 prints** — Unimplemented Ability: Pupate — sm10-2
- **1 prints** — Unimplemented Ability: Resetting Hole — sm10-81
- **1 prints** — Unimplemented Ability: Roast Reveal — sm10-31
- **1 prints** — Unimplemented Ability: Round ‘n' Round — sm10-36
- **1 prints** — Unimplemented Ability: Shadow Pain — sm10-70
- **1 prints** — Unimplemented Ability: Sound Veil — sm10-66
- **1 prints** — Unimplemented Ability: Stealthy Body — sm10-59
- **1 prints** — Unimplemented Ability: Strong Cheer — sm10-29
- **1 prints** — Unimplemented Ability: Swelling Spite — sm10-67
- **1 prints** — Unimplemented Ability: Underground Work — sm10-85
- **1 prints** — Unimplemented Ability: Varied Pollen — sm10-8
- **1 prints** — Unimplemented Ability: Wall of Stone — sm10-106
- **1 prints** — Unimplemented attack: Afterimage Strike — sm10-52
- **1 prints** — Unimplemented attack: Big Counter — sm10-158
- **1 prints** — Unimplemented attack: Blazer — sm10-32
- **1 prints** — Unimplemented attack: Boing Boing Tail — sm10-159
- **1 prints** — Unimplemented attack: Bring Down — sm10-117
- **1 prints** — Unimplemented attack: Bubble Jutsu — sm10-40
- **1 prints** — Unimplemented attack: Daunt — sm10-136
- **1 prints** — Unimplemented attack: Digicharge — sm10-154
- **1 prints** — Unimplemented attack: Dirty Work — sm10-94
- **1 prints** — Unimplemented attack: Discharge — sm10-60
- **1 prints** — Unimplemented attack: Ear Kinesis — sm10-79
- **1 prints** — Unimplemented attack: Eat Up — sm10-153
- **1 prints** — Unimplemented attack: Electric Trap — sm10-56
- **1 prints** — Unimplemented attack: Electricannon — sm10-59
- **1 prints** — Unimplemented attack: Energy Present — sm10-137
- **1 prints** — Unimplemented attack: Enhanced Horn — sm10-49
- **1 prints** — Unimplemented attack: Extra-Tight Press — sm10-125
- **1 prints** — Unimplemented attack: False Swipe — sm10-19
- **1 prints** — Unimplemented attack: Fight Alone — sm10-105
- **1 prints** — Unimplemented attack: Finishing Combo — sm10-101
- **1 prints** — Unimplemented attack: Fireball Circus — sm10-32
- **1 prints** — Unimplemented attack: Flare Starter — sm10-25
- **1 prints** — Unimplemented attack: Focus Energy — sm10-90
- **1 prints** — Unimplemented attack: Gastro Acid — sm10-15
- **1 prints** — Unimplemented attack: Grandiose Fangs — sm10-114
- **1 prints** — Unimplemented attack: Grass Fire — sm10-30
- **1 prints** — Unimplemented attack: Heavy Choke — sm10-63
- **1 prints** — Unimplemented attack: Heavy Slam — sm10-89
- **1 prints** — Unimplemented attack: High-Heat Blast — sm10-25
- **1 prints** — Unimplemented attack: Hypnotic Reign — sm10-119
- **1 prints** — Unimplemented attack: Miraculous Cologne — sm10-142
- **1 prints** — Unimplemented attack: Moon-Watching Dance — sm10-133
- **1 prints** — Unimplemented attack: Never Give Up — sm10-55
- **1 prints** — Unimplemented attack: Perplexing Eyes — sm10-80
- **1 prints** — Unimplemented attack: Psypower — sm10-76
- **1 prints** — Unimplemented attack: Pungent Aroma — sm10-142
- **1 prints** — Unimplemented attack: Raging Thunder — sm10-56
- **1 prints** — Unimplemented attack: Rush Up — sm10-126
- **1 prints** — Unimplemented attack: Shinobi Strike — sm10-98
- **1 prints** — Unimplemented attack: Sinister Fog — sm10-69
- **1 prints** — Unimplemented attack: Splattering Sludge — sm10-74
- **1 prints** — Unimplemented attack: Stray Cat Dash — sm10-160
- **1 prints** — Unimplemented attack: Surprise Fist — sm10-53
- **1 prints** — Unimplemented attack: Three Strikes — sm10-43
- **1 prints** — Unimplemented attack: Top Down — sm10-106
- **1 prints** — Unimplemented attack: Triple Charge — sm10-4
- **1 prints** — Unimplemented attack: Wicked Tentacles — sm10-41

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm10-1` | Pheromosa & Buzzwole-GX | Unimplemented attack: Elegant Sole; Unimplemented attack: Beast Game-GX |
| `sm10-2` | Caterpie | Unimplemented Ability: Pupate |
| `sm10-3` | Metapod | Unimplemented Ability: Emerge |
| `sm10-4` | Butterfree | Unimplemented attack: Triple Charge |
| `sm10-7` | Gloom | Unimplemented Ability: Irresistible Aroma |
| `sm10-8` | Vileplume | Unimplemented Ability: Varied Pollen |
| `sm10-12` | Venomoth-GX | Unimplemented attack: Shinobi Mastery |
| `sm10-15` | Victreebel | Unimplemented attack: Gastro Acid |
| `sm10-19` | Kartana | Unimplemented attack: False Swipe |
| `sm10-25` | Volcanion | Unimplemented attack: Flare Starter; Unimplemented attack: High-Heat Blast |
| `sm10-29` | Incineroar | Unimplemented Ability: Strong Cheer |
| `sm10-30` | Salandit | Unimplemented attack: Grass Fire |
| `sm10-31` | Salazzle | Unimplemented Ability: Roast Reveal |
| `sm10-32` | Blacephalon | Unimplemented attack: Blazer; Unimplemented attack: Fireball Circus |
| `sm10-35` | Blastoise-GX | Unimplemented attack: Rocket Splash; Unimplemented attack: Giant Geyser-GX |
| `sm10-36` | Poliwag | Unimplemented Ability: Round ‘n' Round |
| `sm10-40` | Tentacool | Unimplemented attack: Bubble Jutsu |
| `sm10-41` | Tentacruel | Unimplemented attack: Wicked Tentacles |
| `sm10-43` | Slowbro | Unimplemented attack: Three Strikes |
| `sm10-49` | Seaking | Unimplemented attack: Enhanced Horn |
| `sm10-52` | Frogadier | Unimplemented attack: Afterimage Strike |
| `sm10-53` | Pyukumuku | Unimplemented attack: Surprise Fist |
| `sm10-55` | Raichu | Unimplemented attack: Never Give Up |
| `sm10-56` | Stunfisk | Unimplemented attack: Raging Thunder; Unimplemented attack: Electric Trap |
| `sm10-57` | Dedenne-GX | Unimplemented attack: Tingly Return-GX; Unimplemented Ability: Dedechange |
| `sm10-58` | Charjabug | Unimplemented Ability: Battery |
| `sm10-59` | Vikavolt | Unimplemented attack: Electricannon; Unimplemented Ability: Stealthy Body |
| `sm10-60` | Zeraora | Unimplemented attack: Discharge |
| `sm10-63` | Arbok | Unimplemented attack: Heavy Choke |
| `sm10-66` | Crobat | Unimplemented Ability: Sound Veil |
| `sm10-67` | Gastly | Unimplemented Ability: Swelling Spite |
| `sm10-69` | Haunter | Unimplemented attack: Sinister Fog |
| `sm10-70` | Gengar | Unimplemented Ability: Shadow Pain |
| `sm10-72` | Hypno | Unimplemented Ability: Hypnotic Pendulum |
| `sm10-74` | Weezing | Unimplemented attack: Splattering Sludge; Unimplemented Ability: Detention Gas |
| `sm10-75` | Mewtwo | Unimplemented Ability: Mind Report |
| `sm10-76` | Mew | Unimplemented attack: Psypower; Unimplemented Ability: Bench Barrier |
| `sm10-78` | Mismagius | Unimplemented Ability: Mysterious Message |
| `sm10-79` | Espurr | Unimplemented attack: Ear Kinesis |
| `sm10-80` | Meowstic | Unimplemented attack: Perplexing Eyes |
| `sm10-81` | Marshadow | Unimplemented Ability: Resetting Hole |
| `sm10-85` | Diglett | Unimplemented Ability: Underground Work |
| `sm10-89` | Golem | Unimplemented attack: Heavy Slam |
| `sm10-90` | Cubone | Unimplemented attack: Focus Energy |
| `sm10-94` | Rhydon | Unimplemented attack: Dirty Work |
| `sm10-98` | Gligar | Unimplemented attack: Shinobi Strike |
| `sm10-100` | Tyrogue | Unimplemented Ability: Bratty Kick |
| `sm10-101` | Hitmontop | Unimplemented attack: Finishing Combo |
| `sm10-105` | Crabominable | Unimplemented attack: Fight Alone |
| `sm10-106` | Stakataka | Unimplemented attack: Top Down; Unimplemented Ability: Wall of Stone |
| `sm10-107` | Greninja & Zoroark-GX | Unimplemented attack: Dark Union-GX |
| `sm10-109` | Honchkrow-GX | Unimplemented attack: Feather Storm; Unimplemented attack: Unfair-GX; Unimplemented Ability: Ruler of the Night |
| `sm10-111` | Sharpedo | Unimplemented Ability: Greedy Evolution |
| `sm10-113` | Sandile | Unimplemented Ability: Intimidating Fang |
| `sm10-114` | Sandile | Unimplemented attack: Grandiose Fangs |
| `sm10-117` | Greninja | Unimplemented attack: Bring Down |
| `sm10-119` | Malamar | Unimplemented attack: Hypnotic Reign |
| `sm10-120` | Lucario & Melmetal-GX | Unimplemented attack: Full Metal Wall-GX |
| `sm10-125` | Aggron | Unimplemented attack: Extra-Tight Press |
| `sm10-126` | Lucario | Unimplemented attack: Rush Up |
| `sm10-127` | Genesect | Unimplemented Ability: Fast-Flight Configuration |
| `sm10-129` | Melmetal | Unimplemented Ability: Metal Eater |
| `sm10-130` | Gardevoir & Sylveon-GX | Unimplemented attack: Fairy Song; Unimplemented attack: Kaleidostorm |
| `sm10-131` | Cleffa | Unimplemented Ability: Excitable Draw |
| `sm10-133` | Clefable | Unimplemented attack: Moon-Watching Dance |
| `sm10-136` | Togepi | Unimplemented attack: Daunt |
| `sm10-137` | Togetic | Unimplemented attack: Energy Present |
| `sm10-138` | Togekiss | Unimplemented Ability: Fairy Feast |
| `sm10-142` | Aromatisse | Unimplemented attack: Pungent Aroma; Unimplemented attack: Miraculous Cologne |
| `sm10-148` | Persian | Unimplemented Ability: Gathering of Cats |
| `sm10-149` | Persian-GX | Unimplemented Ability: Cat Walk |
| `sm10-153` | Lickilicky | Unimplemented attack: Eat Up |
| `sm10-154` | Porygon | Unimplemented attack: Digicharge |
| `sm10-157` | Porygon-Z | Unimplemented Ability: Crazy Code |
| `sm10-158` | Snorlax | Unimplemented attack: Big Counter; Unimplemented Ability: Lazy Eating |
| `sm10-159` | Glameow | Unimplemented attack: Boing Boing Tail |
| `sm10-160` | Purugly | Unimplemented attack: Stray Cat Dash |
| `sm10-161` | Happiny | Unimplemented Ability: Playhouse Heal |
| `sm10-163` | Celesteela-GX | Unimplemented attack: Discovery-GX; Unimplemented Ability: Force Canceler |
| `sm10-164` | Beast Bringer | Unimplemented Trainer effect |
| `sm10-165` | Chip-Chip Ice Axe | Unimplemented Trainer effect |
| `sm10-166` | Devolution Spray Z | Unimplemented Trainer effect |
| `sm10-167` | Dusk Stone | Unimplemented Trainer effect |
| `sm10-168` | Dust Island | Unimplemented Trainer effect |
| `sm10-169` | Electromagnetic Radar | Unimplemented Trainer effect |
| `sm10-170` | Energy Spinner | Unimplemented Trainer effect |
| `sm10-171` | Fairy Charm Ability | Unimplemented Trainer effect |
| `sm10-174` | Giovanni's Exile | Unimplemented Trainer effect |
| `sm10-175` | Green's Exploration | Unimplemented Trainer effect |
| `sm10-178` | Lt. Surge's Strategy | Unimplemented Trainer effect |
| `sm10-179` | Martial Arts Dojo | Unimplemented Trainer effect |
| `sm10-180` | Metal Core Barrier | Unimplemented Trainer effect |
| `sm10-181` | Molayne | Unimplemented Trainer effect |
| `sm10-183` | Power Plant | Unimplemented Trainer effect |
| `sm10-184` | Red's Challenge | Unimplemented Trainer effect |
| `sm10-185` | Samson Oak | Unimplemented Trainer effect |
| `sm10-186` | Stealthy Hood | Unimplemented Trainer effect |
| `sm10-187` | Surprise Box | Unimplemented Trainer effect |
| `sm10-188` | Ultra Forest Kartenvoy | Unimplemented Trainer effect |
| `sm10-189` | Welder | Unimplemented Trainer effect |
| `sm10-189a` | Welder | Unimplemented Trainer effect |
| `sm10-190` | Triple Acceleration Energy | Unimplemented Special Energy rules |
| `sm10-191` | Pheromosa & Buzzwole-GX | Unimplemented attack: Elegant Sole; Unimplemented attack: Beast Game-GX |
| `sm10-192` | Pheromosa & Buzzwole-GX | Unimplemented attack: Elegant Sole; Unimplemented attack: Beast Game-GX |
| `sm10-193` | Venomoth-GX | Unimplemented attack: Shinobi Mastery |
| `sm10-195` | Dedenne-GX | Unimplemented attack: Tingly Return-GX; Unimplemented Ability: Dedechange |
| `sm10-195a` | Dedenne-GX | Unimplemented attack: Tingly Return-GX; Unimplemented Ability: Dedechange |
| `sm10-200` | Greninja & Zoroark-GX | Unimplemented attack: Dark Union-GX |
| `sm10-201` | Greninja & Zoroark-GX | Unimplemented attack: Dark Union-GX |
| `sm10-202` | Honchkrow-GX | Unimplemented attack: Feather Storm; Unimplemented attack: Unfair-GX; Unimplemented Ability: Ruler of the Night |
| `sm10-203` | Lucario & Melmetal-GX | Unimplemented attack: Full Metal Wall-GX |
| `sm10-204` | Gardevoir & Sylveon-GX | Unimplemented attack: Fairy Song; Unimplemented attack: Kaleidostorm |
| `sm10-205` | Gardevoir & Sylveon-GX | Unimplemented attack: Fairy Song; Unimplemented attack: Kaleidostorm |
| `sm10-207` | Persian-GX | Unimplemented Ability: Cat Walk |
| `sm10-208` | Celesteela-GX | Unimplemented attack: Discovery-GX; Unimplemented Ability: Force Canceler |
| `sm10-209` | Green's Exploration | Unimplemented Trainer effect |
| `sm10-212` | Molayne | Unimplemented Trainer effect |
| `sm10-213` | Red's Challenge | Unimplemented Trainer effect |
| `sm10-214` | Welder | Unimplemented Trainer effect |
| `sm10-215` | Pheromosa & Buzzwole-GX | Unimplemented attack: Elegant Sole; Unimplemented attack: Beast Game-GX |
| `sm10-216` | Venomoth-GX | Unimplemented attack: Shinobi Mastery |
| `sm10-218` | Blastoise-GX | Unimplemented attack: Rocket Splash; Unimplemented attack: Giant Geyser-GX |
| `sm10-219` | Dedenne-GX | Unimplemented attack: Tingly Return-GX; Unimplemented Ability: Dedechange |
| `sm10-222` | Greninja & Zoroark-GX | Unimplemented attack: Dark Union-GX |
| `sm10-223` | Honchkrow-GX | Unimplemented attack: Feather Storm; Unimplemented attack: Unfair-GX; Unimplemented Ability: Ruler of the Night |
| `sm10-224` | Lucario & Melmetal-GX | Unimplemented attack: Full Metal Wall-GX |
| `sm10-225` | Gardevoir & Sylveon-GX | Unimplemented attack: Fairy Song; Unimplemented attack: Kaleidostorm |
| `sm10-227` | Persian-GX | Unimplemented Ability: Cat Walk |
| `sm10-228` | Celesteela-GX | Unimplemented attack: Discovery-GX; Unimplemented Ability: Force Canceler |
| `sm10-229` | Beast Bringer | Unimplemented Trainer effect |
| `sm10-230` | Electromagnetic Radar | Unimplemented Trainer effect |
| `sm10-232` | Metal Core Barrier | Unimplemented Trainer effect |
| `sm10-234` | Triple Acceleration Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
