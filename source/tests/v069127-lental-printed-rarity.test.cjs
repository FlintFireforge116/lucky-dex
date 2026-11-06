'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const L=require(path.join(A,'tcg-classic-lental.js'));
const R=require(path.join(A,'card-rarity-v0253.js'));
const P=require(path.join(A,'pack-policy-v0343.js'));
const all=L.CARDS;
function sourceCard(id){const card=L.cardById(id); assert.ok(card,id);return card;}
test('Florio Foongus #068 is printed gold-star Rare Holo, not Common',()=>{
 const card=sourceCard('SNAPFLORIO-068'); assert.equal(card.name,'Foongus');
 assert.equal(card.rarity,'Rare Holo');assert.equal(R.classify(card).rarityClass,'rare');
});
test('Founja Illumina Toucannon ex #073 is printed two-star Ultra Rare, not Rare',()=>{
 const card=sourceCard('SNAPFOUNJA-073'); assert.match(card.name,/Toucannon ex/i);
 assert.equal(card.rarity,'Ultra Rare');assert.equal(R.classify(card).rarityClass,'ultra');
});
test('Lental rarity catalogue maintains 123 Florio and 86 Founja records',()=>{
 for(const [id,len] of [['SNAPFLORIO',123],['SNAPFOUNJA',86]]){
   const cards=all.filter(c=>c.setId===id);assert.equal(cards.length,len);
   assert.equal(new Set(cards.map(c=>c.id)).size,len);
   for(const card of cards){assert.ok(['Common','Uncommon','Rare','Rare Holo','Ultra Rare'].includes(card.rarity),card.id);}
 }
});
test('both corrected rarities are eligible only in rare-or-better pack slots',()=>{
 for(const id of ['SNAPFLORIO-068','SNAPFOUNJA-073']){
   const card=sourceCard(id);const set={id:'library:'+card.setId,name:card.setId,_libraryKey:card.setId,_lentalSet:true,cards:[card]};
   const slots=P.slotPlan(set,{source:'tcg'});
   assert.equal(slots.length,10);
   assert.ok(slots.slice(0,7).every(slot=>!P.cardMatchesDescriptor(card,slot,set,'tcg',R.classify)),id);
   assert.ok(slots.slice(7).some(slot=>P.cardMatchesDescriptor(card,slot,set,'tcg',R.classify)),id);
 }
});
test('saved-card rarity reconciliation executes before binder rendering and cache reuse',()=>{
 const s=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 assert.ok(s.indexOf('function reconcileLentalRarityV069127')<s.indexOf('let state = loadState();'));
 assert.match(s,/for\(const card of Object\.values\(state\.cards\|\|\{\}\)\)reconcileLentalRarityV069127\(card\)/);
 assert.match(s,/for\(const card of Object\.values\(packCacheV13\.cards\)\)reconcileLentalRarityV069127\(card\)/);
 assert.match(s,/function cardDisplayRarityV03515\(card\)\{[\s\S]{0,120}canonicalLentalRarityV069127\(card\)/);
});
