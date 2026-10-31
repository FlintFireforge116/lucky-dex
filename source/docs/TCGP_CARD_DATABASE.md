# Pocket gameplay database and update procedure

Cutoff: **27 October 2026, Europe/London** (unchanged in this pass). The authoritative baseline is the supplied `EGG_EMERGENCY_0654_NOTES.zip`, actually v0.69.33/7014. Release is v0.69.35/7016. The prompt's v0.69.34 counts were not present in that ZIP and no older/different archive was substituted. Canonical application files remain under `source/`.

## What is covered

The inventory spans **24 expansion/promo namespaces**, **4,317 known prints**, **4,316 obtainable by cutoff**, and **2,319 distinct gameplay identities**. P-B-103 is a known collectible preview; its ten-login-day mission makes October 29 its first obtainable date, after this cutoff. Dual Fusion and First Partners are future releases and excluded. The existing collection feed and ownership records are untouched.

Current support is **1,605 FULL, 714 PARTIAL, 0 UNSUPPORTED**, an increase of460 FULL over the supplied baseline. This is **not a claim of full gameplay support for every released card**. Every non-FULL identity is named with its exact reason in [TCGP_CARD_COVERAGE.md](TCGP_CARD_COVERAGE.md), with all affected print IDs in `generated/tcgp-card-coverage.json`. The per-pass `generated/tcgp-implementation-audit-v06935.json` accounts for every one of the1,174 initially non-FULL identities, with original reasons, current text/mechanics, resolution category and final validation status. Non-FULL cards remain visible in owned deck browsing, with reasons, but cannot enter a legal playable deck.

FULL requires complete recorded mechanics and context-appropriate structured handlers. PARTIAL has detailed rules but at least one unsupported mechanic or unresolved data-quality restriction. UNSUPPORTED means detailed compatible combat data is unavailable; it is now zero. The new pinned MIT Vociferix supplement resolves all631 previous source-data gaps using exact print/design joins, not same-name inference, and preserves reviewed TCGdex mechanics. See the source audit for complete notice, provenance and reproducible importer. The originally rejected AGPL dataset was not incorporated.

## v0.69.35 mechanics and deck tooling

Offline anchored translations compose statuses, Energy damage, filtered search, Bench counts, movement and single shared coin branches. Unknown clauses, ambiguous multi-sentence coin scope and independent target selections fail closed. New generic primitives cover top-deck discard, own-team healing via an all-own selector, and damage-based attack bonuses; an explicit no-op supports empty coin branches. Mismagius's secondary movement can do nothing without blocking its base attack. No runtime natural-language interpreter or per-card special handler was added.

Deck analysis separates illegal decks from strategy warnings, detects missing coloured Energy and unpowerable attackers, missing lower stages and unused typed Energy. Quick Build searches compatible owned Pokémon profiles, completes evolution chains, respects name-based two-copy limits and ownership, selects Trainers and reports its strategy. Colourless and free costs are not inferred from Pokémon type. Manual Energy is preserved with warnings; automatic Energy follows card edits and is saved as such. Old saved explicit Energy remains manual. CPU challenge configurations pass the same powerability checks.

Developer card/Pokémon, type, set and mechanic focus operate on owned FULL cards. PARTIAL focus currently reports blockers rather than generating a playable PARTIAL-card fixture; that part of the requested testing workflow remains unfinished. The UI does not mislabel incomplete cards as FULL or silently enable them.

## Identity and compatibility

`app/src/main/assets/tcgp/generated/catalogue.js` is a generated local UMD dataset loaded once before the existing `tcgp-battle-data.js`. The adapter keeps the existing public API and supplied beginner deck. `cardById` accepts exact print aliases while returning canonical rules. Collections continue storing original print IDs, quantities, set/rarity/art metadata and history. Saved decks may retain alternate-print IDs; legality aggregates their canonical ownership and applies the two-copy limit by normalized printed name, including accent variants of Poké Ball. Different same-name cards retain distinct gameplay identities while sharing the name-based copy allowance.

MIT source asset filenames encode namespace-aware internal card-design keys. Rules propagate only across the same key after full gameplay-fingerprint conflict checks and reviewed errata. The importer keeps all immutable raw records, 34 explicit field corrections and before-value checks. This prevents a faulty source variant from silently changing an entire art family. See [TCGP_CARD_SOURCES.md](TCGP_CARD_SOURCES.md) for exact commits, licences, references and acquisition commands.

## Rules and limitations

The existing reducer and portrait battlefield remain. Thirty validated reusable effect types cover flat/conditional/coin/Energy/Bench/selected damage, healing, Energy attachment/movement/discard, draw/search/hand reset, switching, conditions, prevention, persistent modifiers, abilities, Supporters, Tools, passive Stadiums and Fossils. Effect text is display content; only development-time reviewed anchored patterns produce runtime descriptors. Unknown or partly recognized text never becomes an automatic flat attack. Every emitted effect reference must validate, even on a PARTIAL card.

Pocket Confusion fails the attack on tails without physical-TCG self-damage. Condition checkup, typed weakness, Bench damage, damage prevention, two-sided/simultaneous KOs, manual promotion, once-per-turn abilities, Supporter/Tool/Stadium restrictions, and Fossil voluntary discard use explicit reducer behavior. Fossils remain Trainer cards for opening-hand/deck Basic rules. One to three Energy types are saved per deck and generated through seeded battle RNG. Existing single-type seeded behavior remains stable.

Known remaining mechanics include opponent-chosen forced switches (e.g. Pidgeot Drive Off/Sabrina), restricted Bench Energy distribution (e.g. Lilligant), attack copying, discard-Energy recovery, activated Stadium effects (Mesagoza), hand/deck inspection, complex evolution and multi-selection effects. All affected cards remain explicitly non-FULL. A single action currently carries one independent selected effect target; the compiler rejects compound rules requiring two independent selections. The existing Solo 50-turn opponent-win policy is preserved and is a known divergence from rulesets using a draw at the turn limit. No Expert AI, economy or unrelated minigame change is included.

## Rebuild and validate offline

From `~/lucky-dex/source`:

```sh
python scripts/import-tcgp-sources.py
node scripts/build-tcgp-catalogue.cjs
node scripts/verify-tcgp-catalogue.cjs
node --test tests/v06933-tcgp-normalizer.test.cjs tests/v06933-tcgp-validation.test.cjs tests/v06933-tcgp-catalogue.test.cjs tests/v06933-tcgp-card-execution.test.cjs
npm test
```

The import command defaults to offline verification. Its explicit `--refresh` checks licences before fetching only pinned revisions, and its restricted literal parser never executes upstream code. A refresh must match the reviewed hashes; it does not silently advance datasets or change cutoff/errata. Rebuilding from the checked-in inputs is deterministic and performs no network access. The verifier checks schema, every print mapping, all effect references, coverage/runtime agreement, input hashes and complete MIT notices bundled in Android assets.

For a future expansion: review its release date and compatible data licence; update pinned source inputs/provenance and cutoff; rebuild exact card-design evidence and review conflicting names/fingerprints; add tests and implementations for new mechanics; regenerate; run validation, card execution and seeded simulations; inspect the coverage diff. New mechanics remain non-FULL until supported. Do not edit the generated table by hand or use unreviewed source text as runtime code.

## Artwork and performance

No new card image binaries are included. Existing owned image metadata, art URLs and cache recovery remain in use; missing artwork does not disable a supported gameplay card. The generated table is about **1.77 MB** and indexed once. One local Node measurement loaded/indexed it in **51.453 ms**, retaining about **8.31 MB** of heap; these are host observations, not Android timings. Owned browsing renders 100 rows at a time and searches all canonical rows/print IDs. Real Chrome tests cover the full 4,316-print fixture and mobile interactions. No native Android/device result is claimed.

## Delivery

`scripts/package-tcgp-cards-patch.py` derives changed/new source files from the actual Git baseline diff and can independently compare them with the supplied ZIP. It rejects unrelated runtime changes, unchanged patch entries, signer changes and non-version main-app/build edits. ZIP entries are relative to `source/`; no repository root prefix, `.git`, dependencies, caches, build output or image library is shipped. No deletion list is produced when no files are removed. Follow [TCGP_IMPLEMENTATION_REPORT_v06933.md](TCGP_IMPLEMENTATION_REPORT_v06933.md) for exact test results and Termux handoff.
