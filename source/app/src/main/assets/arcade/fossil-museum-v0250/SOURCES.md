# LuckyDex v0.25.0 Fossil Museum asset provenance

- `oreburgh-museum-dppt-empty.png`: based on the Oreburgh Mining Museum interior reference supplied by the user in this project. The central player/guide sprites were removed with pixel-preserving local edits, while the counter staff remain part of the authentic room. Three empty display cases are duplicated from the room's own case artwork into otherwise unused floor space so every LuckyDex exhibit can sit in a physical case/pedestal. The final image is nearest-neighbour enlarged for the phone UI.
- Existing `arcade/sprites/items/*.png` entries are the already-packaged PokeAPI item sprites documented by `scripts/fetch_arcade_sprites.py` (`https://github.com/PokeAPI/sprites`).
- Missing v0.25.0 archaeology/treasure icons are small local pixel reconstructions stored under `items/` so the Android runtime never depends on remote image loading. Their stable IDs deliberately match PokeAPI/Pokémon item names so they can be replaced one-for-one by exact source sprites later without changing saves or gameplay.
- Underground rock/soil textures continue to use `arcade/authentic-v0200/mining/*`.

## v0.25.1 museum polish
- `oreburgh-museum-dppt-empty-v0251.png`: derives from the reviewed v0.25.0 Oreburgh room. The added small glass case that overlapped the lower entrance was removed from the doorway and relocated to open floor space above the central pedestal; no remote runtime asset is introduced.


## v0.25.2 museum + mining polish
- Active room: `arcade/fossil-museum-v0252/oreburgh-museum-dppt-landscape-v0252.png`. It derives from the user-supplied DPPt Oreburgh Mining Museum reference, restores the genuine room floor/furniture, and removes all LuckyDex-added display cases from earlier iterations. Exhibits are positioned virtually relative to genuine cases and the central pedestal.
- Excavation-specific art lives in `arcade/fossil-museum-v0252/mining/`. These local offline sprites deliberately use larger, recognisable mining silhouettes instead of tiny generic bag-item icons. Classic fossil and treasure proportions were informed by the Underground / Grand Underground presentation and recreated locally for LuckyDex.
- The v0.25.0/v0.25.1 room images remain in source as release-history assets only; they are no longer the active museum scene.
- No museum or mining asset requires a network request at runtime.
