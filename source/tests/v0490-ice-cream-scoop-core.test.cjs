const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.join(__dirname,'..','app','src','main','assets','arcade-ice-cream-scoop-core.js'));

test('ice cream scoop core exposes three tuned difficulties and 20 scoop cap',()=>{
  assert.equal(core.CONFIG.maxScoops,20);
  assert.deepEqual(Object.keys(core.DIFFICULTIES),['easy','normal','hard']);
  assert.ok(core.DIFFICULTIES.easy.scoopWidth>core.DIFFICULTIES.normal.scoopWidth);
  assert.ok(core.DIFFICULTIES.normal.scoopWidth>core.DIFFICULTIES.hard.scoopWidth);
  assert.ok(core.DIFFICULTIES.easy.travelMs>core.DIFFICULTIES.hard.travelMs);
});

test('centred drops are perfect, safe, and build score/streak',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>.2,dreamRate:0});
  const one=core.resolveDrop(run,.5,()=>.2);
  assert.equal(one.safe,true);
  assert.equal(one.quality.perfect,true);
  assert.equal(run.stack.length,1);
  assert.equal(run.perfectStreak,1);
  assert.ok(run.score>0);
  const two=core.resolveDrop(run,.5,()=>.2);
  assert.equal(two.safe,true);
  assert.equal(run.perfectStreak,2);
  assert.equal(run.bestPerfectStreak,2);
});

test('large misalignment collapses the tower',()=>{
  const run=core.createRun({difficulty:'hard',rng:()=>.2,dreamRate:0});
  core.resolveDrop(run,.5,()=>.2);
  const out=core.resolveDrop(run,.12,()=>.2);
  assert.equal(out.accepted,true);
  assert.equal(out.safe,false);
  assert.equal(run.collapsed,true);
  assert.equal(run.stack.length,2);
  assert.equal(run.stack[1].falling,true);
});

test('hard mode requires more overlap than easy',()=>{
  const easy=core.createRun({difficulty:'easy',rng:()=>.2,dreamRate:0});
  const hard=core.createRun({difficulty:'hard',rng:()=>.2,dreamRate:0});
  core.resolveDrop(easy,.5,()=>.2);core.resolveDrop(hard,.5,()=>.2);
  const easyQ=core.placementQuality(easy,.63),hardQ=core.placementQuality(hard,.63);
  assert.ok(easyQ.overlap>hardQ.overlap);
  assert.ok(core.DIFFICULTIES.hard.supportSoftness<core.DIFFICULTIES.easy.supportSoftness);
  assert.ok(core.DIFFICULTIES.hard.friction<core.DIFFICULTIES.easy.friction);
});

test('Dream Scoop can be forced and appears between scoop 4 and 7',()=>{
  const seq=[0,.5,.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,.1];let i=0;
  const rng=()=>seq[i++]??.1;
  const run=core.createRun({difficulty:'normal',rng,dreamRate:1});
  assert.equal(run.dreamEvent,true);
  assert.ok(run.dreamScoopIndex>=3&&run.dreamScoopIndex<=6);
  while(run.stack.length<run.dreamScoopIndex){core.resolveDrop(run,.5,rng);}
  assert.equal(run.current.isDream,true);
  assert.equal(run.dreamSeen,true);
  const result=core.resolveDrop(run,.5,rng);
  assert.equal(result.safe,true);
  assert.equal(run.dreamLanded,true);
});

test('20 safe centred scoops complete a run and pay more than a short run',()=>{
  const long=core.createRun({difficulty:'normal',rng:()=>.2,dreamRate:0});
  for(let i=0;i<20;i++)core.resolveDrop(long,.5,()=>.2);
  assert.equal(long.complete,true);
  assert.equal(long.stack.length,20);
  const short=core.createRun({difficulty:'normal',rng:()=>.2,dreamRate:0});
  for(let i=0;i<3;i++)core.resolveDrop(short,.5,()=>.2);
  assert.ok(core.rewardForRun(long)>core.rewardForRun(short));
});
