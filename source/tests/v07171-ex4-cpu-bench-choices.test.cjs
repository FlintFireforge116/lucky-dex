'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const opponent=require(path.join(A,'tcg-classic-opponents.js'));
const data=require(path.join(A,'tcg-classic-battle-data.js'));
const levels=['Beginner','Intermediate','Advanced','Expert'];
const deck=opponent.generate({sets:['ex4'],seed:29});
assert.ok(deck.ok,deck.error);
function battle(){
 const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed:29,firstSide:'opponent'});
 s.sides.opponent.bench=[];
 s.sides.opponent.hand=[];
 s.sides.opponent.deck=[{uid:'searchBasic',cardId:'ex4-32'},{uid:'searchEvolved',cardId:'ex4-8'},...s.sides.opponent.deck];
 return s;
}
function playTrainer(s,id){
 const ss=s.sides.opponent;ss.hand.unshift({uid:'trainer-'+id,cardId:id});
 const action=core.legalActions(s,'opponent').find(a=>a.type==='trainer'&&a.cardId===id);
 assert.ok(action,'trainer legal '+id);core.applyAction(s,'opponent',action);
}
test('CPU benches a Basic already in hand before wasting an empty Bench, all difficulties',()=>{
 for(const level of levels){const s=battle();s.sides.opponent.hand.push({uid:'handBasic',cardId:'ex4-32'});
  const chosen=ai.chooseAction(s,'opponent',level,0);assert.equal(chosen.type,'bench',level);
  core.applyAction(s,'opponent',chosen);assert.equal(s.sides.opponent.bench.length,1,level);
 }
});
test('Team Magma Ball searches instead of skipping, then CPU actually benches the Basic',()=>{
 for(const level of levels){const s=battle();playTrainer(s,'ex4-80');
  assert.equal(s.phase,'effectChoice',level);assert.equal(s.pendingChoice.kind,'deckCard');assert.equal(s.pendingChoice.optional,true);
  const pick=ai.chooseAction(s,'opponent',level,1);assert.equal(pick.type,'effectChoice');assert.notEqual(pick.choiceSkip,true,level);
  assert.equal(data.cardById(pick.choiceCardId)?.stage,'Basic',level);
  core.applyAction(s,'opponent',pick);assert.equal(s.phase,'battle');
  const bench=ai.chooseAction(s,'opponent',level,2);assert.equal(bench.type,'bench',level);
  core.applyAction(s,'opponent',bench);assert.equal(s.sides.opponent.bench.length,1,level);
 }
});
test('Team Aqua Ball and Conspirator searches are taken rather than skipped',()=>{
 for(const id of ['ex4-75','ex4-77','ex4-82'])for(const level of levels){
  const s=battle();s.sides.opponent.deck.unshift({uid:'aquaBasic',cardId:'ex4-47'},{uid:'magmaBasic',cardId:'ex4-58'});
  playTrainer(s,id);assert.equal(s.phase,'effectChoice',id+' '+level);
  const a=ai.chooseAction(s,'opponent',level,1);assert.notEqual(a.choiceSkip,true,id+' '+level);
  const c=data.cardById(a.choiceCardId);assert.equal(c?.stage,'Basic');
  assert.ok(c?.name.startsWith(['ex4-75','ex4-77'].includes(id)?"Team Aqua's":"Team Magma's"));
  core.applyAction(s,'opponent',a);assert.ok(s.sides.opponent.hand.some(r=>r.cardId===c.id),id+' '+level);
 }
});
test('Archie can use deck search to place an actual Team Aqua Pokémon on the Bench',()=>{
 for(const level of levels){const s=battle();s.sides.opponent.deck.unshift({uid:'aquaBasic',cardId:'ex4-47'});playTrainer(s,'ex4-71');
  assert.equal(s.phase,'effectChoice');const pick=ai.chooseAction(s,'opponent',level,1);
  assert.notEqual(pick.choiceSkip,true,level);core.applyAction(s,'opponent',pick);
  assert.equal(s.sides.opponent.bench.length,1,level);
  assert.ok(data.cardById(s.sides.opponent.bench[0].cardId).name.startsWith("Team Aqua's"));
 }
});
