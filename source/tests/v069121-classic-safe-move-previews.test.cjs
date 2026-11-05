'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const data=require(path.join(A,'tcg-classic-battle-data.js'));
const decks=require(path.join(A,'tcg-classic-decks.js'));
function battle(){
  const s=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK.slice(),opponentDeck:decks.LOANER_DECK.slice(),seed:342,firstSide:'player'});
  s.phase='battle';s.activeSide='player';s.sides.player.turnCount=2;
  s.sides.player.active=core.makePokemonSlot('SNAPFLORIO-076',1,'dodrio');
  s.sides.opponent.active=core.makePokemonSlot('SNAPFLORIO-041',1,'magikarp');
  return s;
}
test('Dodrio ex at zero Energy still shows both moves without throwing',()=>{
 const s=battle();
 const card=data.cardById('SNAPFLORIO-076');assert.equal(card.name,'Dodrio ex');
 assert.deepEqual(card.attacks.map(a=>a.name),['Unfair Fight','Beak Invasion']);
 for(let i=0;i<card.attacks.length;i++){
   assert.doesNotThrow(()=>core.attackAvailability(s,'player',i,card.id));
   assert.doesNotThrow(()=>core.attackDamagePreview(s,'player',i,card.id));
 }
 const unavailable=core.attackAvailability(s,'player',1,card.id);
 assert.equal(unavailable.usable,false);assert.match(unavailable.reason,/Needs 3 Colourless/);
 const preview=core.attackDamagePreview(s,'player',1,card.id);
 assert.equal(preview.variable,true);
 assert.match(preview.text,/\d+–200/);
});
test('Beak Invasion previews cannot change cards, actions or RNG',()=>{
 const s=battle();s.sides.player.active.energy={Colorless:3};
 const before=JSON.stringify(s);
 for(let i=0;i<5;i++)core.attackDamagePreview(s,'player',1,'SNAPFLORIO-076');
 assert.equal(JSON.stringify(s),before);
 const choices=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
 assert.equal(choices.length,6,'the real attack still offers all six 0-5 card choices');
 const action=choices.find(a=>a.choiceOption===5);
 const beforeDeck=s.sides.opponent.deck.length;
 assert.doesNotThrow(()=>core.applyAction(s,'player',action));
 assert.equal(s.sides.opponent.deck.length,beforeDeck-Math.min(5,beforeDeck));
 assert.ok(s.log.some(entry=>entry.type==='attack'&&entry.attack==='Beak Invasion'),'real attack was executed');
});
test('all 1243 Classic attacks provide a safe inspection preview',()=>{
 const s=battle();let count=0;
 for(const c of data.CARDS.filter(c=>c.kind==='pokemon')){
   s.sides.player.active=core.makePokemonSlot(c.id,1,c.id);
   for(const [i,a] of (c.attacks||[]).entries()){
     const result=core.attackDamagePreview(s,'player',i,c.id);
     assert.ok(result&&typeof result.text==='string',c.id+' '+a.name+' preview available');
     count++;
   }
 }
 assert.equal(count,1243);
});
