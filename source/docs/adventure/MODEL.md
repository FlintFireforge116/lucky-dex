# Adventure model integration

`app/src/main/assets/adventure/adventure-model.js` is a synchronous pure module. It exports the same API as `window.LuckyDexAdventureModel` and CommonJS `require(...)`. It reads no storage, creates no timers or DOM, calls no core helpers, and never alters global cash, Trainer XP, inventory, Pokémon or legacy statistics. Mutations below affect only their passed model objects.

## Definitions

`DESTINATIONS` is an object keyed by the five **legacy zone IDs**, with rows `{id,name,expeditionName,rank,minLevel,maxLevel,levels:[min,max],clearCoins,clearXp,bossId,bossName}`.

| Key | Rank | Levels | Clear coins / Trainer XP | Boss |
| --- | ---: | --- | --- | --- |
| meadow | 1 | 2–8 | 500 / 300 | Pinsir, 127 |
| cave | 3 | 6–14 | 750 / 450 | Aerodactyl, 142 |
| haunted | 5 | 10–20 | 950 / 600 | Gengar, 94 |
| coast | 6 | 10–20 | 1100 / 700 | Lapras, 131 |
| volcano | 10 | 16–28 | 1500 / 900 | Charizard, 6 |

`NODE_TYPES` is an array: `start,wild,rare,trainer,elite,cache,mystery,event,camp,hazard,discovery,boss`.

`EVENTS` is an object keyed destination, each containing six unique definitions `{id,title,text,choices}`. Each choice is `{id,label,outcome?,risk?,requires?}`. IDs are `safe`, `risk` and `capability`. Safe always works without party capability or supplies. Risk has `{chance,success,failure}` with deterministic effects. `requires.types` is an array of acceptable types (any one suffices); `requires.item` and `requires.amount` require inventory. `choiceAvailable(choice,{party,inventory,hpFraction?})` checks all declared requirements. Party rows use `types:['water',...]`; PokeAPI type objects are also understood for capability checks.

There are six bespoke events per destination: fallen tree, lost catcher, berry grove, Beedrill nest, strange tracks, old Ball cache; fossil wall, shifting passage, Clefairy gathering, spring, hiker camp, mineral seam; flickering corridor, rattling cabinet, lost spirit, sealed room, mirror, medicine cabinet; current, cracked ice, frozen supplies, submerged tunnel, resting Lapras, ice bridge; lava vent, unstable rock, research station, exhaustion, Fire nest, ash cache.

`PERKS` is an object keyed `compass,potionBelt,luckyCharm,berrySatchel,quickClaw,fieldMedic,collectorsEye`. Rows include `id,name,description,item` plus numeric effects: `revealExtra:1`, `potionMultiplier:1.15`, `rareBoost:0.02`, `berryBoost:0.05`, `firstAttackMultiplier:1.15`, `campHealBonus:0.15`, `cacheExtra:1` respectively. Effects are implemented by the controller/battle owner. Quick Claw matches the battle engine's 15% opening attack bonus. Berry Satchel's battle implementation uses a 1.55 Berry multiplier rather than the ordinary 1.4, capped at 2.2 rather than 2. Perks are run-only.

## Route and run

`generateRoute(seed,destination)` accepts a finite number or string seed and a destination ID (or definition row). Unknown destinations use meadow; missing/invalid seeds use zero. It returns `{seed,nodes}`. The source seed is retained, and each node is `{id,depth,lane,type,seed,links,content}`. Node seeds are unsigned 32-bit integers. Contents, cache supplies, perk offers and event IDs are generated once alongside the route. Identical seed/destination produces an identical serializable result.

Eight depth layers are fully connected to the following layer. Start is depth 0; the mandatory wild opening is depth 1; depths 2/3 and 5/6 hold two or three distinct choices; depth 4 is a camp cut layer; boss is depth 7. No node is disconnected. Every full path plays seven nodes and crosses camp. Elites occur only in the optional pre-boss layer, preventing elite chains. A rare den is considered in 38% of generation rolls and may be omitted or bypassed; many routes contain no rare node.

Content by node type:

- `cache`: `{coins:18..36,xp:8,items:{[item]:1},perkIds:[id,id]}`.
- `camp`: `{healFraction:0.35}`; root adds Field Medic bonus and handles a once-only camp-rest flag.
- `event,mystery,hazard,discovery`: `{eventId}`.
- `wild`: `{levelBonus:0}`; `rare`: `{rareBoost:0.16,levelBonus:1}`.
- `trainer`: `{levelBonus:1,coins:35,xp:22}`; `elite`: `{levelBonus:2,coins:55,xp:34}`.
- `boss`: `{enemyId,levelBonus:3,boss:true}`. Actual party-scaled boss level/modifier is the battle/controller responsibility.

`createRun(destination,seed,party)` accepts party rows `{key,id,name,level,types,maxHp}`. It snapshots and retains additional row metadata, normalizes fields and discards duplicate/missing keys. `key` is a string. The returned run contains:

```js
{
  id, destination, seed,
  rng: {algorithm:'xorshift32',seed:uint32,state:uint32},
  route: {seed,nodes}, currentNode:'start',
  completed:[], revealed:['start','d1l0','boss'], phase:'route',
  party:[/* snapshot */], partyKeys:[], hpByKey:{}, leadKey,
  loot:{coins:0,xp:0,catches:[],items:{},rare:0,rooms:0,battles:0},
  perks:[], pending:null, battle:null, claimed:false,
  resolutions:{}, perkOffer:null, perkOfferSequence:0
}
```

`rng` retains a source seed and serializable xorshift32 state for runtime random draws; the model's generated contents and event results use derived node seeds and do not consume this cursor. If runtime advances it, save the unsigned updated state in the same transaction as the result. Node IDs are `start`, `boss`, or `d{depth}l{lane}`. `run.id` is deterministic for destination/seed; root should create fresh seeds when starting a new run.

`availableNodes(run)` returns connected next nodes when phase is `route`, no pending node exists, and the run is unclaimed. Completed nodes never reappear. `enterNode(run,id)` returns boolean; on success it changes `currentNode`, sets `pending:{nodeId,type}`, sets phase to `battle`, `camp`, `cache` or `event`, and reveals immediate onward links. Repeated/nonconnected entry returns false.

`completeNode(run,id)` returns boolean and commits the current pending node exactly once. It appends the ID to `completed`, increments `loot.rooms`, clears pending/battle, and returns to `route` or `complete` for boss. Root must resolve that room's rewards/HP/battle first; completion deliberately does not require a particular reward implementation or make global effects. Battle counters belong to the controller's victory transaction. Party membership remains the snapshot; root can change only lead and HP during a run.

## Events and transaction boundary

`eventFor(run,node)` returns the stored destination event definition, or a deterministic node-seed fallback for nodes without an event ID. An unknown explicit event ID returns null.

`resolveEvent(run,nodeId,choiceId,ctx)` requires the matching current pending event node, an available valid choice and an unclaimed/unresolved run. Success returns `{applied:true,outcome}` and stores `run.resolutions[nodeId]={eventId,choiceId,outcome}` **before returning**. Subsequent attempts, including after JSON reload or choosing another option, return `{applied:false,outcome:null}`. The stored outcome allows the UI to describe the committed decision; it is not a second reward to apply on resume.

Outcomes contain only applicable fields `{coins,xp,items,healFraction,damageFraction,battle:{enemyId,levelBonus}?,revealExtra?,nextBattleBonus?,rareBoost?}`. `xp` is Trainer XP. Positive item values award supplies; negative values consume them. Capability inventory checks do not mutate ctx. Event coins are at most 48, XP at most 36, typical damage 5–9% maximum HP, healing at most 25%, and rare boosts add at most two percentage points. Risk failures may request an ordinary battle. No shiny-odds boost is present.

**Root transaction:** call resolve, return on `!applied`, apply every returned cash/XP/inventory/HP/reveal/modifier effect, update loot as appropriate, start a requested battle or complete the room, and save **once synchronously after all effects**. Do not save the resolution flag before its effects, defer effects to animation callbacks, or reapply a stored outcome on resume. The model cannot make global state atomic by itself; root's save/action owner provides that boundary.

Final clear transaction: root checks phase `complete` and `!claimed`, marks `claimed=true`, updates `profile.firstClears[run.destination]` for the legacy first-clear ticket guard, applies the destination's unchanged final clear rewards and existing supplies (3 Balls, 2 Berries, 1 Potion), increments legacy/destination clear stats and `record.boss`, then saves before cosmetics. Model migration never imports or modifies legacy first-clear flags. Retreat preserves already committed rewards and forfeits final clear rewards.

## Perk offer transaction

`offerPerk(run,ids)` validates IDs, removes duplicates/already-owned perks and returns `{applied:true,offer}` with `run.perkOffer={id,ids,resolved:false}`. An unresolved offer prevents a second offer from overwriting it (`{applied:false,reason:'offer-pending'}`). No available new IDs returns `{applied:false,reason:'no-new-perks'}`. Root guards each cache's reward/offer creation once and saves the offer with the cache reward.

`keepPerk(run,id,replaceId?)` returns `{applied:true,perk}` and marks the offer resolved with `kept` (and `replaced` when supplied). Capacity is three. When full, omitting replacement returns `{applied:false,requiresReplacement:true,reason:'capacity'}` without mutation. Missing replacement returns `invalid-replacement`; an ID not offered, duplicate owned perk, resolved offer or claimed run returns `invalid-offer`. Save success before rendering. On reload, show an unresolved `perkOffer`; never generate a replacement offer. To skip deliberately, root sets `perkOffer.resolved=true` with a `skipped` flag in its single transaction.

## Additive saves and field records

`ensureState(save)` returns `save.adventureV2`, defaults schema 1, creates destination records and last destination, and normalizes active states. It leaves all legacy keys, unknown root/v2/destination/run/party metadata and existing schema versions intact. Valid run JSON round trips without changes. Invalid outer run/roam values become null; a route that cannot be safely resumed (bad connectivity/IDs/depth) becomes null rather than silently regenerating and rerolling. Malformed nested HP/party/loot/phase/perks values are repaired additively; discarded invalid pending nodes return to route. Roam objects require a valid destination, normalize nonnegative chain and hotspot array, and otherwise retain controller fields.

Destination records default to `{encounters:0,seen:{},caught:{},rare:{},shiny:0,clears:0,boss:false}`. Species map values are occurrence counts, keyed numeric species IDs. `recordEncounter(v2,destination,{id,rare?,shiny?,isShiny?})` increments encounters/seen and optional rare/shiny counters. `recordCatch(...)` increments caught only; it does not invent another encounter. Invalid species IDs return false. Both return the updated record on success. Root calls each once in its committed encounter/capture action and owns clear/boss updates.

`mastery(record)` returns 0–5 from five cosmetic milestones: any encounter; five seen species; three caught species; any rare species or shiny; a clear or defeated boss. It does not gate play or alter odds.

## Verification and rulings

`node tests/adventure-model.test.cjs` exercises 1,000 seeds per destination (5,000 total), every path's camp/boss reachability, all nodes' connectivity/contents, deterministic full structure, 2/3-way choices, no duplicate IDs/elite chains, optional rare absence, exactly-once event effects, all 30 event risk rolls/capabilities, perk replacement/reload, retained party HP/loot/RNG metadata, malformed save recovery and field mastery.

`tests/adventure-core.test.cjs` checks the shared core bridge, additive legacy save fields, supply dialog/Back, normal Collection/Packs/Profile/Trade/Arcade/Adventure navigation, and removal of the old Search DOM. `tests/adventure-persistence.test.cjs` drives saved fixtures through the real controller/UI: gated event coin/item rewards and reload; once-only camp rest/Potion; cache reward/offer persistence and three-perk replacement; battle Potion state saved before animation and exact HP/RNG/action reload; terminal victory/capture rewards/counters once; final clear/first ticket once; and retained loot/catches on retreat without final clear rewards.

Core/index load model, species, assets, battle and `adventure-controller.js` before core startup, mount `#adventureRoot`, and expose `LuckyDexAdventureBridge`. The old battle/expedition globals, route array, Search/battle/expedition DOM, duplicate render/controller declarations, captured-function aliases and MutationObservers were extracted. Tiny shared starter/HUD/settings redirects call the one controller. Shared Pokémon metadata/combat/XP, starter grants, Arcade helper, profile, shop and unrelated navigation remain in core. Core load/reset adds Adventure state through `ensureState`; legacy save key/version and first-clear identifiers are retained.

Ruling: use one camp cut layer at depth four rather than probabilistic healing nodes — every selected path gets support; cost is less variation in camp placement. Ruling: connect every node to each node of the next layer — all nodes are reachable and choices compare distinct room types; cost is denser route connectors. Ruling: return event effects without applying run HP/loot or global economy — root's one synchronous transaction covers flags plus effects; cost is that integration must honor the documented save boundary. Ruling: unsafe persisted routes become null instead of regenerating — prevents resume rerolls; cost is loss of a corrupt active route, while all already committed save rewards remain untouched.
