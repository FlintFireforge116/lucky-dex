const assert=require('assert');
const path=require('path');
global.LuckyDexDashConfig=require(path.resolve(__dirname,'../app/src/main/assets/arcade-dash-config.js'));
const modPath=path.resolve(__dirname,'../app/src/main/assets/arcade-dash-course.js');
delete require.cache[modPath];
const c=require(modPath);

{
  const a=c.generateCourse(123456),b=c.generateCourse(123456),d=c.generateCourse(654321);
  assert.deepStrictEqual(a,b);
  assert.notDeepStrictEqual(a.objects,d.objects);
  assert.strictEqual(a.finishDistance,c.FINISH_DISTANCE);
  assert.ok(a.objects.length>18,'course should contain enough decisions');
  assert.ok(a.objects.every(o=>Number.isInteger(o.lane)&&o.lane>=0&&o.lane<3));
  assert.ok(a.objects.every(o=>['rock','mud','speed-pad','stamina-pickup'].includes(o.effect)&&o.skin));
  console.log('PASS Dash course generation is seeded, themed and lane-safe');
}

{
  const fire=c.generateCourse(123,{theme:'fire'}),again=c.generateCourse(123,{theme:'fire'}),water=c.generateCourse(123,{theme:'water'});
  assert.deepStrictEqual(fire,again);
  assert.notDeepStrictEqual(fire.objects.map(o=>[o.lane,o.distance,o.effect]),water.objects.map(o=>[o.lane,o.distance,o.effect]),'type courses now have authored gameplay layouts');
  assert.ok(fire.objects.some((o,i)=>o.skin!==water.objects[i]?.skin),'type courses retain distinct Gen 3 visual skins');
  assert.ok(fire.profile.mechanics?.signature&&water.profile.mechanics?.signature&&fire.profile.mechanics.signature!==water.profile.mechanics.signature);
  assert.strictEqual(fire.theme,'fire');assert.strictEqual(water.theme,'water');
  const classic=c.generateCourse(123);assert.strictEqual(classic.theme,'normal');assert.strictEqual(classic.finishDistance,1800);
  console.log('PASS same seed is deterministic while different Type Leagues have authored mechanics');
}

{
  const course=c.generateCourse(999,{theme:'ghost'});
  const clusters=new Map();
  for(const o of course.objects){const key=Math.round(o.distance);if(!clusters.has(key))clusters.set(key,[]);clusters.get(key).push(o);}
  for(const [distance,rows] of clusters){
    const hazardLanes=new Set(rows.filter(o=>c.isHazard(o.effect)).map(o=>o.lane));
    assert.ok(hazardLanes.size<3,`unavoidable three-lane hazard at ${distance}`);
  }
  const distances=[...clusters.keys()].sort((a,b)=>a-b);
  for(let i=1;i<distances.length;i++)assert.ok(distances[i]-distances[i-1]>=c.MIN_CLUSTER_SPACING-1,`clusters too close: ${distances[i-1]}, ${distances[i]}`);
  assert.strictEqual(c.isHazard('rock'),true);assert.strictEqual(c.isHazard('mud'),true);assert.strictEqual(c.isHazard('speed-pad'),false);
  console.log('PASS Dash course never creates a full-width hazard wall and respects reaction spacing');
}

{
  const course=c.generateCourse(4242);
  const third=course.finishDistance/3;
  const early=course.objects.filter(o=>o.distance>=third*.25&&o.distance<third).length;
  const late=course.objects.filter(o=>o.distance>=third*2&&o.distance<course.finishDistance-40).length;
  assert.ok(late>early,`expected later course density (${late}) > early (${early})`);
  const near=c.objectsNear(course,300,140);
  assert.ok(near.every(o=>o.distance>=300&&o.distance<=440));
  console.log('PASS Dash course density rises later and look-ahead queries are bounded');
}
