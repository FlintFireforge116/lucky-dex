# LuckyDex v0.25.7 implementation report

## Scope

Complete Fossil Dig / Oreburgh Museum asset provenance audit, followed by a recovery-hitbox correction after reports that visibly exposed items (especially Rare Bone) could still fail to count, while some fossils could count before their visible art was fully uncovered. Buried TCG cards were also made slightly more common.

## Root causes

1. Earlier asset verification only proved that a local PNG existed for several rewards. Nine active sprites were still older LuckyDex stand-ins rather than exact upstream Pokémon item art.
2. Recovery previously depended on coarse hand-written excavation masks / percentage thresholds. Those masks described placement footprints, not the actual opaque pixels of the rendered sprite, so invisible corners could matter and visible sprite pixels could be ignored.
3. The 4% buried-card site rate still allowed long dry runs often enough to feel absent in normal play.

## Fixes

- Added `arcade/fossil-museum-v0257/manifest.json` with exact upstream repository path and Git blob SHA for every sourced archaeology sprite.
- Added `tests/v0257-complete-dig-asset-audit.test.cjs` so altered, missing, or incorrect sourced sprites fail the release contract.
- Replaced Great Ball, Ultra Ball, Nugget, Big Nugget, Pearl, Big Pearl, Stardust, Star Piece and Rare Bone with exact upstream item sprites.
- Unified Poké Ball and every active reward into the v0.25.7 item namespace.
- Kept the TCG placeholder as the explicit local exception because actual card art is inserted at runtime.
- Added `recovery-masks.json` covering all 45 active dig rewards.
- Recovery masks are derived from the final rendered sprite geometry: `object-fit: contain`, nearest-neighbour scaling, alpha > 16, and meaningful occupied-cell coverage >= 3%.
- Placement footprint and recovery silhouette are now separate. Placement still reserves enough board space to avoid overlap; recovery requires every meaningful visible sprite cell and ignores transparent bounding-box space.
- Buried TCG card site chance raised from 4% to 6% (about 1 in 17 sites on average). Secret Rare remains the top 0.5% of buried-card rarity rolls.

## Visual audit

A full contact sheet of all 42 unique active sprite files was reviewed after replacement. The complete active catalogue was also checked against the alpha-derived recovery-mask manifest. No active reward uses the old generic Ball/treasure drawings, and the recovery logic follows the actual rendered sprite silhouette rather than a rectangular image box.
