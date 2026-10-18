'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const CORE=path.join(__dirname,'..','app','src','main','assets','arcade-barrier-ball-core.js');
function load(){assert.equal(fs.existsSync(CORE),true,'arcade-barrier-ball-core.js must exist');delete require.cache[require.resolve(CORE)];return require(CORE);}

test('Barrier Ball is a four-Mr-Mime 60-second first-to-five match',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5});
  assert.equal(core.CONFIG.durationMs,60000);
  assert.equal(core.CONFIG.scoreToWin,5);
  assert.equal(run.players.length,4);
  assert.deepEqual(run.players.map(p=>p.dex),[122,122,122,122]);
  assert.deepEqual(run.players.map(p=>p.score),[0,0,0,0]);
});

test('each player only slides along their own goal line',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5});
  const you=run.players[0],startY=you.y;
  core.stepMatch(run,200,[{move:1},{move:0},{move:0},{move:0}]);
  assert.ok(you.offset>0);
  assert.equal(you.y,startY);
  assert.ok(you.x>core.CONFIG.centreX);
});

test('ordinary Barrier contact reflects an incoming ball',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  const you=run.players[0];
  const ball=core.spawnBall(run,{x:you.x,y:you.y-28,vx:0,vy:350});
  core.stepMatch(run,16,[{move:0},{move:0},{move:0},{move:0}]);
  assert.ok(ball.vy<0,'bottom Barrier should send an incoming ball back upward');
  assert.equal(ball.lastTouchedBy,0);
});

test('A smash adds substantial speed when the Barrier meets the ball',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  const you=run.players[0];
  const normal=core.spawnBall(run,{x:you.x,y:you.y-28,vx:0,vy:320});
  core.stepMatch(run,16,[{move:0},{move:0},{move:0},{move:0}]);
  const normalSpeed=Math.hypot(normal.vx,normal.vy);
  run.balls.length=0;
  const smash=core.spawnBall(run,{x:you.x,y:you.y-28,vx:0,vy:320});
  assert.equal(core.smash(run,0),true);
  core.stepMatch(run,16,[{move:0},{move:0},{move:0},{move:0}]);
  assert.ok(Math.hypot(smash.vx,smash.vy)>normalSpeed*1.25);
});

test('moving sideways while smashing puts curve on the return',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  const you=run.players[0];
  you.velocity=core.CONFIG.paddleMaxSpeed;
  const ball=core.spawnBall(run,{x:you.x,y:you.y-28,vx:0,vy:330});
  core.smash(run,0);
  core.stepMatch(run,16,[{move:1},{move:0},{move:0},{move:0}]);
  assert.ok(ball.vx>80,'rightward Barrier movement should bend the return to the right');
});

test('scoring gives the attacker one point and removes one from the victim without going below zero',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  run.players[0].score=2;run.players[1].score=2;
  let ball=core.spawnBall(run,{x:core.CONFIG.width+20,y:core.CONFIG.centreY,vx:300,vy:0,lastTouchedBy:0});
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.equal(run.players[0].score,3);
  assert.equal(run.players[1].score,1);
  run.balls.length=0;run.players[1].score=0;
  ball=core.spawnBall(run,{x:core.CONFIG.width+20,y:core.CONFIG.centreY,vx:300,vy:0,lastTouchedBy:0});
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.equal(run.players[1].score,0);
});

test('the first player to five points wins immediately',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  run.players[0].score=4;
  core.spawnBall(run,{x:core.CONFIG.width+20,y:core.CONFIG.centreY,vx:300,vy:0,lastTouchedBy:0});
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.equal(run.players[0].score,5);
  assert.equal(run.finished,true);
  assert.equal(run.winnerIndex,0);
});

test('multiple balls can coexist and a new ball appears when the court becomes empty',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  core.spawnBall(run);core.spawnBall(run);
  assert.equal(run.balls.length,2);
  run.balls.length=0;run.nextSpawnMs=0;
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.ok(run.balls.length>=1);
});

test('the 60-second horn ranks by score if nobody reaches five',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  run.players[0].score=2;run.players[1].score=1;run.players[2].score=4;run.players[3].score=3;
  run.elapsedMs=59980;
  core.stepMatch(run,40,[{},{},{},{}]);
  assert.equal(run.finished,true);
  assert.equal(run.winnerIndex,2);
  assert.deepEqual(run.ranking.map(p=>p.index),[2,3,0,1]);
});
