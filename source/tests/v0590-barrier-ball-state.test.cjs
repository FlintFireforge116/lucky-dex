'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ASSETS=path.join(__dirname,'..','app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Barrier Ball has permanent Arcade state and records',()=>{
  const platform=read('arcade-platform.js'),records=read('arcade-records.js');
  assert.match(platform,/barrierBall:\{gamesPlayed:0,wins:0,podiums:0,bestScore:0/);
  assert.match(platform,/barrierBall:\(\(\)=>\{/);
  assert.match(records,/SUPPORTED_GAME_IDS=.*'barrierBall'/s);
  assert.match(records,/barrierBall:'Barrier Ball'/);
  assert.match(records,/barrierBall:a=>/);
});

test('Barrier Ball achievements cover participation, victory, Hard and a clean sheet',()=>{
  const a=read('achievements-v0341.js');
  for(const id of ['barrier_first_match','barrier_first_win','barrier_hard_win','secret_barrier_clean_sheet'])assert.match(a,new RegExp(id));
});

test('Barrier Ball adds no fabricated rare event or Developer force toggle',()=>{
  const app=read('app-v0167.js'),html=read('index.html');
  assert.doesNotMatch(app,/barrierBall.*rareOdds/i);
  assert.doesNotMatch(html,/forceBarrier|rareBarrier/i);
});
