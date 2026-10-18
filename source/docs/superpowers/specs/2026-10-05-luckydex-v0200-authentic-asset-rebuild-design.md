# LuckyDex v0.20.0 Authentic Arcade Rebuild — Design Specification

**Date:** 2026-10-05
**Baseline:** LuckyDex v0.19.1

## Purpose

v0.19.1 corrected several mechanics but still presents the Arcade as CSS-drawn approximations. v0.20.0 replaces that visual approach with actual-game screenshots and extracted/reference assets wherever available, while preserving LuckyDex saves, rewards and navigation.

## Binding requirements

1. No active Arcade venue may use the generated `venues-v0190` illustrations.
2. Venue art must come from actual Pokémon game screenshots/maps or direct extracted game assets, stored locally in the APK at build time.
3. Retail-derived minigames use actual source-game imagery/assets as their dominant visual surface, not CSS-drawn substitutes.
4. Preserve source-game proportions: game surfaces use explicit aspect-ratio frames rather than large fixed min-heights.
5. Every START / PLAY AGAIN primary control is visible inside the initial game viewport on typical 360x800 and 412x915 Android portrait screens.
6. The Arcade world must have no native horizontal scrollbar. Navigation uses an overflow-hidden viewport with a transform-driven track, swipe gesture and previous/next buttons.
7. The selected venue is visually dominant; neighboring venues may peek at the sides but never collapse into narrow strips.
8. Existing v0.19.1 mechanics, save state, centralized rewards and signing key remain compatible unless fidelity requires a narrowly-scoped game-surface change.
9. Actual assets are obtained by a deterministic build-time fetch script with explicit source URLs and validation. Asset download failure fails the build rather than silently falling back to generated art.
10. Package/application ID and signing keystore remain unchanged. Release is `versionName '0.20.0'`, `versionCode 210`.

## Venue source direction

- Kalos Amie Garden: actual Pokémon-Amie screen / X-Y/ORAS minigame imagery.
- Goldenrod Game Corner: HGSS Goldenrod Game Corner screenshot/map.
- Celadon Prize Machine: HGSS Celadon Game Corner/prize building screenshot.
- Lilycove Contest Hall: Pokémon Emerald Lilycove Contest Hall game screenshot/map.
- Stadium Classroom: Pokémon Stadium Clefairy Says classroom screenshot.
- Oreburgh Mining Museum: BDSP Oreburgh Mining Museum game screenshot.
- Ruins of Alph: HGSS Ruins of Alph game screenshot.
- Indigo League Quiz: HGSS Indigo Plateau game screenshot.

## Game presentation direction

- Berry Picker / Head It / Tile Puzzle: Pokémon-Amie actual minigame screenshots/assets define the frame, palette, spacing and control proportions. Existing dynamic gameplay overlays sit within that frame.
- Voltorb Flip: use HGSS-faithful tile/frame/memo assets and match the DS 5x5 + clue + memo composition.
- Berry Blender: use `pret/pokeemerald` extracted Berry Blender center/outer/arrow/start/particle assets.
- Clefairy Says: use actual Pokémon Stadium classroom visual as the scene and place interactive sequence/controls in the same regions.
- Underground Mining: use actual Sinnoh Underground imagery as the wall/tool visual basis.
- Unown Decoder / Who's That Pokémon / Poké Ball Drop: use actual location/game UI imagery where a direct canonical minigame does not exist; do not fabricate a painted venue backdrop.

## Phone layout

Game header/session information is compact. The primary retail-shaped game frame plus its Start control must fit before the bottom of a 360x800 viewport after app chrome. Start controls are overlaid in a safe bottom control shelf inside the game frame before a run, then hidden/minimized during active play. No primary game surface uses a hard `min-height` above 420px on narrow phones.

## Acceptance criteria

- No generated v0.19 venue WebP is referenced by active v0.20 navigation.
- World computed overflow-x is hidden and no native scrollbar is possible.
- Eight venue art paths point to `arcade/authentic-v0200/` local assets.
- Berry/Head/Tile, Voltorb, Berry Blender, Clefairy and Fossil surfaces reference authentic-v0200 assets.
- On 360x800 and 412x915, opening every visible game leaves its initial primary Start/control action within the viewport and clickable.
- Full Node/pytest/static suite passes; all asset JS syntax checks pass; ZIP integrity passes.
- GitHub Actions fetches/validates authentic assets before Gradle and builds v0.20.0 with the stable key.
