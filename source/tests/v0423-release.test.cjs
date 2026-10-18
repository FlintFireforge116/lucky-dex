'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.40.23 release identity and top-down Rattata renderer are aligned',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
  assert.ok(['0.40.23','0.40.24','0.40.25'].includes(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  const code=pkg.version==='0.40.25'?4025:pkg.version==='0.40.24'?4024:4023,escaped=pkg.version.replace(/\./g,'\\.');assert.match(gradle,new RegExp('versionCode\\s+'+code));assert.match(gradle,new RegExp("versionName\\s+'"+escaped+"'"));assert.ok(gradle.includes('LuckyDex-asset-builder/'+pkg.version));
  assert.ok((html.match(new RegExp('v'+escaped,'g'))||[]).length>=2);assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  for(const asset of ['arcade-run-rattata-run-core.js','arcade-run-rattata-run-view.js','arcade-run-rattata-run.js','arcade-run-rattata-run.css'])assert.ok(fs.existsSync(path.join(root,'app/src/main/assets',asset)),asset);
  const viewAt=html.indexOf('<script src="arcade-run-rattata-run-view.js"></script>'),runtimeAt=html.indexOf('<script src="arcade-run-rattata-run.js"></script>');assert.ok(viewAt>0&&runtimeAt>viewAt,'top-down view helper loads before runtime');
});
