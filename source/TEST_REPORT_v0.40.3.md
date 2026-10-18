# LuckyDex v0.40.3 — Adventure scene and navigation polish

Release: **0.40.3 / versionCode 4003 / com.example.luckydex**. Verified 2026-10-13.

## Sole baseline

Input: `LuckyDex_source_v0.40.2.zip`, 46,479,751 bytes, SHA-256
`71ab5acca6bf6db74d1b984c4b68dc26a083529cb1d6f51a1553b36965c559e2`.
All **7,110 extracted files** matched before changes. README, the v0.40.2 report
and current journey/location/provenance documents were read. The untouched
focused inventory passed **47/47 programs**. Twenty additional baseline captures
covered all ten requested places at 320x568 and 412x915 and were inspected.
Tall scenes reached 637px with repeated floor, towns shared layouts, Route 124
showed yellow bridge strips, and city Gym destinations appeared twice.

## Changes

- `adventure/adventure-hub.css`: bounded native 4:3 scene window, viewport budget,
  360px cap, uniform image/player scale and short-phone shrink. No floor repeats
  beyond the PNG. The local window caps at 800px with plain dark mat. Styling is
  scoped to location/section views; accepted Battle and Tools styles are retained.
- `adventure/adventure-regional-ui.js`: framed scene/player presentation, concise
  objective strip and destination identity on controls. A visible local transition
  suppresses its duplicate footer. Saved waypoint counts move into the header.
  Preparation, battle and milestone views retain their accepted renderers.
- `adventure/adventure-location-flow.js`: `objective`, `nextId`, local
  `destinationId`, `travelFor` and presentation-only `leave-gym`. Unchallenged
  Gyms return to their cities and can be re-entered without engine advance,
  healing, rewards or party/claim/checkpoint mutations. `gymCityReturn` distinguishes
  intentional city visits from older single-place step-zero Gym saves. Active
  battle/result saves keep their Gym; badge advance still leads to Route 32.
- Scene builder/catalog/manifest/PNGs: **40 opaque 384x288 native compositions**,
  ten named profiles, all thirty regional categories and existing aliases retained.
  Six new exact profiles cover Pallet, Azalea, Viridian, Littleroot, Petalburg and
  Route 124. Priority towns have different roads, buildings and foreground props.
  Regression tests, versioned build/package utilities and handover docs are added.

Regional engine, Battle, Party/Moves/TM/Mart transactions, controller, progression,
Wild Hunt, schema, node IDs/seeds/claims, prices, recovery and original signer
remain byte-exact. The exact exceptions are listed in
`tests/adventure-scene-nav-approved-edits-v0403.json`. No new overworld, movement,
quest framework or external art was introduced.

## Route 124 and player art

The yellow strip was already in the PNG: repeated Fortree partial bridge-floor
and bridge-rail tiles were unsuitable for a broad water crossing. It was not a
viewport scaling or cropping fault. Complete shore bends and offshore rock
rectangles now come from the packaged Route104 cache. Corrective visual QA caught
an adjacent rock sliver; the complete selected rock was retained and recaptured.
No defective art is hidden offscreen.

Normal scenes provide safe player anchors using the existing transparent Red
trainer pose (64x64 source, displayed at 32x32 native scene size). No local human
walk sheet was packaged, so the permitted static trainer fallback is used without
new downloads or image edits. Gym/League descriptors omit it. Anchors stay on
clear paths/floors/beaches and outside landmarks. These are native Emerald
interpretations, not claims of canonical Johto map screenshots.

## Tests and source preservation

**51/51 focused programs pass.** New failing-first cases cover bounded aspect,
short-phone fit, named scenes, avatars/omission, objectives, duplicate navigation,
Gym exit/reload, legacy Gym saves and visible waypoint progress. Three obsolete
v0.40.2 expectations changed only for complete-image fit instead of full-width
floor fill, the new valid Gym exit, and selecting the sole local Gym destination.
Existing HP/PP/RNG, rewards, economy, migration, atomic TM and Mart assertions
remain. Old scene size checks and pixel reconstruction use the approved dimensions.

**438 JavaScript sources parse.** Preservation checks verify **7,056 exact
original files**, 49 individually reviewed edits and five narrow release-marker
files, with zero unexpected changes and the regional engine byte-exact. Seventy-nine
Dash files (including 59 original native assets), 204 cache inputs and seven
trainer PNGs stay exact. Independent RGBA reconstruction verifies all 40 complete
scene PNGs and player source pixels. The input archive remains unchanged.

## Visual QA and actual first-badge chapter

The final matrix covers **320x568, 360x640, 360x780, 412x915 and 768x1024**. It
produces **120 fresh chapter/region captures**, ten galleries, and **35 preserved
Party/picker/Moves/TM/Mart/confirmation/FIGHT captures**. Contacts and full-size
screens were manually inspected. Scene heights are approximately 216, 243, 258,
297 and 360px; tall-phone scenes occupy about 40–44% of usable space. Landmarks
remain complete, the player is legible and no repeated ground band fills spare
height. No document/horizontal overflow or primary-pane scrolling occurs.

Actual UI play follows New Bark → Route 29 → Cherrygrove → Route 30 → Route 31
→ Sprout Tower → Violet City → Violet Gym → actual badge result → Route 32.
The final matrix records **104 real combat actions**, HP/PP-bearing moves, optional
items/switches and Centers. Prepared owned evolved Pokémon at Collection Lv30
synchronize to Journey Lv8. No victories, rewards, recovery or locations are
injected into this acceptance path. Route 30, non-rewarding Gym return, badge
result and Route 32 reload checks pass. Route 30/31 header counts persist as
1/3 and 2/3 while objectives stay concise.

Regional presentation fixtures are separate from combat acceptance: Kanto
Pallet/Route 1/Viridian, Hoenn Route 101/Route 124/Petalburg, and Johto
Azalea/Union Cave. Named towns, shoreline art, player/landmark separation and
short/tablet layouts were inspected in the final captures.

Independent review found no unresolved Critical, Important or actionable Minor
issue. It also exercised all 24 Gyms with fresh and legacy states (48 cases):
blocked unearned advance, exact mechanic snapshots, city exit/reload/re-entry,
unique destinations and refusal to leave an active battle. See the review,
QA and scene-provenance notes under `docs/`.

## Full available inventory

The continuing inventory passes **326/342 programs**, with exactly the same
16 failure names as incoming v0.40.2 evidence (322/338). **No new failures.**
The final header and waypoint-copy assertions followed their initial full-run
execution; affected flow/browser checks were rerun. Final visual inspection
also verified that Routes 30/31 say “Follow the path,” reserving “Trainer battle”
for Sprout Tower. These presentation corrections change no engine behavior. The fresh
packaged focused gate runs the completed runtime. Raw results and comparison
are retained under `artifacts/v0403/`; incoming full baseline evidence is clearly
identified as provided release evidence, distinct from the freshly run focused gate.

The inherited failures are:

- `amie-recovery.test.cjs`
- `recovery-lifecycle.cjs`, `recovery-runtime.cjs`
- `recovery-trade-refresh.cjs`, `recovery-transactions.cjs`
- `v0223-berry-touch.test.cjs`
- `v0250-fossil-browser.test.cjs`, `v0250-fossil-routing-browser.test.cjs`
- `v0264-booster-art-audit-and-slim-pack.test.cjs`
- `v0267-physical-card-art-recovery.test.cjs`
- `v0283-unown-browser.test.cjs`
- `v0340-dash-previews.test.cjs`, `v0340-dash-viewport.test.cjs`
- `v0360-dig-browser.test.cjs`, `v0370-magikarp-browser.test.cjs`
- `v0380-rock-harden-browser.test.cjs`

They concern inherited fixture/lifecycle/layout expectations, unavailable
`python3` subprocesses and denied localhost access. No entirely green historical
suite is claimed. Unrelated game code was not changed to silence those fixtures.

## Android, offline assets and package

Offline Gradle `:app:assembleDebug` succeeds. Metadata confirms **0.40.3/4003**,
original application ID and original development signer SHA-256:
`069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a`.
The versioned APK is debug-signed. All **6,022 runtime assets** match source
byte-for-byte. APK SHA-256:
`07a4068174ad664e35607daf858501f4561d5314156d8aee9388aa294c9f70e0`.

Offline audits pass: 44 authentic scenes/sheets/crops, 2,098 sprites, 2,078 actors,
eight venues, Adventure's 829 images/1,025 species/386 backs/37 objects, and 42
Fossil Museum images. The exact 210,014-byte Dragon Vault packshot validates.
New native reconstruction and original cache/asset preservation pass.

The release script validates ZIP CRC, each entry against tested source, fresh
extraction and every runtime asset against APK bytes. Focused, syntax, release,
pixel and source-preservation checks run from the freshly extracted archive
before delivery: **51/51 focused programs**, 438 syntax checks, all 40 scene
reconstructions and zero unexpected original-file changes pass. The adjacent `LuckyDex_v0.40.3_package-verification.json` records
final hashes, counts and those results.

The ZIP retains curated v0.40.2 baseline evidence for exact original-file checks,
current QA, implementation/provenance/review docs and native build inputs. It
excludes Git/dependencies/build/SDK caches, local SDK properties, archive/APK
binaries and scratch/failure artifacts. Earlier releases and the input stay intact.

## Limits

Physical Android/WebView execution, native keyboard behavior, device FPS and
accessibility text scaling were not tested. Chrome runs the full offline app.
The avatar is a static packaged trainer pose. The inherited failures remain
outside this presentation pass. No push or merge was performed.
