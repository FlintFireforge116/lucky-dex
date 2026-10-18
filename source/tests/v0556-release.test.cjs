const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.55.6 release identity is consistent',()=>{
  const pkg=JSON.parse(read('package.json'));
  const lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle');
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.equal(pkg.version,'0.55.6');
  assert.equal(lock.version,'0.55.6');
  assert.equal(lock.packages[''].version,'0.55.6');
  assert.match(gradle,/versionCode\s+5506\b/);
  assert.match(gradle,/versionName '0\.55\.6'/);
  assert.match(gradle,/LuckyDex-asset-builder\/0\.55\.6/);
  assert.match(html,/v0\.55\.6/);
  assert.match(app,/__LUCKYDEX_BUILD='0\.55\.6'/);
});
