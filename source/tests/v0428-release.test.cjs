'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.40.28+ release identity retains Stadium 2 venue and Pocket Rare Pack assets',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js'),world=read('app/src/main/assets/arcade-world.js'),flow=read('app/src/main/assets/pack-flow-v0165.js'),parts=pkg.version.split('.').map(Number);
  assert.equal(parts[0],0);assert.equal(parts[1],40);assert.ok(parts[2]>=28);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  assert.match(gradle,new RegExp('versionCode\\s+'+(4000+parts[2])));assert.ok(gradle.includes("versionName '"+pkg.version+"'"));assert.ok(gradle.includes('LuckyDex-asset-builder/'+pkg.version));
  assert.ok(html.includes('v'+pkg.version));assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  assert.match(world,/id:"stadium2KidsClub"/);assert.ok(fs.existsSync(path.join(root,'app/src/main/assets/arcade/kids-club/kids-club-2-venue.svg')));
  assert.match(flow,/RARE PACK COMPLETE/);
});
