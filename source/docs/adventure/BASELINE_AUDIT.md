# Adventure baseline audit

Audited `bc92ac9` (LuckyDex v0.22.3). All line numbers below refer to **baseline** `app/src/main/assets/app-v0167.js` unless another file is named. This document records contracts for the v0.23.0 replacement; it does not prescribe the old UI.

## Destinations and encounter contracts

Keep the persistent zone IDs. `ZONES` (35–41), `EXPEDITIONS` (42–48), `LOCAL_ZONE_POOLS` (53–59):

| ID | Rank | Wild levels | Types | Clear coins / Trainer XP | Boss |
|---|---:|---|---|---|---|
| meadow | 1 | 2–8 | grass, normal, bug, fairy | 500 / 300 | Pinsir #127 |
| cave | 3 | 6–14 | rock, ground, dark, poison, steel | 750 / 450 | Aerodactyl #142 |
| haunted | 5 | 10–20 | ghost, psychic, dark, poison | 950 / 600 | Gengar #94 |
| coast | 6 | 10–20 | water, ice, flying | 1100 / 700 | Lapras #131 |
| volcano | 10 | 16–28 | fire, rock, ground, dragon | 1500 / 900 | Charizard #6 |

- `MAX_DEX_ID=1025`, nine `GENERATIONS`, `LEGENDARIES`, `MYTHICAL`, and `RARE_WILD` are shared classification metadata, not obsolete Adventure UI (12–35).
- `loadZonePool` (323–342) returns immediately from memory, cached `luckyDexZonePool:<zone>:v2` (requires >20 rows), or local `{id,name}` seeds. Local seed counts: meadow 20; others 18. It refreshes asynchronously from the union of the zone's PokeAPI types, deduplicates IDs, limits to 1–1025, and accepts live pools with >=20 rows. Offline fallback must remain usable. Existing local pools contain multiple generations; the network pool spans all nine.
- `chooseSpeciesForZone` (343–353): random tier rolls legendary at 1/400, otherwise rare at 1/20; normal excludes both sets, rare excludes legendary. Empty legendary/rare pools fall back to global species of that tier; normal falls back to nonlegendary zone entries. Numeric forced ID bypasses pooling and derives tier from sets. Candidate selection is uniform. Tier and species are separate concepts.
- `spawnWildBattle` (364–371) independently rolls shiny at `floor(random * effectiveShinyOdds())===0`; wild level is uniform inclusive zone range plus bonus, clamped 2–50. Old rare/trainer bonuses +2, boss +6. Boss has ordinary HP, no special mechanic, and is catchable in the old engine. Trainer uses a rare opponent, cannot be caught, and receives `trainerReward=140+currentRank()*20`.
- `effectiveShinyOdds` (242): `max(64, round((settings.shinyOdds||2048)/(1+floor(shinyCharmFragments/3)*.34)))`. Keep settings/charm compatibility; field-chain bonuses should be modest.
- Encounter commit increments `stats.encounters`, `stats.zonesExplored[zone]`; ID 41 increments `zubatStreak` and max streak, any other resets streak (367).

## Shared combat and catch contracts

Preserve shared `loadPokemonMeta`, `ensurePokemonBuild`, `combatStats`, `xpNeeded`, `grantPokemonXp`, `typeEffectiveness`, `damageRoll` (297–321), also used by Collection's Pokémon detail dialog (525). `STARTER_META`, `TYPE_MOVE`, `SUPER`, `WEAK`, `IMMUNE` support these.

- `combatStats(p,L)`, all rounded: HP=`base.hp*.55+L*4+18`; attack=`base.attack*.28+L*2.1+8`; defense=`base.defense*.28+L*2+8`; speed=`base.speed*.22+L*1.6+6`. Missing base stats fall back to 60 each. Speed is calculated but old turn order does not use it.
- `damageRoll`: `max(1,round(power*(attack/max(1,defense))*.44*(.86+random*.22)*effectiveness))`. Effectiveness multiplies across defending types (2/.5/0). Old damage floors to 1 even at type immunity; preserve deliberately or document a refined rule.
- Quick Hit: normal, power 24, accuracy 1. Type attack: first player type, power 38, accuracy .9. Opponent always responds with first type, power 26, no accuracy roll (387–395). Player acts first. No STAB or critical hits.
- Potion: consumes one, heals `max(10,round(maxHP*.38))` capped at max, then opponent turn. Full-HP use is rejected. Berry: consumes one, `berryBoost=min(2,berryBoost*1.4)`, no opponent turn; failed catch resets boost to 1. Ball consumes one and increments `stats.ballsThrown` before outcome; failed catch increments `stats.failedCatches`, then opponent turn (396–401).
- `captureChance` (385): base `.12+(1-hp/maxHP)*.62`; multiply rare tier `.72`, legendary `.28`, mythical `.75`, ball modifier (1/1.5/2), berry boost; clamp `.025–.95`. **Baseline bug:** rare check uses `w.tier`, but `spawnWildBattle` stores tier at `battle.tier`, so the rare multiplier is not actually applied. Treat changing this as a deliberate balance correction.
- Expedition switch consumes a turn; preferred lead and per-member HP carry across rooms. A fainted lead automatically swaps to another living team member; all fainted ends run. Wild loss/run ends that encounter without charging any extra penalty. HP outside expeditions starts full for each encounter. `getAliveTeamKey` (372), switch (381), opponent turn (391–395).
- Pokémon XP requirement `80+L*30`, cap level 50; consume thresholds iteratively. Victory grants current player `30+wildLevel*4` XP. Duplicate catch grants existing entry `50+wildLevel*4` XP. Catch also takes `max(existingLevel,wildLevel)` before applying duplicate XP (317–321, 402–408).

## Economy and retained loot

- Victory (408): `12+level*2` coins, plus trainerReward if trainer; Trainer XP `20+level*2+(trainer?40:0)`; increment `stats.battlesWon` and daily `battlesWon`. Capture is not a battle win in baseline.
- Capture (402–406): `20+level*2` coins; Trainer XP `50+(newSpecies?100:0)+(shiny?500:0)+(legendary?300:0)`. New species means no normal **or shiny** existing entry of that ID. Keep daily caught/ghostCaught/greatCatches hooks.
- Every expedition clear (435): table coins/XP, +3 Poké Balls, +2 Berries, +1 Potion; increment `stats.adventureClears`, daily `adventureClears`. First clear only: set `profile.firstClears[zone]=true`, +1 Pack Ticket. Preserve those exact existing IDs and never grant first-clear twice.
- Old routes each have seven rooms, one cache, one rest, one trainer, one rare, one boss; meadow has two ordinary wild battles/no event, others one ordinary battle/one event. Route rewards above are final reward, separate from room rewards.
- Cache (433): +2 best rank-available balls (Ultra rank >=7, Great >=3, otherwise Poké), +2 berries, +1 potion; heal every member +25% max HP, cap max; `foundItems+=5`.
- Rest: +50% max HP to each member, cap max. Event probabilities: 42% +120–300 inclusive coins; 34% +2 potions/+2 berries; 24% +20% max team HP. Healing can revive a fainted member because it adds HP to zero.
- Retreat (436): refuse mid-action, confirm, increment `stats.expeditionRetreats`, end active run/battle. Keep all already committed catches, items, coins and XP; forfeit final clear rewards. All-fainted failure also keeps committed rewards. Old `lootCoins` counts only event coins (not catch/victory coins), so use a fuller ledger for the requested completion/retreat summary without re-granting balances.
- Poké Mart (533–534): 5 Poké Balls/100 coins/rank1; 3 Great/180/rank3; 2 Ultra/240/rank7; 5 Berries/120/rank1; 3 Potions/180/rank1. No baseline inventory capacity limit. Rank lock is enforced by rendered disabled button, not `buySupply` itself.
- `addTrainerXp` (277–281): Trainer rank=`min(50,1+floor(XP/400))`; crossed ranks each award 150 coins once using `profile.rankRewards`; each crossed multiple of 5 awards a ticket. Do not bypass this for Adventure rewards.
- `checkDexMilestones` (505): per generation unique species, 25%/50%/100% -> 250/600/1500 coins, full -> one ticket. Claimed key `g<generation>:<fraction>` in `claimedMilestones.dex`.
- Preserve related achievements (104–116): first/five shinies, Ghost count, complete Kanto, haunted visit/clear, Zubat streak, failed catches. `visitedLocations.haunted` marks **expedition start**, not wild visit in baseline.

## Save and collection preservation checklist

- [ ] Continue `luckyDexSave`; preserve all unrelated root fields (`loadState` uses `...base,...raw`, 153–198). Do not reset Cards/Trade/Arcade or existing coins, XP, tickets, dust, daily state, milestone claims, achievement claims, rank rewards, charm fragments.
- [ ] Preserve `settings.zone`, `settings.ball`, shinyOdds/vibration; zone IDs and `profile.firstClears` remain stable.
- [ ] Keep collection keys `<dexId>:n` / `<dexId>:s`, e.g. `25:n`, `25:s`; they are also team keys. Normal and shiny stacks are separate; species uniqueness deduplicates ID.
- [ ] New catch entry shape: `{id,name,shiny,count,firstSeen,generation,level,xp,types,baseStats,lastZone}`; increment stack count; retain existing firstSeen and name, raise level as above, update metadata/lastZone. Auto-add to team only when absent and team length <3.
- [ ] Increment catches/shinies once per captured individual, not once per new entry; keep `recentPokemon` entries `{id,name,shiny,zone,ts}` newest first, limit 12.
- [ ] Shiny/legendary capture pushes rareHits `{type:'pokemon',name,odds,ts}`, newest first, limit 50. Baseline odds records inverse **capture chance**, not actual encounter rarity; avoid silently changing legacy meaning.
- [ ] Call `bumpDaily('caught')`, conditional `ghostCaught`, conditional `greatCatches`, milestones, `addTrainerXp`, then `save` on catch. Call battle/clear hooks on their outcomes.
- [ ] Preserve offline starter commit (414–426): four choices #1/#4/#7/#25; entry at level5, team one member, +250 coins/+10 Poké Balls; immediate save before network. Starter does not increment catch stats or daily catches in baseline.
- [ ] Save new active route/seed, selected node, HP map, lead, perk choices, pending battle/outcome/room award status explicitly under state. **Baseline has no resumable expedition:** `battle`, `expedition`, `actionLocked`, `continueHandler` are lexical globals only (137–140); `save` serializes `state` (203–209). Persist room/turn transactions so reloading cannot duplicate loot, first-clear, item consumption or reroll a resolved room. Clear the active run atomically with final award/retreat/failure.
- [ ] DefaultState/saveVersion currently 6 (114–123,195,204); old export is whole state (535), import accepts raw object and reloads (537–550). Added root data survives current spread migration, but new defaults need nested merging/validation and reset must clear new state.
- [ ] Derive seeded caught-species mastery from existing entries/lastZone only where justified; baseline has no per-area unique seen/rare/shiny/clear-count arrays. `zonesExplored` records encounter totals; firstClears records boolean. Do not invent historical seen counts.

## Remove the old owner completely; keep shared utilities

Exact baseline sections to replace/remove, including later duplicates:

| Lines | Owner / action |
|---|---|
| 135–140 | `currentZone`, `adventureMode`, `battle`, `actionLocked`, `expedition`, `continueHandler`. Remove battle/run globals and stale guards; selected zone may remain shared or migrate into Core. `zonePools` (130) is reusable metadata cache. |
| 354–412 | Old Wild rendering/controller: renderZones/selectZone/updateSearchCard/startSearch/spawnWildBattle/getAliveTeamKey/renderBattle/renderBattleTeamStrip/switchBattlePokemon/setHpBar/battleMessage/triggerBattleSparkles/captureChance/updateCaptureChance/playerAttack/wildTurn/useBattleBerry/useBattlePotion/throwBattleBall/captureCurrentWild/finishWildBattle/setBattleContinue/resetWildBattle/runBattle. Move required gameplay contracts into the one new owner. |
| 427–437 | Old setAdventureMode, roomIcon, all expedition rendering/room/reward/retreat/failure functions. |
| 1043–1047 | renderAdventurePartyMini: replace/redirect its renderer; invoked by shared global HUD and starter hydration. |
| 1064–1080 | Later showAdventureHub/setAdventureMode duplicate owner. |
| 1081–1094 | **Keep shared navigate** and Cards/Trade/Arcade branches; replace its battle/expedition lock (1082) and Adventure entry (1088) with Core hooks. Do not remove navigate. |
| 1095–1099 | Later selectZone duplicate. |
| 1102–1129 | Later startExpedition duplicate; finishExpeditionUiV5; completeExpeditionV4/retreatExpeditionV4/failExpeditionV4 captured-function aliases and assignments; installScreenObserversV5 MutationObservers controlling old body classes. Remove all of them. |
| 1200–1220 | handleAdventureBackV5; Adventure branches of window.handleLuckyBack (1205–1208); wireV5 Adventure/title entry/back/bag hooks. Keep generic dialog/pack/Arcade back and starter/title behavior. |

Shared functions to retain: species initialization and Pokémon metadata builds (286–316), combat/XP formulas (317–321), generation/rank/ownership/shiny utilities (235–242), save/daily/XP/coin utilities, metadata constants, starter grant/title partners, helperAbility (439), milestones/achievements, collection/team/modal renderers, profile, supply shop, export/import. `renderStarter` is declared twice (413,1048); keep one intentional title-aware declaration. `renderGlobalHud` is declared twice (268,1056); keep shared owner, update Adventure call once.

## Wiring / DOM inventory and safe bridges

- Parse-time core events (553–556): old data-adventure-mode, searchBtn, battle controls, retreat/continue; remove or replace before deleting their DOM, since most handlers use unguarded getElementById. Keep shared supply dialog controls if reused.
- Shared settings/reset (561): redirect updateSearchCard and renderZones; reset clears lexical battle/expedition today and must reset Core now. Do not retain calls into deleted screens.
- Shared boot (564–568): renderStarter/renderRecent/renderZones; background loadZonePool(currentZone); species hydration callback. Redirect Adventure boot, preserve starter/collection/profile and independent pack loading. `hydrateOwnedPokemonMeta()` is **called but not defined anywhere in baseline assets**; callback rejection is swallowed. Do not rely on that call for Core metadata readiness.
- Startup (1492–1510): startLuckyDexV0158 performs artwork migration, asynchronously invokes bootLuckyDexV0158, then invokes wireV5. New Core script/module must be available before any redirected hooks; index loads core at 428, then Trade/Arcade, and arcade-world last (442).
- Shared HUD (1056–1063) calls renderAdventurePartyMini; starter grant/hydration (423–424) calls renderAdventurePartyMini/showAdventureHub; title continue and wire initialisation (1214,1219) call showAdventureHub. Either edit call sites to `window.LuckyDexAdventure` or retain tiny guarded global bridges (render map/open, render party, settings refresh, reset). They must not recreate legacy globals or control removed DOM.
- Nav click binding is shared at 284. `navigate('adventure')` must resume the active persisted scene rather than blindly resetting to map; navigation lock should reflect Core's actual atomic action/run policy, not dead lexical state.
- Old index Adventure DOM is 61–150; starter panel 34–44 is shared. Obsolete IDs: adventureHub, adventurePartyMini, huntMode/huntHeading/openSupplyShopHunt, zoneStrip, searchCard/searchZonePill/encounterOdds/searchVisual/zoneMark/searchRustle/searchTitle/searchCopy/searchBtn, expeditionMode/expeditionList/expeditionProgress; all battleArena descendants (`battleContextPill/Copy`, battlefield, wildName/Level/Sprite/HpText/HpBar, playerName/Level/Sprite/HpText/HpBar, battleSparkles/Message/TeamStrip/Actions, quickMoveBtn/typeMoveBtn/battleBerryBtn/Count/battlePotionBtn/Count/battleBallSelect/Btn/captureChanceLabel, battleRunBtn/expeditionRetreatBtn/battleContinueBtn/battleBallAnim), recentPanel/recentPokemon. Retain or redirect renderRecent (529) if its DOM is removed.
- Old dynamic handlers/data attrs: data-zone, data-expedition, data-exp-lead, data-switch-key, data-room, expeditionRetreatMapBtn, data-adventure-mode/back. Body classes battle-open/expedition-active and old CSS overlays need replacing alongside DOM; remove observers rather than letting them watch detached screens.
- Profile (532) and recent renderer (529) consume ZONES directly, so keep compatible ZONES metadata even after replacing menus. Profile's rank unlock text can be refined to destination names.

## Public shared hooks outside Adventure

Verified search of all packaged JS and native source:

- `window.state` getter (127), `window.API` (128), `save`, `titleCase`, `showToast`, `awardArcadeCoins` are consumed by Arcade platform/world and assorted games. `arcade-platform.js` 40–66 uses root/globalThis state, awardArcadeCoins, save, showToast; 72–99 uses titleCase and Pokémon id/name/shiny. Preserve these globals and Pokémon collection shape.
- `berry-blender.js` 36/50 calls shared helperAbility on state.pokemon[state.team[0]]. Collection modal also calls it. Do not delete helperAbility with Adventure code.
- `arcade-world.js` 58–69 captures `previousBack=window.handleLuckyBack`, installs an outer wrapper, and calls shared navigate('adventure'). Supply the Core-aware base back handler **before** arcade-world loads; do not overwrite its wrapper later. Wrapper handles Trade overlay/Arcade/non-Adventure page back before delegating to base.
- Native `MainActivity.java` 411 invokes `window.handleLuckyBack()` and expects a boolean. It must remain public and synchronous in its consumption signal. Lifecycle (425) suspends Arcade only; Core should register its own save-safe visibility/pagehide handling if needed.
- `trade-v0163.js` 618–619 calls checkCardMilestones/save; its remaining hooks are Card/API/artwork utilities, with no Adventure battle/pool dependency. Retain shared navigate enter/leave branches.
- `binder-controls.js` 7 saves Card UI state. Quiz/Unown call save/awardArcadeCoins. No other packaged JS calls old Adventure functions, combatStats, chooseSpeciesForZone or loadZonePool directly.

One new Adventure owner plus explicit bridges is sufficient. Verify absence of old declarations/aliases/unguarded DOM handlers, then verify offline starter, catches/rewards, old save import, route restart without rerolls or duplicated awards, retreat, clear, Back, Cards/Collection/Trade/Packs/Arcade navigation.

