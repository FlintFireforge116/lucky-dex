# Unified Minds — initial integration (v0.69.450)

## Scope and source

Based on the v0.69.449 audited Unbroken Bonds source. Official SM11 catalogue is pinned to PokemonTCG/pokemon-tcg-data commit `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`, blob `215307311fc5b7a4edc9d238d6bbc91ce62b3dbb`. The 261 prints (1–258 plus 79a, 191a, 206a) retain 354 printed attacks (including two Tool GX attacks), 54 Abilities, 48 GX Pokémon, 24 TAG TEAM prints, 41 Trainers, four Special Energy prints. The bundled compact source is checksum-verified and generated offline. All 261 are catalogued; 137 are enabled (185 attacks, 16 Ability prints, five TAG TEAM prints, 13 Trainer prints); 124 are gated. No Special Energy is enabled in this pass.

## Implementation

Reuse complete printed attack signatures and existing typed descriptor handlers. Enable SM11 in the central catalogue, WebView script order, player deck builder, CPU generation and set picker. Preserve the Tool-granted GX attack text and costs even though the two Z-Crystals remain gated. The Coach Trainer optional bonus draw must not make the base draw illegal for a non-TAG TEAM Active: use the explicit optional-condition flag only on the conditional bonus, not on mandatory costs or restrictions. The full release preflight includes the earlier SM10 and DET1 regression gates.

## Checks and limits

SM11 integration/outcome suite: 21/21, including 370 enabled attack executions (185 per side) and targeted tests for Tandem Shock, Lightning Ride-GX, Trap Bolt, Hapu, Coach Trainer and Cherish Ball on both sides. Fire-only player and CPU deck-generation checks passed. Not an exhaustive audit of every enabled effect, deck type, or historical pairing. Some shared optional effects retain the existing engine's automatic resolution (e.g. Return). Further work must cover Perfection, Tool-granted attacks, Prize manipulation, evolving from the deck, new continuous/triggered effects, and both Special Energy rules. See `SM11_CURRENT_GAP_LEDGER.md` for the exact remaining prints. APK compilation/device testing is external.

Full local prepare completed: SM11 21/21, SM10 214/214, DET1 48/48, historical regression 30/30. Separate SM9 two-file suite 104/104; combined 417 tests, no failures or skips. Static Gradle source/version checks and changed JavaScript syntax checks passed.
