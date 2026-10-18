# Adventure place vignettes — v0.40.2

The previous local Adventure catalog contains five tall habitat backgrounds and small habitat landmarks, with no complete reusable town facades. The existing Dash catalog contains 59 genuine Emerald native-pixel sprites and an offline cache of 204 pinned source files. This pass adds a small static scene catalog using those pixels and complete rectangles decoded from the cached paired-bank maps. It does not modify any previous art, Dash sprites, Dash manifests, or source-cache bytes.

The new catalog contains 30 category scenes: town, city, route, forest, cave, tower, coast, mountain, Gym, and League, for Kanto, Johto, and Hoenn. Four exact Johto overrides cover New Bark Town, Cherrygrove City, Violet City, and Sprout Tower. Each PNG is 384×160, fully opaque, and composed at native scale. Buildings retain their full roof, doorway, and base; trees retain their complete 32×32 source footprint. The rendering component should display the whole image with `object-fit: contain` and pixelated scaling.

Town uses complete red-roof homes, while city uses larger civic facades and services. Routes have a clear horizontal trail and grass; forests have dense complete trees and a narrow path. Cave has a native ledge and ladder, mountain an exposed rocky trail, tower an indoor staircase, coast a water/sand shoreline, Gym a challenge floor, and League a larger ceremonial podium. Kanto uses round trees and a fenced urban court; Johto uses pine trees and flower courts; Hoenn includes a complete Fortree treehouse, taller grass, and stronger water frontage. Some interior and rocky categories share the same native composition across regions; variation is deliberately restrained where the cache does not support a defensible distinct structure.

New Bark includes houses without a fabricated Center or Mart. Cherrygrove has a coastal service frontage. Violet features a complete Gym facade, Center, and Mart. Sprout Tower uses a pale stairway and columns, without Mt. Pyre gravestones. The Johto and Kanto scenes are interpretations made from genuine Gen III pixels. These are location vignettes, **not canonical map screenshots or exact reconstructions**; the source art is Pokémon Emerald and does not imply Johto's original maps were Gen III.

## Catalog contract

Load `app/src/main/assets/adventure-location-scenes.js` before Adventure location rendering. It exports `LuckyDexLocationScenes` in the browser and the same plain object in CommonJS; `LuckyDexAdventureLocationScenes` is an alias. The JSON equivalent is `adventure/location-scenes/manifest.json`.

Selection order is exact `places[place.id]` or `named[place.region][place.name]`, then `categories[place.region][place.kind]`, then the existing Adventure habitat assets for unknown locations. Lookup values are scene IDs; `scenes[id].path` is the local PNG path. Descriptors include `width`, `height`, provenance, and compressed repeat/placement evidence. The four exact slug aliases are `johto-new-bark-town`, `johto-cherrygrove-city`, `johto-violet-city`, and `johto-sprout-tower`.

## Genuine source rectangles

All coordinates below are metatiles, with a 16×16 native metatile. The decoder retains both four-tile layers, the correct 512-tile primary/secondary banks, native palettes, and flip flags.

| Component | Pinned Emerald layout | Rectangle x, y, width, height |
|---|---|---|
| Complete red-roof home | PetalburgCity | 5, 2, 5, 4 |
| Complete Center | PetalburgCity | 19, 13, 4, 4 |
| Complete Mart, clean roof | FortreeCity | 3, 11, 4, 4 |
| Complete civic/Gym facade | PetalburgCity | 12, 4, 6, 5 |
| Complete treehouse and ladder | FortreeCity | 8, 1, 5, 6 |
| Tower staircase and wall | MtPyre_1F | 9, 0, 5, 2 |
| Complete rocky ledge | GraniteCave_1F | 10, 5, 5, 4 |
| Challenge podium | MauvilleCity_Gym | 2, 0, 6, 6 |
| Vertical beach shore | Route104 | 14, 67, 1, 1 |

Each map extraction records its complete metatile rectangle and decoded RGBA hash. Reused packaged sprites retain their existing native pixel hash and packaged path. The catalog records SHA-256 hashes for the pinned source evidence at commit `731ad5bfd6e6f265508d0efcca0ba42f9dcf5881`. There is no recolouring, AI art, external downloaded art, painted replacement, or new tile engine. Native sprite transparency remains intact; scenes are opaque because their tiled native floor covers the whole canvas.

## Rebuild and verification

With the bundled Python/Pillow runtime, run:

```text
python scripts/build_adventure_location_scenes.py
python tests/adventure_location_scene_pixels.py
node --test tests/adventure-location-scenes.test.cjs tests/arcade-dash-gen3-assets.test.cjs
```

The builder writes only the new Adventure PNGs/catalog and `artifacts/adventure-location-scenes/contact-sheet.png`. It imports the existing Dash decoder without running the Dash builder. The Node tests were first run RED with three expected missing-catalog failures, then passed after implementation. They check category resolution and distinction, regional settlement/route/coast differences, named overrides, New Bark's lack of invented services, no Sprout graves, source checksums, image dimensions, and full bounds including repeated components. The Python test independently reconstructs all delivered pixels from the manifest's actual map rectangles and packaged sprites and compares them byte for byte with each PNG's RGBA data. The existing seven Dash source/pixel tests remain green.

The contact sheet and full-size named vignettes were visually inspected. The initial Petalburg Mart rectangle carried an adjacent-canopy sliver, so it was replaced by the clean complete Fortree Mart rectangle; the cave ledge was expanded to its entire native formation. No known component is intentionally clipped.
