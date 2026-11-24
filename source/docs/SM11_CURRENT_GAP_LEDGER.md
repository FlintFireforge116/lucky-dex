# SM11 — whole-set gap ledger

Canonical prints: **261** | Playable: **250** | Gated: **11**
Printed attacks: **354** (281 distinct full signatures) | Abilities: **54** (39 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **2**
Canonical Git blob: `215307311fc5b7a4edc9d238d6bbc91ce62b3dbb`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **5 prints** — Unimplemented Trainer effect — sm11-186, sm11-190, sm11-211, sm11-232, sm11-255
- **2 prints** — Unimplemented Special Energy rules — sm11-212, sm11-257
- **1 prints** — Unimplemented Ability: Electric Swamp — sm11-66
- **1 prints** — Unimplemented attack: Electro Rain — sm11-57
- **1 prints** — Unimplemented attack: Lazy Howl — sm11-167
- **1 prints** — Unimplemented attack: Sage's Riddle — sm11-182

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm11-57` | Alolan Raichu | Unimplemented attack: Electro Rain |
| `sm11-66` | Eelektross | Unimplemented Ability: Electric Swamp |
| `sm11-167` | Slakoth | Unimplemented attack: Lazy Howl |
| `sm11-182` | Oranguru | Unimplemented attack: Sage's Riddle |
| `sm11-186` | Blaine's Quiz Show | Unimplemented Trainer effect |
| `sm11-190` | Channeler | Unimplemented Trainer effect |
| `sm11-211` | U-Turn Board | Unimplemented Trainer effect |
| `sm11-212` | Recycle Energy | Unimplemented Special Energy rules |
| `sm11-232` | Channeler | Unimplemented Trainer effect |
| `sm11-255` | U-Turn Board | Unimplemented Trainer effect |
| `sm11-257` | Recycle Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
