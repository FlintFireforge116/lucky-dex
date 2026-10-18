'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.40.7 release identity and new rare-event assets are aligned',()=>{
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
 assert.ok(['0.40.7','0.40.8','0.40.9','0.40.10','0.40.11','0.40.12','0.40.13','0.40.14','0.40.15','0.40.16','0.40.17','0.40.18','0.40.19','0.40.20','0.40.21','0.40.22','0.40.23','0.40.24','0.40.25'].includes(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
 const code=pkg.version==='0.40.25'?4025:pkg.version==='0.40.24'?4024:pkg.version==='0.40.23'?4023:pkg.version==='0.40.22'?4022:pkg.version==='0.40.21'?4021:pkg.version==='0.40.20'?4020:pkg.version==='0.40.19'?4019:pkg.version==='0.40.18'?4018:pkg.version==='0.40.17'?4017:pkg.version==='0.40.16'?4016:pkg.version==='0.40.15'?4015:pkg.version==='0.40.14'?4014:pkg.version==='0.40.13'?4013:pkg.version==='0.40.12'?4012:pkg.version==='0.40.11'?4011:pkg.version==='0.40.10'?4010:pkg.version==='0.40.9'?4009:pkg.version==='0.40.8'?4008:4007,escaped=pkg.version.replace(/\./g,'\\.');
 assert.match(gradle,new RegExp('versionCode\\s+'+code));assert.match(gradle,new RegExp("versionName\\s+'"+escaped+"'"));assert.match(gradle,new RegExp('LuckyDex-asset-builder\\/'+escaped));
 assert.ok(html.includes('v'+pkg.version));assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
 assert.ok(fs.existsSync(path.join(root,'app/src/main/assets/arcade-special-events-v0407.js')));
});
