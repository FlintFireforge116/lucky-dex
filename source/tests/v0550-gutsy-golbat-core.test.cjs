const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const core=require(path.join(__dirname,'..','app','src','main','assets','arcade-gutsy-golbat-core.js'));

function rngSeq(values){let i=0;return ()=>values[i++%values.length];}

test('Gutsy Golbat exposes three Stadium 2 CPU difficulty profiles',()=>{
  assert.equal(core.difficultyProfile('easy').label,'Easy');
  assert.equal(core.difficultyProfile('normal').label,'Normal');
  assert.equal(core.difficultyProfile('hard').label,'Hard');
  assert.ok(core.difficultyProfile('hard').reactionMs < core.difficultyProfile('easy').reactionMs);
});

test('new Gutsy Golbat run has four Golbat and a finite cave course',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  assert.equal(run.players.length,4);
  assert.equal(run.players[0].isPlayer,true);
  assert.ok(run.entities.filter(e=>e.kind==='heart').length>=40);
  assert.ok(run.entities.filter(e=>e.kind==='magnemite').length>=10);
  assert.equal(run.goldenEvent,false);
  assert.equal(run.finished,false);
});

test('rare Golden Heart event can be forced by Settings odds',()=>{
  const run=core.createRun({difficulty:'normal',rng:rngSeq([0,0.5,0.5,0.5,0.5]),goldenHeartRate:1});
  assert.equal(run.goldenEvent,true);
  assert.equal(run.entities.filter(e=>e.kind==='heart'&&e.golden).length,1);
});

test('A-button flap applies upward impulse while gravity pulls Golbat back down',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  const p=run.players[0];
  const before=p.vy;
  core.flap(run,0);
  assert.ok(p.vy<before);
  const afterFlap=p.vy;
  core.stepRun(run,500,{left:false,right:false});
  assert.ok(run.players[0].vy>afterFlap);
});

test('heart pickup scores one and Golden Heart scores five',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  run.entities=[{id:'h1',kind:'heart',x:200,y:200,collected:false},{id:'g1',kind:'heart',golden:true,x:220,y:200,collected:false}];
  assert.equal(core.collectEntity(run,0,0).gained,1);
  assert.equal(run.players[0].hearts,1);
  assert.equal(core.collectEntity(run,0,1).gained,5);
  assert.equal(run.players[0].hearts,6);
  assert.equal(run.players[0].goldenHearts,1);
});

test('Magnemite collision scatters up to three held hearts into the cave',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  const p=run.players[0];p.hearts=5;
  run.entities=[{id:'m1',kind:'magnemite',x:p.x,y:p.y,collected:false}];
  const result=core.collectEntity(run,0,0);
  assert.equal(result.lost,3);
  assert.equal(p.hearts,2);
  assert.equal(p.magnemiteHits,1);
  assert.equal(run.entities.filter(e=>e.kind==='loose-heart'&&!e.collected).length,3);
});

test('hard rival bump knocks one heart loose from the victim',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  run.players[1].hearts=4;
  const out=core.bumpPlayer(run,0,1,core.CONFIG.rivalImpactThreshold+1);
  assert.equal(out.lost,1);
  assert.equal(run.players[1].hearts,3);
  assert.equal(run.players[0].rivalHits,1);
});

test('course finish ranks all four Golbat by hearts',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  run.players.forEach((p,i)=>p.hearts=[12,20,8,15][i]);
  core.stepRun(run,core.CONFIG.courseDurationMs+1,{});
  assert.equal(run.finished,true);
  assert.deepEqual(run.ranking.map(r=>r.index),[1,3,0,2]);
  assert.equal(run.players[0].place,3);
});

test('winner reward is meaningful and scales with difficulty and hearts',()=>{
  const normal=core.rewardForResult({place:1,hearts:25,difficulty:'normal',goldenHearts:0});
  const hard=core.rewardForResult({place:1,hearts:25,difficulty:'hard',goldenHearts:0});
  assert.ok(normal>=100&&normal<=250);
  assert.ok(hard>normal&&hard<=300);
  assert.ok(core.rewardForResult({place:1,hearts:40,difficulty:'normal',goldenHearts:1})>normal);
});
