const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('v0.69.29+ product and Android build metadata stay aligned without changing signing identity',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),version=pkg.version,escaped=version.replace(/\./g,'\\.');
  assert.equal(lock.version,version);
  assert.equal(lock.packages[''].version,version);
  assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=7010);
  assert.match(gradle,new RegExp("versionName '"+escaped+"'"));
  assert.ok(gradle.includes('LuckyDex-asset-builder/'+version));
  assert.match(gradle,/applicationId 'com\.example\.luckydex'/);
  assert.match(gradle,/keyAlias 'luckydex'/);
  assert.ok(read('app/src/main/assets/app-v0167.js').includes("__LUCKYDEX_BUILD='"+version+"'"));
  assert.equal((read('app/src/main/assets/index.html').match(new RegExp('v'+escaped,'g'))||[]).length,2);
});
