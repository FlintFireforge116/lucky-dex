'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.57 release lineage remains at or beyond the Topsy-Turvy release',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  assert.match(pkg.version,/^0\.57\.[1-9]\d*$/);
  assert.match(gradle,/versionCode 57(?:0[1-9]|[1-9]\d)/);
  assert.match(gradle,/versionName '0\.57\.[1-9]\d*'/);
  assert.doesNotMatch(gradle,/LuckyDex-asset-builder\/0\.56\.1/);
  assert.match(app,/__LUCKYDEX_BUILD='0\.57\.[1-9]\d*'/);
  assert.match(html,/v0\.57\.[1-9]\d*/);
});
