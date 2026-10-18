'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const parts=v=>String(v).split('.').map(Number);
const atLeast=(v,floor)=>{const a=parts(v),b=parts(floor);for(let i=0;i<3;i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)>(b[i]||0);}return true;};
test('release metadata remains at or beyond v0.60.0 and aligned',()=>{
  const version=require(path.join(ROOT,'package.json')).version;
  assert.ok(atLeast(version,'0.60.0'));
  const escaped=version.replace(/\\./g,'\\.');
  assert.match(read('package-lock.json'),new RegExp(`"version": "${escaped}"`));
  assert.match(read('app/build.gradle'),new RegExp(`versionName '${escaped}'`));
  assert.match(read('app/build.gradle'),new RegExp(`LuckyDex-asset-builder/${escaped}`));
  assert.match(read('app/src/main/assets/app-v0167.js'),new RegExp(`__LUCKYDEX_BUILD='${escaped}'`));
  assert.match(read('app/src/main/assets/index.html'),new RegExp(`v${escaped}`));
});
