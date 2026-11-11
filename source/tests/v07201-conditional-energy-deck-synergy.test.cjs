'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const synergy=require('../app/src/main/assets/tcg-deck-synergy.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const owned=data.CARDS.filter(c=>c.battleEnabled&&c.setId==='ex11').map(c=>({gameplayId:c.id,quantity:4}));
const slowking='ex11-28';
const focused=(types)=>builder.buildDeck(owned,{sets:['ex11'],focusCardId:slowking,types,style:'competitive'});
const count=(d,id)=>d.cards.filter(c=>c===id).length;
test('Slowking records separate printed type, attack costs, and optional Water/Psychic Energy payoffs',()=>{
 const card=data.cardById(slowking),m=synergy.metadata(card);
 assert.deepEqual(card.types,['Water']);
 assert.deepEqual(card.attacks[0].cost,'CC');
 assert.deepEqual(card.deckMeta.preferredEnergyTypes,['Water','Psychic']);
 assert.deepEqual(card.deckMeta.conditionalAttackEnergyTypes,['Water','Psychic']);
 assert.deepEqual(m.conditionalAttackEnergyTypes,['Water','Psychic']);
 assert.deepEqual(card.deckMeta.conditionalAttackPayoffs.map(p=>[p.energyType,p.benefit]),[['Water','damage-bonus'],['Psychic','special-energy-discard']]);
 assert.ok(card.abilities.some(a=>a.name==='Prize Shift'),'Prize Shift is an independent Power and should remain enabled');
});
test('Single-type Water and Psychic builds support Slowking; Lightning cannot focus its inactive attack',()=>{
 for(const type of ['Water','Psychic']){
  const d=focused([type]);assert.ok(d.ok,type+': '+d.errors.join(' '));
  assert.ok(count(d,slowking)>0,type);
  assert.ok(d.energyTypes.includes(type));
  assert.ok(data.validateDeck(d.cards).ok);
 }
 const lightning=focused(['Lightning']);assert.equal(lightning.ok,false);
});
test('Explicit Water/Psychic pairing keeps both Energy options for Psychic Option',()=>{
 const d=focused(['Water','Psychic']);
 assert.ok(d.ok,d.errors?.join(' '));
 assert.deepEqual(d.energyTypes,['Water','Psychic']);
 assert.ok(count(d,slowking)>0);
});
test('Lightning-only CPU excludes an off-type Slowking support family, reproducing prior seeds',()=>{
 for(const seed of [32,38,3,7]){
  const d=cpu.generate({sets:['ex11'],type:'Lightning',seed});
  assert.ok(d.ok,d.error);assert.ok(d.energyTypes.includes('Lightning'));
  assert.ok(!d.energyTypes.includes('Water')&&!d.energyTypes.includes('Psychic'),'Lightning deck unexpectedly uses Slowking payoff Energy');
  assert.equal(count(d,slowking),0,'Lightning seed '+seed+' has unusable Slowking');
  assert.equal(d.cards.includes('ex11-83'),false,'Lightning seed '+seed+' has stranded Slowpoke');
 }
});
test('CPU Psychic can use Slowking as a real alternative-type attacker',()=>{
 const d=cpu.generate({sets:['ex11'],type:'Psychic',seed:32});
 assert.ok(d.ok,d.error);assert.ok(count(d,slowking)>0);
 assert.ok(d.energyTypes.includes('Psychic'));
});
test('Rule-derived conditional Energy synergies apply to older EX cards too',()=>{
 for(const [id,required] of [['ex8-3',['Grass']],['ex8-5',['Psychic','Fighting']],['ex8-37',['Fire']]]){
  const m=synergy.metadata(data.cardById(id));
  assert.deepEqual(m.conditionalAttackEnergyTypes,required,id);
 }
 const unrelated=data.cardById('ex11-13');assert.deepEqual(synergy.metadata(unrelated).conditionalAttackEnergyTypes,[]);
});

test('An existing Lightning deck gets a clear warning rather than being declared illegal',()=>{
 const cards=[data.cardById('ex11-28'),data.cardById('ex11-83')];
 assert.match(synergy.report(cards,['Lightning']).warnings.join(' '),/Slowking.*needs Water or Psychic Energy/);
 assert.ok(!synergy.report(cards,['Water']).warnings.some(w=>/Slowking/.test(w)));
});
