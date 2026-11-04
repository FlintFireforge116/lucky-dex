'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const Core=require(path.join(root,'tcgp-battle-core.js'));
const Decks=require(path.join(root,'tcg-classic-decks.js'));
const Gym=require(path.join(root,'tcg-classic-gym-heroes.js'));
function battle(){
  const s=Core.createBattle({format:'classic',playerDeck:Decks.LOANER_DECK,opponentDeck:Decks.LOANER_DECK,playerEnergyTypes:['Grass'],opponentEnergyTypes:['Fire'],seed:8201});
  s.phase='battle';s.activeSide='player';s.turnNumber=6;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;
  return s;
}
function fillBench(ss,label){ss.bench=[0,1,2].map(i=>{const slot=Core.makePokemonSlot('base1-44',2,`${label}-${i}`);slot.benchSlot=i;return slot;});}
function addStadium(s,id='gym1-124'){
  s.sides.player.hand.push({uid:`stadium-${id}`,cardId:id});
  const action=Core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId===id);
  assert.ok(action,`stadium ${id} must be playable`);Core.applyAction(s,'player',action);
}
test('Narrow Gym explains the LuckyDex two-slot adaptation rather than saying four',()=>{
 const card=Gym.CARDS.find(c=>c.id==='gym1-124');
 assert.match(card.text,/two Benched|2 Benched/i);assert.doesNotMatch(card.text,/four Benched/i);
});
test('Narrow Gym restricts both players to two Bench spaces, and another Stadium restores three',()=>{
 const s=battle();
 addStadium(s);
 assert.equal(s.stadium.cardId,'gym1-124');
 for(const side of ['player','opponent']){
   assert.equal(s.sides[side].benchLimit,2);
 }
 s.sides.player.hand.push({uid:'basic-1',cardId:'base1-44'});
 s.sides.opponent.hand.push({uid:'basic-2',cardId:'base1-44'});
 for(const side of ['player','opponent']){
   s.phase='battle';s.activeSide=side;s.sides[side].bench=[0,1].map(i=>{const slot=Core.makePokemonSlot('base1-44',2,`${side}-${i}`);slot.benchSlot=i;return slot;});
   assert.equal(Core.legalActions(s,side).filter(a=>a.type==='bench').length,0);
 }
 s.phase='battle';s.activeSide='player';s.sides.player.stadiumUsed=false;
 addStadium(s,'gym1-104');
 assert.equal(s.stadium.cardId,'gym1-104');
 assert.equal(s.sides.player.benchLimit,3);assert.equal(s.sides.opponent.benchLimit,3);
 assert.ok(Core.legalActions(s,'player').some(a=>a.type==='bench'));
});
test('Playing Narrow Gym with three on each Bench requires the opponent then the player to choose whom to return',()=>{
 const s=battle();fillBench(s.sides.player,'p');fillBench(s.sides.opponent,'o');
 s.sides.player.bench[1].specialEnergy=[{uid:'dce-narrow',cardId:'base1-96'}];
 s.sides.player.bench[1].energy.Grass=2;
 const pHand=s.sides.player.hand.length,oHand=s.sides.opponent.hand.length;
 addStadium(s);
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
 const cpu=Core.legalActions(s,'opponent');assert.equal(cpu.length,3);
 assert.ok(cpu.every(a=>a.type==='effectChoice'&&a.choiceTarget==='bench'));
 Core.applyAction(s,'opponent',cpu.find(a=>a.choiceBenchIndex===0));
 assert.equal(s.sides.opponent.bench.length,2);
 assert.equal(s.choiceSide,'player');
 const mine=Core.legalActions(s,'player');assert.equal(mine.length,3);
 Core.applyAction(s,'player',mine.find(a=>a.choiceBenchIndex===1));
 assert.equal(s.phase,'battle');assert.equal(s.sides.player.bench.length,2);
 assert.equal(s.sides.player.hand.length,pHand+2);
 assert.equal(s.sides.opponent.hand.length,oHand+1);
 assert.equal(s.sides.player.hand.some(ref=>ref.uid==='dce-narrow'),true);
 assert.equal(s.sides.player.energyDiscard.Grass,2);
 assert.equal(s.sides.player.bench.every(x=>x.benchSlot<2),true);
});
test('Classic Stadiums are portrait and do not use a rotated hit box over Pokémon',()=>{
 const css=fs.readFileSync(path.join(root,'tcgp-battle.css'),'utf8');
 assert.match(css,/\.tcgp-live-arena\.format-classic \.tcgp-live-player>\.tcgp-live-stadium-slot \.tcgp-live-stadium-card\s*\{[^}]*transform:none\s*!important/s);
 assert.match(css,/\.tcgp-live-arena\.format-classic \.tcgp-live-player>\.tcgp-live-stadium-slot\s*\{[^}]*z-index:\s*2\s*!important/s);
});
