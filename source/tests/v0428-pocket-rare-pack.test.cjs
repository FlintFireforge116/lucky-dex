'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

test('TCG Pocket Rare Pack preserves slot progression, uplifts each roll, and guarantees one great hit',()=>{
  const policy=fresh('pack-policy-v0343.js');
  const rarity=fresh('card-rarity-v0253.js');
  assert.equal(rarity.classify({source:'tcgp',rarity:'Four Diamond'}).rarityClass,'double-rare');
  assert.equal(rarity.classify({source:'tcgp',rarity:'One Star'}).rarityClass,'illustration');
  const set={id:'A1',name:'Genetic Apex'};
  const base=policy.slotPlan(set,{source:'tcgp',luckyPack:false,random:()=>.99});
  const slots=policy.slotPlan(set,{source:'tcgp',luckyPack:true,random:()=>.99});
  assert.equal(slots.length,5);
  assert.equal(slots.filter(slot=>slot.rarePackGreatHit).length,1,'Rare Pack must force exactly one great hit');
  for(let i=0;i<slots.length;i++)assert.deepEqual(slots[i].allowedClasses,base[i].allowedClasses,'Rare Pack must preserve the underlying slot identity');
  const great=slots.find(slot=>slot.rarePackGreatHit);
  assert.equal(great.rarePackAllowedClasses.includes('double-rare'),false,'ordinary 4-diamond ex cards must not satisfy the guaranteed great-hit slot');
  assert.ok(great.rarePackAllowedClasses.every(value=>['ultra','illustration','special-illustration','secret'].includes(value)));
  assert.equal(policy.upgradePocketRareClass('common'),'uncommon');
  assert.equal(policy.upgradePocketRareClass('rare'),'double-rare');
  assert.equal(policy.upgradePocketRareClass('double-rare'),'ultra');
});

test('TCG Pocket Rare Pack gets a dedicated reveal intro and summary instead of silently looking like a normal pack',()=>{
  const flow=read('pack-flow-v0165.js');
  assert.match(flow,/RARE PACK/);
  assert.match(flow,/pack\.source==='tcgp'&&pack\.luckyPack/);
  assert.match(flow,/RARE PACK COMPLETE/);
  assert.match(flow,/playRarePackIntroV04030/);
  assert.match(flow,/RARE PACK · UPLIFT/);
});
