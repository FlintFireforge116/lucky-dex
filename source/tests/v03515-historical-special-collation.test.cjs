'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../app/src/main/assets/pack-policy-v0343.js');

const count=(slots,pred)=>slots.filter(pred).length;

test('Legendary Collection uses its real 6 common + 3 uncommon + reverse + rare contract',()=>{
  const slots=P.slotPlan({name:'Legendary Collection',releaseDate:'2002-05-24',_librarySeries:'Other'},{source:'tcg'});
  assert.equal(slots.length,11);
  assert.equal(count(slots,s=>s.allowedClasses.length===1&&s.allowedClasses[0]==='common'),6);
  assert.equal(count(slots,s=>s.allowedClasses.length===1&&s.allowedClasses[0]==='uncommon'),3);
  assert.equal(count(slots,s=>s.finish==='reverse-holo'),1);
  assert.equal(count(slots,s=>s.rareOrHigher),1);
});

test('Double Crisis guarantees 3 common + 2 uncommon + reverse + holo hit',()=>{
  const slots=P.slotPlan({name:'Double Crisis',releaseDate:'2015-03-25',_librarySeries:'XY'},{source:'tcg'});
  assert.equal(slots.length,7);
  assert.equal(count(slots,s=>s.allowedClasses.length===1&&s.allowedClasses[0]==='common'),3);
  assert.equal(count(slots,s=>s.allowedClasses.length===1&&s.allowedClasses[0]==='uncommon'),2);
  assert.equal(count(slots,s=>s.finish==='reverse-holo'),1);
  const hit=slots.find(s=>s.id==='holo-hit');
  assert.ok(hit?.rareOrHigher);
  assert.equal(hit?.finish,'holo');
});

test('Generations keeps core and Radiant Collection slots inside the real GEN set',()=>{
  const slots=P.slotPlan({name:'Generations',releaseDate:'2016-02-22',_librarySeries:'XY'},{source:'tcg'});
  assert.equal(slots.length,10);
  assert.equal(count(slots,s=>s.id.startsWith('core-common-')),4);
  assert.equal(count(slots,s=>s.id.startsWith('core-uncommon-')),2);
  assert.equal(count(slots,s=>s.id==='core-reverse'&&s.finish==='reverse-holo'),1);
  assert.equal(count(slots,s=>s.id==='core-rare'&&s.rareOrHigher),1);
  assert.equal(count(slots,s=>s.specialRule==='radiant-collection'),2);
  assert.ok(slots.filter(s=>s.specialRule==='radiant-collection').every(s=>s.pool==='core'));
  assert.ok(slots.filter(s=>s.id.startsWith('core-')).every(s=>(s.excludeNumberPrefixes||[]).includes('RC')));
});

test('Legendary Treasures uses its 4 common + 2 uncommon + reverse/holo + rare + 2 RC contract',()=>{
  const slots=P.slotPlan({name:'Legendary Treasures',releaseDate:'2013-11-06',_librarySeries:'Black & White'},{source:'tcg'});
  assert.equal(P.resolve({name:'Legendary Treasures',releaseDate:'2013-11-06'},'tcg').id,'legendary_treasures_10_rc');
  assert.equal(slots.length,10);
  assert.equal(count(slots,s=>s.id.startsWith('core-common-')),4);
  assert.equal(count(slots,s=>s.id.startsWith('core-uncommon-')),2);
  assert.equal(count(slots,s=>s.finish==='reverse-or-holo'),1);
  assert.equal(count(slots,s=>s.id==='core-rare'&&s.rareOrHigher),1);
  assert.equal(count(slots,s=>s.specialRule==='radiant-collection'),2);
});

test('Celebrations permits at most one Classic Collection replacement slot',()=>{
  const slots=P.slotPlan({name:'Celebrations',releaseDate:'2021-10-08',_libraryKey:'Ann25th'},{source:'tcg'});
  const classicReplacements=slots.flatMap(s=>s.replacements||[]).filter(r=>r.specialRule==='celebrations-classic'||r.subsetKeys?.some?.(k=>String(k).toLowerCase()==='ann25thr'));
  assert.equal(classicReplacements.length,1);
});

test('known separate subset catalogue rows are never purchasable as boosters',()=>{
  for(const set of [
    {name:'Celebrations',_libraryKey:'Ann25thR'},
    {name:'Shining Fates',_libraryKey:'SWSH45SV'},
    {name:'Hidden Fates Shiny Vault',_libraryKey:'SMA'},
  ]){
    const profile=P.resolve(set,'tcg');
    assert.equal(profile.purchasable,false,String(set._libraryKey));
    assert.equal(profile.productKind,'subset',String(set._libraryKey));
  }
});

test('inline gallery cards can only enter their audited replacement slot',()=>{
  const set={name:'Brilliant Stars',_libraryKey:'SWSH9',_librarySeries:'Sword & Shield'};
  const slots=P.slotPlan(set,{source:'tcg'});
  const common=slots.find(s=>s.id==='common-1');
  const reverse=slots.find(s=>s.id==='reverse');
  const gallery={id:'SWSH9-TG01',localId:'TG01',rarity:'Trainer Gallery Rare',_librarySetKey:'SWSH9'};
  const classify=()=>({rarityClass:'illustration',tier:3});
  assert.equal(P.cardMatchesDescriptor(gallery,common,set,'tcg',classify),false);
  assert.equal(P.cardMatchesDescriptor(gallery,reverse,set,'tcg',classify),true);
  assert.ok((reverse.replacements||[]).some(r=>r.pool==='inline-subset'&&(r.requiredNumberPrefixes||[]).includes('TG')));
});

test('external subset identities are accepted only by their declared replacement slot',()=>{
  const set={name:'Celebrations',_libraryKey:'Ann25th',_librarySeries:'Sword & Shield'};
  const slots=P.slotPlan(set,{source:'tcg'});
  const classic={id:'Ann25thR-4',localId:'4',rarity:'Ultra Rare',_librarySetKey:'Ann25thR'};
  const classify=()=>({rarityClass:'ultra',tier:4});
  assert.equal(P.cardMatchesDescriptor(classic,slots[0],set,'tcg',classify),false);
  assert.equal(P.cardMatchesDescriptor(classic,slots[2],set,'tcg',classify),true);
  assert.equal(P.cardMatchesDescriptor(classic,slots[3],set,'tcg',classify),false);
});

test('Shining Fates shiny-vault rows never leak into ordinary core slots',()=>{
  const set={name:'Shining Fates',_libraryKey:'SWSH45',_librarySeries:'Sword & Shield'};
  const slots=P.slotPlan(set,{source:'tcg'});
  const shiny={id:'SWSH45SV-SV003',localId:'SV003',rarity:'Shiny Rare',_librarySetKey:'SWSH45SV'};
  const classify=()=>({rarityClass:'illustration',tier:3});
  assert.equal(P.cardMatchesDescriptor(shiny,slots[0],set,'tcg',classify),false);
  assert.equal(P.cardMatchesDescriptor(shiny,slots.find(s=>s.id==='reverse'),set,'tcg',classify),true);
});

test('runtime external-subset resolution is key based and fail-closed',()=>{
  const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(source,/findSetByLibraryKeysV03515/);
  assert.match(source,/effective\?\.pool==='subset-key'/);
  assert.match(source,/External subset rows are fail-closed/);
  assert.match(source,/!\['core','inline-subset','subset-key'\]\.includes/);
});
