'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.56.0 release identity is consistent',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
  assert.equal(pkg.version,'0.56.0');
  assert.equal(lock.version,'0.56.0');
  assert.equal(lock.packages[''].version,'0.56.0');
  assert.match(gradle,/versionCode\s+5600\b/);
  assert.match(gradle,/versionName '0\.56\.0'/);
  assert.match(gradle,/LuckyDex-asset-builder\/0\.56\.0/);
  assert.ok((html.match(/v0\.56\.0/g)||[]).length>=2);
  assert.match(app,/__LUCKYDEX_BUILD='0\.56\.0'/);
});

test('v0.56.0 adds Furret Frolic as the only new Stadium 2 game',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  assert.match(world,/games:\['clearCutChallenge','gutsyGolbat','furretFrolic'\]/);
  assert.doesNotMatch(world,/games:\['clearCutChallenge','gutsyGolbat','furretFrolic',[^\]]/);
});
