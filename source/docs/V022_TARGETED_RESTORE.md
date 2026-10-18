# LuckyDex v0.22.0 Targeted Restore

This release is a controlled follow-up to the v0.21 recovery architecture. Do not restore the old multi-generation Arcade overlay stack.

## Active Arcade roster

1. Berry Picker — `arcade-amie.js`
2. Tile Puzzle — `arcade-amie.js`
3. Voltorb Flip — `arcade-classics.js`
4. Poké Ball Drop — `arcade-ball-drop.js`
5. Berry Blender — `berry-blender.js` + restored historical `berry-blender.css`
6. Clefairy Match — `clefairy-memory.js` + `clefairy-scene.js/css`
7. Fossil Excavation — `arcade-classics.js`
8. Unown Decoder — `arcade-unown.js`
9. Who's That Pokémon? — `arcade-quiz.js`

Head It is intentionally retired from the active UI and router. Legacy `bestHeadIt` data remains accepted for save compatibility.

## User-requested restores

- Clefairy: restored the preferred Moon/Pond four-action memory game (star/song/moon/spin) inside a single current owner with cancellable timers/animation lifecycle.
- Berry Blender: retained the current cleaned-up owner/mechanics and restored the earlier v0.16-era presentation and continuous BEST/GOOD/MISS timing style.
- Poké Ball Drop: radius increased from 20 to 30 throughout the physics model.
- Tile Puzzle: persistent TARGET preview is generated from the exact source canvas. Source scenes now rotate through three packaged Amie backdrops with varied Pokémon/prop layouts rather than the near-empty purple backdrop.
- Fossil Excavation: 7×8 wall, 18 digs, one tap per cell. A fossil hit reveals its complete fossil shape; already revealed cells are inert.
- Arcade layout: normal LuckyDex top/bottom chrome hides only after Arcade is actually entered. Arcade world/venues now explicitly fill 100% of the usable WebView content box rather than collapsing to content height or using immersive Android fullscreen.
- Berry Picker: stage flexes vertically rather than remaining a fixed 5:3 widget.

## Save/update compatibility

Keep these unchanged:

- Android applicationId: `com.example.luckydex`
- WebView origin: `file:///android_asset/index.html`
- primary save key: `luckyDexSave`
- stable signing certificate used by prior LuckyDex test builds

v0.22 is `versionCode 220`. The distributable source ZIP excludes signing keys. CI must restore the established signer via `LUCKYDEX_KEYSTORE_BASE64` for an in-place APK update.

Settings now exposes Import Save as a companion to Export Save. Import validates JSON and requires confirmation before replacing `luckyDexSave`.

## Remaining visual work suitable for a later Codex pass

The v0.21 local venue set remains authoritative except Kalos Amie and Moon Stage, which were changed to match this restore. Kalos now uses the packaged Pokémon-Amie hub capture (`amie-garden.jpg`) rather than the Berry Picker gameplay screenshot. Additional venue-image selection can be iterated independently without changing runtime ownership. Run phone browser/device QA before making further layout changes.
