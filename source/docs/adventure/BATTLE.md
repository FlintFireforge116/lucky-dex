# Adventure battle module

`app/src/main/assets/adventure/adventure-battle.js` exports `window.LuckyDexAdventureBattle` and CommonJS. Its state reducer has no DOM, storage, economy, navigation or lifecycle ownership. The renderer has no event listeners, timer creation or RAF loop. The Adventure controller owns the mounted scene, root action lock, saving, inventory, party HP synchronization and reward/capture transactions.

## API

```js
const fight = Battle.create(party, enemy, {
  context: 'roam', // or expedition
  kind: 'wild',   // rare, trainer, elite, boss
  destination: 'meadow', seed, leadKey,
  perks: ['quickClaw'], trainer: {name, classKey}, bossId
});
const outcome = Battle.act(fight, command, args, save.inventory);
host.innerHTML = Battle.markup(fight, {...Assets, inventory: save.inventory});
Battle.update(host, fight);
await Battle.animate(host, outcome.action, scope, reducedMotion);
```

`party` contains `{key,id,name,shiny,level,types,baseStats,hp?,maxHp?}` rows. `enemy` uses the same metadata without `key`, with `tier`. Pokémon rows are copied; unknown row fields survive. Expedition HP/max HP are retained, while Roam starts each member at full HP. Stats use the baseline rounded HP/attack/defense/speed formulas. Levels are limited to 1–50. Bosses gain 30% max HP.

The serializable fight stores `{id,context,kind,destination,enemy,party,leadKey,berryBoost,rng,turns,actionSeq,phase,flags,bossModifier,perks,trainer,result,lastAction}`. Party/enemy snapshots include HP, max HP and stats. Seeded xorshift RNG is stored as an unsigned integer. Reducer actions preserve unknown snapshot fields. Invalid commands do not consume items, increment sequence/turns or advance RNG.

`act` mutates the fight and actual inventory synchronously and returns `{applied,reason?,action,result}`. Valid commands:

| Command | Args | Behavior |
|---|---|---|
| `quick` | `{}` | Normal power 24, accuracy 1 |
| `type` | `{}` | First type, power 38, accuracy .9 |
| `berry` | `{}` | Consume Berry, multiply catch boost, no enemy turn |
| `potion` | `{}` | Consume Potion, heal current lead, enemy turn |
| `ball` | `{key:'pokeball'}` | Poké/Great/Ultra keys; consume one, resolve once |
| `switch` | `{key:partyKey}` | Living different member, enemy turn |
| `flee` | `{}` | Terminal `fled`; controller ends encounter/run |

The first enemy type uses power 26 and no accuracy roll. Damage variance is `.86 + rng * .22`. Attack actions and opponent responses finish before `act` returns; animations never roll RNG or change combat state. A fainted lead automatically selects the first living party member. All fainted ends the fight. `phase:'terminal'` rejects further commands.

`action` includes `{seq,kind,text,target,events,beforeLead}`. Hits add `{damage,eff}` to the outer action. Events describe hits, heals, switches, misses, Berry, capture and modifier notices; hit/heal events include previous/current HP so the presentation can evolve without calculating gameplay. `beforeLead` supports animating the fainted member even when the persisted lead has already changed. A ball adds `{ball,captureChance,captureSuccess,shakes}`. The predetermined shakes are cosmetic and require no extra capture rolls.

Terminal `result` is `{kind:'victory'|'capture'|'loss'|'fled',enemy,leadKey}`; capture also supplies `{captureChance,ball}`. The enemy is copied into the terminal result. The controller must apply existing legacy reward/capture/stat/daily/XP shapes exactly once, set its transaction claim flag, and save that transaction together with the updated fight/inventory before any awaited animation. Battle never grants coins, XP, catches, mastery or clear rewards.

## Balance decisions

Quick/type/opponent powers and accuracy, healing, item consumption, ball modifiers and baseline classification multipliers are retained. Full HP Potion and invalid items/switches are rejected. Potion heals `max(10,round(maxHp*.38))`, capped at max; Potion Belt increases that amount by 15%. Berry multiplies catch boost by 1.4, capped at 2; Berry Satchel uses 1.55 capped at 2.2. A failed capture resets the boost and permits the opponent response. Switching consumes an opponent turn in both contexts for a consistent command loop.

Catch chance is `.12+(1-hp/maxHp)*.62`, multiplied by rare `.72`, legendary `.28`, mythical `.75`, ball `1/1.5/2` and Berry boost, clamped `.025–.95`. Classification uses persisted tier/optional flags and the baseline legendary/mythical species IDs. Trainers/elites reject balls; bosses retain catchability. The rare-tier multiplier deliberately fixes the old lookup of nonexistent `wild.tier`. Type immunity deliberately deals zero damage instead of the old minimum-one behavior.

Boss mechanics: Pinsir attacks 20% harder under 40% HP; Aerodactyl responds before the first turn-consuming action, once; Gengar reduces the first incoming hit by 40%; Lapras restores 20% max HP once after a surviving player attack leaves it below half HP; Charizard strengthens both sides' Fire attacks by 20%. Quick Claw increases the first attempted player attack's damage by 15%; its chance is consumed even if that type attack misses. No STAB, critical hits or competitive mechanics were added.

## Renderer integration

Assets provide `pokemon(id,shiny,back)`, `destinations[id].battle`, optional `.boss`, optional `trainers[classKey]`. The packaged helper selects supported local back sprites and a local front fallback. The trainer object can alternatively provide `image`. Markup includes escaped names, local actors, trainer/boss banners, modifier copy, both HP HUDs, a four-button command panel, compact Bag and party drawers. Styles are scoped under `.adventure-battle`.

Controller event delegation reads `data-adv-battle` and `data-key`. Drawer buttons use `data-adv-command="battle-bag|battle-switch|battle-close"`; controller toggles the corresponding `[data-battle-drawer="bag|switch"]` `hidden` attribute and updates `aria-expanded`. The module installs no listeners. Use `fight.inventory` as a presentation snapshot when refreshing item counts with `update`, or supply `assets.inventory` at initial markup. The reducer only uses the actual inventory argument.

Mount once for each fight. After `act`, synchronize/save gameplay and call `update` on the existing host, then await `animate`; call `update` afterward if other controller state changed. HUD fill nodes stay mounted, so width updates tween. Switched actors use their already resolved packaged back sprite, including normal/shiny members of the same species. Intro is `animate(host,{kind:'intro'},scope,reducedMotion)`. Attack lunge/recoil/particles, super-effective shake, healing, faint, ball throw/shakes/burst and shiny entrance sparkle are finite cosmetic steps.

The scope must expose `wait(ms)` plus `isActive()` or `disposed`. Root disposal must settle/reject pending waits. Animation checks activity after each step and cleans temporary classes in `finally`, restoring final actor visibility and image. Reduced motion resolves without waits; CSS also honors the media preference. Successful three-shake capture totals 650 ms; an unsuccessful throw can additionally animate the enemy response. No music dependency is required.

## Verification

`node --test tests/adventure-battle.test.cjs` covers offline exports, baseline formulas, Roam/Expedition HP, seeded replay after JSON serialization, invalid-action immutability, inventory consumption, item perks, capture classification, trainer/boss rules, once-only capture, faint/wipe/victory/flee, immunity, all boss modifiers, renderer escaping/local assets, cancellation cleanup and reduced-motion/capture timing.

Isolated Chromium checks at 360×700 and 360×800 verified open Bag fit, no document overflow, local images, and switching to a local back sprite. The complete repository runner is `node scripts/run-tests.cjs`; browser dependencies are available through the bundled runtime's `NODE_PATH`.
