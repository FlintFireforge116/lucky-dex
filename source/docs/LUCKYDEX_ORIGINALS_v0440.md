# LuckyDex exclusive sleeve art — v0.44.0

Ten distinct original sleeve illustrations were created with the built-in
`image_gen.imagegen` tool, one separate call and prompt per asset. No CLI/API
fallback was used. All are rich 16-bit pixel illustrations inspired by Gen III/IV
Pokémon game art, with a clear subject, layered scene and intact full-bleed frame.
There is no added lettering or watermark.

All ten outputs were inspected individually at full generated size and together
on `qa/v0440/originals/originals-contact-sheet.jpg`. They cover the approved
flagship Pokédex, Midnight Legends, Oak field guide, forest encounter, arcade,
fossil museum, shiny celebration, berry festival, Goldenrod championship, and
travel passport concepts. Artistic map fragments are decorative scenes rather
than navigational reproductions. Pixel art is stylized and generated, rather
than official game sprites.

## Packaging

App assets are under `app/src/main/assets/cosmetics/sleeves/`, retaining eight
existing IDs and adding `goldenrod-champion` and `adventure-passport`.
Each original PNG is saved in `qa/v0440/originals/<id>-source.png`; replaced old
WebPs are preserved as `<id>-previous.webp`. Generated source PNGs remain at
their default Codex generated-images location as well.

Final delivery: **10/10 assets**, zero missing; ten unique encoded hashes.
Each is **400 × 560 WebP**, quality 88, method 6, proportionally resampled with
LANCZOS and no crop. Total app art: **1,171,170 bytes**.
The source and output hashes, sizes and decoded dimensions passed verification
in `qa/v0440/originals/hash-verification.json`.

Full prompts and generation method are recorded per row in
`scripts/data/sleeves-original-v0440.json`; generation inputs and original default
save locations are in `qa/v0440/originals/generation-jobs.json`.
The local `package-originals.py` script reproduces optimization from saved PNGs
without invoking any generation API. Reproducing the art itself requires the
saved source PNGs; another generative call may produce different imagery.
Data rows use art paths relative to `app/src/main/assets`.

`golden-recipe` now displays **Berry Festival** to retain the existing collection
ID while improving its identity and varied berry content. The new Goldenrod
entry supplies the integration group `goldenrod:master-gold`; Adventure Passport
supplies `region:kanto`. Core registry and unlock behavior are integrated by the
main task.

| Stable ID | Display name | App bytes |
|---|---|---:|
| luckydex-default | LuckyDex Flagship | 118,656 |
| luckydex-midnight | Midnight Legends | 108,744 |
| luckydex-cream | Oak’s Field Guide | 96,776 |
| luckydex-pixel | Forest Encounter | 131,842 |
| arcade-pass | Arcade Champion | 118,466 |
| museum-fossil | Amber Fossil Museum | 103,738 |
| shiny-charm | Shiny Celebration | 113,506 |
| golden-recipe | Berry Festival | 130,990 |
| goldenrod-champion | Goldenrod Champion | 120,600 |
| adventure-passport | Adventure Passport | 127,852 |
