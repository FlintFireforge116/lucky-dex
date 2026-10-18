const test=require('node:test');
const assert=require('node:assert/strict');
const dash=require('../app/src/main/assets/arcade-dash.js');
const power=require('../app/src/main/assets/arcade-power-trial-core.js');
const impact=require('../app/src/main/assets/arcade-impact-trial-core.js');
const target=require('../app/src/main/assets/arcade-target-range-core.js');

test('Dash rookie-low and rookie-high Speed have a strong pace gap with top-end taper',()=>{
  assert.ok(dash.paceModifier(58)/dash.paceModifier(25)>1.25);
  assert.ok(dash.paceModifier(220)/dash.paceModifier(180)<1.05);
});

test('Power Trial Attack strongly changes ceiling but execution can overcome a moderate gap',()=>{
  const lowPerfect=power.strikePower({attack:25,chargeQuality:1,impactQuality:1}).power;
  const highPerfect=power.strikePower({attack:58,chargeQuality:1,impactQuality:1}).power;
  assert.ok(highPerfect-lowPerfect>=15);
  const lowGood=power.strikePower({attack:45,chargeQuality:.98,impactQuality:.98}).power;
  const highPoor=power.strikePower({attack:80,chargeQuality:.35,impactQuality:.35}).power;
  assert.ok(lowGood>highPoor);
});

test('Impact lower Defense creates more total work without raising simultaneous caps',()=>{
  const hazard=impact.HAZARDS[4],profile=impact.divisionProfile('rookie',0);
  const low=impact.createTargetPlan({hazard,profile,defense:25,rng:()=>.5});
  const high=impact.createTargetPlan({hazard,profile,defense:58,rng:()=>.5});
  assert.ok(low.targets.length>high.targets.length);
  assert.equal(low.maxLive,high.maxLive);
  const lowHit=impact.resolveHarden({hazard,profile,defense:25,hitValue:4,totalValue:8,targetsHit:4,targetsTotal:8,integrity:100});
  const highHit=impact.resolveHarden({hazard,profile,defense:58,hitValue:4,totalValue:8,targetsHit:4,targetsTotal:8,integrity:100});
  assert.ok(highHit.damage<lowHit.damage);
  const perfect=impact.resolveHarden({hazard,profile,defense:25,hitValue:8,totalValue:8,targetsHit:8,targetsTotal:8,integrity:100});
  assert.equal(perfect.damage,0);
});

test('Target Range Sp. Atk physically changes flight and armour power',()=>{
  const low=target.projectileSolution({distanceM:45,wind:1,focus:1,spAtk:25});
  const high=target.projectileSolution({distanceM:45,wind:1,focus:1,spAtk:58});
  assert.ok(low.travelMs>high.travelMs);
  assert.ok(low.drop>high.drop);
  assert.ok(low.drift>high.drift);
  assert.ok(low.impactPower<high.impactPower);
  const weak=target.armourBreaks({armored:true,armorPower:.9},{ring:'inner',points:8},{spAtk:25,focus:1});
  const strong=target.armourBreaks({armored:true,armorPower:.9},{ring:'inner',points:8},{spAtk:119,focus:1});
  assert.equal(weak,false);assert.equal(strong,true);
});
