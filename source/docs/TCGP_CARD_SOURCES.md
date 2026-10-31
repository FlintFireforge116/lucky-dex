# Pocket card source audit — 2026-10-27

## v0.69.35 source supplement (2026-10-30)

The cutoff and released print inventory are unchanged. A fourth MIT source, [Vociferix/ptcgp-data at2ab3fbb5c606dc6a5ca7fbb8e190c2a051505f69](https://github.com/Vociferix/ptcgp-data/tree/2ab3fbb5c606dc6a5ca7fbb8e190c2a051505f69), supplies detailed mechanics only for previously missing identities. Its exact set/collector-number versions join all4,317 known prints to abstract cards and agree with the existing design-key evidence, with zero conflicts. P-B-103 stays excluded. Source acquisition does not itself imply engine support.

Only1,140 released print records covering631 previously unknown identities are added; reviewed TCGdex records and existing errata are retained. The pinned archive SHA-256 is `22e894079516360ff97b15bc4839b351a105d8446985e9a8ed70919cca1e65fd`. Per-record source paths/hashes, complete upstream MIT notice and audit are in `data/tcgp/import/vociferix-*` and `Vociferix-LICENSE-MIT.txt`. The notice is included in runtime third-party notices. No upstream application code or image binaries are copied. Its mechanics data is transcribed from Limitless TCG per the upstream scraper; translations remain validated and fail closed.

Reproduce with `python scripts/import-vociferix-pocket.py /path/to/pinned-archive.zip`, then `node scripts/build-tcgp-catalogue.cjs` and `node scripts/verify-tcgp-catalogue.cjs`. The importer independently verifies archive hash, exact version references, set counts, exclusion boundary and all design joins. It performs no network request or name-based identity inference.

The card-data cutoff is **2026-10-27 (Europe/London)**. The compatible inventory contains **4,317 known prints** in **24 set/promo-series namespaces**: 22 expansions and two promo series. Of these, **4,316 prints were obtainable by the cutoff**. P-B-103 is retained as a known collectible print but excluded from released-card coverage: its missions started October 20 and the card requires ten daily logins, making October 29 the earliest obtainable date. Do not remove its print identity from the collection system.

## Release boundary

[The official Deluxe Pack: Mega announcement](https://www.pokemon.com/uk/news/pokemon-tcg-pocket-deluxe-pack-mega-coming-soon) gives September 29, 2026 at 18:00 PDT, which is September 30 UTC. This is the latest included booster expansion. [The official Dual Fusion announcement](https://www.pokemon.com/us/news/pokemon-tcg-pocket-dual-fusion-expansion-coming-soon) gives October 28 at 18:00 PDT, which is **October 29 at 01:00 UTC**, after the cutoff. Dual Fusion and Special Pack: First Partners previews are excluded. [The official October producer letter](https://www.pokemon.com/us/pokemon-news/read-the-pokemon-tcg-pocket-october-2026-producer-letter) describes the forthcoming new series and special pack.

[The official Pika Pika missions announcement](https://www.pokemon.com/us/news/complete-special-pika-pika-pikachu-missions-in-pokemon-tcg-pocket) establishes the October 20 start and ten-login-day requirement for P-B-103. Promo-B 096–100 were distributed during the Mega Garchomp ex Drop Event beginning October 15; 101–102 were distributed by the October Charmander/Drampa wonder pick event. Those seven prints predate the cutoff. Promo series opening dates below do not establish the availability date of every later promo.

## Inventory

The roster and collector counts below come from the pinned MIT sources, not the AGPL v5 expansions export. Release dates follow the sources' UTC/international convention. In particular, some official US announcements use the preceding PDT calendar date.

| Set | Name | Series/set release date | Known prints |
| --- | --- | --- | ---: |
| A1 | Genetic Apex | 2024-10-30 | 286 |
| A1a | Mythical Island | 2024-12-17 | 86 |
| A2 | Space-Time Smackdown | 2025-01-29 | 207 |
| A2a | Triumphant Light | 2025-02-28 | 96 |
| A2b | Shining Revelry | 2025-03-27 | 111 |
| A3 | Celestial Guardians | 2025-04-30 | 239 |
| A3a | Extradimensional Crisis | 2025-05-29 | 103 |
| A3b | Eevee Grove | 2025-06-26 | 107 |
| A4 | Wisdom of Sea and Sky | 2025-07-30 | 241 |
| A4a | Secluded Springs | 2025-08-28 | 105 |
| A4b | Deluxe Pack: ex | 2025-09-30 | 379 |
| P-A | Promo A | 2024-10-30 | 117 |
| B1 | Mega Rising | 2025-10-30 | 331 |
| B1a | Crimson Blaze | 2025-12-17 | 103 |
| B2 | Fantastical Parade | 2026-01-29 | 234 |
| B2a | Paldean Wonders | 2026-02-26 | 131 |
| B2b | Mega Shine | 2026-03-26 | 117 |
| B3 | Pulsing Aura | 2026-04-28 | 234 |
| B3a | Paradox Drive | 2026-05-28 | 109 |
| B3b | Everyday Wonders | 2026-06-30 | 106 |
| B4 | Ruler of the Skies | 2026-07-30 | 233 |
| B4a | Team Rocketâ€™s Ambition | 2026-08-27 | 110 |
| B4b | Deluxe Pack: Mega | 2026-09-30 | 429 |
| P-B | Promo B | 2025-10-30 | 103 |

## Sources and redistribution

1. **PocketDecks legacy v4**, commit `ec444f849be468d0104977906b4e1f14b42a5d47`: [repository](https://github.com/PocketDecks/pokemon-tcg-pocket-cards), [legacy data](https://raw.githubusercontent.com/PocketDecks/pokemon-tcg-pocket-cards/ec444f849be468d0104977906b4e1f14b42a5d47/data/v4/cards.json), [MIT notice](https://raw.githubusercontent.com/PocketDecks/pokemon-tcg-pocket-cards/ec444f849be468d0104977906b4e1f14b42a5d47/LICENSE-MIT). Copyright 2024 Chase Manning. The repository explicitly preserves MIT licensing for v1–v4; v5 has a different licence. The 4,317-print v4 JSON is bundled verbatim for print identity and collection metadata. It has no attack, ability, evolution, weakness or retreat information. No v5 dataset or v5 application code was incorporated into this work.
2. **flibustier/pokemon-tcg-pocket-database**, commit `746566d75408c04fe35210c503351dc87aee00c5`: [repository](https://github.com/flibustier/pokemon-tcg-pocket-database), [MIT licence](https://raw.githubusercontent.com/flibustier/pokemon-tcg-pocket-database/746566d75408c04fe35210c503351dc87aee00c5/LICENSE). Copyright 2025 Jon (flibustier). Its basic `dist/cards.json` and `dist/sets.json` are bundled verbatim. These supply 4,317 print records, card-design asset IDs and release metadata. **Do not use `cards.extra.json` combat defaults**: inspection found e.g. Bulbasaur, Ivysaur and Venusaur all assigned HP 50/retreat 1, and it provides no attacks.
3. **TCGdex/cards-database**, commit `cbddf7e54033b1b58e44af1049c88832e55b94d0`: [repository](https://github.com/tcgdex/cards-database), [MIT licence](https://raw.githubusercontent.com/tcgdex/cards-database/cbddf7e54033b1b58e44af1049c88832e55b94d0/LICENSE). Copyright 2021 TCGdex. English data values were extracted from 2,480 Pocket card data literals across 15 sets through Paldean Wonders. Attacks, costs, damage, effects, abilities, evolution, HP, weaknesses, retreat and Trainer categories are retained. Per-card paths and SHA-256 hashes identify the original literal files. Source/application code and binary art are not shipped.
4. **TCGdex pending `feat/add-A4b` branch**, commit `00eb8499ed1526bf4df8d5b1c724ba02ba081507`: [data branch](https://github.com/tcgdex/cards-database/tree/00eb8499ed1526bf4df8d5b1c724ba02ba081507/data/Pok%C3%A9mon%20TCG%20Pocket), same MIT notice. A further 288 English Deluxe Pack: ex card records are imported. This is an incomplete source export; asset identity fills only verified reprints from known rules.

Required complete MIT notices are retained beside the imported data. Their grants permit copying/modification/redistribution provided the copyright and permission notices remain. These repository grants do not transfer ownership of Pokémon names, trademarks, card artwork or other underlying intellectual property. No new image binaries are bundled. Existing LuckyDex artwork metadata/cache behaviour remains the artwork source.

Sources inspected but **not incorporated** include PocketDecks v5 (AGPL-3.0-or-later), R4PH1/PTCGP-Data, hugoburguete/pokemon-tcg-pocket-card-database and buzzo123/pokemon-tcg-pocket-api (the latter repositories did not expose a suitable dataset licence). A repository calling itself open source does not substitute for a licence grant. The rejected Mega Shine TCGdex contribution was not imported: its set code/count description did not match the released set and it was not merged.

## Gameplay identity evidence

`data/tcgp/import/identity-evidence.json` maps every canonical print ID (e.g. `A1-001`) to a source card-design key (e.g. `cPK:000010`). The exact anchored regex is `^(cPK|cTR)_\d+_(\d+)_`. Both the Pokémon/Trainer namespace and numeric design segment are retained; art family, art variant and rarity are omitted. This yields **2,319 source card-design identities**. Different Bulbasaur rules remain separate: A1 uses `cPK:000010`, Crimson Blaze uses `cPK:013070`.

This is stronger evidence than matching names. Rules may propagate only from known detailed MIT records with a consistent normalized gameplay fingerprint and validated name/ex metadata. Print ownership IDs remain separate from gameplay IDs. Without reviewed corrections, the known raw records contain 16 conflicting identity families; blindly choosing the first record is unsafe.

`data-quality-overrides.json` contains **34 reviewed field operations** with before-values and evidence. They resolve all 16 known conflicting families against the normalizer fingerprint at acquisition time. Corrections use same-identity MIT donor records and MIT printed names, with factual reference spot-checks for conflicting numbers or restrictions. They fix Blastoise's attack cost, Dragon weakness placeholders, Baxcalibur HP, Maushold/Tinkaton pre-evolutions, Gholdengo retreat, missing printed ex name suffixes, Pachirisu's Lightning-only target restriction and equivalent text typography. Imported raw records remain immutable. Apply these operations before fingerprint comparison. The identity evidence retains the original conflicts for audit.

The 2,768 detailed records cover **1,688 known source identities / 3,177 prints** after exact identity propagation. **631 source identities / 1,140 prints lack permissively licensed detailed mechanics** in the acquired sources. These are data-coverage figures, not engine FULL/PARTIAL/UNSUPPORTED totals. A generated Battle Lab coverage report must distinguish missing data from unsupported effect handlers and must not claim every released mechanic is implemented.

## Reproducibility

`provenance.json` records exact revisions, upstream paths, byte counts and SHA-256 hashes of every imported JSON payload. `cutoff.json` is the machine-readable release boundary and roster. Required notices are local beside those inputs. The runtime must consume only generated local LuckyDex data; it must not fetch these sources during battles.

The acquisition tool is `scripts/import-tcgp-sources.py` (Python standard library only). Its default mode performs offline byte/hash verification without network access or writes:

```sh
cd ~/lucky-dex/source
python scripts/import-tcgp-sources.py
```

An explicit refresh retrieves only the immutable revisions and expected payload hashes in `data/tcgp/import/provenance.json`. It checks the complete MIT notices against the reviewed local notices before fetching any card data. It stages downloaded/extracted values in memory and writes inputs only after all six expected byte lengths and SHA-256 hashes match. It does not advance branches or change corrections, identity evidence, release cutoff, or generated runtime data:

```sh
python scripts/import-tcgp-sources.py --refresh
```

For offline source reproduction, supply the two revision-pinned TCGdex archives (the same archive URLs used by `--refresh`). Archives are read in memory, and no upstream files or paths are extracted to disk:

```sh
python scripts/import-tcgp-sources.py --reproduce \
  --archive-main /path/to/tcgdex-main.zip \
  --archive-a4b /path/to/tcgdex-a4b.zip
```

The tool uses a restricted data-literal parser, **not eval, a JavaScript VM, TypeScript execution, imports, or application code execution**. It accepts objects, arrays, quoted strings, numbers, booleans/null and the two inert `Set`/`serie` references; function calls, expressions, spreads, methods, template strings and unknown identifiers are rejected. Import declarations are ignored and an export-data-only tail is required. It extracts English fields using the original insertion order and retains original source paths/SHA-256 values. The restricted parser was verified against all imported literals and reproduced the **2,480-card JSON, 15-set JSON and 288-card Deluxe JSON byte for byte**. The end-to-end network refresh also passed all six payload hashes. Four valid grammar samples passed; nine executable/unsafe samples were rejected.

To acquire a future source revision, first inspect its licence and the legacy-v4 scope statement. Review and update the immutable revisions, expected hashes/lengths and scope in `provenance.json`; the tool deliberately fails on unreviewed hash differences and never offers a force/skip-verification mode. Update local notices only after reviewing any actual licence change. Fetch only the explicitly compatible card/set inputs. For TCGdex, fetch a revision-pinned archive, select the Pocket data literal directory, extract English values from the literal objects, omit the imported `set` reference and all application code, add canonical set/collector IDs, and retain each source path/hash. Repeat the conflict/name audit before propagating by design ID. Re-run the project's catalogue generator, validation and coverage commands documented in `TCGP_CARD_DATABASE.md`; newly introduced mechanics must remain visibly unsupported until implemented and tested.

Historical import JSON and notices are development inputs. They are not repeatedly parsed by Battle Lab. Do not add third-party API calls to the runtime.
