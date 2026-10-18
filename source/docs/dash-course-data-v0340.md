# Pokémon Dash authored course data — v0.34.0

The v0.33.1 course generator supplied themed skins on one progressively denser random road. It had no actual environmental sections, scenery plan or playable-course preview data. The v0.34.0 data resolves 18 tile compositions using Emerald metatiles and complete environmental sprites. The asset extraction manifest owns source attribution; this document owns the course contract.

## Browser and Node contract

Load `arcade-dash-course-data.js` before `arcade-dash-course.js`. The new module exports `LuckyDexDashCourseData` in a browser and the same object through CommonJS:

- `COURSES`: profiles keyed by the 18 lowercase type IDs.
- `SECTION_TEMPLATES`: eight reusable section definitions.
- `SECTION_BOUNDARIES`: `[0,260,500,720,950,1170,1410,1600,1800]` in world distance.
- `SECTION_ORDER`: open, chicane, boost-hall, bridge, squeeze, meadow, landmark, finish.
- `courseFor(type)`: case-insensitive lookup, with Normal as the fallback.

Each profile defines `id`, `label`, `environment`, native `ground`/`path`/`edge` asset keys, common and uncommon scenery keys, `hazards.rock`, `hazards.mud`, Mossdeep pad idle/active keys, ambient identity, eight section overrides, and a fixed-seed preview location. Fairy uses Hoenn flowers, greenery and bridge tiles because Fairy has no Gen 3 tileset of its own.

`LuckyDexDashCourse.generateCourse(seed,{theme})` keeps `seed`, `theme`, `finishDistance`, `laneCount`, `objects` and numeric `sections`. The numeric sections now mark all eight authored segments. It additionally returns:

- `profile`: resolved profile from the shared data catalog.
- `sectionPlan`: complete, contiguous environment segments with `id`, `index`, `start`, `end`, `template`, resolved floor and scenery keys, ambient identity, scenery spacing, stagger setting and optional landmark key.
- `scenery`: deterministically placed decoration with `id`, `sectionId`, `assetKey`, `side` (-1 left, +1 right), `slot` (inner/outer), `lateral` (0–1 fraction within the verge), `distance`, `scale:1`, and an optional landmark flag. The renderer supplies the shared native pixel scale and keeps complete sprite bounds within each verge.

Objects preserve their legacy `skin` for existing consumers and add `assetKey` and `sectionId`. Pickups use the authentic Oran Berry key; all pads use the yellow and red upward Mossdeep Gym metatiles. Hazard art resolves through the current profile.

`sectionAt(course,distance)` returns the first section before the start, the final section past the finish, and the following section at an exact boundary. `sceneryNear(course,distance,lookAhead)` mirrors the inclusive `objectsNear` interval. Course previews generate this same data at `profile.preview.seed` and frame `profile.preview.distance`.

## Course compositions

| Type | Composition and transitions |
| --- | --- |
| Normal | Hoenn grass/dirt route, tree chicane, fenced shoreline bridge, flower recovery and route sign |
| Fire | Volcanic/ash path, lava-rock banks, stone crossing and ancient column |
| Water | Sand approach, shallows, dock/bridge stretches and tree-lined coastal recovery |
| Electric | Mauville gym/metal floors, complete generators, service bridge and machinery landmark |
| Grass | Forest path, trees and tall grass, water bridge and flowering recovery |
| Ice | Shoal ice wall/floor families, cave approach, column bridge and ice passage |
| Fighting | Outdoor approach, stone training columns, gym floor and rugged squeeze |
| Poison | Mud/forest marsh, pine banks, shallow-water boardwalk and machinery landmark |
| Ground | Desert sand, ruin columns, cave banks and ancient-stone crossing |
| Flying | Fortree canopy/bridge language, pine banks, high wooden path and open flower sprint |
| Psychic | Mossdeep reflective floors, symmetric columns, mechanical crossing and ancient landmark |
| Bug | Dense tall-grass forest, pine chicane, shallow-water bridge and open flower clearing |
| Rock | Granite cave walls, rugged boulders, ancient crossing and quarry approach |
| Ghost | Outdoor memorial approach, Mt. Pyre floors and grave/column banks |
| Dragon | Desert/cave approach, ancient floor, stone crossing and column landmark |
| Dark | Forest approach descending into cave/ Mt. Pyre floor families and stone passages |
| Steel | Metal service floors, fences, machinery, embedded pads and industrial bridge |
| Fairy | Hoenn flower garden, trees/fences, floral sprint and shoreline bridge |

Each course resolves different asset composition and section overrides. They share an authored mechanical rhythm so environment selection cannot change race balance.

## Authored rhythm and collision safety

There are 20 decision clusters containing 27 interactive objects over 1,800 world units. The opening is clear for at least 150 units. The opening straight introduces a berry; the chicane introduces hazards; the boost hall contains multiple directional pads; the crossing mixes rewards and hazards; the squeeze offers two blocked lanes while retaining one safe lane; the recovery sprint has no hazards; the landmark approaches reintroduce decisions; the finish retains a short final choice.

Lane choices, hazard variants and a 0–9 unit arrival jitter vary by seed. Event roles and section starts are authored. Decoration has a separate seeded random stream, so adding a tree cannot move a collision. Same-seed geometry is identical across all themes. No cluster fills all three lanes with hazards; adjacent clusters have at least 52 world units of reaction spacing. Six racers and the three hidden logical lanes remain unchanged.

Scenery stays decorative; tree canopies and landmarks do not acquire invisible collision boxes. Tall landmarks have a clear base with at least 48 units of separation from normal props on the same verge. Surface hazard art uses contrasting floor families where practical rather than invisible copies of the race surface.

## Verification

`node tests/arcade-dash-course-sections.test.cjs` first failed against v0.33.1 because generated courses had no section plan, then passed after implementation. It covers all 18 profiles, contiguous sections, valid preview positions, deterministic decoration, boost/recovery roles, landmark clear bases and 300 seeds × 18 themes of collision safety and identical geometry. The landmark test was also observed failing before the clear-base spacing fix. A representative-preview test exposed two duplicate environment compositions when every preview framed the same bridge distance; course-specific preview distances now resolve 18 different representative section compositions.

`node tests/arcade-dash-course-assets.test.cjs` checks that all 38 referenced environment/pad/pickup keys resolve to existing bundled Emerald files, correct rendering roles and unique asset paths. The original `node tests/arcade-dash-course.test.cjs` remains green, including increasing late-course density and themed-skin compatibility. The unchanged Dash gameplay and League integration tests also pass. The release owner runs browser, asset-manifest and complete project validation after integration; course data checks do not alone establish visual completion.
