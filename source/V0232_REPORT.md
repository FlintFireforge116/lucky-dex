# LuckyDex v0.23.2 — Adventure field polish

This patch is deliberately narrow and keeps the v0.23.0 Adventure 2.0 architecture intact.

## Changes

### Field discoveries
- Coin discoveries no longer render the Lucky Egg sprite.
- Lucky Coins use a dedicated gold coin UI emblem (`◉`) and the reward copy now says `+N Lucky Coins`.
- Existing saved discovery reveals continue to render correctly after updating.

### Wild Roam hotspot alignment
- The interactive habitat now owns the same scene background that hotspot coordinates are positioned against.
- This removes the old mismatch where the background was scaled across the whole Adventure screen while hotspots were positioned only inside the content sub-rectangle.
- Existing active-roam saves are re-synchronised from their hotspot `slot` to the current biome blueprint on render.
- Viridian anchors were refined so Fresh Tracks is on the upper path and Shaking Tree is on the isolated upper-right tree; lower grass clues remain in the grass beds.

### Battle pacing
- Battle state still resolves deterministically and saves synchronously, but the UI no longer jumps both sides to their post-turn HP before animation starts.
- Player hit/heal presentation updates its target HUD when that event lands.
- Opponent attacks have a 420 ms wind-up after the player action, followed by their own hit/recoil and HP update.
- Hit results hold for 260 ms before the next event.
- Potion, switch, miss and boss-modifier presentation receive short readable pauses as well.
- Controls remain disabled while a turn is animating, preserving exactly-once actions.

## Compatibility
- applicationId remains `com.example.luckydex`.
- versionCode: `232`
- versionName: `0.23.2`
- `file:///android_asset/index.html` and `luckyDexSave` remain unchanged.
- Existing signing workflow is unchanged.

## Verification
- New v0.23.2 regression contract: PASS.
- 13 non-browser Node test programs: PASS.
- Adventure battle reducer/renderer suite: 18/18 subtests PASS.
- JS syntax: 23/23 packaged top-level/adventure JS files PASS.
- Duplicate HTML IDs: 0.
- Adventure CSS brace balance: PASS.
- Authentic Arcade asset audit: PASS (44 scenes/sheets/crops, 2,098 sprites, 2,078 actors).
- Venue asset audit: PASS (8/8).
- Adventure asset audit: PASS (829 images, 1,025 species, 386 back sprites, 37 registry objects).

## Environment limitation
The Node Playwright dependency is not present in this execution environment, so browser-dependent regression programs were not rerun here. They remain packaged for CI/GitHub, where `npm ci` can restore Playwright and run the complete suite.
