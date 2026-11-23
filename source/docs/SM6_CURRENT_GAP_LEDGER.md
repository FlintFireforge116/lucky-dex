# SM6 — whole-set gap ledger

Canonical prints: **150** | Playable: **58** | Gated: **92**
Printed attacks: **211** (160 distinct full signatures) | Abilities: **25** (23 distinct signatures)
Trainer rule signatures: **16** | Special Energy rule signatures: **2**
Canonical Git blob: `7c9956b85945322c9c981db7a231be36fc524224`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **24 prints** — Unimplemented Trainer effect — sm6-102, sm6-102a, sm6-103, sm6-104, sm6-105, sm6-106, sm6-107, sm6-108, sm6-110, sm6-111, sm6-112, sm6-112a, sm6-113, sm6-113a, sm6-114, sm6-115 …
- **4 prints** — Prism Star attack/Ability or Trainer effect not yet implemented — sm6-31, sm6-74, sm6-96, sm6-110
- **3 prints** — Unimplemented Ability: Shuriken Flurry — sm6-24, sm6-120, sm6-133
- **3 prints** — Unimplemented attack: Doom Count-GX — sm6-79, sm6-124, sm6-137
- **3 prints** — Unimplemented attack: Photon Geyser — sm6-95, sm6-127, sm6-140
- **3 prints** — Unimplemented attack: Sanctuary-GX — sm6-90, sm6-126, sm6-139
- **3 prints** — Unimplemented attack: Sky-Scorching Light-GX — sm6-95, sm6-127, sm6-140
- **3 prints** — Unimplemented attack: Stinger-GX — sm6-56, sm6-121, sm6-134
- **3 prints** — Unimplemented attack: Verdict-GX — sm6-73, sm6-123, sm6-136
- **2 prints** — Unimplemented attack: Tropical Shake — sm6-2, sm6-2a
- **1 prints** — Unimplemented Ability: Abnormal Outbreak — sm6-5
- **1 prints** — Unimplemented Ability: Blessings of the Frost — sm6-4
- **1 prints** — Unimplemented Ability: Earthen Aura — sm6-71
- **1 prints** — Unimplemented Ability: Final Hour — sm6-46
- **1 prints** — Unimplemented Ability: First Law — sm6-96
- **1 prints** — Unimplemented Ability: Frubbles — sm6-21
- **1 prints** — Unimplemented Ability: Gale Shuriken — sm6-23
- **1 prints** — Unimplemented Ability: Hydration — sm6-94
- **1 prints** — Unimplemented Ability: Jet Geyser — sm6-31
- **1 prints** — Unimplemented Ability: Mystical Torch — sm6-17
- **1 prints** — Unimplemented Ability: Poison Point — sm6-53
- **1 prints** — Unimplemented Ability: Psychic Recharge — sm6-51
- **1 prints** — Unimplemented Ability: Silent Waves — sm6-42
- **1 prints** — Unimplemented Ability: Sticky Membrane — sm6-91
- **1 prints** — Unimplemented Ability: Tyrannical Heart — sm6-69
- **1 prints** — Unimplemented Ability: Unnerve — sm6-19
- **1 prints** — Unimplemented Ability: Wondrous Gift — sm6-86
- **1 prints** — Unimplemented Special Energy rules — sm6-117
- **1 prints** — Unimplemented attack: Break Open — sm6-29
- **1 prints** — Unimplemented attack: Bubble Trap — sm6-33
- **1 prints** — Unimplemented attack: Cablegram — sm6-39
- **1 prints** — Unimplemented attack: Calm Strike — sm6-72
- **1 prints** — Unimplemented attack: Crunch — sm6-68
- **1 prints** — Unimplemented attack: Curse of the Blade — sm6-48
- **1 prints** — Unimplemented attack: Destructive Sound — sm6-100
- **1 prints** — Unimplemented attack: Diamond Rain — sm6-74
- **1 prints** — Unimplemented attack: Dominating Fangs — sm6-19
- **1 prints** — Unimplemented attack: Ember — sm6-14
- **1 prints** — Unimplemented attack: Energy Teaser — sm6-44
- **1 prints** — Unimplemented attack: Exact Revenge — sm6-64
- **1 prints** — Unimplemented attack: Fire Spin — sm6-17
- **1 prints** — Unimplemented attack: Frost Wall — sm6-28
- **1 prints** — Unimplemented attack: Growth — sm6-9
- **1 prints** — Unimplemented attack: Knockout Reviver — sm6-55
- **1 prints** — Unimplemented attack: Limbo Limbo — sm6-12
- **1 prints** — Unimplemented attack: Lord's Valley — sm6-80
- **1 prints** — Unimplemented attack: Memory Skip — sm6-41
- **1 prints** — Unimplemented attack: Milk Drink — sm6-10
- **1 prints** — Unimplemented attack: Mountaintop Mining — sm6-98
- **1 prints** — Unimplemented attack: Psychic — sm6-45
- **1 prints** — Unimplemented attack: Psychic Abduction — sm6-43
- **1 prints** — Unimplemented attack: Searching Magnet — sm6-34
- **1 prints** — Unimplemented attack: Secret Blessings — sm6-84
- **1 prints** — Unimplemented attack: Standing By — sm6-26
- **1 prints** — Unimplemented attack: Swirling Petals — sm6-85
- **1 prints** — Unimplemented attack: Ticking Knock Out — sm6-49
- **1 prints** — Unimplemented attack: Trinity Star — sm6-96
- **1 prints** — Unimplemented attack: Twister — sm6-53
- **1 prints** — Unimplemented attack: Ultra Evolution — sm6-6
- **1 prints** — Unimplemented attack: Untamed Punch — sm6-78
- **1 prints** — Unimplemented attack: White Ray — sm6-11
- **1 prints** — Unimplemented attack: Wink Wink — sm6-87

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm6-2` | Alolan Exeggutor | Unimplemented attack: Tropical Shake |
| `sm6-2a` | Alolan Exeggutor | Unimplemented attack: Tropical Shake |
| `sm6-4` | Abomasnow | Unimplemented Ability: Blessings of the Frost |
| `sm6-5` | Scatterbug | Unimplemented Ability: Abnormal Outbreak |
| `sm6-6` | Scatterbug | Unimplemented attack: Ultra Evolution |
| `sm6-9` | Skiddo | Unimplemented attack: Growth |
| `sm6-10` | Gogoat | Unimplemented attack: Milk Drink |
| `sm6-11` | Pheromosa | Unimplemented attack: White Ray |
| `sm6-12` | Alolan Marowak | Unimplemented attack: Limbo Limbo |
| `sm6-14` | Fennekin | Unimplemented attack: Ember |
| `sm6-17` | Delphox | Unimplemented attack: Fire Spin; Unimplemented Ability: Mystical Torch |
| `sm6-19` | Pyroar | Unimplemented attack: Dominating Fangs; Unimplemented Ability: Unnerve |
| `sm6-21` | Froakie | Unimplemented Ability: Frubbles |
| `sm6-23` | Frogadier | Unimplemented Ability: Gale Shuriken |
| `sm6-24` | Greninja-GX | Unimplemented Ability: Shuriken Flurry |
| `sm6-26` | Clawitzer | Unimplemented attack: Standing By |
| `sm6-28` | Aurorus | Unimplemented attack: Frost Wall |
| `sm6-29` | Bergmite | Unimplemented attack: Break Open |
| `sm6-31` | Volcanion ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Ability: Jet Geyser |
| `sm6-33` | Araquanid | Unimplemented attack: Bubble Trap |
| `sm6-34` | Magnemite | Unimplemented attack: Searching Magnet |
| `sm6-39` | Xurkitree | Unimplemented attack: Cablegram |
| `sm6-41` | Uxie | Unimplemented attack: Memory Skip |
| `sm6-42` | Mesprit | Unimplemented Ability: Silent Waves |
| `sm6-43` | Azelf | Unimplemented attack: Psychic Abduction |
| `sm6-44` | Espurr | Unimplemented attack: Energy Teaser |
| `sm6-45` | Meowstic | Unimplemented attack: Psychic |
| `sm6-46` | Honedge | Unimplemented Ability: Final Hour |
| `sm6-48` | Doublade | Unimplemented attack: Curse of the Blade |
| `sm6-49` | Aegislash | Unimplemented attack: Ticking Knock Out |
| `sm6-51` | Malamar | Unimplemented Ability: Psychic Recharge |
| `sm6-53` | Dragalge | Unimplemented attack: Twister; Unimplemented Ability: Poison Point |
| `sm6-55` | Poipole | Unimplemented attack: Knockout Reviver |
| `sm6-56` | Naganadel-GX | Unimplemented attack: Stinger-GX |
| `sm6-64` | Toxicroak | Unimplemented attack: Exact Revenge |
| `sm6-68` | Tyrunt | Unimplemented attack: Crunch |
| `sm6-69` | Tyrantrum | Unimplemented Ability: Tyrannical Heart |
| `sm6-71` | Zygarde | Unimplemented Ability: Earthen Aura |
| `sm6-72` | Zygarde | Unimplemented attack: Calm Strike |
| `sm6-73` | Zygarde-GX | Unimplemented attack: Verdict-GX |
| `sm6-74` | Diancie ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Diamond Rain |
| `sm6-78` | Pangoro | Unimplemented attack: Untamed Punch |
| `sm6-79` | Yveltal-GX | Unimplemented attack: Doom Count-GX |
| `sm6-80` | Guzzlord | Unimplemented attack: Lord's Valley |
| `sm6-84` | Flabébé | Unimplemented attack: Secret Blessings |
| `sm6-85` | Floette | Unimplemented attack: Swirling Petals |
| `sm6-86` | Florges | Unimplemented Ability: Wondrous Gift |
| `sm6-87` | Sylveon | Unimplemented attack: Wink Wink |
| `sm6-90` | Xerneas-GX | Unimplemented attack: Sanctuary-GX |
| `sm6-91` | Goomy | Unimplemented Ability: Sticky Membrane |
| `sm6-94` | Goodra | Unimplemented Ability: Hydration |
| `sm6-95` | Ultra Necrozma-GX | Unimplemented attack: Photon Geyser; Unimplemented attack: Sky-Scorching Light-GX |
| `sm6-96` | Arceus ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Trinity Star; Unimplemented Ability: First Law |
| `sm6-98` | Diggersby | Unimplemented attack: Mountaintop Mining |
| `sm6-100` | Noibat | Unimplemented attack: Destructive Sound |
| `sm6-102` | Beast Ring | Unimplemented Trainer effect |
| `sm6-102a` | Beast Ring | Unimplemented Trainer effect |
| `sm6-103` | Bonnie | Unimplemented Trainer effect |
| `sm6-104` | Crasher Wake | Unimplemented Trainer effect |
| `sm6-105` | Diantha | Unimplemented Trainer effect |
| `sm6-106` | Eneporter | Unimplemented Trainer effect |
| `sm6-107` | Fossil Excavation Map | Unimplemented Trainer effect |
| `sm6-108` | Judge | Unimplemented Trainer effect |
| `sm6-110` | Lysandre ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Trainer effect |
| `sm6-111` | Lysandre Labs | Unimplemented Trainer effect |
| `sm6-112` | Metal Frying Pan | Unimplemented Trainer effect |
| `sm6-112a` | Metal Frying Pan | Unimplemented Trainer effect |
| `sm6-113` | Mysterious Treasure | Unimplemented Trainer effect |
| `sm6-113a` | Mysterious Treasure | Unimplemented Trainer effect |
| `sm6-114` | Ultra Recon Squad | Unimplemented Trainer effect |
| `sm6-115` | Ultra Space | Unimplemented Trainer effect |
| `sm6-117` | Beast Energy ◇ | Unimplemented Special Energy rules |
| `sm6-120` | Greninja-GX | Unimplemented Ability: Shuriken Flurry |
| `sm6-121` | Naganadel-GX | Unimplemented attack: Stinger-GX |
| `sm6-123` | Zygarde-GX | Unimplemented attack: Verdict-GX |
| `sm6-124` | Yveltal-GX | Unimplemented attack: Doom Count-GX |
| `sm6-126` | Xerneas-GX | Unimplemented attack: Sanctuary-GX |
| `sm6-127` | Ultra Necrozma-GX | Unimplemented attack: Photon Geyser; Unimplemented attack: Sky-Scorching Light-GX |
| `sm6-128` | Bonnie | Unimplemented Trainer effect |
| `sm6-129` | Crasher Wake | Unimplemented Trainer effect |
| `sm6-130` | Diantha | Unimplemented Trainer effect |
| `sm6-131` | Ultra Recon Squad | Unimplemented Trainer effect |
| `sm6-133` | Greninja-GX | Unimplemented Ability: Shuriken Flurry |
| `sm6-134` | Naganadel-GX | Unimplemented attack: Stinger-GX |
| `sm6-136` | Zygarde-GX | Unimplemented attack: Verdict-GX |
| `sm6-137` | Yveltal-GX | Unimplemented attack: Doom Count-GX |
| `sm6-139` | Xerneas-GX | Unimplemented attack: Sanctuary-GX |
| `sm6-140` | Ultra Necrozma-GX | Unimplemented attack: Photon Geyser; Unimplemented attack: Sky-Scorching Light-GX |
| `sm6-141` | Beast Ring | Unimplemented Trainer effect |
| `sm6-142` | Eneporter | Unimplemented Trainer effect |
| `sm6-144` | Metal Frying Pan | Unimplemented Trainer effect |
| `sm6-145` | Mysterious Treasure | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
