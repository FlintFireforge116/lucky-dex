# LuckyDex v0.69.231 — Mysterious Treasures, source integration (INCOMPLETE)

Status: **full printed-card catalogue registered, but NOT all cards battle-ready**. Do not announce this as complete. It is an incremental source patch after v0.69.230.

## Catalogue and implemented slice

- 124 collector-number prints registered under `dp2-1` through `dp2-124`; #124 Time-Space Distortion is the secret rare.
- **72/124 cards battle-enabled**: 64 Pokémon, 5 Trainers, 3 Special Energy; **52 restricted from battle and deckbuilding**.
- **108 battle-enabled attack entries**, each subjected to two-sided legal-action + execution smoke tests (216 paths).
- Trainers modeled in this pass: #109 Bebe's Search, #110 Dusk Ball, #113 Night Maintenance, #114 Quick Ball, #124 Time-Space Distortion. Each tested for legal play from both sides. Trainers #111 Fossil Excavator, #112 Lake Boundary, #115 Team Galactic's Wager, and both Fossils (#116/#117) are still gated.
- Special Energy: Multi Energy (#118) with existing Miracle/Colorless condition, Special Darkness (#119) +10 damage for Darkness Pokémon, Special Metal (#120) -10 damage to Metal Pokémon. Distinct from Basic Energy zone.
- Baby Evolution enabled: Chingling→Chimecho, Happiny→Chansey, Magby→Magmar, Pichu→Pikachu. The Baby remains underneath, with from-hand Power selection and healing.
- New attack paths include condition-dependent damage, team/Bench damage, opponent effects, selectable targets, discard recovery, status application, damage-counter scaling, named-attack restrictions, and typed Energy acceleration. All legacy sets remain installed.
- Mysterious Treasures appears as an available set in Classic picker, auto-builder and CPU set selection. Owned card IDs are resolved by `dp2-` numbering and set metadata.

## Restricted from battle for now

All unimplemented cards are explicitly catalogued with `support.status=PARTIAL`, `battleEnabled=false` and `deckEligible=false`. The restriction includes the three new Level-Up prints #121 Electivire LV.X, #122 Lucario LV.X, #123 Magmortar LV.X; the two Fossil-as-Pokémon trainers and their unimplemented evolution mechanics; reactive Powers such as Alakazam's Power Cancel; advanced Uxie/Mesprit/Azelf Powers and numerous evolution Bodies. This must be finished before the separate full-effect audit requested by the user.

**Do not call 124/124 battle-ready**. A catalogue registration is not a combat implementation. Other restricted cards are enumerated in the module's `coverage().gated` output.

## Verification and caveats

- New focused smoke: all 124 registered, 72 battle-enabled, 108 attacks exercised twice (player + CPU) without unselectable action or thrown exception, all five enabled Trainers playable from both seats, and one legally generated 30-card CPU deck for each of eight basic Energy types.
- **Smoke does not guarantee all optional branches are correct**. Some conditional attack and Energy-zone interactions need independent manual and automated outcome verification in the second pass. QA on the Android device has not occurred.
- Older cross-set test expected a fixed catalogue count. Changed that test to add the new 124 prints without rewriting its previous historical baseline.
- Baseline before this patch: v0.69.230; app/build.gradle v0.69.231/versionCode 7220; updated index/app version banner.
- User requested full-set entry then independent audit. This pass does **not** satisfy full entry. Finish all remaining 52 before describing any work as the separate audit.

## Required follow-up

1. Implement and validate all restricted printed Powers, Bodies and attacks with explicit user/CPU choices and correct zones.
2. Implement Fossil cards, their evolutions and knockout/trainer semantics.
3. Implement three Level-Up cards using DP1 Active-only/inherited attack rules plus their individual printed Powers, attack damage and Energy requirements.
4. Implement outstanding Stadium and Supporter interactions and test both player/CPU decisions.
5. Run print-by-print effect outcomes, deck synergy, hidden-hand, Energy and Prize tests; Android device test.
