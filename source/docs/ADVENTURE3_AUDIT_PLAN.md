# Adventure 3.0 audit and implementation ledger — 2026-10-12

The supplied v0.39.1 ZIP is authoritative (versionCode3901, com.example.luckydex). The approved Adventure3 brief calls for an architectural rework and autonomous implementation through v0.40.0/versionCode4000. The existing input and previous versioned releases remain untouched.

## Audit before implementation

`adventure-regional-ui.js` wraps the older controller and switches public ownership using `legacyPreferred`. It exposes two competing entry designs. The older controller mixes atmospheric Roam/hotspots with a seven-room branching Expedition, run perks and guardian rewards. The regional engine stores one generated 41-depth run and marks it lost/retreated on defeat/leave. Eight-Gym teams, encounter pools, species/moves/learnsets and scene art are useful reusable data.

Owned and battle levels already differ: regional members initially sync to min(owned level,8), while UI says their levels are kept without explaining that sync. Party lives in Collection. The current Mart buys immediately, hides balances/owned counts and has no confirmation-time quote. Battle ignores ordinary Speed order, and trainer flee remains available. Moves have canonical type/category/power/accuracy/PP; priority exists in bundled source CSV and must be generated. Existing Wild Hunt math is rare bonus min(2%,chain×0.2%) and item bonus min(3%,chain×0.3%); these values will be retained and described clearly.

Baseline evidence: original Adventure test inventory and original phone/tablet screenshots are recorded under `artifacts/v0400/baseline-adventure-tests.json` and `artifacts/v0400/before/`. New regression tests precede production implementation. Unrelated Arcade, packs, trades and cards stay outside this change.

## Architecture and agreed interfaces

- One `LuckyDexAdventure` public hub/controller owns entry, navigation, tools and resources. Internal Wild Hunt and journey UI modules render beneath it; no legacy wrapper/selector.
- `LuckyDexRegionalEngine` schema2 stores independent journeys, activeRegion and a rebound active alias after JSON load. Existing battle/reward APIs remain; start resumes, defeat restores the current chapter checkpoint, and one-time claims persist. `LuckyDexJourneys` defines named 3–6-section Gym chapters and deliberate League destinations using existing canonical data. Only Kanto/Johto/Hoenn are populated.
- `LuckyDexAdventureTools.mount(host,services,screen,options)` owns Party/detail/moves/Mart/Bag. Model operations and transaction tokens are independently testable. Services provide getState/save/toast/onBack/onNavigate. Party editor is locked during battles, and shows owned vs synced levels.
- `LuckyDexMoveView.describe/markup` is shared across move menus and battle FIGHT. Battle retains deterministic reducer/animation interfaces and evolves move order to priority, Speed and seeded ties. Item/switch/capture simplifications remain documented.
- Existing local biome scenes, trainer art, Pokémon staging and weather serve the journey/hub visual families. Viewport shell has a scrolling main pane and reachable footer; reduced motion disables decoration/long action delays.

## Tasks and acceptance

- [x] Run baseline Adventure tests and inspect four baseline screen sizes.
- [x] Add failing migration tests, then schema2 independent persistent journeys/authored route data/checkpoints/defeat/claim safety; all3regions reachChampion.
- [x] Add failing battle priority/Speed/TM-format tests; implement shared move cards and battle commands/feedback.
- [x] Add failing Party/Mart/TM transactions tests; implement Adventure-owned tools and safe learning/purchases.
- [x] Refactor Wild Hunt, remove active Expedition gameplay/model interfaces, retain chain/guide/reveal/weather and reward safety. Build one hub, named journey/map/prep/results UI; move Party out of Collection.
- [x] Test integration/migration/rapid taps/leave-resume; visually inspect hub,map,sections,WildHunt,Party,Moves,TMCase,Martconfirmation,battle,Gym,result,recovery at360×780,412×915,360×640,768×1024. Audit copy and mobile/reduced-motion behavior.
- [x] Update balance simulator and architecture notes; run targeted/full inventories with baseline comparison, syntax/offline audits and independent review.
- [x] Release0.40.0/4000 with original signer; package final source; re-extract ZIP and rerun targeted/release/syntax checks before delivering APK/source/report/screenshots/hashes.

Review focus: migration never grants old clear rewards; one-time chapter rewards remain claimed after defeat; confirmations revalidate mutable save/ownership; high-level owned partners never lose permanent levels; leave/background never abandons journey or commits stale imported state.
