# SWSH10 — whole-set gap ledger

Canonical prints: **216** | Imported: **80** | Playable: **76** | Gated: **4** | Not imported: **136**
Printed attacks: **109** (92 distinct full signatures) | Abilities: **3** (3 distinct signatures)
Trainer rule signatures: **8** | Special Energy rule signatures: **1**
Canonical Git blob: `888a5253d3bf05bc4107d52742003ce42f1980f3`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **2 prints** — Unimplemented Trainer effect — swsh10-157, swsh10-213
- **1 prints** — Unimplemented Special Energy rules — swsh10-216
- **1 prints** — Unimplemented attack: Spooky Balloon — swsh10-64

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `swsh10-64` | Drifblim | Unimplemented attack: Spooky Balloon |
| `swsh10-157` | Unidentified Fossil | Unimplemented Trainer effect |
| `swsh10-213` | Path to the Peak | Unimplemented Trainer effect |
| `swsh10-216` | Double Turbo Energy | Unimplemented Special Energy rules |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
