# Guardians Rising SM2 — final 34-print completion (v0.69.402)

## Catalogue

- Reproducible, bundled source: `data/classic/sm2-print-compact.json`, pinned upstream blob `0d2296a8c32fac6442c9b407653d30f8e9c3f0d6`.
- All **180/180** collector records generated with accurate printed Energy costs, exact text, GX attack markers, Prize count, stages, weakness/resistance, and player/CPU deck visibility.
- 34 previously gated prints now have explicit handlers. Status of `battleEnabled` is validated separately from any empirical claim that all edge cases are covered.

## Reusable systems completed

- Chandelure Shady Move; Wishiwashi Schooling; Oricorio Vital Dance; Tapu Koko-GX Aero Trail; Machoke Daunting Pose; Comfey Flower Shield; Komala Comatose.
- Roll Call, Hyper Jump, All the Presents, Frozen Breath, Copycat, Landslip, Future Sight, Doom News, The Wages of Fluff, Amass, Swallow Dive, Glance, Scrutinize, Flame Charge, Loop-the-Loop, Hypno Roll and the remaining printed attacks.
- Aether Paradise, Altar of the Moone, Altar of the Sunne, Brooklet Hill, Choice Band, Energy Loto, Energy Recycler, and Mallow.
- Choice Band includes GX and EX; Comfey removes existing conditions; Energy Recycler selects valid physical Basic Energy references for ledger recovery, not dummy IDs. Deck-search Energy Zone retrievals retain the globally established one-flip-per-Energy rule. Recovery from discard remains non-coin-gated.

## Quality gates

- Mandatory: `python3 scripts/preflight-sm2-release.py --full` runs clean source generation and the SM2, deck-quality and hybrid Energy suites.
- `node --test tests/v07411-guardians-rising-last-34.test.cjs` checks original 34 print flags, real player/CPU turn completion, actual damage, follow-up choices, conditional Status, hand/deck/Zone conservations, GX EX applicability, Stadium effects and Abilities.
- Existing Guardians Rising `v07407`, `v07408`, `v07409`, `v07410` and established earlier Energy/attack tests remain mandatory.
- Build success on GitHub needs confirmation after the user pushes the release; local preflight is not an Android APK compilation.
