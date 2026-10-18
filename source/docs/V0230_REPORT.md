# LuckyDex v0.23.0 — Adventure 2.0

Delivered from the supplied v0.22.3 source (baseline `bc92ac9`, source SHA-256 `5415bd0a023b928fcd362197a6bd92b4a37cce1e6d8bcd8812f5756f66dd4338`). Android application ID remains `com.example.luckydex`; version name/code are `0.23.0` / `230`.

## Architecture and extraction

Adventure now opens on a connected local Kanto map. Each destination offers ROAM and EXPEDITION within its environment. `adventure-controller.js` owns scene navigation, delegated interaction, saving, reward transactions and animation resources. `adventure-model.js` owns deterministic routes/events/perks; `adventure-battle.js` owns serializable combat and scoped rendering. Asset and species modules provide synchronous offline data.

The old Search card, independent Wild/Expedition menus, fixed seven-room arrays, old battle DOM and event handlers, duplicate Adventure declarations, captured-function overrides and MutationObservers have been removed. Core retains small redirects for shared starter/HUD callers and exposes `LuckyDexAdventureBridge`. Shared Collection, Cards, Trade, Packs, supply shop, achievements, daily tasks, rank rewards, Pokémon metadata helpers and Arcade remain in their existing owners. Native edits only add Adventure pause/resume calls; inset handling, file origin and Arcade lifecycle calls remain intact. Extraction details: `adventure/CORE_EXTRACTION.md`.

## Saves and transactions

`luckyDexSave`, saveVersion 6, collection keys, inventory and existing fields remain compatible. Additive `adventureV2` stores destination records, active Roam, active Expedition and last run summary. Unknown save fields survive normalization. Existing `lastZone` catches and legacy first-clear flags seed only known historical progress; historical seen/rare counts are not invented.

Runs persist the generated seed/route, current and completed nodes, selected event/outcome, offer/replacement flags, snapshotted party, HP, lead, perks, loot and full battle RNG/turn/action/result state. Every meaningful mutation saves synchronously before cosmetic waits. Terminal rewards, event effects, camp rest, cache offers and final-clear tickets have stored once-only guards. Imports are safe: pagehide cancels resources without rewriting localStorage over an incoming save. Reload resumes the exact pending scene, battle or boss approach.

## Destinations and local art

| Destination | Rank | Wild levels | Scene source | Final coins / Trainer XP | Guardian |
|---|---:|---|---|---|---|
| Viridian Wilds / Trail | 1 | 2–8 | FireRed Viridian Forest | 500 / 300 | Pinsir |
| Mt. Moon | 3 | 6–14 | FireRed Mt. Moon 1F | 750 / 450 | Aerodactyl |
| Lavender | 5 | 10–20 | FireRed Pokémon Tower 5F | 950 / 600 | Gengar |
| Seafoam Islands | 6 | 10–20 | FireRed Seafoam B4F | 1100 / 700 | Lapras |
| Cinnabar Crater | 10 | 16–28 | FireRed Mt. Ember summit | 1500 / 900 | Charizard |

The fictional Cinnabar crater deliberately adapts authentic Mt. Ember geometry. The map is a portrait composition of original Kanto map pixels. Each location has a portrait scene, battle terrain and guardian camera. Trainers, objects, effects, landmarks and 386 normal/shiny Gen III back sprites are local. Later species use the existing local front sprites. The bundle adds 829 PNGs, 1,150,382 bytes, plus offline types/stats/names for all 1,025 species. Per-file hashes, source URLs, original game and adaptation notes are in `ADVENTURE_ASSET_SOURCES.md` and the packaged manifests; metadata CSV snapshots are in the source ZIP. No essential runtime remote image or metadata request is used.

## Wild Roam

Roam generates three interactive hotspots, then staggers arrivals up to five. Consumed slots are replenished in non-overlapping positions. Ordinary, agitated and glint clues offer imperfect rarity/strength information. Triggering stores either an item discovery or a fully resolved Pokémon; ENGAGE and LEAVE IT return naturally to the same habitat. Shiny reveals use clear sparkles, banner and local shiny sprite. Field Chain grows after wins/captures, adding at most two rare percentage points, a small item bonus and occasional +1 level. It does not alter shiny odds and ends on leaving the destination. Item and encounter random streams are separate, preserving reachable legendary rolls.

| Area | Contextual cues |
|---|---|
| Viridian | Rustling grass, shaking bush, falling leaves, tree shadow, fresh tracks |
| Mt. Moon | Cave shadow, moving rocks, drifting dust, crystal glint, ceiling movement |
| Lavender | Drifting wisp, moving curtain, rattling cabinet, purple glow, strange tracks |
| Seafoam | Water ripple, rising bubbles, moving shadow, cracked ice, quiet splash |
| Cinnabar | Ember trail, moving rocks, smoke puff, lava ripple, heat shimmer |

Field Guides track encounters, seen/caught/rare species, shinies, clears and guardian status. Five mastery markers recognize progress without gating play or adding currency.

## Branching Expeditions

Seeded generation builds eight depth layers: trailhead, mandatory opening Wild, two/three-choice layers, guaranteed Camp at depth four, further branches and a reachable final Boss at depth seven. Adjacent layers connect visually. Each full path plays seven rooms. Elites only occur in the optional penultimate layer; rare dens are optional and many runs omit them. Immediate options are lit, distant nodes partly obscured, and the guardian stays visible. Opening combat prevents free cache restart farming.

Node types: Trailhead, Wild Encounter, Rare Den, Trainer, Elite Trainer, Supply Cache, Mystery, Event, Camp, Hazard, Discovery and Boss. Caches give modest supplies/coins and two possible perks. Events offer safe, risk and capability choices; risk outcomes are seeded and saved. Living party types and required inventory affect options.

Thirty bespoke events are implemented, six per location:

- Viridian: fallen tree, lost Bug Catcher, berry grove, Beedrill nest, strange tracks, old Ball cache.
- Mt. Moon: fossil wall, shifting passage, Clefairy gathering, hidden spring, Hiker camp, mineral seam.
- Lavender: flickering corridor, rattling cabinet, lost spirit, sealed room, strange mirror, medicine cabinet.
- Seafoam: strong current, cracked ice, frozen supplies, submerged passage, resting Lapras, ice bridge.
- Cinnabar: lava vent, unstable rock, research equipment, heat exhaustion, Fire nest, ash cache.

Camp displays the three partners and HP, lead selection, once-only rest, Potion use, perks and onward route. Run party membership stays snapshotted even if Collection team choices change during a paused run.

| Run perk | Effect |
|---|---|
| Explorer's Compass | Reveals one extra future node |
| Potion Belt | Potion healing ×1.15 |
| Lucky Charm | Rare chance +2 percentage points |
| Berry Satchel | Berry catch multiplier 1.55, cap 2.2 |
| Quick Claw | First attempted attack ×1.15 |
| Field Medic | Camp rest gains +15% maximum HP |
| Collector's Eye | Caches gain one extra Berry |

Three perks fit in a run. Further offers require explicit replacement or skipping; choices survive reload. Perks disappear when the run ends.

## Combat and economy

Battle uses dedicated terrain, opponent/player entrances, trainer introductions, HP tween, lunge/recoil, effect particles, faint/switch, ball throw/shakes/capture burst and shiny sparkle. The command console retains Quick Hit, type move, Bag, Switch and return/retreat. Input locks only during finite cosmetics; Back cancels cosmetics while retaining committed gameplay.

Guardians use party-scaled levels and +30% HP, plus one mechanic: Pinsir +20% attack below 40% HP; Aerodactyl one opening advantage; Gengar first-hit veil; Lapras one 20% restorative tide below half HP; Charizard Fire damage ×1.2 for both sides. Boss approach, fight and result use distinct presentation.

Baseline attack powers, accuracy, XP formulas, item consumption, Potion response turn, ball multipliers, shiny/legendary base odds and meaningful clear rewards are retained. Immunity now deals zero damage; rare classification consistently applies the rare catch modifier. Elite victory adds a modest +20 coins/+12 Trainer XP over a normal trainer. Run perks and chain bonuses are temporary. Ordinary encounter level progression stays local to its destination; guardian level follows the snapshotted party. Persistent Pokémon XP/levels are awarded immediately, while the current run's party combat snapshot remains stable.

Every clear adds the table's rewards plus three Poké Balls, two Berries and one Potion. Only the first clear for each legacy zone adds a Pack Ticket. Rank and Dex milestone rewards keep their existing claim paths. Loot summaries include base Adventure rewards and any rank coin bonus triggered by them; milestones remain shared profile rewards. Retreat retains already earned catches, coins, items and XP, forfeiting final clear rewards. Legacy ball, failed-catch, battle, retreat, Zubat-streak, daily and achievement counters continue updating exactly once. No new permanent currency or grade-dependent reward exists.

## Verification and limits

Final evidence is in the supplied QA ZIP, including `full-suite.log`, `release-verification.json`, Android build/signature/metadata logs, asset verification, layout JSON, screenshots and four contact sheets.

The active suite contains 27 test programs, including 13 pure model cases across 5,000 routes, 18 battle cases, real browser migration/navigation/persistence tests, event/perk/camp/clear deduplication, duplicate touch actions, Back during animation, and 48 entry/exit cycles across reduced and normal motion. The retained Arcade/Trade/Card/Collection/Packs regressions and previous asset guards remain active. Browser file-origin smoke verifies offline pixels and localStorage. Computed CSS backgrounds are loaded as actual Images, covering all destinations and battle stages.

Screenshot QA covers Map, all destinations, Roam, encounter/shiny/item reveal, normal/trainer battle, route, event, camp, cache/perk, boss approach/battle, completion, Bag and capture at 360×800, 393×873, 412×915 and 320×640. Contact sheets and representative full-size phone images were inspected. CSS URL resolution, reveal layout, Bag labels, route option readability and hotspot overlap were repaired during QA.

One scene RAF and scope-owned finite waits are cancelled on navigation, visibility change and native pause. Reduced motion removes waits and scene motion. The independent lifecycle probe verifies zero owner callbacks after exit. Haptics use existing vibration settings. No sound was added; the experience is complete muted. These are desktop Chromium performance/lifecycle checks, not measured phone frame rates.

Android Gradle build and APK signature verification succeed. The certificate remains `069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a`. Every packaged source asset is compared byte-for-byte against the APK; source ZIP verification also excludes private signing keys. The WebView origin remains `file:///android_asset/index.html`.

No ADB device is connected. The previously attempted isolated emulator could not boot without an Android hypervisor driver, and the user confirmed no device is available. Installation, upgrade with real on-device saved data, native gesture insets/haptics and phone performance are therefore unverified. No known failing runtime/navigation case remains in the exercised browser flows. This is the build-tested delivery candidate; its native runtime limitations are explicit.

## Deliverables

- `LuckyDex-v0.23.0-debug.apk`
- `LuckyDex_v0.23.0_SOURCE.zip` and matching `LuckyDex_source.zip`
- `LuckyDex_v0.23.0_QA.zip`
- `LuckyDex_v0.23.0_SHA256.txt`

Hashes are generated after export and recorded in the SHA-256 manifest; the source ZIP contains this report and the architecture/provenance documents. Private signing keys are excluded.
