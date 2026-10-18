'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.40.19 release identity and Snore War start-panel hotfix are aligned',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js'),snore=read('app/src/main/assets/arcade-snore-war.js');
  assert.ok(['0.40.19','0.40.20','0.40.21','0.40.22','0.40.23','0.40.24','0.40.25'].includes(pkg.version)); assert.equal(lock.version,pkg.version); assert.equal(lock.packages[''].version,pkg.version);
  const code=pkg.version==='0.40.25'?4025:pkg.version==='0.40.24'?4024:pkg.version==='0.40.23'?4023:pkg.version==='0.40.22'?4022:pkg.version==='0.40.21'?4021:pkg.version==='0.40.20'?4020:4019,escaped=pkg.version.replace(/\./g,'\\.'); assert.match(gradle,new RegExp('versionCode\\s+'+code)); assert.match(gradle,new RegExp("versionName\\s+'"+escaped+"'")); assert.ok(gradle.includes('LuckyDex-asset-builder/'+pkg.version));
  assert.ok(html.includes('v'+pkg.version)); assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  assert.match(snore,/function setControls\(on\)\{const ready=\$\('snoreWarReady'\);if\(ready\)ready\.hidden=!!on;/,'Snore War ready panel must hide during live controls');
});
