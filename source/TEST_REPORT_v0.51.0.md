# LuckyDex v0.51.0 test report

Verified 17 October 2026. Sole product baseline: supplied `LuckyDex_source_v0.50.5.zip`, SHA-256 `5308975805b901ab39d8ff7463954734c845f347a736a4e6574ab1e12b2845d8`.

## Outcome and scope

Pokémon Seek has one replacement renderer/style implementation, a small source-backed location model, graph-based search core and a reserved-prize delivery helper. Scene artwork is unobstructed by large controls; area/difficulty selectors, contextual spot labels, SEARCH, LISTEN and named destinations sit outside it. Transparent glints, selection outlines and brief Pokémon reveals are the only interactive scene overlays.

There are **eight supported areas, 27 authored location nodes**:

| Area | Locations | Coverage notes |
| --- | ---: | --- |
| Pleasant Forest | 4 | Woodland, clearing, understory and grass bank compositions |
| Windswept Sky | 3 | Recovered sky/cloud layers; soft edge blending |
| Sparkling Sea | 3 | Underwater scenery, rock ledges and rippled water |
| Spooky Manor | 5 | Exterior plus furniture-backed interiors; shelves are empty, not a fabricated library |
| Rugged Mountain | 3 | Rocky trail, ridge and rock pool compositions |
| Icy Cave | 3 | One frozen chamber, stone passage and stone entrance, labelled truthfully |
| Dream Park | 3 | Visible path, lawn/hedge and paved plaza; recovered balloons |
| Pokémon Café Forest | 3 | Café interiors with recovered furniture, plus forest edge |

**Dream Ruins omitted:** no suitable supported assets were found. Numeric parity was not forced. Node names, placements and connections are LuckyDex-authored compositions, not claims about historical Dream World room layouts.

Difficulty changes map size, time, decoys, visual hints and Listen precision. Search requires a valid selected current-scene spot and rejects repeats/foreign spots/late searches. Listen measures real shortest-path distance. Found/time/item/rare bonuses and modest deduction costs appear in the results breakdown. Eight Seek achievements preserve all six legacy IDs and add first-search and three-area-clear goals. New save fields are additive and preserve unknown/future records.

Dream Sparkle reserves and saves at collection, before asynchronous resolution. Multiple pending events cannot overwrite one another; concurrent delivery grants once. Pending offline prizes retry on a later Seek visit. Results do not wait on network requests. Settings retain Off 0 / Vanilla .02 / Test .25 / Always 1.

The hub uses locally bundled recovered Forest scenery and retains all three games. Ice Cream Scoop physics/renderers, Wailord modules, and the existing cone-arrow mask are unchanged.

## Sources and processing

- Primary: [Dream World Revival asset library](https://github.com/Shade-of-Gr3y/Dream-World-Revival), pinned to `36e3c302d4ba3f79886efccb731c5e4e65143341`. The recursive catalogue was classified before selective downloading; no bulk image download was used.
- Secondary: the supplied Bulbagarden Dream World décor/items categories were reachable and inspected. Duplicate downloads were unnecessary because the primary contained the selected props.
- **38 locally bundled scene/decor assets, 8,551,344 bytes:** ten original JPEGs and 28 lossless WebPs. Git blob SHA-1, SHA-256, dimensions and exact decoded RGBA equality were checked. Original JPEGs avoid lossless-transcode size inflation. No source image was redrawn, AI-generated, background-removed or silently reconstructed.
- Café interior is repository-supplied completed imagery whose original-versus-reconstruction status is not independently established. Recovered numbered layers, `(RIP)` décor, authored composition and this uncertainty are distinguished in the manifest/docs.
- Existing LuckyDex pixel Pokémon actors remain; they are not claimed to be recovered Dream World illustrations. Conservative species pools were checked against established area encounter tables, linked in `docs/SEEK_V0510_DESIGN_NOTES.md`.
- Source hosting is not treated as an open-license or legal redistribution-rights assertion. Pokémon artwork remains subject to its owners' rights.

Full per-file provenance: `app/src/main/assets/arcade/dream-world/seek/assets-manifest.json` and `docs/DREAM_WORLD_SEEK_ASSETS.md`. Runtime scene assets do not hotlink external websites. Source boundaries are blended procedurally in CSS; the rectangular snowy-branch candidate is not used as a floating cave prop.

## Test-first evidence and focused results

New exploration tests were observed **9/9 RED** before the graph/core implementation. New prize tests were observed **5/5 RED** before the delivery helper. Persistence tests were written and observed failing before implementation. Runtime tests initially failed on missing selection/area UI; additional reproduced failures covered truncated result statistics, opaque selected hotspots, backgrounding during a decoy reveal and exiting during a successful-find flourish. Each was fixed and rerun green.

**Final focused regression command: 74 tests passed, zero failures/skips.** It includes all `v0510-*` tests, the adapted v0505 Seek core/integration suites, existing Ice Cream and Wailord core/integration tests, and v0501–v0504 Dream World visual/mechanics/result/layout suites. Evidence: `artifacts/v0510/focused-final.log`.

Coverage includes valid local art/graphs/destinations/scene spots; selected search; actual Listen distance/route; difficulty; expiry and late-find rejection; correct/wrong outcomes; score sums; results/history retaining the full breakdown; records, achievement IDs and v0.50.5 save migration; exact rare probabilities; synchronous reservation; concurrent once-only delivery; offline retry; pending-event isolation; save replacement safety; result idempotence; reveal visibility pause; successful-find exit; transparent selection and nonselectable UI. The v0.51.0 identity consistency test passes.

Legacy assertions changed narrowly in three relevant files: obsolete 3×3 Manhattan navigation/unselected-search assumptions now assert the real graph/selection contract; remote Manor/venue hotlinks now assert bundled source art; the minimum-version fixture now accepts future minor versions while checking consistent metadata. Original score, wrong-find, rare, achievement and unrelated game assertions remain. Details are in `docs/SEEK_V0510_DESIGN_NOTES.md`.

## Wider regression status — not an all-tests-pass claim

Before editing, the selected inventory had **20/28 programs passing, eight failing**. After implementation/version bump, the expanded inventory has **24/33 programs passing, nine failing** (`artifacts/v0510/baseline-tests.json`, `final-tests.json`). Eight final failures are unchanged historical exact-release fixtures for v0406, v0408, v0490, v0500, v0502, v0503, v0504 and now v0505; they expect their historical version rather than v0.51.0. They were not rewritten to manufacture a green history. The remaining inherited `v0408-integration.test.cjs` failure expects an obsolete exact rare-odds object shape that already excludes the supplied baseline's newer settings.

The real full runner was also executed. Eleven Adventure test programs passed, then `adventure-location-browser-v0402.test.cjs` stopped the runner with **6/8 assertions passing, two failing** because New Bark Town exposes zero Map tools where the historical test expects one. The same failure was reproduced in the unmodified supplied baseline audit. Unrelated Adventure code/tests were not changed. The runner's later programs and trailing asset-check steps were not reached in that invocation; no claim is made that the entire project suite passed. Evidence: `artifacts/v0510/full-runner.log`.

## Visual and offline verification

Fresh headless Chrome portrait QA produced **42 screenshots**. Images were inspected by the implementing agent, not merely counted by DOM checks. Captures cover the Dream World hub, Seek start, all eight areas and every authored node, Manor furniture, outdoor Forest/Park/Mountain, unusual Sea/Sky/Cave, selected spot, Listen, actual Settings → Always, the integrated Dream Sparkle and collection, results/scrollable actions, offline play/results, and start layouts at 320×800, 360×800, 393×852, 412×800 and the supplied 709×1536 portrait dimensions.

The final pass checks local images decode, no horizontal overflow, scene height above 200px at the main mobile viewport, nonselectable game UI, transparent selected hotspot, named graph traversal, all three hub games, actual Settings change handling, guaranteed event, one recorded run/reward, save reload, and a completed offline search. External requests are blocked throughout; browser offline mode is additionally enabled for local scene navigation/search through results. Local-file route fulfilment models the Android bundled-asset boundary; this is not a physical airplane-mode device test.

Visual defects fixed from fresh captures: wrapped Back label; opaque purple hotspot fill; rectangular cloud/water/terrain boundaries; a snowy-branch rectangle; buried park path; floating Manor lamp; clipped score components; low-contrast achievement rows. Scenery is not stretched. Controls do not cover scene artwork. Small screens retain legitimate vertical scrolling, and long results reach PLAY AGAIN and BACK TO DREAM WORLD naturally.

Evidence: `artifacts/v0510/visual/verification.json` and PNGs. Independent read-only review found no unresolved Critical/Important issues after the reveal-backgrounding regression fix. Review did not certify physical Android behavior or artwork redistribution rights.

## Android build and identity

**Final v0.51.0 `assembleDebug` passed offline** using cached Gradle 8.9, JDK 17, Android SDK 35: 33 tasks, 11 executed/22 up-to-date, `BUILD SUCCESSFUL in 31s`. The first sandbox attempt could not connect to Gradle's loopback daemon; the scoped outside-sandbox retry succeeded. Existing Java deprecation warnings remain; no signing or package workaround was introduced.

Verified by `apksigner` and `aapt`: application ID `com.example.luckydex`, versionName `0.51.0`, versionCode `5100`, min SDK 26, target SDK 35, one signer and valid APK Signature Scheme v2. Certificate SHA-256: `069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a`.

APK SHA-256: `b42c0108df852044b55cf2ad86e6afaf05d5ac459d7c81dd1a8e9ab0d083c301`. APK CRC verification and byte-for-byte comparison of **46 current Seek/HTML/app/asset files** passed. Evidence: `artifacts/v0510/build-final.log`, `apk-verification.txt`. No physical Android install, WebView/device touch test or performance profiling was performed. The generated APK/build caches are not in the source ZIP.

## Baseline preservation and packaging

ZIP-to-workspace audit: **7,577 supplied files byte-for-byte unchanged; 18 explicitly reviewed files changed; zero unexpected changes and zero missing baseline files in the workspace**. This includes unchanged Ice Cream/Wailord modules, unrelated games and the permanent keystore. Keystore SHA-256 before/after: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`. Only version metadata changes in Gradle; application/signing identity is intact. Audit evidence: `artifacts/v0510/baseline-comparison.json`.

Deliverable: `LuckyDex_source_v0.51.0.zip`. It contains source, tests, local runtime assets, provenance and final verification evidence, without build caches/APKs or duplicate binary reference downloads. Three obsolete archived planning documents containing old upload command instructions are excluded from the archive, but left intact in the workspace. No Termux command block is supplied in this delivery. ZIP CRC, required entries, source bytes, signer bytes and archive hash are verified by `scripts/package-seek-v0510.py`.

<!-- FINAL_ZIP_SHA256 -->

The adjacent delivered report receives the final ZIP hash after the ZIP is created; the in-archive copy retains this marker to avoid an impossible self-referential ZIP hash. `LuckyDex_source_v0.51.0.zip.sha256` is the detached checksum. `package-verification.json` records final size/count/CRC/hash and exact exclusions.

## Execution decisions and remaining limits

- Used a fresh isolated ZIP extraction rather than a Git worktree of the unrelated/unborn parent. No merge, push or publication was performed. Cost if wrong: there is no Git commit history for this source-only delivery; original ZIP and checksum remain the comparison authority.
- Kept original JPEGs plus lossless transparent WebPs rather than inflating JPEGs through lossless transcoding. Pixel checks passed; no visual degradation was introduced by conversion.
- Omitted unsupported Ruins and avoided claiming reconstructed/composed scenes are original historical rooms. This intentionally ships eight supported areas, not nine guessed ones.
- Historical tests and unrelated baseline Adventure failures remain disclosed. Physical device QA and legal redistribution rights are not certified. No unresolved independent-review functional findings remain.
