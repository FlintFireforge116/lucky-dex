# SWSH2 — whole-set gap ledger

Canonical prints: **209** | Playable: **147** | Gated: **62**
Printed attacks: **283** (244 distinct full signatures) | Abilities: **37** (30 distinct signatures)
Trainer rule signatures: **18** | Special Energy rule signatures: **4**
Canonical Git blob: `500a9597c6e5989e900f93a1933420c568fbaab8`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **16 prints** — Unimplemented Trainer effect — swsh2-155, swsh2-157, swsh2-158, swsh2-161, swsh2-162, swsh2-163, swsh2-165, swsh2-168, swsh2-169, swsh2-170, swsh2-190, swsh2-191, swsh2-201, swsh2-202, swsh2-207, swsh2-208
- **5 prints** — Unimplemented Special Energy rules — swsh2-171, swsh2-172, swsh2-173, swsh2-174, swsh2-209
- **3 prints** — Unimplemented Ability: Top Entry — swsh2-8, swsh2-32, swsh2-61
- **2 prints** — Unimplemented attack: Counter — swsh2-36, swsh2-194
- **2 prints** — Unimplemented attack: Dripping Grudge — swsh2-85, swsh2-116
- **2 prints** — Unimplemented attack: Max Beating — swsh2-18, swsh2-193
- **2 prints** — Unimplemented attack: Max Phantom — swsh2-93, swsh2-197
- **2 prints** — Unimplemented attack: Nine-Tailed Shapeshifter — swsh2-26, swsh2-177
- **2 prints** — Unimplemented attack: Raid — swsh2-62, swsh2-128
- **1 prints** — Unimplemented Ability: Apple Drop — swsh2-22
- **1 prints** — Unimplemented Ability: Counterattack — swsh2-80
- **1 prints** — Unimplemented Ability: Counterattack Kerzap — swsh2-72
- **1 prints** — Unimplemented Ability: Delicious Aroma — swsh2-23
- **1 prints** — Unimplemented Ability: Infiltrator — swsh2-91
- **1 prints** — Unimplemented Ability: Mind Hat — swsh2-85
- **1 prints** — Unimplemented Ability: Neutralizing Gas — swsh2-113
- **1 prints** — Unimplemented Ability: Perish Body — swsh2-79
- **1 prints** — Unimplemented Ability: Prankish — swsh2-75
- **1 prints** — Unimplemented Ability: Protective Glow — swsh2-33
- **1 prints** — Unimplemented Ability: Screen Cleaner — swsh2-38
- **1 prints** — Unimplemented Ability: Tar Generator — swsh2-107
- **1 prints** — Unimplemented Ability: Warming Up — swsh2-28
- **1 prints** — Unimplemented attack: Berry Picking — swsh2-5
- **1 prints** — Unimplemented attack: Big Throw — swsh2-150
- **1 prints** — Unimplemented attack: Chirp — swsh2-143
- **1 prints** — Unimplemented attack: Decorate — swsh2-87
- **1 prints** — Unimplemented attack: Energy Warp — swsh2-77
- **1 prints** — Unimplemented attack: Gathering Food — swsh2-132
- **1 prints** — Unimplemented attack: Ground Burn — swsh2-30
- **1 prints** — Unimplemented attack: Hand Press — swsh2-104
- **1 prints** — Unimplemented attack: Meteor Assault — swsh2-95
- **1 prints** — Unimplemented attack: Mining Rush — swsh2-147
- **1 prints** — Unimplemented attack: Phantom Force — swsh2-91
- **1 prints** — Unimplemented attack: Psychic Assault — swsh2-80
- **1 prints** — Unimplemented attack: Reignite — swsh2-32
- **1 prints** — Unimplemented attack: Sand Sink — swsh2-82
- **1 prints** — Unimplemented attack: Severe Poison — swsh2-113
- **1 prints** — Unimplemented attack: Spiral Jet — swsh2-53
- **1 prints** — Unimplemented attack: Spreading Spite — swsh2-102
- **1 prints** — Unimplemented attack: Threatening Pattern — swsh2-11

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh2-5` | Shuckle | Unimplemented attack: Berry Picking |
| `swsh2-8` | Lombre | Unimplemented Ability: Top Entry |
| `swsh2-11` | Masquerain | Unimplemented attack: Threatening Pattern |
| `swsh2-18` | Rillaboom VMAX | Unimplemented attack: Max Beating |
| `swsh2-22` | Flapple | Unimplemented Ability: Apple Drop |
| `swsh2-23` | Appletun | Unimplemented Ability: Delicious Aroma |
| `swsh2-26` | Ninetales V | Unimplemented attack: Nine-Tailed Shapeshifter |
| `swsh2-28` | Arcanine | Unimplemented Ability: Warming Up |
| `swsh2-30` | Magmortar | Unimplemented attack: Ground Burn |
| `swsh2-32` | Lampent | Unimplemented attack: Reignite; Unimplemented Ability: Top Entry |
| `swsh2-33` | Chandelure | Unimplemented Ability: Protective Glow |
| `swsh2-36` | Cinderace VMAX | Unimplemented attack: Counter |
| `swsh2-38` | Galarian Mr. Rime | Unimplemented Ability: Screen Cleaner |
| `swsh2-53` | Barraskewda | Unimplemented attack: Spiral Jet |
| `swsh2-61` | Luxio | Unimplemented Ability: Top Entry |
| `swsh2-62` | Luxray | Unimplemented attack: Raid |
| `swsh2-72` | Pincurchin V | Unimplemented Ability: Counterattack Kerzap |
| `swsh2-75` | Clefable | Unimplemented Ability: Prankish |
| `swsh2-77` | Xatu | Unimplemented attack: Energy Warp |
| `swsh2-79` | Galarian Cursola | Unimplemented Ability: Perish Body |
| `swsh2-80` | Sigilyph | Unimplemented attack: Psychic Assault; Unimplemented Ability: Counterattack |
| `swsh2-82` | Palossand | Unimplemented attack: Sand Sink |
| `swsh2-85` | Hatterene | Unimplemented attack: Dripping Grudge; Unimplemented Ability: Mind Hat |
| `swsh2-87` | Alcremie | Unimplemented attack: Decorate |
| `swsh2-91` | Dragapult | Unimplemented attack: Phantom Force; Unimplemented Ability: Infiltrator |
| `swsh2-93` | Dragapult VMAX | Unimplemented attack: Max Phantom |
| `swsh2-95` | Galarian Sirfetch'd | Unimplemented attack: Meteor Assault |
| `swsh2-102` | Galarian Runerigus | Unimplemented attack: Spreading Spite |
| `swsh2-104` | Barbaracle | Unimplemented attack: Hand Press |
| `swsh2-107` | Coalossal | Unimplemented Ability: Tar Generator |
| `swsh2-113` | Galarian Weezing | Unimplemented attack: Severe Poison; Unimplemented Ability: Neutralizing Gas |
| `swsh2-116` | Spiritomb | Unimplemented attack: Dripping Grudge |
| `swsh2-128` | Scizor | Unimplemented attack: Raid |
| `swsh2-132` | Durant | Unimplemented attack: Gathering Food |
| `swsh2-143` | Pidove | Unimplemented attack: Chirp |
| `swsh2-147` | Diggersby | Unimplemented attack: Mining Rush |
| `swsh2-150` | Bewear | Unimplemented attack: Big Throw |
| `swsh2-155` | Burning Scarf | Unimplemented Trainer effect |
| `swsh2-157` | Cursed Shovel | Unimplemented Trainer effect |
| `swsh2-158` | Dan | Unimplemented Trainer effect |
| `swsh2-161` | Milo | Unimplemented Trainer effect |
| `swsh2-162` | Nugget | Unimplemented Trainer effect |
| `swsh2-163` | Oleana | Unimplemented Trainer effect |
| `swsh2-165` | Scoop Up Net | Unimplemented Trainer effect |
| `swsh2-168` | Tool Scrapper | Unimplemented Trainer effect |
| `swsh2-169` | Training Court | Unimplemented Trainer effect |
| `swsh2-170` | Turffield Stadium | Unimplemented Trainer effect |
| `swsh2-171` | Capture Energy | Unimplemented Special Energy rules |
| `swsh2-172` | Horror Psychic Energy | Unimplemented Special Energy rules |
| `swsh2-173` | Speed Lightning Energy | Unimplemented Special Energy rules |
| `swsh2-174` | Twin Energy | Unimplemented Special Energy rules |
| `swsh2-177` | Ninetales V | Unimplemented attack: Nine-Tailed Shapeshifter |
| `swsh2-190` | Milo | Unimplemented Trainer effect |
| `swsh2-191` | Oleana | Unimplemented Trainer effect |
| `swsh2-193` | Rillaboom VMAX | Unimplemented attack: Max Beating |
| `swsh2-194` | Cinderace VMAX | Unimplemented attack: Counter |
| `swsh2-197` | Dragapult VMAX | Unimplemented attack: Max Phantom |
| `swsh2-201` | Milo | Unimplemented Trainer effect |
| `swsh2-202` | Oleana | Unimplemented Trainer effect |
| `swsh2-207` | Scoop Up Net | Unimplemented Trainer effect |
| `swsh2-208` | Tool Scrapper | Unimplemented Trainer effect |
| `swsh2-209` | Twin Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
