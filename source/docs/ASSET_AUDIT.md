# Arcade asset audit — recovery, 5 October 2026

Scope: the ten games reachable through the authoritative `arcade-world.js` (the supplied baseline used `arcade-world-v0200.js`). This is a recovery inventory, not a claim that LuckyDex reproduces every original game's presentation or rule set.

## Packaged and verified

- **44 authentic source/display files**: original 22 scene references and graphics, 3 extracted Amie sheets, 9 unretouched Amie crops, 2 original Emerald tile maps, 5 faithfully assembled/cropped Blender graphics, and 3 unretouched Underground rock/soil texture crops.
- **2,098 PokeAPI PNGs**: all normal and shiny front sprites for IDs 1–1025 (2,050), 14 berry icons, a Poké Ball icon and 5 fossil item icons (20), and all 28 Unown forms (A–Z, !, ?).
- **2,078 Arcade actor PNGs**: normal/shiny Pokémon 1–1025 plus 28 Unown forms, trimmed to exact visible alpha bounds with no resize or repaint. Originals remain under `arcade/sprites/pokemon/`; actors are under `arcade/sprites/actors/pokemon/` and `arcade/sprites/actors/unown/`. Normal actor 100 supplies the larger Voltorb clue icon. No source had empty alpha.
- Combined file payload: **9,033,521 bytes** excluding manifests. Every packaged file has its source URL and SHA-256 recorded in `arcade/authentic-v0200/manifest.json` , `arcade/sprites/manifest.json` or `arcade/sprites/actors/manifest.json`.
- The manifest guard checks every required file, encoded format, and SHA-256 offline. Run `python scripts/fetch_arcade_v0200_assets.py --check`. Downloading a missing file uses bounded concurrent requests; intact committed assets do not require a network connection or Pillow. Recovery/conversion requires Pillow.

## Classification of the loaded Arcade

“Programmatic” means existing CSS/Canvas/DOM game visuals, not AI-generated raster artwork. Repository history does not establish the provenance of old decorative art; no new painted or AI-generated image was added in recovery.

| Asset family / users | Classification before recovery | Recovered local location / limitation |
|---|---|---|
| Eight venue cards / world and venue views | Missing local files: 8 declared scene paths | `arcade/authentic-v0200/venues/` now contains all 8 actual game captures. Lilycove is **ORAS**, not Emerald. Oreburgh is BDSP. |
| Berry Picker scene, tree and request berries | Missing screenshot; programmatic tree overlay; remote Pokémon and berry PNGs | Exact original clean tree background from extracted X/Y sheet; `amie/berry-picker-backdrop.png`. Shared local sprites and berries. |
| Head It scene and falling yarn | Missing screenshot; programmatic yarn; remote Pokémon | Original extracted upper/lower backgrounds plus transparent pink, blue, yellow, purple and bonus yarn frames, all local. |
| Tile Puzzle frame and moving picture | Missing screenshot; programmatic Canvas scenery; remote Pokémon | Actual reference screenshot and empty-floor crop local; normal/shiny partner PNGs local. Full original clean stage and retail Pokémon animation frames remain unavailable. |
| Voltorb Flip tiles and scene | Missing local screenshot and 4 PNGs; programmatic clues/memos; remote Voltorb | Actual HGSS capture plus community reconstruction's 4 tile faces local. Voltorb normal/shiny sprite local. Reconstruction files are not claimed as verified retail extractions. |
| Berry Blender panel, center and pointer | Missing screenshot and 3 original PNG tile sheets; programmatic machine components | Original Emerald tile sheets and tile maps local. `outer-display.png`, `center-display.png`, `arrow-frame.png` faithfully assembled from those files; original palette retained, palette index 0 made transparent. |
| Clefairy Says classroom | Missing local classroom; programmatic classroom/teacher/students; remote Clefairy | Actual Stadium capture local as reference. Local Pokémon sprite provides a distinct actor. Separate Stadium 3D actors/animations and clean classroom remain unavailable. |
| Underground Mining wall and buried objects | Missing wall screenshot; programmatic rock layers/cracks/treasure shapes; remote mascot | Actual BDSP digging capture local as reference; local Cranidos and other Pokémon sprites. Three original screenshot texture crops (`rock-tile.png`, `wall-texture.png`, `soil-tile.png`) and five authentic item icons are now local; full separately extracted strata and crack animation tiles remain unavailable. |
| Poké Ball Drop cabinet/balls/pegs | Missing venue screenshot; programmatic Canvas physics visuals; remote Poké Ball icon | Local Celadon HGSS venue and Poké Ball icon. This is a LuckyDex original, so no retail Poké Ball Drop asset set is claimed. |
| Unown Decoder glyphs | Runtime PokémonDB HOME URLs; programmatic letter fallback | All authentic PokeAPI Unown form PNGs are local under `arcade/sprites/pokemon/unown/`; A uses canonical `201.png` upstream. Decoder layout and text are original LuckyDex UI. |
| Who's That Pokémon? silhouette/reveal | Runtime `API.sprite()` image; CSS silhouette filter and text UI | All 1–1025 normal/shiny front PNGs local. Silhouette is a filter of the local source sprite. Quiz is a LuckyDex original inspired by the franchise's silhouette format. |
| Shared mascots, caught/shiny partners, fallback participants | Runtime GitHub PNG URLs | `arcade/sprites/pokemon/<id>.png`, `arcade/sprites/pokemon/shiny/<id>.png` retain original canvases; Arcade display actors use corresponding alpha-trimmed `actors/pokemon/` paths. |
| Hidden legacy Ditto/Safari implementations and old venue modules | Still present in loaded history, outside the ten-game route | Their default normal Pokémon sprites are included. Old venue-v0180/v0190 art is not referenced by the active v0200 route and was not invented to satisfy stale URLs. |

Source rewiring is implemented by the game owners. The rows above retain the baseline classification so packaging alone is not mistaken for eliminating runtime URLs. The recovery integration must use local image paths for every reachable game and test with the network disabled.

## Actor extraction verification

The actor manifest records each upstream URL, original/source SHA-256, exact crop rectangle, original canvas dimensions, output dimensions and output SHA-256. Every one of the 2,078 actor files was decoded and compared pixel for pixel (RGBA including alpha) with the corresponding source's exact alpha-bounds crop. The original source images are retained unchanged. No scaling, painting, inpainting or background generation is part of extraction. Empty-alpha sources would keep their original PNG bytes and be explicitly listed; none were encountered.

`python scripts/materialize_arcade_actors.py` rematerializes missing/changed derivatives from the local source images. The main offline guard includes all actor source/output checksums. Pillow is needed only if a derivative must be recreated.

## Authenticity and source limits

- Original retail captures are reference imagery. A screenshot containing frozen UI or actors must not be presented as an animated gameplay scene. Clean Berry Picker / Head It backdrops are extracted from retail sprite sheets instead.
- PokeAPI's [repository documentation](https://github.com/PokeAPI/sprites) identifies default Gen5-style collection maintenance for National Dex 650+. Later-generation default pixel sprites include community artwork. They are sourced, existing graphics, not invented in this recovery. They must not be labelled all-retail rips. The official-artwork shiny collection also includes custom shinies; it was **not** used.
- [Voltorb reconstruction](https://github.com/samualtnorman/voltorb-flip) describes its own visually accurate recreation. Its four tile PNGs are sourced recreation assets, with extraction status unverified.
- [Emerald decompilation](https://github.com/pret/pokeemerald/blob/master/src/berry_blender.c) specifies original tilemap assembly. The raw sheet files cannot be displayed as a whole-machine image; the supplied display variants decode those exact original tilemaps.
- No ownership or redistribution permission is implied by public availability. Source credit and original Pokémon ownership are preserved; this is a personal fan-app source audit.

## Explicit missing assets / fidelity limits

**No required local path from the 22-asset baseline, 2,098-sprite set or supplied display crops is missing.** These additional fidelity assets were not sourced and are not replaced with invented artwork:

1. Full clean retail Tile Puzzle stage without actors, grid, confetti or UI. The supplied 170×109 empty-floor screenshot crop is a limited backdrop reference.
2. Retail Amie 3D Pokémon models/pose animations for arbitrary caught/shiny partners. Local pixel sprites remain the available partner source.
3. Separate transparent Stadium Clefairy teacher/student models, mallet and retail pose/animation sequences; clean classroom with all actors/UI removed.
4. Complete separately layered retail Underground rock strata, animated crack meter and excavation tool sprites. Genuine rock/soil texture crops and five PokeAPI fossil item icons are supplied, but are not claimed as a complete BDSP extracted tile set.
5. A verified **Emerald** Lilycove exterior screenshot matching the Emerald Blender. The current genuine Lilycove exterior is ORAS; attribution must say ORAS.
6. Fully verified retail extraction provenance for the four Voltorb reconstruction tile PNGs. Their published recreation provenance is known and recorded.

## Exact local scene sources

| Local path under `app/src/main/assets/` | Source / derivation |
|---|---|
| `arcade/authentic-v0200/venues/amie-garden.jpg` | [Source](https://oraswiki.com/assets/images/mechanics/pokemon-amie/02-pokemon-oras-the-pokemon-amies-main-screen.jpg) |
| `arcade/authentic-v0200/venues/goldenrod-game-corner.jpg` | [Source](https://static.guidestrats.com/images/02/13788/01-pokemon-hgss-outside-goldenrod-city-game-corner.jpg) |
| `arcade/authentic-v0200/venues/celadon-game-corner.jpg` | [Source](https://static.guidestrats.com/images/12/7482/03-pokemon-hgss-player-arriving-in-front-of-the-celadon-game-corner.jpg) |
| `arcade/authentic-v0200/venues/lilycove-contest-hall.jpg` | [Source](https://static.oraswiki.com/assets/images/locations/towns-cities/lilycove-city/15-pokemon-oras-outside-lilycoves-contest-hall.jpg) |
| `arcade/authentic-v0200/venues/stadium-classroom.webp` | [Source](https://gameinformer.com/sites/default/files/styles/thumbnail/public/2023/04/04/7e3c97a1/pokemon_stadium_clefairy.png.webp) |
| `arcade/authentic-v0200/venues/oreburgh-museum.png` | [Source](https://www.pokepedia.fr/images/thumb/f/f3/Mus%C3%A9e_Minier_de_Charbourg_DEPS.png/1200px-Mus%C3%A9e_Minier_de_Charbourg_DEPS.png) |
| `arcade/authentic-v0200/venues/ruins-of-alph.jpg` | [Source](https://static.fandomspot.com/images/05/32822/13-grassy-area-containing-smeargle-and-antu-at-ruins-of-alph-pokemon-hgss-screenshot.jpg) |
| `arcade/authentic-v0200/venues/indigo-plateau.jpg` | [Source](https://www.fandomspot.com/images/05/14797/01-indigo-plateau-screenshot-pokemon-heartgold.jpg) |
| `arcade/authentic-v0200/amie/berry-picker.jpg` | [Source](https://oraswiki.com/assets/images/mechanics/pokemon-amie/04-pokemon-oras-the-berry-picker-minigame.jpg) |
| `arcade/authentic-v0200/amie/head-it.jpg` | [Source](https://oraswiki.com/assets/images/mechanics/pokemon-amie/05-pokemon-oras-the-head-it-minigame.jpg) |
| `arcade/authentic-v0200/amie/tile-puzzle.jpg` | [Source](https://oraswiki.com/assets/images/mechanics/pokemon-amie/06-pokemon-oras-the-tile-puzzle-minigame.jpg) |
| `arcade/authentic-v0200/voltorb/screen.jpg` | [Source](https://static.guidestrats.com/images/02/13788/06-pokemon-hgss-making-use-of-memos-in-voltorb-flip.jpg) |
| `arcade/authentic-v0200/voltorb/blank.png` | [Source](https://raw.githubusercontent.com/samualtnorman/voltorb-flip/main/src/assets/tile/blank.png) |
| `arcade/authentic-v0200/voltorb/1.png` | [Source](https://raw.githubusercontent.com/samualtnorman/voltorb-flip/main/src/assets/tile/1.png) |
| `arcade/authentic-v0200/voltorb/2.png` | [Source](https://raw.githubusercontent.com/samualtnorman/voltorb-flip/main/src/assets/tile/2.png) |
| `arcade/authentic-v0200/voltorb/3.png` | [Source](https://raw.githubusercontent.com/samualtnorman/voltorb-flip/main/src/assets/tile/3.png) |
| `arcade/authentic-v0200/berry-blender/center.png` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/center.png) |
| `arcade/authentic-v0200/berry-blender/outer.png` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/outer.png) |
| `arcade/authentic-v0200/berry-blender/arrow.png` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/arrow.png) |
| `arcade/authentic-v0200/berry-blender/screen.jpg` | [Source](https://assets.st-note.com/img/1719486905194-Ay3TlUL9a2.png?width=1200) |
| `arcade/authentic-v0200/clefairy/clefairy-says.webp` | [Source](https://gameinformer.com/sites/default/files/styles/thumbnail/public/2023/04/04/7e3c97a1/pokemon_stadium_clefairy.png.webp) |
| `arcade/authentic-v0200/mining/underground-digging.jpg` | [Source](https://images.cgames.de/images/gsgp/293/pok%C3%A9mon-diamantperl_6156377.jpg) |
| `arcade/authentic-v0200/amie/backgrounds-sheet.png` | [Source](https://www.spriters-resource.com/media/assets/59/62308.png) |
| `arcade/authentic-v0200/amie/berry-picker-sheet.png` | [Source](https://www.spriters-resource.com/media/assets/61/64165.png) |
| `arcade/authentic-v0200/amie/head-it-sheet.png` | [Source](https://www.spriters-resource.com/media/assets/61/64166.png) |
| `arcade/authentic-v0200/berry-blender/center_map.bin` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/center_map.bin) |
| `arcade/authentic-v0200/berry-blender/outer_map.bin` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/outer_map.bin) |
| `arcade/authentic-v0200/amie/berry-picker-backdrop.png` | [Source](https://www.spriters-resource.com/media/assets/61/64165.png) Derived from `arcade/authentic-v0200/amie/berry-picker-sheet.png`. Unretouched retail asset sheet crop with original alpha; no generated pixels |
| `arcade/authentic-v0200/amie/head-it-backdrop.png` | [Source](https://www.spriters-resource.com/media/assets/61/64166.png) Derived from `arcade/authentic-v0200/amie/head-it-sheet.png`. Unretouched retail asset sheet crop with original alpha; no generated pixels |
| `arcade/authentic-v0200/amie/head-it-upper-backdrop.png` | [Source](https://www.spriters-resource.com/media/assets/61/64166.png) Derived from `arcade/authentic-v0200/amie/head-it-sheet.png`. Unretouched retail asset sheet crop with original alpha; no generated pixels |
| `arcade/authentic-v0200/amie/tile-puzzle-backdrop.png` | [Source](https://oraswiki.com/assets/images/mechanics/pokemon-amie/06-pokemon-oras-the-tile-puzzle-minigame.jpg) Derived from `arcade/authentic-v0200/amie/tile-puzzle.jpg`. Unretouched screenshot crop; no inpainting, reconstruction or generated art |
| `arcade/authentic-v0200/amie/yarn-pink.png` | [Source](https://www.spriters-resource.com/media/assets/61/64166.png) Derived from `arcade/authentic-v0200/amie/head-it-sheet.png`. Unretouched retail asset sheet crop with original alpha; no generated pixels |
| `arcade/authentic-v0200/amie/yarn-blue.png` | [Source](https://www.spriters-resource.com/media/assets/61/64166.png) Derived from `arcade/authentic-v0200/amie/head-it-sheet.png`. Unretouched retail asset sheet crop with original alpha; no generated pixels |
| `arcade/authentic-v0200/amie/yarn-yellow.png` | [Source](https://www.spriters-resource.com/media/assets/61/64166.png) Derived from `arcade/authentic-v0200/amie/head-it-sheet.png`. Unretouched retail asset sheet crop with original alpha; no generated pixels |
| `arcade/authentic-v0200/amie/yarn-purple.png` | [Source](https://www.spriters-resource.com/media/assets/61/64166.png) Derived from `arcade/authentic-v0200/amie/head-it-sheet.png`. Unretouched retail asset sheet crop with original alpha; no generated pixels |
| `arcade/authentic-v0200/amie/yarn-bonus.png` | [Source](https://www.spriters-resource.com/media/assets/61/64166.png) Derived from `arcade/authentic-v0200/amie/head-it-sheet.png`. Unretouched retail asset sheet crop with original alpha; no generated pixels |
| `arcade/authentic-v0200/mining/rock-tile.png` | [Source](https://images.cgames.de/images/gsgp/293/pok%C3%A9mon-diamantperl_6156377.jpg) Derived from `arcade/authentic-v0200/mining/underground-digging.jpg`. Unretouched original crop; no generated pixels |
| `arcade/authentic-v0200/mining/wall-texture.png` | [Source](https://images.cgames.de/images/gsgp/293/pok%C3%A9mon-diamantperl_6156377.jpg) Derived from `arcade/authentic-v0200/mining/underground-digging.jpg`. Unretouched original crop; no generated pixels |
| `arcade/authentic-v0200/mining/soil-tile.png` | [Source](https://images.cgames.de/images/gsgp/293/pok%C3%A9mon-diamantperl_6156377.jpg) Derived from `arcade/authentic-v0200/mining/underground-digging.jpg`. Unretouched original crop; no generated pixels |
| `arcade/authentic-v0200/berry-blender/center-composed.png` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/center.png) Derived from `['arcade/authentic-v0200/berry-blender/center.png', 'arcade/authentic-v0200/berry-blender/center_map.bin']`. Original GBA tilemap assembly, palette index 0 transparent; no invented pixels |
| `arcade/authentic-v0200/berry-blender/outer-composed.png` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/outer.png) Derived from `['arcade/authentic-v0200/berry-blender/outer.png', 'arcade/authentic-v0200/berry-blender/outer_map.bin']`. Original GBA tilemap assembly, palette index 0 transparent; no invented pixels |
| `arcade/authentic-v0200/berry-blender/center-display.png` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/center.png) Derived from `['arcade/authentic-v0200/berry-blender/center.png', 'arcade/authentic-v0200/berry-blender/center_map.bin']`. Original GBA tilemap assembly and display-region crop |
| `arcade/authentic-v0200/berry-blender/outer-display.png` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/outer.png) Derived from `['arcade/authentic-v0200/berry-blender/outer.png', 'arcade/authentic-v0200/berry-blender/outer_map.bin']`. Original GBA tilemap assembly and display-region crop |
| `arcade/authentic-v0200/berry-blender/arrow-frame.png` | [Source](https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/berry_blender/arrow.png) Derived from `['arcade/authentic-v0200/berry-blender/arrow.png']`. First original arrow sprite frame, palette index 0 transparent |

## Final runtime packaging evidence

The final production owners use only local scene/actor/glyph/item paths. Offline browser tests passed all 8 venues and 10 games at three phone sizes with remote requests blocked; no visible image failed. The APK packaging guard compares all 4,220 manifest files byte-for-byte with packaged assets. Retired generated venue/Moon-stage files are absent from the active source and APK.
