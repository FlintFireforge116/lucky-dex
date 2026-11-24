# SM11 — whole-set gap ledger

Canonical prints: **261** | Playable: **137** | Gated: **124**
Printed attacks: **354** (281 distinct full signatures) | Abilities: **54** (39 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **2**
Canonical Git blob: `215307311fc5b7a4edc9d238d6bbc91ce62b3dbb`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **26 prints** — Unimplemented Trainer effect — sm11-186, sm11-187, sm11-188, sm11-190, sm11-193, sm11-194, sm11-195, sm11-196, sm11-197, sm11-199, sm11-201, sm11-203, sm11-205, sm11-206, sm11-206a, sm11-207 …
- **4 prints** — Unimplemented Special Energy rules — sm11-212, sm11-213, sm11-257, sm11-258
- **4 prints** — Unimplemented attack: Ditch and Splash — sm11-35, sm11-217, sm11-218, sm11-239
- **4 prints** — Unimplemented attack: Greedy Crush — sm11-126, sm11-225, sm11-226, sm11-245
- **4 prints** — Unimplemented attack: Super Growth — sm11-1, sm11-214, sm11-215, sm11-237
- **4 prints** — Unimplemented attack: Thrilling Times-GX — sm11-35, sm11-217, sm11-218, sm11-239
- **4 prints** — Unimplemented attack: Tropical Hour-GX — sm11-1, sm11-214, sm11-215, sm11-237
- **3 prints** — Unimplemented Ability: Burning Road — sm11-25, sm11-216, sm11-238
- **3 prints** — Unimplemented Ability: Captivating Wink — sm11-141, sm11-227, sm11-246
- **3 prints** — Unimplemented Ability: Perfection — sm11-71, sm11-222, sm11-242
- **3 prints** — Unimplemented Ability: Power Bind — sm11-78, sm11-223, sm11-243
- **3 prints** — Unimplemented Ability: Primal Winds — sm11-106, sm11-224, sm11-244
- **3 prints** — Unimplemented attack: Clear Vision-GX — sm11-78, sm11-223, sm11-243
- **3 prints** — Unimplemented attack: GG End-GX — sm11-146, sm11-228, sm11-247
- **3 prints** — Unimplemented attack: Injection-GX — sm11-160, sm11-230, sm11-249
- **3 prints** — Unimplemented attack: Mach Delivery-GX — sm11-152, sm11-229, sm11-248
- **2 prints** — Invalid effect: effect: invalid target filter key — sm11-204, sm11-236
- **2 prints** — Unimplemented Ability: Psychic Zone — sm11-79, sm11-79a
- **2 prints** — Unimplemented attack: Star Search — sm11-79, sm11-79a
- **1 prints** — Unimplemented Ability: Ancient Custom — sm11-45
- **1 prints** — Unimplemented Ability: Bursting Spores — sm11-14
- **1 prints** — Unimplemented Ability: Cellular Companions — sm11-124
- **1 prints** — Unimplemented Ability: Counterattack — sm11-170
- **1 prints** — Unimplemented Ability: Dimension Breach — sm11-86
- **1 prints** — Unimplemented Ability: Double Type — sm11-60
- **1 prints** — Unimplemented Ability: Drowsing — sm11-185
- **1 prints** — Unimplemented Ability: Durable Blade — sm11-95
- **1 prints** — Unimplemented Ability: Electric Swamp — sm11-66
- **1 prints** — Unimplemented Ability: Emergency Exit — sm11-51
- **1 prints** — Unimplemented Ability: Grind Up — sm11-156
- **1 prints** — Unimplemented Ability: Hurricane Charge — sm11-151
- **1 prints** — Unimplemented Ability: Ominous Posture — sm11-76
- **1 prints** — Unimplemented Ability: Prowl — sm11-144
- **1 prints** — Unimplemented Ability: Secret Territory — sm11-83
- **1 prints** — Unimplemented Ability: Shadow Connection — sm11-132
- **1 prints** — Unimplemented Ability: Snack Search — sm11-173
- **1 prints** — Unimplemented attack: Alert Headbutt — sm11-181
- **1 prints** — Unimplemented attack: Avenging Heart — sm11-184
- **1 prints** — Unimplemented attack: Boomburst — sm11-159
- **1 prints** — Unimplemented attack: Cavern Counter — sm11-122
- **1 prints** — Unimplemented attack: Cross Division-GX — sm11-72
- **1 prints** — Unimplemented attack: Discerning Spear — sm11-142
- **1 prints** — Unimplemented attack: Downburst — sm11-176
- **1 prints** — Unimplemented attack: Dynamic Swing — sm11-170
- **1 prints** — Unimplemented attack: Electro Rain — sm11-57
- **1 prints** — Unimplemented attack: Energy Arrow — sm11-153
- **1 prints** — Unimplemented attack: Future Sight — sm11-88
- **1 prints** — Unimplemented attack: Gigaton Shake — sm11-104
- **1 prints** — Unimplemented attack: Heavy Draw — sm11-161
- **1 prints** — Unimplemented attack: Last Scene — sm11-102
- **1 prints** — Unimplemented attack: Lazy Howl — sm11-167
- **1 prints** — Unimplemented attack: Live Wire — sm11-62
- **1 prints** — Unimplemented attack: Master Strike — sm11-110
- **1 prints** — Unimplemented attack: Meal Time — sm11-55
- **1 prints** — Unimplemented attack: Mysterious Noise — sm11-91
- **1 prints** — Unimplemented attack: Nature Wave — sm11-53
- **1 prints** — Unimplemented attack: Neon Trickery — sm11-40
- **1 prints** — Unimplemented attack: Over Slice — sm11-114
- **1 prints** — Unimplemented attack: Overspark — sm11-65
- **1 prints** — Unimplemented attack: Pure Power — sm11-110
- **1 prints** — Unimplemented attack: Raging Thunder — sm11-68
- **1 prints** — Unimplemented attack: Rest Well — sm11-89
- **1 prints** — Unimplemented attack: Rototiller — sm11-119
- **1 prints** — Unimplemented attack: Sage's Riddle — sm11-182
- **1 prints** — Unimplemented attack: Shadow Impact — sm11-139
- **1 prints** — Unimplemented attack: Spirit Burner — sm11-30
- **1 prints** — Unimplemented attack: Spirit Smash — sm11-75
- **1 prints** — Unimplemented attack: Spiteful Sigh — sm11-38
- **1 prints** — Unimplemented attack: Sticky Web — sm11-49
- **1 prints** — Unimplemented attack: Swarming Bites — sm11-43
- **1 prints** — Unimplemented attack: Tag Cheer — sm11-123
- **1 prints** — Unimplemented attack: Time Spiral — sm11-4
- **1 prints** — Unimplemented attack: Turf Raid — sm11-138
- **1 prints** — Unimplemented attack: Turn the Tables — sm11-107
- **1 prints** — Unimplemented attack: Victory Sign — sm11-26

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm11-1` | Rowlet & Alolan Exeggutor-GX | Unimplemented attack: Super Growth; Unimplemented attack: Tropical Hour-GX |
| `sm11-4` | Celebi | Unimplemented attack: Time Spiral |
| `sm11-14` | Amoonguss | Unimplemented Ability: Bursting Spores |
| `sm11-25` | Heatran-GX | Unimplemented Ability: Burning Road |
| `sm11-26` | Victini | Unimplemented attack: Victory Sign |
| `sm11-30` | Chandelure | Unimplemented attack: Spirit Burner |
| `sm11-35` | Slowpoke & Psyduck-GX | Unimplemented attack: Ditch and Splash; Unimplemented attack: Thrilling Times-GX |
| `sm11-38` | Froslass | Unimplemented attack: Spiteful Sigh |
| `sm11-40` | Lumineon | Unimplemented attack: Neon Trickery |
| `sm11-43` | Basculin | Unimplemented attack: Swarming Bites |
| `sm11-45` | Carracosta | Unimplemented Ability: Ancient Custom |
| `sm11-49` | Araquanid | Unimplemented attack: Sticky Web |
| `sm11-51` | Golisopod | Unimplemented Ability: Emergency Exit |
| `sm11-53` | Tapu Fini | Unimplemented attack: Nature Wave |
| `sm11-55` | Pikachu | Unimplemented attack: Meal Time |
| `sm11-57` | Alolan Raichu | Unimplemented attack: Electro Rain |
| `sm11-60` | Magnezone | Unimplemented Ability: Double Type |
| `sm11-62` | Galvantula | Unimplemented attack: Live Wire |
| `sm11-65` | Eelektrik | Unimplemented attack: Overspark |
| `sm11-66` | Eelektross | Unimplemented Ability: Electric Swamp |
| `sm11-68` | Thundurus | Unimplemented attack: Raging Thunder |
| `sm11-71` | Mewtwo & Mew-GX | Unimplemented Ability: Perfection |
| `sm11-72` | Espeon & Deoxys-GX | Unimplemented attack: Cross Division-GX |
| `sm11-75` | Alolan Marowak | Unimplemented attack: Spirit Smash |
| `sm11-76` | Jynx | Unimplemented Ability: Ominous Posture |
| `sm11-78` | Latios-GX | Unimplemented attack: Clear Vision-GX; Unimplemented Ability: Power Bind |
| `sm11-79` | Jirachi-GX | Unimplemented attack: Star Search; Unimplemented Ability: Psychic Zone |
| `sm11-79a` | Jirachi-GX | Unimplemented attack: Star Search; Unimplemented Ability: Psychic Zone |
| `sm11-83` | Uxie | Unimplemented Ability: Secret Territory |
| `sm11-86` | Giratina | Unimplemented Ability: Dimension Breach |
| `sm11-88` | Munna | Unimplemented attack: Future Sight |
| `sm11-89` | Musharna | Unimplemented attack: Rest Well |
| `sm11-91` | Beheeyem | Unimplemented attack: Mysterious Noise |
| `sm11-95` | Aegislash | Unimplemented Ability: Durable Blade |
| `sm11-102` | Poipole | Unimplemented attack: Last Scene |
| `sm11-104` | Steelix | Unimplemented attack: Gigaton Shake |
| `sm11-106` | Aerodactyl-GX | Unimplemented Ability: Primal Winds |
| `sm11-107` | Heracross | Unimplemented attack: Turn the Tables |
| `sm11-110` | Medicham | Unimplemented attack: Pure Power; Unimplemented attack: Master Strike |
| `sm11-114` | Garchomp | Unimplemented attack: Over Slice |
| `sm11-119` | Excadrill | Unimplemented attack: Rototiller |
| `sm11-122` | Terrakion | Unimplemented attack: Cavern Counter |
| `sm11-123` | Meloetta | Unimplemented attack: Tag Cheer |
| `sm11-124` | Zygarde | Unimplemented Ability: Cellular Companions |
| `sm11-126` | Mega Sableye & Tyranitar-GX | Unimplemented attack: Greedy Crush |
| `sm11-132` | Weavile-GX | Unimplemented Ability: Shadow Connection |
| `sm11-138` | Scrafty | Unimplemented attack: Turf Raid |
| `sm11-139` | Yveltal | Unimplemented attack: Shadow Impact |
| `sm11-141` | Mawile-GX | Unimplemented Ability: Captivating Wink |
| `sm11-142` | Escavalier | Unimplemented attack: Discerning Spear |
| `sm11-144` | Whimsicott | Unimplemented Ability: Prowl |
| `sm11-146` | Garchomp & Giratina-GX | Unimplemented attack: GG End-GX |
| `sm11-151` | Dragonite | Unimplemented Ability: Hurricane Charge |
| `sm11-152` | Dragonite-GX | Unimplemented attack: Mach Delivery-GX |
| `sm11-153` | Latias | Unimplemented attack: Energy Arrow |
| `sm11-156` | Haxorus | Unimplemented Ability: Grind Up |
| `sm11-159` | Noivern | Unimplemented attack: Boomburst |
| `sm11-160` | Naganadel-GX | Unimplemented attack: Injection-GX |
| `sm11-161` | Lickitung | Unimplemented attack: Heavy Draw |
| `sm11-167` | Slakoth | Unimplemented attack: Lazy Howl |
| `sm11-170` | Slaking | Unimplemented attack: Dynamic Swing; Unimplemented Ability: Counterattack |
| `sm11-173` | Munchlax | Unimplemented Ability: Snack Search |
| `sm11-176` | Unfezant | Unimplemented attack: Downburst |
| `sm11-181` | Gumshoos | Unimplemented attack: Alert Headbutt |
| `sm11-182` | Oranguru | Unimplemented attack: Sage's Riddle |
| `sm11-184` | Silvally | Unimplemented attack: Avenging Heart |
| `sm11-185` | Komala | Unimplemented Ability: Drowsing |
| `sm11-186` | Blaine's Quiz Show | Unimplemented Trainer effect |
| `sm11-187` | Blizzard Town | Unimplemented Trainer effect |
| `sm11-188` | Blue's Tactics | Unimplemented Trainer effect |
| `sm11-190` | Channeler | Unimplemented Trainer effect |
| `sm11-193` | Dark City | Unimplemented Trainer effect |
| `sm11-194` | Ear-Ringing Bell | Unimplemented Trainer effect |
| `sm11-195` | Flyinium Z: Air Slash | Unimplemented Trainer effect |
| `sm11-196` | Giant Bomb | Unimplemented Trainer effect |
| `sm11-197` | Giant Hearth | Unimplemented Trainer effect |
| `sm11-199` | Grimsley | Unimplemented Trainer effect |
| `sm11-201` | Karate Belt | Unimplemented Trainer effect |
| `sm11-203` | Normalium Z: Tackle | Unimplemented Trainer effect |
| `sm11-204` | Poké Maniac | Invalid effect: effect: invalid target filter key |
| `sm11-205` | Pokémon Research Lab | Unimplemented Trainer effect |
| `sm11-206` | Reset Stamp | Unimplemented Trainer effect |
| `sm11-206a` | Reset Stamp | Unimplemented Trainer effect |
| `sm11-207` | Slumbering Forest | Unimplemented Trainer effect |
| `sm11-209` | Tag Switch | Unimplemented Trainer effect |
| `sm11-211` | U-Turn Board | Unimplemented Trainer effect |
| `sm11-212` | Recycle Energy | Unimplemented Special Energy rules |
| `sm11-213` | Weakness Guard Energy | Unimplemented Special Energy rules |
| `sm11-214` | Rowlet & Alolan Exeggutor-GX | Unimplemented attack: Super Growth; Unimplemented attack: Tropical Hour-GX |
| `sm11-215` | Rowlet & Alolan Exeggutor-GX | Unimplemented attack: Super Growth; Unimplemented attack: Tropical Hour-GX |
| `sm11-216` | Heatran-GX | Unimplemented Ability: Burning Road |
| `sm11-217` | Slowpoke & Psyduck-GX | Unimplemented attack: Ditch and Splash; Unimplemented attack: Thrilling Times-GX |
| `sm11-218` | Slowpoke & Psyduck-GX | Unimplemented attack: Ditch and Splash; Unimplemented attack: Thrilling Times-GX |
| `sm11-222` | Mewtwo & Mew-GX | Unimplemented Ability: Perfection |
| `sm11-223` | Latios-GX | Unimplemented attack: Clear Vision-GX; Unimplemented Ability: Power Bind |
| `sm11-224` | Aerodactyl-GX | Unimplemented Ability: Primal Winds |
| `sm11-225` | Mega Sableye & Tyranitar-GX | Unimplemented attack: Greedy Crush |
| `sm11-226` | Mega Sableye & Tyranitar-GX | Unimplemented attack: Greedy Crush |
| `sm11-227` | Mawile-GX | Unimplemented Ability: Captivating Wink |
| `sm11-228` | Garchomp & Giratina-GX | Unimplemented attack: GG End-GX |
| `sm11-229` | Dragonite-GX | Unimplemented attack: Mach Delivery-GX |
| `sm11-230` | Naganadel-GX | Unimplemented attack: Injection-GX |
| `sm11-231` | Blue's Tactics | Unimplemented Trainer effect |
| `sm11-232` | Channeler | Unimplemented Trainer effect |
| `sm11-234` | Grimsley | Unimplemented Trainer effect |
| `sm11-236` | Poké Maniac | Invalid effect: effect: invalid target filter key |
| `sm11-237` | Rowlet & Alolan Exeggutor-GX | Unimplemented attack: Super Growth; Unimplemented attack: Tropical Hour-GX |
| `sm11-238` | Heatran-GX | Unimplemented Ability: Burning Road |
| `sm11-239` | Slowpoke & Psyduck-GX | Unimplemented attack: Ditch and Splash; Unimplemented attack: Thrilling Times-GX |
| `sm11-242` | Mewtwo & Mew-GX | Unimplemented Ability: Perfection |
| `sm11-243` | Latios-GX | Unimplemented attack: Clear Vision-GX; Unimplemented Ability: Power Bind |
| `sm11-244` | Aerodactyl-GX | Unimplemented Ability: Primal Winds |
| `sm11-245` | Mega Sableye & Tyranitar-GX | Unimplemented attack: Greedy Crush |
| `sm11-246` | Mawile-GX | Unimplemented Ability: Captivating Wink |
| `sm11-247` | Garchomp & Giratina-GX | Unimplemented attack: GG End-GX |
| `sm11-248` | Dragonite-GX | Unimplemented attack: Mach Delivery-GX |
| `sm11-249` | Naganadel-GX | Unimplemented attack: Injection-GX |
| `sm11-251` | Giant Bomb | Unimplemented Trainer effect |
| `sm11-252` | Karate Belt | Unimplemented Trainer effect |
| `sm11-253` | Reset Stamp | Unimplemented Trainer effect |
| `sm11-254` | Tag Switch | Unimplemented Trainer effect |
| `sm11-255` | U-Turn Board | Unimplemented Trainer effect |
| `sm11-257` | Recycle Energy | Unimplemented Special Energy rules |
| `sm11-258` | Weakness Guard Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
