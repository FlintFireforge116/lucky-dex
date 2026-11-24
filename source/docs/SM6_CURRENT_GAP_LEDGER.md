# SM6 — whole-set gap ledger

Canonical prints: **150** | Playable: **127** | Gated: **23**
Printed attacks: **211** (160 distinct full signatures) | Abilities: **25** (23 distinct signatures)
Trainer rule signatures: **16** | Special Energy rule signatures: **2**
Canonical Git blob: `7c9956b85945322c9c981db7a231be36fc524224`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **3 prints** — Prism Star attack/Ability or Trainer effect not yet implemented — sm6-31, sm6-96, sm6-110
- **3 prints** — Unimplemented Trainer effect — sm6-106, sm6-110, sm6-142
- **1 prints** — Unimplemented Ability: Abnormal Outbreak — sm6-5
- **1 prints** — Unimplemented Ability: Final Hour — sm6-46
- **1 prints** — Unimplemented Ability: First Law — sm6-96
- **1 prints** — Unimplemented Ability: Hydration — sm6-94
- **1 prints** — Unimplemented Ability: Jet Geyser — sm6-31
- **1 prints** — Unimplemented Ability: Poison Point — sm6-53
- **1 prints** — Unimplemented Ability: Silent Waves — sm6-42
- **1 prints** — Unimplemented Ability: Unnerve — sm6-19
- **1 prints** — Unimplemented Ability: Wondrous Gift — sm6-86
- **1 prints** — Unimplemented attack: Energy Teaser — sm6-44
- **1 prints** — Unimplemented attack: Knockout Reviver — sm6-55
- **1 prints** — Unimplemented attack: Limbo Limbo — sm6-12
- **1 prints** — Unimplemented attack: Mountaintop Mining — sm6-98
- **1 prints** — Unimplemented attack: Psychic Abduction — sm6-43
- **1 prints** — Unimplemented attack: Secret Blessings — sm6-84
- **1 prints** — Unimplemented attack: Standing By — sm6-26
- **1 prints** — Unimplemented attack: Swirling Petals — sm6-85
- **1 prints** — Unimplemented attack: Ticking Knock Out — sm6-49
- **1 prints** — Unimplemented attack: Trinity Star — sm6-96
- **1 prints** — Unimplemented attack: Twister — sm6-53
- **1 prints** — Unimplemented attack: Ultra Evolution — sm6-6
- **1 prints** — Unimplemented attack: Wink Wink — sm6-87

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm6-5` | Scatterbug | Unimplemented Ability: Abnormal Outbreak |
| `sm6-6` | Scatterbug | Unimplemented attack: Ultra Evolution |
| `sm6-12` | Alolan Marowak | Unimplemented attack: Limbo Limbo |
| `sm6-19` | Pyroar | Unimplemented Ability: Unnerve |
| `sm6-26` | Clawitzer | Unimplemented attack: Standing By |
| `sm6-31` | Volcanion ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Ability: Jet Geyser |
| `sm6-42` | Mesprit | Unimplemented Ability: Silent Waves |
| `sm6-43` | Azelf | Unimplemented attack: Psychic Abduction |
| `sm6-44` | Espurr | Unimplemented attack: Energy Teaser |
| `sm6-46` | Honedge | Unimplemented Ability: Final Hour |
| `sm6-49` | Aegislash | Unimplemented attack: Ticking Knock Out |
| `sm6-53` | Dragalge | Unimplemented attack: Twister; Unimplemented Ability: Poison Point |
| `sm6-55` | Poipole | Unimplemented attack: Knockout Reviver |
| `sm6-84` | Flabébé | Unimplemented attack: Secret Blessings |
| `sm6-85` | Floette | Unimplemented attack: Swirling Petals |
| `sm6-86` | Florges | Unimplemented Ability: Wondrous Gift |
| `sm6-87` | Sylveon | Unimplemented attack: Wink Wink |
| `sm6-94` | Goodra | Unimplemented Ability: Hydration |
| `sm6-96` | Arceus ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Trinity Star; Unimplemented Ability: First Law |
| `sm6-98` | Diggersby | Unimplemented attack: Mountaintop Mining |
| `sm6-106` | Eneporter | Unimplemented Trainer effect |
| `sm6-110` | Lysandre ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented Trainer effect |
| `sm6-142` | Eneporter | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
