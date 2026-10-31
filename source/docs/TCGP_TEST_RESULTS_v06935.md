# v0.69.35 test results

Fresh post-review TCG run: **37/37 programs pass**, 0 fail.

Combined attempted test files: **735 unique programs**, 567 latest recorded passes and 168 failures, using fresh focused results for overlaps.

Broader continuation sweep: **565/733 programs pass**, 168 fail. This sweep started before two late-added files; both are in the fresh focused run. It ran across intermediate pass revisions; the changed TCG boundary was rerun after review.

The whole project is not green. The standard runner also stops on the Adventure Map-tool failures reproduced before this implementation. Unrelated historical release/asset/Adventure assertions are not silently rewritten. Every failing program is listed below; full assertions and process errors are in verification/all-project-results.json. A timeout is a failure, not a pass.

## Every failed sweep program

### adventure-location-browser-v0402.test.cjs

Exit: 1

- ✖ v0402 starting town has at most six valid local actions, truthful services, and a separate unique tool strip (6238.0966ms)
- ✖ v0402 first-Gym chapter completes through ordinary UI travel and real PP-bearing battle moves (8376.2542ms)
- ✖ failing tests:
- ✖ v0402 starting town has at most six valid local actions, truthful services, and a separate unique tool strip (6238.0966ms)
- AssertionError [ERR_ASSERTION]: Map appears exactly once
- ✖ v0402 first-Gym chapter completes through ordinary UI travel and real PP-bearing battle moves (8376.2542ms)
- AssertionError [ERR_ASSERTION]: New Bark Town one Map tool

### adventure-location-legacy-sections-v0402.test.cjs

Exit: 1

- ✖ legacy optional merchant node resumes, can browse and return to its place without travel or payment (14053.2611ms)
- ✖ failing tests:
- ✖ legacy optional merchant node resumes, can browse and return to its place without travel or payment (14053.2611ms)

### adventure-location-menu-v0402.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### adventure-location-scenes.test.cjs

Exit: 1

- ✖ native source evidence is pinned, intact, and each complete component stays inside its scene (137.0177ms)
- ✖ failing tests:
- ✖ native source evidence is pinned, intact, and each complete component stays inside its scene (137.0177ms)
- AssertionError [ERR_ASSERTION]: data/layouts/layouts.json

### adventure-move-data.test.cjs

Exit: 1

- ✖ pinned cached inputs match recorded SHA-256 provenance (246.0198ms)
- ✖ failing tests:
- ✖ pinned cached inputs match recorded SHA-256 provenance (246.0198ms)
- AssertionError [ERR_ASSERTION]: move_meta.csv

### adventure-persistence.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### adventure-regional-browser.test.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### adventure-runtime.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /Catch Chain.*7/. Input:

### adventure-scene-nav-browser-v0403.test.cjs

Exit: 1

- ✖ v0403 scene and all controls fit without document or pane scrolling at five sizes (6143.2246ms)
- ✖ v0403 normal town and route show a bounded avatar, gym preparation and battle omit it (6196.3996ms)
- ✖ failing tests:
- ✖ v0403 scene and all controls fit without document or pane scrolling at five sizes (6143.2246ms)
- AssertionError [ERR_ASSERTION]: New Bark Town one Map tool
- ✖ v0403 normal town and route show a bounded avatar, gym preparation and battle omit it (6196.3996ms)
- AssertionError [ERR_ASSERTION]: New Bark Town renders player avatar

### adventure-scene-nav-chapter-v0403.test.cjs

Exit: 1

- ✖ v0403 real first Johto Gym earns badge and persists onward Route32 with natural city/Gym exit (8289.8431ms)
- ✖ failing tests:
- ✖ v0403 real first Johto Gym earns badge and persists onward Route32 with natural city/Gym exit (8289.8431ms)
- AssertionError [ERR_ASSERTION]: New Bark Town one Map tool

### adventure-tools-browser-v040.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /1,240 → 1,060/. Input:

### adventure3-preservation.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: unchanged supplied v0.39.1 file: app/src/main/assets/arcade-dig-dig-dig-core.js

### adventure3-shared-functions.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: supplied v0.39.1 shared function unchanged: loadState

### adventure3-ux-v0401-battle.test.cjs

Exit: 1

- ✖ Wild Hunt command, Fight, Bag and switch menus fit phones and preview never spends a turn (8183.0089ms)
- ✖ failing tests:
- ✖ Wild Hunt command, Fight, Bag and switch menus fit phones and preview never spends a turn (8183.0089ms)
- AssertionError [ERR_ASSERTION]: bag drawer needs no scrolling {"scroll":287,"client":252}

### adventure3-ux-v0401-journey.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: route offers contextual field actions

### adventure3-ux-v0401-release.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: expected v0.40.x

### adventure3-ux-v0401-tools.test.cjs

Exit: 1

- ✖ Compact Mart, purchase confirmation and field Bag fit and debit only once (1769.7682ms)
- ✖ failing tests:
- ✖ Compact Mart, purchase confirmation and field Bag fit and debit only once (1769.7682ms)
- AssertionError [ERR_ASSERTION]: Mart: {"outer":0,"horizontal":0,"inner":215,"top":64,"bottom":628,"height":640}

### amie-recovery.test.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### arcade-dash-gen3-assets.test.cjs

Exit: 1

- ✖ pinned upstream cache has intact source bytes for palettes, tiles, metatiles and map evidence (4.0687ms)
- ✖ failing tests:
- ✖ pinned upstream cache has intact source bytes for palettes, tiles, metatiles and map evidence (4.0687ms)
- AssertionError [ERR_ASSERTION]: data/layouts/layouts.json

### recovery-layout.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: voltorb scene ratio must be preserved: {"x":8,"y":186,"width":344,"height":14}

### recovery-lifecycle.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### recovery-navigation.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### recovery-runtime.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: berryPicker useful initial control {"fully":true,"hit":false,"enabled":true,"rect":{"x":8,"y":754,"w":344,"h":46},"overflow":0}

### recovery-trade-refresh.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### recovery-transactions.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### v022-update-compat.test.cjs

Exit: 1

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06935\source\.github\workflows\build-apk.yml'

### v0223-berry-touch.test.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### v0223-fossil.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0223-layout-grid.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: visible/tappable [data-venue-game="thunderingDynamo"]

### v024-compat.test.cjs

Exit: 1

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06935\source\.github\workflows\build-apk.yml'

### v0243-release-signing.test.cjs

Exit: 1

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06935\source\.github\workflows\build-apk.yml'

### v0244-release-dates.test.cjs

Exit: 1

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06935\source\.github\workflows\build-card-art-index.yml'

### v0250-fossil-routing-browser.test.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### v0255-lifecycle-chain-assets.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: new roam sessions must resume the destination field chain

### v0258-pack-wrapper.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: ordinary boosters retain the pointy wrapper while fixed products use their own shell

### v0259-global-excavation-booster-art.test.cjs

Exit: 1

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06935\source\.github\workflows\build-apk.yml'

### v0261-github-index-workflows.test.cjs

Exit: 1

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06935\source\.github\workflows\build-card-art-index.yml'

### v0264-booster-art-audit-and-slim-pack.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0267-physical-card-art-recovery.test.cjs

Exit: 1

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06935\source\.github\workflows\build-card-art-index.yml'

### v0275-ball-drop-layers.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: prepareTurn must remain explicit and bounded

### v0282-tile-puzzle-difficulty-reference.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Tile Puzzle loadedImage helper must exist

### v0283-unown-browser.test.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### v0340-dash-previews.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: normal preview is the exact playable seeded section

### v0340-dash-repeated-races.test.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### v0340-dash-viewport.test.cjs

Exit: 1

- See the complete captured stdout/stderr in the JSON report.

### v0340-preservation.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: exact supplied v0.33.1 preservation: app/src/main/assets/god-pack-v0291.css

### v0343-dash-gameplay.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: overtake exposes a transient position-change signal

### v0350-ekans-integration.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: existing venue goldenrod preserved

### v0351-release.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /id:"goldenrod"/. Input:

### v0360-dig-browser.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0360-dig-integration.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: existing venue goldenrod preserved

### v0370-magikarp-browser.test.cjs

Exit: 1

- Error: SPLASH touch target too small

### v0380-release.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /v0\.38\.[0-9]+\s+—\s+Rock Harden/i. Input:

### v0380-rock-harden-browser.test.cjs

Exit: 1

- Error: HARDEN touch target too small

### v0390-arcade-records-browser.test.cjs

Exit: 1

- Error: records hub missing games

### v0400-release.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0404-release.test.cjs

Exit: 1

- ✖ v0.40.4+ release metadata remains aligned (4.9298ms)
- ✖ failing tests:
- ✖ v0.40.4+ release metadata remains aligned (4.9298ms)
- AssertionError [ERR_ASSERTION]: release remains on the v0.40.x line

### v0405-release.test.cjs

Exit: 1

- ✖ v0.40.5+ release metadata remains aligned (5.3791ms)
- ✖ failing tests:
- ✖ v0.40.5+ release metadata remains aligned (5.3791ms)
- AssertionError [ERR_ASSERTION]: release remains on the v0.40.x line

### v0406-release.test.cjs

Exit: 1

- ✖ v0.40.6+ release metadata remains aligned and rare Tile Puzzle helpers ship (23.8885ms)
- ✖ failing tests:
- ✖ v0.40.6+ release metadata remains aligned and rare Tile Puzzle helpers ship (23.8885ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0407-release.test.cjs

Exit: 1

- ✖ v0.40.7 release identity and new rare-event assets are aligned (17.7502ms)
- ✖ failing tests:
- ✖ v0.40.7 release identity and new rare-event assets are aligned (17.7502ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0408-integration.test.cjs

Exit: 1

- ✖ saved state has vanilla rare odds and runtime forwards them to all three rare systems (5.6458ms)
- ✖ failing tests:
- ✖ saved state has vanilla rare odds and runtime forwards them to all three rare systems (5.6458ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /rareOdds:\{berry:\.03,unown:\.004,tileCard:\.004,tilePack:\.004,tilePresent:\.018(?:,voltorbGift:\.02)?(?:,goldRock:\.10,fossilCard:\.15,fossilPack:\.04)?\}/. Input:

### v0408-release.test.cjs

Exit: 1

- ✖ v0.40.8 release identity and rare-event testing controls are aligned (18.7091ms)
- ✖ failing tests:
- ✖ v0.40.8 release identity and rare-event testing controls are aligned (18.7091ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0409-release.test.cjs

Exit: 1

- ✖ v0.40.9 release identity and expanded rare-event controls are aligned (18.4606ms)
- ✖ failing tests:
- ✖ v0.40.9 release identity and expanded rare-event controls are aligned (18.4606ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0410-release.test.cjs

Exit: 1

- ✖ v0.42.1 release identity is aligned (4.7307ms)
- ✖ failing tests:
- ✖ v0.42.1 release identity is aligned (4.7307ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0411-release.test.cjs

Exit: 1

- ✖ v0.40.11+ release identity remains aligned (11.9445ms)
- ✖ failing tests:
- ✖ v0.40.11+ release identity remains aligned (11.9445ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0412-release.test.cjs

Exit: 1

- ✖ v0.40.12+ release identity and Voltorb mini-gift remain aligned (12.6357ms)
- ✖ failing tests:
- ✖ v0.40.12+ release identity and Voltorb mini-gift remain aligned (12.6357ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0413-release.test.cjs

Exit: 1

- ✖ v0.40.13 release identity is aligned across package Android runtime and visible UI (4.2803ms)
- ✖ failing tests:
- ✖ v0.40.13 release identity is aligned across package Android runtime and visible UI (4.2803ms)
- AssertionError [ERR_ASSERTION]: expected a v0.40.x release

### v0414-release.test.cjs

Exit: 1

- ✖ v0.40.14+ Dynamo packaging remains aligned (12.7995ms)
- ✖ failing tests:
- ✖ v0.40.14+ Dynamo packaging remains aligned (12.7995ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0415-release.test.cjs

Exit: 1

- ✖ v0.40.15 release identity and Kids Club scroll hotfix are aligned (10.7751ms)
- ✖ failing tests:
- ✖ v0.40.15 release identity and Kids Club scroll hotfix are aligned (10.7751ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0416-release.test.cjs

Exit: 1

- ✖ v0.40.16 release identity and Dynamo tuning are aligned (12.6622ms)
- ✖ failing tests:
- ✖ v0.40.16 release identity and Dynamo tuning are aligned (12.6622ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0417-release.test.cjs

Exit: 1

- ✖ v0.40.17+ release identity and Snore War packaging remain aligned (14.813ms)
- ✖ failing tests:
- ✖ v0.40.17+ release identity and Snore War packaging remain aligned (14.813ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0418-release.test.cjs

Exit: 1

- ✖ v0.40.18+ release identity and Snore War pendulum hotfix are aligned (14.5547ms)
- ✖ failing tests:
- ✖ v0.40.18+ release identity and Snore War pendulum hotfix are aligned (14.5547ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0419-release.test.cjs

Exit: 1

- ✖ v0.40.19 release identity and Snore War start-panel hotfix are aligned (10.9118ms)
- ✖ failing tests:
- ✖ v0.40.19 release identity and Snore War start-panel hotfix are aligned (10.9118ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0420-release.test.cjs

Exit: 1

- ✖ v0.42.1 release identity is consistent without changing Android package identity (4.8725ms)
- ✖ Target Range assets and fourth Goldenrod event ship in the release (4.4ms)
- ✖ failing tests:
- ✖ v0.42.1 release identity is consistent without changing Android package identity (4.8725ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- ✖ Target Range assets and fourth Goldenrod event ship in the release (4.4ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /games:\['dash','powerTrial','impactTrial','targetRange'\]/. Input:

### v0421-release.test.cjs

Exit: 1

- ✖ v0.40.21 release identity and Endless Snore War are aligned (19.8891ms)
- ✖ failing tests:
- ✖ v0.40.21 release identity and Endless Snore War are aligned (19.8891ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0421-target-range-polish.test.cjs

Exit: 1

- ✖ active Target Range is one-screen with redundant session strip hidden (3535.1885ms)
- ✖ live HUD has three readable compact columns (2435.863ms)
- ✖ shooter stays low and control pad clears the phone gesture area (2407.8056ms)
- ✖ venue uses safe offline type scenery and no borrowed course panorama (2457.1997ms)
- ✖ runtime flight moves each frame from the shooter, not a CSS destination jump (2459.1355ms)
- ✖ normal shooting leaves the centre free of permanent instruction cards (2395.3944ms)
- ✖ failing tests:
- ✖ active Target Range is one-screen with redundant session strip hidden (3535.1885ms)
- ✖ live HUD has three readable compact columns (2435.863ms)
- ✖ shooter stays low and control pad clears the phone gesture area (2407.8056ms)
- ✖ venue uses safe offline type scenery and no borrowed course panorama (2457.1997ms)
- ✖ runtime flight moves each frame from the shooter, not a CSS destination jump (2459.1355ms)
- ✖ normal shooting leaves the centre free of permanent instruction cards (2395.3944ms)

### v0421-target-range-release.test.cjs

Exit: 1

- ✖ Target Range release identity remains coherent after bounded updates (19.5038ms)
- ✖ failing tests:
- ✖ Target Range release identity remains coherent after bounded updates (19.5038ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0422-release.test.cjs

Exit: 1

- ✖ v0.40.22 release identity and Run Rattata Run are aligned (31.8206ms)
- ✖ failing tests:
- ✖ v0.40.22 release identity and Run Rattata Run are aligned (31.8206ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0422-target-range-landscape.test.cjs

Exit: none · spawnSync C:\Users\sjwal\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe ETIMEDOUT

- ✖ live range is portrait with a foreground shooter and horizontal downrange horizon (4071.7056ms)
- ✖ small reticle visibly tightens on a well-timed hold (4332.4955ms)
- ✖ runtime launches upward from the low central Pokemon (5212.1943ms)

### v0422-target-range-release.test.cjs

Exit: 1

- ✖ Target Range release identity remains coherent after bounded updates (18.3408ms)
- ✖ failing tests:
- ✖ Target Range release identity remains coherent after bounded updates (18.3408ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0423-release.test.cjs

Exit: 1

- ✖ v0.40.23 release identity and top-down Rattata renderer are aligned (20.5546ms)
- ✖ failing tests:
- ✖ v0.40.23 release identity and top-down Rattata renderer are aligned (20.5546ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0423-target-range-browser.test.cjs

Exit: 1

- ✖ live portrait range fills the phone without scroll; low shooter, precise reticle and safe controls (3575.4033ms)
- ✖ near/far visual sizes and depth agree with distance; gold retains readable target rings (2447.6851ms)
- ✖ live charge rises and falls, and a real pointer release shoots exactly once (2515.2994ms)
- ✖ actual projectile launches from Pokémon and its last pixel is the scored impact (2387.5909ms)
- ✖ closing/restarting cancels old flight and reopening never duplicates pointer shots (2364.2456ms)
- ✖ ordinary bottom-pad gestures can reach and bullseye both near and far phone targets (2259.3835ms)
- ✖ gallery also supports a precision hold; cancelling it never fires (2240.4696ms)
- ✖ failing tests:
- ✖ live portrait range fills the phone without scroll; low shooter, precise reticle and safe controls (3575.4033ms)
- ✖ near/far visual sizes and depth agree with distance; gold retains readable target rings (2447.6851ms)
- ✖ live charge rises and falls, and a real pointer release shoots exactly once (2515.2994ms)
- ✖ actual projectile launches from Pokémon and its last pixel is the scored impact (2387.5909ms)
- ✖ closing/restarting cancels old flight and reopening never duplicates pointer shots (2364.2456ms)
- ✖ ordinary bottom-pad gestures can reach and bullseye both near and far phone targets (2259.3835ms)
- ✖ gallery also supports a precision hold; cancelling it never fires (2240.4696ms)

### v0423-target-range-release.test.cjs

Exit: 1

- ✖ Target Range release identity remains coherent after bounded updates (17.3513ms)
- ✖ failing tests:
- ✖ Target Range release identity remains coherent after bounded updates (17.3513ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0424-release.test.cjs

Exit: 1

- ✖ v0.40.24 release identity and Sushi-Go-Round assets are aligned (9.9424ms)
- ✖ failing tests:
- ✖ v0.40.24 release identity and Sushi-Go-Round assets are aligned (9.9424ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0424-target-range-release.test.cjs

Exit: 1

- ✖ v0.42.4 source release identity is coherent and Android identity stays LuckyDex (6.5618ms)
- ✖ failing tests:
- ✖ v0.42.4 source release identity is coherent and Android identity stays LuckyDex (6.5618ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0425-goldenrod-picker-release.test.cjs

Exit: 1

- ✖ v0.42.5 shared Goldenrod picker release identity is coherent (6.5082ms)
- ✖ failing tests:
- ✖ v0.42.5 shared Goldenrod picker release identity is coherent (6.5082ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0425-release.test.cjs

Exit: 1

- ✖ v0.40.25 release identity and Sushi-Go-Round redesign are aligned (10.0169ms)
- ✖ failing tests:
- ✖ v0.40.25 release identity and Sushi-Go-Round redesign are aligned (10.0169ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0427-release.test.cjs

Exit: 1

- ✖ v0.40.27+ release identity retains Clear Cut Challenge assets (11.154ms)
- ✖ failing tests:
- ✖ v0.40.27+ release identity retains Clear Cut Challenge assets (11.154ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0428-clear-cut-expansion.test.cjs

Exit: 1

- ✖ Clear Cut shell has visible split pieces, no COM players, and a mystery bag object state (8.9712ms)
- ✖ failing tests:
- ✖ Clear Cut shell has visible split pieces, no COM players, and a mystery bag object state (8.9712ms)
- AssertionError [ERR_ASSERTION]: The input was expected to not match the regular expression />PLACE&lt;/. Input:

### v0428-release.test.cjs

Exit: 1

- ✖ v0.40.28+ release identity retains Stadium 2 venue and Pocket Rare Pack assets (11.1215ms)
- ✖ failing tests:
- ✖ v0.40.28+ release identity retains Stadium 2 venue and Pocket Rare Pack assets (11.1215ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0429-release.test.cjs

Exit: 1

- ✖ v0.40.29+ preserves the user-tweak assets introduced in v0.40.29 (8.7815ms)
- ✖ failing tests:
- ✖ v0.40.29+ preserves the user-tweak assets introduced in v0.40.29 (8.7815ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0430-goldenrod-stat-release.test.cjs

Exit: 1

- ✖ v0.43.0 Goldenrod stat-expression release identity and shared curve are aligned (8.4279ms)
- ✖ failing tests:
- ✖ v0.43.0 Goldenrod stat-expression release identity and shared curve are aligned (8.4279ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0430-release.test.cjs

Exit: 1

- ✖ v0.40.30+ release retains the venue/pack feature bundle (13.1796ms)
- ✖ failing tests:
- ✖ v0.40.30+ release retains the venue/pack feature bundle (13.1796ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /versionCode\s+40(?:3\d|[4-9]\d)/. Input:

### v0431-impact-defense-release.test.cjs

Exit: 1

- ✖ current release identity remains aligned after the v0.43.1 Impact fix (20.5448ms)
- ✖ failing tests:
- ✖ current release identity remains aligned after the v0.43.1 Impact fix (20.5448ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0431-power-trial.test.cjs

Exit: 1

- ✖ current release identity is aligned (22.5604ms)
- ✖ failing tests:
- ✖ current release identity is aligned (22.5604ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0433-power-trial-ui.test.cjs

Exit: 1

- ✖ current release identity is aligned (23.6469ms)
- ✖ failing tests:
- ✖ current release identity is aligned (23.6469ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0434-power-trial-polish.test.cjs

Exit: 1

- ✖ current release identity is aligned (16.7066ms)
- ✖ failing tests:
- ✖ current release identity is aligned (16.7066ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0435-power-trial-dome.test.cjs

Exit: 1

- ✖ current release identity is aligned (17.8906ms)
- ✖ failing tests:
- ✖ current release identity is aligned (17.8906ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0436-impact-trial.test.cjs

Exit: 1

- ✖ current release identity is aligned (18.5384ms)
- ✖ failing tests:
- ✖ current release identity is aligned (18.5384ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0437-impact-harden.test.cjs

Exit: 1

- ✖ current release identity is aligned (18.4305ms)
- ✖ failing tests:
- ✖ current release identity is aligned (18.4305ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0438-impact-harden-tuning.test.cjs

Exit: 1

- ✖ current release identity is aligned (13.8289ms)
- ✖ failing tests:
- ✖ current release identity is aligned (13.8289ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0439-impact-input-polish.test.cjs

Exit: 1

- ✖ current release identity is aligned (16.9579ms)
- ✖ failing tests:
- ✖ current release identity is aligned (16.9579ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0440-preservation.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Unrelated v0.43.1 production change: app/src/main/java/com/example/luckydex/MainActivity.java

### v0440-release.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0450-release.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0451-release.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0452-release.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0453-release.test.cjs

Exit: 1

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0454-release.test.cjs

Exit: 1

- ✖ v0.45.4 Elemental Gauntlet pattern rewrite release identity is coherent (5.7144ms)
- ✖ failing tests:
- ✖ v0.45.4 Elemental Gauntlet pattern rewrite release identity is coherent (5.7144ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0455-release.test.cjs

Exit: 1

- ✖ v0.45.5 Elemental Gauntlet consequence pass release identity is coherent (6.4472ms)
- ✖ failing tests:
- ✖ v0.45.5 Elemental Gauntlet consequence pass release identity is coherent (6.4472ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0460-release.test.cjs

Exit: 1

- ✖ v0.46.0 Endurance Expedition release identity is coherent (5.8442ms)
- ✖ failing tests:
- ✖ v0.46.0 Endurance Expedition release identity is coherent (5.8442ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0461-release.test.cjs

Exit: 1

- ✖ v0.46.1 Endurance Gen 3 UI release identity is coherent (5.5355ms)
- ✖ failing tests:
- ✖ v0.46.1 Endurance Gen 3 UI release identity is coherent (5.5355ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0462-release.test.cjs

Exit: 1

- ✖ v0.46.2 Endurance steering-only visual pass release identity is coherent (5.8618ms)
- ✖ failing tests:
- ✖ v0.46.2 Endurance steering-only visual pass release identity is coherent (5.8618ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0470-release.test.cjs

Exit: 1

- ✖ v0.47.0 Roulette release identity is coherent (8.7898ms)
- ✖ failing tests:
- ✖ v0.47.0 Roulette release identity is coherent (8.7898ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0471-release.test.cjs

Exit: 1

- ✖ v0.47.1 Roulette presentation release identity is coherent (8.0386ms)
- ✖ failing tests:
- ✖ v0.47.1 Roulette presentation release identity is coherent (8.0386ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0472-release.test.cjs

Exit: 1

- ✖ v0.47.2 release identity is consistent (9.4002ms)
- ✖ failing tests:
- ✖ v0.47.2 release identity is consistent (9.4002ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0473-release.test.cjs

Exit: 1

- ✖ v0.47.3 release identity is consistent (9.8548ms)
- ✖ failing tests:
- ✖ v0.47.3 release identity is consistent (9.8548ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0474-release.test.cjs

Exit: 1

- ✖ v0.47.4 release identity is consistent (10.052ms)
- ✖ failing tests:
- ✖ v0.47.4 release identity is consistent (10.052ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0480-arcade-catalog.test.cjs

Exit: 1

- ✖ Game Corner sublocations route through the shared openGame path (4.814ms)
- ✖ failing tests:
- ✖ Game Corner sublocations route through the shared openGame path (4.814ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /function openGame\(id\)/. Input:

### v0480-release.test.cjs

Exit: 1

- ✖ v0.48.0 release identity is consistent (9.7915ms)
- ✖ failing tests:
- ✖ v0.48.0 release identity is consistent (9.7915ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0481-release.test.cjs

Exit: 1

- ✖ v0.48.1 release identity is consistent (10.983ms)
- ✖ failing tests:
- ✖ v0.48.1 release identity is consistent (10.983ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0490-release.test.cjs

Exit: 1

- ✖ v0.49.0 release identity is consistent (8.8325ms)
- ✖ failing tests:
- ✖ v0.49.0 release identity is consistent (8.8325ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0500-release.test.cjs

Exit: 1

- ✖ v0.50.0 release identity is consistent (9.7072ms)
- ✖ failing tests:
- ✖ v0.50.0 release identity is consistent (9.7072ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0502-release.test.cjs

Exit: 1

- ✖ v0.50.2 release identity is consistent (8.9409ms)
- ✖ failing tests:
- ✖ v0.50.2 release identity is consistent (8.9409ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0503-release.test.cjs

Exit: 1

- ✖ v0.50.3 release identity is consistent (9.3143ms)
- ✖ failing tests:
- ✖ v0.50.3 release identity is consistent (9.3143ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0504-release.test.cjs

Exit: 1

- ✖ v0.50.4 release identity is consistent (9.1262ms)
- ✖ failing tests:
- ✖ v0.50.4 release identity is consistent (9.1262ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0505-release.test.cjs

Exit: 1

- ✖ v0.50.5 release identity is consistent (9.6103ms)
- ✖ failing tests:
- ✖ v0.50.5 release identity is consistent (9.6103ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0540-release.test.cjs

Exit: 1

- ✖ v0.54.0 release identity is consistent (9.0389ms)
- ✖ failing tests:
- ✖ v0.54.0 release identity is consistent (9.0389ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0541-release.test.cjs

Exit: 1

- ✖ v0.54.1 release identity is consistent (8.9486ms)
- ✖ failing tests:
- ✖ v0.54.1 release identity is consistent (8.9486ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0542-release.test.cjs

Exit: 1

- ✖ v0.54.2 release identity is consistent (10.3896ms)
- ✖ failing tests:
- ✖ v0.54.2 release identity is consistent (10.3896ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0543-release.test.cjs

Exit: 1

- ✖ v0.54.3 release identity is consistent (8.2952ms)
- ✖ failing tests:
- ✖ v0.54.3 release identity is consistent (8.2952ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0550-release.test.cjs

Exit: 1

- ✖ v0.55.0 release identity is consistent (10.1445ms)
- ✖ v0.55.0 packages Gutsy Golbat as the only new Stadium 2 game (3.8008ms)
- ✖ failing tests:
- ✖ v0.55.0 release identity is consistent (10.1445ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- ✖ v0.55.0 packages Gutsy Golbat as the only new Stadium 2 game (3.8008ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /games:\['clearCutChallenge','gutsyGolbat'\]/. Input:

### v0551-release.test.cjs

Exit: 1

- ✖ v0.55.1 release identity is consistent (9.5479ms)
- ✖ failing tests:
- ✖ v0.55.1 release identity is consistent (9.5479ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0552-release.test.cjs

Exit: 1

- ✖ v0.55.2 release identity is consistent (9.9948ms)
- ✖ failing tests:
- ✖ v0.55.2 release identity is consistent (9.9948ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0553-release.test.cjs

Exit: 1

- ✖ v0.55.3 release identity is consistent (9.4627ms)
- ✖ failing tests:
- ✖ v0.55.3 release identity is consistent (9.4627ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0554-release.test.cjs

Exit: 1

- ✖ v0.55.4 release identity is consistent (9.134ms)
- ✖ failing tests:
- ✖ v0.55.4 release identity is consistent (9.134ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0555-release.test.cjs

Exit: 1

- ✖ v0.55.5 release identity is consistent (8.8119ms)
- ✖ failing tests:
- ✖ v0.55.5 release identity is consistent (8.8119ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0556-release.test.cjs

Exit: 1

- ✖ v0.55.6 release identity is consistent (9.934ms)
- ✖ failing tests:
- ✖ v0.55.6 release identity is consistent (9.934ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0557-release.test.cjs

Exit: 1

- ✖ v0.55.7 release identity is consistent (9.8247ms)
- ✖ failing tests:
- ✖ v0.55.7 release identity is consistent (9.8247ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0558-release.test.cjs

Exit: 1

- ✖ v0.55.8 release identity is consistent (9.1056ms)
- ✖ failing tests:
- ✖ v0.55.8 release identity is consistent (9.1056ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0560-release.test.cjs

Exit: 1

- ✖ v0.56.0 release identity is consistent (9.8832ms)
- ✖ v0.56.0 adds Furret Frolic as the only new Stadium 2 game (2.8228ms)
- ✖ failing tests:
- ✖ v0.56.0 release identity is consistent (9.8832ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- ✖ v0.56.0 adds Furret Frolic as the only new Stadium 2 game (2.8228ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /games:\['clearCutChallenge','gutsyGolbat','furretFrolic'\]/. Input:

### v0561-release.test.cjs

Exit: 1

- ✖ v0.56.1 release identity is consistent (8.8721ms)
- ✖ failing tests:
- ✖ v0.56.1 release identity is consistent (8.8721ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0571-release.test.cjs

Exit: 1

- ✖ v0.57.1 release identity is consistent (8.2818ms)
- ✖ failing tests:
- ✖ v0.57.1 release identity is consistent (8.2818ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0580-release.test.cjs

Exit: 1

- ✖ v0.58.0 release metadata is aligned (8.7084ms)
- ✖ failing tests:
- ✖ v0.58.0 release metadata is aligned (8.7084ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0601-release.test.cjs

Exit: 1

- ✖ v0.60.1 release metadata is aligned (8.2193ms)
- ✖ failing tests:
- ✖ v0.60.1 release metadata is aligned (8.2193ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0612-release.test.cjs

Exit: 1

- ✖ v0.61.2 release metadata is aligned (7.0652ms)
- ✖ failing tests:
- ✖ v0.61.2 release metadata is aligned (7.0652ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0620-release.test.cjs

Exit: 1

- ✖ v0.64.0 release metadata is aligned (7.0365ms)
- ✖ failing tests:
- ✖ v0.64.0 release metadata is aligned (7.0365ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0620-streaming-stampede-integration.test.cjs

Exit: 1

- ✖ Streaming Stampede is registered across the Stadium 2 world, shared help, and page assets (10.1225ms)
- ✖ failing tests:
- ✖ Streaming Stampede is registered across the Stadium 2 world, shared help, and page assets (10.1225ms)
- AssertionError [ERR_ASSERTION]: clearCutChallenge must have Kids Club tile metadata or Stadium 2 venue rendering will throw

### v0621-stadium2-entry-regression.test.cjs

Exit: 1

- ✖ every Stadium 2 Kids Club game has tile metadata so the venue can render safely (3.0442ms)
- ✖ failing tests:
- ✖ every Stadium 2 Kids Club game has tile metadata so the venue can render safely (3.0442ms)
- AssertionError [ERR_ASSERTION]: clearCutChallenge is missing Kids Club tile metadata

### v0670-fishing-browser.test.cjs

Exit: 1

- ✖ Adventure fishing first-open help, Back and quick-cast controls stay usable on a 360x640 phone viewport (6551.37ms)
- ✖ failing tests:
- ✖ Adventure fishing first-open help, Back and quick-cast controls stay usable on a 360x640 phone viewport (6551.37ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0670-release.test.cjs

Exit: 1

- ✖ release identity remains internally consistent across package, Gradle and visible build metadata (7.9901ms)
- ✖ failing tests:
- ✖ release identity remains internally consistent across package, Gradle and visible build metadata (7.9901ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /versionCode 7250\b/. Input:

### v0670-repo-hygiene.test.cjs

Exit: 1

- ✖ canonical repository excludes audited generated and historical clutter (15.5546ms)
- ✖ failing tests:
- ✖ canonical repository excludes audited generated and historical clutter (15.5546ms)
- AssertionError [ERR_ASSERTION]: generated artifacts directory must stay empty

### v0680-release.test.cjs

Exit: 1

- ✖ current release identity is consistent everywhere (11.9068ms)
- ✖ failing tests:
- ✖ current release identity is consistent everywhere (11.9068ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0690-release.test.cjs

Exit: 1

- ✖ v0.69.4 release identity is consistent everywhere (6.3824ms)
- ✖ failing tests:
- ✖ v0.69.4 release identity is consistent everywhere (6.3824ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06911-achievement-rarity-audit.test.cjs

Exit: 1

- ✖ v0.69.11 release identity is consistent everywhere (7.5345ms)
- ✖ failing tests:
- ✖ v0.69.11 release identity is consistent everywhere (7.5345ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06911-release.test.cjs

Exit: 1

- ✖ v0.69.11 release identity is consistent everywhere (9.9468ms)
- ✖ failing tests:
- ✖ v0.69.11 release identity is consistent everywhere (9.9468ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06912-release.test.cjs

Exit: 1

- ✖ v0.69.12 release identity is consistent everywhere (10.1485ms)
- ✖ failing tests:
- ✖ v0.69.12 release identity is consistent everywhere (10.1485ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06913-release.test.cjs

Exit: 1

- ✖ v0.69.13 fishing economy release identity is consistent everywhere (9.7666ms)
- ✖ failing tests:
- ✖ v0.69.13 fishing economy release identity is consistent everywhere (9.7666ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06914-release.test.cjs

Exit: 1

- ✖ v0.69.14 whole-app audit release identity is consistent everywhere (10.9639ms)
- ✖ failing tests:
- ✖ v0.69.14 whole-app audit release identity is consistent everywhere (10.9639ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06915-release.test.cjs

Exit: 1

- ✖ v0.69.15 release identity is aligned (8.7929ms)
- ✖ failing tests:
- ✖ v0.69.15 release identity is aligned (8.7929ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06932-app-cleanup.test.cjs

Exit: 1

- ✖ v0.69.32 release metadata is aligned (8.3862ms)
- ✖ failing tests:
- ✖ v0.69.32 release metadata is aligned (8.3862ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06933-release.test.cjs

Exit: 1

- ✖ v0.69.33 patch release identity is aligned while retaining Android application and signer (6.3765ms)
- ✖ failing tests:
- ✖ v0.69.33 patch release identity is aligned while retaining Android application and signer (6.3765ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0695-release.test.cjs

Exit: 1

- ✖ v0.69.5 release identity is consistent everywhere (7.5424ms)
- ✖ failing tests:
- ✖ v0.69.5 release identity is consistent everywhere (7.5424ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0696-release.test.cjs

Exit: 1

- ✖ v0.69.6 release identity is consistent everywhere (5.7623ms)
- ✖ failing tests:
- ✖ v0.69.6 release identity is consistent everywhere (5.7623ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0697-fishing-polish.test.cjs

Exit: 1

- ✖ reachable-caught counter treats availableSpecies results as species IDs (3.4826ms)
- ✖ failing tests:
- ✖ reachable-caught counter treats availableSpecies results as species IDs (3.4826ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /availableSpecies\(a,s\.selectedRod\)\.map\(id=>Number\(id\)\)/. Input:

### v0697-release.test.cjs

Exit: 1

- ✖ v0.69.7 release identity is consistent everywhere (5.6865ms)
- ✖ failing tests:
- ✖ v0.69.7 release identity is consistent everywhere (5.6865ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0698-release.test.cjs

Exit: 1

- ✖ v0.69.8 release identity is consistent everywhere (9.0838ms)
- ✖ failing tests:
- ✖ v0.69.8 release identity is consistent everywhere (9.0838ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0699-release.test.cjs

Exit: 1

- ✖ v0.69.9 release identity is consistent everywhere (9.3001ms)
- ✖ failing tests:
- ✖ v0.69.9 release identity is consistent everywhere (9.3001ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

## Additional checks

Catalogue validation: no schema, provenance, unresolved print or unknown effect errors. Native offline debug build and v2 signature pass. Mobile screenshots:15captures /5viewports /0captured runtime errors. Physical Android test not performed.

Standalone asset checks: fetch_arcade_v0200_assets.py --check PASS; verify_v0223_venues.py PASS; verify_fossil_museum_v0250_assets.py PASS; verify_adventure_assets.py FAIL (CSV/source checksum expectations); verify-sleeves-v0440.py FAIL (physical QA provenance/enumeration missing/inconsistent). Raw logs accompany delivery.
