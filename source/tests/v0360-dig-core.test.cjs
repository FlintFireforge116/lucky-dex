'use strict';
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/arcade-dig-dig-dig-core.js');

function seeded(seed=1){let x=seed>>>0;return ()=>{x=(1664525*x+1013904223)>>>0;return x/0x100000000;};}

assert.equal(core.CONFIG.raceDistance,80);
assert.equal('graceMs' in core.CONFIG,false);

const racer={id:'player',progress:0,lastAcceptedSide:null,lastAcceptedAt:null,finishedAt:null};
let hit=core.acceptInput(racer,'left',100);
assert.deepEqual(hit,{accepted:true,progress:1,finished:false});
hit=core.acceptInput(racer,'left',110);
assert.deepEqual(hit,{accepted:false,progress:1,finished:false});
hit=core.acceptInput(racer,'right',120);
assert.deepEqual(hit,{accepted:true,progress:2,finished:false});
racer.progress=79;racer.lastAcceptedSide='right';
hit=core.acceptInput(racer,'left',500);
assert.equal(hit.progress,80);assert.equal(hit.finished,true);assert.equal(racer.finishedAt,500);
hit=core.acceptInput(racer,'right',900);
assert.equal(hit.accepted,false);assert.equal(racer.progress,80);assert.equal(racer.finishedAt,500,'finish timestamp is immutable');

for(const difficulty of ['easy','normal','hard']){
  const {minIntervalMs:min,maxIntervalMs:max}=core.DIFFICULTIES[difficulty];
  const a=core.createRace({difficulty,rng:seeded(42),nowMs:1000});
  const b=core.createRace({difficulty,rng:seeded(42),nowMs:1000});
  assert.deepEqual(a.racers.slice(1).map(r=>({base:r.baseIntervalMs,next:r.nextActionAt})),b.racers.slice(1).map(r=>({base:r.baseIntervalMs,next:r.nextActionAt})),`${difficulty} seeded cadence repeatable`);
  for(const cpu of a.racers.slice(1))assert.ok(cpu.baseIntervalMs>=min&&cpu.baseIntervalMs<=max,`${difficulty} base interval ${cpu.baseIntervalMs} in active profile range`);
}

const raceA=core.createRace({difficulty:'normal',rng:seeded(7),nowMs:0});
const raceB=core.createRace({difficulty:'normal',rng:seeded(7),nowMs:0});
raceA.player.progress=79;
const rngA=seeded(99),rngB=seeded(99);
core.advanceCpu(raceA,1,1000,rngA);core.advanceCpu(raceB,1,1000,rngB);
assert.deepEqual(raceA.racers[1],raceB.racers[1],'CPU schedule/outcome does not inspect player progress');

const ongoing=core.createRace({difficulty:'easy',rng:seeded(1),nowMs:0});
ongoing.player.progress=79;ongoing.player.lastAcceptedSide='right';core.acceptInput(ongoing.player,'left',2000);core.advanceRace(ongoing,2000,seeded(3));
assert.equal(ongoing.firstFinishAt,2000);assert.equal(ongoing.finalized,false,'first finisher does not stop the race');
core.advanceRace(ongoing,9000,seeded(4));assert.equal(ongoing.finalized,false,'there is no grace timeout while racers remain unfinished');
ongoing.racers[1].progress=79;ongoing.racers[1].lastAcceptedSide='left';core.acceptInput(ongoing.racers[1],'right',9500);core.advanceRace(ongoing,9500,seeded(5));
assert.equal(ongoing.racers[1].finishedAt,9500,'later racers keep finishing after the leader');

const rankingRace=core.createRace({difficulty:'normal',rng:seeded(2),nowMs:0});
rankingRace.racers[0].progress=80;rankingRace.racers[0].finishedAt=3500;
rankingRace.racers[2].progress=80;rankingRace.racers[2].finishedAt=3300;
rankingRace.racers[1].progress=70;rankingRace.racers[1].lastAcceptedAt=3100;
rankingRace.racers[3].progress=70;rankingRace.racers[3].lastAcceptedAt=3200;
rankingRace.firstFinishAt=3300;
const final=core.finalizeRace(rankingRace,7300);
assert.deepEqual(final.map(r=>r.id),['cpu2','player','cpu3','cpu1']);

const expected={easy:[80,55,35,20],normal:[100,70,45,25],hard:[130,90,60,35]};
for(const [difficulty,rewards] of Object.entries(expected))for(let place=1;place<=4;place++)assert.equal(core.rewardFor(place,difficulty),rewards[place-1],`${difficulty} place ${place}`);
console.log('PASS v0.36.0 Dig core rules, CPU fairness, full-race ranking and rewards');
