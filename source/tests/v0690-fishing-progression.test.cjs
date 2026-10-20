'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../app/src/main/assets/arcade-fishing-core.js');
const Species=require('../app/src/main/assets/adventure/adventure-species.js').byId;
const catalog=Core.buildCatalog(Species);
const area=(r,i)=>catalog.regions[r].areas[i];
const caught=(id)=>({kind:'pokemon',speciesId:id,name:Species[id]?.name||String(id),rarity:'common',sizeRatio:1,lengthM:1,weightKg:1,value:2});

test('fresh Fishing progression starts at Kanto spot one only',()=>{
  const save={}; const p=Core.ensureProgression(save,catalog);
  assert.deepEqual(p.unlockedRegions,['kanto']);
  assert.deepEqual(p.unlockedAreas.kanto,[area('kanto',0).id]);
  assert.equal(Core.isRegionUnlocked(p,'johto'),false);
  assert.equal(Core.isAreaUnlocked(p,'kanto',area('kanto',1).id),false);
});

test('three distinct local species unlock the next spot and duplicates/out-of-pool catches do not',()=>{
  const save={}; const first=area('kanto',0), second=area('kanto',1);
  const ids=first.pool.slice(0,3).map(x=>x.speciesId);
  Core.recordProgressionCatch(save,catalog,first,ids[0]);
  Core.recordProgressionCatch(save,catalog,first,ids[0]);
  Core.recordProgressionCatch(save,catalog,first,9999);
  let p=Core.ensureProgression(save,catalog);
  assert.equal(Core.progressForArea(p,first.id).uniqueCaught,1);
  assert.equal(Core.isAreaUnlocked(p,'kanto',second.id),false);
  Core.recordProgressionCatch(save,catalog,first,ids[1]);
  const unlock=Core.recordProgressionCatch(save,catalog,first,ids[2]);
  p=Core.ensureProgression(save,catalog);
  assert.equal(Core.progressForArea(p,first.id).complete,true);
  assert.equal(Core.isAreaUnlocked(p,'kanto',second.id),true);
  assert.equal(unlock.spotUnlocked,second.id);
});

test('four completed spots plus regional target unlock the next region',()=>{
  const save={};
  for(let i=0;i<4;i++){
    const spot=area('kanto',i), ids=[...new Set(spot.pool.map(x=>x.speciesId))].slice(0,3);
    for(const id of ids)Core.recordProgressionCatch(save,catalog,spot,id);
  }
  let p=Core.ensureProgression(save,catalog);
  if(!Core.isRegionUnlocked(p,'johto')){
    const seen=new Set(Object.values(p.areaCaught).flat());
    for(const spot of catalog.regions.kanto.areas){
      for(const row of spot.pool){if(seen.size>=catalog.regions.kanto.regionalTarget)break;if(!seen.has(row.speciesId)){Core.recordProgressionCatch(save,catalog,spot,row.speciesId);seen.add(row.speciesId);}}
    }
  }
  p=Core.ensureProgression(save,catalog);
  assert.equal(catalog.regions.kanto.regionalTarget,10);
  assert.equal(Core.isRegionUnlocked(p,'johto'),true);
  assert.equal(Core.isAreaUnlocked(p,'johto',area('johto',0).id),true);
});

test('v0.68 migration preserves gear/economy/book, reconstructs progress, and is idempotent',()=>{
  const save={arcade:{fishing:{selectedRegion:'paldea',selectedArea:'paldea-north-sea',fishingTokens:77,rods:{old:true,good:true,super:false,deep:false},bait:{basic:4},book:{pokemon:{'129':{count:2},'118':{count:1},'54':{count:1},'72':{count:1}},junk:{'rusty-bike':{count:1}},treasure:{}}}}};
  const p1=Core.ensureProgression(save,catalog);
  const snapshot=JSON.stringify(p1);
  const s=Core.ensureState(save);
  assert.equal(s.fishingTokens,77); assert.equal(s.rods.good,true); assert.equal(s.bait.basic,4); assert.equal(s.book.pokemon['129'].count,2); assert.equal(s.book.junk['rusty-bike'].count,1);
  assert.ok(Core.progressForArea(p1,area('kanto',0).id).uniqueCaught>=3);
  assert.equal(s.selectedRegion,'kanto');
  assert.ok(Core.isAreaUnlocked(p1,'kanto',s.selectedArea));
  const p2=Core.ensureProgression(save,catalog);
  assert.equal(JSON.stringify(p2),snapshot);
});
