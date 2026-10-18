'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.58.0 release metadata is aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.58.0');
  assert.match(gradle,/versionCode 5800/);
  assert.match(gradle,/versionName '0\.58\.0'/);
  assert.match(gradle,/LuckyDex-asset-builder\/0\.58\.0/);
  assert.match(app,/__LUCKYDEX_BUILD='0\.58\.0'/);
  assert.match(html,/v0\.58\.0/);
});
