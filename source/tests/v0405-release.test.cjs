'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v0.40.5+ release metadata remains aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle');
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  const match=String(pkg.version).match(/^0\.40\.(\d+)$/);
  assert.ok(match,'release remains on the v0.40.x line');
  const patch=Number(match[1]);assert.ok(patch>=5,'release remains at v0.40.5 or later');
  assert.equal(lock.version,pkg.version);
  assert.equal(lock.packages[''].version,pkg.version);
  assert.match(gradle,new RegExp(`versionCode\\s+${4000+patch}\\b`));
  assert.match(gradle,new RegExp(`versionName\\s+'${pkg.version.replaceAll('.','\\.')}'`));
  assert.match(gradle,new RegExp(`LuckyDex-asset-builder/${pkg.version.replaceAll('.','\\.')}`));
  assert.match(html,new RegExp(`v${pkg.version.replaceAll('.','\\.')}`));
  assert.match(app,new RegExp(`__LUCKYDEX_BUILD='${pkg.version.replaceAll('.','\\.')}'`));
});
