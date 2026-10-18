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
  const [major,minor,patch]=pkg.version.split('.').map(Number);
  assert.ok(major>0||minor>57||(minor===57&&patch>=1));
  const escaped=pkg.version.replaceAll('.','\\.');
  assert.match(gradle,new RegExp(`versionName '${escaped}'`));
  assert.doesNotMatch(gradle,/LuckyDex-asset-builder\/0\.56\.1/);
  assert.match(app,new RegExp(`__LUCKYDEX_BUILD='${escaped}'`));
  assert.match(html,new RegExp(`v${escaped}`));
});
