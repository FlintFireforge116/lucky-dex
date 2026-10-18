const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=n=>path.join(ROOT,'app/src/main/assets',n);

function load(){const p=asset('arcade-target-range-core.js');delete require.cache[require.resolve(p)];return require(p);}

test('focus stays bounded and cycles after the configured draw time instead of remaining capped',()=>{
  const c=load();
  assert.equal(c.focusQuality(0),0);
  assert.ok(c.focusQuality(300)>0&&c.focusQuality(300)<1);
  assert.ok(c.focusQuality(550)>0&&c.focusQuality(550)<1);
  assert.ok(c.focusQuality(850)<1);
  assert.equal(c.focusQuality(1400),1);
  assert.equal(c.focusQuality(2800),0);
  assert.equal(c.focusQuality(-50),0);
});

test('Special Attack uses diminishing returns and never returns an aim coordinate',()=>{
  const c=load();
  const low=c.statQuality(40),mid=c.statQuality(100),high=c.statQuality(160);
  assert.ok(low<mid&&mid<high);
  assert.ok(high-mid<mid-low);
  assert.equal(Object.prototype.hasOwnProperty.call(c.statAssist(160),'aimX'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(c.statAssist(160),'aimY'),false);
});

test('far shots travel longer and drop more than near shots while wind causes horizontal drift',()=>{
  const c=load();
  const near=c.projectileSolution({distanceM:12,wind:0,focus:1,spAtk:80});
  const far=c.projectileSolution({distanceM:45,wind:0,focus:1,spAtk:80});
  const windy=c.projectileSolution({distanceM:45,wind:1.5,focus:1,spAtk:80});
  assert.ok(far.travelMs>near.travelMs);
  assert.ok(far.drop>near.drop);
  assert.ok(Math.abs(windy.drift)>Math.abs(far.drift));
});

test('moving targets continue moving during projectile flight so lead matters',()=>{
  const c=load();
  const target={x:.35,y:.42,motion:{type:'crossing',amplitude:.16,periodMs:3000,phase:0}};
  const p0=c.targetPositionAt(target,0),p1=c.targetPositionAt(target,900);
  assert.notEqual(p0.x,p1.x);
  const shot=c.resolveShot({aimX:p0.x,aimY:p0.y,firedAtMs:0,distanceM:40,wind:0,focus:1,spAtk:90,target});
  assert.ok(Math.abs(shot.targetAtImpact.x-p0.x)>.01);
});

test('ring scoring is 10/8/6/3/0 and bullseyes extend a capped combo',()=>{
  const c=load();
  const t={radius:.1,x:.5,y:.5};
  assert.equal(c.scoreImpact({impactX:.5,impactY:.5,target:t,targetX:.5,targetY:.5,spAtk:60,focus:1}).points,10);
  assert.equal(c.scoreImpact({impactX:.53,impactY:.5,target:t,targetX:.5,targetY:.5,spAtk:60,focus:1}).points,8);
  assert.equal(c.scoreImpact({impactX:.555,impactY:.5,target:t,targetX:.5,targetY:.5,spAtk:60,focus:1}).points,6);
  assert.equal(c.scoreImpact({impactX:.58,impactY:.5,target:t,targetX:.5,targetY:.5,spAtk:60,focus:1}).points,3);
  assert.equal(c.scoreImpact({impactX:.65,impactY:.5,target:t,targetX:.5,targetY:.5,spAtk:60,focus:1}).points,0);
  let combo=1;
  for(let i=0;i<20;i++)combo=c.nextCombo(combo,{ring:'bullseye'},'master');
  assert.ok(combo<=c.COMBO_CAP);
  assert.equal(c.nextCombo(combo,{ring:'miss'},'master'),1);
});

test('armoured targets always break on a bullseye regardless of Special Attack',()=>{
  const c=load();
  const target={radius:.1,x:.5,y:.5,armored:true,armorPower:2};
  const hit=c.scoreImpact({impactX:.5,impactY:.5,target,targetX:.5,targetY:.5,spAtk:20,focus:.1});
  assert.equal(hit.ring,'bullseye');
  assert.equal(c.armourBreaks(target,hit,{spAtk:20,focus:.1,priorHits:0}),true);
});

test('cup rounds have distinct Marksman, Moving Range and Championship profiles',()=>{
  const c=load();
  const a=c.divisionProfile('great',0),b=c.divisionProfile('great',1),d=c.divisionProfile('great',2);
  assert.equal(a.roundName,'MARKSMAN');
  assert.equal(b.roundName,'MOVING RANGE');
  assert.equal(d.roundName,'CHAMPIONSHIP RANGE');
  assert.ok(b.motionChance>a.motionChance);
  assert.ok(d.farChance>b.farChance);
  assert.ok(d.windMax>=b.windMax);
});

test('seeded rounds are deterministic and controlled in density',()=>{
  const c=load();
  const opts={participant:{id:65,name:'Alakazam',baseStat:135},profile:c.divisionProfile('ultra',2),attackType:'psychic',seed:4242,goldenRate:.5};
  const a=c.createRound(opts),b=c.createRound(opts);
  assert.deepEqual(a.targets,b.targets);
  assert.equal(a.targets.length,b.targets.length);
  assert.ok(a.targets.length>=8&&a.targets.length<=14);
  assert.ok(a.targets.every(t=>t.distanceM>=10&&t.distanceM<=50));
});
