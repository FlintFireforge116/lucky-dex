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
