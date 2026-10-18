# Adventure 2.0 design

Binding brief: `REQUEST.md`. Baseline: v0.22.3 commit `bc92ac9`; supplied archive hash matches the delivered source. New branch: `codex/adventure-v0230`.

## Experience

A connected Gen III trail map is the Adventure hub. Five destinations retain the existing keys/ranks: meadow/Viridian Wilds (1), cave/Mt. Moon (3), haunted/Lavender (5), coast/Seafoam (6), volcano/Cinnabar (10). Map landmarks, party and mastery sit over original FRLG map pixels. Destination, Roam, Expedition and Battle share a scene-first portrait composition; normal app chrome returns at the hub/exit. Android system bars stay visible and the existing native margin-inset boundary remains primary.

The environment is genuine locally rendered game-map/battle art. One scene RAF handles inexpensive particles/parallax, with finite motion/effect jobs, reduced-motion support, and cleanup on every transition. No new audio dependency: the mode is complete muted; haptics use the existing setting/bridge. Most transitions last 220–320ms.

## Roam

Three initial contextual hotspots appear, followed by staggered arrivals up to five. Each hotspot has a consumed flag and immutable encounter/item resolution. Ordinary, agitated and glint clues influence rarity/level but never label a guaranteed rare. Shininess is rolled only on trigger using the existing effective shiny odds; reveal adds clear sparkles. Engage creates a battle; leave returns to the same habitat. Success grows a session Field Chain: capped +2 percentage points rare chance, at most +1 level occasionally, and a small item chance increase. No shiny-odds chain inflation. Leaving the destination ends the chain.

Local species/type/base-stat metadata makes encounters and party capability checks immediate offline. Existing captures/levels/XP/inventory and daily/achievement hooks remain the economy path. New destination statistics are additive and retain unknown fields. Mastery is cosmetic/status progression; it never locks core play.

## Expeditions

Eight depth layers (start + seven played nodes) replace the fixed array. A mandatory opening wild battle prevents free cache restart farming. Two/three connected choices occur in generated layers, with one guaranteed camp/support layer and a final reachable boss. Elite chains are constrained; rare nodes are optional. Node/event seeds and RNG state are stored. At least six bespoke events per location offer concise safe/risk/type-or-item capability choices.

Seven run-only perks (Compass, Potion Belt, Lucky Charm, Berry Satchel, Quick Claw, Field Medic, Collector's Eye), capacity three, use existing item artwork and require replacement choice when full. Camp shows party HP, lead selection, supplies, a once-per-camp rest, perks and onward route. Run party membership is snapshotted; only lead changes during a run.

Final clear rewards remain 500/300, 750/450, 950/600, 1100/700, 1500/900 coins/Trainer XP by destination, plus existing supplies and one first-clear ticket keyed by the legacy zone. Node loot is modest, not a new currency. Already-earned loot/catches survive retreat; final clear rewards are forfeited.

## Battles

Keep quick/type attacks, Berry/Potion/Ball, party switch and flee/retreat. A command panel and compact Bag replace generic stacks. Location battle backdrops, player/opponent entrances, lunge/recoil/HP tween/faint, throw/shake/capture and trainer/boss banners are finite visual jobs. An action commits its state before cosmetics; reload cannot reroll/duplicate a committed action or reward.

Bosses remain Pinsir/Aerodactyl/Gengar/Lapras/Charizard with one readable modifier each: low-HP enrage, first-action speed advantage, first-hit veil, one restorative tide, Fire-field boost. Level scaling follows party/destination with modest HP boost, rather than merely the ordinary +6 spawn.

## State and ownership

`state.adventureV2` is normalized additively:

```
{schema:1, destinations:{}, activeRoam:null, activeExpedition:null, lastDestination:'meadow'}
```

Destination records store encounters, seen/caught/rare species maps, shiny count, clears and boss status. Active run stores seed/generated route, current/completed/revealed nodes, phase/pending node, snapshotted party keys/HP/lead, loot, perks, battle snapshot and claim flags. Every meaningful mutation saves synchronously. Resume offers the exact run, including current battle/event/perk state. Unknown legacy fields remain intact; `luckyDexSave`, file origin, applicationId and signer remain unchanged.

One `LuckyDexAdventure` controller owns navigation, scene resources, state transactions and render dispatch. Pure model, event and battle modules have no global navigation listeners. Core exports an explicit bridge for existing save/Pokémon/XP/economy helpers; legacy Adventure DOM, handlers and duplicate declarations are removed rather than overlaid.

## Module contracts

`adventure-model.js` exports `LuckyDexAdventureModel` / CommonJS:

- `DESTINATIONS`, `EVENTS`, `PERKS`, `NODE_TYPES`.
- `ensureState(save)` → additive `save.adventureV2`.
- `generateRoute(seed, destination)` → `{seed,nodes}`; nodes `{id,depth,lane,type,seed,links}` including `start` and `boss`.
- `createRun(destination,seed,party)` → serializable run; party rows `{key,id,name,level,types,maxHp}`.
- `availableNodes(run)` → node array; `enterNode(run,id)` → boolean.
- `completeNode(run,id)` → boolean; once-only progress transition.
- `eventFor(run,node)` → event definition; `choiceAvailable(choice,ctx)` → boolean.
- `resolveEvent(run,nodeId,choiceId,ctx)` → `{applied,outcome}`. Effects only: coins/Trainer XP/items, heal/damage fractions, optional battle request, reveal/next-battle boost; no global storage/DOM writes.
- `mastery(record)` → 0–5; `recordEncounter(v2,dest,encounter)` / `recordCatch(...)` update field records.
- `PERKS` use ids `compass,potionBelt,luckyCharm,berrySatchel,quickClaw,fieldMedic,collectorsEye`; `offerPerk` / `keepPerk` ensure capacity/replacement and once-only offer resolution.

`adventure-battle.js` exports `LuckyDexAdventureBattle` / CommonJS; exact combat/transaction contract is recorded when the baseline audit returns. Root owns saving and terminal reward/capture transactions.

Assets expose `LuckyDexAdventureAssets` and `LuckyDexAdventureSpecies.byId`. All scripts load synchronously before the controller; no runtime essential asset fetch is required.
