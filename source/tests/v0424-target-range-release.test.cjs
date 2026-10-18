const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('v0.42.4 source release identity is coherent and Android identity stays LuckyDex',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle');
  assert.equal(pkg.version,'0.42.4');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  assert.match(gradle,/versionCode\s+4204\b/);assert.match(gradle,/versionName '0\.42\.4'/);assert.match(gradle,/LuckyDex-asset-builder\/0\.42\.4/);
  assert.match(gradle,/applicationId 'com\.example\.luckydex'/);assert.match(gradle,/file\('luckydex-dev\.keystore'\)/);
  assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.42\.4'/);
  assert.ok((read('app/src/main/assets/index.html').match(/v0\.42\.4/g)||[]).length>=2);
});
