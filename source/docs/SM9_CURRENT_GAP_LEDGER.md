# SM9 — whole-set gap ledger

Canonical prints: **198** | Playable: **94** | Gated: **104**
Printed attacks: **260** (204 distinct full signatures) | Abilities: **36** (32 distinct signatures)
Trainer rule signatures: **26** | Special Energy rule signatures: **0**
Canonical Git blob: `f36aeea32bbf75861d1e3d4665e7deea4ea26d7e`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **36 prints** — Unimplemented Trainer effect — sm9-133, sm9-134, sm9-135, sm9-136, sm9-138, sm9-139, sm9-140, sm9-142, sm9-143, sm9-144, sm9-145, sm9-147, sm9-148, sm9-149, sm9-150, sm9-151 …
- **4 prints** — Unimplemented attack: Horror House-GX — sm9-53, sm9-164, sm9-165, sm9-186
- **4 prints** — Unimplemented attack: Poltergeist — sm9-53, sm9-164, sm9-165, sm9-186
- **3 prints** — Prism Star attack/Ability or Trainer effect not yet implemented — sm9-51, sm9-134, sm9-158
- **3 prints** — Unimplemented Ability: Metal Symbol — sm9-106, sm9-168, sm9-189
- **3 prints** — Unimplemented Ability: Scar Charge — sm9-97, sm9-167, sm9-188
- **3 prints** — Unimplemented attack: Cheer Up — sm9-120, sm9-171, sm9-191
- **3 prints** — Unimplemented attack: Devilish Hands-GX — sm9-96, sm9-166, sm9-187
- **3 prints** — Unimplemented attack: Iron Rule-GX — sm9-106, sm9-168, sm9-189
- **1 prints** — Unimplemented Ability: Adventurous Appetite — sm9-84
- **1 prints** — Unimplemented Ability: Air Mail — sm9-123
- **1 prints** — Unimplemented Ability: Blizzard Veil — sm9-32
- **1 prints** — Unimplemented Ability: Cosmic Guard — sm9-69
- **1 prints** — Unimplemented Ability: Dance of the Ancients — sm9-51
- **1 prints** — Unimplemented Ability: Dark Ambition — sm9-88
- **1 prints** — Unimplemented Ability: Defensive Scales — sm9-117
- **1 prints** — Unimplemented Ability: Electro Shaker — sm9-39
- **1 prints** — Unimplemented Ability: Fossil Bind — sm9-76
- **1 prints** — Unimplemented Ability: Fossilized Memories — sm9-78
- **1 prints** — Unimplemented Ability: Heatproof — sm9-101
- **1 prints** — Unimplemented Ability: Key of Secrets — sm9-110
- **1 prints** — Unimplemented Ability: Luminous Barrier — sm9-111
- **1 prints** — Unimplemented Ability: Magic Odds — sm9-67
- **1 prints** — Unimplemented Ability: Nine Temptations — sm9-16
- **1 prints** — Unimplemented Ability: Panic Spores — sm9-7
- **1 prints** — Unimplemented Ability: Poison Sacs — sm9-63
- **1 prints** — Unimplemented Ability: Powerful Squall — sm9-25
- **1 prints** — Unimplemented Ability: Roaring Resolve — sm9-14
- **1 prints** — Unimplemented Ability: Scoop-Up Block — sm9-66
- **1 prints** — Unimplemented Ability: Stellar Wish — sm9-99
- **1 prints** — Unimplemented Ability: Twilight Eyes — sm9-82
- **1 prints** — Unimplemented Ability: Unnerve — sm9-48
- **1 prints** — Unimplemented attack: Arm Thrust — sm9-81
- **1 prints** — Unimplemented attack: Cold Cyclone — sm9-32
- **1 prints** — Unimplemented attack: Continuous Blaze Ball — sm9-14
- **1 prints** — Unimplemented attack: Copycat — sm9-112
- **1 prints** — Unimplemented attack: Distilled Blast — sm9-30
- **1 prints** — Unimplemented attack: Drag Off — sm9-59
- **1 prints** — Unimplemented attack: Egg Splat — sm9-115
- **1 prints** — Unimplemented attack: Electromagnetic Bomb — sm9-37
- **1 prints** — Unimplemented attack: Enter the Dragon — sm9-29
- **1 prints** — Unimplemented attack: Family Rescue — sm9-55
- **1 prints** — Unimplemented attack: Fossil Fangs — sm9-130
- **1 prints** — Unimplemented attack: Head Hunt — sm9-132
- **1 prints** — Unimplemented attack: Limbo Limbo — sm9-64
- **1 prints** — Unimplemented attack: Make 'Em Pay — sm9-126
- **1 prints** — Unimplemented attack: Mysterious Dance — sm9-68
- **1 prints** — Unimplemented attack: Paradise Draw — sm9-115
- **1 prints** — Unimplemented attack: Power Lariat — sm9-56
- **1 prints** — Unimplemented attack: Raging Herd — sm9-129
- **1 prints** — Unimplemented attack: Special Combo — sm9-73
- **1 prints** — Unimplemented attack: Spinning Tail — sm9-85
- **1 prints** — Unimplemented attack: Spirit Compressor — sm9-89
- **1 prints** — Unimplemented attack: Splintered Shards-GX — sm9-82
- **1 prints** — Unimplemented attack: Strange Wave — sm9-65
- **1 prints** — Unimplemented attack: Swim — sm9-27
- **1 prints** — Unimplemented attack: Thorn Pod Throw — sm9-103
- **1 prints** — Unimplemented attack: Tighten Up — sm9-94
- **1 prints** — Unimplemented attack: Tool Buster — sm9-127
- **1 prints** — Unimplemented attack: Tool Drop — sm9-108
- **1 prints** — Unimplemented attack: Top Burner — sm9-19
- **1 prints** — Unimplemented attack: Toxic Secretion — sm9-63
- **1 prints** — Unimplemented attack: Trash Crash — sm9-93
- **1 prints** — Unimplemented attack: Tropical Shake — sm9-114
- **1 prints** — Unimplemented attack: Twister — sm9-118
- **1 prints** — Unimplemented attack: Volt Switch — sm9-50

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm9-7` | Parasect | Unimplemented Ability: Panic Spores |
| `sm9-14` | Charizard | Unimplemented attack: Continuous Blaze Ball; Unimplemented Ability: Roaring Resolve |
| `sm9-16` | Ninetales | Unimplemented Ability: Nine Temptations |
| `sm9-19` | Moltres | Unimplemented attack: Top Burner |
| `sm9-25` | Blastoise | Unimplemented Ability: Powerful Squall |
| `sm9-27` | Golduck | Unimplemented attack: Swim |
| `sm9-29` | Magikarp | Unimplemented attack: Enter the Dragon |
| `sm9-30` | Gyarados | Unimplemented attack: Distilled Blast |
| `sm9-32` | Articuno | Unimplemented attack: Cold Cyclone; Unimplemented Ability: Blizzard Veil |
| `sm9-37` | Alolan Golem | Unimplemented attack: Electromagnetic Bomb |
| `sm9-39` | Electrode | Unimplemented Ability: Electro Shaker |
| `sm9-48` | Galvantula | Unimplemented Ability: Unnerve |
| `sm9-50` | Heliolisk | Unimplemented attack: Volt Switch |
| `sm9-51` | Tapu Koko ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Ability: Dance of the Ancients |
| `sm9-53` | Gengar & Mimikyu-GX | Unimplemented attack: Poltergeist; Unimplemented attack: Horror House-GX |
| `sm9-55` | Nidorina | Unimplemented attack: Family Rescue |
| `sm9-56` | Nidoqueen | Unimplemented attack: Power Lariat |
| `sm9-59` | Nidoking | Unimplemented attack: Drag Off |
| `sm9-63` | Muk | Unimplemented attack: Toxic Secretion; Unimplemented Ability: Poison Sacs |
| `sm9-64` | Alolan Marowak | Unimplemented attack: Limbo Limbo |
| `sm9-65` | Starmie | Unimplemented attack: Strange Wave |
| `sm9-66` | Mr. Mime | Unimplemented Ability: Scoop-Up Block |
| `sm9-67` | Mr. Mime-GX | Unimplemented Ability: Magic Odds |
| `sm9-68` | Jynx | Unimplemented attack: Mysterious Dance |
| `sm9-69` | Cosmog | Unimplemented Ability: Cosmic Guard |
| `sm9-73` | Hitmonlee | Unimplemented attack: Special Combo |
| `sm9-76` | Omastar | Unimplemented Ability: Fossil Bind |
| `sm9-78` | Kabutops | Unimplemented Ability: Fossilized Memories |
| `sm9-81` | Pancham | Unimplemented attack: Arm Thrust |
| `sm9-82` | Lycanroc-GX | Unimplemented attack: Splintered Shards-GX; Unimplemented Ability: Twilight Eyes |
| `sm9-84` | Alolan Muk | Unimplemented Ability: Adventurous Appetite |
| `sm9-85` | Tyranitar | Unimplemented attack: Spinning Tail |
| `sm9-88` | Absol | Unimplemented Ability: Dark Ambition |
| `sm9-89` | Spiritomb | Unimplemented attack: Spirit Compressor |
| `sm9-93` | Mandibuzz | Unimplemented attack: Trash Crash |
| `sm9-94` | Pangoro | Unimplemented attack: Tighten Up |
| `sm9-96` | Hoopa-GX | Unimplemented attack: Devilish Hands-GX |
| `sm9-97` | Incineroar-GX | Unimplemented Ability: Scar Charge |
| `sm9-99` | Jirachi | Unimplemented Ability: Stellar Wish |
| `sm9-101` | Bronzong | Unimplemented Ability: Heatproof |
| `sm9-103` | Ferrothorn | Unimplemented attack: Thorn Pod Throw |
| `sm9-106` | Cobalion-GX | Unimplemented attack: Iron Rule-GX; Unimplemented Ability: Metal Symbol |
| `sm9-108` | Doublade | Unimplemented attack: Tool Drop |
| `sm9-110` | Klefki | Unimplemented Ability: Key of Secrets |
| `sm9-111` | Alolan Ninetales | Unimplemented Ability: Luminous Barrier |
| `sm9-112` | Mimikyu | Unimplemented attack: Copycat |
| `sm9-114` | Alolan Exeggutor | Unimplemented attack: Tropical Shake |
| `sm9-115` | Alolan Exeggutor | Unimplemented attack: Paradise Draw; Unimplemented attack: Egg Splat |
| `sm9-117` | Dratini | Unimplemented Ability: Defensive Scales |
| `sm9-118` | Dragonair | Unimplemented attack: Twister |
| `sm9-120` | Eevee & Snorlax-GX | Unimplemented attack: Cheer Up |
| `sm9-123` | Pidgeotto | Unimplemented Ability: Air Mail |
| `sm9-126` | Persian | Unimplemented attack: Make 'Em Pay |
| `sm9-127` | Farfetch'd | Unimplemented attack: Tool Buster |
| `sm9-129` | Tauros | Unimplemented attack: Raging Herd |
| `sm9-130` | Aerodactyl | Unimplemented attack: Fossil Fangs |
| `sm9-132` | Zangoose | Unimplemented attack: Head Hunt |
| `sm9-133` | Bill's Analysis | Unimplemented Trainer effect |
| `sm9-134` | Black Market ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Trainer effect |
| `sm9-135` | Brock's Grit | Unimplemented Trainer effect |
| `sm9-136` | Buff Padding | Unimplemented Trainer effect |
| `sm9-138` | Dangerous Drill | Unimplemented Trainer effect |
| `sm9-139` | Electrocharger | Unimplemented Trainer effect |
| `sm9-140` | Erika's Hospitality | Unimplemented Trainer effect |
| `sm9-142` | Fairy Charm UB | Unimplemented Trainer effect |
| `sm9-143` | Grass Memory | Unimplemented Trainer effect |
| `sm9-144` | Ingo & Emmet | Unimplemented Trainer effect |
| `sm9-145` | Jasmine | Unimplemented Trainer effect |
| `sm9-147` | Lavender Town | Unimplemented Trainer effect |
| `sm9-148` | Metal Goggles | Unimplemented Trainer effect |
| `sm9-149` | Morgan | Unimplemented Trainer effect |
| `sm9-150` | Nanu | Unimplemented Trainer effect |
| `sm9-151` | Nita | Unimplemented Trainer effect |
| `sm9-152` | Pokémon Communication | Unimplemented Trainer effect |
| `sm9-152a` | Pokémon Communication | Unimplemented Trainer effect |
| `sm9-152b` | Pokémon Communication | Unimplemented Trainer effect |
| `sm9-153` | Return Label | Unimplemented Trainer effect |
| `sm9-154` | Sabrina's Suggestion | Unimplemented Trainer effect |
| `sm9-156` | Viridian Forest | Unimplemented Trainer effect |
| `sm9-157` | Water Memory | Unimplemented Trainer effect |
| `sm9-158` | Wondrous Labyrinth ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Trainer effect |
| `sm9-164` | Gengar & Mimikyu-GX | Unimplemented attack: Poltergeist; Unimplemented attack: Horror House-GX |
| `sm9-165` | Gengar & Mimikyu-GX | Unimplemented attack: Poltergeist; Unimplemented attack: Horror House-GX |
| `sm9-166` | Hoopa-GX | Unimplemented attack: Devilish Hands-GX |
| `sm9-167` | Incineroar-GX | Unimplemented Ability: Scar Charge |
| `sm9-168` | Cobalion-GX | Unimplemented attack: Iron Rule-GX; Unimplemented Ability: Metal Symbol |
| `sm9-171` | Eevee & Snorlax-GX | Unimplemented attack: Cheer Up |
| `sm9-172` | Brock's Grit | Unimplemented Trainer effect |
| `sm9-174` | Erika's Hospitality | Unimplemented Trainer effect |
| `sm9-176` | Ingo & Emmet | Unimplemented Trainer effect |
| `sm9-177` | Jasmine | Unimplemented Trainer effect |
| `sm9-178` | Morgan | Unimplemented Trainer effect |
| `sm9-179` | Nanu | Unimplemented Trainer effect |
| `sm9-180` | Nita | Unimplemented Trainer effect |
| `sm9-181` | Sabrina's Suggestion | Unimplemented Trainer effect |
| `sm9-186` | Gengar & Mimikyu-GX | Unimplemented attack: Poltergeist; Unimplemented attack: Horror House-GX |
| `sm9-187` | Hoopa-GX | Unimplemented attack: Devilish Hands-GX |
| `sm9-188` | Incineroar-GX | Unimplemented Ability: Scar Charge |
| `sm9-189` | Cobalion-GX | Unimplemented attack: Iron Rule-GX; Unimplemented Ability: Metal Symbol |
| `sm9-191` | Eevee & Snorlax-GX | Unimplemented attack: Cheer Up |
| `sm9-192` | Dangerous Drill | Unimplemented Trainer effect |
| `sm9-193` | Electrocharger | Unimplemented Trainer effect |
| `sm9-195` | Metal Goggles | Unimplemented Trainer effect |
| `sm9-196` | Pokémon Communication | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
