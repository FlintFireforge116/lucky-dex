'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.40.25 release identity and Sushi-Go-Round redesign are aligned',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js'),core=read('app/src/main/assets/arcade-sushi-go-round-core.js'),runtime=read('app/src/main/assets/arcade-sushi-go-round.js');
  const parts=pkg.version.split('.').map(Number);assert.equal(parts[0],0);assert.equal(parts[1],40);assert.ok(parts[2]>=25);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  const code=4000+parts[2],escaped=pkg.version.replace(/\./g,'\\.');assert.match(gradle,new RegExp('versionCode\\s+'+code));assert.match(gradle,new RegExp("versionName\\s+'"+escaped+"'"));assert.ok(gradle.includes('LuckyDex-asset-builder/'+pkg.version));
  assert.ok((html.match(new RegExp('v'+escaped,'g'))||[]).length>=2);assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  assert.match(core,/ringCount:3/);assert.match(core,/lapMs:7200/);assert.match(runtime,/eatPlateById/);assert.match(html,/id="sushiGoRoundMenu"/);
});
