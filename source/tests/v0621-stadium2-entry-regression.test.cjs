'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.62.1 metadata is aligned',()=>{
  assert.equal(require(path.join(ROOT,'package.json')).version,'0.62.1');
  const lock=require(path.join(ROOT,'package-lock.json'));
  assert.equal(lock.version,'0.62.1');
  assert.equal(lock.packages[''].version,'0.62.1');
  assert.match(read('app/build.gradle'),/versionCode 6201[\s\S]*versionName '0\.62\.1'/);
  assert.match(read('app/build.gradle'),/LuckyDex-asset-builder\/0\.62\.1/);
  assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.62\.1'/);
  assert.match(read('app/src/main/assets/index.html'),/v0\.62\.1/);
});

test('every Stadium 2 game has Kids Club tile metadata before renderKids dereferences it',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  const list=world.match(/id:\"stadium2KidsClub\"[\s\S]*?games:\[([^\]]+)\]/);
  assert.ok(list,'Stadium 2 venue game list should exist');
  const games=[...list[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
  const kids=world.match(/const kids=\{([\s\S]*?)\};\n const renderKids/);
  assert.ok(kids,'Kids Club tile metadata map should exist');
  for(const game of games){
    assert.match(kids[1],new RegExp(`${game}:\\{sprite:`),`${game} is registered in Stadium 2 but has no tile metadata`);
  }
});
