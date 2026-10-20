'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.69.0 release identity is consistent everywhere',()=>{
  const pkg=JSON.parse(read('package.json'));
  const lock=JSON.parse(read('package-lock.json'));
  assert.equal(pkg.version,'0.69.0');
  assert.equal(lock.version,'0.69.0');
  assert.equal(lock.packages[''].version,'0.69.0');
  const gradle=read('app/build.gradle');
  assert.match(gradle,/versionCode 6900\b/);
  assert.match(gradle,/versionName '0\.69\.0'/);
  assert.match(gradle,/LuckyDex-asset-builder\/0\.69\.0/);
  assert.match(read('app/src/main/assets/app-v0167.js'),/window\.__LUCKYDEX_BUILD='0\.69\.0';/);
  const html=read('app/src/main/assets/index.html');
  assert.equal((html.match(/v0\.69\.0/g)||[]).length,2);
});
