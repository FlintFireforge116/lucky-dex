'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.join(__dirname,'..','app','src','main','assets');
const Locations=require(path.join(ROOT,'arcade-fishing-locations.js'));
const Core=require(path.join(ROOT,'arcade-fishing-core.js'));
const Species=require(path.join(ROOT,'adventure','adventure-species.js')).byId;

test('Fishing regions and spots are authored in canonical progression order',()=>{
  assert.deepEqual(Locations.REGION_ORDER,['kanto','johto','hoenn','sinnoh','unova','kalos','alola','galar','paldea']);
  const cat=Locations.buildCatalog(Species);
  for(const regionId of Locations.REGION_ORDER){
    const region=cat.regions[regionId];
    assert.ok(region,regionId);
    assert.equal(region.areas.length,4,`${regionId} should have four spots`);
    assert.equal(new Set(region.areas.map(a=>a.id)).size,4);
    region.areas.forEach((area,index)=>{
      assert.equal(area.order,index);
      assert.ok(area.scene,`${area.name} needs an explicit scene`);
      assert.ok(area.fallbackBackdrop,`${area.name} needs a local fallback`);
      assert.ok(area.backdropPosition,`${area.name} needs a crop`);
      assert.ok(area.pool.length>0,`${area.name} needs an authored pool`);
      assert.ok(area.pool.some(p=>p.minRod==='old'),`${area.name} needs a local Old Rod catch`);
    });
  }
});

test('Kanto spot ecology is intentionally distinct and rod-gated',()=>{
  const c=Core.buildCatalog(Species), k=c.regions.kanto;
  const byName=name=>k.areas.find(a=>a.name===name);
  const ids=a=>new Set(a.pool.map(p=>p.speciesId));
  for(const id of [129,118,54,60])assert.ok(ids(byName('Cerulean Waters')).has(id));
  for(const id of [72,98,116,90])assert.ok(ids(byName('Vermilion Harbour')).has(id));
  for(const id of [129,60,54])assert.ok(ids(byName('Safari Pond')).has(id));
  const dratini=byName('Safari Pond').pool.find(p=>p.speciesId===147);
  assert.ok(dratini); assert.notEqual(dratini.minRod,'old');
  for(const id of [90,86])assert.ok(ids(byName('Seafoam Coast')).has(id));
  assert.notDeepEqual([...ids(byName('Cerulean Waters'))].sort((a,b)=>a-b),[...ids(byName('Vermilion Harbour'))].sort((a,b)=>a-b));
  const oldForbidden=new Set([61,130,134]);
  for(const area of k.areas)for(const p of area.pool)if(oldForbidden.has(p.speciesId))assert.notEqual(p.minRod,'old');
  const safari=byName('Safari Pond');
  assert.match(safari.scene,/Safari_Zone_area_2_FRLG/i);
  assert.doesNotMatch(safari.scene,/Safari_Zone_Center/i);
});
