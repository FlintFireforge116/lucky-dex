# v0.22.3 venue artwork sources

Reviewed against the provided phone-world.jpg and phone-kalos.jpg. All essential runtime assets are packaged locally. Image area and action-button QA are handled by the shared Arcade renderer; these assets are intended for its contained cover headers (35–45% of usable viewport).

| Venue | Before | Selected local header | Subtitle | Cover focal position |
|---|---|---|---|---|
| Kalos Amie Garden | `arcade/authentic-v0200/venues/amie-garden.jpg` | `arcade/venues-v0223/kalos-amie-nature-xy.png` | Kalos · Pokémon-Amie | 50% 50% |
| Goldenrod Game Corner | `arcade/authentic-v0200/venues/goldenrod-game-corner.jpg` | `arcade/venues-v0223/goldenrod-game-corner-hgss.png` | Johto · HGSS | 50% 45% |
| Celadon Game Corner | `arcade/authentic-v0200/venues/celadon-game-corner.jpg` | `arcade/venues-v0223/celadon-game-corner-hgss.png` | Kanto · HGSS | 50% 25% |
| Lilycove Contest Hall | `arcade/authentic-v0200/venues/lilycove-contest-hall.jpg` | `arcade/venues-v0223/lilycove-contest-emerald.png` | Hoenn · Emerald | 50% 40% |
| Moon Stage | `arcade/authentic-v0200/venues/moon-stage.png` | `moon_stage_bg3.png` | Clefairy Match | 65% 30% |
| Oreburgh Mining Museum | `arcade/authentic-v0200/venues/oreburgh-museum.png` | `arcade/venues-v0223/oreburgh-museum-dppt.png` | Sinnoh · DPPt | 50% 40% |
| Ruins of Alph | `arcade/authentic-v0200/venues/ruins-of-alph.jpg` | `arcade/venues-v0223/ruins-alph-hgss-day.png` | Johto · HGSS | 65% 50% |
| Indigo Plateau | `arcade/authentic-v0200/venues/indigo-plateau.jpg` | `arcade/venues-v0223/indigo-plateau-hgss.png` | Johto/Kanto · HGSS | 50% 10% |

## Selection and provenance

### Kalos Amie Garden

Replaced giant ORAS Poké Puff menu with the original XY Amie nature garden wallpaper; no menu controls, Pokémon actors or unrelated minigame capture.

- Local: `arcade/venues-v0223/kalos-amie-nature-xy.png` (320 × 240, PNG, 67398 bytes)
- Encoded output filename: `kalos-amie-nature-xy.png`
- SHA-256: `c47199139de2f2dc2583ddfd30817b48f440c0767df46160731c8f907a74f907`
- Source page: [https://www.spriters-resource.com/3ds/pokemonxy/sheet/62308/](https://www.spriters-resource.com/3ds/pokemonxy/sheet/62308/)
- Direct asset: [https://www.spriters-resource.com/media/assets/59/62308.png](https://www.spriters-resource.com/media/assets/59/62308.png)
- Source local: `arcade/authentic-v0200/amie/backgrounds-sheet.png`; SHA-256 `f2385bf7e6f59e08b2656c5cb1bdc1d91874e4a1b5dbbcbb27b931ac851b698c`
- Exact crop (left, top, right, bottom): `[1, 969, 321, 1209]`. Unretouched rectangular crop; source pixels and original alpha preserved.

### Goldenrod Game Corner

Replaced exterior screenshot with the clean complete original Game Corner building panel; avoids the unrelated Pokémon Center and foreground player.

- Local: `arcade/venues-v0223/goldenrod-game-corner-hgss.png` (131 × 104, PNG, 4205 bytes)
- Encoded output filename: `goldenrod-game-corner-hgss.png`
- SHA-256: `ffcf9033563714932ead7db580c0fcab8fe79281228fd3c2bddd50f28251486c`
- Source page: [https://bulbapedia.bulbagarden.net/wiki/File:Goldenrod_Game_Corner_HGSS.png](https://bulbapedia.bulbagarden.net/wiki/File:Goldenrod_Game_Corner_HGSS.png)
- Direct asset: [https://archives.bulbagarden.net/media/upload/b/b9/Goldenrod_Game_Corner_HGSS.png](https://archives.bulbagarden.net/media/upload/b/b9/Goldenrod_Game_Corner_HGSS.png)

### Celadon Game Corner

Replaced annotated exterior screenshot with clean original Game Corner and Prize Corner building panel; no red tutorial arrow.

- Local: `arcade/venues-v0223/celadon-game-corner-hgss.png` (213 × 168, PNG, 6536 bytes)
- Encoded output filename: `celadon-game-corner-hgss.png`
- SHA-256: `109c9581dba1e4310e74880414e337107c36f784e6a3749f511ee23388a2ed07`
- Source page: [https://archives.bulbagarden.net/wiki/File:Celadon_Game_Corner_HGSS.png](https://archives.bulbagarden.net/wiki/File:Celadon_Game_Corner_HGSS.png)
- Direct asset: [https://archives.bulbagarden.net/media/upload/a/ac/Celadon_Game_Corner_HGSS.png](https://archives.bulbagarden.net/media/upload/a/ac/Celadon_Game_Corner_HGSS.png)

### Lilycove Contest Hall

Replaced ORAS exterior with actual Emerald Contest Hall exterior, matching the restored Emerald Berry Blender.

- Local: `arcade/venues-v0223/lilycove-contest-emerald.png` (217 × 135, PNG, 6119 bytes)
- Encoded output filename: `lilycove-contest-emerald.png`
- SHA-256: `d2856447fd55425e04687128bc71ab508407364367926ada5bac8d929627a869`
- Source page: [https://bulbapedia.bulbagarden.net/wiki/File:Contest_Hall_E.png](https://bulbapedia.bulbagarden.net/wiki/File:Contest_Hall_E.png)
- Direct asset: [https://archives.bulbagarden.net/media/upload/c/c8/Contest_Hall_E.png](https://archives.bulbagarden.net/media/upload/c/c8/Contest_Hall_E.png)

### Moon Stage

Retained user-approved restored scenic Moon Stage. Existing packaged moon-stage.png is byte-identical to moon_stage_bg3.png; no new generated artwork.

- Local: `moon_stage_bg3.png` (646 × 530, PNG, 612992 bytes)
- Encoded output filename: `moon_stage_bg3.png`
- SHA-256: `fb382f9c4859e1eacd06515b6840d98a4f3cfee98e499738b48bb39259b40036`
- Provenance: Existing user-approved local scene; remote origin not recorded. Do not represent as a newly sourced retail game asset.

### Oreburgh Mining Museum

Replaced BDSP screenshot with the complete museum exterior cropped directly from the original DPPt location capture. Rejected Platinum tutorial screenshot because of giant red arrows.

- Local: `arcade/venues-v0223/oreburgh-museum-dppt.png` (230 × 162, PNG, 5650 bytes)
- Encoded output filename: `oreburgh-museum-dppt.png`
- SHA-256: `907a3d4dd848f548e977ead8000a1c882102e8bc36a857985cd21787a91a2b1d`
- Source page: [https://archives.bulbagarden.net/wiki/File:Oreburgh_City_DPPt.png](https://archives.bulbagarden.net/wiki/File:Oreburgh_City_DPPt.png)
- Direct asset: [https://archives.bulbagarden.net/media/upload/1/19/Oreburgh_City_DPPt.png](https://archives.bulbagarden.net/media/upload/1/19/Oreburgh_City_DPPt.png)
- Source local: `arcade/venues-v0223/oreburgh-city-dppt-source.png`; SHA-256 `698ea14c0b022626a393072193de106516e6729d3a0402f3a79c82974d636aab`
- Exact crop (left, top, right, bottom): `[704, 48, 934, 210]`. Unretouched rectangular crop; source pixels and original alpha preserved.

### Ruins of Alph

Replaced generic grassy field capture with the actual retail HGSS Ruins of Alph daytime location-preview panel, showing the Unown-lined chamber entrance. This is the preview artwork; app renders its own venue title.

- Local: `arcade/venues-v0223/ruins-alph-hgss-day.png` (256 × 160, PNG, 11525 bytes)
- Encoded output filename: `ruins-alph-hgss-day.png`
- SHA-256: `45ce483695b5cce93cee4b6515a2e40db9b21812f7dfcbbbbc40e551709b5edc`
- Source page: [https://archives.bulbagarden.net/wiki/Category:Location_preview](https://archives.bulbagarden.net/wiki/Category:Location_preview)
- Direct asset: [https://archives.bulbagarden.net/media/upload/7/7e/HGSS_Ruins_of_Alph-Day.png](https://archives.bulbagarden.net/media/upload/7/7e/HGSS_Ruins_of_Alph-Day.png)

### Indigo Plateau

Replaced narrow foreground-player screenshot with clean original Indigo Plateau location panel and the League approach.

- Local: `arcade/venues-v0223/indigo-plateau-hgss.png` (480 × 391, PNG, 42477 bytes)
- Encoded output filename: `indigo-plateau-hgss.png`
- SHA-256: `60ebd15de82786ec7f796b2a29e77b1feda8b400735951382cc940d46f1a5cb9`
- Source page: [https://archives.bulbagarden.net/wiki/File:Indigo_Plateau_HGSS.png](https://archives.bulbagarden.net/wiki/File:Indigo_Plateau_HGSS.png)
- Direct asset: [https://archives.bulbagarden.net/media/upload/8/83/Indigo_Plateau_HGSS.png](https://archives.bulbagarden.net/media/upload/8/83/Indigo_Plateau_HGSS.png)

## Asset limits and rejected alternatives

- Kalos uses a real Pokémon-Amie menu background rather than a building: Pokémon-Amie has no garden building entrance asset in the inspected source sheet. The garden wallpaper is original retail artwork, and the app title/subtitle provides its venue identity. The giant confection menu and random minigame screenshots were rejected.
- Ruins uses the actual HGSS location-preview artwork. It does not bake an English title into the image.
- Goldenrod, Celadon, Lilycove and Oreburgh use authentic building/location captures where no comparable location-preview/title panel was found. These are deliberate exact exteriors, not gameplay scenes.
- The original sprite panels are deliberately kept at native resolution. No upscaling reconstruction, invented pixels, blur padding or AI output was added.
- Moon Stage is the explicit exception: preserve the existing approved local scenic art. Both old scene paths have the same hash, so this is no visual replacement.
- Guide Strats Platinum museum image was rejected because of its red tutorial arrows. Source URL: https://static.guidestrats.com/images/09/31964/23-pokemon-platinum-entering-the-mining-museum-to-the-north-of-pokemon-center.jpg
- Bulbagarden game images are documented by their repository as game screenshots/derived artwork and fair-use uploads; this does not transfer ownership. Original Pokémon imagery remains owned by its respective rights holders.
- Source master retained locally for museum crop verification: `arcade/venues-v0223/oreburgh-city-dppt-source.png` (not used by the renderer).

## Verification

Run the bundled Python with Pillow: `python scripts/verify_v0223_venues.py`. It validates all eight venue files, encoded filenames, hashes, dimensions, source hashes, exact crop pixels, retained Moon Stage identity and local file confinement. No network is required.
