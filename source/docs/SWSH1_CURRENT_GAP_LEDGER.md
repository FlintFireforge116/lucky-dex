# SWSH1 — whole-set gap ledger

Canonical prints: **216** | Playable: **191** | Gated: **25**
Printed attacks: **277** (244 distinct full signatures) | Abilities: **25** (20 distinct signatures)
Trainer rule signatures: **30** | Special Energy rule signatures: **1**
Canonical Git blob: `c43bc9ff9daa80e41bcd8952080b79825e8caa8f`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **6 prints** — Unimplemented Trainer effect — swsh1-166, swsh1-167, swsh1-168, swsh1-171, swsh1-182, swsh1-215
- **2 prints** — Unimplemented attack: Anchor Anger — swsh1-9, swsh1-187
- **1 prints** — Unimplemented Ability: Bug's Radar — swsh1-19
- **1 prints** — Unimplemented Ability: Ice Dance — swsh1-64
- **1 prints** — Unimplemented Ability: Libero — swsh1-34
- **1 prints** — Unimplemented Ability: Life Shaker — swsh1-85
- **1 prints** — Unimplemented Ability: Primate Wisdom — swsh1-148
- **1 prints** — Unimplemented Ability: Snap Trap — swsh1-132
- **1 prints** — Unimplemented Special Energy rules — swsh1-186
- **1 prints** — Unimplemented attack: Bedrock Shake — swsh1-99
- **1 prints** — Unimplemented attack: Carry Off — swsh1-144
- **1 prints** — Unimplemented attack: Cotton Ride — swsh1-6
- **1 prints** — Unimplemented attack: Hundred Foot Flames — swsh1-39
- **1 prints** — Unimplemented attack: Iron Wings — swsh1-135
- **1 prints** — Unimplemented attack: Octolock — swsh1-113
- **1 prints** — Unimplemented attack: Pluck — swsh1-151
- **1 prints** — Unimplemented attack: Ripping Horn — swsh1-47
- **1 prints** — Unimplemented attack: Sleepy Pulse — swsh1-88
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
| `swsh1-64` | Frosmoth | Unimplemented Ability: Ice Dance |
| `swsh1-85` | Gengar | Unimplemented Ability: Life Shaker |
| `swsh1-88` | Musharna | Unimplemented attack: Sleepy Pulse |
| `swsh1-99` | Rhyperior | Unimplemented attack: Bedrock Shake |
| `swsh1-113` | Grapploct | Unimplemented attack: Octolock |
| `swsh1-126` | Thievul | Unimplemented attack: Thief |
| `swsh1-132` | Galarian Stunfisk | Unimplemented Ability: Snap Trap |
| `swsh1-135` | Corviknight | Unimplemented attack: Iron Wings |
| `swsh1-144` | Noctowl | Unimplemented attack: Carry Off |
| `swsh1-148` | Oranguru | Unimplemented Ability: Primate Wisdom |
| `swsh1-151` | Corvisquire | Unimplemented attack: Pluck |
| `swsh1-166` | Hyper Potion | Unimplemented Trainer effect |
| `swsh1-167` | Lucky Egg | Unimplemented Trainer effect |
| `swsh1-168` | Lum Berry | Unimplemented Trainer effect |
| `swsh1-171` | Ordinary Rod | Unimplemented Trainer effect |
| `swsh1-182` | Sitrus Berry | Unimplemented Trainer effect |
| `swsh1-186` | Aurora Energy | Unimplemented Special Energy rules |
| `swsh1-187` | Dhelmise V | Unimplemented attack: Anchor Anger |
| `swsh1-215` | Ordinary Rod | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
