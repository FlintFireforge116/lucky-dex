# Dream World Seek asset provenance

The bundled Seek images come from the user-supplied [Dream World Revival asset repository](https://github.com/Shade-of-Gr3y/Dream-World-Revival), pinned to commit `36e3c302d4ba3f79886efccb731c5e4e65143341`. The exact source path, commit-pinned URL, Git blob hash, original SHA-256, dimensions, mode, alpha extrema, encoded size and output SHA-256 are recorded for every image in `app/src/main/assets/arcade/dream-world/seek/assets-manifest.json`.

Source provenance is not an open-license claim. This document does not assert that GitHub hosting grants redistribution rights to the underlying Pokémon artwork. No license was invented for these assets.

## Selection and processing

`scripts/stage-seek-assets.py` stages 38 explicitly selected source images. It verifies source bytes against the pinned Git tree with Git's actual `blob <length>\0` SHA-1 construction and against the candidate SHA-256. It retains the 10 original JPEGs byte-for-byte and encodes the 28 PNGs as full-size lossless WebP with `exact=True`, then compares every decoded RGBA pixel with the decoded source. No drawing, cropping, background removal, compositing, recoloring, generative recreation or interpolation is performed.

Reproduction from the existing candidate cache:

```powershell
python scripts/stage-seek-assets.py
```

On a fresh cache, `--download` retrieves only the three selected named Café props; it does not download the whole repository. The existing catalogue and parent candidate manifest are required. The supplemental source records live in `reference/dw-candidates/supplemental-manifest.json`.

The 38 staged assets total 8,551,344 bytes. Their source files total 12,826,900 bytes. Lossless WebP reduces the extracted PNGs; retaining the original JPEG backgrounds avoids increasing their file size. This saves 7,580,646 bytes compared with converting all selected files to lossless WebP. The source and output dimensions and decoded pixels are identical throughout. Only the ten explicitly superseded stage-owned WebPs are removed, after all new outputs and the full manifest have been verified and written.

## Recovered art versus authored rooms

The numbered image files under area template folders are source template layers, grouped as recovered/extracted repository assets. Named décor marked `(RIP)` is supplied as recovered décor by the repository. This classification reports the source's context and naming, rather than an independent chain of custody from the original service.

`cafe-interior` is supplied under `Completed Assets/Pokemon Cafe`, rather than an extracted numbered template folder. Its original-versus-reconstructed status is not independently established and the manifest says so explicitly. None of these images was recreated by LuckyDex.

The app's new scene compositions, placements, search spots and navigation are authored for LuckyDex. Using recovered layers does not establish that a particular composition, room name, furniture arrangement or connection graph existed in the historical Dream World. Display labels must describe the actual visible composition. Do not describe these authored rooms as historical reproductions.

## Useful visible content

| Area | Bundled stems and visible content |
| --- | --- |
| Pleasant Forest | `forest-base`: trees and undergrowth; `forest-layer-8`: earth clearing and distant tree line; `forest-layer-393`: grassy mound; `forest-layer-120`: grass ground; `forest-layer-72`: rounded leafy bush. |
| Windswept Sky | `sky-base`: repeated white cloud clusters; `sky-layer-8`: blue sky wash; `sky-layer-188`: tiered cloud platform; `sky-layer-273`: tall cloud column. |
| Sparkling Sea | `sea-layer-1`: blue underwater backdrop; `sea-layer-4`: bright rippled water; `sea-layer-105`: curved submerged rock wall; `sea-layer-429`: broad submerged rock ledge. No coral or dock is supplied by these selected images. |
| Spooky Manor | `manor-e`: exterior, steps, windows and shrubs; `manor-b`: purple tiled floor; `manor-layer-65`: pale interior wall and wooden trim; `manor-layer-365`: purple stone brick wall. `manor-bookcase` has **empty shelves**; it does not depict books. `manor-sofa` is red and tufted; `manor-bed` has a pale blue cover; `manor-lamp` has an amber shade. |
| Rugged Mountain | `mountain-b`: rocky path, mountain ridges, shrubs, conifers and flowers; `mountain-layer-189`: tan rock ground; `mountain-layer-514`: blue pool with rocky rim. No mine cart is supplied. |
| Icy Cave | `ice-a`: icy blue chamber; `ice-b`: ochre stone chamber; `ice-c`: ochre cave entrance; `ice-layer-687`: snowy green conifer branch. The brown chambers are not themselves frozen. |
| Dream Park | `park-a`: paved plaza; `park-b`: paved path through grass; `park-layer-134`: grass field and distant hedge; `park-layer-684`: grass mound with little bushes; `park-layer-874`: purple balloon; `park-layer-889`: red balloon. No fountain or bench is supplied. |
| Pokémon Café Forest | `cafe-interior`: empty warm curved room with pale floor and overhead beams; `cafe-table`: 217×131 low oval yellow table, checkered edge and printed Pokémon Café motif; `cafe-pot`: 86×91 cream coffee pot with long spout, lid, handle and printed motif; `cafe-cup`: 52×50 cream cup with blue rim and yellow character silhouette. Small source edge artifacts are retained; the tiny cup should be displayed near native size. |

These ten stems resolve to `<stem>.jpg`: `forest-base`, `sky-base`, `manor-e`, `manor-b`, `mountain-b`, `ice-a`, `ice-b`, `ice-c`, `park-a`, `park-b`. Every other stem resolves to `<stem>.webp`. Each manifest entry exposes stable `id`/`stem`, exact `file`, and exact `outputPath` (relative to `app/src/main`), so consumers can resolve the format without guessing. The files physically live in the bundled `seek` folder. Transparent source surrounds and existing shadows are preserved. All useful selected props/layers were visually inspected in the parent contact sheets or individually for the three supplemental Café props. No arbitrary unnamed template image was downloaded to invent a new prop; the selected bush, rock ledges, snowy branch and balloons already support the visible search interactions.

## Explicit omissions and limitations

- Dream Ruins: no supported area assets found in the inspected catalogue. Omitted rather than fabricated.
- Café A/B/C/E/F candidates: these are repository `Asset Recreation/Backgrounds/Pokemon Cafe Forest` files with baked browser/game UI, text panels, arrows or frames. They are rejected as scene backdrops; they were not cleaned or regenerated.
- `seek-background`: pale mist image, not a usable location environment. Rejected as the main scene background.
- Proposed target Pokémon: `Completed Assets/Pokemon Graphics etc/base-dream-world-pokemon` provides numbered SVG/SWF and a 15 MB montage, rather than practical individual PNGs for the proposed pool. The `b2w2 pokemon/png` folder contains a limited set of later species/forms and does not provide these proposed pool members. No montage was cropped, no numbered filename was guessed into a species illustration, and no new `pokemon-DEX.webp` was bundled. Existing LuckyDex actor artwork remains a fallback and must not be described as recovered Dream World actor artwork. Encounter provenance is a separate gameplay-data audit.
- The secondary Bulbagarden décor/items categories were reachable and inspected in the broader source audit. These selected repository assets were preferred, so duplicate décor downloads from the secondary source were unnecessary.

All runtime files are bundled locally; these source URLs are provenance records, not runtime hotlinks.
