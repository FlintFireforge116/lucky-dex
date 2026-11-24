# SM11 — whole-set gap ledger

Canonical prints: **261** | Playable: **241** | Gated: **20**
Printed attacks: **354** (281 distinct full signatures) | Abilities: **54** (39 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **2**
Canonical Git blob: `215307311fc5b7a4edc9d238d6bbc91ce62b3dbb`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **6 prints** — Unimplemented Trainer effect — sm11-186, sm11-190, sm11-205, sm11-211, sm11-232, sm11-255
- **3 prints** — Unimplemented Ability: Burning Road — sm11-25, sm11-216, sm11-238
- **2 prints** — Unimplemented Special Energy rules — sm11-212, sm11-257
- **1 prints** — Unimplemented Ability: Ancient Custom — sm11-45
- **1 prints** — Unimplemented Ability: Electric Swamp — sm11-66
- **1 prints** — Unimplemented Ability: Grind Up — sm11-156
- **1 prints** — Unimplemented Ability: Snack Search — sm11-173
- **1 prints** — Unimplemented attack: Downburst — sm11-176
- **1 prints** — Unimplemented attack: Electro Rain — sm11-57
- **1 prints** — Unimplemented attack: Lazy Howl — sm11-167
- **1 prints** — Unimplemented attack: Sage's Riddle — sm11-182
- **1 prints** — Unimplemented attack: Spirit Burner — sm11-30

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm11-25` | Heatran-GX | Unimplemented Ability: Burning Road |
| `sm11-30` | Chandelure | Unimplemented attack: Spirit Burner |
| `sm11-45` | Carracosta | Unimplemented Ability: Ancient Custom |
| `sm11-57` | Alolan Raichu | Unimplemented attack: Electro Rain |
| `sm11-66` | Eelektross | Unimplemented Ability: Electric Swamp |
| `sm11-156` | Haxorus | Unimplemented Ability: Grind Up |
| `sm11-167` | Slakoth | Unimplemented attack: Lazy Howl |
| `sm11-173` | Munchlax | Unimplemented Ability: Snack Search |
| `sm11-176` | Unfezant | Unimplemented attack: Downburst |
| `sm11-182` | Oranguru | Unimplemented attack: Sage's Riddle |
| `sm11-186` | Blaine's Quiz Show | Unimplemented Trainer effect |
| `sm11-190` | Channeler | Unimplemented Trainer effect |
| `sm11-205` | Pokémon Research Lab | Unimplemented Trainer effect |
| `sm11-211` | U-Turn Board | Unimplemented Trainer effect |
| `sm11-212` | Recycle Energy | Unimplemented Special Energy rules |
| `sm11-216` | Heatran-GX | Unimplemented Ability: Burning Road |
| `sm11-232` | Channeler | Unimplemented Trainer effect |
| `sm11-238` | Heatran-GX | Unimplemented Ability: Burning Road |
| `sm11-255` | U-Turn Board | Unimplemented Trainer effect |
| `sm11-257` | Recycle Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
