'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const deck=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const cards=require('../app/src/main/assets/tcg-classic-xy-base.js');
const rootFile=path.join(root,'data/classic/xy1-print-compact.json');
test('XY fallback never invents Pokemon or changes non-XY modes',()=>{
 assert.equal(deck.rescueXY1Deck([],{sets:['xy1'],types:['Fairy']}),null);
 assert.equal(deck.rescueXY1Deck([],{sets:['bw11'],types:['Fairy']}),null);
 assert.equal(deck.rescueXY1Deck([],{sets:['xy1'],types:['Grass'],focusCardId:'xy1-1'}),null);
});
test('XY fallback builds legal, owned 30-card full evolution families across four types',
 {skip:!fs.existsSync(rootFile)},()=>{
 const owned=cards.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false)
   .map(c=>({gameplayId:c.id,quantity:4}));
 let passed=0,hasEvolution=false;
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless']){
  const result=deck.rescueXY1Deck(owned,{sets:['xy1'],types:[type]});
  if(!result)continue;
  passed++;
  assert.equal(result.cards.length,30,`${type}: 30`);
  assert.equal(data.validateDeck(result.cards).ok,true,`${type}: legal`);
  const hand=result.cards.map(data.cardById);
  assert.ok(hand.every(c=>c?.setId==='xy1'&&c.battleEnabled),`${type}: same-set playable`);
  for(const c of hand.filter(c=>c.kind==='pokemon'&&c.stage!=='Basic')){
   hasEvolution=true;
   assert.ok(hand.some(p=>p.kind==='pokemon'&&p.name===c.evolvesFrom),`${type}: missing ${c.evolvesFrom}`);
  }
  if(type==='Fairy')assert.ok(result.energyTypes.includes('Fairy'));
 }
 assert.ok(passed>=4,`expected >=4 legal archetypes, got ${passed}`);
 assert.ok(hasEvolution,'at least one complete family should be exercised');
});
