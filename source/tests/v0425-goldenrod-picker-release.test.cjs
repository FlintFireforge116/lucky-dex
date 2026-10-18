'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.42.5 shared Goldenrod picker release identity is coherent',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle');
  assert.equal(pkg.version,'0.42.5');
  assert.equal(lock.version,'0.42.5');
  assert.equal(lock.packages[''].version,'0.42.5');
  assert.match(gradle,/versionCode\s+4205\b/);
  assert.match(gradle,/versionName '0\.42\.5'/);
  assert.match(gradle,/LuckyDex-asset-builder\/0\.42\.5/);
  assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.42\.5'/);
  assert.ok((read('app/src/main/assets/index.html').match(/v0\.42\.5/g)||[]).length>=2);
});
