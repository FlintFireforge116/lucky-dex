# Forbidden Light — consolidated continuation (v0.69.419)

## Coverage
150 pinned official prints, 211 attacks, 25 Abilities. Before: 58 playable / 92 gated. After: 127 playable / 23 gated (+69 prints). Remaining blockers are listed by print in SM6_CURRENT_GAP_LEDGER.md; no complete-set claim.

Implemented shared Prize conditions and GX effects (Stinger, Doom Count, Sanctuary, Verdict, Photon Geyser and Sky-Scorching Light); Psychic Recharge and evolution-from-hand Shuriken; Beast Ring, Beast Energy, Ultra Space and Ultra Recon Squad; Bonnie, Judge, Diantha, Crasher Wake, Mysterious Treasure, Fossil Excavation Map, Metal Frying Pan, Lysandre Labs; multiple ordinary attacks, passive modifiers and Diancie Prism Star. Beast Ring uses an actual selected Ultra Beast and one coin per Energy Zone search attempt. Physical deck Energy is handled separately. Discard recovery never consumes new Zone supply. Tool type matches runtime `Tool` rather than the printed subtype `Pokémon Tool`.

## Verification
- Full generated SM6 release preflight: 36/36 tests passed, including 22 new player/opponent outcome tests.
- SM5 stage 1–13 regression and final coverage: 235/235 passed.
- SM3, SM4 and SM5 static release gates passed.
- No Android APK/GitHub build executed locally. Remaining 23 prints are explicitly gated; a separate independent audit is required after they are implemented.

## Installation
From `~/lucky-dex`, unzip this source-relative patch into `source`, run `sh source/scripts/prepare-sm6.sh`, then commit and push only if it succeeds. The canonical SM6 source and attestation already exist in the supplied repository. The Gradle prebuild still runs the SM6 and preceding set gates.
