'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.42.1 release identity is aligned',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
  assert.equal(pkg.version,'0.42.1');assert.equal(lock.version,'0.42.1');assert.equal(lock.packages[''].version,'0.42.1');
  assert.match(gradle,/versionCode\s+4201/);assert.match(gradle,/versionName\s+'0\.42\.1'/);assert.ok(gradle.includes('LuckyDex-asset-builder/0.42.1'));
  assert.ok(html.includes('v0.42.1'));assert.ok(app.includes("__LUCKYDEX_BUILD='0.42.1'"));
});
