'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const corePath=path.join(ROOT,'app/src/main/assets/arcade-tumbling-togepi-core.js');

function loadCore(){
  assert.ok(fs.existsSync(corePath),'Tumbling Togepi core module should exist');
  delete require.cache[require.resolve(corePath)];
  return require(corePath);
}
function sequence(values){let i=0;return()=>values[i++%values.length];}

test('Tumbling Togepi is a four-racer control-stick race with Togepi and Omanyte support',()=>{
  const core=loadCore();
  const race=core.createRace({difficulty:'normal',rng:sequence([.1,.3,.5,.7]),nowMs:0,playerSpeciesId:175});
  assert.equal(race.racers.length,4);
  assert.equal(race.player.speciesId,175);
  assert.deepEqual(core.PLAYABLE_SPECIES.map(x=>x.id),[175,138]);
  assert.equal(typeof core.setInput,'function');
  assert.equal(core.CONFIG.courseDistance>0,true);
});

test('downward stick input drives forward progress while horizontal input steers within the lane',()=>{
  const core=loadCore();
  const race=core.createRace({difficulty:'normal',rng:sequence([.2,.4,.6,.8]),nowMs:0});
  core.setInput(race.player,.8,1);
  const x0=race.player.x;
  core.advanceRace(race,500,sequence([.2,.4,.6,.8]));
  assert.ok(race.player.progress>0,'down input should move racer down-course');
  assert.ok(race.player.x>x0,'right input should move racer laterally');
});

test('consecutive blue arrows build a stronger boost chain',()=>{
  const core=loadCore();
  const race=core.createRace({difficulty:'normal',rng:sequence([.2,.4,.6,.8]),nowMs:0});
  const p=race.player;
  const one=core.applyCourseObject(race,p,{type:'arrow',id:'a1',x:p.x,progress:100},1000);
  const firstBoost=p.speedMultiplier;
  const two=core.applyCourseObject(race,p,{type:'arrow',id:'a2',x:p.x,progress:200},1800);
  assert.equal(one.hit,true);
  assert.equal(two.hit,true);
  assert.equal(p.boostChain,2);
  assert.ok(p.speedMultiplier>firstBoost,'second consecutive arrow should produce a stronger boost');
  assert.equal(p.bestBoostChain,2);
});

test('flowers slow, boulders and Diglett stumble, and logs auto-jump with a momentum cost',()=>{
  const core=loadCore();
  const race=core.createRace({difficulty:'normal',rng:sequence([.2,.4,.6,.8]),nowMs:0});
  const p=race.player;
  core.applyCourseObject(race,p,{type:'flower',id:'f',x:p.x,progress:100},1000);
  assert.ok(p.slowedUntil>1000);
  core.applyCourseObject(race,p,{type:'rock',id:'r',x:p.x,progress:200},2000);
  assert.ok(p.stumblingUntil>2000);
  p.stumblingUntil=0;p.speedMultiplier=1.5;p.boostChain=3;
  core.applyCourseObject(race,p,{type:'log',id:'l',x:p.x,progress:300},3000);
  assert.ok(p.jumpingUntil>3000);
  assert.ok(p.speedMultiplier<1.5);
  core.applyCourseObject(race,p,{type:'diglett',id:'d',x:p.x,progress:400},4000);
  assert.ok(p.stumblingUntil>4000);
});

test('CPU difficulty affects pace and all racers rank by finish time/progress',()=>{
  const core=loadCore();
  assert.ok(core.DIFFICULTIES.easy.cpuSpeedScale<core.DIFFICULTIES.normal.cpuSpeedScale);
  assert.ok(core.DIFFICULTIES.normal.cpuSpeedScale<core.DIFFICULTIES.hard.cpuSpeedScale);
  const race=core.createRace({difficulty:'normal',rng:sequence([.2,.4,.6,.8]),nowMs:0});
  race.player.progress=900;race.racers[1].progress=700;race.racers[2].progress=800;race.racers[3].progress=600;
  assert.deepEqual(core.rankRace(race).map(r=>r.id),['player','cpu2','cpu1','cpu3']);
});
