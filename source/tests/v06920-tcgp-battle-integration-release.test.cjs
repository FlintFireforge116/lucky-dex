const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v0.69.20 release metadata is aligned for the TCG Battle slice',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),app=read('app/src/main/assets/app-v0167.js'),html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.69.20');
  assert.equal(lock.version,'0.69.20');
  assert.equal(lock.packages[''].version,'0.69.20');
  assert.match(gradle,/versionCode\s+7001\b/);
  assert.match(gradle,/versionName '0\.69\.20'/);
  assert.match(gradle,/LuckyDex-asset-builder\/0\.69\.20/);
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.20'/);
  assert.equal((html.match(/v0\.69\.20/g)||[]).length,2);
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
