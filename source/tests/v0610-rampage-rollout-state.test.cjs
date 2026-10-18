'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const platform=require(path.join(__dirname,'..','app','src','main','assets','arcade-platform.js'));

test('old saves receive safe Rampage Rollout defaults without losing existing arcade data',()=>{
  const before={pichuPowerPlant:{gamesPlayed:7,wins:2}};
  const out=platform.ensureArcadeState(before);
  assert.equal(out.pichuPowerPlant.gamesPlayed,7);
  assert.equal(out.rampageRollout.gamesPlayed,0);
  assert.equal(out.rampageRollout.bestTimeMs,null);
  assert.deepEqual(out.rampageRollout.winsByDifficulty,{easy:0,normal:0,hard:0});
  assert.equal(out.rampageRollout.totalDustDropped,0);
});
