# SM7 — whole-set gap ledger

Canonical prints: **187** | Playable: **172** | Gated: **15**
Printed attacks: **232** (188 distinct full signatures) | Abilities: **51** (34 distinct signatures)
Trainer rule signatures: **28** | Special Energy rule signatures: **1**
Canonical Git blob: `11606d6f86947a5906324a60d330ff88c702218b`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **3 prints** — Unimplemented Ability: Extra Energy Bomb — sm7-48, sm7-155, sm7-172
- **3 prints** — Unimplemented Trainer effect — sm7-125, sm7-141, sm7-182
- **3 prints** — Unimplemented attack: Crush and Burn-GX — sm7-48, sm7-155, sm7-172
- **1 prints** — Prism Star attack/Ability or Trainer effect not yet implemented — sm7-97
- **1 prints** — Unimplemented Ability: Electric Start — sm7-52
- **1 prints** — Unimplemented Ability: Energy Grounding — sm7-50
- **1 prints** — Unimplemented Ability: Falling Star — sm7-83
- **1 prints** — Unimplemented Ability: Red Eyes — sm7-65
- **1 prints** — Unimplemented Ability: Wish Upon a Star — sm7-97
- **1 prints** — Unimplemented attack: Double Charge — sm7-52
- **1 prints** — Unimplemented attack: Enemy Show — sm7-65
- **1 prints** — Unimplemented attack: Lightning Strike — sm7-50
- **1 prints** — Unimplemented attack: Mining — sm7-91
- **1 prints** — Unimplemented attack: Perish Dream — sm7-97
- **1 prints** — Unimplemented attack: Sandy Fear-GX — sm7-82
- **1 prints** — Unimplemented attack: Steelworks — sm7-98
- **1 prints** — Unimplemented attack: Strike and Run — sm7-110

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `sm7-48` | Electrode-GX | Unimplemented attack: Crush and Burn-GX; Unimplemented Ability: Extra Energy Bomb |
| `sm7-50` | Lanturn | Unimplemented attack: Lightning Strike; Unimplemented Ability: Energy Grounding |
| `sm7-52` | Manectric | Unimplemented attack: Double Charge; Unimplemented Ability: Electric Start |
| `sm7-65` | Banette | Unimplemented attack: Enemy Show; Unimplemented Ability: Red Eyes |
| `sm7-82` | Palossand-GX | Unimplemented attack: Sandy Fear-GX |
| `sm7-83` | Minior | Unimplemented Ability: Falling Star |
| `sm7-91` | Mawile | Unimplemented attack: Mining |
| `sm7-97` | Jirachi ◇ | Prism Star attack/Ability or Trainer effect not yet implemented; Unimplemented attack: Perish Dream; Unimplemented Ability: Wish Upon a Star |
| `sm7-98` | Heatran | Unimplemented attack: Steelworks |
| `sm7-110` | Dunsparce | Unimplemented attack: Strike and Run |
| `sm7-125` | Beast Ball | Unimplemented Trainer effect |
| `sm7-141` | Rainbow Brush | Unimplemented Trainer effect |
| `sm7-155` | Electrode-GX | Unimplemented attack: Crush and Burn-GX; Unimplemented Ability: Extra Energy Bomb |
| `sm7-172` | Electrode-GX | Unimplemented attack: Crush and Burn-GX; Unimplemented Ability: Extra Energy Bomb |
| `sm7-182` | Rainbow Brush | Unimplemented Trainer effect |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
