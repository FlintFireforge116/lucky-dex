# Location identity and travel — v0.40.2

`adventure-location-flow.js` exposes `LuckyDexLocationFlow` in the browser and
CommonJS. It owns named place identity, category, supported services, next
destination, available local actions and routine notice lifetime. The regional
engine retains battle, reward, claims, checkpoints and schema 2 ownership.

## Adapter contract

- `describe(journey)` reads the current place: `id`, `name`, `kind`, `region`,
  `habitat`, original `nodeId`, `services`, `nextLabel`, `continueLabel`,
  `canContinue`, `blockedText`, `segment` and `segments`.
- `actionsFor(save, journey)` returns available local actions with `key`,
  `label` and optional `nodeId`, `screen`, `context` or `habitat`. Universal
  Party/Bag/Map controls belong to the renderer’s separate tool strip.
- `perform(save, key)` returns `{applied}` plus an optional Tools `screen` /
  merchant `context`, Wild Hunt `habitat` or local `text`. Battles use the
  existing engine; a Gym action can open the existing preparation view first.
- `continue(save)` explicitly travels, returning `{applied, reason?}`.
  Required encounters block onward travel until resolved. Recovery, completion
  and an active battle do not allow travel.
- `settleRoutine(save)` records brief feedback for ordinary results. Optional
  detours settle immediately at the same main depth. Required ordinary results
  stay at the place until explicit travel. It deliberately leaves Gym/League/
  Champion milestones in their existing result flow. The renderer must render
  the local menu directly after settlement rather than recursively settling.
- `feedbackFor(journey)` reads only a notice from this place, node and traversal.
  `dismiss(journey)` clears it. JSON reload at the same place preserves it;
  named movement, defeat and replay invalidate it.
- `sceneFor(place, scenes, adventureAssets)` selects an explicit scene, exact
  named/ID scene, regional category, then existing habitat background. The
  scenes manifest supplies `named[region][name]`, `places[id]`,
  `categories[region][kind]` and `scenes[key].path`.

## Presentation waypoints

The first Johto chapter retains all five main IDs and all battle/reward seeds.
`johto-c0-s3` presents Route 30 → Route 31 → Sprout Tower before its existing
required trainer. `johto-c0-s4` presents Violet City → Violet Gym before its
existing Gym. Small `journey.locationFlow` state stores the main `nodeId`,
presentation `step`, `traversal` and a scoped notice. Each region’s existing
journey save owns this state independently. Existing saves already inside a
Tower/Gym battle or result resolve to the final presentation step immediately.

Waypoints grant nothing and do not increment main-section depth. They do not
create an encounter table for Route 30/31 or modify the compressed stage pool.

## Healing and travel

New Bark, Pallet and Littleroot have authored home recovery instead of a fake
Center. Starting event recovery uses the existing once-per-claim 12% healing;
the existing later Pallet camp retains its full recovery. Talk never heals or
advances. A supported Center restores HP, PP and status without travel.

The two narrow engine methods are:

- `skipTravel(save, nodeId)`: validates an available main event/camp, or the
  currently open main event/camp choice, then advances through the existing
  engine. Its skipped resolution grants no healing, inventory, coins or claim.
  Trainer, wild, Gym, optional detour and battle nodes are rejected.
- `restoreAtCenter(save)`: validates the adapter’s authoritative current place
  and `services.center`, rejects battle/recovery/completion, and invokes the
  existing full recovery routine. Routes and starting towns are rejected.

Gym challenges have no prerequisite to heal. Optional exploration uses existing
cache IDs/claims and event outcomes, or a short authored travel hint. No second
Mart is shown when a permanent local shop exists. Existing transaction and
merchant pricing are unchanged.

## Service and fishing provenance

Canonical settlement exceptions are explicit. Cianwood has a Center and
pharmacy, so no ordinary Mart is invented. Dewford has a Center and no Mart;
only an existing authored travelling merchant may appear. Mahogany’s existing
shop is labelled Souvenir Shop. Starting towns have no Center. League arrivals
retain their real Center context.

Primary map sources checked for exceptions:
[Gold Cianwood map](https://raw.githubusercontent.com/pret/pokegold/master/maps/CianwoodCity.asm),
[Gold Mahogany map](https://raw.githubusercontent.com/pret/pokegold/master/maps/MahoganyTown.asm),
[Emerald Dewford map](https://raw.githubusercontent.com/pret/pokeemerald/master/data/maps/DewfordTown/map.json).

The supplied regional pools intentionally combine grass, surf, fish and special
encounters. They do not encode a place-specific fishing action/pool, so this
pass does not invent FISH actions. Route 29 never receives one. See
`ADVENTURE_REGION_SOURCES.md` for existing pool provenance.

## Verification

`tests/adventure-location-flow-v0402.test.cjs` and
`tests/adventure-location-travel-v0402.test.cjs` were observed failing before
implementation. They cover supported menus, home/Center balance, battle locks,
skipping without rewards, persistent first-Gym waypoints, original IDs/schema,
claims, scoped feedback, scene hierarchy and milestone retention. Existing
journey, migration, recovery and actual regional balance simulations also pass.
