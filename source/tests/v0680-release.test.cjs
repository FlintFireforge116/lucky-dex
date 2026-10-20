'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.68.5 release identity is consistent everywhere',()=>{
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),app=read('app/src/main/assets/app-v0167.js'),html=read('app/src/main/assets/index.html');
 assert.equal(pkg.version,'0.68.5');assert.equal(lock.version,'0.68.5');assert.equal(lock.packages[''].version,'0.68.5');
 assert.match(gradle,/versionCode 6850\b/);assert.match(gradle,/versionName '0\.68\.5'/);assert.match(gradle,/LuckyDex-asset-builder\/0\.68\.5/);
 assert.match(app,/window\.__LUCKYDEX_BUILD='0\.68\.5';/);assert.equal((html.match(/v0\.68\.5/g)||[]).length,2);
});
