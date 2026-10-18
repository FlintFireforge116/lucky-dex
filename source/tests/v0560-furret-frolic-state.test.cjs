'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Furret Frolic has permanent Arcade state and record support',()=>{
  const platform=read('arcade-platform.js'),records=read('arcade-records.js');
  assert.match(platform,/furretFrolic:\{gamesPlayed:0,wins:0,podiums:0,bestScore:0/);
  assert.match(platform,/furretFrolic:\(\(\)=>\{/);
  assert.match(records,/SUPPORTED_GAME_IDS=.*'furretFrolic'/s);
  assert.match(records,/furretFrolic:'Furret’s Frolic'/);
  assert.match(records,/furretFrolic:a=>/);
});

test('Furret Frolic adds achievements for first match, high score, Hard win and Master Ball score',()=>{
  const a=read('achievements-v0341.js');
  for(const id of ['furret_first_match','furret_high_score','furret_hard_win','furret_master_ball'])assert.match(a,new RegExp(id));
});

test('authentic Master Ball appearance is exposed in Settings for testing',()=>{
  const html=read('index.html'),app=read('app-v0167.js'),runtime=read('arcade-furret-frolic.js');
  assert.match(html,/id="rareFurretFrolicMasterBallOddsSelect"/);
  assert.match(html,/value="0\.08">Natural · late match<\/option>/);
  assert.match(app,/furretFrolicMasterBall:\.08/);
  assert.match(app,/rareFurretFrolicMasterBallOddsSelect:'furretFrolicMasterBall'/);
  assert.match(runtime,/rareOdds\?\.furretFrolicMasterBall/);
});
