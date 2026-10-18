# LuckyDex v0.25.7 Fossil Dig / Museum item-art provenance

Every active Dig Site / Museum sprite is now routed through `arcade/fossil-museum-v0257/items/`.

- 41 item/fossil sprites are pinned byte-for-byte to an upstream Git blob SHA in `manifest.json`.
- Fossils and evolution-stone pixel sprites come from the referenced `joos-too/Soullink-Tracker` fossil/stone sprite paths.
- Balls, treasures, geology items, Odd Keystone, Comet Shard and the Relic family come from `PokeAPI/sprites`.
- `tcg-card.png` is the only intentional local placeholder: it is replaced by the real card image after the buried card is hydrated.

The v0.25.7 audit specifically replaced nine legacy LuckyDex stand-ins that did not match their upstream item sprites: Great Ball, Ultra Ball, Nugget, Big Nugget, Pearl, Big Pearl, Stardust, Star Piece and Rare Bone.
