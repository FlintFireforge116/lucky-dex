'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const opponent=require(path.join(A,'tcg-classic-opponents.js'));
const effects=require(path.join(A,'tcgp-battle-effects.js'));
const slot=(id,uid)=>core.makePokemonSlot(id,4,uid);
function battle(){
 const cards=opponent.generate({sets:['ex6'],seed:31}).cards;
 const s=core.createBattle({format:'classic',playerDeck:cards,opponentDeck:cards,seed:31,firstSide:'player',playerEnergyTypes:['Psychic'],opponentEnergyTypes:['Grass']});
 s.phase='battle';s.activeSide='player';s.turnNumber=11;s.sides.player.turnCount=6;s.sides.opponent.turnCount=5;
 s.sides.player.active=slot('ex6-63','gastly');s.sides.player.active.energy={Colorless:3};
 s.sides.player.bench=[];s.sides.opponent.active=slot('ex6-53','defender');s.sides.opponent.bench=[slot('ex6-54','bench')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function attack(s){const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(a);core.applyAction(s,'player',a);}
function end(s){const a=core.legalActions(s,s.activeSide).find(x=>x.type==='endTurn');assert.ok(a,'end turn legal for '+s.activeSide);core.applyAction(s,s.activeSide,a);}
test('Gastly Slow Trip Gas schedules Confusion only at the end of opponent next turn',()=>{
 const s=battle(),target=s.sides.opponent.active;
 attack(s);
 assert.ok(!target.conditions.confusion,'must not immediately confuse the defending Pokemon');
 assert.equal(s.activeSide,'opponent','attack should end Gastly turn');
 assert.equal(s.delayedEffects?.length,1,'one delayed Confusion is scheduled');
 assert.equal(s.delayedEffects[0].targetUid,target.uid);
 end(s);
 assert.equal(s.activeSide,'player');
 assert.ok(target.conditions.confusion,'confuse after opponent finishes next turn');
 assert.equal(s.delayedEffects.length,0);
});
test('Slow Trip Gas should not confuse the replacement if defender leaves Active',()=>{
 const s=battle(),target=s.sides.opponent.active;
 attack(s);
 // Simulate a legal opponent retreat before turn end.
 const a=core.legalActions(s,'opponent').find(x=>x.type==='retreat'&&x.benchIndex===0);
 if(a){core.applyAction(s,'opponent',a);}else{
   // An effect switch is still allowed when ordinary retreat is blocked.
   s.sides.opponent.active=s.sides.opponent.bench[0];s.sides.opponent.active.benchSlot=null;target.benchSlot=0;s.sides.opponent.bench=[target];
 }
 assert.equal(s.sides.opponent.active.uid,'bench');
 end(s);
 assert.ok(!s.sides.opponent.active.conditions.confusion,'replacement must not inherit delayed Confusion');
 assert.ok(!target.conditions.confusion,'Benched original target must not become Confused');
});

test('Slow Trip Gas is cleared if target switches away and returns before deadline',()=>{
 const s=battle(),target=s.sides.opponent.active;
 attack(s);
 assert.equal(s.delayedEffects?.length,1);
 assert.equal(effects.switchPokemon(s.sides.opponent,0,s),true);
 assert.equal(s.delayedEffects.length,0,'switching should clear attack effect');
 assert.equal(effects.switchPokemon(s.sides.opponent,0,s),true);
 assert.equal(s.sides.opponent.active.uid,target.uid);
 end(s);
 assert.ok(!target.conditions.confusion,'re-entering Active must not reactivate cleared delay');
});
test('Slow Trip Gas is cleared if target evolves before the deadline',()=>{
 const s=battle(),target=s.sides.opponent.active;
 attack(s);
 assert.equal(s.delayedEffects?.length,1);
 target.cardId='ex6-35';target.stack.push('ex6-35');
 effects.clearTemporaryEffects(s,target);
 assert.equal(s.delayedEffects.length,0,'evolution clears attack effect');
 end(s);
 assert.ok(!target.conditions.confusion);
});
test('EX Team Magma/Aqua delayed Poison still waits for the opponent end turn',()=>{
 const s=battle();s.sides.player.active=slot('ex4-18','sharpedo');s.sides.player.active.energy={Colorless:4};
 const target=s.sides.opponent.active;
 const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(a);
 core.applyAction(s,'player',a);
 assert.equal(target.damage,20,'initial attack still deals printed 20');
 assert.ok(!target.conditions.poison,'no early Poison');
 assert.equal(s.delayedEffects?.[0]?.effect.status,'poison');
 end(s);
 assert.ok(target.conditions.poison,'Poison is applied at the end of opponent next turn');
});
