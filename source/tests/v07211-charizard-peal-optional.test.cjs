'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';
const cat=require(A+'tcg-classic-battle-data'),core=require(A+'tcgp-battle-core'),cpu=require(A+'tcg-classic-opponents'),battleAI=require(A+'tcgp-battle-ai');
function evolveBattle(){
 const deck=cpu.generate({sets:['ex14'],type:'Lightning',seed:31}).cards;
 assert.equal(deck.length,30);
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:317,firstSide:'player',playerEnergyTypes:['Lightning','Metal'],opponentEnergyTypes:['Lightning','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=11;s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 const p=s.sides.player;
 p.active=core.makePokemonSlot('ex14-30',2,'charmeleon');p.active.playedOnSideTurn=2;
 s.sides.opponent.active=core.makePokemonSlot('ex14-58',2,'foe');
 p.hand=[{uid:'evolution',cardId:'ex14-4'}];
 p.deck=[{uid:'energy',cardId:'ex14-88'},{uid:'c1',cardId:'ex14-65'},{uid:'c2',cardId:'ex14-71'},{uid:'c3',cardId:'ex14-58'},{uid:'c4',cardId:'ex14-73'},{uid:'sixth',cardId:'ex14-49'}];
 const evolve=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='ex14-4');assert.ok(evolve,'must be able to evolve');
 core.applyAction(s,'player',evolve);
 assert.equal(s.phase,'effectChoice');
 return {s,p};
}
function choose(s,pred){
 assert.equal(s.phase,'effectChoice');const a=core.legalActions(s,s.choiceSide||s.activeSide).find(pred);assert.ok(a,'choice missing');
 core.applyAction(s,s.choiceSide||s.activeSide,a);return s;
}
test('Peal of Thunder must explicitly offer activation and decline before looking at or mutating top five',()=>{
 const {s,p}=evolveBattle(),before=p.deck.map(r=>r.uid);
 const options=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
 assert.ok(options.some(a=>a.choiceOption===0&&/Use Peal of Thunder/.test(a.choiceLabel)));
 assert.ok(options.some(a=>a.choiceOption===1&&/Decline Peal/.test(a.choiceLabel)));
 assert.deepEqual(p.deck.map(r=>r.uid),before,'do not remove any cards before opt-in');
 choose(s,a=>a.choiceOption===1);
 assert.equal(s.phase,'battle');assert.deepEqual(p.deck.map(r=>r.uid),before);
 assert.equal(p.discard.length,0);assert.equal(p.active.specialEnergy.length,0);
});
test('Accept Peal then select an attached Energy; discard only remaining revealed cards',()=>{
 const {s,p}=evolveBattle();choose(s,a=>a.choiceOption===0);
 assert.equal(s.phase,'effectChoice');assert.equal(p.deck.length,1,'top five revealed only after opt-in');
 choose(s,a=>a.choiceTarget==='active');
 choose(s,a=>a.choiceOption===0);
 assert.equal(s.phase,'battle');assert.deepEqual(p.deck.map(r=>r.uid),['sixth']);
 assert.ok(p.active.specialEnergy.some(r=>r.uid==='energy'));
 assert.deepEqual(p.discard.map(r=>r.uid).sort(),['c1','c2','c3','c4']);
});
test('Using Power but choosing zero Energy still discards revealed five, not sixth card',()=>{
 const {s,p}=evolveBattle();choose(s,a=>a.choiceOption===0);choose(s,a=>a.choiceTarget==='active');
 choose(s,a=>/Finish: discard/.test(a.choiceLabel));
 assert.equal(s.phase,'battle');assert.deepEqual(p.deck.map(r=>r.uid),['sixth']);
 assert.equal(p.active.specialEnergy.length,0);assert.deepEqual(p.discard.map(r=>r.uid).sort(),['c1','c2','c3','c4','energy']);
});

test('CPU all four difficulties uses Peal only if physical Energy can still be revealed',()=>{
 for(const difficulty of ['Beginner','Intermediate','Advanced','Expert']){
  const {s,p}=evolveBattle();
  const action=battleAI.chooseAction(s,'player',difficulty,0);
  assert.equal(action.choiceOption,0,difficulty+' should use Peal with physical Double Rainbow in deck');
  const {s:noEnergy,p:noEnergyPlayer}=evolveBattle();
  noEnergyPlayer.deck=noEnergyPlayer.deck.map((ref,i)=>({...ref,cardId:'ex14-71',uid:'trainer'+i}));
  const decline=battleAI.chooseAction(noEnergy,'player',difficulty,0);
  assert.equal(decline.choiceOption,1,difficulty+' should not mill five Trainers without Energy');
  core.applyAction(noEnergy,'player',decline);
  assert.equal(noEnergy.phase,'battle');assert.equal(noEnergyPlayer.deck.length,6);
 }
});
