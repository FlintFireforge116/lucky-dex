# Celebrations stage 1 — v0.69.521

Main set: 25 canonical prints, 21 playable and four gated. Source pinned to PokemonTCG/pokemon-tcg-data commit 90f27d0e14cefe48ccb2b8922a7a356b2fcf0072, blob acf67f8e6a03676a02c81faaa7eefcc68a0ea97a. The compact catalogue was checksum-verified against the retrieved source.

Reviewed reused effects cover Flying/Surfing Pikachu V and VMAX, Zacian V, Zamazenta V, both Mew prints, Solgaleo, Reshiram, Zekrom, Palkia, Ho-Oh, Groudon, Dialga, Lugia and both Professor's Research prints. CPU Celebrations-only generation has a bounded two-type fallback preserving the chosen primary Pokémon type, requested set, builder restrictions and complete Energy plan. Player builders can explicitly select two types. Not all single types have enough cards for a 30-card deck.

Gated: Kyogre (top-deck Energy count and two selected Bench targets), Xerneas (distinct basic Energy types), Lunala (damage-counter doubling across opposing field), Yveltal (optional distributed Special Energy removal). Classic Collection (cel25c, 25 historical reprints) is not integrated in this stage. Preserve original upstream unique IDs and image keys; collector number 15 is shared by four distinct cards. Verify historical weakness/resistance, reprint identity and rules rather than matching by name alone.

Shared top-deck selection now respects the actual hand cap before removing the selected card; Mew full-hand and top-six tests pass for both sides. Audit targets: exact cross-professor Research copy limits, unsupported tiny-pool filters, and all four remaining main-set effects. Android compilation and device testing not performed here.

The historical quality gate found that unrestricted competitive/random Celebrations drafts could exceed the two-type Energy plan. The player builder now retries a compatible pair only when no explicit filter is selected, and rejects a draft with missing attack types. Both styles pass the existing cross-era quality gate. The CPU avoids 22 repeated identical mono-type attempts in this small set.
