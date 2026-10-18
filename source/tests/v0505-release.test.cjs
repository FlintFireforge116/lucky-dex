const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');

test('v0.50.5 release identity is consistent',()=>{
  const pkg=JSON.parse(read('package.json'));
  const lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const index=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.50.5');
  assert.equal(lock.version,'0.50.5');
  assert.equal(lock.packages[''].version,'0.50.5');
  assert.match(gradle,/versionCode\s+5005/);
  assert.match(gradle,/versionName '0\.50\.5'/);
  assert.match(app,/__LUCKYDEX_BUILD='0\.50\.5'/);
  assert.match(index,/v0\.50\.5/);
});
