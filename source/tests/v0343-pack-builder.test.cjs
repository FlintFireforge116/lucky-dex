'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
const god=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/god-pack-v0291.js'),'utf8');
assert.match(app,/function pickCardForDescriptorV0343\(/,'descriptor picker must exist');
assert.match(app,/LuckyDexPackPolicy\?\.slotPlan|LuckyDexPackPolicy\.slotPlan/,'physical pack builder must consume canonical slot plan');
assert.doesNotMatch(app,/physicalPackSlotsV250\(set,luckyPack\)\.forEach/,'offline physical builder must not use old numeric slot plan');
assert.match(app,/allowParallelRepeat/,'builder must understand legitimate parallel-repeat descriptors');
assert.match(app,/effective\?\.pool|descriptor\?\.pool/,'builder must route core/subset/energy pools');
assert.match(god,/PRODUCTION_DENOMINATOR=1000/,'God Pack odds stay fixed');

function bodyBetween(start,end){
  const from=app.lastIndexOf(start);assert.ok(from>=0,`missing ${start}`);
  const to=app.indexOf(end,from);assert.ok(to>from,`missing end marker ${end}`);
  return app.slice(from,to);
}
const onlineBuilder=bodyBetween('async function buildBalancedPack(set,source,luckyPack=false,signal=null,godPack=false){','function updatePackFormatV5');
assert.match(onlineBuilder,/LuckyDexPackPolicy\?\.slotPlan\?\.\(set,\{source,luckyPack\}\)/,'online Pocket and physical packs must both consume source-specific policy slots');
assert.doesNotMatch(onlineBuilder,/hitTierForSource\(source\)|rollWeighted\(/,'online Pocket builder must not bypass policy with the legacy numeric rarity plan');
const offlineBuilder=bodyBetween('async function buildOfflinePackV13(set,source,luckyPack=false,godPack=false){','// Give the player a clear offline-readiness hint');
assert.match(offlineBuilder,/LuckyDexPackPolicy\?\.slotPlan\?\.\(set,\{source,luckyPack\}\)/,'offline Pocket and physical packs must consume the same source-specific policy slots');
assert.doesNotMatch(offlineBuilder,/hitTierForSource\(source\)/,'offline Pocket builder must not bypass policy with the legacy numeric rarity plan');
console.log('PASS v0.34.3 descriptor-driven builder integration contract');
