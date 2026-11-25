# Darkness Ablaze initial integration — v0.69.476

201 canonical prints, 138 enabled, 63 gated. The compact offline data was recovered from PokemonTCG/pokemon-tcg-data at revision `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`, Git blob `347f057fe4bc8cd952fda99aa12a1d9c5fa1c550`. Independently computed compact SHA-256 matches the bundled file exactly. Raw source download was blocked in the local environment; the connector supplied the pinned data.

The generator reuses exact signatures from prior sets, with new mappings for attacks, Abilities, Trainers and the Capture Energy reprint. It fails closed for unknown/invalid descriptors and evolution dependencies on unavailable V or Rare Fossil prints. Player and opponent set lists and picker include SWSH3; the indexed deck builder remains intact. Release version/Gradle/Termux gates and historical contract versions updated.

Validation: 22/22 SWSH3 tests, 287/287 Rebel Clash, Sword & Shield and deck-performance regression tests. Current-set static parity and Gradle source guards passed. All enabled attacks executed on both sides; targeted outcome tests cover Mad Party, X Ball, Bright Heal, Capture Energy, Cape of Toughness, Swoop Across and Power Whip. Full historical sweep, nested preparation, Android compilation and device validation not performed. Further semantic and CPU-choice audit required.

Next: use `SWSH3_CURRENT_GAP_LEDGER.md` to group remaining mechanics, including Sky Circus/Bird Keeper, Rare Fossil, Dark Asset, Eternal Zone, Special Energy and Trainer effects. Do not enable incomplete signatures or count catalogue presence as battle support.
