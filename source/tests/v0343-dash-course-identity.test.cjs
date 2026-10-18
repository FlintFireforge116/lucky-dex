'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const a=path.resolve(__dirname,'../app/src/main/assets');
global.LuckyDexDashConfig=require(path.join(a,'arcade-dash-config.js'));
global.LuckyDexDashCourseData=require(path.join(a,'arcade-dash-course-data.js'));
const course=require(path.join(a,'arcade-dash-course.js'));
const config=global.LuckyDexDashConfig,data=global.LuckyDexDashCourseData;

const signatures=new Set(),geometries=new Set();
for(const type of config.TYPE_ORDER){
  const profile=data.courseFor(type);
  assert.ok(profile.mechanics?.signature,`${type} needs an authored mechanic signature`);
  signatures.add(profile.mechanics.signature);
  const race=course.generateCourse(343,{theme:type});
  assert.equal(race.sectionPlan.length,8,`${type} keeps eight authored sections`);
  assert.ok(race.sectionPlan.some(s=>s.mechanicTag),`${type} sections expose mechanic tags`);
  assert.ok(race.objects.some(o=>o.effect==='speed-pad'),`${type} has a boost opportunity`);
  assert.ok(race.objects.some(o=>o.effect==='stamina-pickup'),`${type} has a recovery opportunity`);
  assert.ok(race.objects.filter(o=>course.isHazard(o.effect)).length>=5,`${type} has multiple hazard decisions`);
  const clusters=new Map();
  for(const obj of race.objects){const key=Math.round(obj.distance);if(!clusters.has(key))clusters.set(key,[]);clusters.get(key).push(obj);}
  for(const [distance,rows] of clusters){
    const lanes=new Set(rows.filter(o=>course.isHazard(o.effect)).map(o=>o.lane));
    assert.ok(lanes.size<=2,`${type} must preserve a safe lane at ${distance}`);
  }
  geometries.add(JSON.stringify(race.objects.map(o=>[o.effect,o.lane,o.distance,o.mechanic||'',!!o.moving])));
}
assert.equal(signatures.size,18,'all Type Leagues have distinct authored mechanic signatures');
assert.equal(geometries.size,18,'all Type Leagues produce mechanically distinct event layouts for the same seed');
assert.deepEqual(Object.fromEntries(Object.entries(config.DIFFICULTIES).map(([k,v])=>[k,[v.minSpeed,v.maxSpeed]])),{easy:[20,65],normal:[55,100],hard:[90,135],expert:[100,180]},'strict speed bands remain unchanged');
console.log('PASS v0.34.3 Dash Type League course identity and safe-path contracts');
