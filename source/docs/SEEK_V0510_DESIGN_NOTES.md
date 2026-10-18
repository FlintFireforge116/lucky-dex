# Pokémon Seek v0.51.0: verified scope

The sole product baseline is the supplied `LuckyDex_source_v0.50.5.zip`. No previous working checkout is a source input. The changes replace the old Seek grid/renderer/styles in place, with two small new data/reward modules. Ice Cream Scoop and Wailord gameplay, physics and art are unchanged; the Ice Cream cone arrow mask remains intact.

## Areas and encounters

Eight areas are supported. Node names describe the visible art; their arrangements and connections are newly authored LuckyDex gameplay, not claims about a historical Dream World room map. Dream Ruins is omitted because the catalogue did not support it. The Pokémon Café interior is repository-supplied completed material whose original-versus-reconstruction status is not independently established.

The following conservative pools were checked against the species tables on the corresponding established Dream World area pages. The custom Seek encounter selection is an adaptation, not a claim that every species originally played Pokémon Seek. Historical Dream Point or level gates are not introduced into LuckyDex.

| Area | Verified conservative pool | Encounter reference |
| --- | --- | --- |
| Pleasant Forest | Ponyta, Mareep, Hoppip | [Pleasant Forest](https://bulbapedia.bulbagarden.net/wiki/Pleasant_Forest) |
| Windswept Sky | Wingull, Swablu, Chatot | [Windswept Sky](https://bulbapedia.bulbagarden.net/wiki/Windswept_Sky) |
| Sparkling Sea | Horsea, Magikarp, Corsola | [Sparkling Sea](https://bulbapedia.bulbagarden.net/wiki/Sparkling_Sea) |
| Spooky Manor | Gastly, Drowzee, Spinarak | [Spooky Manor](https://bulbapedia.bulbagarden.net/wiki/Spooky_Manor) |
| Rugged Mountain | Phanpy, Larvitar, Numel | [Rugged Mountain](https://bulbapedia.bulbagarden.net/wiki/Rugged_Mountain) |
| Icy Cave | Swinub, Snorunt, Cleffa | [Icy Cave, Dream World](https://bulbapedia.bulbagarden.net/wiki/Icy_Cave_(Dream_World)) |
| Dream Park | Seedot, Slakoth, Gulpin | [Dream Park](https://bulbapedia.bulbagarden.net/wiki/Dream_Park) |
| Pokémon Café Forest | Poliwhirl, Eevee, Smeargle, Burmy | [Pokémon Café Forest](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Caf%C3%A9_Forest) |

Existing bundled pixel Pokémon actors are reused. They are not described as recovered Dream World illustrations. Scene assets and attribution are catalogued separately in `DREAM_WORLD_SEEK_ASSETS.md` and the bundled manifest.

## Gameplay decisions

- Easy explores two connected nodes in 110 seconds; Normal three in 90 seconds; Hard the full supported area in 75 seconds. Areas contain three to five locations rather than a forced 3×3 grid.
- Every target, decoy, clue, lost berry and rare event occupies a valid visible search spot. Selecting never searches automatically. Search checks only the current selected unsearched spot; moving invalidates selection.
- Listen computes shortest-path distance through the current graph. Easy gives a closer next destination, Normal does so when one edge away, Hard gives distance bands without an explicit route. Search clues and subtle glints supplement the sound.
- Correct find: 5,000; remaining full seconds: 500 each; lost berry: 5,000; Dream Sparkle: 2,500. Wrong Pokémon: −200; Listen: −25; extra searches: −15 each; movement beyond a minimal exploration allowance: −10 each. Score cannot fall below zero. The lost berry is the pre-existing score bonus, not a new inventory system.
- The result uses the existing Dream World review, with all statistics and explicit score components. Only Seek receives a larger review-stat cap; other games retain their old caps.
- Rare odds retain Off 0, Vanilla .02, Test .25 and Always 1. A collected event reserves and saves before asynchronous resolution. Independent reservation slots prevent overwriting an earlier offline prize, and per-save/per-attempt locks prevent concurrent duplicate delivery. Results never wait for network resolution. Pending rewards retry on the next Seek visit.
- Old save/achievement IDs remain. First-search and three-area-clear achievements are additive; nested unknown/future records survive normalization.

## Visual verification decisions

The source layers include some hard crop boundaries. Scene-edge positioning and CSS feathering blend terrain, water and clouds without modifying their source pixels or claiming background removal. The snowy branch candidate has conspicuous rectangular background content, so it is not used as a floating cave prop. Cave spots instead correspond to the recovered full-background ice walls, ledges, floor, stone arch and entrance. Stone cave scenes are explicitly called stone rather than frozen. Empty Manor shelves are never labelled a library.

Controls, large text, selectors and navigation are outside the image. Hotspots are transparent, including selection; labels below the scene provide an accessible unambiguous alternative. Short viewports may scroll vertically. Results scroll naturally, and text/callout suppression is scoped to minigame UI.

The Dream World hub's only artwork change is replacing its remote venue image/fallback with the bundled verified Forest background; all three games remain available. Other finished Dream World game renderers are unchanged.

## Narrow legacy-test changes

`v0505-pokemon-seek-core.test.cjs` now asserts real graph distance, connected navigation and selected search rather than the obsolete nine-room Manhattan grid and unselected direct search. Original score, wrong-find and forced-rare assertions remain. `v0505-pokemon-seek-integration.test.cjs` now checks named navigation and local Manor source rather than four fixed grid arrows and a remote hotlink. `v0501-dream-world-polish.test.cjs` checks bundled venue art and a genuine minimum-version/consistent-version condition rather than assuming every future version remains in minor 50. Historical exact-release fixtures are retained and reported as historical failures, not silently rewritten.
