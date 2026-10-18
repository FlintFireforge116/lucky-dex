# TCG Pocket sleeves — v0.44.0 source audit

Source: [Serebii TCG Pocket sleeve reference](https://www.serebii.net/tcgpocket/sleeves.shtml).
The locally saved full HTML is `qa/v0440/pocket/serebii-sleeves-source.html`.
Its SHA-256 is `b8377f3fc7c3465f00e80ba2f8b993d70fdf2345204398cc1098d52c40b06e0f`. Snapshot time: 2026-10-16T07:09:31.424703+00:00.
Scope is every gallery design present in that snapshot, in table order; this is
not a claim that the external site's coverage is exhaustive beyond its table.

## Coverage

- Reference gallery designs: **78**.
- Packaged designs: **78**; unique WebP files: **78**.
- Missing assets: **0**.
- Exact encoded duplicate groups: **0**. Exact original duplicate groups: **0**.
- Total packaged art bytes: **3,262,782**; median file size: **41,154.0** bytes.

`scripts/data/sleeves-pocket-v0440.json` contains the complete ordered rows,
coverage counters, acquisition requirements as reference-only metadata, direct
source URLs, original and packaged hashes/dimensions/sizes, themes and known
National Dex IDs. `artPath` is relative to `app/src/main/assets`.
The upstream acquisition text is provenance and does not define LuckyDex unlocks.
IDs are based on source display names. National Dex IDs cover named subjects
and visually verified Sobble (Pokemon of the Forest), Charmander/Sprigatito
(Street Party), and Pikachu (30th Celebration). Trainer-associated species are
not inferred from their usual team. This is conservative subject tagging,
not a complete inventory of every background cameo.

## Reproduction and visual QA

Run `python scripts/fetch-pocket-sleeves-v0440.py` with Pillow installed to
reproduce from the saved source snapshot and original JPEG cache. Run with
`--refresh` to refresh the entire external reference and art. Network access is
required only for uncached files or refresh. The fetcher asserts that every
gallery anchor is parsed and verifies full-size portrait image decoding.
Original source JPEGs are in `qa/v0440/pocket/source-images/`; no source
thumbnails, webpage chrome, crops, or screenshots are used as app art.
Full art is resized proportionally to at most 400 pixels wide (367px sources
retain their native resolution), encoded WebP quality 86,
method 6 (Pillow 12.3.0, libwebp 1.6.0).
Exact encoded duplicates share one local path. Hashes and manifests support
byte-level verification; reruns with different codec versions may differ.
Contact sheets: `qa/v0440/pocket/contact-sheet-1.jpg`, `qa/v0440/pocket/contact-sheet-2.jpg`, `qa/v0440/pocket/contact-sheet-3.jpg`.

## Complete reference-to-art accounting

Offline independent verification: `python qa/v0440/pocket/verify-assets.py`.
The saved `verification.json` reports PASS for all 78 reference/data/art rows,
all source and packaged hashes, decoded dimensions, proportional sizing without
upscaling, file sizes and manifest totals. All three contact sheets and the
original Forest/Street Party art were visually reviewed. Borders remain intact;
the packaged images contain sleeve art with no webpage chrome or watermark.

| # | Reference design | Packaged art | Bytes |
|---|---|---|---:|
| 1 | Mega Charizard X | cosmetics/sleeves/pocket-v0440/mega-charizard-x.webp | 76,306 |
| 2 | Hoopa | cosmetics/sleeves/pocket-v0440/hoopa.webp | 41,338 |
| 3 | Fennekin | cosmetics/sleeves/pocket-v0440/fennekin.webp | 48,180 |
| 4 | Team Rocket's Boss | cosmetics/sleeves/pocket-v0440/team-rocket-s-boss.webp | 30,084 |
| 5 | Team Rocket | cosmetics/sleeves/pocket-v0440/team-rocket.webp | 5,116 |
| 6 | Zapdos Articuno and Moltres | cosmetics/sleeves/pocket-v0440/zapdos-articuno-and-moltres.webp | 61,004 |
| 7 | Oshawott | cosmetics/sleeves/pocket-v0440/oshawott.webp | 26,116 |
| 8 | Mega Rayquaza | cosmetics/sleeves/pocket-v0440/mega-rayquaza.webp | 40,898 |
| 9 | Metagross | cosmetics/sleeves/pocket-v0440/metagross.webp | 36,282 |
| 10 | Yamper Growlithe Lillipup Rockruff and Fidough | cosmetics/sleeves/pocket-v0440/yamper-growlithe-lillipup-rockruff-and-fidough.webp | 61,428 |
| 11 | Piplup | cosmetics/sleeves/pocket-v0440/piplup.webp | 21,462 |
| 12 | Elesa | cosmetics/sleeves/pocket-v0440/elesa.webp | 31,408 |
| 13 | Sableye | cosmetics/sleeves/pocket-v0440/sableye.webp | 34,818 |
| 14 | Miraidon | cosmetics/sleeves/pocket-v0440/miraidon.webp | 40,970 |
| 15 | Koraidon | cosmetics/sleeves/pocket-v0440/koraidon.webp | 42,526 |
| 16 | Mega Sceptile | cosmetics/sleeves/pocket-v0440/mega-sceptile.webp | 67,396 |
| 17 | Mega Lucario | cosmetics/sleeves/pocket-v0440/mega-lucario.webp | 50,750 |
| 18 | Pokemon of the Forest | cosmetics/sleeves/pocket-v0440/pokemon-of-the-forest.webp | 22,430 |
| 19 | Zoroark | cosmetics/sleeves/pocket-v0440/zoroark.webp | 73,514 |
| 20 | Mega Kangaskhan | cosmetics/sleeves/pocket-v0440/mega-kangaskhan.webp | 27,062 |
| 21 | Shiny Mega Gengar | cosmetics/sleeves/pocket-v0440/shiny-mega-gengar.webp | 42,160 |
| 22 | Morpeko | cosmetics/sleeves/pocket-v0440/morpeko.webp | 33,390 |
| 23 | Arven | cosmetics/sleeves/pocket-v0440/arven.webp | 36,904 |
| 24 | Sprigatito | cosmetics/sleeves/pocket-v0440/sprigatito.webp | 53,806 |
| 25 | Pokemon 30th Celebration Design | cosmetics/sleeves/pocket-v0440/pokemon-30th-celebration-design.webp | 38,366 |
| 26 | Iono | cosmetics/sleeves/pocket-v0440/iono.webp | 42,744 |
| 27 | Toxtricity | cosmetics/sleeves/pocket-v0440/toxtricity.webp | 38,580 |
| 28 | Mega Gardevoir | cosmetics/sleeves/pocket-v0440/mega-gardevoir.webp | 43,464 |
| 29 | Mimikyu | cosmetics/sleeves/pocket-v0440/mimikyu.webp | 19,712 |
| 30 | Goomy | cosmetics/sleeves/pocket-v0440/goomy.webp | 44,060 |
| 31 | Mega Charizard Y | cosmetics/sleeves/pocket-v0440/mega-charizard-y.webp | 45,476 |
| 32 | The New Year With Pikachu | cosmetics/sleeves/pocket-v0440/the-new-year-with-pikachu.webp | 33,328 |
| 33 | Serena | cosmetics/sleeves/pocket-v0440/serena.webp | 50,224 |
| 34 | Mega Gyarados | cosmetics/sleeves/pocket-v0440/mega-gyarados.webp | 52,714 |
| 35 | May | cosmetics/sleeves/pocket-v0440/may.webp | 34,682 |
| 36 | Psyduck | cosmetics/sleeves/pocket-v0440/psyduck.webp | 36,802 |
| 37 | Mega Blaziken | cosmetics/sleeves/pocket-v0440/mega-blaziken.webp | 51,802 |
| 38 | Mega Altaria | cosmetics/sleeves/pocket-v0440/mega-altaria.webp | 52,522 |
| 39 | Special Set 02 | cosmetics/sleeves/pocket-v0440/special-set-02.webp | 43,058 |
| 40 | Professor Oak | cosmetics/sleeves/pocket-v0440/professor-oak.webp | 22,070 |
| 41 | Lillie ver. 2 | cosmetics/sleeves/pocket-v0440/lillie-ver-2.webp | 37,386 |
| 42 | Greninja | cosmetics/sleeves/pocket-v0440/greninja.webp | 44,712 |
| 43 | Quagsire & Clodsire | cosmetics/sleeves/pocket-v0440/quagsire-clodsire.webp | 16,094 |
| 44 | Suicune | cosmetics/sleeves/pocket-v0440/suicune.webp | 54,240 |
| 45 | Pichu | cosmetics/sleeves/pocket-v0440/pichu.webp | 25,162 |
| 46 | Tyranitar | cosmetics/sleeves/pocket-v0440/tyranitar.webp | 35,672 |
| 47 | Ho-oh & Lugia | cosmetics/sleeves/pocket-v0440/ho-oh-lugia.webp | 49,286 |
| 48 | Espeon & Umbreon | cosmetics/sleeves/pocket-v0440/espeon-umbreon.webp | 48,486 |
| 49 | Gladion | cosmetics/sleeves/pocket-v0440/gladion.webp | 46,262 |
| 50 | Eevee ver. 2 | cosmetics/sleeves/pocket-v0440/eevee-ver-2.webp | 19,378 |
| 51 | Sylveon | cosmetics/sleeves/pocket-v0440/sylveon.webp | 61,998 |
| 52 | Ultra Necrozma | cosmetics/sleeves/pocket-v0440/ultra-necrozma.webp | 59,932 |
| 53 | Alolan Vulpix | cosmetics/sleeves/pocket-v0440/alolan-vulpix.webp | 29,464 |
| 54 | Acerola | cosmetics/sleeves/pocket-v0440/acerola.webp | 37,894 |
| 55 | Solgaleo | cosmetics/sleeves/pocket-v0440/solgaleo.webp | 78,730 |
| 56 | Rowlet | cosmetics/sleeves/pocket-v0440/rowlet.webp | 38,476 |
| 57 | Street Party | cosmetics/sleeves/pocket-v0440/street-party.webp | 36,886 |
| 58 | Lillie | cosmetics/sleeves/pocket-v0440/lillie.webp | 24,844 |
| 59 | Lucario | cosmetics/sleeves/pocket-v0440/lucario.webp | 49,798 |
| 60 | Shiny Charizard | cosmetics/sleeves/pocket-v0440/shiny-charizard.webp | 32,398 |
| 61 | Shiny Mewtwo | cosmetics/sleeves/pocket-v0440/shiny-mewtwo.webp | 29,986 |
| 62 | Red and Pikachu | cosmetics/sleeves/pocket-v0440/red-and-pikachu.webp | 50,990 |
| 63 | Manaphy | cosmetics/sleeves/pocket-v0440/manaphy.webp | 28,276 |
| 64 | Arceus | cosmetics/sleeves/pocket-v0440/arceus.webp | 63,570 |
| 65 | Chimchar | cosmetics/sleeves/pocket-v0440/chimchar.webp | 33,088 |
| 66 | Darkrai | cosmetics/sleeves/pocket-v0440/darkrai.webp | 25,158 |
| 67 | Cynthia | cosmetics/sleeves/pocket-v0440/cynthia.webp | 44,934 |
| 68 | Blastoise | cosmetics/sleeves/pocket-v0440/blastoise.webp | 43,492 |
| 69 | Charizard | cosmetics/sleeves/pocket-v0440/charizard.webp | 48,528 |
| 70 | Mythical Island Mew | cosmetics/sleeves/pocket-v0440/mythical-island-mew.webp | 48,720 |
| 71 | Venusaur | cosmetics/sleeves/pocket-v0440/venusaur.webp | 30,224 |
| 72 | Pikachu | cosmetics/sleeves/pocket-v0440/pikachu.webp | 84,230 |
| 73 | Meowth | cosmetics/sleeves/pocket-v0440/meowth.webp | 60,914 |
| 74 | Mewtwo | cosmetics/sleeves/pocket-v0440/mewtwo.webp | 42,368 |
| 75 | Erika and Vileplume | cosmetics/sleeves/pocket-v0440/erika-and-vileplume.webp | 32,226 |
| 76 | Gardevoir | cosmetics/sleeves/pocket-v0440/gardevoir.webp | 52,552 |
| 77 | Special Set 01 | cosmetics/sleeves/pocket-v0440/special-set-01.webp | 28,858 |
| 78 | Eevee | cosmetics/sleeves/pocket-v0440/eevee.webp | 32,618 |
