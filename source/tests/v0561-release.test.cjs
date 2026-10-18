'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.56.1 release identity is consistent',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.56.1');
  assert.match(gradle,/versionCode 5601/);
  assert.match(gradle,/versionName '0\.56\.1'/);
  assert.match(app,/__LUCKYDEX_BUILD='0\.56\.1'/);
  assert.match(html,/v0\.56\.1/);
});

test('Furret runtime starts with one ball from each corner chute and world copy names patch-lock mechanic',()=>{
  const runtime=read('app/src/main/assets/arcade-furret-frolic.js');
  const world=read('app/src/main/assets/arcade-world.js');
  assert.match(runtime,/for\(let corner=0;corner<4;corner\+\+\)core\.spawnBall\(run,\{force:true,corner\}\)/);
  assert.match(world,/furretFrolic:\{sprite:'162\.png',mechanic:'Patch lock · A hit · score'\}/);
});
