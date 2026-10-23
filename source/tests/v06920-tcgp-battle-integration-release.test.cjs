const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v0.69.20+ release metadata stays aligned for the TCG Battle slice',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),app=read('app/src/main/assets/app-v0167.js'),html=read('app/src/main/assets/index.html');
  const escaped=pkg.version.replace(/\./g,'\\.');
  assert.ok(pkg.version.localeCompare('0.69.20',undefined,{numeric:true})>=0);
  assert.equal(lock.version,pkg.version);
  assert.equal(lock.packages[''].version,pkg.version);
  assert.ok(Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]||0)>=7001);
  assert.match(gradle,new RegExp(`versionName '${escaped}'`));
  assert.ok(gradle.includes(`LuckyDex-asset-builder/${pkg.version}`));
  assert.ok(app.includes(`window.__LUCKYDEX_BUILD='${pkg.version}'`));
  assert.ok((html.match(new RegExp(`v${escaped}`,'g'))||[]).length>=2);
});

test('main save schema owns TCG Battle progress with nested backwards-compatible migration',()=>{
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(app,/tcgpBattle:\{schema:1,helpSeen:false,decks:\[\],activeDeckId:null,firstClears:\{\},stats:\{matches:0,wins:0,losses:0,draws:0,bestWinTurns:null,totalTurns:0\}\}/);
  assert.match(app,/tcgpBattle:\{\.\.\.base\.tcgpBattle,\.\.\.\(raw\.tcgpBattle\|\|\{\}\),decks:\[\.\.\.\(raw\.tcgpBattle\?\.decks\|\|\[\]\)\],firstClears:\{\.\.\.\(raw\.tcgpBattle\?\.firstClears\|\|\{\}\)\},stats:\{\.\.\.base\.tcgpBattle\.stats,\.\.\.\(raw\.tcgpBattle\?\.stats\|\|\{\}\)\}\}/);
});

test('achievement catalogue recognises winning a Pocket Solo battle',()=>{
  const expansion=read('app/src/main/assets/achievements-tcgp-battle-v06920.js');
  assert.match(expansion,/v06920_tcgp_first_win/);
  assert.match(expansion,/s\(\)\.tcgpBattle\?\.stats\?\.wins/);
});
