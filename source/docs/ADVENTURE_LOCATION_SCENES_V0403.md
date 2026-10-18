# Adventure scene composition — v0.40.3

All 40 delivered scenes are opaque 384×288 native pixel compositions. The 4:3
image supplies the complete background, midground and foreground. Display the
whole PNG in the constrained window; the renderer no longer needs an additional
repeating floor outside it. This changes the approved v0.40.2 scene dimensions,
without changing the paired-bank decoder or native source assets.

The catalog keeps all 30 regional category fallbacks, the four original named
Johto scenes, both browser export names, CommonJS export and original slug
aliases. Ten named profiles now override fallback scenes:

| Named profile | Authored identity |
|---|---|
| New Bark Town | Staggered homes, western lane, flower courts and eastern exit |
| Pallet Town | Parallel homes, north–south lane, fences and southern waterfront |
| Azalea Town | Wooded clearing, large treehouse, Center and low civic facade |
| Cherrygrove City | Western bay, waterfront promenade and service frontage |
| Violet City | Tall civic facade, stone forecourt and service wings |
| Sprout Tower | Pale central walkway, stairway and spaced complete columns |
| Viridian City | Extra residential block, court and tall grass |
| Littleroot Town | Wooded central lane, two homes and a southern treehouse |
| Petalburg City | Civic center, pond and flower court |
| Route 124 | Water, natural shoreline bend and complete offshore rocks |

These are interpretations made with genuine local Emerald pixels, not canonical
map screenshots. Starting towns retain no invented Center or Mart.

## Route 124 diagnosis and correction

The original coast builder repeated the Fortree `bridge-floor` metatile ten
columns by two rows, plus `bridge-rail` ten columns by one row. Those partial
bridge tiles contain horizontal gold rail lines; repeating them across open water
produced the conspicuous yellow strip already visible in the native PNG. Viewport
stretching amplified it, but was not its source. Neither scaling nor a crop fix
would repair that composition.

The corrected Hoenn coast and exact Route 124 profile use no bridge fragments.
A complete coast bend comes from the cached Route104 map, rectangle
`[13,60,11,18]` metatiles. Complete offshore rocks come from `[5,57,2,2]` and
`[3,68,5,3]`; each retains native water around the formation. The exact Route 124
profile uses a separate rock arrangement from the regional coast fallback. During
visual QA the large rock rectangle was tightened vertically to exclude a sliver
of the next adjacent formation while retaining the complete selected rock.
The entire coast stays in the image; no poor art is hidden outside the viewport.

## Player contract

Normal town, city, route, forest, cave, tower, coast and mountain descriptors have
`avatar: {path, width:32, height:32, position:[x,y], sourceNativeSize:[64,64],
pixelSha256, fileSha256}`. Positions are native scene coordinates for a separate
static overlay. Gym and League descriptors omit the avatar. Landmark-clearance
tests cover houses, services, facade, treehouse, trees, stairs, signs and cave
landmarks. Coastal anchors place the player's feet on the beach.

The existing local `adventure/art/trainers/red.png` is the selected packaged
trainer fallback, displayed with nearest-neighbor scaling. The cache contains an
object-event header referring to Brendan's walking art, but contains neither that
image nor its palette; there is no packaged human overworld sprite. No external
art was downloaded, and no trainer PNG was modified. The avatar remains a trainer
pose, not an original overworld walking frame.

## Verification

Four new contract tests were observed RED before builder changes: old 384×160
dimensions, missing Pallet override, missing player metadata and missing Route
124 override. The seven combined existing/new Node scene assertions pass after
implementation. The existing Node dimension assertions were narrowly updated to
the approved 384×288 contract, and component bounds now follow scene metadata.

`tests/adventure_location_scene_pixels.py` independently rebuilds all 40 scene
PNGs from catalog source rectangles and packaged components, using their native
palettes, banks, layers and flips. It verifies exact RGBA bytes, opaque bounds,
all component hashes and player source pixels. Reconstruction dimensions now
come from descriptors, so the test verifies the entire expanded scene.

Rebuild: `python scripts/build_adventure_location_scenes.py`. Verify with
`python tests/adventure_location_scene_pixels.py` and
`node --test tests/adventure-location-scenes.test.cjs tests/adventure-scene-composition-v0403.test.cjs tests/arcade-dash-gen3-assets.test.cjs`.
The contact sheet at `artifacts/adventure-location-scenes/contact-sheet.png`
previews the same player overlays; delivered PNGs keep the avatar separate.

The builder writes only Adventure scene PNGs, JSON/JS catalogs and its QA sheet.
The 59 original Dash assets, 204 pinned source cache files and existing trainer
assets are retained byte-for-byte from the verified source ZIP. Full app browser
acceptance and release testing are recorded separately in the release report.
