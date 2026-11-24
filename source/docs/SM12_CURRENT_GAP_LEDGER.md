# SM12 — whole-set gap ledger

Canonical prints: **272** | Playable: **244** | Gated: **28**
Printed attacks: **376** (287 distinct full signatures) | Abilities: **64** (41 distinct signatures)
Trainer rule signatures: **27** | Special Energy rule signatures: **1**
Canonical Git blob: `e916e382122f759e4904762acd59b0d3a69a1bd1`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **12 prints** — Unimplemented Trainer effect — sm12-186, sm12-189, sm12-197, sm12-198, sm12-199, sm12-202, sm12-205, sm12-208, sm12-228, sm12-231, sm12-234, sm12-267
- **3 prints** — Unimplemented Ability: Blow-Away Bomb — sm12-76, sm12-77, sm12-243
- **2 prints** — Unimplemented Ability: Arf Arf Bark — sm12-176, sm12-248
- **2 prints** — Unimplemented Ability: Scatter — sm12-62, sm12-240
- **2 prints** — Unimplemented attack: Impersonation — sm12-96, sm12-245
- **2 prints** — Unimplemented attack: Mischievous Hands — sm12-96, sm12-245
- **1 prints** — Unimplemented Ability: Fighter's Roar — sm12-162
- **1 prints** — Unimplemented Ability: Grim Marking — sm12-85
- **1 prints** — Unimplemented Ability: Obnoxious Whirring — sm12-109
- **1 prints** — Unimplemented Ability: Spiritborne Evolution — sm12-83
- **1 prints** — Unimplemented Ability: Whirlpool Suction — sm12-57
- **1 prints** — Unimplemented attack: Balloon Burst — sm12-77
- **1 prints** — Unimplemented attack: Doll Swap — sm12-144
- **1 prints** — Unimplemented attack: Ominous Eyes — sm12-83
- **1 prints** — Unimplemented attack: Recall — sm12-56

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm12-56` | Empoleon | Unimplemented attack: Recall |
| `sm12-57` | Phione | Unimplemented Ability: Whirlpool Suction |
| `sm12-62` | Wishiwashi | Unimplemented Ability: Scatter |
| `sm12-76` | Koffing | Unimplemented Ability: Blow-Away Bomb |
| `sm12-77` | Weezing | Unimplemented attack: Balloon Burst; Unimplemented Ability: Blow-Away Bomb |
| `sm12-83` | Duskull | Unimplemented attack: Ominous Eyes; Unimplemented Ability: Spiritborne Evolution |
| `sm12-85` | Dusknoir | Unimplemented Ability: Grim Marking |
| `sm12-96` | Mimikyu | Unimplemented attack: Impersonation; Unimplemented attack: Mischievous Hands |
| `sm12-109` | Vibrava | Unimplemented Ability: Obnoxious Whirring |
| `sm12-144` | Clefairy | Unimplemented attack: Doll Swap |
| `sm12-162` | Hakamo-o | Unimplemented Ability: Fighter's Roar |
| `sm12-176` | Stoutland | Unimplemented Ability: Arf Arf Bark |
| `sm12-186` | Bellelba & Brycen-Man | Unimplemented Trainer effect |
| `sm12-189` | Cynthia & Caitlin | Unimplemented Trainer effect |
| `sm12-197` | Lillie's Poké Doll | Unimplemented Trainer effect |
| `sm12-198` | Mallow & Lana | Unimplemented Trainer effect |
| `sm12-199` | Misty & Lorelei | Unimplemented Trainer effect |
| `sm12-202` | Red & Blue | Unimplemented Trainer effect |
| `sm12-205` | Roxie | Unimplemented Trainer effect |
| `sm12-208` | Will | Unimplemented Trainer effect |
| `sm12-228` | Cynthia & Caitlin | Unimplemented Trainer effect |
| `sm12-231` | Mallow & Lana | Unimplemented Trainer effect |
| `sm12-234` | Red & Blue | Unimplemented Trainer effect |
| `sm12-240` | Wishiwashi | Unimplemented Ability: Scatter |
| `sm12-243` | Koffing | Unimplemented Ability: Blow-Away Bomb |
| `sm12-245` | Mimikyu | Unimplemented attack: Impersonation; Unimplemented attack: Mischievous Hands |
| `sm12-248` | Stoutland | Unimplemented Ability: Arf Arf Bark |
| `sm12-267` | Lillie's Poké Doll | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
