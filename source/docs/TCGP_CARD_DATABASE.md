# Pocket gameplay database and update procedure

Current release: **v0.69.37 / Android 7018**. Source of truth is the newly supplied `lucky-dex-main.zip`, user-confirmed v0.69.36 despite stale build labels. Older archive histories do not define this baseline.

## Inventory and support

Reviewed catalogue cutoff: **30 October 2026, Europe/London**. There are 26 known set/promo namespaces, 4,547 known prints, 4,534 obtainable prints, and 2,450 canonical gameplay identities. All 217 Dual Fusion C1 prints and obtainable P-B-103 are included; 13 individually future-dated Promo-C prints remain excluded. The application-only supplied Poké Ball is outside collectible coverage totals.

**1,833 FULL / 617 PARTIAL / 0 UNSUPPORTED**; 126 more FULL than the exact supplied baseline, no previously FULL regressions. FULL requires every recorded mechanic to have validated handlers. PARTIAL cards retain detailed rules and exact blockers but cannot enter legal battles. UNSUPPORTED denotes absent compatible combat data. Counts measure identities, not alternate-art inflation. See generated per-set/delta/missing-family details and every remaining card in [coverage](TCGP_CARD_COVERAGE.md) and `generated/tcgp-card-coverage.json`.

Release audit date: **31 October 2026**. First Partners is officially released today, beyond the reviewed October 30 inventory. A reviewed card-by-card structured capture is unavailable in this source, so SP1 is recorded as a known released inventory gap, not called unreleased or silently invented. The primary release announcement is recorded in `data/tcgp/import/release-audit-v06937.json`. A future import must establish exact print IDs, mechanics and provenance before enabling those cards.

## Mechanics and testing

Reusable selectors, conditions, modifiers and effect composition now cover typed team healing/Energy, eligible switching/Bench damage, named/evolved Bench conditions, conditional attack bonuses, both-Active statuses/discard, movement, Bench-only auras and end-turn healing. Ambiguous or unsupported clauses fail closed; there is no runtime natural-language interpreter or arbitrary card-specific handler catalogue.

The full enabled catalogue executes through the real core with deterministic positive/negative fixtures and 1,000 seeded stress battles. Two positive preconditions remain unavailable because all required counterparts are PARTIAL: Latias/Latios and Cynthia/Garchomp-or-Togekiss. Their legal negative branches execute; no disabled fixture is substituted or test represented as full positive coverage.

Ownership remains print-based and legal quantities canonical. The editor stores cosmetic `preferredPrints` and falls back to owned artwork. It neither grants ownership nor changes mechanics. Recipes and CPU decks share the workspace infrastructure; fixed CPU decks must pass legality, complete-line and Energy checks. Developer test decks are temporary, use owned FULL cards and cannot award progression. PARTIAL inspection shows exact blockers; it cannot create a playable unsupported mechanic.

Run `node scripts/build-tcgp-catalogue.cjs`, then `node scripts/verify-tcgp-catalogue.cjs`. Both work offline from pinned import records. The builder hashes current import inputs, reports delta against `qa-v06936-baseline.json`, and preserves individual provenance/release dates. Run `node scripts/verify-pass-v06937.cjs --tag=verified` for the relevant regression programs. Source/licence details remain in [TCGP_CARD_SOURCES.md](TCGP_CARD_SOURCES.md).

## Identity and compatibility

`app/src/main/assets/tcgp/generated/catalogue.js` is a generated local UMD dataset loaded once before the existing `tcgp-battle-data.js`. The adapter keeps the existing public API and supplied beginner deck. `cardById` accepts exact print aliases while returning canonical rules. Collections continue storing original print IDs, quantities, set/rarity/art metadata and history. Saved decks may retain alternate-print IDs; legality aggregates their canonical ownership and applies the two-copy limit by normalized printed name, including accent variants of PokÃ© Ball. Different same-name cards retain distinct gameplay identities while sharing the name-based copy allowance.

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
