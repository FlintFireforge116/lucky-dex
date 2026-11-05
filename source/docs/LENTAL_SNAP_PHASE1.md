# New Pokémon Snap / Lental artwork — phase 1

The creator's three installer-ready artwork packs are hosted in the dedicated
public `luckydex-lental-v1` GitHub Release. This change registers their ZIPs for
on-demand download using the existing Android card-art installer. No PNGs are
committed to `source/`.

* SNAPFLORIO: 123 images
* SNAPFOUNJA: 86 images
* SNAPBEACH: 19 images

## Current functionality

* All three sets are discoverable in the physical card shop and indexed in the
  collection. Choosing a pack on Android downloads its ZIP once, verifies the
  ZIP manifest, and stores the WebP artwork locally.
* Interim five-card preview boosters use ordinary Lucky Coins and tickets,
  and retain the original printed-rarity field as `Unknown`. There are **no
  invented rarity weights or guaranteed hits**. Do not interpret preview packs
  as the creator's finished booster collation.
* All 228 prints are registered with stable IDs in Classic TCG's metadata,
  with explicit PARTIAL support flags. They are **not battle-enabled**. The
  creator's final gameplay spreadsheet is necessary before implementing the
  exact attacks, damage, HP, Energy costs, types, Prizes and abilities.
* A provisional generic pack wrapper is used until the creator supplies the
  actual pack artwork. Official booster-art restrictions remain unchanged.

## Agreed artwork corrections — not rewritten in the source images

* Crystalbloom #107: search for a **Basic** Illumina Pokémon only.
* Murkrow #65: Scavenge only once per player turn across all copies.
* Dream Garden #109: at the existing trigger time, flip a coin; tails
  makes the target Asleep.
* Pichu & Grookey GX #49: Paralysis only, no Confusion.

The application-specific Florio Dam 5-slot Bench and Standoff Battleground
8-position trigger are **engine adaptations**, not source-art changes.

No final packshot or gameplay text was supplied. Do not mark cards FULL or
create artificial mechanics. When the author supplies the master sheet, replace
provisional booster collation with exact rarities and enable cards only after
mechanics tests pass.

## v0.69.105 — printed rarities and audited battle slice

* Blushing Beach (19 unfinished cards) is removed from all in-app Lental
  catalogues, booster selection and Classic battle card definitions. Its GitHub
  release ZIP remains archived, and no owned-card saves are deleted.
* Florio (123) and Founja (86) use the **actual printed rarity symbols**:
  circle=Common, diamond=Uncommon, star=Rare, gold/bright star=Rare Holo,
  two stars=Ultra Rare. These are physical card-face rarity annotations, not
  guessed Pokémon-name rarity or a generic Unknown tier.
* Five-card Lental booster slots: 2 Common / 2 Uncommon / 1 Rare-or-better,
  using the existing LuckyDex coin cost, rarity classifier and pack economy.
* First verified FULL Florio cards in Classic TCG: #001 Caterpie,
  #004 Caterpie, #006 Pinsir, #018 Shroomish, #019 Shroomish,
  #035 Grookey, #036 Grookey, #082 Hoothoot, #086 Taillow. Their complete printed attacks, HP, Energy costs, Weakness and
  Retreat have been transcribed. No moves have placeholder effects.
* All remaining Florio cards stay PARTIAL and explicitly unplayable until
  their entire original printed gameplay is audited, including the agreed
  Crystalbloom / Murkrow / Dream Garden / Pichu-Grookey changes. Founja remains
  collection-only for now.
* We deliberately have NOT edited the creator's existing artwork ZIPs.

## v0.69.106 — 10-card Lental and expanded Florio battle rules

* Snap packs: 10 cards (4 Common, 3 Uncommon, 3 Rare or higher), 650 coins.
  Last three slots have distinct rare/ultra weights; no fabricated rarities.
* Added fully printed Florio Basic and Stage 1 attacks, Illumina healing,
  Scavenge one-use-per-side-turn, Dream Garden tails-to-Sleep, Florio Dam 5
  Bench slots, Standoff Battleground 8 spots, Flower Garden, Park Night and
  Nature Park. Original official-set mechanics and Energy Zone preserved.
* Classic physical TCG global GX-attack/VSTAR-power guards; KO awards 1/2/3
  prizes using printed rule-box type (five Prize win condition unchanged).
* Snorlax Starting Snore may attack while Asleep and consumes opponent Sleep
  after damage. Wider Bench renderer is scoped to Classic Florio Dam only.
* Other unverified Florio cards stay PARTIAL, not silently enabled.
* Creator artwork files and ZIPs were not modified; remaining manual rules
  await exact audit against the printed cards.

## v0.69.107 — Florio print art and battle expansion

* Creator-supplied Florio Nature Park artwork is bundled in `lental-pack-art/florio-nature-park.webp`.
  Shop boosters and sealed pack opening resolve the same local image directly.
* Expanded Florio Classic30 with 19 additional fully transcribed gameplay cards.
  Effects include selected Basic search-and-Bench, Prize-based damage counters,
  targeted discarded-card recovery, three-target healing, coin outcomes,
  Stadium-based Colorless cost changes, and Bidoof-only Battle Stick damage.
* Both Lental sets keep 10-card pack collation (4 Common, 3 Uncommon, 3 Rare+).
* All remaining unverified cards stay PARTIAL and cannot be added to legal decks.
* Founja stays collection-only and unfinished Blushing Beach stays hidden.

## v0.69.108 — continued Florio Classic30 integration

* Added 19 verified Florio cards including Pinsir V, Heracross ex, Vespiquen,
  Torterra V, Illumina Murkrow, Florio Blossom Tree, Pasture Fields and Crystalbloom.
* Fixed creator-printed Illumina names in the gameplay and installed artwork catalogues.
* Added rule-box damage reductions, coin-based Knock Outs, chosen Energy search,
  Basic Darkness/Metal Energy hand tokens for the Classic30 separate supply,
  optional Grass-Pokémon search, conditional attack damage and Stadium actions.
* Every still-unsupported print remains PARTIAL, not silently vanilla.
* Blushing Beach is still excluded; Founja is still a collection-only set.

## v0.69.109 — new creator revision, original identities retained

* Original numbered 123-card Florio archive has been replaced by 123 creator-supplied
  unnumbered PNGs; every one mapped back to the same `SNAPFLORIO-###` ID.
* Publish `luckydex-set-SNAPFLORIO-v2.zip` to the existing public release; it has `artRevision: 2`,
  revised artwork and checksum verification. Old installations update on
  Florio access via the native installer's atomic replacement routine.
* Dream Garden #109 NOW makes Sleep recovery require 2 heads between turns;
  it does not inflict Sleep at the start of each turn.
* Standoff Battleground #118 is now OPTIONAL once per player turn, using the
  existing agreed 8-position Classic30 adaptation of its printed >10 threshold.
* Existing battles using cards whose printed text materially changed cannot
  safely continue under old attacks. Such cards are PARTIAL until re-audited.
  No collection IDs, ownership records or booster pack size have been changed.
* Source ZIP did not include new booster pack artwork; prior pack art is retained.
* Rarity tiers come from earlier printed symbols and require a follow-up audit
  against the revised prints, not fabricated replacements.

## v0.69.110 — revised Florio card re-audit (first restoration batch)

* 35 previously disabled Florio cards were checked against their v2 printed text
  and restored with amended attack costs, damage, names, and special effects.
* Notable updated rules: Wurmple, Vespiquen, Swanna ex, Pikachu, Vivillon,
  Crystalbloom and Fungal Shield. Optional Quick March uses a choice prompt.
* Florio 123 and Founja 86 catalogue identities, 10-card booster rates, existing
  save/ownership IDs and image ZIPs remain unchanged.
* Cards not in the revised re-audit list remain gated pending full verification.
* Classic battle behaviours must still be tested in an actual APK.
