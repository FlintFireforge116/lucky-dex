'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const mod='../app/src/main/assets/pack-policy-v0343.js';
assert.equal(fs.existsSync(path.join(__dirname,mod)),true,'pack-policy-v0343.js must exist');
const P=require(mod);
const samples=[
  [{id:'base1',name:'Base Set',releaseDate:'1999-01-09'},'wotc_11',11,650],
  [{id:'ecard1',name:'Expedition Base Set',releaseDate:'2002-09-15'},'ecard_ex_9',9,550],
  [{id:'dp1',name:'Diamond & Pearl',releaseDate:'2007-05-01'},'dp_bw_xy_10',10,600],
  [{id:'sm1',name:'Sun & Moon',releaseDate:'2017-02-03'},'sm_swsh_10',10,600],
  [{id:'sv1',name:'Scarlet & Violet',releaseDate:'2023-03-31'},'sv_10',10,600],
  [{id:'dv',name:'Dragon Vault',releaseDate:'2012-10-05'},'dragon_vault_5',5,400],
  [{id:'dc',name:'Double Crisis',releaseDate:'2015-03-25'},'double_crisis_7',7,450],
  [{id:'det',name:'Detective Pikachu',releaseDate:'2019-04-05'},'detective_pikachu_4',4,325],
  [{id:'gen',name:'Generations',releaseDate:'2016-02-22'},'generations_10_rc',10,650],
  [{id:'cel25',name:'Celebrations',releaseDate:'2021-10-08'},'celebrations_4',4,375],
  [{id:'30th',name:'30th Celebration',releaseDate:'2026-09-16'},'30th_celebration_6',6,500],
];
for(const [set,id,count,price] of samples){
  const profile=P.resolve(set,'tcg');
  assert.equal(profile.id,id,set.name+' profile');
  assert.equal(P.packSizeFor(set,'tcg'),count,set.name+' count');
  assert.equal(P.priceFor(set,'tcg'),price,set.name+' price');
  assert.equal(profile.cardCount,count);
  assert.equal(profile.price,price);
  assert.ok(Array.isArray(profile.slots),'slots exposed');
}
const pocket=P.resolve({id:'A1',name:'Genetic Apex'},'tcgp');
assert.equal(pocket.source,'tcgp');
assert.equal(P.packSizeFor({id:'A1',name:'Genetic Apex'},'tcgp'),5);
assert.equal(P.priceFor({id:'A1',name:'Genetic Apex'},'tcgp'),450);
const unknown=P.resolve({id:'future',name:'Future Set'},'tcg');assert.equal(unknown.id,'unknown','incomplete metadata fails closed');assert.equal(unknown.purchasable,false,'unknown physical product is not purchasable');
console.log('PASS v0.34.3 pack policy resolution');
