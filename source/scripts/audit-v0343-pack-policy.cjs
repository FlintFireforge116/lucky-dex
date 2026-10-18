#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const rarity=require('../app/src/main/assets/card-rarity-v0253.js');
globalThis.LuckyDexCardRarity=rarity;
const policy=require('../app/src/main/assets/pack-policy-v0343.js');

const flowPath=path.join(__dirname,'..','app','src','main','assets','pack-flow-v0165.js');
const flow=fs.readFileSync(flowPath,'utf8');
const sets=[];
const pair=/\[\s*['"]([^'"\n]+)['"]\s*,\s*['"](\d{4}-\d{2}-\d{2})['"]\s*\]/g;
for(const match of flow.matchAll(pair))sets.push({name:match[1],releaseDate:match[2]});

const rarityFixtures=[
  'Common','Uncommon','Rare','Rare Holo','Double Rare','Ultra Rare','Illustration Rare','Special Illustration Rare',
  'LEGEND','Rare Prime','Rare Holo LV.X','Rare BREAK','Shining Rare','Radiant Rare','Amazing Rare','ACE SPEC Rare',
  'Character Rare','Trainer Gallery Rare','Secret Rare','Hyper Rare','Gold Rare','Crown Rare',
  'One Diamond','Two Diamond','Three Diamond','Four Diamond','One Star','Two Star','Three Star','One Shiny','Two Shiny'
];
const issues=policy.diagnostics(sets,rarityFixtures);
for(const [subset,parent] of policy.SUBSETS){
  const resolved=policy.parentFor({name:subset});
  if(!resolved?.name||resolved.name!==parent)issues.push({kind:'subset-parent',value:subset,diagnostic:'parent-mismatch'});
}
if(!sets.length)issues.push({kind:'catalogue',value:'PHYSICAL_SET_RELEASE_DATES_V0244_RAW',diagnostic:'no-fixtures-found'});
if(issues.length){
  console.error(`FAIL v0.34.3 pack policy audit (${issues.length} issue${issues.length===1?'':'s'})`);
  for(const row of issues)console.error(`- ${row.kind}: ${row.value} (${row.diagnostic||'unresolved'})`);
  process.exit(1);
}
console.log(`PASS v0.34.3 pack policy audit · ${sets.length} physical catalogue rows · ${rarityFixtures.length} rarity labels · ${policy.SUBSETS.length} subset mappings`);
