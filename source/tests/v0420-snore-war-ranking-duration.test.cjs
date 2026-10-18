'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corePath=path.join(root,'app/src/main/assets/arcade-snore-war-core.js');
function freshCore(){delete require.cache[require.resolve(corePath)];return require(corePath);}

test('Snore War live place ranks awake racers by hits, misses, then streak instead of old sleep time',()=>{
  const core=freshCore();
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  race.currentCrossing=20;
  const [player,cpu1,cpu2,cpu3]=race.racers;
  Object.assign(player,{hits:17,misses:0,streak:17,bestStreak:17,sleepThroughCrossing:-1,lastSleepAt:null});
  Object.assign(cpu1,{hits:10,misses:3,streak:6,bestStreak:6,sleepThroughCrossing:19,lastSleepAt:5000});
  Object.assign(cpu2,{hits:11,misses:2,streak:4,bestStreak:7,sleepThroughCrossing:18,lastSleepAt:4000});
  Object.assign(cpu3,{hits:11,misses:2,streak:3,bestStreak:6,sleepThroughCrossing:17,lastSleepAt:3000});
  assert.deepEqual(core.rankRace(race).map(r=>r.id),['player','cpu2','cpu3','cpu1']);
  assert.equal(core.placeFor(race,'player'),1);
});

test('Snore War live place always puts an awake racer ahead of a currently sleeping racer',()=>{
  const core=freshCore();
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  race.currentCrossing=12;
  const [player,cpu1]=race.racers;
  Object.assign(player,{hits:4,misses:4,streak:1,bestStreak:2,sleepThroughCrossing:-1});
  Object.assign(cpu1,{hits:20,misses:1,streak:12,bestStreak:12,sleepThroughCrossing:13,lastSleepAt:9000});
  assert.ok(core.rankRace(race).indexOf(player)<core.rankRace(race).indexOf(cpu1));
});

test('Snore War miss sleeps for two centre crossings total, including the missed crossing',()=>{
  const core=freshCore();
  assert.equal(core.CONFIG.sleepCrossings,2);
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  race.currentCrossing=4;
  race.targetAt=core.centerTimeForIndex(race,4);
  const missAt=race.targetAt-core.CONFIG.timingWindowMs-1;
  const result=core.pressPlayer(race,missAt);
  assert.equal(result.accepted,true);
  assert.equal(result.hit,false);
  assert.equal(core.isSleeping(race.player,4),true,'missed crossing counts as sleep crossing one');
  assert.equal(core.isSleeping(race.player,5),true,'next crossing is sleep crossing two');
  assert.equal(core.isSleeping(race.player,6),false,'Drowzee must wake for the following crossing');
});

test('Snore War final placement keeps winner first and orders eliminated racers by survival time',()=>{
  const core=freshCore();
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  race.currentCrossing=20;
  race.finalized=true;
  race.finalizedAt=10000;
  race.winnerId='player';
  const [,cpu1,cpu2,cpu3]=race.racers;
  Object.assign(cpu1,{lastSleepAt:7000,hits:40,misses:1,sleepThroughCrossing:30});
  Object.assign(cpu2,{lastSleepAt:9000,hits:5,misses:8,sleepThroughCrossing:30});
  Object.assign(cpu3,{lastSleepAt:8000,hits:20,misses:4,sleepThroughCrossing:30});
  assert.deepEqual(core.rankRace(race).map(r=>r.id),['player','cpu2','cpu3','cpu1']);
});
