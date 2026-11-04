'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const Core=require(path.join(root,'tcgp-battle-core.js'));
const Decks=require(path.join(root,'tcg-classic-decks.js'));
function battle(){
 const s=Core.createBattle({format:'classic',playerDeck:Decks.LOANER_DECK,opponentDeck:Decks.LOANER_DECK,playerEnergyTypes:['Grass'],opponentEnergyTypes:['Fire'],seed:8202});
 s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=5;
 return s;
}
function playFlow(s){const ss=s.sides.player;ss.hand.push({uid:'energy-flow-1',cardId:'gym1-122'});const a=Core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='gym1-122');assert.ok(a,'Energy Flow is playable');Core.applyAction(s,'player',a);}
test('Energy Flow returns attached Basic Energy from Active and Bench to hand, and those can be replayed',()=>{
 const s=battle(),ss=s.sides.player;const active=ss.active,bench=Core.makePokemonSlot('base1-44',3,'bench-ef');bench.benchSlot=0;ss.bench=[bench];
 active.energy.Grass=2;bench.energy.Psychic=1;const starting=ss.hand.length;
 playFlow(s);assert.equal(s.phase,'effectChoice');
 let a=Core.legalActions(s,'player').find(a=>a.choiceTarget==='active'&&a.effectEnergyType==='Grass');assert.ok(a);Core.applyAction(s,'player',a);
 assert.equal(ss.hand.length,starting+1,'first Energy should be returned to hand');assert.equal(ss.hand.filter(x=>x.cardId==='gym1-129').length,1);
 a=Core.legalActions(s,'player').find(a=>a.choiceTarget==='bench'&&a.effectEnergyType==='Psychic');assert.ok(a);Core.applyAction(s,'player',a);
 assert.equal(ss.hand.filter(x=>x.cardId==='gym1-131').length,1);
 const skip=Core.legalActions(s,'player').find(a=>a.choiceSkip);assert.ok(skip);Core.applyAction(s,'player',skip);
 assert.equal(ss.hand.length,starting+2);
 const attach=Core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='gym1-129'&&a.target==='active');assert.ok(attach,'returned Basic Energy can be replayed from hand');
 Core.applyAction(s,'player',attach);
 assert.equal(active.energy.Grass,2);
});
test('Energy Flow can recover attached Special Energy as a card in hand',()=>{
 const s=battle(),ss=s.sides.player;ss.active.specialEnergy=[{uid:'special-1',cardId:'base1-96'}];
 playFlow(s);
 const a=Core.legalActions(s,'player').find(a=>a.effectSpecialEnergyUid==='special-1');assert.ok(a,'attached Special Energy should be a choice');Core.applyAction(s,'player',a);
 assert.equal(ss.hand.some(x=>x.uid==='special-1'),true);
 assert.equal(ss.active.specialEnergy.length,0);
 assert.equal(s.phase,'battle','effect ends when all Energy is returned');
 const attach=Core.legalActions(s,'player').find(x=>x.type==='attachSpecial'&&x.cardId==='base1-96');assert.ok(attach);
});
test('Bench Pokémon inspection does not include Inspect Stadium link',()=>{
 const ui=fs.readFileSync(path.join(root,'tcgp-battle-ui.js'),'utf8');
 assert.doesNotMatch(ui,/currentBattle\.stadium&&info\.zone!==['"]stadium['"]\?`<button class="tcgp-battle-action secondary"/);
 assert.match(ui,/aria-label="Inspect Stadium/,'Stadium remains inspectable directly');
});

test('Energy Flow does not silently lose Basic Energy when the hand is at capacity',()=>{
 const s=battle(),ss=s.sides.player;ss.hand=Array.from({length:9},(_,i)=>({uid:`filler-${i}`,cardId:'base1-85'}));
 ss.active.energy.Grass=3;
 playFlow(s);
 for(let i=0;i<3;i++){
  const action=Core.legalActions(s,'player').find(a=>a.effectEnergyType==='Grass');assert.ok(action);
  Core.applyAction(s,'player',action);
 }
 assert.equal(ss.active.energy.Grass,0);
 assert.equal(ss.hand.filter(x=>x.cardId==='gym1-129').length,3);
 assert.equal(ss.hand.length,12,'all Energy returned even beyond normal ten-card draw cap');
});
test('Energy Flow cannot be burned if no Pokémon has attached Energy',()=>{
 const s=battle();s.sides.player.active.energy={};
 for(const x of s.sides.player.bench)x.energy={};
 s.sides.player.active.specialEnergy=[];
 s.sides.player.hand.push({uid:'empty-energy-flow',cardId:'gym1-122'});
 assert.equal(Core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='gym1-122'),false);
});
