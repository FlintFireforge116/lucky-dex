'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.40.24 release identity and Sushi-Go-Round assets are aligned',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
  const parts=pkg.version.split('.').map(Number);assert.equal(parts[0],0);assert.equal(parts[1],40);assert.ok(parts[2]>=24);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  const code=4000+parts[2],escaped=pkg.version.replace(/\./g,'\\.');assert.match(gradle,new RegExp('versionCode\\s+'+code));assert.match(gradle,new RegExp("versionName\\s+'"+escaped+"'"));assert.ok(gradle.includes('LuckyDex-asset-builder/'+pkg.version));
  assert.ok((html.match(new RegExp('v'+escaped,'g'))||[]).length>=2);assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  for(const asset of ['arcade-sushi-go-round-core.js','arcade-sushi-go-round.js','arcade-sushi-go-round.css'])assert.ok(fs.existsSync(path.join(root,'app/src/main/assets',asset)),asset);
});
