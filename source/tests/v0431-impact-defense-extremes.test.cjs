const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('path');
const root=path.resolve(__dirname,'..');
const asset=p=>path.join(root,'app/src/main/assets',p);
function freshCore(){const p=asset('arcade-impact-trial-core.js');delete require.cache[require.resolve(p)];return require(p);}
function freshAdapters(){
  const p=asset('arcade-goldenrod-adapters.js');
  delete require.cache[require.resolve(p)];
  delete global.LuckyDexGoldenrodAdapters;
  return require(p);
}

test('Defense 5 creates a dramatically heavier Easy Harden workload than normal Rookie-level Defense',()=>{
  const C=freshCore();
  const rng=()=>.4;
  const low=C.HAZARDS.map(h=>C.createTargetPlan({hazard:h,difficulty:'easy',defense:5,rng,golden:false}).targets.length);
  const mid=C.HAZARDS.map(h=>C.createTargetPlan({hazard:h,difficulty:'easy',defense:60,rng,golden:false}).targets.length);
  assert.ok(low[0]>=12,`Defense 5 Rolling Boulder should create at least 12 shields on Easy, got ${low[0]}`);
  assert.ok(low[2]>=15,`Defense 5 Rock Slide should create at least 15 falling shields on Easy, got ${low[2]}`);
  assert.ok(low[4]>=20,`Defense 5 Final Barrage should create at least 20 shields on Easy, got ${low[4]}`);
  assert.ok(low.every((count,i)=>count>=Math.ceil(mid[i]*1.8)),`Defense 5 workload should be visibly heavier than Defense 60: low=${low}, mid=${mid}`);
});

test('Defense 5 is near-one-shot fragile when no Harden shields are collected even on Easy',()=>{
  const C=freshCore();
  const first=C.resolveHarden({hazard:C.HAZARDS[0],difficulty:'easy',defense:5,hitValue:0,totalValue:12,targetsHit:0,targetsTotal:12,integrity:100});
  const charge=C.resolveHarden({hazard:C.HAZARDS[1],difficulty:'easy',defense:5,hitValue:0,totalValue:14,targetsHit:0,targetsTotal:14,integrity:100});
  assert.ok(first.damage>=80,`Defense 5 should lose at least 80 integrity to a completely undefended Easy boulder, got ${first.damage}`);
  assert.ok(charge.damage>=90,`Defense 5 should be effectively one-shot fragile against the Easy Tauros charge, got ${charge.damage}`);
  const perfect=C.resolveHarden({hazard:C.HAZARDS[0],difficulty:'easy',defense:5,hitValue:12,totalValue:12,targetsHit:12,targetsTotal:12,integrity:100});
  assert.equal(perfect.damage,0,'perfect Harden play must still fully protect even Defense 5');
});

test('low-end Defense has a tight progression instead of flattening every stat below 20',()=>{
  const C=freshCore(),hazard=C.HAZARDS[2];
  const plan5=C.createTargetPlan({hazard,difficulty:'easy',defense:5,rng:()=>.4,golden:false});
  const plan20=C.createTargetPlan({hazard,difficulty:'easy',defense:20,rng:()=>.4,golden:false});
  const plan40=C.createTargetPlan({hazard,difficulty:'easy',defense:40,rng:()=>.4,golden:false});
  assert.ok(plan5.targets.length>plan20.targets.length,'Defense 5 should demand more shields than Defense 20');
  assert.ok(plan20.targets.length>plan40.targets.length,'Defense 20 should demand more shields than Defense 40');
  const miss5=C.resolveHarden({hazard,difficulty:'easy',defense:5,hitValue:0,totalValue:plan5.totalValue,targetsHit:0,targetsTotal:plan5.targets.length,integrity:100});
  const miss20=C.resolveHarden({hazard,difficulty:'easy',defense:20,hitValue:0,totalValue:plan20.totalValue,targetsHit:0,targetsTotal:plan20.targets.length,integrity:100});
  const miss40=C.resolveHarden({hazard,difficulty:'easy',defense:40,hitValue:0,totalValue:plan40.totalValue,targetsHit:0,targetsTotal:plan40.targets.length,integrity:100});
  assert.ok(miss5.damage>miss20.damage&&miss20.damage>miss40.damage,`miss damage should step down with Defense: ${miss5.damage}, ${miss20.damage}, ${miss40.damage}`);
});

test('Impact Trial CPU uses the same extra low-Defense separation',()=>{
  global.LuckyDexGoldenrodCore=require(asset('arcade-goldenrod-core.js'));
  global.LuckyDexImpactTrialCore=freshCore();
  global.LuckyDexGoldenrodStatCurve=require(asset('arcade-goldenrod-stat-curve.js'));
  const A=freshAdapters(),impact=A.get('impactTrial');
  const profile={consistency:.55,risk:.3,mistake:0,peak:.55,variance:0,seed:1};
  const weak=impact.simulateAiRound({entrant:{key:'same',id:113,baseStat:5},profile,divisionId:'rookie',roundIndex:0,seed:77});
  const low=impact.simulateAiRound({entrant:{key:'same',id:999,baseStat:20},profile,divisionId:'rookie',roundIndex:0,seed:77});
  const mid=impact.simulateAiRound({entrant:{key:'same',id:998,baseStat:40},profile,divisionId:'rookie',roundIndex:0,seed:77});
  assert.ok(weak.metric<low.metric&&low.metric<mid.metric,`CPU Defense should separate 5 < 20 < 40, got ${weak.metric}, ${low.metric}, ${mid.metric}`);
});
