'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
test('v0.61.2 release metadata is aligned',()=>{
  assert.equal(require(path.join(ROOT,'package.json')).version,'0.61.2');
  const lock=require(path.join(ROOT,'package-lock.json'));
  assert.equal(lock.version,'0.61.2');
  assert.equal(lock.packages[''].version,'0.61.2');
  assert.match(read('app/build.gradle'),/versionCode 6102[\s\S]*versionName '0\.61\.2'/);
  assert.match(read('app/build.gradle'),/LuckyDex-asset-builder\/0\.61\.2/);
  assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.61\.2'/);
  assert.match(read('app/src/main/assets/index.html'),/v0\.61\.2/);
});
