const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=name=>fs.readFileSync(path.join(ASSETS,name),'utf8');

test('Gutsy Golbat runtime assets are present',()=>{
  for(const name of ['arcade-gutsy-golbat-core.js','arcade-gutsy-golbat.js','arcade-gutsy-golbat.css']){
    assert.equal(fs.existsSync(path.join(ASSETS,name)),true,`${name} missing`);
  }
});

test('Stadium 2 Kids Club exposes Gutsy Golbat as a playable game',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/gutsyGolbat:'Gutsy Golbat'/);
  assert.match(world,/games:\['clearCutChallenge','gutsyGolbat','furretFrolic','topsyTurvy','barrierBall','pichuPowerPlant'(?:,'[^']+')*\]/);
  assert.match(world,/gutsyGolbat:\(\)=>window\.LuckyDexGutsyGolbat/);
});

test('Gutsy Golbat panel and scripts are wired into index',()=>{
  const html=read('index.html');
  assert.match(html,/id="gutsyGolbatGame"/);
  assert.match(html,/id="gutsyGolbatFlap"/);
  assert.match(html,/arcade-gutsy-golbat\.css/);
  assert.match(html,/arcade-gutsy-golbat-core\.js/);
  assert.match(html,/arcade-gutsy-golbat\.js/);
});
