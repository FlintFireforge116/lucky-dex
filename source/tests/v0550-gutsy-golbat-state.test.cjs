const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Gutsy Golbat has permanent Arcade state and records support',()=>{
  const platform=read('arcade-platform.js');
  const records=read('arcade-records.js');
  assert.match(platform,/gutsyGolbat:\{gamesPlayed:0,wins:0,podiums:0,bestHearts:0/);
  assert.match(platform,/gutsyGolbat:\(\(\)=>\{/);
  assert.match(records,/SUPPORTED_GAME_IDS=.*'gutsyGolbat'/s);
  assert.match(records,/gutsyGolbat:'Gutsy Golbat'/);
  assert.match(records,/gutsyGolbat:a=>/);
});

test('Gutsy Golbat adds achievements for completion, Hard win and clean cave mastery',()=>{
  const achievements=read('achievements-v0341.js');
  assert.match(achievements,/gutsy_first_finish/);
  assert.match(achievements,/gutsy_hard_win/);
  assert.match(achievements,/gutsy_clean_win/);
  assert.match(achievements,/gutsy_golden_heart/);
});

test('Golden Heart rare event is exposed in Settings and persisted',()=>{
  const html=read('index.html');
  const app=read('app-v0167.js');
  assert.match(html,/id="rareGutsyGolbatGoldenHeartOddsSelect"/);
  assert.match(app,/gutsyGolbatGoldenHeart:\.02/);
  assert.match(app,/rareGutsyGolbatGoldenHeartOddsSelect:'gutsyGolbatGoldenHeart'/);
  assert.match(read('arcade-gutsy-golbat.js'),/rareOdds\?\.gutsyGolbatGoldenHeart/);
});
