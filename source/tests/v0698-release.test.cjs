'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('v0.69.8 release identity is consistent everywhere',()=>{
  const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
  const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
  const gradle=fs.readFileSync('app/build.gradle','utf8');
  const runtime=fs.readFileSync('app/src/main/assets/app-v0167.js','utf8');
  const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
  assert.equal(pkg.version,'0.69.8');
  assert.equal(lock.version,'0.69.8');
  assert.equal(lock.packages[''].version,'0.69.8');
  assert.match(gradle,/versionCode 6980/);
  assert.match(gradle,/versionName '0\.69\.8'/);
  assert.match(runtime,/0\.69\.8/);
  assert.match(html,/LUCKY DEX · v0\.69\.8/);
  assert.match(html,/v0\.69\.8/);
});
