# SWSH3 — whole-set gap ledger

Canonical prints: **201** | Playable: **178** | Gated: **23**
Printed attacks: **274** (240 distinct full signatures) | Abilities: **32** (27 distinct signatures)
Trainer rule signatures: **17** | Special Energy rule signatures: **4**
Canonical Git blob: `347f057fe4bc8cd952fda99aa12a1d9c5fa1c550`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **9 prints** — Unimplemented Trainer effect — swsh3-158, swsh3-162, swsh3-166, swsh3-168, swsh3-170, swsh3-188, swsh3-189, swsh3-195, swsh3-196
- **2 prints** — Unimplemented Ability: Eternal Zone — swsh3-117, swsh3-192
- **2 prints** — Unimplemented Ability: Metal Skin — swsh3-128, swsh3-184
- **2 prints** — Unimplemented attack: G-Max Centiferno — swsh3-34, swsh3-191
- **2 prints** — Unimplemented attack: Radiating Heat — swsh3-33, swsh3-179
- **2 prints** — Unimplemented attack: Trapping Bite — swsh3-128, swsh3-184
- **1 prints** — Unimplemented Ability: Biting Whirlpool — swsh3-66
- **1 prints** — Unimplemented Ability: Flying Taxi — swsh3-156
- **1 prints** — Unimplemented Ability: Labyrinth of Sand — swsh3-91
- **1 prints** — Unimplemented Ability: Shuffle Dance — swsh3-36
- **1 prints** — Unimplemented Ability: Spider Net — swsh3-103
- **1 prints** — Unimplemented attack: Desert Geyser — swsh3-91
- **1 prints** — Unimplemented attack: Frozen Heat — swsh3-28

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh3-28` | Galarian Darmanitan | Unimplemented attack: Frozen Heat |
| `swsh3-33` | Centiskorch V | Unimplemented attack: Radiating Heat |
| `swsh3-34` | Centiskorch VMAX | Unimplemented attack: G-Max Centiferno |
| `swsh3-36` | Galarian Mr. Rime | Unimplemented Ability: Shuffle Dance |
| `swsh3-66` | Arctozolt | Unimplemented Ability: Biting Whirlpool |
| `swsh3-91` | Flygon | Unimplemented attack: Desert Geyser; Unimplemented Ability: Labyrinth of Sand |
| `swsh3-103` | Ariados | Unimplemented Ability: Spider Net |
| `swsh3-117` | Eternatus VMAX | Unimplemented Ability: Eternal Zone |
| `swsh3-128` | Galarian Stunfisk V | Unimplemented attack: Trapping Bite; Unimplemented Ability: Metal Skin |
| `swsh3-156` | Corviknight | Unimplemented Ability: Flying Taxi |
| `swsh3-158` | Billowing Smoke | Unimplemented Trainer effect |
| `swsh3-162` | Glimwood Tangle | Unimplemented Trainer effect |
| `swsh3-166` | Pokémon Breeder's Nurturing | Unimplemented Trainer effect |
| `swsh3-168` | Rose | Unimplemented Trainer effect |
| `swsh3-170` | Spikemuth | Unimplemented Trainer effect |
| `swsh3-179` | Centiskorch V | Unimplemented attack: Radiating Heat |
| `swsh3-184` | Galarian Stunfisk V | Unimplemented attack: Trapping Bite; Unimplemented Ability: Metal Skin |
| `swsh3-188` | Pokémon Breeder's Nurturing | Unimplemented Trainer effect |
| `swsh3-189` | Rose | Unimplemented Trainer effect |
| `swsh3-191` | Centiskorch VMAX | Unimplemented attack: G-Max Centiferno |
| `swsh3-192` | Eternatus VMAX | Unimplemented Ability: Eternal Zone |
| `swsh3-195` | Pokémon Breeder's Nurturing | Unimplemented Trainer effect |
| `swsh3-196` | Rose | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
