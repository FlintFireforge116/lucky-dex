const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Mauville Roulette is wired into the existing Game Corner',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  assert.match(world,/id:'mauville'[^\n]+games:\['roulette','slotMachine'\]/);
  assert.match(world,/roulette:'Mauville Roulette'/);
  assert.match(world,/roulette:\(\)=>window\.LuckyDexRoulette/);
});

test('roulette has a playable panel and scripts/styles',()=>{
  const html=read('app/src/main/assets/index.html');
  assert.match(html,/id="rouletteGame"/);
  assert.match(html,/arcade-roulette\.css/);
  assert.match(html,/arcade-roulette-core\.js/);
  assert.match(html,/arcade-roulette\.js/);
});

test('Service Day and stuck-ball rescue are both testable from Settings',()=>{
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(html,/rareRouletteServiceDayOddsSelect/);
  assert.match(html,/rareRouletteRescueOddsSelect/);
  assert.match(app,/rouletteServiceDay/);
  assert.match(app,/rouletteRescue/);
});

test('roulette records and achievements are permanent',()=>{
  const platform=read('app/src/main/assets/arcade-platform.js');
  const records=read('app/src/main/assets/arcade-records.js');
  const achievements=read('app/src/main/assets/achievements-v0341.js');
  assert.match(platform,/roulette:\{/);
  assert.match(records,/roulette/);
  assert.match(achievements,/roulette_first_win/);
  assert.match(achievements,/roulette_rescue/);
});

test('roulette persists a pending spin before wallet deduction so interrupted spins recover safely',()=>{
  const runtime=read('app/src/main/assets/arcade-roulette.js');
  assert.match(runtime,/pendingSpin/);
  assert.match(runtime,/const result=core\.resolveSpin[\s\S]*pendingSpin[\s\S]*applyWallet\(-stake\)/);
  assert.match(runtime,/ensureTable\(\)[\s\S]*pendingSpin[\s\S]*finalizeSpin/);
});
