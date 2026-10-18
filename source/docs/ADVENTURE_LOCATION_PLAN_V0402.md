# Adventure v0.40.2 — place-first location flow

The sole input is the project's canonical source ZIP, verified as v0.40.1/4001. All 7,017 extracted files matched it before changes. The Downloads ZIP is v0.40.0 and is not used. Existing 41 focused Adventure programs and existing visual QA pass. The approved v0.40.2 brief supplies the scope; the accepted compact Battle, Party, Move/TM and Mart UI is retained.

## Audit

Actual baseline captures reproduce New Bark's seven competing actions including disabled Center, ordinary guide-rest feedback remaining on Route29, duplicate Mart/merchant controls and Azalea using a cave background. Twenty-five additional baseline captures across five viewports are in `artifacts/v0402/before/`; none has outer overflow. These are flow/identity defects rather than a reason to rebuild compact tools or battle.

## Implementation boundaries

- `LuckyDexLocationFlow` describes one authoritative named place/category, data-backed valid local actions, explicit onward travel and local feedback. Small persistent waypoints on existing node IDs add Route30/31 and VioletCity presentation to Johto's first leg without reindexing saved battle/reward nodes. Active saved Tower/Gym fights retain their true place. Routine effects remain at the producing place until explicit travel; milestones retain their dedicated view.
- Narrow engine adapters safely skip non-battle travel without healing/grants and restore only at a supported Center. Center use is optional and never gates a Gym. Starting-home recovery retains the existing 12% event amount; no route gets free full healing. Prices, move/battle reducers, claims, caps, party mutation, TMs and schema2 stay intact.
- A bounded local asset catalog composes GenIII vignettes from cached native Emerald map/tileset pixels: 10 categories ×3 regions and four named Johto profiles. Exact place override precedes category and habitat. Complete buildings/roofs are framed inside384×160 scenes. No new overworld, painted artwork or fabricated exact-map claims.
- Root location UI uses one main place/scene/status/local-action window, at most six primary valid actions, a subordinate unique Party/Bag/Map strip, and a named next-place footer. No disabled filler, duplicated tools, generic guide-rest or generated supply-stop identity. Local feedback is scoped, dismissible, replaced by another action and cleared on movement.

## Execution and verification

- [x] Inspect v0.40.1 docs/source; verify archive equality; run baseline tests/QA and inspect captures.
- [x] Observe new regressions failing, implement pure place/action/waypoint/feedback adapter and native scenes, then verify source/pixel/transaction behavior.
- [x] Integrate named scene/profile UI and contextual local actions without changing accepted tools/battle layouts.
- [x] Complete real-user Johto first Gym playthrough: NewBark→Route29→Cherrygrove→Route30/31→SproutTower→VioletCity→VioletGym. Capture three phones plus320×568/tablet and Kanto/Hoenn spot checks; inspect stable frames.
- [x] Preserve compact Battle/Party/TM/Mart tests, migration/economy/claim tests, protected-source checks; run full continuing inventory and syntax/offline/build audits, independent review.
- [x] Release0.40.2/4002 with original signer; package clean source/APK/report/visuals; freshly extract exact ZIP and rerun focused/release/source checks. No push/merge.

Review focus: existing saves keep node IDs/claims and active battles; optional recovery cannot advance or bypass required combat; explicit movement commits once; local notices cannot cross place or traversal boundaries; later regions and fishing remain unavailable unless supported by authored data.
