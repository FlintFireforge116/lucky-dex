'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../app/src/main/assets/arcade-fishing-core.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js').byId;
const CSS=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-fishing.css'),'utf8');
const JS=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-fishing.js'),'utf8');

test('junk collection has a substantial second wave of Pokemon-world finds',()=>{
  assert(C.JUNK.length>=32,`expected at least 32 junk finds, got ${C.JUNK.length}`);
  const names=new Set(C.JUNK.map(x=>x.name));
  for(const name of ['Rotten Leftovers','Rusty Bike','Slowpoke Tail','Torn Eon Ticket','Cracked PokéNav','Waterlogged Pokétch','Deflated Poké Doll','Faded Old Sea Map']) assert(names.has(name),name);
  assert.equal(new Set(C.JUNK.map(x=>x.id)).size,C.JUNK.length,'junk ids stay unique');
});


test('Developer Easter-junk forcing reaches the ultra Easter tier deterministically',()=>{
  const area={species:[129],region:'kanto'};
  const forced=C.rollCatch({area,speciesById:S,settings:{fishingEasterJunk:1},seed:7});
  assert.equal(forced.kind,'junk');
  assert.equal(forced.easter,true);
  assert.equal(forced.ultra,true,'Developer force should expose ultra Easter junk for testing');
});

test('Old Rod is deliberately limited to basic low-tier catches',()=>{
  assert.equal(typeof C.rodAllowsSpecies,'function');
  assert.equal(C.rodAllowsSpecies(S[129],'old'),true,'Magikarp belongs on Old Rod');
  assert.equal(C.rodAllowsSpecies(S[60],'old'),true,'Poliwag belongs on Old Rod');
  for(const id of [61,130,134,62]) assert.equal(C.rodAllowsSpecies(S[id],'old'),false,`${S[id].name} must not be an Old Rod catch`);
  const area={species:[129,61,130,134]};
  for(let seed=1;seed<=250;seed++){
    const c=C.rollCatch({area,speciesById:S,seed,rod:'old',forceKind:'pokemon'});
    assert.equal(c.speciesId,129,`Old Rod leaked ${c.name}`);
  }
});

test('rod tiers widen access instead of all rods sharing the same pool',()=>{
  assert.equal(C.rodAllowsSpecies(S[61],'good'),true,'Good Rod may reach mid-tier Poliwhirl');
  assert.equal(C.rodAllowsSpecies(S[134],'good'),false,'Vaporeon waits for a stronger rod');
  assert.equal(C.rodAllowsSpecies(S[134],'super'),true);
  assert.equal(C.rodAllowsSpecies(S[382],'super'),false,'legendary catches remain Deep Sea Rod territory');
  assert.equal(C.rodAllowsSpecies(S[382],'deep'),true);
});

test('Old Rod catch zone is slim and visually shorter than the whole pond',()=>{
  assert(C.RODS.old.zone<=.13,`Old Rod zone is still too thick: ${C.RODS.old.zone}`);
  assert(C.RODS.good.zone>C.RODS.old.zone&&C.RODS.super.zone>C.RODS.good.zone&&C.RODS.deep.zone>C.RODS.super.zone);
  assert.match(CSS,/\.fishing-catch-zone\{[^}]*left:\s*(?:1[89]|2\d)%[^}]*right:\s*(?:1[89]|2\d)%/,'catch zone should only cover roughly half to two-thirds of the pond width');
});

test('hidden Pokemon use location-specific water silhouettes while preserving size classes',()=>{
  assert.match(JS,/silhouetteSpeciesId/,'runtime should read the selected fishing spot silhouette');
  assert.match(JS,/silhouetteForCatch\(run\.catchItem,areaFor\(fishingState\(\)\)\)/,'hooked Pokemon should use the current spot proxy');
  assert.match(JS,/fishing-target-size-(?:small|medium|large)/,'runtime should still scale the local silhouette by catch size');
});

test('every fishing spot carries its own backdrop instead of only a region-wide image',()=>{
  const cat=C.buildCatalog(S);
  for(const region of Object.values(cat.regions)) for(const area of region.areas){
    assert(area.backdrop,`${area.name} missing backdrop`);
    assert(area.fallbackBackdrop,`${area.name} missing fallback`);
  }
  const safari=cat.regions.kanto.areas.find(a=>a.name==='Safari Pond');
  assert.match(safari.backdrop,/Safari|Fuchsia/i,'Safari Pond should point at Safari/Fuchsia art');
  const windworks=cat.regions.sinnoh.areas.find(a=>a.name==='Valley Windworks');
  assert.match(windworks.backdrop,/Valley_Windworks/i,'Valley Windworks should use its own map image');
});


test('every fishing area has at least one genuinely local Old Rod species',()=>{
  const cat=C.buildCatalog(S);
  for(const region of Object.values(cat.regions)) for(const area of region.areas){
    const old=area.species.filter(id=>C.rodAllowsSpecies(S[id],'old'));
    assert(old.length>0,`${region.name} / ${area.name} has no local Old Rod catch`);
  }
});

test('movement styles are dramatically distinct rather than tiny parameter nudges',()=>{
  function trace(behavior){const item={kind:'pokemon',difficulty:.62,behavior};const run=C.startFight(item,'good',123456);run.progress=.5;const ys=[];for(let i=0;i<180;i++){C.stepFight(run,{hold:i%20<10},16);ys.push(run.fishY);run.phase='playing';run.progress=.5;}return ys;}
  const stats=arr=>({range:Math.max(...arr)-Math.min(...arr),jumps:arr.slice(1).map((v,i)=>Math.abs(v-arr[i])).filter(x=>x>.018).length,maxJump:Math.max(...arr.slice(1).map((v,i)=>Math.abs(v-arr[i])))});
  const steady=stats(trace('steady')),dart=stats(trace('dart')),erratic=stats(trace('erratic'));
  assert(dart.maxJump>steady.maxJump*1.5,`dart should visibly snap more: ${JSON.stringify({steady,dart})}`);
  assert(erratic.jumps>steady.jumps+8,`erratic should reverse/snap far more often: ${JSON.stringify({steady,erratic})}`);
});
