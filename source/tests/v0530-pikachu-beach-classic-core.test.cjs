const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.resolve(__dirname,'../app/src/main/assets/arcade-pikachu-beach-classic-core.js'));

const fixedRng=()=>.25;

test('Classic starts from Yellow 6000 HP riding state and preserves Radness table',()=>{
  const r=core.createRun({difficulty:'normal',rng:fixedRng});
  assert.equal(r.hp,6000); assert.equal(r.state,'riding'); assert.equal(r.sections,0); assert.equal(r.speed,.25);
  assert.equal(core.scoreTrick(['left']),50);
  assert.equal(core.scoreTrick(['left','left']),150);
  assert.equal(core.scoreTrick(['left','right']),180);
  assert.equal(core.scoreTrick(['right','right','right']),350);
  assert.equal(core.scoreTrick(['right','left','right']),500);
});

test('Classic reaches jumping then landing/riding and banks flips only on safe landing',()=>{
  const r=core.createRun({rng:fixedRng}); r.speed=1.5; r.speedUnits=384; r.waveTimerMs=0;
  let ev=core.step(r,20); assert.ok(ev.some(x=>x.type==='jump')); assert.equal(r.state,'jumping');
  core.setInput(r,{left:true,right:false}); core.step(r,400); core.setInput(r,{left:false,right:false});
  assert.ok(r.air.flips.length>=1);
  r.air.remainingMs=20; r.air.angleDeg=0; r.air.slope='flat';
  ev=core.step(r,20); assert.ok(ev.some(x=>x.type==='landing')); assert.equal(r.radness,50); assert.equal(r.state,'landing');
  core.step(r,320); assert.equal(r.state,'riding');
});

test('Normal landing classes produce clean rough hard and wipeout speed effects',()=>{
  const land=angle=>{const r=core.createRun({rng:fixedRng}); r.speed=1.6;r.speedUnits=Math.round(1.6*256);r.state='jumping';r.air={angleDeg:angle,flips:[],segmentDirection:null,segmentTravelDeg:0,remainingMs:20,slope:'flat',lucky:false};const before=r.speed;const ev=core.step(r,20).find(x=>x.type==='landing'||x.type==='wipeout');return {r,before,ev};};
  let x=land(0); assert.equal(x.ev.type,'landing');assert.equal(x.ev.quality,'clean');assert.ok(x.r.speed>=x.before);
  x=land(45); assert.equal(x.ev.quality,'rough');assert.ok(x.r.speed<x.before);
  x=land(80); assert.equal(x.ev.quality,'hard');assert.ok(x.r.speed<x.before-.25);
  x=land(170); assert.equal(x.ev.type,'wipeout');assert.equal(x.r.speed,.25);assert.equal(x.r.state,'crashed');
});

test('Easy and Hard wrap landing tolerance without changing Yellow trick scoring',()=>{
  const classify=(difficulty,angle)=>{const r=core.createRun({difficulty,rng:fixedRng});r.state='jumping';r.speed=1.4;r.speedUnits=358;r.air={angleDeg:angle,flips:['left'],segmentDirection:null,segmentTravelDeg:0,remainingMs:20,slope:'flat',lucky:false};return core.step(r,20).find(x=>x.type==='landing'||x.type==='wipeout');};
  assert.notEqual(classify('easy',100).type,'wipeout');
  assert.equal(classify('hard',100).type,'wipeout');
  assert.equal(core.scoreTrick(['left','right','left']),500);
});

test('HP expiry loses, shore completion clears, and total is Radness plus remaining HP',()=>{
  const dead=core.createRun({rng:fixedRng}); dead.hp=1; core.step(dead,20); assert.equal(dead.finished,true);assert.equal(dead.cleared,false);assert.equal(core.finishRun(dead).finalScore,0);
  const r=core.createRun({rng:fixedRng});r.hp=4321;r.radness=680;r.sections=23;r.distanceFraction=65500;r.speed=2;r.speedUnits=512;core.step(r,20);assert.equal(r.finished,true);assert.equal(r.cleared,true);const out=core.finishRun(r);assert.equal(out.finalScore,out.radness+out.remainingHp);
});

test('Classic fixed-step simulation is deterministic across one delayed frame',()=>{
  const a=core.createRun({rng:fixedRng}),b=core.createRun({rng:fixedRng});
  a.waveTimerMs=b.waveTimerMs=99999;
  core.setInput(a,{left:true});core.setInput(b,{left:true});
  core.step(a,240);for(let i=0;i<12;i++)core.step(b,20);
  for(const key of ['hp','sections','distanceFraction','speedUnits','elapsedMs','state'])assert.equal(a[key],b[key],key);
  assert.equal(core.snapshot(a).progress,core.snapshot(b).progress);
});

test('Lucky Wave flags its generated wave and landing',()=>{
  const r=core.createRun({luckyWave:true,rng:()=>0}); r.speed=1.5;r.speedUnits=384;r.waveTimerMs=0;r.waveIndex=r.luckyWaveIndex-1;
  let ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='luckyWave'));assert.equal(r.luckyWaveSeen,true);
  r.air.remainingMs=20;r.air.angleDeg=0;r.air.slope='flat';ev=core.step(r,20);assert.equal(r.luckyWaveLanded,true);
});
