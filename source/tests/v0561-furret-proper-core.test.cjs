'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.join(__dirname,'..','app','src','main','assets','arcade-furret-frolic-core.js'));

const fixedBall=(overrides={})=>({id:'b',kind:'poke',value:1,radius:core.BALL_TYPES.poke.radius,x:360,y:360,vx:0,vy:0,scored:false,lastHitBy:null,...overrides});

function approx(actual,expected,epsilon=1.5,msg=''){
  assert.ok(Math.abs(actual-expected)<=epsilon,`${msg} expected ${expected}, got ${actual}`);
}

test('direction input locks Furret to a discrete grass patch and release snaps it home',()=>{
  const run=core.createMatch({rng:()=>0.5,masterBallRate:0});
  run.balls=[];
  const p=run.players[0];
  const home={x:p.homeX,y:p.homeY};
  core.stepMatch(run,350,{right:true});
  assert.equal(p.zone,'right');
  assert.equal(p.motionState,'locked');
  assert.equal(p.heldDirection,'right');
  approx(p.x,home.x+core.CONFIG.patchReach,2,'right patch x');
  approx(p.y,home.y,2,'right patch y');
  core.stepMatch(run,260,{});
  assert.equal(p.zone,'center');
  assert.equal(p.motionState,'home');
  assert.equal(p.heldDirection,null);
  approx(p.x,home.x,1,'home x');
  approx(p.y,home.y,1,'home y');
});

test('changing direction pings through the home burrow before locking to the new patch',()=>{
  const run=core.createMatch({rng:()=>0.5,masterBallRate:0});
  run.balls=[];
  const p=run.players[0];
  core.stepMatch(run,350,{right:true});
  assert.equal(p.zone,'right');
  core.stepMatch(run,90,{left:true});
  assert.notEqual(p.zone,'left','must not teleport directly across the burrow');
  assert.ok(Math.abs(p.x-p.homeX)<core.CONFIG.patchReach*.35,'direction change should visibly pass back through the burrow');
  core.stepMatch(run,350,{left:true});
  assert.equal(p.zone,'left');
  assert.equal(p.motionState,'locked');
  approx(p.x,p.homeX-core.CONFIG.patchReach,2,'left patch x');
});

test('mere Furret/body contact never pushes a ball; A is the only player force',()=>{
  const run=core.createMatch({rng:()=>0.5,masterBallRate:0});
  const p=run.players[0];
  run.spawnInMs=999999;
  run.balls=[fixedBall({x:p.x+12,y:p.y,vx:0,vy:0})];
  core.stepMatch(run,120,{});
  const ball=run.balls[0];
  approx(ball.vx,0,.01,'vx after body overlap');
  approx(ball.vy,0,.01,'vy after body overlap');
  approx(ball.x,p.homeX+12,.01,'x after body overlap');
  approx(ball.y,p.homeY,.01,'y after body overlap');
});

test('A hit launches only a ball in the active patch strike window toward the player goal',()=>{
  const run=core.createMatch({rng:()=>0.5,masterBallRate:0});
  run.spawnInMs=999999;
  const p=run.players[0];
  core.stepMatch(run,350,{up:true});
  assert.equal(p.zone,'up');
  run.balls=[fixedBall({x:p.x,y:p.y-18})];
  const out=core.hit(run,0,1);
  assert.equal(out.ballId,'b');
  assert.ok(run.balls[0].vy>core.CONFIG.hitSpeed*.8,'player 1 should shoot toward south goal');
  assert.ok(Math.abs(run.balls[0].vx)<core.CONFIG.hitSpeed*.12,'perfect hit should be mostly goalward');
});

test('non-goal walls visibly rebound balls instead of letting them leave the field',()=>{
  const run=core.createMatch({rng:()=>0.5,masterBallRate:0});
  run.spawnInMs=999999;
  const r=core.BALL_TYPES.poke.radius;
  run.balls=[fixedBall({x:core.CONFIG.width-core.CONFIG.wallInset-r-2,y:120,vx:420,vy:0})];
  core.stepMatch(run,80,{});
  const b=run.balls[0];
  assert.equal(b.scored,false);
  assert.ok(b.vx<0,'right wall should reverse x velocity');
  assert.ok(b.x<=core.CONFIG.width-core.CONFIG.wallInset-r+.1,'ball remains inside wall');
});

test('balls collide elastically with each other',()=>{
  const run=core.createMatch({rng:()=>0.5,masterBallRate:0});
  run.spawnInMs=999999;
  run.balls=[
    fixedBall({id:'a',x:190,y:190,vx:240,vy:0}),
    fixedBall({id:'b',x:250,y:190,vx:-240,vy:0}),
  ];
  core.stepMatch(run,70,{});
  assert.ok(run.balls[0].vx<0,'left ball should rebound left');
  assert.ok(run.balls[1].vx>0,'right ball should rebound right');
});

test('new balls enter from corner chutes with inward velocity',()=>{
  const run=core.createMatch({rng:()=>0.01,masterBallRate:0});
  const b=core.spawnBall(run,{force:true});
  const nearLeft=b.x<core.CONFIG.width*.25,nearRight=b.x>core.CONFIG.width*.75;
  const nearTop=b.y<core.CONFIG.height*.25,nearBottom=b.y>core.CONFIG.height*.75;
  assert.ok((nearLeft||nearRight)&&(nearTop||nearBottom),'spawn should begin near a corner chute');
  const toCentreX=core.CONFIG.width/2-b.x,toCentreY=core.CONFIG.height/2-b.y;
  assert.ok(b.vx*toCentreX+b.vy*toCentreY>0,'initial velocity should point inward');
});
