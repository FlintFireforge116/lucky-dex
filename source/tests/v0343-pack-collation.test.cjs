'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const P=require('../app/src/main/assets/pack-policy-v0343.js');
const subsets=[
  ['Brilliant Stars Trainer Gallery','Brilliant Stars'],['Astral Radiance Trainer Gallery','Astral Radiance'],['Lost Origin Trainer Gallery','Lost Origin'],['Silver Tempest Trainer Gallery','Silver Tempest'],['Crown Zenith Galarian Gallery','Crown Zenith'],['Hidden Fates Shiny Vault','Hidden Fates'],['Celebrations Classic Collection','Celebrations'],['30th Celebration Classic Collection','30th Celebration']
];
for(const [name,parent] of subsets){const set={id:name.toLowerCase().replace(/ /g,'-'),name};assert.equal(P.isPurchasable(set,'tcg'),false,name+' hidden as booster');assert.equal(P.parentFor(set)?.name,parent,name+' parent');}
const gen=P.slotPlan({name:'Generations',releaseDate:'2016-02-22'},{source:'tcg'});assert.equal(gen.length,10);assert.equal(gen.filter(s=>s.pool==='core').length,10);assert.equal(gen.filter(s=>s.specialRule==='radiant-collection').length,2);assert.ok(gen.filter(s=>s.id.startsWith('core-')).every(s=>(s.excludeNumberPrefixes||[]).includes('RC')));
const sv=P.slotPlan({name:'Scarlet & Violet',releaseDate:'2023-03-31'},{source:'tcg'});assert.equal(sv.length,10);assert.equal(sv.filter(s=>s.allowedClasses.length===1&&s.allowedClasses[0]==='common').length,4);assert.equal(sv.filter(s=>s.allowedClasses.length===1&&s.allowedClasses[0]==='uncommon').length,3);assert.equal(sv.filter(s=>/^foil-/.test(s.id)).length,2);assert.equal(sv.filter(s=>s.rareOrHigher).length,1);
const th=P.slotPlan({name:'30th Celebration',releaseDate:'2026-09-16'},{source:'tcg'});assert.equal(th.length,6);assert.equal(th.filter(s=>s.pool==='core').length,5);assert.equal(th.filter(s=>s.pool==='special-energy').length,1);assert.equal(th.filter(s=>s.id==='pikachu-rare').length,1);
for(const [name,count] of [['Dragon Vault',5],['Double Crisis',7],['Detective Pikachu',4],['Celebrations',4]])assert.equal(P.slotPlan({name},{source:'tcg'}).length,count);
const pocket=P.slotPlan({name:'Genetic Apex'},{source:'tcgp'});assert.equal(pocket.length,5);assert.ok(pocket.slice(0,3).every(s=>!s.allowedClasses.includes('secret')),'Pocket positions 1-3 stay low');assert.ok(pocket[4].rareOrHigher,'Pocket card 5 is hit-oriented');assert.equal(P.slotPlan({name:'Deluxe Pack ex',_deluxe:true},{source:'tcgp'}).length,4);
const luckyPocket=P.slotPlan({name:'Genetic Apex'},{source:'tcgp',luckyPack:true});assert.equal(luckyPocket.filter(s=>s.rarePackGreatHit===true).length,1,'Pocket Rare Pack guarantees exactly one great hit');assert.ok(luckyPocket.every(s=>s.specialRule==='pocket-rare-uplift'),'Pocket Rare Pack keeps the canonical uplift descriptor contract');assert.ok(luckyPocket.some(s=>!s.rarePackGreatHit),'Pocket Rare Pack must not regress to the old all-hit contract');
const flow=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/pack-flow-v0165.js'),'utf8');
const acq=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/card-acquisition-v0246.js'),'utf8');
assert.match(flow,/boosterProductEligible/,'pack catalogue must filter products through the booster-only acquisition gate');
assert.match(acq,/boosterProductEligible/,'card acquisition must expose booster product eligibility helper');
console.log('PASS v0.34.3 subset mapping and slot collation contracts');
