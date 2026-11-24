# SM7 — whole-set gap ledger

Canonical prints: **187** | Playable: **140** | Gated: **47**
Printed attacks: **232** (188 distinct full signatures) | Abilities: **51** (34 distinct signatures)
Trainer rule signatures: **28** | Special Energy rule signatures: **1**
Canonical Git blob: `11606d6f86947a5906324a60d330ff88c702218b`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **9 prints** — Unimplemented Trainer effect — sm7-125, sm7-133, sm7-139, sm7-141, sm7-143, sm7-144, sm7-145, sm7-165, sm7-182
- **4 prints** — Unimplemented Ability: Stormy Winds — sm7-109, sm7-160, sm7-177, sm7-177a
- **4 prints** — Unimplemented attack: Dragon Break — sm7-109, sm7-160, sm7-177, sm7-177a
- **4 prints** — Unimplemented attack: Tempest-GX — sm7-109, sm7-160, sm7-177, sm7-177a
- **3 prints** — Unimplemented Ability: Extra Energy Bomb — sm7-48, sm7-155, sm7-172
- **3 prints** — Unimplemented Ability: Legendary Ascent — sm7-31, sm7-154, sm7-171
- **3 prints** — Unimplemented Ability: Shady Move — sm7-66, sm7-157, sm7-174
- **3 prints** — Unimplemented attack: Crush and Burn-GX — sm7-48, sm7-155, sm7-172
- **3 prints** — Unimplemented attack: Shadow Chant — sm7-66, sm7-157, sm7-174
- **3 prints** — Unimplemented attack: Tomb Hunt-GX — sm7-66, sm7-157, sm7-174
- **2 prints** — Prism Star attack/Ability or Trainer effect not yet implemented — sm7-97, sm7-107
- **2 prints** — Unimplemented Ability: Power of Nature — sm7-10, sm7-10a
- **1 prints** — Unimplemented Ability: Electric Start — sm7-52
- **1 prints** — Unimplemented Ability: Energy Grounding — sm7-50
- **1 prints** — Unimplemented Ability: Extend — sm7-95
- **1 prints** — Unimplemented Ability: Falling Star — sm7-83
- **1 prints** — Unimplemented Ability: Lazy — sm7-115
- **1 prints** — Unimplemented Ability: Red Eyes — sm7-65
- **1 prints** — Unimplemented Ability: Search for Friends — sm7-121
- **1 prints** — Unimplemented Ability: Sol Shade — sm7-61
- **1 prints** — Unimplemented Ability: Sunbeam — sm7-62
- **1 prints** — Unimplemented Ability: Unit Color 2 — sm7-122
- **1 prints** — Unimplemented Ability: Wish Upon a Star — sm7-97
- **1 prints** — Unimplemented attack: Bawl — sm7-116
- **1 prints** — Unimplemented attack: Double Charge — sm7-52
- **1 prints** — Unimplemented attack: Dreamy Mist — sm7-107
- **1 prints** — Unimplemented attack: Dust Devil — sm7-75
- **1 prints** — Unimplemented attack: Enemy Show — sm7-65
- **1 prints** — Unimplemented attack: Flaming Honk — sm7-29
- **1 prints** — Unimplemented attack: Lightning Strike — sm7-50
- **1 prints** — Unimplemented attack: Mining — sm7-91
- **1 prints** — Unimplemented attack: Moon Raker — sm7-100
- **1 prints** — Unimplemented attack: Perish Dream — sm7-97
- **1 prints** — Unimplemented attack: Rapid Spin — sm7-73
- **1 prints** — Unimplemented attack: Sandy Fear-GX — sm7-82
- **1 prints** — Unimplemented attack: Steelworks — sm7-98
- **1 prints** — Unimplemented attack: Strike and Run — sm7-110
- **1 prints** — Unimplemented attack: Trample — sm7-87
- **1 prints** — Unimplemented attack: Zappy Pom-Poms — sm7-55

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm7-10` | Sceptile | Unimplemented Ability: Power of Nature |
| `sm7-10a` | Sceptile | Unimplemented Ability: Power of Nature |
| `sm7-29` | Torkoal | Unimplemented attack: Flaming Honk |
| `sm7-31` | Articuno-GX | Unimplemented Ability: Legendary Ascent |
| `sm7-48` | Electrode-GX | Unimplemented attack: Crush and Burn-GX; Unimplemented Ability: Extra Energy Bomb |
| `sm7-50` | Lanturn | Unimplemented attack: Lightning Strike; Unimplemented Ability: Energy Grounding |
| `sm7-52` | Manectric | Unimplemented attack: Double Charge; Unimplemented Ability: Electric Start |
| `sm7-55` | Oricorio | Unimplemented attack: Zappy Pom-Poms |
| `sm7-61` | Lunatone | Unimplemented Ability: Sol Shade |
| `sm7-62` | Solrock | Unimplemented Ability: Sunbeam |
| `sm7-65` | Banette | Unimplemented attack: Enemy Show; Unimplemented Ability: Red Eyes |
| `sm7-66` | Banette-GX | Unimplemented attack: Shadow Chant; Unimplemented attack: Tomb Hunt-GX; Unimplemented Ability: Shady Move |
| `sm7-73` | Donphan | Unimplemented attack: Rapid Spin |
| `sm7-75` | Pupitar | Unimplemented attack: Dust Devil |
| `sm7-82` | Palossand-GX | Unimplemented attack: Sandy Fear-GX |
| `sm7-83` | Minior | Unimplemented Ability: Falling Star |
| `sm7-87` | Tyranitar | Unimplemented attack: Trample |
| `sm7-91` | Mawile | Unimplemented attack: Mining |
| `sm7-95` | Metagross | Unimplemented Ability: Extend |
| `sm7-97` | Jirachi ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Perish Dream; Unimplemented Ability: Wish Upon a Star |
| `sm7-98` | Heatran | Unimplemented attack: Steelworks |
| `sm7-100` | Celesteela | Unimplemented attack: Moon Raker |
| `sm7-107` | Latias ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Dreamy Mist |
| `sm7-109` | Rayquaza-GX | Unimplemented attack: Dragon Break; Unimplemented attack: Tempest-GX; Unimplemented Ability: Stormy Winds |
| `sm7-110` | Dunsparce | Unimplemented attack: Strike and Run |
| `sm7-115` | Slaking | Unimplemented Ability: Lazy |
| `sm7-116` | Whismur | Unimplemented attack: Bawl |
| `sm7-121` | Delcatty | Unimplemented Ability: Search for Friends |
| `sm7-122` | Kecleon | Unimplemented Ability: Unit Color 2 |
| `sm7-125` | Beast Ball | Unimplemented Trainer effect |
| `sm7-133` | Hiker | Unimplemented Trainer effect |
| `sm7-139` | The Masked Royal | Unimplemented Trainer effect |
| `sm7-141` | Rainbow Brush | Unimplemented Trainer effect |
| `sm7-143` | Shrine of Punishment | Unimplemented Trainer effect |
| `sm7-144` | Sky Pillar | Unimplemented Trainer effect |
| `sm7-145` | Steven's Resolve | Unimplemented Trainer effect |
| `sm7-154` | Articuno-GX | Unimplemented Ability: Legendary Ascent |
| `sm7-155` | Electrode-GX | Unimplemented attack: Crush and Burn-GX; Unimplemented Ability: Extra Energy Bomb |
| `sm7-157` | Banette-GX | Unimplemented attack: Shadow Chant; Unimplemented attack: Tomb Hunt-GX; Unimplemented Ability: Shady Move |
| `sm7-160` | Rayquaza-GX | Unimplemented attack: Dragon Break; Unimplemented attack: Tempest-GX; Unimplemented Ability: Stormy Winds |
| `sm7-165` | Steven's Resolve | Unimplemented Trainer effect |
| `sm7-171` | Articuno-GX | Unimplemented Ability: Legendary Ascent |
| `sm7-172` | Electrode-GX | Unimplemented attack: Crush and Burn-GX; Unimplemented Ability: Extra Energy Bomb |
| `sm7-174` | Banette-GX | Unimplemented attack: Shadow Chant; Unimplemented attack: Tomb Hunt-GX; Unimplemented Ability: Shady Move |
| `sm7-177` | Rayquaza-GX | Unimplemented attack: Dragon Break; Unimplemented attack: Tempest-GX; Unimplemented Ability: Stormy Winds |
| `sm7-177a` | Rayquaza-GX | Unimplemented attack: Dragon Break; Unimplemented attack: Tempest-GX; Unimplemented Ability: Stormy Winds |
| `sm7-182` | Rainbow Brush | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
