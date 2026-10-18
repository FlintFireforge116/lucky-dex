'use strict';
const assert=require('node:assert/strict');
const P=require('../app/src/main/assets/pack-policy-v0343.js');
const R=require('../app/src/main/assets/card-rarity-v0253.js');

const set=(id,name,deluxe=false)=>({id,name,_deluxe:deluxe});
const plan=(id,name,randomValue,deluxe=false)=>P.slotPlan(set(id,name,deluxe),{source:'tcgp',random:()=>randomValue});

// A-series bonus-card products: these predate Series B and use 8.33% sixth-card odds.
const wisdomBonus=plan('A4','Wisdom of Sea and Sky',0.08329);
assert.equal(wisdomBonus.length,6,'Wisdom of Sea and Sky must gain a sixth card below 8.330%');
assert.equal(plan('A4','Wisdom of Sea and Sky',0.08330).length,5,'Wisdom of Sea and Sky must remain five cards at/above 8.330%');
assert.equal(wisdomBonus[5].specialRule,'wisdom-baby-bonus');
for(const n of [32,66,70,75,77,101,166,171]){
  assert.equal(P.cardMatchesDescriptor({localId:String(n),number:String(n),rarity:'Three Diamond'},wisdomBonus[5],set('A4','Wisdom of Sea and Sky'),'tcgp',R.classify),true,`Wisdom bonus slot accepts canonical bonus-only card #${n}`);
}
assert.equal(P.cardMatchesDescriptor({localId:'33',number:'33',rarity:'Three Diamond'},wisdomBonus[5],set('A4','Wisdom of Sea and Sky'),'tcgp',R.classify),false,'Wisdom bonus slot rejects ordinary cards');
assert.equal(P.cardMatchesDescriptor({localId:'32',number:'32',rarity:'Three Diamond'},plan('A4','Wisdom of Sea and Sky',0.9)[0],set('A4','Wisdom of Sea and Sky'),'tcgp',R.classify),false,'Wisdom bonus-only babies cannot leak into regular positions');

const springsBonus=plan('A4a','Secluded Springs',0.08329);
assert.equal(springsBonus.length,6,'Secluded Springs must gain a sixth card below 8.330%');
assert.equal(plan('A4a','Secluded Springs',0.08330).length,5,'Secluded Springs must remain five cards at/above 8.330%');
for(const n of [23,59,63,77])assert.equal(P.cardMatchesDescriptor({localId:String(n),number:String(n),rarity:'Three Diamond'},springsBonus[5],set('A4a','Secluded Springs'),'tcgp',R.classify),true,`Secluded Springs bonus slot accepts #${n}`);
assert.equal(P.cardMatchesDescriptor({localId:'24',number:'24',rarity:'Three Diamond'},springsBonus[5],set('A4a','Secluded Springs'),'tcgp',R.classify),false,'Secluded Springs bonus slot rejects non-bonus cards');

// Series B regular products all use the 5.238% +1-card mechanic.
const bSeries=[
  ['B1','Mega Rising'],['B1a','Crimson Blaze'],['B2','Fantastical Parade'],['B2a','Paldean Wonders'],
  ['B2b','Mega Shine'],['B3','Pulsing Aura'],['B3a','Paradox Drive'],['B3b','Everyday Wonders'],
  ['B4','Ruler of the Skies'],['B4a','Team Rocket’s Ambition']
];
for(const [id,name] of bSeries){
  assert.equal(plan(id,name,0.05237).length,6,`${name} gains a sixth card below 5.238%`);
  assert.equal(plan(id,name,0.05238).length,5,`${name} stays five cards at/above 5.238%`);
}

const risingBonus=plan('B1','Mega Rising',0.01)[5];
assert.equal(risingBonus.specialRule,'pocket-shiny-bonus');
assert.equal(P.cardMatchesDescriptor({rarity:'One Shiny'},risingBonus,set('B1','Mega Rising'),'tcgp',R.classify),true,'Series B bonus accepts One Shiny');
assert.equal(P.cardMatchesDescriptor({rarity:'Two Shiny'},risingBonus,set('B1','Mega Rising'),'tcgp',R.classify),true,'Series B bonus accepts Two Shiny');
assert.equal(P.cardMatchesDescriptor({rarity:'One Star'},risingBonus,set('B1','Mega Rising'),'tcgp',R.classify),false,'Series B bonus rejects ordinary star cards');
assert.equal(P.cardMatchesDescriptor({rarity:'One Shiny'},plan('B1','Mega Rising',0.9)[0],set('B1','Mega Rising'),'tcgp',R.classify),false,'Series B shiny cards are bonus-only and cannot leak into regular positions');
assert.deepEqual(P.targetClassesFor(set('B1','Mega Rising'),risingBonus,'tcgp',()=>0.0),['ultra'],'standard B bonus begins with One Shiny branch');
assert.deepEqual(P.targetClassesFor(set('B1','Mega Rising'),risingBonus,'tcgp',()=>0.90),['special-illustration'],'standard B bonus can target Two Shiny branch');

// Mega Shine adds its bonus-only immersive Mew #086 alongside shiny cards.
const shineBonus=plan('B2b','Mega Shine',0.01)[5];
assert.equal(shineBonus.specialRule,'mega-shine-bonus');
assert.equal(P.cardMatchesDescriptor({localId:'86',number:'86',name:'Mew',rarity:'Three Star'},shineBonus,set('B2b','Mega Shine'),'tcgp',R.classify),true,'Mega Shine bonus accepts Mew #086');
assert.equal(P.cardMatchesDescriptor({localId:'85',number:'85',name:'Mew',rarity:'Three Star'},shineBonus,set('B2b','Mega Shine'),'tcgp',R.classify),false,'Mega Shine bonus rejects the ordinary immersive Mew #085');
assert.equal(P.cardMatchesDescriptor({localId:'86',number:'86',name:'Mew',rarity:'Three Star'},plan('B2b','Mega Shine',0.9)[4],set('B2b','Mega Shine'),'tcgp',R.classify),false,'Mew #086 is bonus-only and cannot leak into the normal fifth card');
assert.deepEqual(P.targetClassesFor(set('B2b','Mega Shine'),shineBonus,'tcgp',()=>0.99),['secret'],'Mega Shine bonus preserves a dedicated immersive-Mew branch');

// Deluxe Pack: Mega is the exception: 4 cards normally, 1.666% chance of a fifth Two-Shiny card.
const deluxeMegaBonus=plan('B4b','Deluxe Pack: Mega',0.01665,true);
assert.equal(deluxeMegaBonus.length,5,'Deluxe Pack: Mega gains a fifth card below 1.666%');
assert.equal(plan('B4b','Deluxe Pack: Mega',0.01666,true).length,4,'Deluxe Pack: Mega stays four cards at/above 1.666%');
assert.equal(deluxeMegaBonus[4].specialRule,'deluxe-mega-bonus');
assert.equal(P.cardMatchesDescriptor({rarity:'Two Shiny'},deluxeMegaBonus[4],set('B4b','Deluxe Pack: Mega',true),'tcgp',R.classify),true,'Deluxe Mega bonus accepts Two Shiny');
assert.equal(P.cardMatchesDescriptor({rarity:'One Shiny'},deluxeMegaBonus[4],set('B4b','Deluxe Pack: Mega',true),'tcgp',R.classify),false,'Deluxe Mega bonus rejects One Shiny');
assert.equal(P.cardMatchesDescriptor({rarity:'Two Shiny'},plan('B4b','Deluxe Pack: Mega',0.9,true)[0],set('B4b','Deluxe Pack: Mega',true),'tcgp',R.classify),false,'Deluxe Mega Two-Shiny cards are bonus-only');

// The first Deluxe Pack: ex has no +1-card mechanic, and older A-series packs remain unchanged.
assert.equal(plan('A4b','Deluxe Pack: ex',0,true).length,4,'Deluxe Pack: ex remains four cards with no bonus-card variant');
assert.equal(plan('A3b','Eevee Grove',0).length,5,'pre-bonus A-series packs remain five cards');

console.log('PASS v0.34.7 Pocket bonus-card collation');
