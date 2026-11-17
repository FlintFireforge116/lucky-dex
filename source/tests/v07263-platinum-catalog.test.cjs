'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path='../app/src/main/assets/';
const db=require(path+'tcg-classic-battle-data.js'),platinum=require(path+'tcg-classic-platinum.js'),fx=require(path+'tcgp-battle-effects.js');
test('Platinum is present in classic sets, matching original 133 collector prints',()=>{
 assert.ok(db.SETS.some(x=>x.id==='pl1'));
 assert.equal(platinum.CARDS.length,133,'Run sh scripts/prepare-platinum.sh first to generate all printed Platinum cards');
 const ids=new Set(platinum.CARDS.map(c=>c.id));assert.equal(ids.size,133);
 for(let n=1;n<=130;n++)assert.ok(ids.has(`pl1-${n}`));
 for(const n of ['SH4','SH5','SH6'])assert.ok(ids.has(`pl1-${n}`));
 assert.deepEqual(db.coverage().platinum,platinum.coverage());
});
test('Every executable Platinum card maps all of its printed effects, while unknown cards remain gated',()=>{
 for(const c of platinum.CARDS){
  assert.equal(c.deckEligible,c.battleEnabled,c.id);
  assert.equal(c.support.status,c.battleEnabled?'FULL':'PARTIAL',c.id);
  if(!c.battleEnabled){assert.ok(c.support.reasons?.length,c.id);continue;}
  for(const eff of [...c.attacks||[],...c.abilities||[]])assert.deepEqual(fx.validateEffect(eff.effect),[],c.id+':'+eff.name);
  if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],c.id);
 }
});
test('Platinum SH cards retain their distinct identities and fossils are gated until live fossil rules exist',()=>{
 for(const id of ['pl1-SH4','pl1-SH5','pl1-SH6'])assert.equal(platinum.cardById(id)?.id,id);
 for(const id of ['pl1-119','pl1-120'])assert.equal(platinum.cardById(id)?.deckEligible,false);
});
test('All battle-enabled Platinum cards must resolve in the global card lookup',()=>{
 for(const c of platinum.CARDS.filter(c=>c.battleEnabled))assert.equal(db.cardById(c.id)?.id,c.id);
});
test('CPU Dunsparce searches an eligible Basic instead of skipping a successful Call for Family',()=>{
 const core=require(path+'tcgp-battle-core.js'),ai=require(path+'tcgp-battle-ai.js'),cpu=require(path+'tcg-classic-opponents.js');
 const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:49});assert.equal(loan.ok,true);
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:29,firstSide:'opponent',playerEnergyTypes:['Grass'],opponentEnergyTypes:['Grass']});
 s.phase='battle';s.turnNumber=10;s.activeSide='opponent';
 for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].bench=[];s.sides[side].hand=[];}
 s.sides.opponent.active=core.makePokemonSlot('pl1-73',2,'dunsparce');s.sides.opponent.active.energy={Grass:4,Colorless:2};
 s.sides.player.active=core.makePokemonSlot('dp5-17',2,'defender');
 s.sides.opponent.deck=[{uid:'choose-chimchar',cardId:'pl1-70'}];
 const attack=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(attack,'Platinum Dunsparce Call for Family attack unavailable');core.applyAction(s,'opponent',attack);
 const action=ai.chooseAction(s,'opponent','Expert',1);
 assert.ok(action,'CPU cannot make Platinum deck choice');assert.equal(action.choiceSkip,undefined,'CPU skipped available Basic');
 assert.equal(action.choiceDeckIndex,0);
 core.applyAction(s,'opponent',action);
 assert.ok(s.sides.opponent.bench.some(slot=>slot?.cardId==='pl1-70'));
});
