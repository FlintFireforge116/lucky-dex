# LuckyDex v0.25.4 Fossil Dig / Museum item-art sources

The active v0.25.4 Fossil Dig and Oreburgh Museum use one local pixel-art item namespace. The goal of this patch is to remove the remaining custom painted/generic stand-ins and show the real item/fossil artwork consistently in both the dig wall and the museum.

## Fossils

Helix, Dome, Old Amber, Root, Claw, Skull, Armor, Cover, Plume, Jaw, Sail and the four Galar fossil fragments use Pokémon fossil/item pixel sprites rather than the v0.25.2/v0.25.3 custom placeholder drawings.

## Stones and geology

Fire, Water, Thunder, Leaf and Moon Stones use their distinct Pokémon item sprites. Hard Stone, Everstone and Odd Keystone likewise use item-specific pixel art. This fixes the previous generic diagonal-lozenge placeholders, including the incorrect-looking Fire Stone.

## Other finds

Relics, treasure, Balls, Star Piece, Rare Bone, Comet Shard and the buried-card icon retain the existing packaged low-resolution Pokémon-style item sprites and are copied into the same v0.25.4 namespace so runtime rendering never falls back to an older painted set.

All assets are packaged locally for offline use. Runtime scaling remains nearest-neighbour/pixelated.
