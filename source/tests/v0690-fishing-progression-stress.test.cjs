'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../app/src/main/assets/arcade-fishing-core.js');
const Locations=require('../app/src/main/assets/arcade-fishing-locations.js');
const Species=require('../app/src/main/assets/adventure/adventure-species.js').byId;
const catalog=Core.buildCatalog(Species);
const rods=['old','good','super','deep'];

test('all regions and spots are sequentially reachable from a fresh save using local catches',()=>{
  const save={};
  const order=Locations.REGION_ORDER;
  for(let ri=0;ri<order.length;ri++){
    const regionId=order[ri], region=catalog.regions[regionId];
    let p=Core.ensureProgression(save,catalog);
    assert.equal(Core.isRegionUnlocked(p,regionId),true,`${region.name} should be unlocked when its turn is reached`);
    for(const spot of region.areas){
      p=Core.ensureProgression(save,catalog);
      assert.equal(Core.isAreaUnlocked(p,regionId,spot.id),true,`${spot.name} should unlock sequentially`);
      for(const speciesId of [...new Set(spot.pool.map(row=>row.speciesId))]) Core.recordProgressionCatch(save,catalog,spot,speciesId);
    }
    p=Core.ensureProgression(save,catalog);
    assert.ok(region.areas.every(spot=>Core.progressForArea(p,spot.id).complete),`${region.name} spots should all be complete`);
    if(order[ri+1]) assert.equal(Core.isRegionUnlocked(p,order[ri+1]),true,`${order[ri+1]} should unlock after ${region.name}`);
  }
});

test('every rod rolls only species authored locally and allowed by that rod',()=>{
  for(const region of Object.values(catalog.regions)) for(const area of region.areas) for(const rod of rods){
    const allowed=new Set(area.pool.filter(row=>Locations.minRodTier(row.minRod)<=Locations.ROD_TIER[rod]).map(row=>row.speciesId));
    assert.ok(allowed.size>0,`${area.name} must have at least one ${rod} catch`);
    for(let seed=1;seed<=40;seed++){
      const c=Core.rollCatch({area,speciesById:Species,rod,bait:'none',forceKind:'pokemon',seed});
      assert.equal(c.kind,'pokemon');
      assert.equal(allowed.has(c.speciesId),true,`${area.name}/${rod} rolled out-of-pool species ${c.speciesId}`);
    }
  }
});

test('legacy migration is idempotent across representative v0.68 fishing saves',()=>{
  const speciesIds=Object.keys(Species).map(Number).filter(id=>Number.isFinite(id)&&Species[id]?.types?.includes('water'));
  for(let i=0;i<1000;i++){
    const book={};
    for(let j=0;j<8;j++){
      const id=speciesIds[(i*17+j*31)%speciesIds.length];
      book[id]={count:1+(i+j)%3,largestM:1,bestValue:2};
    }
    const save={profile:{coins:i%500},arcade:{fishing:{selectedRegion:Locations.REGION_ORDER[i%Locations.REGION_ORDER.length],selectedArea:null,fishingTokens:i%97,rods:{old:true,good:i%2===0},bait:{basic:i%5},book:{pokemon:book,junk:{},treasure:{}}}}};
    const first=JSON.stringify(Core.ensureProgression(save,catalog));
    const second=JSON.stringify(Core.ensureProgression(save,catalog));
    assert.equal(second,first,`migration ${i} must be idempotent`);
  }
});
