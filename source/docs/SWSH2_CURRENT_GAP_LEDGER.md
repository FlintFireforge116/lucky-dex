# SWSH2 — whole-set gap ledger

Canonical prints: **209** | Playable: **189** | Gated: **20**
Printed attacks: **283** (244 distinct full signatures) | Abilities: **37** (30 distinct signatures)
Trainer rule signatures: **18** | Special Energy rule signatures: **4**
Canonical Git blob: `500a9597c6e5989e900f93a1933420c568fbaab8`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **5 prints** — Unimplemented Special Energy rules — swsh2-171, swsh2-172, swsh2-173, swsh2-174, swsh2-209
- **3 prints** — Unimplemented Ability: Top Entry — swsh2-8, swsh2-32, swsh2-61
- **2 prints** — Unimplemented Trainer effect — swsh2-158, swsh2-162
- **2 prints** — Unimplemented attack: Max Beating — swsh2-18, swsh2-193
- **2 prints** — Unimplemented attack: Nine-Tailed Shapeshifter — swsh2-26, swsh2-177
- **1 prints** — Unimplemented Ability: Neutralizing Gas — swsh2-113
- **1 prints** — Unimplemented Ability: Prankish — swsh2-75
- **1 prints** — Unimplemented Ability: Protective Glow — swsh2-33
- **1 prints** — Unimplemented Ability: Screen Cleaner — swsh2-38
- **1 prints** — Unimplemented attack: Energy Warp — swsh2-77
- **1 prints** — Unimplemented attack: Severe Poison — swsh2-113
- **1 prints** — Unimplemented attack: Threatening Pattern — swsh2-11

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh2-8` | Lombre | Unimplemented Ability: Top Entry |
| `swsh2-11` | Masquerain | Unimplemented attack: Threatening Pattern |
| `swsh2-18` | Rillaboom VMAX | Unimplemented attack: Max Beating |
| `swsh2-26` | Ninetales V | Unimplemented attack: Nine-Tailed Shapeshifter |
| `swsh2-32` | Lampent | Unimplemented Ability: Top Entry |
| `swsh2-33` | Chandelure | Unimplemented Ability: Protective Glow |
| `swsh2-38` | Galarian Mr. Rime | Unimplemented Ability: Screen Cleaner |
| `swsh2-61` | Luxio | Unimplemented Ability: Top Entry |
| `swsh2-75` | Clefable | Unimplemented Ability: Prankish |
| `swsh2-77` | Xatu | Unimplemented attack: Energy Warp |
| `swsh2-113` | Galarian Weezing | Unimplemented attack: Severe Poison; Unimplemented Ability: Neutralizing Gas |
| `swsh2-158` | Dan | Unimplemented Trainer effect |
| `swsh2-162` | Nugget | Unimplemented Trainer effect |
| `swsh2-171` | Capture Energy | Unimplemented Special Energy rules |
| `swsh2-172` | Horror Psychic Energy | Unimplemented Special Energy rules |
| `swsh2-173` | Speed Lightning Energy | Unimplemented Special Energy rules |
| `swsh2-174` | Twin Energy | Unimplemented Special Energy rules |
| `swsh2-177` | Ninetales V | Unimplemented attack: Nine-Tailed Shapeshifter |
| `swsh2-193` | Rillaboom VMAX | Unimplemented attack: Max Beating |
| `swsh2-209` | Twin Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
