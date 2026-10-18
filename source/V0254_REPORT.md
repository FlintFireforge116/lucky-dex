# LuckyDex v0.25.4 implementation report

## Scope
v0.25.4 is a bounded Fossil Dig/Museum patch requested after v0.25.3 testing. It changes buried-card frequency/rarity reach and replaces the remaining active custom/generic excavation artwork with proper item/fossil pixel art.

## Buried card generation
`arcade-fossil-museum-core.js` now gives each generated dig site one independent 4% chance to include `tcg-card`. The card is inserted before the ordinary weighted draws and is excluded from the ordinary item pool so it cannot be selected twice or accidentally inherit the old effective ~1% wall frequency.

`rollBuriedCardTier()` now exposes the buried-card rarity distribution as a pure tested helper. Tier 6 occupies the top 0.5% of buried-card rolls. `app-v0167.js` resolves candidates with the full-card `rarityTier(card)` classifier introduced in v0.25.3, rather than rarity-text-only inference, so canonical Secret Rare metadata can reach the tier-6 pool.

## Item-art cleanup
The active catalogue uses the v0.25.4 item namespace. Remaining large custom/painterly fossil stand-ins and generic stone placeholders were removed from active use. Fossils from Helix through Galar fragments, the five classic evolution stones, Odd Keystone, Hard Stone and Everstone now use proper Pokémon pixel item/fossil sprites. Existing local treasure/relic/Ball/card sprites were retained where they were already pixel-art assets.

Dig and Museum continue to consume the same `item.sprite` value, preventing visual mismatches between the excavated object and its museum exhibit.

## Compatibility
The v0.25.2 unbanked-haul/cave-in mechanics, museum persistence, landscape museum, v0.25.3 canonical card rarity model, Tile Puzzle changes, application ID and permanent signing identity are unchanged.
