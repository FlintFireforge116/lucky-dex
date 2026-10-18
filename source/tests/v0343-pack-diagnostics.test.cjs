const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const path=require('node:path');
const rarity=require('../app/src/main/assets/card-rarity-v0253.js');
globalThis.LuckyDexCardRarity=rarity;
const policy=require('../app/src/main/assets/pack-policy-v0343.js');

const sets=[
  {name:'Base Set',releaseDate:'1999-01-09'},
  {name:'Expedition Base Set',releaseDate:'2002-09-15'},
  {name:'Triumphant',releaseDate:'2010-11-03'},
  {name:'Brilliant Stars',releaseDate:'2022-02-25'},
  {name:'Brilliant Stars Trainer Gallery',releaseDate:'2022-02-25'},
  {name:'Scarlet & Violet',releaseDate:'2023-03-31'},
  {name:'Celebrations',releaseDate:'2021-10-08'},
  {name:'30th Celebration',releaseDate:'2026-09-16'}
];
const knownRarities=['Common','Uncommon','Rare','Rare Holo','Double Rare','Ultra Rare','Illustration Rare','Special Illustration Rare','LEGEND','Rare Prime','Rare BREAK','Radiant Rare','Amazing Rare','ACE SPEC Rare','Gold Rare','Crown Rare','One Star','Two Star','Three Star'];
const rows=policy.diagnostics(sets,knownRarities);
assert.deepEqual(rows,[],`known fixtures should audit cleanly: ${JSON.stringify(rows)}`);
assert.equal(policy.rateFamilyFor({name:'Triumphant',releaseDate:'2010-11-03'},'tcg'),'hgss-legend');
const future=policy.diagnostics([],['Quantum Prism Rare']);
assert.equal(future.length,1);
assert.equal(future[0].kind,'rarity');
assert.equal(future[0].value,'Quantum Prism Rare');
assert.equal(future[0].diagnostic,'unknown-rarity');
const audit=path.join(__dirname,'..','scripts','audit-v0343-pack-policy.cjs');
assert.equal(fs.existsSync(audit),true,'pack policy audit script must exist');
const auditOutput=cp.execFileSync(process.execPath,[audit],{encoding:'utf8'});
assert.match(auditOutput,/PASS v0\.34\.3 pack policy audit/);
console.log('PASS v0.34.3 pack policy diagnostics');
