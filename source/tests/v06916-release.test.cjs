'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

test('v0.69.16 release identity is aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle');
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.equal(pkg.version,'0.69.16');
  assert.equal(lock.version,pkg.version);
  assert.equal(lock.packages[''].version,pkg.version);
  assert.match(gradle,/versionCode 6997\b/);
  assert.match(gradle,/versionName '0\.69\.16'/);
  assert.match(gradle,/LuckyDex-asset-builder\/0\.69\.16/);
  assert.ok((html.match(/v0\.69\.16/g)||[]).length>=2);
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.16'/);
});
