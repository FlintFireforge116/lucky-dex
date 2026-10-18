const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const json=p=>JSON.parse(read(p));

test('v0.47.0 Roulette release identity is coherent',()=>{
  const pkg=json('package.json'),lock=json('package-lock.json'),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.47.0');
  assert.equal(lock.version,'0.47.0');
  assert.equal(lock.packages[''].version,'0.47.0');
  assert.match(gradle,/versionCode\s+4700\b/);
  assert.match(gradle,/versionName\s+'0\.47\.0'/);
  assert.match(html,/LUCKY DEX · v0\.47\.0/);
  assert.match(html,/title-footer[^\n]+v0\.47\.0/);
});

test('roulette game ships all runtime assets',()=>{
  for(const f of ['app/src/main/assets/arcade-roulette-core.js','app/src/main/assets/arcade-roulette.js','app/src/main/assets/arcade-roulette.css'])assert.ok(fs.existsSync(path.join(ROOT,f)),f);
});
