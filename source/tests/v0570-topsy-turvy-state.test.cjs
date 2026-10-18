'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ASSETS=path.join(__dirname,'..','app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Topsy-Turvy has permanent Arcade state and records',()=>{
  const platform=read('arcade-platform.js'),records=read('arcade-records.js');
  assert.match(platform,/topsyTurvy:\{gamesPlayed:0,wins:0,podiums:0,bestKnockouts:0/);
  assert.match(platform,/topsyTurvy:\(\(\)=>\{/);
  assert.match(records,/SUPPORTED_GAME_IDS=.*'topsyTurvy'/s);
  assert.match(records,/topsyTurvy:'Topsy-Turvy'/);
  assert.match(records,/topsyTurvy:a=>/);
});

test('Topsy-Turvy achievements cover participation, winning, Hard and a shutout',()=>{
  const a=read('achievements-v0341.js');
  for(const id of ['topsy_first_match','topsy_first_win','topsy_hard_win','secret_topsy_shutout'])assert.match(a,new RegExp(id));
});

test('Topsy-Turvy has no fabricated rare-event Settings hook',()=>{
  const app=read('app-v0167.js'),html=read('index.html');
  assert.doesNotMatch(app,/topsyTurvy.*rareOdds/i);
  assert.doesNotMatch(html,/rareTopsy/i);
});
