const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.42.1 release identity is consistent without changing Android package identity',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),app=read('app/src/main/assets/app-v0167.js'),html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.42.1');assert.equal(lock.version,'0.42.1');assert.equal(lock.packages[''].version,'0.42.1');
  assert.match(gradle,/versionCode\s+4201/);assert.match(gradle,/versionName\s+'0\.42\.1'/);assert.match(gradle,/applicationId\s+['"]com\.example\.luckydex['"]/);
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.42\.1'/);assert.match(html,/v0\.42\.1/);
});

test('Target Range assets and fourth Goldenrod event ship in the release',()=>{
  const html=read('app/src/main/assets/index.html'),world=read('app/src/main/assets/arcade-world.js'),core=read('app/src/main/assets/arcade-target-range-core.js'),ach=read('app/src/main/assets/achievements-v0341.js');
  for(const asset of ['arcade-target-range.css','arcade-target-range-core.js','arcade-special-stats.js','arcade-target-range.js'])assert.ok(html.includes(asset),asset);
  assert.match(world,/games:\['dash','powerTrial','impactTrial','targetRange'\]/);
  assert.match(core,/ground:'Mud Bomb'/);assert.match(core,/psychic:'Psybeam'/);
  assert.match(ach,/\['dash','powerTrial','impactTrial','targetRange'\]/);assert.match(ach,/Goldenrod Grand Champion[\s\S]{0,500},4\]/);
});

test('Target Range is fully local and adds no network runtime dependency',()=>{
  for(const file of ['app/src/main/assets/arcade-target-range-core.js','app/src/main/assets/arcade-target-range.js','app/src/main/assets/arcade-special-stats.js']){
    const src=read(file);assert.doesNotMatch(src,/\bfetch\s*\(|XMLHttpRequest|https?:\/\//,file);
  }
});
