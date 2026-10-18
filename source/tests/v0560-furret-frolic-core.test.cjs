'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const corePath=path.join(__dirname,'..','app','src','main','assets','arcade-furret-frolic-core.js');
let core;
try{core=require(corePath);}catch(err){core={__loadError:err};}

function requireCore(){assert.equal(core.__loadError,undefined,core.__loadError?.message||'Furret core missing');return core;}
function rngSeq(values){let i=0;return ()=>values[i++%values.length];}

test('Furret Frolic recreates the four Stadium 2 ball values',()=>{
  const c=requireCore();
  assert.deepEqual(Object.fromEntries(Object.entries(c.BALL_TYPES).map(([k,v])=>[k,v.value])),{poke:1,great:2,ultra:3,master:5});
  assert.ok(c.BALL_TYPES.poke.radius<c.BALL_TYPES.great.radius);
  assert.ok(c.BALL_TYPES.great.radius<c.BALL_TYPES.ultra.radius);
  assert.ok(c.BALL_TYPES.ultra.radius<c.BALL_TYPES.master.radius);
});

test('Furret Frolic match lasts 60 seconds and has four players',()=>{
  const c=requireCore();
  const run=c.createMatch({difficulty:'normal',rng:()=>0.5,masterBallRate:0});
  assert.equal(c.CONFIG.durationMs,60000);
  assert.equal(run.players.length,4);
  assert.equal(run.players[0].isPlayer,true);
  c.stepMatch(run,60001,{});
  assert.equal(run.finished,true);
  assert.equal(run.remainingMs,0);
});

test('higher value balls unlock later in the match and Master Ball can be forced for testing',()=>{
  const c=requireCore();
  assert.deepEqual(c.availableBallKinds(0),['poke']);
  assert.ok(c.availableBallKinds(22000).includes('great'));
  assert.ok(c.availableBallKinds(36000).includes('ultra'));
  assert.ok(c.availableBallKinds(50000).includes('master'));
  const run=c.createMatch({difficulty:'normal',rng:rngSeq([0.99,0.5,0.5,0.5]),masterBallRate:1});
  run.elapsedMs=50000;
  const ball=c.spawnBall(run,{force:true});
  assert.equal(ball.kind,'master');
  assert.equal(ball.value,5);
});

test('holding a direction lunges into grass and releasing returns toward the player centre',()=>{
  const c=requireCore();
  const run=c.createMatch({difficulty:'normal',rng:()=>0.5,masterBallRate:0});
  run.balls=[];
  const p=run.players[0],start={x:p.x,y:p.y};
  c.stepMatch(run,300,{right:true});
  assert.ok(p.x>start.x+10,'player should lunge right');
  const outX=p.x;
  c.stepMatch(run,500,{});
  assert.ok(p.x<outX,'released player should spring back toward centre');
});

test('A hit shoots a nearby ball toward the active player goal',()=>{
  const c=requireCore();
  const run=c.createMatch({difficulty:'normal',rng:()=>0.5,masterBallRate:0});
  run.balls=[];run.spawnInMs=999999;
  c.stepMatch(run,350,{up:true});
  const p=run.players[0];
  run.balls=[{id:'test',kind:'poke',value:1,radius:c.BALL_TYPES.poke.radius,x:p.x,y:p.y-8,vx:0,vy:0,scored:false}];
  const before=run.balls[0].vy;
  const result=c.hit(run,0);
  assert.equal(result.accepted,true);
  assert.equal(result.ballId,'test');
  assert.ok(run.balls[0].vy>before,'player 1 goal is south, so shot should travel downward');
});

test('a ball entering a goal awards its authentic point value and respawns out of play',()=>{
  const c=requireCore();
  const run=c.createMatch({difficulty:'normal',rng:()=>0.5,masterBallRate:0});
  run.balls=[{id:'m',kind:'master',value:5,radius:34,x:c.CONFIG.width/2,y:c.CONFIG.height-c.CONFIG.goalDepth+4,vx:0,vy:200,scored:false}];
  c.stepMatch(run,40,{});
  assert.equal(run.players[0].score,5);
  assert.equal(run.players[0].masterBalls,1);
  assert.equal(run.balls[0].scored,true);
  assert.ok(run.events.some(e=>e.type==='score'&&e.player===0&&e.kind==='master'&&e.points===5));
});

test('Hard CPUs react faster and aim more accurately than Easy CPUs',()=>{
  const c=requireCore();
  const easy=c.difficultyProfile('easy'),hard=c.difficultyProfile('hard');
  assert.ok(hard.reactionMs<easy.reactionMs);
  assert.ok(hard.hitAccuracy>easy.hitAccuracy);
  assert.ok(hard.moveSpeed>easy.moveSpeed);
});

test('match ranking sorts by points and winner rewards scale with difficulty',()=>{
  const c=requireCore();
  const run=c.createMatch({difficulty:'hard',rng:()=>0.5,masterBallRate:0});
  run.players.forEach((p,i)=>p.score=[9,15,4,11][i]);
  c.finishMatch(run);
  assert.deepEqual(run.ranking.map(p=>p.index),[1,3,0,2]);
  assert.equal(run.players[0].place,3);
  assert.ok(c.rewardForResult({place:1,score:12,difficulty:'hard'})>c.rewardForResult({place:1,score:12,difficulty:'easy'}));
});
