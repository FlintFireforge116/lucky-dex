# LuckyDex v0.28.2 test report

## Scope
Tile Puzzle regression fix on top of v0.28.1:
- changing Easy / Normal / Hard no longer blanks the completed-picture reference;
- the selected scene remains locked while changing difficulty;
- v0.28.1 large ready reference, in-run reference and tap-to-enlarge behaviour remain unchanged;
- Android application ID/signing/update path remains unchanged.

## Root cause
`loadedImage()` invoked its callback synchronously when a scene image was already cached. During `run.sceneImage = loadedImage(...)`, that callback could repaint before the assignment completed. The repaint therefore rendered an empty source canvas and stored that empty canvas as the completed-picture reference. The later normal render drew the puzzle correctly, but `targetReady` was already true, leaving the reference blank.

## Fix
Cached-image callbacks are queued as a microtask so `run.sceneImage` is assigned before the repaint callback can run. First-load image events retain their existing asynchronous path.

## Verification
- v0.28.2 cached-scene callback-order regression: PASS
- v0.28.2 release identity: PASS
- v0.28.1 Tile Puzzle scene-lock/reference-layout contract: PASS
- v0.25.3 curated Tile Puzzle scene contract: PASS
- JavaScript syntax check for `arcade-amie.js`: PASS
- Offline Arcade assets: PASS (44 scenes, 2,098 sprites, 2,078 actors)
- Venue audit: PASS (8 assets)
- Adventure audit: PASS (829 images)
- Fossil Museum audit: PASS (42 images)
- Android identity: `com.example.luckydex`, versionCode 282, versionName 0.28.2

## Full test-program sweep
- 112 test programs: PASS
- 14 Playwright-dependent programs: unavailable in this container because the Node Playwright dependency is not installed
- 1 known baseline failure: `v0223-ball-stalls.test.cjs`
- 0 unexpected failures

## Unrelated baseline
`v0223-ball-stalls.test.cjs` fails its historical seeded Ball Drop stress case in both the untouched v0.28.1 source and v0.28.2. `arcade-ball-drop.js` is byte-identical between those versions (SHA-256 `9492033d5bd40b82318fcfc19c470d92576bf93e25b9cd8d199413855efca6e0`), so this is not caused by the Tile Puzzle fix.
