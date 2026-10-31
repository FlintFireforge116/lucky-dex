# Current Pocket source and release audit — 2026-10-30

## Released vs announced

- C1 Dual Fusion: all 217 prints released October29 UTC (October28 18:00 PDT), including seven dual-type prints. [Official release announcement](https://www.pokemon.com/us/news/pokemon-tcg-pocket-dual-fusion-expansion-coming-soon).
- P-B-103 Pikachu ex: included now. The mission started October20 and requires ten login days, making October29 the earliest acquisition date. [Official missions](https://www.pokemon.com/us/news/complete-special-pika-pika-pikachu-missions-in-pokemon-tcg-pocket).
- P-C-001: November premium shop, not obtainable October30.
- P-C-002–009: Promo Pack C Vol1, official event starts November17 PDT.
- P-C-010–012: themed promo missions from November25 PDT.
- P-C-013: December premium shop.
- SP1 First Partners: October31, not released at this cutoff. Its 30 announced prints are not imported as collectible cards.

The [official schedule](https://www.pokemon.com/us/news/pokemon-tcg-pocket-dual-fusion-expansion-coming-soon) establishes event dates. Individual acquisition assignment cross-checks: [Dual Fusion acquisition list](https://www.pokemon-zone.com/events/dual-fusion-release/), [Promo C Vol1](https://www.pokemon-zone.com/events/promo-pack-c-series-vol-1/). Promo series metadata does not override individual print gates. Thirteen future P-C records are known but excluded, including artwork variants of already released cards; lookup of an excluded print never resolves to its released equivalent.

## Provenance and reproducibility

The previously pinned permissively licensed sources have no C1 content: Vociferix remains at September30 commit `2ab3fbb5c606dc6a5ca7fbb8e190c2a051505f69`; flibustier at `746566d75408c04fe35210c503351dc87aee00c5`; TCGdex was last pushed October19. PocketDecks v5 code/data was not used.

New factual source: [Limitless C1 full card list](https://pocket.limitlesstcg.com/cards/C1?display=full&show=all), [Promo C](https://pocket.limitlesstcg.com/cards/P-C?display=full&show=all), [P-B-103](https://pocket.limitlesstcg.com/cards/P-B/103). Independent extraction preserves every record's URL, captured-page hash, attacks, Abilities, stage, costs, HP, types, retreat, weakness, rule boxes and exact linked alternate prints in `data/tcgp/import/limitless-current-source.json`. The factual supplement is **not described as MIT-licensed**; card text/art remains Pokémon intellectual property. Original licensed inputs and notices remain intact.

`node scripts/import-current-pocket.cjs` deterministically adapts the frozen records; `node scripts/build-tcgp-catalogue.cjs` compiles and validates; `node scripts/verify-tcgp-catalogue.cjs` checks hashes and reports. Regeneration does not fetch network data. The independent HTML extractor and captured HTML are retained in the pass's research folder; future refreshes must obtain new source facts and individually review release gates before changing the cutoff.

Exact alternate-print tables identify 144 C1 gameplay groups: 13 reuse prior designs and 131 are new. Old source rules remain authoritative for those explicitly linked reprints; no same-name inference replaces mechanics. P-B-103 links to an existing Pikachu ex design. Thus 2319 +131 =2450 identities, and 4316 +217 +1 =4534 obtainable prints. Known stored inventory is4547 including13 excluded future promos.

Source-specific normalization: printed weakness `none` means no weakness; effect-only blank damage means zero printed damage but the complete effect still must compile. Ribombee's missing Sweet Honey name was verified against [the actual card image](https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/C1/C1_015_EN_SM.webp); the adapter has a before-value-checked correction for C1-015/135. Its rental-card mechanic remains PARTIAL. Standard ex/Mega point rule boxes are reviewed explicitly; unknown rule boxes still disable the card.

## Real deck-building interaction references

The [official October producer letter](https://www.pokemon.com/us/pokemon-news/read-the-pokemon-tcg-pocket-october-2026-producer-letter) explains Community Decks: inspect recipes, then copy with owned cards. [Pocket Deck Lab](https://calerio.github.io/pokemon-tcg-pocket-deck-builder/) and its public project provide a visual reference for a 20-card deck tray, separate Energy, category/type/stage/set filter sheet and inspection workflow. The implementation is original vanilla JS/CSS, without copying decorative assets or app code. Local recipes show actual owned completion and missing cards; they never grant ownership.

## Apparent v034/v035 regression

The previous user-designated replacement ZIP `EGG_EMERGENCY_0654_NOTES.zip` SHA256 `939c53294a5859394b943c1029909398c40daa90bf3c55723b03ab289251b907` actually contained v0.69.33 / Android7014. Its compiled audit had1145 FULL /543 PARTIAL /631 UNSUPPORTED. The user's direction made that ZIP authoritative over older work. v0.69.35 implemented460 more FULL identities from that baseline, reaching1605/714/0; it did not reclassify a supplied1801-FULL build downward. A v0.69.34 source/audit with1801 FULL was not supplied in that replacement baseline, so its claimed classifications cannot be independently reconstructed or silently restored.

This pass compares against the actual current v035 catalogue: all1605 FULL identities remain FULL; ten existing PARTIAL identities become FULL through reusable tested primitives/compositions;92 of131 new identities are FULL and39 remain PARTIAL. Total1707 FULL /743 PARTIAL /0 UNSUPPORTED. The original714 PARTIAL count falls to704; total PARTIAL rises only because39 genuinely new mechanics remain incomplete. Alternate art does not inflate these figures.
