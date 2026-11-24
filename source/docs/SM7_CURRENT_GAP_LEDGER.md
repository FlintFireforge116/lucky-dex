# SM7 — whole-set gap ledger

Canonical prints: **187** | Playable: **80** | Gated: **107**
Printed attacks: **232** (188 distinct full signatures) | Abilities: **51** (34 distinct signatures)
Trainer rule signatures: **28** | Special Energy rule signatures: **1**
Canonical Git blob: `11606d6f86947a5906324a60d330ff88c702218b`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **31 prints** — Unimplemented Trainer effect — sm7-123, sm7-123a, sm7-125, sm7-126, sm7-128, sm7-131, sm7-133, sm7-134, sm7-135, sm7-136, sm7-138, sm7-139, sm7-140, sm7-141, sm7-143, sm7-144 …
- **4 prints** — Unimplemented Ability: Stormy Winds — sm7-109, sm7-160, sm7-177, sm7-177a
- **4 prints** — Unimplemented attack: Dragon Break — sm7-109, sm7-160, sm7-177, sm7-177a
- **4 prints** — Unimplemented attack: Tempest-GX — sm7-109, sm7-160, sm7-177, sm7-177a
- **3 prints** — Unimplemented Ability: Extra Energy Bomb — sm7-48, sm7-155, sm7-172
- **3 prints** — Unimplemented Ability: Legendary Ascent — sm7-31, sm7-154, sm7-171
- **3 prints** — Unimplemented Ability: Magic Evens — sm7-56, sm7-156, sm7-173
- **3 prints** — Unimplemented Ability: Shady Move — sm7-66, sm7-157, sm7-174
- **3 prints** — Unimplemented Ability: Ultra Wall — sm7-102, sm7-159, sm7-176
- **3 prints** — Unimplemented attack: Blaze Out-GX — sm7-28, sm7-153, sm7-170
- **3 prints** — Unimplemented attack: Breakdown — sm7-56, sm7-156, sm7-173
- **3 prints** — Unimplemented attack: Cold Crush-GX — sm7-31, sm7-154, sm7-171
- **3 prints** — Unimplemented attack: Crush and Burn-GX — sm7-48, sm7-155, sm7-172
- **3 prints** — Unimplemented attack: Den of Iniquity-GX — sm7-14, sm7-152, sm7-169
- **3 prints** — Unimplemented attack: Shadow Chant — sm7-66, sm7-157, sm7-174
- **3 prints** — Unimplemented attack: Tomb Hunt-GX — sm7-66, sm7-157, sm7-174
- **2 prints** — Prism Star attack/Ability or Trainer effect not yet implemented — sm7-97, sm7-107
- **2 prints** — Unimplemented Ability: Power of Nature — sm7-10, sm7-10a
- **1 prints** — Unimplemented Ability: Conductive Body — sm7-92
- **1 prints** — Unimplemented Ability: Dragon Wind — sm7-106
- **1 prints** — Unimplemented Ability: Electric Start — sm7-52
- **1 prints** — Unimplemented Ability: Energy Grounding — sm7-50
- **1 prints** — Unimplemented Ability: Excavate — sm7-88
- **1 prints** — Unimplemented Ability: Extend — sm7-95
- **1 prints** — Unimplemented Ability: Falling Star — sm7-83
- **1 prints** — Unimplemented Ability: Full Metal Body — sm7-99
- **1 prints** — Unimplemented Ability: Icy Barrier — sm7-45
- **1 prints** — Unimplemented Ability: Lazy — sm7-115
- **1 prints** — Unimplemented Ability: Power Draw — sm7-35
- **1 prints** — Unimplemented Ability: Red Eyes — sm7-65
- **1 prints** — Unimplemented Ability: Search for Friends — sm7-121
- **1 prints** — Unimplemented Ability: Shadow Shield — sm7-70
- **1 prints** — Unimplemented Ability: Smooth Over — sm7-24
- **1 prints** — Unimplemented Ability: Sol Shade — sm7-61
- **1 prints** — Unimplemented Ability: Sunbeam — sm7-62
- **1 prints** — Unimplemented Ability: Unit Color 2 — sm7-122
- **1 prints** — Unimplemented Ability: Wish Upon a Star — sm7-97
- **1 prints** — Unimplemented attack: Bawl — sm7-116
- **1 prints** — Unimplemented attack: Beat Up — sm7-86
- **1 prints** — Unimplemented attack: Bite Off — sm7-91
- **1 prints** — Unimplemented attack: Call for the Boss — sm7-84
- **1 prints** — Unimplemented attack: Chuck Away — sm7-85
- **1 prints** — Unimplemented attack: Clear the Room — sm7-13
- **1 prints** — Unimplemented attack: Dangerous Concert — sm7-119
- **1 prints** — Unimplemented attack: Disable — sm7-88
- **1 prints** — Unimplemented attack: Ditch and Draw — sm7-54
- **1 prints** — Unimplemented attack: Double Charge — sm7-52
- **1 prints** — Unimplemented attack: Dreamy Mist — sm7-107
- **1 prints** — Unimplemented attack: Dust Devil — sm7-75
- **1 prints** — Unimplemented attack: Enemy Show — sm7-65
- **1 prints** — Unimplemented attack: Even Game — sm7-44
- **1 prints** — Unimplemented attack: Feint Attack — sm7-20
- **1 prints** — Unimplemented attack: Firefighting — sm7-112
- **1 prints** — Unimplemented attack: Flaming Honk — sm7-29
- **1 prints** — Unimplemented attack: Grand Wave — sm7-46
- **1 prints** — Unimplemented attack: Item Maniac-GX — sm7-85
- **1 prints** — Unimplemented attack: Lightning Strike — sm7-50
- **1 prints** — Unimplemented attack: Mining — sm7-91
- **1 prints** — Unimplemented attack: Mirror Step — sm7-60
- **1 prints** — Unimplemented attack: Moon Raker — sm7-100
- **1 prints** — Unimplemented attack: Perish Dream — sm7-97
- **1 prints** — Unimplemented attack: Pheromone Catch — sm7-17
- **1 prints** — Unimplemented attack: Raging Blade — sm7-105
- **1 prints** — Unimplemented attack: Rapid Spin — sm7-73
- **1 prints** — Unimplemented attack: Sandy Fear-GX — sm7-82
- **1 prints** — Unimplemented attack: Screech — sm7-71
- **1 prints** — Unimplemented attack: Spear Dive — sm7-69
- **1 prints** — Unimplemented attack: Spider Trap — sm7-6
- **1 prints** — Unimplemented attack: Steelworks — sm7-98
- **1 prints** — Unimplemented attack: Strike and Run — sm7-110
- **1 prints** — Unimplemented attack: Surprising Pattern — sm7-16
- **1 prints** — Unimplemented attack: Teleportation Burst — sm7-69
- **1 prints** — Unimplemented attack: Trample — sm7-87
- **1 prints** — Unimplemented attack: Wreck — sm7-81
- **1 prints** — Unimplemented attack: Zappy Pom-Poms — sm7-55

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm7-6` | Ariados | Unimplemented attack: Spider Trap |
| `sm7-10` | Sceptile | Unimplemented Ability: Power of Nature |
| `sm7-10a` | Sceptile | Unimplemented Ability: Power of Nature |
| `sm7-13` | Nuzleaf | Unimplemented attack: Clear the Room |
| `sm7-14` | Shiftry-GX | Unimplemented attack: Den of Iniquity-GX |
| `sm7-16` | Masquerain | Unimplemented attack: Surprising Pattern |
| `sm7-17` | Volbeat | Unimplemented attack: Pheromone Catch |
| `sm7-20` | Cacturne | Unimplemented attack: Feint Attack |
| `sm7-24` | Magcargo | Unimplemented Ability: Smooth Over |
| `sm7-28` | Blaziken-GX | Unimplemented attack: Blaze Out-GX |
| `sm7-29` | Torkoal | Unimplemented attack: Flaming Honk |
| `sm7-31` | Articuno-GX | Unimplemented attack: Cold Crush-GX; Unimplemented Ability: Legendary Ascent |
| `sm7-35` | Swampert | Unimplemented Ability: Power Draw |
| `sm7-44` | Luvdisc | Unimplemented attack: Even Game |
| `sm7-45` | Regice | Unimplemented Ability: Icy Barrier |
| `sm7-46` | Kyogre | Unimplemented attack: Grand Wave |
| `sm7-48` | Electrode-GX | Unimplemented attack: Crush and Burn-GX; Unimplemented Ability: Extra Energy Bomb |
| `sm7-50` | Lanturn | Unimplemented attack: Lightning Strike; Unimplemented Ability: Energy Grounding |
| `sm7-52` | Manectric | Unimplemented attack: Double Charge; Unimplemented Ability: Electric Start |
| `sm7-54` | Minun | Unimplemented attack: Ditch and Draw |
| `sm7-55` | Oricorio | Unimplemented attack: Zappy Pom-Poms |
| `sm7-56` | Mr. Mime-GX | Unimplemented attack: Breakdown; Unimplemented Ability: Magic Evens |
| `sm7-60` | Grumpig | Unimplemented attack: Mirror Step |
| `sm7-61` | Lunatone | Unimplemented Ability: Sol Shade |
| `sm7-62` | Solrock | Unimplemented Ability: Sunbeam |
| `sm7-65` | Banette | Unimplemented attack: Enemy Show; Unimplemented Ability: Red Eyes |
| `sm7-66` | Banette-GX | Unimplemented attack: Shadow Chant; Unimplemented attack: Tomb Hunt-GX; Unimplemented Ability: Shady Move |
| `sm7-69` | Deoxys | Unimplemented attack: Teleportation Burst; Unimplemented attack: Spear Dive |
| `sm7-70` | Lunala | Unimplemented Ability: Shadow Shield |
| `sm7-71` | Onix | Unimplemented attack: Screech |
| `sm7-73` | Donphan | Unimplemented attack: Rapid Spin |
| `sm7-75` | Pupitar | Unimplemented attack: Dust Devil |
| `sm7-81` | Groudon | Unimplemented attack: Wreck |
| `sm7-82` | Palossand-GX | Unimplemented attack: Sandy Fear-GX |
| `sm7-83` | Minior | Unimplemented Ability: Falling Star |
| `sm7-84` | Alolan Rattata | Unimplemented attack: Call for the Boss |
| `sm7-85` | Alolan Raticate-GX | Unimplemented attack: Chuck Away; Unimplemented attack: Item Maniac-GX |
| `sm7-86` | Sneasel | Unimplemented attack: Beat Up |
| `sm7-87` | Tyranitar | Unimplemented attack: Trample |
| `sm7-88` | Sableye | Unimplemented attack: Disable; Unimplemented Ability: Excavate |
| `sm7-91` | Mawile | Unimplemented attack: Mining; Unimplemented attack: Bite Off |
| `sm7-92` | Beldum | Unimplemented Ability: Conductive Body |
| `sm7-95` | Metagross | Unimplemented Ability: Extend |
| `sm7-97` | Jirachi ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Perish Dream; Unimplemented Ability: Wish Upon a Star |
| `sm7-98` | Heatran | Unimplemented attack: Steelworks |
| `sm7-99` | Solgaleo | Unimplemented Ability: Full Metal Body |
| `sm7-100` | Celesteela | Unimplemented attack: Moon Raker |
| `sm7-102` | Stakataka-GX | Unimplemented Ability: Ultra Wall |
| `sm7-105` | Shelgon | Unimplemented attack: Raging Blade |
| `sm7-106` | Salamence | Unimplemented Ability: Dragon Wind |
| `sm7-107` | Latias ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Dreamy Mist |
| `sm7-109` | Rayquaza-GX | Unimplemented attack: Dragon Break; Unimplemented attack: Tempest-GX; Unimplemented Ability: Stormy Winds |
| `sm7-110` | Dunsparce | Unimplemented attack: Strike and Run |
| `sm7-112` | Pelipper | Unimplemented attack: Firefighting |
| `sm7-115` | Slaking | Unimplemented Ability: Lazy |
| `sm7-116` | Whismur | Unimplemented attack: Bawl |
| `sm7-119` | Exploud | Unimplemented attack: Dangerous Concert |
| `sm7-121` | Delcatty | Unimplemented Ability: Search for Friends |
| `sm7-122` | Kecleon | Unimplemented Ability: Unit Color 2 |
| `sm7-123` | Acro Bike | Unimplemented Trainer effect |
| `sm7-123a` | Acro Bike | Unimplemented Trainer effect |
| `sm7-125` | Beast Ball | Unimplemented Trainer effect |
| `sm7-126` | Bill's Maintenance | Unimplemented Trainer effect |
| `sm7-128` | Energy Recycle System | Unimplemented Trainer effect |
| `sm7-131` | Friend Ball | Unimplemented Trainer effect |
| `sm7-133` | Hiker | Unimplemented Trainer effect |
| `sm7-134` | Hustle Belt | Unimplemented Trainer effect |
| `sm7-135` | Last Chance Potion | Unimplemented Trainer effect |
| `sm7-136` | Life Herb | Unimplemented Trainer effect |
| `sm7-138` | Lure Ball | Unimplemented Trainer effect |
| `sm7-139` | The Masked Royal | Unimplemented Trainer effect |
| `sm7-140` | PokéNav | Unimplemented Trainer effect |
| `sm7-141` | Rainbow Brush | Unimplemented Trainer effect |
| `sm7-143` | Shrine of Punishment | Unimplemented Trainer effect |
| `sm7-144` | Sky Pillar | Unimplemented Trainer effect |
| `sm7-145` | Steven's Resolve | Unimplemented Trainer effect |
| `sm7-148` | Tate & Liza | Unimplemented Trainer effect |
| `sm7-148a` | Tate & Liza | Unimplemented Trainer effect |
| `sm7-149` | TV Reporter | Unimplemented Trainer effect |
| `sm7-150` | Underground Expedition | Unimplemented Trainer effect |
| `sm7-152` | Shiftry-GX | Unimplemented attack: Den of Iniquity-GX |
| `sm7-153` | Blaziken-GX | Unimplemented attack: Blaze Out-GX |
| `sm7-154` | Articuno-GX | Unimplemented attack: Cold Crush-GX; Unimplemented Ability: Legendary Ascent |
| `sm7-155` | Electrode-GX | Unimplemented attack: Crush and Burn-GX; Unimplemented Ability: Extra Energy Bomb |
| `sm7-156` | Mr. Mime-GX | Unimplemented attack: Breakdown; Unimplemented Ability: Magic Evens |
| `sm7-157` | Banette-GX | Unimplemented attack: Shadow Chant; Unimplemented attack: Tomb Hunt-GX; Unimplemented Ability: Shady Move |
| `sm7-159` | Stakataka-GX | Unimplemented Ability: Ultra Wall |
| `sm7-160` | Rayquaza-GX | Unimplemented attack: Dragon Break; Unimplemented attack: Tempest-GX; Unimplemented Ability: Stormy Winds |
| `sm7-162` | Bill's Maintenance | Unimplemented Trainer effect |
| `sm7-165` | Steven's Resolve | Unimplemented Trainer effect |
| `sm7-166` | Tate & Liza | Unimplemented Trainer effect |
| `sm7-167` | TV Reporter | Unimplemented Trainer effect |
| `sm7-168` | Underground Expedition | Unimplemented Trainer effect |
| `sm7-169` | Shiftry-GX | Unimplemented attack: Den of Iniquity-GX |
| `sm7-170` | Blaziken-GX | Unimplemented attack: Blaze Out-GX |
| `sm7-171` | Articuno-GX | Unimplemented attack: Cold Crush-GX; Unimplemented Ability: Legendary Ascent |
| `sm7-172` | Electrode-GX | Unimplemented attack: Crush and Burn-GX; Unimplemented Ability: Extra Energy Bomb |
| `sm7-173` | Mr. Mime-GX | Unimplemented attack: Breakdown; Unimplemented Ability: Magic Evens |
| `sm7-174` | Banette-GX | Unimplemented attack: Shadow Chant; Unimplemented attack: Tomb Hunt-GX; Unimplemented Ability: Shady Move |
| `sm7-176` | Stakataka-GX | Unimplemented Ability: Ultra Wall |
| `sm7-177` | Rayquaza-GX | Unimplemented attack: Dragon Break; Unimplemented attack: Tempest-GX; Unimplemented Ability: Stormy Winds |
| `sm7-177a` | Rayquaza-GX | Unimplemented attack: Dragon Break; Unimplemented attack: Tempest-GX; Unimplemented Ability: Stormy Winds |
| `sm7-178` | Acro Bike | Unimplemented Trainer effect |
| `sm7-179` | Hustle Belt | Unimplemented Trainer effect |
| `sm7-180` | Life Herb | Unimplemented Trainer effect |
| `sm7-181` | PokéNav | Unimplemented Trainer effect |
| `sm7-182` | Rainbow Brush | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
