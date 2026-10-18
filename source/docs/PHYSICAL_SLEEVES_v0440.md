# Pokémon Center physical sleeves — v0.44.0

Snapshot acquired from the public [Pokémon Center UK Card Sleeves category](https://www.pokemoncenter.com/en-gb/category/card-sleeves) on 16 October 2026. The ordinary rendered storefront displayed **130 products**, with five page ranges: 1–32, 33–64, 65–96, 97–128, and 129–130. All five pages were enumerated without applying the in-stock filter. The category reported 52 in-stock and 78 sold-out products.

## Exact coverage

| Measure | Count |
|---|---:|
| Public category products enumerated | 130 |
| Non-sleeve products excluded | 3 |
| Sleeve product SKUs represented | 127 |
| Repeated designs under alternate SKUs | 14 |
| Additional design from the two-design Celestial pack | 1 |
| Distinct bundled sleeve designs | **114** |
| Separate offline WebP artwork files | **114** |
| Unresolved sleeve image failures | **0** |

The three excluded products are Rayquaza Among the Stars Playmat (705-97029), Great Wave Pikachu & Friends Playmat (705-97026), and Rapidash Flames & Fairies Playmat (705-97032). They appear in the source category but are not sleeve designs.

The 14 alternate SKUs repeat these designs: Pikachu Pixel, Rayquaza Among the Stars, Ghostly Gathering, Berry Sleepy, Pikachu Comic-Style Attack, Ditto Quartet, Pikachu Comic-Style, We're Goomy, Battle Start, Dreamy Dragonite, Moomoo Milk Medley, Spheal Appeal, Wooloo Fluffy Flock, and Lugia & Ho-Oh. They are represented by one design each; `alternateReferences` preserves the second SKU's public provenance. Copyright year, photo exposure, and studio margin differences between reissues are not treated as new sleeve designs.

Celestial Espeon & Umbreon (10-10166-101) contains two different printed sleeve faces. Its first gallery photograph exposes both flat sleeves; each half is cropped separately and included as Celestial Espeon and Celestial Umbreon. This is why distinct designs total 114 rather than 113.

## Offline artwork and provenance

Runtime metadata is `scripts/data/sleeves-physical-v0440.json`. Each design has a stable `physical-...` ID, normalized display name, `sourceFamily: "Physical TCG"`, official product and exact image URL, offline asset path, themes, known title/visible Pokémon IDs, final file SHA-256, dimensions, and byte count. Pokémon IDs are conservative species-level metadata, not a claim that every tiny background character has been catalogued. There are no invented sleeve designs or substituted example images.

Assets are under `app/src/main/assets/cosmetics/sleeves/physical-v0440/`. They total **3,776,110 bytes** (3.60 MiB), averaging 33,124 bytes, ranging from 8,420 to 63,278 bytes. Widths are 358–416 pixels; heights are 493–578 pixels. Originals are not upscaled. WebP quality is 85. Original studio backgrounds are tightly cropped, retaining printed sleeve borders and copyright lines.

Six older products expose only photographs of fanned sleeves: Galarian Rapidash, Luxray Limitless Lightning, Lunatone & Solrock Eclipse, Volcarona & Frosmoth Freezer Burn, Rapidash, and Pikachu Power Grid. Their unobscured front sleeve faces are isolated from their exposed 1200×1200 gallery photographs using a documented quadrilateral transform. The whole fan, packaging, and white surrounding field are not included in the runtime preview. The six Van Gogh designs have external co-brand footer logos outside the sleeve removed by cropping; the printed sleeve artwork is retained. Co-brand marks printed on the ESA sleeve itself remain part of its design.

## Availability and acquisition limitations

The text-only web reader and direct category HTML request returned an Incapsula iframe. An ordinary browser initially displayed an automatic device verification and then loaded the public category without a CAPTCHA or manual bypass. Category pagination and image attributes were read from that rendered public storefront. Product galleries were inspected for the fan photographs, Eevee Prismatic, and Celestial Espeon & Umbreon.

Eevee Prismatic's category first image was `static/images/no-image.jpg`; its category hover image was a fan photograph. The product gallery exposed a working high-resolution flat image at `High/10000/P7455_705-09365_01.jpg`, which is bundled. Another exposed gallery URL using `P8250_705-09365_01.jpg` returned HTTP 403 and was not used. All chosen images downloaded successfully. This is complete coverage of the category's distinct sleeve designs in this snapshot; it is not a claim to include every physical Pokémon sleeve ever released globally.

## Reproduction and QA

Run `python scripts/fetch-physical-sleeves-v0440.py` with Pillow installed to rebuild from the local original cache. Add `--download` to download the exact observed public URLs when the cache is absent. The downloader never guesses product IDs or unobserved gallery numbering. The complete enumerated URL list and page provenance are in `qa/v0440/physical/catalogue-enumeration.json`; compact seeds are in `catalogue-seed.tsv`. The source and final contact sheets cover every category image and every bundled design respectively.

All four final contact sheets were visually inspected. They show sleeve faces filling the preview, including the separated Celestial designs, the recovered Eevee Prismatic face, the six rectified front sleeves, and Van Gogh faces without external footer logos. `qa/v0440/physical/verification.json` records successful verification of all 114 unique IDs and asset paths, all SHA-256 digests, all decoded dimensions, and all byte counts. `acquisition-summary.json` records zero unresolved image failures.

Original photographs and the contact sheets are QA/source materials under `qa/`; they are not placed in Android runtime assets. This acquisition task does not modify the sleeve registry, UI, or renderer.
