'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.join(__dirname,'..','app','src','main','assets','arcade-rampage-rollout-core.js'));

const fixed=v=>()=>v;

test('Rampage Rollout is a nine-lap Donphan race with a faster final Rollout lap',()=>{
  assert.equal(core.CONFIG.lapsToWin,9);
  assert.equal(core.CONFIG.maxDust,3);
  assert.ok(core.CONFIG.rolloutMaxSpeed>core.CONFIG.playerMaxSpeed);
  const race=core.createRace({difficulty:'normal',rng:fixed(.5),nowMs:0});
  assert.equal(race.racers.length,4);
  assert.equal(race.player.species.dex,232);
});

test('dust catch-up awards zero/one/two/three uses by race place and never stores more than three',()=>{
  assert.equal(core.dustAwardForPlace(1),0);
  assert.equal(core.dustAwardForPlace(2),1);
  assert.equal(core.dustAwardForPlace(3),2);
  assert.equal(core.dustAwardForPlace(4),3);
  const race=core.createRace({difficulty:'normal',rng:fixed(.5),nowMs:0});
  race.player.dust=2;
  core.awardLapDust(race,race.player,4);
  assert.equal(race.player.dust,3);
});

test('dropping dust consumes a stored use, owner is immune, and a rival is slowed on contact',()=>{
  const race=core.createRace({difficulty:'normal',rng:fixed(.5),nowMs:0});
  const player=race.player,rival=race.racers[1];
  player.dust=1;
  const drop=core.dropDust(race,player,1000);
  assert.equal(drop.accepted,true);
  assert.equal(player.dust,0);
  assert.equal(race.hazards.length,1);
  const h=race.hazards[0];
  rival.angle=h.angle;rival.radius=h.radius;rival.speed=core.CONFIG.playerMaxSpeed;
  core.resolveDustHits(race,1100);
  assert.ok(rival.stunnedUntil>1100);
  assert.ok(rival.speed<core.CONFIG.playerMaxSpeed);
  player.angle=h.angle;player.radius=h.radius;player.stunnedUntil=0;
  core.resolveDustHits(race,1200);
  assert.equal(player.stunnedUntil,0,'the Donphan that placed the dust must be immune');
});

test('entering lap nine activates Rollout and completing it ends the race',()=>{
  const race=core.createRace({difficulty:'normal',rng:fixed(.5),nowMs:0});
  const p=race.player;
  p.angularTravel=Math.PI*2*7.99;p.lapsCompleted=7;
  core.applyAngularAdvance(race,p,Math.PI*2*.02,1000);
  assert.equal(p.lapsCompleted,8);
  assert.equal(p.rollout,true);
  p.angularTravel=Math.PI*2*8.99;
  core.applyAngularAdvance(race,p,Math.PI*2*.02,2000);
  assert.equal(p.lapsCompleted,9);
  assert.equal(p.finishedAt,2000);
  assert.equal(race.finalized,true);
});

test('player steering rewards following the clockwise tangent rather than holding one direction',()=>{
  const race=core.createRace({difficulty:'normal',rng:fixed(.5),nowMs:0});
  const p=race.player;
  // At the top of the ring, clockwise tangent points right.
  core.setPlayerInput(race,1,0);
  core.advanceRace(race,1000,fixed(.5));
  assert.ok(p.speed>0);
  const travelled=p.angularTravel;
  core.setPlayerInput(race,-1,0);
  core.advanceRace(race,1500,fixed(.5));
  assert.ok(p.angularTravel>=travelled,'brief wrong steering should brake rather than teleport backwards');
});
