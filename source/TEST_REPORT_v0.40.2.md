# LuckyDex v0.40.2 — Adventure location flow and place identity

Release: **0.40.2 / versionCode 4002 / com.example.luckydex**. Verified 2026-10-13.

## Sole baseline and scope

The canonical project `LuckyDex_source.zip` was verified as v0.40.1/4001, SHA-256
`a36535f9c9cc59540ffe5d089da553c231cb4117d0ac41243dbb34aef77fecd6`.
All **7,017 extracted files** matched that archive before edits. The older
Downloads ZIP was v0.40.0 and was not used. The input archive remains untouched.
The baseline's **41/41 focused Adventure programs** and existing visual QA passed.
Twenty-five additional baseline captures reproduced disabled/fake services,
duplicate shops, generic scenery and guide-rest feedback following movement.

This is a location layer pass. Accepted v0.40.1 Battle 2x2 FIGHT/detail strip,
Party/custom pickers, Moves/TM tabs/pagination and Mart confirmation code remain
unchanged. Existing battle reducers, economy, migrations, claim protection,
checkpoint recovery, level syncing, PP/status and signing identity are retained.

## Delivered behavior

- One place profile owns real name/category, supported services, valid local
  actions, next destination, route segment and scene lookup. Unavailable filler,
  fabricated starting-town Centers, unsupported fishing and duplicate shops are
  hidden. At most six primary local actions compete with a subordinate, unique
  Party/Bag/Map strip.
- Travel is explicit and names its next destination. Johto passes through New
  Bark, Route 29, Cherrygrove, Route 30, Route 31, Sprout Tower, Violet City and
  Violet Gym on the original battle/reward IDs, seeds and schema 2 saves.
  Existing active Tower/Gym saves keep their actual final place.
- Talk and routine outcomes stay local. Notices are replaced by another action,
  dismissible, persistent at the same place on reload and cleared on movement.
  Required ordinary results settle once and wait for travel; badge/League
  milestones retain dedicated results.
- Starting homes use existing authored recovery (12% for the starting event;
  existing later Pallet camp retains full recovery). Supported Centers optionally
  restore HP/PP/status without travelling. Skipping an event/camp grants neither
  healing nor rewards. Routes have no new free full-party recovery. Healing
  never gates a Gym. This intentionally expands optional Center access to the
  supported settlement presentation waypoints; amounts, prices and recovery
  algorithms are unchanged.
- Thirty-four 384x160 native pixel vignettes cover ten categories across three
  regions and four named Johto profiles. Named art overrides category, then
  habitat. Complete roofs/objects remain framed; spare vertical scene space uses
  the matching native floor at the same scale. Emerald pixels come exclusively
  from the existing pinned source cache, not new external art. Kanto/Johto
  compositions are interpretations, not claims of canonical Gen III maps.

Architecture, service provenance, scene pixel provenance and test adaptation
rationale are in `docs/ADVENTURE_LOCATION_FLOW_V0402.md`,
`docs/ADVENTURE_LOCATION_SCENES_V0402.md` and
`docs/ADVENTURE_V0402_TEST_ADAPTATIONS.md`.

## Regression and visual verification

Final focused inventory: **47/47 programs pass**. New failing-first coverage
checks valid action/service menus, explicit travel, persistent waypoints, scene
precedence, one-time rewards, optional recovery and message lifetime. Three
obsolete location fixtures were adapted to explicit travel and hidden services;
exact battle/HP/PP/RNG reload, reward, recovery and atomic TM assertions remain.
Accepted Battle/Party/TM/Mart test programs remain intact and green.

**430 JavaScript sources parse.** The preservation check verifies **6,835 exact
original files**, twelve specifically reviewed edits and five narrowly normalized
release/module-load files, with no unexpected changes. It excludes 165 historical
generated evidence files from source preservation. Original engine function
bodies remain exact after the two reviewed standalone adapters are removed.
All unrelated runtime files and existing native assets remain protected.

Fresh ordinary-user first-Gym acceptance passes at **360x640, 360x780, 412x915,
320x568 and 768x1024**. The final matrix records **92 real combat actions**,
HP/PP-bearing moves, optional items/switches, actual Falkner victory, Route 30
reload/Map return and badge-result reload. It starts with owned evolved Pokemon
at Collection Lv30, synchronized to Journey Lv8. No injected victories, badge
grants or recovery are used in this acceptance path. Other-region presentation
spots explicitly use authored-node selection fixtures, not combat evidence.

**105 fresh location/state captures** plus **35 current preserved-UI captures**
cover the chapter, local feedback, movement, Kanto town/route, Hoenn city/coast,
Johto cave/Azalea, Party/custom picker, Moves/TM Case, Mart/confirmation and FIGHT.
Images, CSS floor URLs and footer/control bounds are checked. No document or
horizontal overflow occurs; main panes need no scroll at widths 360 and above.
The smallest phone keeps any necessary tool scrolling bounded. Contact sheets
and full-size town, route, tower, city, coast, FIGHT and TM screens were manually
inspected. A large empty paper gap, tablet zero-height grid override and a
relative CSS image URL were caught and corrected before final capture.

## Independent review

Review reproduced and verified fixes for result feedback regenerating after
Dismiss, older saves trapped inside merchant dialogs, and legacy home/event
service copy. The merchant regression reloads, browses, returns and resolves
without changing main depth, coins or place. The reviewer found no remaining
Critical or Important issue. Three-region traversal smoke tests retain eight
badges and final reward; those isolated simulations use terminal battle fixtures
and are separate from the real first-Gym acceptance path. Full findings are in
`docs/ADVENTURE_LOCATION_REVIEW_V0402.md`.

## Full existing inventory

The final stable continuing inventory passes **322/338 programs**,
with exactly the same 16 failure names as the incoming v0.40.1 release evidence
(316/332). **No new failures.** The incoming full baseline evidence, final
outputs and comparison are retained in `artifacts/v0402/`. The timing-sensitive
older Fossil fixture passes in this final run.

The inherited failures are:

- `amie-recovery.test.cjs`
- `recovery-lifecycle.cjs`
- `recovery-runtime.cjs`
- `recovery-trade-refresh.cjs`
- `recovery-transactions.cjs`
- `v0223-berry-touch.test.cjs`
- `v0250-fossil-browser.test.cjs`
- `v0250-fossil-routing-browser.test.cjs`
- `v0264-booster-art-audit-and-slim-pack.test.cjs`
- `v0267-physical-card-art-recovery.test.cjs`
- `v0283-unown-browser.test.cjs`
- `v0340-dash-previews.test.cjs`
- `v0340-dash-viewport.test.cjs`
- `v0360-dig-browser.test.cjs`
- `v0370-magikarp-browser.test.cjs`
- `v0380-rock-harden-browser.test.cjs`

They concern old fixture/lifecycle/layout expectations, unavailable `python3`
subprocesses and denied localhost access. Unrelated game code was not changed
to silence them.

The normal repository runner is also executed. It stops at inherited
`amie-recovery.test.cjs` because localhost navigation is denied in this
execution environment. There is no claim of an entirely green historical suite.
The initial continuing pass, retained separately, also caught a temporary
newline-only shared-function preservation failure during the metadata bump;
original byte formatting was restored and the final stable inventory passes it.

## Offline assets and Android

Offline audits pass for 44 authentic scenes/sheets/crops, 2,098 sprites,
2,078 unretouched actors, eight venues, Adventure's 829 images/1,025 species/
386 backs/37 objects and 42 Fossil Museum images. The new scene builder and
independent pixel reconstruction verify all 34 delivered vignettes against
pinned source rectangles and packaged native sprites. Existing Dash art stays
unchanged. The required 210,014-byte Dragon Vault packshot validates exactly.

Offline Gradle `:app:assembleDebug` succeeds. APK metadata and v2 signature
inspection confirm 0.40.2/4002 and the original signer SHA-256:
`069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a`.
The versioned APK is debug-signed with the supplied permanent development key.
All **6,016 runtime assets** match the APK byte-for-byte. APK SHA-256:
`0d344ba4e43431346a1d163b450ad320c90557adcfdbaa6441427c707452a539`.

## Packaging and limits

The release script packages the tested final tree, validates ZIP CRC and each
entry against its source byte-for-byte, freshly extracts the archive and compares
all runtime assets against the verified APK. Fresh-extraction focused, syntax,
release, source-preservation and native-pixel checks pass: **47/47 focused
programs**, 430 syntax checks, zero unexpected protected-source changes and all
34 reconstructed scene images. The
adjacent `LuckyDex_v0.40.2_package-verification.json` records final hashes, byte
counts, exact extraction and fresh-test results.

The clean source ZIP includes this report, implementation/provenance/review
docs, regression tests, pinned native source inputs and curated current evidence.
It excludes Git/dependencies/build/SDK caches, local SDK properties, archive/APK
binaries and old/scratch/failure QA. Earlier versioned releases are retained.

Physical Android/WebView execution, native keyboard behavior, device FPS and
accessibility text scaling were not tested. Chrome QA uses the complete local
offline app. The inherited historical failures remain outside this location
pass. No push or merge was performed.
