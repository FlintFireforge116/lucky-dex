'use strict';
const assert=require('node:assert/strict');
const R=require('../app/src/main/assets/card-rarity-v0253.js');
const cases=[
  ['Common','common'],['Uncommon','uncommon'],['Rare','rare'],['Rare Holo','rare'],['Double Rare','double-rare'],['Ultra Rare','ultra'],['Illustration Rare','illustration'],['Special Illustration Rare','special-illustration'],['Secret Rare','secret'],['Hyper Rare','secret'],['Gold Rare','secret'],['Crown Rare','secret'],['LEGEND','historic-chase'],['Rare Prime','ultra'],['Rare Holo LV.X','ultra'],['Rare BREAK','ultra'],['Shining Rare','ultra'],['Radiant Rare','ultra'],['Amazing Rare','ultra'],['ACE SPEC Rare','ultra'],['Character Rare','illustration'],['Trainer Gallery Rare','illustration'],['One Diamond','common'],['Two Diamond','uncommon'],['Three Diamond','rare'],['Four Diamond','double-rare'],['One Star','illustration'],['Two Star','special-illustration'],['Three Star','secret'],['One Shiny','ultra'],['Two Shiny','special-illustration']
];
for(const [rarity,klass] of cases)assert.equal(R.classify({rarity}).rarityClass,klass,rarity);
const dbl=R.classify({rarity:'Double Rare'}),ultra=R.classify({rarity:'Ultra Rare'}),ir=R.classify({rarity:'Illustration Rare'}),sir=R.classify({rarity:'Special Illustration Rare'}),legend=R.classify({rarity:'LEGEND'});
assert.ok(dbl.revealRank<ultra.revealRank,'Ultra reveal outranks Double Rare');
assert.ok(ultra.revealRank<ir.revealRank,'Illustration Rare reveal outranks Ultra Rare');
assert.ok(ir.revealRank<sir.revealRank,'SIR reveal outranks Illustration Rare');
assert.equal(legend.revealStyle,'legend');assert.equal(legend.revealLabel,'LEGEND PULL');assert.ok(legend.revealRank>=sir.revealRank);
const future=R.classify({rarity:'Quantum Mosaic Rare'});assert.equal(future.rarityClass,'unknown');assert.equal(future.diagnostic,'unknown-rarity');assert.equal(future.revealStyle,'unknown');
const reverse=R.classify({rarity:'Common',_foil:'Reverse Holo'});assert.equal(reverse.rarityClass,'common');assert.equal(reverse.tier,0);assert.equal(reverse.finish,'reverse-holo');
console.log('PASS v0.34.3 rarity audit and reveal ordering');
