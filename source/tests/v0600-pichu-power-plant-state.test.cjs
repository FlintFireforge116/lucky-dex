'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const platform=require(path.join(__dirname,'..','app','src','main','assets','arcade-platform.js'));

test('arcade state safely migrates Pichu Power Plant records',()=>{
  const fresh=platform.ensureArcadeState({});
  assert.deepEqual(fresh.pichuPowerPlant.bestTimes,{easy:null,normal:null,hard:null});
  assert.deepEqual(fresh.pichuPowerPlant.winsByDifficulty,{easy:0,normal:0,hard:0});
  const migrated=platform.ensureArcadeState({pichuPowerPlant:{gamesPlayed:-4,wins:2,bestAccuracy:117,totalCorrect:9}});
  assert.equal(migrated.pichuPowerPlant.gamesPlayed,0);
  assert.equal(migrated.pichuPowerPlant.wins,2);
  assert.equal(migrated.pichuPowerPlant.totalCorrect,9);
});
