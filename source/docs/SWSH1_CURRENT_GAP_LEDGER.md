# SWSH1 — whole-set gap ledger

Canonical prints: **216** | Playable: **162** | Gated: **54**
Printed attacks: **277** (244 distinct full signatures) | Abilities: **25** (20 distinct signatures)
Trainer rule signatures: **30** | Special Energy rule signatures: **1**
Canonical Git blob: `c43bc9ff9daa80e41bcd8952080b79825e8caa8f`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **15 prints** — Unimplemented Trainer effect — swsh1-157, swsh1-166, swsh1-167, swsh1-168, swsh1-171, swsh1-172, swsh1-176, swsh1-180, swsh1-182, swsh1-184, swsh1-199, swsh1-202, swsh1-207, swsh1-210, swsh1-215
- **3 prints** — Unimplemented Ability: Intrepid Sword — swsh1-138, swsh1-195, swsh1-211
- **2 prints** — Required Pokémon V evolution parent is not yet enabled — swsh1-50, swsh1-203
- **2 prints** — Unimplemented attack: Anchor Anger — swsh1-9, swsh1-187
- **2 prints** — Unimplemented attack: Body Surf — swsh1-49, swsh1-189
- **2 prints** — Unimplemented attack: Gritty Comeback — swsh1-86, swsh1-191
- **2 prints** — Unimplemented attack: Ocean Loop — swsh1-49, swsh1-189
- **2 prints** — Unimplemented attack: Stone Gift — swsh1-116, swsh1-205
- **1 prints** — Unimplemented Ability: Bug's Radar — swsh1-19
- **1 prints** — Unimplemented Ability: Headbutt Tantrum — swsh1-117
- **1 prints** — Unimplemented Ability: Ice Dance — swsh1-64
- **1 prints** — Unimplemented Ability: Libero — swsh1-34
- **1 prints** — Unimplemented Ability: Life Shaker — swsh1-85
- **1 prints** — Unimplemented Ability: More Poison — swsh1-124
- **1 prints** — Unimplemented Ability: Poison Point — swsh1-51
- **1 prints** — Unimplemented Ability: Primate Wisdom — swsh1-148
- **1 prints** — Unimplemented Ability: Snap Trap — swsh1-132
- **1 prints** — Unimplemented Ability: Untamed Shout — swsh1-119
- **1 prints** — Unimplemented Special Energy rules — swsh1-186
- **1 prints** — Unimplemented attack: Aqua Wash — swsh1-48
- **1 prints** — Unimplemented attack: Bedrock Shake — swsh1-99
- **1 prints** — Unimplemented attack: Carry Off — swsh1-144
- **1 prints** — Unimplemented attack: Cotton Ride — swsh1-6
- **1 prints** — Unimplemented attack: Energy Slap — swsh1-131
- **1 prints** — Unimplemented attack: Hundred Foot Flames — swsh1-39
- **1 prints** — Unimplemented attack: Hydro Snipe — swsh1-59
- **1 prints** — Unimplemented attack: Iron Wings — swsh1-135
- **1 prints** — Unimplemented attack: Muscular Nose — swsh1-137
- **1 prints** — Unimplemented attack: Octolock — swsh1-113
- **1 prints** — Unimplemented attack: Pluck — swsh1-151
- **1 prints** — Unimplemented attack: Ripping Horn — swsh1-47
- **1 prints** — Unimplemented attack: Sleepy Pulse — swsh1-88
- **1 prints** — Unimplemented attack: Strobe Shock — swsh1-69
- **1 prints** — Unimplemented attack: Thief — swsh1-126

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh1-6` | Whimsicott | Unimplemented attack: Cotton Ride |
| `swsh1-9` | Dhelmise V | Unimplemented attack: Anchor Anger |
| `swsh1-19` | Orbeetle | Unimplemented Ability: Bug's Radar |
| `swsh1-34` | Cinderace | Unimplemented Ability: Libero |
| `swsh1-39` | Centiskorch | Unimplemented attack: Hundred Foot Flames |
| `swsh1-47` | Seaking | Unimplemented attack: Ripping Horn |
| `swsh1-48` | Lapras | Unimplemented attack: Aqua Wash |
| `swsh1-49` | Lapras V | Unimplemented attack: Body Surf; Unimplemented attack: Ocean Loop |
| `swsh1-50` | Lapras VMAX | Required Pokémon V evolution parent is not yet enabled |
| `swsh1-51` | Qwilfish | Unimplemented Ability: Poison Point |
| `swsh1-59` | Inteleon | Unimplemented attack: Hydro Snipe |
| `swsh1-64` | Frosmoth | Unimplemented Ability: Ice Dance |
| `swsh1-69` | Lanturn | Unimplemented attack: Strobe Shock |
| `swsh1-85` | Gengar | Unimplemented Ability: Life Shaker |
| `swsh1-86` | Wobbuffet V | Unimplemented attack: Gritty Comeback |
| `swsh1-88` | Musharna | Unimplemented attack: Sleepy Pulse |
| `swsh1-99` | Rhyperior | Unimplemented attack: Bedrock Shake |
| `swsh1-113` | Grapploct | Unimplemented attack: Octolock |
| `swsh1-116` | Stonjourner VMAX | Unimplemented attack: Stone Gift |
| `swsh1-117` | Galarian Zigzagoon | Unimplemented Ability: Headbutt Tantrum |
| `swsh1-119` | Galarian Obstagoon | Unimplemented Ability: Untamed Shout |
| `swsh1-124` | Toxicroak | Unimplemented Ability: More Poison |
| `swsh1-126` | Thievul | Unimplemented attack: Thief |
| `swsh1-131` | Ferrothorn | Unimplemented attack: Energy Slap |
| `swsh1-132` | Galarian Stunfisk | Unimplemented Ability: Snap Trap |
| `swsh1-135` | Corviknight | Unimplemented attack: Iron Wings |
| `swsh1-137` | Copperajah | Unimplemented attack: Muscular Nose |
| `swsh1-138` | Zacian V | Unimplemented Ability: Intrepid Sword |
| `swsh1-144` | Noctowl | Unimplemented attack: Carry Off |
| `swsh1-148` | Oranguru | Unimplemented Ability: Primate Wisdom |
| `swsh1-151` | Corvisquire | Unimplemented attack: Pluck |
| `swsh1-157` | Bede | Unimplemented Trainer effect |
| `swsh1-166` | Hyper Potion | Unimplemented Trainer effect |
| `swsh1-167` | Lucky Egg | Unimplemented Trainer effect |
| `swsh1-168` | Lum Berry | Unimplemented Trainer effect |
| `swsh1-171` | Ordinary Rod | Unimplemented Trainer effect |
| `swsh1-172` | Pal Pad | Unimplemented Trainer effect |
| `swsh1-176` | Pokémon Center Lady | Unimplemented Trainer effect |
| `swsh1-180` | Rare Candy | Unimplemented Trainer effect |
| `swsh1-182` | Sitrus Berry | Unimplemented Trainer effect |
| `swsh1-184` | Team Yell Grunt | Unimplemented Trainer effect |
| `swsh1-186` | Aurora Energy | Unimplemented Special Energy rules |
| `swsh1-187` | Dhelmise V | Unimplemented attack: Anchor Anger |
| `swsh1-189` | Lapras V | Unimplemented attack: Body Surf; Unimplemented attack: Ocean Loop |
| `swsh1-191` | Wobbuffet V | Unimplemented attack: Gritty Comeback |
| `swsh1-195` | Zacian V | Unimplemented Ability: Intrepid Sword |
| `swsh1-199` | Bede | Unimplemented Trainer effect |
| `swsh1-202` | Team Yell Grunt | Unimplemented Trainer effect |
| `swsh1-203` | Lapras VMAX | Required Pokémon V evolution parent is not yet enabled |
| `swsh1-205` | Stonjourner VMAX | Unimplemented attack: Stone Gift |
| `swsh1-207` | Bede | Unimplemented Trainer effect |
| `swsh1-210` | Team Yell Grunt | Unimplemented Trainer effect |
| `swsh1-211` | Zacian V | Unimplemented Ability: Intrepid Sword |
| `swsh1-215` | Ordinary Rod | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
