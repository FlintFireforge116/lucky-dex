'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../app/src/main/assets/arcade-target-range-core.js');

test('holding never locks at full focus: charge rises, falls and repeats',()=>{
  const p=C.difficultyProfile('easy');
  const samples=[0,800,1600,2400,3200,4000,4800].map(t=>C.focusQuality(t,p));
  assert.equal(samples[0],0);assert.ok(samples[1]>.3&&samples[1]<.7);
  assert.ok(samples[2]>.99);assert.ok(samples[3]<.7);assert.ok(samples[4]<.01);
  assert.ok(samples[5]>.3);assert.ok(samples[6]>.99);
});

test('release window is forgiving on Easy and still readable in Master',()=>{
  const easy=C.difficultyProfile('easy'),master=C.divisionProfile('master',2);
  assert.equal(typeof C.releaseQuality,'function');
  assert.equal(C.releaseQuality(.85,easy),1);
  assert.ok(C.releaseQuality(.85,master)<1);
  assert.ok(easy.focusRiseMs>master.focusRiseMs&&master.focusRiseMs>=1000);
  for(const p of [easy,master]){
    const clean=C.projectileSolution({distanceM:35,wind:.5,focus:C.releaseQuality(.99,p),spAtk:70});
    const poor=C.projectileSolution({distanceM:35,wind:.5,focus:C.releaseQuality(.2,p),spAtk:70});
    assert.ok(clean.stability>poor.stability);assert.ok(clean.impactPower>poor.impactPower);assert.ok(clean.sway<poor.sway);
  }
});

test('near/far physical target depth and deliberately paced flight agree',()=>{
  assert.ok(C.rangeYForDistance(10)>=.64);
  assert.ok(C.rangeYForDistance(50)<=.36);
  const r=C.createRound({profile:C.difficultyProfile('easy'),seed:1543});
  const near=r.targets.toSorted((a,b)=>a.distanceM-b.distanceM)[0],far=r.targets.toSorted((a,b)=>b.distanceM-a.distanceM)[0];
  assert.ok(near.y>far.y+.1);assert.ok(near.radius>far.radius*1.3);
  const a=C.projectileSolution({distanceM:10}),b=C.projectileSolution({distanceM:50});
  assert.ok(a.travelMs>=650&&b.travelMs>=1200);assert.ok(b.travelMs>a.travelMs&&b.drop>a.drop);
});

test('motion stays gentle even in Master and never times out a sensible hold',()=>{
  const r=C.createRound({profile:{...C.divisionProfile('master',2),motionChance:1},seed:88});
  assert.ok(r.targets.some(t=>t.motion.type!=='stationary'));
  for(const t of r.targets.filter(t=>t.motion.type!=='stationary'))assert.ok(t.motion.periodMs>=6000);
});

test('portrait pixel scoring uses the same round target rather than a stretched ellipse',()=>{
  const target={x:.5,y:.4,radius:.1};
  const x=C.scoreImpact({impactX:.55,impactY:.4,target,fieldAspect:.5});
  const y=C.scoreImpact({impactX:.5,impactY:.425,target,fieldAspect:.5});
  assert.equal(x.ring,y.ring);assert.ok(Math.abs(x.ratio-y.ratio)<1e-8);
  assert.equal(C.scoreImpact({impactX:.5,impactY:.49,target,fieldAspect:.5}).ring,'miss');
});

test('Golden Target grants rare win only for its bullseye, once',()=>{
  function round(){const r=C.createRound({seed:5,goldenRate:1,participant:{baseStat:60}});r.targets=[{id:'gold',x:.5,y:.4,radius:.1,distanceM:10,wind:0,golden:true,motion:{type:'stationary'}}];return r;}
  const a=round(),miss=C.applyShot(a,{aimX:.56,aimY:.39,focus:1});
  assert.notEqual(miss.hit.ring,'bullseye');assert.equal(a.goldenWon,0);
  const b=round(),hit=C.applyShot(b,{aimX:.5,aimY:.39,focus:1});
  assert.equal(hit.hit.ring,'bullseye');assert.equal(b.goldenWon,1);
  assert.equal(C.applyShot(b,{aimX:.5,aimY:.39,focus:1}),null);assert.equal(b.goldenWon,1);
});

test('smooth flight starts at the actual shooter and ends at the scoring destination',()=>{
  const shot=C.resolveShot({aimX:.51,aimY:.33,distanceM:50,wind:.5,focus:.8});
  const args={startX:.5,startY:.88,aimX:.51,aimY:.33,impactX:shot.impactX,impactY:shot.impactY};
  assert.deepEqual(C.projectileVisualPoint({...args,progress:0}),{x:.5,y:.88});
  assert.deepEqual(C.projectileVisualPoint({...args,progress:1}),{x:shot.impactX,y:shot.impactY});
  let last={x:.5,y:.88};for(let i=1;i<=100;i++){const p=C.projectileVisualPoint({...args,progress:i/100});assert.ok(Math.hypot(p.x-last.x,p.y-last.y)<.025);last=p;}
});
