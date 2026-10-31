# v0.69.36 verification results

Focused Pocket regression suite: **44/44 programs pass**, 0 fail. This is the fresh post-review run, including the original regressions and seven new v036 programs.

Complete continuing sweep: **740/740 programs attempted**, 569 pass and 171 fail. The two late review programs are included in the focused run. The sweep ran during implementation; changed Pocket boundaries were rerun afterwards.

Combined latest evidence: **742 unique programs attempted, 574 latest recorded passes, 168 unresolved failures**. This uses fresh focused and final-boundary reruns for overlaps; it does not erase the original sweep results.

The entire historical project suite is **not green**. Every currently failing program appears below. The unchanged standard runner was also run and stopped at an Adventure lifecycle reload timeout; a later isolated run of that test passed. A v0250 Fossil browser pointer-interception failure persisted in the current tree even though a comparison run of untouched v035 passed; this unresolved difference is disclosed, not called an inherited success. No unrelated game code was changed to force old tests green.

## Runtime / build checks

- Deterministic catalogue validation: no schema errors, unmapped released prints or unknown effect references.
- Every FULL card execution fixture: 1704 attacks,26 Trainers,5 activated Ability definitions,25 passive/triggered definitions; zero crashes and deterministic repeated results.
- 1000 varied seeded battles: zero stalls/crashes, maximum50 turns;884 points conclusions,116 turn-limit conclusions.
- Portrait visual QA:360×720,393×873,430×932; editor, filter sheet, deck manager and inspection. Real card art used in the QA cache; normal missing-art handling remains functional.
- Offline browser smoke: filters, card edits and saved draft management remain functional with networking disabled. No physical Android/emulator test was performed.
- Native debug APK: see the successful build/signature/package audit alongside delivery. Permanent signer, application ID and protected game code are audited separately.

## Independent asset checks

- PASS `fetch_arcade_v0200_assets.py --check`
- PASS `verify_v0223_venues.py`
- PASS `verify_fossil_museum_v0250_assets.py`
- FAIL `verify_adventure_assets.py`: source CSV checksum expectations.
- FAIL `verify-sleeves-v0440.py`: physical storefront enumeration/provenance expectations.

## Every unresolved program

### adventure-location-menu-v0402.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### adventure-location-scenes.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ native source evidence is pinned, intact, and each complete component stays inside its scene (160.6983ms)
- ✖ failing tests:
- ✖ native source evidence is pinned, intact, and each complete component stays inside its scene (160.6983ms)
- AssertionError [ERR_ASSERTION]: data/layouts/layouts.json

### adventure-move-data.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ pinned cached inputs match recorded SHA-256 provenance (74.8517ms)
- ✖ failing tests:
- ✖ pinned cached inputs match recorded SHA-256 provenance (74.8517ms)
- AssertionError [ERR_ASSERTION]: move_meta.csv

### adventure-persistence.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### adventure-regional-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### adventure-runtime.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /Catch Chain.*7/. Input:

### adventure-scene-nav-chapter-v0403.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0403 real first Johto Gym earns badge and persists onward Route32 with natural city/Gym exit (17284.1832ms)
- ✖ failing tests:
- ✖ v0403 real first Johto Gym earns badge and persists onward Route32 with natural city/Gym exit (17284.1832ms)
- AssertionError [ERR_ASSERTION]: New Bark Town one Map tool

### adventure-tools-browser-v040.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /1,240 → 1,060/. Input:

### adventure3-preservation.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: unchanged supplied v0.39.1 file: app/src/main/assets/arcade-dig-dig-dig-core.js

### adventure-scene-nav-browser-v0403.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0403 scene and all controls fit without document or pane scrolling at five sizes (8570.2599ms)
- ✖ v0403 normal town and route show a bounded avatar, gym preparation and battle omit it (15028.244ms)
- ✖ failing tests:
- ✖ v0403 scene and all controls fit without document or pane scrolling at five sizes (8570.2599ms)
- AssertionError [ERR_ASSERTION]: New Bark Town one Map tool
- ✖ v0403 normal town and route show a bounded avatar, gym preparation and battle omit it (15028.244ms)
- AssertionError [ERR_ASSERTION]: New Bark Town renders player avatar

### adventure3-shared-functions.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: supplied v0.39.1 shared function unchanged: loadState

### adventure3-ux-v0401-journey.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: route offers contextual field actions

### adventure3-ux-v0401-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: expected v0.40.x

### adventure3-ux-v0401-battle.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ Wild Hunt command, Fight, Bag and switch menus fit phones and preview never spends a turn (11786.3721ms)
- ✖ failing tests:
- ✖ Wild Hunt command, Fight, Bag and switch menus fit phones and preview never spends a turn (11786.3721ms)
- AssertionError [ERR_ASSERTION]: bag drawer needs no scrolling {"scroll":287,"client":252}

### adventure-location-browser-v0402.test.cjs

Exit: none · 240s verification timeout; prior v035 broad-run exit: 1.

- ✖ v0402 starting town has at most six valid local actions, truthful services, and a separate unique tool strip (13971.7704ms)
- ✖ v0402 first-Gym chapter completes through ordinary UI travel and real PP-bearing battle moves (11955.5059ms)
- ✖ v0402 dismissed home recovery stays dismissed through rerender and reload (21627.5792ms)

### amie-recovery.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### adventure3-ux-v0401-tools.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ Compact Mart, purchase confirmation and field Bag fit and debit only once (3083.0048ms)
- ✖ failing tests:
- ✖ Compact Mart, purchase confirmation and field Bag fit and debit only once (3083.0048ms)
- AssertionError [ERR_ASSERTION]: Mart: {"outer":0,"horizontal":0,"inner":215,"top":64,"bottom":628,"height":640}

### arcade-dash-gen3-assets.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ pinned upstream cache has intact source bytes for palettes, tiles, metatiles and map evidence (6.3861ms)
- ✖ failing tests:
- ✖ pinned upstream cache has intact source bytes for palettes, tiles, metatiles and map evidence (6.3861ms)
- AssertionError [ERR_ASSERTION]: data/layouts/layouts.json

### recovery-layout.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: voltorb scene ratio must be preserved: {"x":8,"y":186,"width":344,"height":14}

### recovery-lifecycle.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### recovery-navigation.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### recovery-runtime.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: berryPicker useful initial control {"fully":true,"hit":false,"enabled":true,"rect":{"x":8,"y":754,"w":344,"h":46},"overflow":0}

### recovery-trade-refresh.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### recovery-transactions.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### v022-update-compat.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06936\source\.github\workflows\build-apk.yml'

### v0223-fossil.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0223-berry-touch.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### v024-compat.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06936\source\.github\workflows\build-apk.yml'

### v0223-layout-grid.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: visible/tappable [data-venue-game="thunderingDynamo"]

### v0243-release-signing.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06936\source\.github\workflows\build-apk.yml'

### v0244-release-dates.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06936\source\.github\workflows\build-card-art-index.yml'

### v0250-fossil-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 0.

- Full process diagnostics are retained in the detached verification JSON.

### v0250-fossil-routing-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### v0255-lifecycle-chain-assets.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: new roam sessions must resume the destination field chain

### v0258-pack-wrapper.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: ordinary boosters retain the pointy wrapper while fixed products use their own shell

### v0259-global-excavation-booster-art.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06936\source\.github\workflows\build-apk.yml'

### v0261-github-index-workflows.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06936\source\.github\workflows\build-card-art-index.yml'

### v0264-booster-art-audit-and-slim-pack.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0267-physical-card-art-recovery.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: ENOENT: no such file or directory, open 'C:\Users\sjwal\Documents\ChatGPT\Cards\LuckyDex-v06936\source\.github\workflows\build-card-art-index.yml'

### v0275-ball-drop-layers.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: prepareTurn must remain explicit and bounded

### v0282-tile-puzzle-difficulty-reference.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Tile Puzzle loadedImage helper must exist

### v0283-unown-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### v0340-dash-previews.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: normal preview is the exact playable seeded section

### v0340-preservation.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: exact supplied v0.33.1 preservation: app/src/main/assets/god-pack-v0291.css

### v0340-dash-repeated-races.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### v0343-dash-gameplay.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: overtake exposes a transient position-change signal

### v0340-dash-viewport.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Full process diagnostics are retained in the detached verification JSON.

### v0350-ekans-integration.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: existing venue goldenrod preserved

### v0351-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /id:"goldenrod"/. Input:

### v0360-dig-integration.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: existing venue goldenrod preserved

### v0360-dig-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0370-magikarp-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: SPLASH touch target too small

### v0380-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /v0\.38\.[0-9]+\s+—\s+Rock Harden/i. Input:

### v0380-rock-harden-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: HARDEN touch target too small

### v0390-arcade-records-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- Error: records hub missing games

### v0400-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0404-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.4+ release metadata remains aligned (11.0947ms)
- ✖ failing tests:
- ✖ v0.40.4+ release metadata remains aligned (11.0947ms)
- AssertionError [ERR_ASSERTION]: release remains on the v0.40.x line

### v0405-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.5+ release metadata remains aligned (10.7774ms)
- ✖ failing tests:
- ✖ v0.40.5+ release metadata remains aligned (10.7774ms)
- AssertionError [ERR_ASSERTION]: release remains on the v0.40.x line

### v0406-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.6+ release metadata remains aligned and rare Tile Puzzle helpers ship (33.2072ms)
- ✖ failing tests:
- ✖ v0.40.6+ release metadata remains aligned and rare Tile Puzzle helpers ship (33.2072ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0407-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.7 release identity and new rare-event assets are aligned (47.2862ms)
- ✖ failing tests:
- ✖ v0.40.7 release identity and new rare-event assets are aligned (47.2862ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0408-integration.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ saved state has vanilla rare odds and runtime forwards them to all three rare systems (8.3842ms)
- ✖ failing tests:
- ✖ saved state has vanilla rare odds and runtime forwards them to all three rare systems (8.3842ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /rareOdds:\{berry:\.03,unown:\.004,tileCard:\.004,tilePack:\.004,tilePresent:\.018(?:,voltorbGift:\.02)?(?:,goldRock:\.10,fossilCard:\.15,fossilPack:\.04)?\}/. Input:

### v0408-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.8 release identity and rare-event testing controls are aligned (36.6086ms)
- ✖ failing tests:
- ✖ v0.40.8 release identity and rare-event testing controls are aligned (36.6086ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0409-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.9 release identity and expanded rare-event controls are aligned (31.7828ms)
- ✖ failing tests:
- ✖ v0.40.9 release identity and expanded rare-event controls are aligned (31.7828ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0410-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.42.1 release identity is aligned (25.3864ms)
- ✖ failing tests:
- ✖ v0.42.1 release identity is aligned (25.3864ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0411-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.11+ release identity remains aligned (26.5069ms)
- ✖ failing tests:
- ✖ v0.40.11+ release identity remains aligned (26.5069ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0412-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.12+ release identity and Voltorb mini-gift remain aligned (30.8879ms)
- ✖ failing tests:
- ✖ v0.40.12+ release identity and Voltorb mini-gift remain aligned (30.8879ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0413-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.13 release identity is aligned across package Android runtime and visible UI (14.1376ms)
- ✖ failing tests:
- ✖ v0.40.13 release identity is aligned across package Android runtime and visible UI (14.1376ms)
- AssertionError [ERR_ASSERTION]: expected a v0.40.x release

### v0414-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.14+ Dynamo packaging remains aligned (34.5766ms)
- ✖ failing tests:
- ✖ v0.40.14+ Dynamo packaging remains aligned (34.5766ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0415-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.15 release identity and Kids Club scroll hotfix are aligned (30.986ms)
- ✖ failing tests:
- ✖ v0.40.15 release identity and Kids Club scroll hotfix are aligned (30.986ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0416-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.16 release identity and Dynamo tuning are aligned (28.5691ms)
- ✖ failing tests:
- ✖ v0.40.16 release identity and Dynamo tuning are aligned (28.5691ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0417-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.17+ release identity and Snore War packaging remain aligned (26.2801ms)
- ✖ failing tests:
- ✖ v0.40.17+ release identity and Snore War packaging remain aligned (26.2801ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0418-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.18+ release identity and Snore War pendulum hotfix are aligned (32.7051ms)
- ✖ failing tests:
- ✖ v0.40.18+ release identity and Snore War pendulum hotfix are aligned (32.7051ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0419-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.19 release identity and Snore War start-panel hotfix are aligned (26.756ms)
- ✖ failing tests:
- ✖ v0.40.19 release identity and Snore War start-panel hotfix are aligned (26.756ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0420-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.42.1 release identity is consistent without changing Android package identity (10.032ms)
- ✖ Target Range assets and fourth Goldenrod event ship in the release (5.4466ms)
- ✖ failing tests:
- ✖ v0.42.1 release identity is consistent without changing Android package identity (10.032ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- ✖ Target Range assets and fourth Goldenrod event ship in the release (5.4466ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /games:\['dash','powerTrial','impactTrial','targetRange'\]/. Input:

### v0421-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.21 release identity and Endless Snore War are aligned (30.2018ms)
- ✖ failing tests:
- ✖ v0.40.21 release identity and Endless Snore War are aligned (30.2018ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0421-target-range-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ Target Range release identity remains coherent after bounded updates (24.7719ms)
- ✖ failing tests:
- ✖ Target Range release identity remains coherent after bounded updates (24.7719ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0422-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.22 release identity and Run Rattata Run are aligned (21.7135ms)
- ✖ failing tests:
- ✖ v0.40.22 release identity and Run Rattata Run are aligned (21.7135ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0422-target-range-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ Target Range release identity remains coherent after bounded updates (33.1505ms)
- ✖ failing tests:
- ✖ Target Range release identity remains coherent after bounded updates (33.1505ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0423-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.23 release identity and top-down Rattata renderer are aligned (58.3162ms)
- ✖ failing tests:
- ✖ v0.40.23 release identity and top-down Rattata renderer are aligned (58.3162ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0421-target-range-polish.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ active Target Range is one-screen with redundant session strip hidden (4497.532ms)
- ✖ live HUD has three readable compact columns (4220.3314ms)
- ✖ shooter stays low and control pad clears the phone gesture area (2657.611ms)
- ✖ venue uses safe offline type scenery and no borrowed course panorama (2550.1006ms)
- ✖ runtime flight moves each frame from the shooter, not a CSS destination jump (2636.1886ms)
- ✖ normal shooting leaves the centre free of permanent instruction cards (3187.565ms)
- ✖ failing tests:
- ✖ active Target Range is one-screen with redundant session strip hidden (4497.532ms)
- ✖ live HUD has three readable compact columns (4220.3314ms)
- ✖ shooter stays low and control pad clears the phone gesture area (2657.611ms)
- ✖ venue uses safe offline type scenery and no borrowed course panorama (2550.1006ms)
- ✖ runtime flight moves each frame from the shooter, not a CSS destination jump (2636.1886ms)
- ✖ normal shooting leaves the centre free of permanent instruction cards (3187.565ms)

### v0423-target-range-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ Target Range release identity remains coherent after bounded updates (27.547ms)
- ✖ failing tests:
- ✖ Target Range release identity remains coherent after bounded updates (27.547ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0424-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.24 release identity and Sushi-Go-Round assets are aligned (18.188ms)
- ✖ failing tests:
- ✖ v0.40.24 release identity and Sushi-Go-Round assets are aligned (18.188ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0423-target-range-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ live portrait range fills the phone without scroll; low shooter, precise reticle and safe controls (6872.5345ms)
- ✖ near/far visual sizes and depth agree with distance; gold retains readable target rings (2688.16ms)
- ✖ live charge rises and falls, and a real pointer release shoots exactly once (2191.1591ms)
- ✖ actual projectile launches from Pokémon and its last pixel is the scored impact (2396.8683ms)
- ✖ closing/restarting cancels old flight and reopening never duplicates pointer shots (2327.5199ms)
- ✖ ordinary bottom-pad gestures can reach and bullseye both near and far phone targets (2309.9316ms)
- ✖ gallery also supports a precision hold; cancelling it never fires (2531.947ms)
- ✖ failing tests:
- ✖ live portrait range fills the phone without scroll; low shooter, precise reticle and safe controls (6872.5345ms)
- ✖ near/far visual sizes and depth agree with distance; gold retains readable target rings (2688.16ms)
- ✖ live charge rises and falls, and a real pointer release shoots exactly once (2191.1591ms)
- ✖ actual projectile launches from Pokémon and its last pixel is the scored impact (2396.8683ms)
- ✖ closing/restarting cancels old flight and reopening never duplicates pointer shots (2327.5199ms)
- ✖ ordinary bottom-pad gestures can reach and bullseye both near and far phone targets (2309.9316ms)
- ✖ gallery also supports a precision hold; cancelling it never fires (2531.947ms)

### v0424-target-range-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.42.4 source release identity is coherent and Android identity stays LuckyDex (9.0122ms)
- ✖ failing tests:
- ✖ v0.42.4 source release identity is coherent and Android identity stays LuckyDex (9.0122ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0425-goldenrod-picker-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.42.5 shared Goldenrod picker release identity is coherent (9.5991ms)
- ✖ failing tests:
- ✖ v0.42.5 shared Goldenrod picker release identity is coherent (9.5991ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0425-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.25 release identity and Sushi-Go-Round redesign are aligned (14.6408ms)
- ✖ failing tests:
- ✖ v0.40.25 release identity and Sushi-Go-Round redesign are aligned (14.6408ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0427-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.27+ release identity retains Clear Cut Challenge assets (11.7198ms)
- ✖ failing tests:
- ✖ v0.40.27+ release identity retains Clear Cut Challenge assets (11.7198ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0428-clear-cut-expansion.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ Clear Cut shell has visible split pieces, no COM players, and a mystery bag object state (6.744ms)
- ✖ failing tests:
- ✖ Clear Cut shell has visible split pieces, no COM players, and a mystery bag object state (6.744ms)
- AssertionError [ERR_ASSERTION]: The input was expected to not match the regular expression />PLACE&lt;/. Input:

### v0428-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.28+ release identity retains Stadium 2 venue and Pocket Rare Pack assets (13.3751ms)
- ✖ failing tests:
- ✖ v0.40.28+ release identity retains Stadium 2 venue and Pocket Rare Pack assets (13.3751ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0429-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.29+ preserves the user-tweak assets introduced in v0.40.29 (11.7266ms)
- ✖ failing tests:
- ✖ v0.40.29+ preserves the user-tweak assets introduced in v0.40.29 (11.7266ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0430-goldenrod-stat-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.43.0 Goldenrod stat-expression release identity and shared curve are aligned (10.9794ms)
- ✖ failing tests:
- ✖ v0.43.0 Goldenrod stat-expression release identity and shared curve are aligned (10.9794ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0430-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.40.30+ release retains the venue/pack feature bundle (16.9465ms)
- ✖ failing tests:
- ✖ v0.40.30+ release retains the venue/pack feature bundle (16.9465ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /versionCode\s+40(?:3\d|[4-9]\d)/. Input:

### v0431-impact-defense-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity remains aligned after the v0.43.1 Impact fix (23.5979ms)
- ✖ failing tests:
- ✖ current release identity remains aligned after the v0.43.1 Impact fix (23.5979ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0431-power-trial.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity is aligned (20.9922ms)
- ✖ failing tests:
- ✖ current release identity is aligned (20.9922ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0433-power-trial-ui.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity is aligned (18.1994ms)
- ✖ failing tests:
- ✖ current release identity is aligned (18.1994ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0434-power-trial-polish.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity is aligned (22.036ms)
- ✖ failing tests:
- ✖ current release identity is aligned (22.036ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0435-power-trial-dome.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity is aligned (22.6874ms)
- ✖ failing tests:
- ✖ current release identity is aligned (22.6874ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0436-impact-trial.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity is aligned (14.0152ms)
- ✖ failing tests:
- ✖ current release identity is aligned (14.0152ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0437-impact-harden.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity is aligned (19.5191ms)
- ✖ failing tests:
- ✖ current release identity is aligned (19.5191ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0438-impact-harden-tuning.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity is aligned (14.4962ms)
- ✖ failing tests:
- ✖ current release identity is aligned (14.4962ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0439-impact-input-polish.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity is aligned (17.357ms)
- ✖ failing tests:
- ✖ current release identity is aligned (17.357ms)
- AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

### v0440-preservation.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Unrelated v0.43.1 production change: app/src/main/java/com/example/luckydex/MainActivity.java

### v0440-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0450-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0451-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0452-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0453-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0454-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.45.4 Elemental Gauntlet pattern rewrite release identity is coherent (7.8407ms)
- ✖ failing tests:
- ✖ v0.45.4 Elemental Gauntlet pattern rewrite release identity is coherent (7.8407ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0455-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.45.5 Elemental Gauntlet consequence pass release identity is coherent (5.8764ms)
- ✖ failing tests:
- ✖ v0.45.5 Elemental Gauntlet consequence pass release identity is coherent (5.8764ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0460-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.46.0 Endurance Expedition release identity is coherent (3.7285ms)
- ✖ failing tests:
- ✖ v0.46.0 Endurance Expedition release identity is coherent (3.7285ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0461-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.46.1 Endurance Gen 3 UI release identity is coherent (6.0938ms)
- ✖ failing tests:
- ✖ v0.46.1 Endurance Gen 3 UI release identity is coherent (6.0938ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0462-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.46.2 Endurance steering-only visual pass release identity is coherent (8.3588ms)
- ✖ failing tests:
- ✖ v0.46.2 Endurance steering-only visual pass release identity is coherent (8.3588ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0470-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.47.0 Roulette release identity is coherent (10.4933ms)
- ✖ failing tests:
- ✖ v0.47.0 Roulette release identity is coherent (10.4933ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0471-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.47.1 Roulette presentation release identity is coherent (8.3799ms)
- ✖ failing tests:
- ✖ v0.47.1 Roulette presentation release identity is coherent (8.3799ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0472-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.47.2 release identity is consistent (11.3401ms)
- ✖ failing tests:
- ✖ v0.47.2 release identity is consistent (11.3401ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0473-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.47.3 release identity is consistent (14.8376ms)
- ✖ failing tests:
- ✖ v0.47.3 release identity is consistent (14.8376ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0474-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.47.4 release identity is consistent (13.0538ms)
- ✖ failing tests:
- ✖ v0.47.4 release identity is consistent (13.0538ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0480-arcade-catalog.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ Game Corner sublocations route through the shared openGame path (5.247ms)
- ✖ failing tests:
- ✖ Game Corner sublocations route through the shared openGame path (5.247ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /function openGame\(id\)/. Input:

### v0480-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.48.0 release identity is consistent (9.2269ms)
- ✖ failing tests:
- ✖ v0.48.0 release identity is consistent (9.2269ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0481-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.48.1 release identity is consistent (9.9263ms)
- ✖ failing tests:
- ✖ v0.48.1 release identity is consistent (9.9263ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0490-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.49.0 release identity is consistent (10.0044ms)
- ✖ failing tests:
- ✖ v0.49.0 release identity is consistent (10.0044ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0500-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.50.0 release identity is consistent (12.1815ms)
- ✖ failing tests:
- ✖ v0.50.0 release identity is consistent (12.1815ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0502-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.50.2 release identity is consistent (9.401ms)
- ✖ failing tests:
- ✖ v0.50.2 release identity is consistent (9.401ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0503-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.50.3 release identity is consistent (9.0503ms)
- ✖ failing tests:
- ✖ v0.50.3 release identity is consistent (9.0503ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0504-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.50.4 release identity is consistent (8.9197ms)
- ✖ failing tests:
- ✖ v0.50.4 release identity is consistent (8.9197ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0505-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.50.5 release identity is consistent (11.8282ms)
- ✖ failing tests:
- ✖ v0.50.5 release identity is consistent (11.8282ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0540-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.54.0 release identity is consistent (8.7371ms)
- ✖ failing tests:
- ✖ v0.54.0 release identity is consistent (8.7371ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0541-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.54.1 release identity is consistent (10.7004ms)
- ✖ failing tests:
- ✖ v0.54.1 release identity is consistent (10.7004ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0542-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.54.2 release identity is consistent (9.3844ms)
- ✖ failing tests:
- ✖ v0.54.2 release identity is consistent (9.3844ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0543-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.54.3 release identity is consistent (12.8682ms)
- ✖ failing tests:
- ✖ v0.54.3 release identity is consistent (12.8682ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0550-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.55.0 release identity is consistent (9.8174ms)
- ✖ v0.55.0 packages Gutsy Golbat as the only new Stadium 2 game (3.402ms)
- ✖ failing tests:
- ✖ v0.55.0 release identity is consistent (9.8174ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- ✖ v0.55.0 packages Gutsy Golbat as the only new Stadium 2 game (3.402ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /games:\['clearCutChallenge','gutsyGolbat'\]/. Input:

### v0551-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.55.1 release identity is consistent (11.281ms)
- ✖ failing tests:
- ✖ v0.55.1 release identity is consistent (11.281ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0552-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.55.2 release identity is consistent (11.8663ms)
- ✖ failing tests:
- ✖ v0.55.2 release identity is consistent (11.8663ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0553-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.55.3 release identity is consistent (10.8066ms)
- ✖ failing tests:
- ✖ v0.55.3 release identity is consistent (10.8066ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0554-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.55.4 release identity is consistent (10.0022ms)
- ✖ failing tests:
- ✖ v0.55.4 release identity is consistent (10.0022ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0555-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.55.5 release identity is consistent (11.9367ms)
- ✖ failing tests:
- ✖ v0.55.5 release identity is consistent (11.9367ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0556-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.55.6 release identity is consistent (9.0576ms)
- ✖ failing tests:
- ✖ v0.55.6 release identity is consistent (9.0576ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0557-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.55.7 release identity is consistent (8.7179ms)
- ✖ failing tests:
- ✖ v0.55.7 release identity is consistent (8.7179ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0558-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.55.8 release identity is consistent (9.4784ms)
- ✖ failing tests:
- ✖ v0.55.8 release identity is consistent (9.4784ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0560-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.56.0 release identity is consistent (9.9354ms)
- ✖ v0.56.0 adds Furret Frolic as the only new Stadium 2 game (3.8121ms)
- ✖ failing tests:
- ✖ v0.56.0 release identity is consistent (9.9354ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- ✖ v0.56.0 adds Furret Frolic as the only new Stadium 2 game (3.8121ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /games:\['clearCutChallenge','gutsyGolbat','furretFrolic'\]/. Input:

### v0561-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.56.1 release identity is consistent (9.1129ms)
- ✖ failing tests:
- ✖ v0.56.1 release identity is consistent (9.1129ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0571-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.57.1 release identity is consistent (8.0852ms)
- ✖ failing tests:
- ✖ v0.57.1 release identity is consistent (8.0852ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0580-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.58.0 release metadata is aligned (12.1995ms)
- ✖ failing tests:
- ✖ v0.58.0 release metadata is aligned (12.1995ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0601-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.60.1 release metadata is aligned (10.9479ms)
- ✖ failing tests:
- ✖ v0.60.1 release metadata is aligned (10.9479ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0612-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.61.2 release metadata is aligned (7.2177ms)
- ✖ failing tests:
- ✖ v0.61.2 release metadata is aligned (7.2177ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0620-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.64.0 release metadata is aligned (8.7481ms)
- ✖ failing tests:
- ✖ v0.64.0 release metadata is aligned (8.7481ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0620-streaming-stampede-integration.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ Streaming Stampede is registered across the Stadium 2 world, shared help, and page assets (6.3762ms)
- ✖ failing tests:
- ✖ Streaming Stampede is registered across the Stadium 2 world, shared help, and page assets (6.3762ms)
- AssertionError [ERR_ASSERTION]: clearCutChallenge must have Kids Club tile metadata or Stadium 2 venue rendering will throw

### v0621-stadium2-entry-regression.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ every Stadium 2 Kids Club game has tile metadata so the venue can render safely (4.7012ms)
- ✖ failing tests:
- ✖ every Stadium 2 Kids Club game has tile metadata so the venue can render safely (4.7012ms)
- AssertionError [ERR_ASSERTION]: clearCutChallenge is missing Kids Club tile metadata

### v0670-fishing-browser.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ Adventure fishing first-open help, Back and quick-cast controls stay usable on a 360x640 phone viewport (6701.1817ms)
- ✖ failing tests:
- ✖ Adventure fishing first-open help, Back and quick-cast controls stay usable on a 360x640 phone viewport (6701.1817ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0670-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ release identity remains internally consistent across package, Gradle and visible build metadata (10.2934ms)
- ✖ failing tests:
- ✖ release identity remains internally consistent across package, Gradle and visible build metadata (10.2934ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /versionCode 7260\b/. Input:

### v0670-repo-hygiene.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ canonical repository excludes audited generated and historical clutter (18.024ms)
- ✖ cleanup preserves audited live and reproducibility inputs (4.7853ms)
- ✖ failing tests:
- ✖ canonical repository excludes audited generated and historical clutter (18.024ms)
- AssertionError [ERR_ASSERTION]: generated artifacts directory must stay empty
- ✖ cleanup preserves audited live and reproducibility inputs (4.7853ms)
- AssertionError [ERR_ASSERTION]: root card-art-index.json must remain

### v0680-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ current release identity is consistent everywhere (12.2258ms)
- ✖ failing tests:
- ✖ current release identity is consistent everywhere (12.2258ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0422-target-range-landscape.test.cjs

Exit: none · 240s verification timeout; prior v035 broad-run exit: not in that run.

- ✖ live range is portrait with a foreground shooter and horizontal downrange horizon (5003.8594ms)
- ✖ small reticle visibly tightens on a well-timed hold (5501.8041ms)
- ✖ runtime launches upward from the low central Pokemon (4808.3851ms)

### v0690-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.4 release identity is consistent everywhere (9.7998ms)
- ✖ failing tests:
- ✖ v0.69.4 release identity is consistent everywhere (9.7998ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06911-achievement-rarity-audit.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.11 release identity is consistent everywhere (7.7106ms)
- ✖ failing tests:
- ✖ v0.69.11 release identity is consistent everywhere (7.7106ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06911-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.11 release identity is consistent everywhere (13.0955ms)
- ✖ failing tests:
- ✖ v0.69.11 release identity is consistent everywhere (13.0955ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06912-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.12 release identity is consistent everywhere (10.9631ms)
- ✖ failing tests:
- ✖ v0.69.12 release identity is consistent everywhere (10.9631ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06913-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.13 fishing economy release identity is consistent everywhere (10.4008ms)
- ✖ failing tests:
- ✖ v0.69.13 fishing economy release identity is consistent everywhere (10.4008ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06914-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.14 whole-app audit release identity is consistent everywhere (12.0752ms)
- ✖ failing tests:
- ✖ v0.69.14 whole-app audit release identity is consistent everywhere (12.0752ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06915-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.15 release identity is aligned (14.7954ms)
- ✖ failing tests:
- ✖ v0.69.15 release identity is aligned (14.7954ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06932-app-cleanup.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.32 release metadata is aligned (7.7926ms)
- ✖ failing tests:
- ✖ v0.69.32 release metadata is aligned (7.7926ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v06933-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.33 patch release identity is aligned while retaining Android application and signer (6.9655ms)
- ✖ failing tests:
- ✖ v0.69.33 patch release identity is aligned while retaining Android application and signer (6.9655ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0695-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.5 release identity is consistent everywhere (9.2592ms)
- ✖ failing tests:
- ✖ v0.69.5 release identity is consistent everywhere (9.2592ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0696-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.6 release identity is consistent everywhere (7.2765ms)
- ✖ failing tests:
- ✖ v0.69.6 release identity is consistent everywhere (7.2765ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0697-fishing-polish.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ reachable-caught counter treats availableSpecies results as species IDs (4.6248ms)
- ✖ failing tests:
- ✖ reachable-caught counter treats availableSpecies results as species IDs (4.6248ms)
- AssertionError [ERR_ASSERTION]: The input did not match the regular expression /availableSpecies\(a,s\.selectedRod\)\.map\(id=>Number\(id\)\)/. Input:

### v0697-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.7 release identity is consistent everywhere (7.2863ms)
- ✖ failing tests:
- ✖ v0.69.7 release identity is consistent everywhere (7.2863ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0698-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.8 release identity is consistent everywhere (13.1195ms)
- ✖ failing tests:
- ✖ v0.69.8 release identity is consistent everywhere (13.1195ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

### v0699-release.test.cjs

Exit: 1; prior v035 broad-run exit: 1.

- ✖ v0.69.9 release identity is consistent everywhere (11.239ms)
- ✖ failing tests:
- ✖ v0.69.9 release identity is consistent everywhere (11.239ms)
- AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

## Evidence files

Delivery `verification/all-project-results.json`, `focused-results.json` and `final-boundaries.json` retain every program exit, stdout and stderr. Build logs, card execution/stress JSON, source reconstruction audit and signature output are alongside them. Original failures remain inspectable even where a later rerun passed.
