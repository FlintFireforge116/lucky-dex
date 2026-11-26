# SWSH11 — whole-set gap ledger

Canonical prints: **217** | Imported: **217** | Playable: **189** | Gated: **28** | Not imported: **0**
Printed attacks: **278** (237 distinct full signatures) | Abilities: **42** (32 distinct signatures)
Trainer rule signatures: **21** | Special Energy rule signatures: **1**
Canonical Git blob: `157da08c0435be1c0692faac35e3a7580e638afb`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **8 prints** — Unimplemented Trainer effect — swsh11-154, swsh11-165, swsh11-166, swsh11-167, swsh11-170, swsh11-195, swsh11-210, swsh11-214
- **2 prints** — Unimplemented Ability: Guardian of Love — swsh11-82, swsh11-178
- **2 prints** — Unimplemented attack: Ancient Star — swsh11-93, swsh11-199
- **2 prints** — Unimplemented attack: Blossom Tail — swsh11-82, swsh11-178
- **1 prints** — Unimplemented Ability: Crisis Muscles — swsh11-88
- **1 prints** — Unimplemented Ability: Cursed Message — swsh11-117
- **1 prints** — Unimplemented Ability: Jamming Attachment — swsh11-20
- **1 prints** — Unimplemented Ability: Lost Block — swsh11-107
- **1 prints** — Unimplemented Ability: Metal Lodging — swsh11-134
- **1 prints** — Unimplemented Ability: Moon-Watching Party — swsh11-62
- **1 prints** — Unimplemented Ability: Netherworld Gate — swsh11-66
- **1 prints** — Unimplemented Ability: Oceanic Accompaniment — swsh11-40
- **1 prints** — Unimplemented Ability: Puppet Offering — swsh11-73
- **1 prints** — Unimplemented Ability: Unfazed Fat — swsh11-143
- **1 prints** — Unimplemented attack: Chain of Spirits — swsh11-117
- **1 prints** — Unimplemented attack: Destructive Finish — swsh11-124
- **1 prints** — Unimplemented attack: Downgrading Beam — swsh11-142
- **1 prints** — Unimplemented attack: Geo Cannon — swsh11-91
- **1 prints** — Unimplemented attack: Screaming Circle — swsh11-66
- **1 prints** — Unimplemented attack: Splash Loop — swsh11-85
- **1 prints** — Unimplemented attack: Strong-Arm Lariat — swsh11-88
- **1 prints** — Unimplemented attack: Tempting Trap — swsh11-71
- **1 prints** — Unimplemented attack: Thumping Snore — swsh11-143
- **1 prints** — Unimplemented attack: Tricky Slap — swsh11-67
- **1 prints** — Unimplemented attack: Wonder Storm — swsh11-62

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh11-20` | Orbeetle | Unimplemented Ability: Jamming Attachment |
| `swsh11-40` | Finneon | Unimplemented Ability: Oceanic Accompaniment |
| `swsh11-62` | Clefairy | Unimplemented attack: Wonder Storm; Unimplemented Ability: Moon-Watching Party |
| `swsh11-66` | Gengar | Unimplemented attack: Screaming Circle; Unimplemented Ability: Netherworld Gate |
| `swsh11-67` | Mr. Mime | Unimplemented attack: Tricky Slap |
| `swsh11-71` | Mawile | Unimplemented attack: Tempting Trap |
| `swsh11-73` | Banette | Unimplemented Ability: Puppet Offering |
| `swsh11-82` | Enamorus V | Unimplemented attack: Blossom Tail; Unimplemented Ability: Guardian of Love |
| `swsh11-85` | Poliwrath | Unimplemented attack: Splash Loop |
| `swsh11-88` | Machamp | Unimplemented attack: Strong-Arm Lariat; Unimplemented Ability: Crisis Muscles |
| `swsh11-91` | Rhyperior | Unimplemented attack: Geo Cannon |
| `swsh11-93` | Aerodactyl VSTAR | Unimplemented attack: Ancient Star |
| `swsh11-107` | Barbaracle | Unimplemented Ability: Lost Block |
| `swsh11-117` | Spiritomb | Unimplemented attack: Chain of Spirits; Unimplemented Ability: Cursed Message |
| `swsh11-124` | Radiant Steelix | Unimplemented attack: Destructive Finish |
| `swsh11-134` | Hisuian Goodra | Unimplemented Ability: Metal Lodging |
| `swsh11-142` | Porygon-Z | Unimplemented attack: Downgrading Beam |
| `swsh11-143` | Snorlax | Unimplemented attack: Thumping Snore; Unimplemented Ability: Unfazed Fat |
| `swsh11-154` | Box of Disaster | Unimplemented Trainer effect |
| `swsh11-165` | Panic Mask | Unimplemented Trainer effect |
| `swsh11-166` | Riley | Unimplemented Trainer effect |
| `swsh11-167` | Thorton | Unimplemented Trainer effect |
| `swsh11-170` | Windup Arm | Unimplemented Trainer effect |
| `swsh11-178` | Enamorus V | Unimplemented attack: Blossom Tail; Unimplemented Ability: Guardian of Love |
| `swsh11-195` | Thorton | Unimplemented Trainer effect |
| `swsh11-199` | Aerodactyl VSTAR | Unimplemented attack: Ancient Star |
| `swsh11-210` | Thorton | Unimplemented Trainer effect |
| `swsh11-214` | Box of Disaster | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
