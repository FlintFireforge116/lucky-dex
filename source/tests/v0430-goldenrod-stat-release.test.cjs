const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v0.43.0 Goldenrod stat-expression release identity and shared curve are aligned',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
  assert.equal(pkg.version,'0.43.0');assert.equal(lock.version,'0.43.0');assert.equal(lock.packages[''].version,'0.43.0');
  assert.match(gradle,/versionCode\s+4300\b/);assert.match(gradle,/versionName '0\.43\.0'/);assert.match(gradle,/LuckyDex-asset-builder\/0\.43\.0/);
  assert.match(app,/__LUCKYDEX_BUILD='0\.43\.0'/);assert.ok((html.match(/v0\.43\.0/g)||[]).length>=2);
  assert.match(html,/arcade-goldenrod-stat-curve\.js/);
  assert.ok(fs.existsSync(path.join(root,'app/src/main/assets/arcade-goldenrod-stat-curve.js')));
});
