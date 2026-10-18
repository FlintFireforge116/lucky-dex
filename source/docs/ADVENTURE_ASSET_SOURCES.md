# Adventure 2.0 local artwork and species provenance

All essential Adventure art is packaged in `app/src/main/assets/adventure/art/`. The registry and species bundles load synchronously; no image or metadata URL is required while playing. Main environments, battle stages, trainer sprites, item icons and field effects use original Pokémon FireRed / LeafGreen Game Boy Advance pixels. No generated imagery or screenshot HUD is included.

The complete per-file record is `adventure/art/manifest.json`: **every PNG** has its destination, local path, original game, source URLs, crop/composition notes, dimensions, byte count and SHA-256. `adventure/art/data-manifest.json` covers both JavaScript bundles and all six metadata CSV source hashes. The CSV snapshots are included in `docs/adventure/data-sources/` so the source ZIP can verify its metadata independently. These machine-readable manifests are the authoritative exhaustive asset list, including each individual normal/shiny back sprite.

Original art comes from [pret/pokefirered](https://github.com/pret/pokefirered), downloaded 2026-10-05. The source Git tree was `037335f4c725d7c9aecdac87066f2002b4bd7e14`. Exact source files and SHA-256 records are retained in `artifacts/v0230/assets/source/source-manifest.json`; only the source files used for this rendering are retained. Source links identify the upstream files; hashes identify the precise downloaded snapshot.

## Destinations and cameras

| Destination | Local scene / battle / boss prefix | Scene source layout | Battle source |
|---|---|---|---|
| Viridian Wilds | `adventure/art/meadow-` | [ViridianForest](https://github.com/pret/pokefirered/tree/master/data/layouts/ViridianForest), native crop `(160,448,352,800)` | [Grass terrain](https://github.com/pret/pokefirered/tree/master/graphics/battle_terrain/grass) |
| Mt. Moon | `adventure/art/cave-` | [MtMoon_1F](https://github.com/pret/pokefirered/tree/master/data/layouts/MtMoon_1F), native crop `(384,192,576,544)` | [Cave terrain](https://github.com/pret/pokefirered/tree/master/graphics/battle_terrain/cave) |
| Lavender | `adventure/art/haunted-` | [PokemonTower_5F](https://github.com/pret/pokefirered/tree/master/data/layouts/PokemonTower_5F), native crop `(96,0,288,320)`, original floor tiles extend the bottom to 352px | [Indoor terrain with Agatha palette](https://github.com/pret/pokefirered/tree/master/graphics/battle_terrain/indoor) |
| Seafoam Islands | `adventure/art/coast-` | [SeafoamIslands_B4F](https://github.com/pret/pokefirered/tree/master/data/layouts/SeafoamIslands_B4F), native crop `(224,0,416,352)` | [Water terrain](https://github.com/pret/pokefirered/tree/master/graphics/battle_terrain/water) |
| Cinnabar Crater | `adventure/art/volcano-` | [MtEmber_Summit](https://github.com/pret/pokefirered/tree/master/data/layouts/MtEmber_Summit), native crop `(64,0,256,352)` | [Mountain terrain](https://github.com/pret/pokefirered/tree/master/graphics/battle_terrain/mountain) |

Each prefix has `scene.png` (384×704 portrait), `battle.png` (480×224 battle stage) and `boss.png` (480×320 separate camera crop). Map rendering decodes original layout binaries, 16×16 metatiles, 8×8 tile indices, flip bits and 13 palette slots. No NPC or player sprites are baked into scenes. Portrait crops use integer 2× nearest-neighbour scaling. The haunted scene extends genuine floor pixels below the original room edge to avoid a black void behind portrait controls.

Cinnabar is a fictional volcanic destination using authentic Mt. Ember rock geometry; this is deliberately documented rather than attributed to an original Cinnabar lava map. Scene motion supplies the ember/heat atmosphere. `landmarks/{destination}.png` contains original map details: tree, cave entrance, tower architecture, islands and summit. The cave entrance and Seafoam exterior islands come from the original [Route20 map](https://github.com/pret/pokefirered/tree/master/data/layouts/Route20). Island and summit miniatures use integer 4× nearest-neighbour downsampling; the other details retain native 64×64 pixels.

## Portrait travel map

`adventure/art/adventure-map.png` uses [the FireRed regional map tile graphics, palette and Kanto tilemap](https://github.com/pret/pokefirered/tree/master/graphics/region_map). It renders the 30×20 original map, extracts the map interior, and reflows complete 8px tile rows into a 192×352 portrait composition before 2× integer scaling. This preserves square source pixels. The original regional navigation icon is replaced by original ocean tiles. The game UI draws the connected five-stop fictional journey over this foundation; it does not claim geographical Kanto accuracy.

Normalized landmark coordinates in `LuckyDexAdventureAssets.map.nodes`:

| ID | x | y |
|---|---:|---:|
| meadow | 0.24 | 0.18 |
| cave | 0.66 | 0.32 |
| haunted | 0.34 | 0.48 |
| coast | 0.69 | 0.66 |
| volcano | 0.28 | 0.82 |

## Trainers, objects, effects and Pokémon

Trainer files are `trainers/{bug_catcher,hiker,channeler,swimmer_m,scientist,red,leaf}.png`. Sources are the matching original [trainer front pictures](https://github.com/pret/pokefirered/tree/master/graphics/trainers/front_pics) and [trainer palettes](https://github.com/pret/pokefirered/tree/master/graphics/trainers/palettes). Palette index zero becomes alpha; remaining pixels retain the original palette and native 64×64 canvas.

Object icons are original [item graphics](https://github.com/pret/pokefirered/tree/master/graphics/items/icons) or first-frame [overworld objects](https://github.com/pret/pokefirered/tree/master/graphics/object_events/pics/misc), retaining embedded PNG colors and index-zero transparency. Registry aliases connect perks to actual item art: compass → Town Map, Potion Belt → Potion, Lucky Charm → Lucky Egg, Berry Satchel → Sitrus Berry, Quick Claw → Quick Claw, Field Medic → Revive, Collector's Eye → Silph Scope. Object/perk names are aliases, not claims of bespoke retail icons.

Effect sheets are original [field effects](https://github.com/pret/pokefirered/tree/master/graphics/field_effects/pics): ripple, small sparkle, ground impact dust, footprints, short grass, splash and shadow. Sheets retain all frames; consumers must crop their chosen frame. Index-zero alpha is restored without repainting. Canvas particles can supplement these pixels.

`pokemon/back/{id}.png` and `pokemon/back/shiny/{id}.png` cover national IDs 1–386 using original [Gen III Pokémon back pictures](https://github.com/pret/pokefirered/tree/master/graphics/pokemon) and normal/shiny palettes. The first 64×64 frame is cropped only to its alpha bounds. Unown uses form A; Castform uses its normal form. No sprite is resized or repainted.

`LuckyDexAdventureAssets.pokemon(id, shiny, back)` returns a packaged back for IDs 1–386 when requested. For IDs 387–1025 it returns the existing packaged front actor under `arcade/sprites/actors/pokemon/`; those established local assets and their source/trim manifests remain unchanged. Existing PokeAPI sprites include later-generation community sprite adaptations; Adventure introduces no new art for those species. The front fallback is intentional and avoids missing/offline art. Invalid IDs fall back to existing Pikachu #25.

## Offline species metadata

`adventure/adventure-species.js` exports `window.LuckyDexAdventureSpecies` and CommonJS `module.exports`. `byId` contains all national IDs 1–1025, English name, identifier, default-form types, HP/attack/defense/speed base stats, height in metres and weight in kilograms. A normal-type neutral fallback record is available for malformed legacy data. Metadata is independent of online enrichment.

The public [PokeAPI data CSV repository](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv) supplies `pokemon.csv`, `pokemon_species.csv`, `pokemon_species_names.csv`, `pokemon_types.csv`, `types.csv` and `pokemon_stats.csv`. Default Pokémon forms are matched through `species_id`; English names use language ID 9; types retain slot order; stats use IDs 1, 2, 3 and 6. Raw CSVs and SHA-256 records remain in `artifacts/v0230/assets/source/pokeapi/` and `adventure/art/data-manifest.json`.

## Reproduction and verification

Run `artifacts/v0230/assets/build_assets.py` with Pillow to reproduce art from the retained original source subset, then `artifacts/v0230/assets/build_data.py` to regenerate both bundles. Run `scripts/verify_adventure_assets.py` with Python/Pillow and Node to validate image encoding/dimensions, exact hashes, complete manifest coverage, registry paths, every normal/shiny front/back resolution, all 1,025 metadata records, and absence of runtime URLs. The source subset is audited by `artifacts/v0230/assets/audit_sources.py`.

Visual asset QA: `artifacts/v0230/assets/source-map-contact.png` and `asset-contact-sheet.png` show the original map renderings, portrait map/scenes, five battle stages and all trainer classes. They were manually inspected. Support art and representative backs are in `support-contact-sheet.png`. This asset-level review does not substitute for the phone viewport/runtime QA performed by the Adventure integration owner.
