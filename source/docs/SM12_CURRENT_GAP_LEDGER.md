# SM12 — whole-set gap ledger

Canonical prints: **272** | Playable: **139** | Gated: **133**
Printed attacks: **376** (287 distinct full signatures) | Abilities: **64** (41 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **1**
Canonical Git blob: `e916e382122f759e4904762acd59b0d3a69a1bd1`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **35 prints** — Unimplemented Trainer effect — sm12-185, sm12-186, sm12-187, sm12-188, sm12-189, sm12-190, sm12-191, sm12-192, sm12-193, sm12-194, sm12-195, sm12-196, sm12-197, sm12-198, sm12-199, sm12-200 …
- **4 prints** — Unimplemented Ability: Violent Appetite — sm12-158, sm12-223, sm12-224, sm12-260
- **4 prints** — Unimplemented attack: Altered Creation-GX — sm12-156, sm12-220, sm12-221, sm12-258
- **4 prints** — Unimplemented attack: Bubble Launcher-GX — sm12-38, sm12-214, sm12-215, sm12-253
- **4 prints** — Unimplemented attack: Chaotic Order-GX — sm12-158, sm12-223, sm12-224, sm12-260
- **4 prints** — Unimplemented attack: Splash Maker — sm12-38, sm12-214, sm12-215, sm12-253
- **4 prints** — Unimplemented attack: Ultimate Ray — sm12-156, sm12-220, sm12-221, sm12-258
- **3 prints** — Unimplemented Ability: Blow-Away Bomb — sm12-76, sm12-77, sm12-243
- **3 prints** — Unimplemented Ability: Dance of Tribute — sm12-95, sm12-217, sm12-255
- **3 prints** — Unimplemented Ability: Flaming Shot — sm12-35, sm12-213, sm12-252
- **3 prints** — Unimplemented Ability: Shining Vine — sm12-1, sm12-210, sm12-249
- **3 prints** — Unimplemented Ability: Smug Face — sm12-129, sm12-219, sm12-257
- **3 prints** — Unimplemented attack: Backfire — sm12-35, sm12-213, sm12-252
- **3 prints** — Unimplemented attack: Crimson Flame Pillar-GX — sm12-22, sm12-212, sm12-251
- **3 prints** — Unimplemented attack: Cross Break-GX — sm12-157, sm12-222, sm12-259
- **3 prints** — Unimplemented attack: Fabled Flarebolts — sm12-157, sm12-222, sm12-259
- **3 prints** — Unimplemented attack: Light of the Protector-GX — sm12-75, sm12-216, sm12-254
- **3 prints** — Unimplemented attack: Massive Heat Wave-GX — sm12-35, sm12-213, sm12-252
- **3 prints** — Unimplemented attack: Solar Plant-GX — sm12-1, sm12-210, sm12-249
- **2 prints** — Unimplemented Ability: Arf Arf Bark — sm12-176, sm12-248
- **2 prints** — Unimplemented Ability: Flower Picking — sm12-151, sm12-152
- **2 prints** — Unimplemented Ability: Scatter — sm12-62, sm12-240
- **2 prints** — Unimplemented Special Energy rules — sm12-209, sm12-271
- **2 prints** — Unimplemented attack: Eleventh Hour Tackle — sm12-115, sm12-246
- **2 prints** — Unimplemented attack: Fire Fling — sm12-29, sm12-237
- **2 prints** — Unimplemented attack: Impersonation — sm12-96, sm12-245
- **2 prints** — Unimplemented attack: Kindle — sm12-29, sm12-237
- **2 prints** — Unimplemented attack: Mischievous Hands — sm12-96, sm12-245
- **2 prints** — Unimplemented attack: Supreme Puff-GX — sm12-143, sm12-143a
- **1 prints** — Unimplemented Ability: Armor of the Sunne — sm12-142
- **1 prints** — Unimplemented Ability: Beast Boost — sm12-21
- **1 prints** — Unimplemented Ability: Blessing of the Moone — sm12-102
- **1 prints** — Unimplemented Ability: Blinking Lights — sm12-72
- **1 prints** — Unimplemented Ability: Bulldoze — sm12-117
- **1 prints** — Unimplemented Ability: Call Signal — sm12-69
- **1 prints** — Unimplemented Ability: Explosive Fire Dance — sm12-33
- **1 prints** — Unimplemented Ability: Fighter's Roar — sm12-162
- **1 prints** — Unimplemented Ability: Grim Marking — sm12-85
- **1 prints** — Unimplemented Ability: Growing Up — sm12-146
- **1 prints** — Unimplemented Ability: Obnoxious Whirring — sm12-109
- **1 prints** — Unimplemented Ability: Power Cheer — sm12-25
- **1 prints** — Unimplemented Ability: Scampering Tail — sm12-169
- **1 prints** — Unimplemented Ability: Shadow Box — sm12-97
- **1 prints** — Unimplemented Ability: Speed Cheer — sm12-70
- **1 prints** — Unimplemented Ability: Spiritborne Evolution — sm12-83
- **1 prints** — Unimplemented Ability: Swaying Strangle — sm12-11
- **1 prints** — Unimplemented Ability: Vitality Cheer — sm12-42
- **1 prints** — Unimplemented Ability: Whirlpool Suction — sm12-57
- **1 prints** — Unimplemented attack: Bag Slash — sm12-134
- **1 prints** — Unimplemented attack: Balloon Burst — sm12-77
- **1 prints** — Unimplemented attack: Beloved Pulse — sm12-155
- **1 prints** — Unimplemented attack: Charming Stamp — sm12-88
- **1 prints** — Unimplemented attack: Cold Snap — sm12-52
- **1 prints** — Unimplemented attack: Cycle Draw — sm12-86
- **1 prints** — Unimplemented attack: Destructive Drake-GX — sm12-190
- **1 prints** — Unimplemented attack: Dirty Throw — sm12-133
- **1 prints** — Unimplemented attack: Doll Swap — sm12-144
- **1 prints** — Unimplemented attack: Drought — sm12-113
- **1 prints** — Unimplemented attack: Dual Calling — sm12-140
- **1 prints** — Unimplemented attack: Energy Assist — sm12-86
- **1 prints** — Unimplemented attack: Energy Loop — sm12-41
- **1 prints** — Unimplemented attack: Fireworks Bomb — sm12-104
- **1 prints** — Unimplemented attack: Fist of Antiquity — sm12-90
- **1 prints** — Unimplemented attack: Future Sight — sm12-78
- **1 prints** — Unimplemented attack: Life Drain — sm12-79
- **1 prints** — Unimplemented attack: Liquidation — sm12-65
- **1 prints** — Unimplemented attack: Massive Catch-GX — sm12-63
- **1 prints** — Unimplemented attack: Moonblast — sm12-155
- **1 prints** — Unimplemented attack: Ominous Eyes — sm12-83
- **1 prints** — Unimplemented attack: Ominous News — sm12-133
- **1 prints** — Unimplemented attack: Perplexing Forest — sm12-94
- **1 prints** — Unimplemented attack: Poison Cultivation — sm12-92
- **1 prints** — Unimplemented attack: Recall — sm12-56
- **1 prints** — Unimplemented attack: Red Banquet — sm12-136
- **1 prints** — Unimplemented attack: Rototiller — sm12-114
- **1 prints** — Unimplemented attack: Scaly Uppercut — sm12-163
- **1 prints** — Unimplemented attack: Shadow Imitation — sm12-103
- **1 prints** — Unimplemented attack: Shadow Impact — sm12-94
- **1 prints** — Unimplemented attack: Shout of Power — sm12-163
- **1 prints** — Unimplemented attack: Sneaky Pocket — sm12-148
- **1 prints** — Unimplemented attack: Solar Power — sm12-8
- **1 prints** — Unimplemented attack: Swirling Inferno — sm12-37
- **1 prints** — Unimplemented attack: Tailwind — sm12-60

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm12-1` | Venusaur & Snivy-GX | Unimplemented attack: Solar Plant-GX; Unimplemented Ability: Shining Vine |
| `sm12-8` | Sunflora | Unimplemented attack: Solar Power |
| `sm12-11` | Cradily | Unimplemented Ability: Swaying Strangle |
| `sm12-21` | Buzzwole | Unimplemented Ability: Beast Boost |
| `sm12-22` | Charizard & Braixen-GX | Unimplemented attack: Crimson Flame Pillar-GX |
| `sm12-25` | Flareon | Unimplemented Ability: Power Cheer |
| `sm12-29` | Torkoal | Unimplemented attack: Fire Fling; Unimplemented attack: Kindle |
| `sm12-33` | Emboar | Unimplemented Ability: Explosive Fire Dance |
| `sm12-35` | Volcarona-GX | Unimplemented attack: Backfire; Unimplemented attack: Massive Heat Wave-GX; Unimplemented Ability: Flaming Shot |
| `sm12-37` | Pyroar | Unimplemented attack: Swirling Inferno |
| `sm12-38` | Blastoise & Piplup-GX | Unimplemented attack: Splash Maker; Unimplemented attack: Bubble Launcher-GX |
| `sm12-41` | Golduck | Unimplemented attack: Energy Loop |
| `sm12-42` | Vaporeon | Unimplemented Ability: Vitality Cheer |
| `sm12-52` | Walrein | Unimplemented attack: Cold Snap |
| `sm12-56` | Empoleon | Unimplemented attack: Recall |
| `sm12-57` | Phione | Unimplemented Ability: Whirlpool Suction |
| `sm12-60` | Swanna | Unimplemented attack: Tailwind |
| `sm12-62` | Wishiwashi | Unimplemented Ability: Scatter |
| `sm12-63` | Wishiwashi-GX | Unimplemented attack: Massive Catch-GX |
| `sm12-65` | Araquanid | Unimplemented attack: Liquidation |
| `sm12-69` | Magneton | Unimplemented Ability: Call Signal |
| `sm12-70` | Jolteon | Unimplemented Ability: Speed Cheer |
| `sm12-72` | Lanturn | Unimplemented Ability: Blinking Lights |
| `sm12-75` | Solgaleo & Lunala-GX | Unimplemented attack: Light of the Protector-GX |
| `sm12-76` | Koffing | Unimplemented Ability: Blow-Away Bomb |
| `sm12-77` | Weezing | Unimplemented attack: Balloon Burst; Unimplemented Ability: Blow-Away Bomb |
| `sm12-78` | Natu | Unimplemented attack: Future Sight |
| `sm12-79` | Xatu | Unimplemented attack: Life Drain |
| `sm12-83` | Duskull | Unimplemented attack: Ominous Eyes; Unimplemented Ability: Spiritborne Evolution |
| `sm12-85` | Dusknoir | Unimplemented Ability: Grim Marking |
| `sm12-86` | Rotom | Unimplemented attack: Cycle Draw; Unimplemented attack: Energy Assist |
| `sm12-88` | Swoobat | Unimplemented attack: Charming Stamp |
| `sm12-90` | Golurk | Unimplemented attack: Fist of Antiquity |
| `sm12-92` | Dragalge | Unimplemented attack: Poison Cultivation |
| `sm12-94` | Trevenant | Unimplemented attack: Perplexing Forest; Unimplemented attack: Shadow Impact |
| `sm12-95` | Oricorio-GX | Unimplemented Ability: Dance of Tribute |
| `sm12-96` | Mimikyu | Unimplemented attack: Impersonation; Unimplemented attack: Mischievous Hands |
| `sm12-97` | Mimikyu | Unimplemented Ability: Shadow Box |
| `sm12-102` | Lunala | Unimplemented Ability: Blessing of the Moone |
| `sm12-103` | Marshadow | Unimplemented attack: Shadow Imitation |
| `sm12-104` | Blacephalon | Unimplemented attack: Fireworks Bomb |
| `sm12-109` | Vibrava | Unimplemented Ability: Obnoxious Whirring |
| `sm12-113` | Groudon | Unimplemented attack: Drought |
| `sm12-114` | Drilbur | Unimplemented attack: Rototiller |
| `sm12-115` | Excadrill | Unimplemented attack: Eleventh Hour Tackle |
| `sm12-117` | Seismitoad | Unimplemented Ability: Bulldoze |
| `sm12-129` | Alolan Persian-GX | Unimplemented Ability: Smug Face |
| `sm12-133` | Absol | Unimplemented attack: Ominous News; Unimplemented attack: Dirty Throw |
| `sm12-134` | Pawniard | Unimplemented attack: Bag Slash |
| `sm12-136` | Guzzlord | Unimplemented attack: Red Banquet |
| `sm12-140` | Mawile | Unimplemented attack: Dual Calling |
| `sm12-142` | Solgaleo | Unimplemented Ability: Armor of the Sunne |
| `sm12-143` | Togepi & Cleffa & Igglybuff-GX | Unimplemented attack: Supreme Puff-GX |
| `sm12-143a` | Togepi & Cleffa & Igglybuff-GX | Unimplemented attack: Supreme Puff-GX |
| `sm12-144` | Clefairy | Unimplemented attack: Doll Swap |
| `sm12-146` | Azurill | Unimplemented Ability: Growing Up |
| `sm12-148` | Whimsicott | Unimplemented attack: Sneaky Pocket |
| `sm12-151` | Floette | Unimplemented Ability: Flower Picking |
| `sm12-152` | Florges | Unimplemented Ability: Flower Picking |
| `sm12-155` | Sylveon | Unimplemented attack: Moonblast; Unimplemented attack: Beloved Pulse |
| `sm12-156` | Arceus & Dialga & Palkia-GX | Unimplemented attack: Ultimate Ray; Unimplemented attack: Altered Creation-GX |
| `sm12-157` | Reshiram & Zekrom-GX | Unimplemented attack: Fabled Flarebolts; Unimplemented attack: Cross Break-GX |
| `sm12-158` | Naganadel & Guzzlord-GX | Unimplemented attack: Chaotic Order-GX; Unimplemented Ability: Violent Appetite |
| `sm12-162` | Hakamo-o | Unimplemented Ability: Fighter's Roar |
| `sm12-163` | Kommo-o | Unimplemented attack: Shout of Power; Unimplemented attack: Scaly Uppercut |
| `sm12-169` | Aipom | Unimplemented Ability: Scampering Tail |
| `sm12-176` | Stoutland | Unimplemented Ability: Arf Arf Bark |
| `sm12-185` | Beastite | Unimplemented Trainer effect |
| `sm12-186` | Bellelba & Brycen-Man | Unimplemented Trainer effect |
| `sm12-187` | Chaotic Swell | Unimplemented Trainer effect |
| `sm12-188` | Clay | Unimplemented Trainer effect |
| `sm12-189` | Cynthia & Caitlin | Unimplemented Trainer effect |
| `sm12-190` | Dragonium Z: Dragon Claw | Unimplemented attack: Destructive Drake-GX; Unimplemented Trainer effect |
| `sm12-191` | Erika | Unimplemented Trainer effect |
| `sm12-192` | Great Catcher | Unimplemented Trainer effect |
| `sm12-193` | Guzma & Hala | Unimplemented Trainer effect |
| `sm12-194` | Island Challenge Amulet | Unimplemented Trainer effect |
| `sm12-195` | Lana's Fishing Rod | Unimplemented Trainer effect |
| `sm12-196` | Lillie's Full Force | Unimplemented Trainer effect |
| `sm12-197` | Lillie's Poké Doll | Unimplemented Trainer effect |
| `sm12-198` | Mallow & Lana | Unimplemented Trainer effect |
| `sm12-199` | Misty & Lorelei | Unimplemented Trainer effect |
| `sm12-200` | N's Resolve | Unimplemented Trainer effect |
| `sm12-201` | Professor Oak's Setup | Unimplemented Trainer effect |
| `sm12-202` | Red & Blue | Unimplemented Trainer effect |
| `sm12-203` | Roller Skater | Unimplemented Trainer effect |
| `sm12-204` | Rosa | Unimplemented Trainer effect |
| `sm12-205` | Roxie | Unimplemented Trainer effect |
| `sm12-208` | Will | Unimplemented Trainer effect |
| `sm12-209` | Draw Energy | Unimplemented Special Energy rules |
| `sm12-210` | Venusaur & Snivy-GX | Unimplemented attack: Solar Plant-GX; Unimplemented Ability: Shining Vine |
| `sm12-212` | Charizard & Braixen-GX | Unimplemented attack: Crimson Flame Pillar-GX |
| `sm12-213` | Volcarona-GX | Unimplemented attack: Backfire; Unimplemented attack: Massive Heat Wave-GX; Unimplemented Ability: Flaming Shot |
| `sm12-214` | Blastoise & Piplup-GX | Unimplemented attack: Splash Maker; Unimplemented attack: Bubble Launcher-GX |
| `sm12-215` | Blastoise & Piplup-GX | Unimplemented attack: Splash Maker; Unimplemented attack: Bubble Launcher-GX |
| `sm12-216` | Solgaleo & Lunala-GX | Unimplemented attack: Light of the Protector-GX |
| `sm12-217` | Oricorio-GX | Unimplemented Ability: Dance of Tribute |
| `sm12-219` | Alolan Persian-GX | Unimplemented Ability: Smug Face |
| `sm12-220` | Arceus & Dialga & Palkia-GX | Unimplemented attack: Ultimate Ray; Unimplemented attack: Altered Creation-GX |
| `sm12-221` | Arceus & Dialga & Palkia-GX | Unimplemented attack: Ultimate Ray; Unimplemented attack: Altered Creation-GX |
| `sm12-222` | Reshiram & Zekrom-GX | Unimplemented attack: Fabled Flarebolts; Unimplemented attack: Cross Break-GX |
| `sm12-223` | Naganadel & Guzzlord-GX | Unimplemented attack: Chaotic Order-GX; Unimplemented Ability: Violent Appetite |
| `sm12-224` | Naganadel & Guzzlord-GX | Unimplemented attack: Chaotic Order-GX; Unimplemented Ability: Violent Appetite |
| `sm12-228` | Cynthia & Caitlin | Unimplemented Trainer effect |
| `sm12-229` | Guzma & Hala | Unimplemented Trainer effect |
| `sm12-230` | Lillie's Full Force | Unimplemented Trainer effect |
| `sm12-231` | Mallow & Lana | Unimplemented Trainer effect |
| `sm12-232` | N's Resolve | Unimplemented Trainer effect |
| `sm12-233` | Professor Oak's Setup | Unimplemented Trainer effect |
| `sm12-234` | Red & Blue | Unimplemented Trainer effect |
| `sm12-235` | Roller Skater | Unimplemented Trainer effect |
| `sm12-236` | Rosa | Unimplemented Trainer effect |
| `sm12-237` | Torkoal | Unimplemented attack: Fire Fling; Unimplemented attack: Kindle |
| `sm12-240` | Wishiwashi | Unimplemented Ability: Scatter |
| `sm12-243` | Koffing | Unimplemented Ability: Blow-Away Bomb |
| `sm12-245` | Mimikyu | Unimplemented attack: Impersonation; Unimplemented attack: Mischievous Hands |
| `sm12-246` | Excadrill | Unimplemented attack: Eleventh Hour Tackle |
| `sm12-248` | Stoutland | Unimplemented Ability: Arf Arf Bark |
| `sm12-249` | Venusaur & Snivy-GX | Unimplemented attack: Solar Plant-GX; Unimplemented Ability: Shining Vine |
| `sm12-251` | Charizard & Braixen-GX | Unimplemented attack: Crimson Flame Pillar-GX |
| `sm12-252` | Volcarona-GX | Unimplemented attack: Backfire; Unimplemented attack: Massive Heat Wave-GX; Unimplemented Ability: Flaming Shot |
| `sm12-253` | Blastoise & Piplup-GX | Unimplemented attack: Splash Maker; Unimplemented attack: Bubble Launcher-GX |
| `sm12-254` | Solgaleo & Lunala-GX | Unimplemented attack: Light of the Protector-GX |
| `sm12-255` | Oricorio-GX | Unimplemented Ability: Dance of Tribute |
| `sm12-257` | Alolan Persian-GX | Unimplemented Ability: Smug Face |
| `sm12-258` | Arceus & Dialga & Palkia-GX | Unimplemented attack: Ultimate Ray; Unimplemented attack: Altered Creation-GX |
| `sm12-259` | Reshiram & Zekrom-GX | Unimplemented attack: Fabled Flarebolts; Unimplemented attack: Cross Break-GX |
| `sm12-260` | Naganadel & Guzzlord-GX | Unimplemented attack: Chaotic Order-GX; Unimplemented Ability: Violent Appetite |
| `sm12-264` | Great Catcher | Unimplemented Trainer effect |
| `sm12-265` | Island Challenge Amulet | Unimplemented Trainer effect |
| `sm12-266` | Lana's Fishing Rod | Unimplemented Trainer effect |
| `sm12-267` | Lillie's Poké Doll | Unimplemented Trainer effect |
| `sm12-271` | Draw Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
