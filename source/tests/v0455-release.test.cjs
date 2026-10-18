const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.45.5 Elemental Gauntlet consequence pass release identity is coherent',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  assert.equal(pkg.version,'0.45.5');
  assert.equal(lock.version,'0.45.5');
  assert.equal(lock.packages[''].version,'0.45.5');
  assert.match(read('app/build.gradle'),/applicationId 'com\.example\.luckydex'/);
  assert.match(read('app/build.gradle'),/versionCode\s+4505\b/);
  assert.match(read('app/build.gradle'),/versionName '0\.45\.5'/);
  assert.match(read('app/build.gradle'),/LuckyDex-asset-builder\/0\.45\.5/);
  assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.45\.5'/);
  assert.equal((read('app/src/main/assets/index.html').match(/v0\.45\.5/g)||[]).length,2);
});
