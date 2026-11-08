'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const effects=require(path.join(A,'tcgp-battle-effects.js'));
const cards=require(path.join(A,'tcg-classic-battle-data.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const moltres=cards.cardById('ecard3-21');
function field(){
 const d=opponents.generate({sets:['ecard3'],seed:195});assert.ok(d.ok,d.error);
 const state=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,seed:195,firstSide:'player',playerEnergyTypes:['Fire','Water','Grass','Lightning'],opponentEnergyTypes:['Fire','Water','Grass','Lightning']});
 state.phase='battle';state.activeSide='player';state.turnNumber=7;state.sides.player.turnCount=4;
 state.sides.player.active=core.makePokemonSlot('ecard3-21',3,'moltres-test');
 state.sides.opponent.active=core.makePokemonSlot('ecard3-54',3,'defender-test');
 state.sides.player.active.energy={Fire:3};return state;
}
function ctx(state,random){return {...core.effectContext(state,'player',{},state.sides.player.active),random,isAttack:true};}
const effect={type:'neoRule',rule:'skyridge:burningTail'};
test('Skyridge Moltres Burning Tail heads is logged for coin animation and keeps Fire Energy',()=>{
 const s=field();effects.applyEffect(effect,ctx(s,()=>.1));
 const flips=s.log.filter(x=>x.type==='coin'&&x.reason==='Skyridge Burning Tail');
 assert.equal(flips.length,1);assert.deepEqual(flips[0].results,[true]);assert.equal(flips[0].outcome,'kept');
 assert.equal(s.sides.player.active.energy.Fire,3);assert.equal(s.sides.player.energyDiscard.Fire||0,0);
});
test('Skyridge Moltres Burning Tail tails is logged and discards one Fire Energy',()=>{
 const s=field();effects.applyEffect(effect,ctx(s,()=>.9));
 const flips=s.log.filter(x=>x.type==='coin'&&x.reason==='Skyridge Burning Tail');
 assert.equal(flips.length,1);assert.deepEqual(flips[0].results,[false]);assert.equal(flips[0].outcome,'discarded');
 assert.equal(s.sides.player.active.energy.Fire,2);assert.equal(s.sides.player.energyDiscard.Fire,1);
});
test('Burning Tail still flips when Moltres has no remaining Fire Energy to discard',()=>{
 const s=field();s.sides.player.active.energy={Water:4};effects.applyEffect(effect,ctx(s,()=>.9));
 assert.equal(s.log.find(x=>x.reason==='Skyridge Burning Tail')?.outcome,'noFireEnergy');
 assert.equal(s.sides.player.energyDiscard.Fire||0,0);
});
test('Collect Fire heads/tails are visible and the chosen-discard resolution does not flip again',()=>{
 const heads=field(),tails=field();
 effects.applyEffect({type:'neoRule',rule:'skyridge:collectFire'},ctx(heads,()=>.1));
 effects.applyEffect({type:'neoRule',rule:'skyridge:collectFire'},ctx(tails,()=>.9));
 assert.deepEqual(heads.log.filter(x=>x.reason==='Skyridge Collect Fire').map(x=>x.results),[[true]]);
 assert.deepEqual(tails.log.filter(x=>x.reason==='Skyridge Collect Fire').map(x=>x.results),[[false]]);
});
test('Real Burning Tail attack logs one animated coin result alongside its 60 damage',()=>{
 const s=field();s.sides.player.active.energy.Fire=4;const attack=moltres.attacks.find(x=>x.name==='Burning Tail');assert.ok(attack);
 const action=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1);
 assert.ok(action,'Burning Tail must be a legal attack with the supplied Fire Energy');
 core.applyAction(s,'player',action);
 const coin=s.log.find(x=>x.type==='coin'&&x.reason==='Skyridge Burning Tail');
 assert.ok(coin,'A real attack must produce a coin presentation event');
 assert.equal(coin.results.length,1);
 assert.ok(s.log.some(x=>x.type==='attack'&&x.attack==='Burning Tail'&&x.damage===60));
});
test('Battle UI consumes the Moltres coin event for central animation and event text',()=>{
 const ui=fs.readFileSync(path.join(A,'tcgp-battle-ui.js'),'utf8');
 assert.match(ui,/entries\.filter\(e=>e\.type==='coin'\)/);
 assert.match(ui,/spawnCoinRow\(stage,coinEntry\)/);
 assert.match(ui,/Skyridge Burning Tail/);
 assert.match(ui,/TAILS — Fire Energy discarded/);
});
