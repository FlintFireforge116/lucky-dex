'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const atLeast=(actual,minimum)=>{const a=String(actual).split('.').map(Number),b=String(minimum).split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)!==(b[i]||0))return(a[i]||0)>(b[i]||0);}return true;};
test('v0.61.1 release baseline remains satisfied by later releases',()=>{
  const pkg=require(path.join(ROOT,'package.json'));
  assert.ok(atLeast(pkg.version,'0.61.1'));
  const lock=require(path.join(ROOT,'package-lock.json'));
  assert.ok(atLeast(lock.version,'0.61.1'));
  assert.ok(atLeast(lock.packages[''].version,'0.61.1'));
  assert.match(read('app/build.gradle'),/versionCode \d+[\s\S]*versionName '\d+\.\d+\.\d+'/);
  assert.match(read('app/build.gradle'),/LuckyDex-asset-builder\/\d+\.\d+\.\d+/);
  assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='\d+\.\d+\.\d+'/);
  assert.match(read('app/src/main/assets/index.html'),/v\d+\.\d+\.\d+/);
});
