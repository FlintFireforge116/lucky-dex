# LuckyDex Arcade source assets

All reference images and extracted graphics are now committed locally; the APK can package them without downloading. The offline guard is `python scripts/fetch_arcade_v0200_assets.py --check`.

- [Asset audit](../../../../../../docs/ASSET_AUDIT.md): classifications, provenance caveats and explicit missing fidelity assets.
- [Game references](../../../../../../docs/GAME_REFERENCES.md): references for all ten games, distinguishing retail minigames from LuckyDex originals.
- [Scene manifest](manifest.json): exact source URLs, crops/tilemap assembly, output encodings and SHA-256 checksums for 44 local source/display files.
- [Sprite manifest](../sprites/manifest.json): exact source URLs and SHA-256 checksums for 2,098 local Pokémon, Unown, berry, Poké Ball and fossil item PNGs.

Pokémon-Amie backgrounds and yarn are original X/Y extracted sheet crops. Emerald Blender display assets are assembled from original decompilation tile sheets/maps. Venue images are actual retail game captures; **Lilycove is ORAS**, and Oreburgh/Underground are BDSP. Stadium source captures are static first frames, not actor animation sequences. Voltorb tile PNGs come from a community reconstruction and have unverified retail extraction status. PokeAPI defaults for later generations include community pixel sprites.

- [Actor manifest](../sprites/actors/manifest.json): exact unretouched alpha-bound crops and original/output checksums for 2,078 Arcade actor PNGs. Originals are preserved.

No generated replacement artwork was created. Missing full animation/clean-scene assets are recorded in the audit rather than silently approximated.
