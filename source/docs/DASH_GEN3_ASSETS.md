# Dash Gen 3 assets — v0.34.0

## Baseline audit

The v0.33.1 Dash course assets combine painted procedural textures, hand-coded themed sprites, palette tints and some adapted Emerald primary metatiles. `scripts/adapt-emerald-dash-assets.py` discards every secondary tile index, guesses a tree assembly (30/31/46/47), and removes every matching turf colour. That loses authentic tileset context and does not establish complete trees. Its course thumbnails separately assemble scenery over unrelated terrain. These older assets remain baseline material; the new renderer uses this catalog's genuine native tiles and actual course composition.

`scripts/dash-source/` contains only the General primary tileset, metatiles and palettes. It cannot decode cave, gym, bridge or industrial secondary metatiles by itself. Existing `arcade/authentic-v0200` includes authentic Berry Blender assets, screenshots and non-Gen-3 minigame material; it does not contain a reusable Emerald route/gym/cave metatile system. Existing Pokémon actor and item assets remain available. The existing `arcade/sprites/items/oran-berry.png` remains unchanged; the new catalog also provides the exact Emerald item icon with its source palette and only its transparent perimeter cropped, making the berry readable at integer scale.

## Pinned primary source

All new catalog pixels come from [pret/pokeemerald](https://github.com/pret/pokeemerald), commit `731ad5bfd6e6f265508d0efcca0ba42f9dcf5881`, Pokémon Emerald. The exact used source files and SHA-256 checksums are in `data/dash-gen3/sources-sha256.json` and the runtime JSON/JS manifests. Download reference: `https://codeload.github.com/pret/pokeemerald/zip/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881`. Source artwork belongs to its Pokémon copyright holders; the decomp repository does not independently license Pokémon artwork. Bundled locally for this private fan project as requested.

This is an asset extraction/reassembly, with no recolouring, painted replacement scenery, generated artwork, blurred scaling or course screenshots. `extracted` means native metatile/icon pixels; `reassembled` means complete multiple-metatile objects; `adapted` means native pixels with the explicitly documented source-grass alpha mask. Metatile floors retaining their embedded source ground (for example ice rocks, gravestones and machinery) are intentional, allowing source-consistent compositing.

## Correct decoder and complete objects

The decoder follows `include/fieldmap.h`, `src/fieldmap.c` and `src/data/tilesets/headers.h`: 512 primary tiles plus 512 secondary tiles, 512 primary metatiles, primary palettes 0–5 and secondary palettes 6–12. Each 16×16 metatile comprises two layers of four 8×8 tiles, respecting horizontal/vertical flip flags, palette selection and native palette-index-zero transparency. All runtime terrain/pad pixels are fully opaque; object alpha is binary, and outputs preserve native pixel dimensions.

The complete 32×32 round tree uses General `1D4/1D5 + 1E4/1E5`, verified in Petalburg City's actual map. The complete 32×32 pine uses `01E/01F + 026/027`, verified in Route 110. Their source-grass palette entries 12–15 become transparent; canopy entries 1–4 remain unchanged. This fixes the old guessed crop. The 16×32 electric column and 32×48 Aqua Hideout machinery match complete map rectangles. The Mt. Pyre gravestone is a complete 16×16 native metatile. Map coordinates and all object footprints are recorded in the manifest.

Yellow upward Mossdeep Gym arrow `253` is the idle boost pad; red upward arrow `273` is its responsive state. Both are genuine Emerald gym floor art. Their use as boost states is a LuckyDex gameplay interpretation; the red frame is not invented art or a claim about the original gym's activation animation. Left/right arrow, warp and electric switch tiles are also available.

Water and flowers use original Emerald animation frames at VRAM tile offsets 432 and 508. Lava uses Cave's shared animation source at Lavaridge offset 512+160, exactly as `QueueAnimTiles_Lavaridge_Lava` specifies. No animation is a tint or fake palette variant.

## Rebuild and validation

Run `python scripts/build_dash_gen3_assets.py` with Pillow to reproduce all 59 PNGs, both manifests, the checksums, this inventory and `artifacts/dash-gen3/asset-contact-sheet.png`. The cached used bytes provide an offline rebuild. `--research` produces full metatile sheets when the complete pinned upstream tilesets are present. The catalog lives at `app/src/main/assets/arcade/dash/gen3/manifest.json`; its UMD counterpart is `app/src/main/assets/arcade-dash-gen3-manifest.js`, exporting `LuckyDexDashGen3Manifest` and CommonJS.

Run `node --test tests/arcade-dash-gen3-assets.test.cjs`. Tests verify all source hashes, native PNG dimensions, actual decoded RGBA hashes, binary alpha, visible/opaque terrain, unique local paths, bounded anchors/footprints, exact complete-object map assemblies, source pins, real directional pads, animation offsets and the complete 19×18 berry crop from its 24×24 source frame. The contact sheet was visually inspected for complete trees, genuine palette families, object framing, direction pads and readable berry pixels.

For rendering, use nearest-neighbour drawing and integer scale 2 or 3. Anchors/footprints are native coordinates; do not scale width and height independently. Course previews should draw the same course profile/section renderer as races. Terrain/world scenery share one world coordinate plane. Existing racer sprites retain their own normalization; these environmental tiles must retain a consistent native-pixel scale.

## Runtime asset inventory

Each row identifies the actual source map when confirmed by its native map bytes. Some genuine tiles are selected from the native tileset even though absent from the stored layouts; dynamic script-controlled tiles can still be used in-game. This distinction is explicit. `forest-grass` reuses route grass, `forest-path` reuses the authentic light path, and `lava-rock` reuses a genuine cave boulder. Reuse does not create a fake palette variant.

`grass-patch` and `long-grass-patch` are 32×16 assemblies of Emerald's real 16×16 foreground grass field-effect frames, using `general_1.pal` and only source palette-index-zero transparency. The standing grass metatiles `00D` and `015` have empty upper layers, so extracting those upper layers would be invisible. The field-effect sprite templates confirm these are the foreground layers used around characters standing in native tall/long grass. No grass colour is heuristically removed and no mask is painted. The associated grass metatiles are verified in Petalburg Woods / Route 119. These vegetation overlays replace opaque rectangular terrain hazard blocks while keeping the course surface visible.

Semantic correction: compatibility key `mud` is General decimal 232 (`0E8`), officially `METATILE_General_MuddySlope_Frame0` with behavior `MB_MUDDY_SLOPE` (`D0`): an inclined muddy slope/ledge, not a flat puddle. It should not represent a freestanding rectangular mud hazard. `route-path` / `forest-path` are General decimal 265 (`109`), a light gravel floor with `MB_NORMAL` (`00`), verified in Route 111; neither is ice. No shoreline puddle patch was added without complete source-map evidence.

| Key / local PNG under `arcade/dash/gen3/` | Native size | Classification | Source location / tilesets | Metatile IDs (hex) | Course/system use |
|---|---|---|---|---|---|
| `route-grass.png` | 16×16 | extracted | PetalburgWoods (General + Rustboro) | `001` | course terrain / verge / section |
| `route-path.png` | 16×16 | extracted | Route111 (General + Mauville) | `109` | course terrain / verge / section |
| `forest-grass.png` | 16×16 | extracted | PetalburgWoods (General + Rustboro) | `001` | course terrain / verge / section |
| `forest-path.png` | 16×16 | extracted | Route111 (General + Rustboro) | `109` | course terrain / verge / section |
| `tall-grass.png` | 16×16 | extracted | PetalburgWoods (General + Rustboro) | `00D` | course terrain / verge / section |
| `long-grass.png` | 16×16 | extracted | Route119 (General + Fortree) | `015` | course terrain / verge / section |
| `flowers.png` | 16×16 | extracted | Route110 (General + Mauville) | `004` | course terrain / verge / section |
| `shore-water.png` | 16×16 | extracted | Route110 (General + Mauville) | `170` | course terrain / verge / section |
| `shore-sand.png` | 16×16 | extracted | Route111 (General + Mauville) | `119` | course terrain / verge / section |
| `shore-edge.png` | 16×16 | extracted | Route111 (General + Mauville) | `122` | course terrain / verge / section |
| `shallow-water.png` | 16×16 | extracted | Route120 (General + Mauville) | `0A1` | course terrain / verge / section |
| `mud.png` | 16×16 | extracted | Route111 (General + Mauville) | `0E8` | course terrain / verge / section |
| `bridge-floor.png` | 16×16 | extracted | FortreeCity (General + Fortree) | `23D` | course terrain / verge / section |
| `bridge-rail.png` | 16×16 | extracted | FortreeCity (General + Fortree) | `23C` | course terrain / verge / section |
| `cave-floor.png` | 16×16 | extracted | GraniteCave_1F (General + Cave) | `207` | course terrain / verge / section |
| `cave-wall.png` | 16×16 | extracted | GraniteCave_1F (General + Cave) | `209` | course terrain / verge / section |
| `cave-floor-dark.png` | 16×16 | extracted | SeafloorCavern_Room1 (General + Cave) | `2E5` | course terrain / verge / section |
| `lava-floor.png` | 16×16 | extracted | MagmaHideout_3F_1R (General + Lavaridge) | `333` | course terrain / verge / section |
| `lava-edge.png` | 16×16 | extracted | MagmaHideout_3F_1R (General + Lavaridge) | `332` | course terrain / verge / section |
| `ash-floor.png` | 16×16 | extracted | Lavaridge tileset (metatile not used in the pinned layouts) (General + Lavaridge) | `204` | course terrain / verge / section |
| `ice-floor.png` | 16×16 | extracted | ShoalCave_LowTideIceRoom (General + Cave) | `38D` | course terrain / verge / section |
| `ice-wall.png` | 16×16 | extracted | ShoalCave_LowTideIceRoom (General + Cave) | `380` | course terrain / verge / section |
| `ice-cracked.png` | 16×16 | extracted | SootopolisGym tileset (metatile not used in the pinned layouts) (Building + SootopolisGym) | `20E` | course terrain / verge / section |
| `desert-sand.png` | 16×16 | extracted | Route111 (General + Mauville) | `251` | course terrain / verge / section |
| `gym-floor.png` | 16×16 | extracted | MauvilleCity_Gym (Building + MauvilleGym) | `21A` | course terrain / verge / section |
| `metal-floor.png` | 16×16 | extracted | AquaHideout_B1F (General + Facility) | `229` | course terrain / verge / section |
| `mossdeep-floor.png` | 16×16 | extracted | MossdeepCity_Gym (Building + MossdeepGym) | `201` | course terrain / verge / section |
| `mtpyre-floor.png` | 16×16 | extracted | MtPyre_1F (General + Facility) | `2E6` | course terrain / verge / section |
| `ancient-floor.png` | 16×16 | extracted | Cave tileset (metatile not used in the pinned layouts) (General + Cave) | `321` | course terrain / verge / section |
| `stone-floor.png` | 16×16 | extracted | Facility tileset (metatile not used in the pinned layouts) (General + Facility) | `3C6` | course terrain / verge / section |
| `lab-floor.png` | 16×16 | extracted | LittlerootTown_ProfessorBirchsLab (Building + Lab) | `202` | course terrain / verge / section |
| `tree.png` | 32×32 | adapted | PetalburgCity (General + Petalburg) | `1D4,1D5 / 1E4,1E5` | course scenery or solid base obstacle |
| `pine.png` | 32×32 | adapted | Route110 (General + Mauville) | `01E,01F / 026,027` | course scenery or solid base obstacle |
| `route-rock.png` | 16×16 | extracted | Route111 (General + Rustboro) | `0E0` | course scenery or solid base obstacle |
| `cave-rock.png` | 16×16 | extracted | GraniteCave_1F (General + Cave) | `202` | course scenery or solid base obstacle |
| `lava-rock.png` | 16×16 | extracted | GraniteCave_1F (General + Cave) | `202` | course scenery or solid base obstacle |
| `ice-rock.png` | 16×16 | extracted | ShoalCave_LowTideIceRoom (General + Cave) | `37D` | course scenery or solid base obstacle |
| `grave.png` | 16×16 | extracted | MtPyre_1F (General + Facility) | `2EE` | course scenery or solid base obstacle |
| `column.png` | 16×32 | reassembled | MauvilleCity_Gym (Building + MauvilleGym) | `210 / 218` | course scenery or solid base obstacle |
| `machine.png` | 32×48 | reassembled | AquaHideout_B1F (General + Facility) | `23D,23E / 245,246 / 24D,24E` | course scenery or solid base obstacle |
| `fence.png` | 16×16 | extracted | Route110 (General + Rustboro) | `132` | course scenery or solid base obstacle |
| `sign.png` | 16×16 | extracted | Route104 (General + Rustboro) | `003` | course scenery or solid base obstacle |
| `mossdeep-pad.png` | 16×16 | extracted | MossdeepCity_Gym (Building + MossdeepGym) | `253` | embedded course boost / gym decoration |
| `mossdeep-pad-active.png` | 16×16 | extracted | MossdeepCity_Gym (Building + MossdeepGym) | `273` | embedded course boost / gym decoration |
| `mossdeep-pad-left.png` | 16×16 | extracted | MossdeepCity_Gym (Building + MossdeepGym) | `252` | embedded course boost / gym decoration |
| `mossdeep-pad-right.png` | 16×16 | extracted | MossdeepCity_Gym (Building + MossdeepGym) | `250` | embedded course boost / gym decoration |
| `mossdeep-warp.png` | 16×16 | extracted | MossdeepCity_Gym (Building + MossdeepGym) | `210` | embedded course boost / gym decoration |
| `electric-switch.png` | 16×16 | extracted | MauvilleCity_Gym (Building + MauvilleGym) | `205` | embedded course boost / gym decoration |
| `grass-patch.png` | 32×16 | reassembled | PetalburgWoods grass foreground field effect (field effect + foreground) | `item icon` | transparent course grass slow-ground overlay |
| `long-grass-patch.png` | 32×16 | reassembled | Route119 grass foreground field effect (field effect + foreground) | `item icon` | transparent course grass slow-ground overlay |
| `shore-water-1.png` | 16×16 | extracted | Route110 (General + Mauville) | `170` | course terrain / verge / section |
| `shore-water-2.png` | 16×16 | extracted | Route110 (General + Mauville) | `170` | course terrain / verge / section |
| `shore-water-3.png` | 16×16 | extracted | Route110 (General + Mauville) | `170` | course terrain / verge / section |
| `flowers-1.png` | 16×16 | extracted | Route110 (General + Mauville) | `004` | course terrain / verge / section |
| `flowers-2.png` | 16×16 | extracted | Route110 (General + Mauville) | `004` | course terrain / verge / section |
| `lava-floor-1.png` | 16×16 | extracted | MagmaHideout_3F_1R (General + Lavaridge) | `333` | course terrain / verge / section |
| `lava-floor-2.png` | 16×16 | extracted | MagmaHideout_3F_1R (General + Lavaridge) | `333` | course terrain / verge / section |
| `lava-floor-3.png` | 16×16 | extracted | MagmaHideout_3F_1R (General + Lavaridge) | `333` | course terrain / verge / section |
| `oran-berry.png` | 19×18 | extracted | Item icon table / ITEM_ORAN_BERRY (item + icon) | `item icon` | stamina berry pickup |
