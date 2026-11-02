'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.69.46 release identity is aligned',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
  assert.equal(pkg.version,'0.69.46');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  assert.match(gradle,/versionName '0\.69\.46'/);assert.match(gradle,/versionCode\s+7027\b/);assert.match(gradle,/LuckyDex-asset-builder\/0\.69\.46/);
  assert.ok(html.includes('v0.69.46'));assert.ok(app.includes("window.__LUCKYDEX_BUILD='0.69.46'"));
});
