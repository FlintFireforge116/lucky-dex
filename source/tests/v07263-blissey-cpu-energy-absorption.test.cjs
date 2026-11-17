'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path='../app/src/main/assets/';
const core=require(path+'tcgp-battle-core.js'),ai=require(path+'tcgp-battle-ai.js'),cpu=require(path+'tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:49});assert.equal(loan.ok,true);
function board(discard,side='opponent'){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:17,
  firstSide:side,playerEnergyTypes:['Fire','Water','Grass'],opponentEnergyTypes:['Fire','Water','Grass']});
 s.phase='battle';s.turnNumber=10;s.activeSide=side;
 for(const w of ['player','opponent']){s.sides[w].turnCount=7;s.sides[w].bench=[];s.sides[w].hand=[];s.sides[w].energyDiscard={};}
 s.sides[side].active=core.makePokemonSlot('ex10-101',2,'blissey');s.sides[side].active.energy={Fire:1};
 s.sides[side].energyDiscard={Fire:discard};
 s.sides[side==='player'?'opponent':'player'].active=core.makePokemonSlot('dp5-17',2,'defender');
 return s;
}
for(const difficulty of ['Beginner','Intermediate','Advanced','Expert'])for(const qty of [1,2,3,5]){
 test(`Blissey ex CPU ${difficulty} recovers ${Math.min(qty,3)} of ${qty} discarded Energy, without choosing Skip`,()=>{
  const s=board(qty);const atk=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);
  assert.ok(atk,'Energy Absorption attack not available');core.applyAction(s,'opponent',atk);
  let recovered=0;
  while(s.phase==='effectChoice'){
   const action=ai.chooseAction(s,'opponent',difficulty,recovered+1);
   assert.ok(action,'CPU failed to choose');assert.equal(action.choiceSkip,undefined,'CPU incorrectly skipped available recovery');
   core.applyAction(s,'opponent',action);recovered++;assert.ok(recovered<=3,'Recovery never terminates');
  }
  assert.equal(recovered,Math.min(3,qty));assert.equal(s.sides.opponent.active.energy.Fire,1+recovered);
  assert.equal(s.sides.opponent.energyDiscard.Fire,qty-recovered);
 });
}
test('Blissey ex CPU remains legal when no recovery options exist',()=>{
 const s=board(0);const a=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(a);core.applyAction(s,'opponent',a);
 assert.notEqual(s.phase,'effectChoice','No discarded Energy must not open an empty recovery menu');
});
