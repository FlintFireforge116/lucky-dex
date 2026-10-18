const assert=require('node:assert/strict');
const path=require('node:path');
const assetRoot=path.resolve(__dirname,'../app/src/main/assets');
const config=require(path.join(assetRoot,'arcade-dash-config.js'));
const courseApi=require(path.join(assetRoot,'arcade-dash-course.js'));

// A missing course plan, uncovered distance or wrong section selection makes
// the playable environment and its preview diverge.
const first=courseApi.generateCourse(7331,{theme:'water'});
assert.ok(Array.isArray(first.sectionPlan),'generated course must resolve authored sections');
const data=require(path.join(assetRoot,'arcade-dash-course-data.js'));
assert.equal(first.sectionPlan.length,8);
assert.equal(first.sectionPlan[0].start,0);
assert.equal(first.sectionPlan.at(-1).end,1800);
assert.equal(courseApi.sectionAt(first,260).index,1);
assert.equal(courseApi.sectionAt(first,1800).index,7);
assert.equal(courseApi.sectionAt(first,-30).index,0);
assert.equal(courseApi.sectionAt(first,5000).index,7);

const compositions=new Set();
const previewCompositions=new Set();
for(const type of config.TYPE_ORDER){
  const profile=data.courseFor(type);
  const race=courseApi.generateCourse(7331,{theme:type});
  assert.equal(profile.id,type);
  assert.equal(data.courseFor(type.toUpperCase()),profile);
  assert.equal(race.profile,profile);
  assert.equal(profile.sections.length,8);
  assert.ok(profile.preview.seed>0&&profile.preview.distance>0&&profile.preview.distance<1800);
  assert.ok(profile.ground&&profile.path&&profile.commonScenery.length&&profile.uncommonScenery.length);
  assert.ok(profile.hazards.rock&&profile.hazards.mud&&profile.boost.idle&&profile.boost.active);
  compositions.add(JSON.stringify([profile.ground,profile.path,profile.edge,profile.commonScenery,profile.sections]));
  const ids=new Set();
  for(let i=0;i<race.sectionPlan.length;i++){
    const section=race.sectionPlan[i];
    assert.equal(section.index,i);
    assert.ok(data.SECTION_TEMPLATES[section.template]);
    assert.ok(section.end>section.start);
    if(i)assert.equal(section.start,race.sectionPlan[i-1].end);
    assert.ok(section.ground&&section.path&&section.commonScenery.length);
    assert.ok(!ids.has(section.id));ids.add(section.id);
  }
  assert.ok(race.scenery.length>65,'sections need regular roadside rhythm');
  const sceneryIds=new Set();
  for(const prop of race.scenery){
    assert.ok(prop.assetKey&&[-1,1].includes(prop.side));
    assert.ok(prop.lateral>=0&&prop.lateral<=1);
    assert.ok(['inner','outer'].includes(prop.slot));
    assert.equal(prop.scale,1,'source sprite pixels share the renderer pixel scale');
    assert.ok(prop.distance>=0&&prop.distance<=1800);
    assert.ok(!sceneryIds.has(prop.id));sceneryIds.add(prop.id);
    assert.ok(race.sectionPlan.some(section=>section.id===prop.sectionId));
    if(prop.landmark)assert.ok(race.scenery.filter(other=>other.side===prop.side&&other.sectionId===prop.sectionId&&!other.landmark).every(other=>Math.abs(other.distance-prop.distance)>=48),'tall landmark needs its own clear base');
  }
  const preview=courseApi.generateCourse(profile.preview.seed,{theme:type});
  const section=courseApi.sectionAt(preview,profile.preview.distance);
  assert.ok(section.ground&&section.path,'preview reads the real authored course');
  previewCompositions.add(JSON.stringify([section.ground,section.path,section.edge,section.commonScenery,section.uncommonScenery,section.landmark]));
  assert.deepEqual(race,courseApi.generateCourse(7331,{theme:type}));
}
assert.equal(compositions.size,18,'Type Leagues must have distinct asset compositions');
assert.equal(previewCompositions.size,18,'representative preview sections must show each course identity');
assert.equal(data.courseFor('unrecognised'),data.COURSES.normal);
assert.equal(courseApi.generateCourse(12,{theme:'unrecognised'}).theme,'normal');
console.log('PASS all 18 authored courses resolve deterministic sections, scenery and actual-course previews');

// Section role controls the event rhythm: removing the boost hall or allowing
// hazards into the recovery meadow violates what the player can learn.
const sample=courseApi.generateCourse(123456);
const hall=sample.sectionPlan.find(section=>section.template==='boost-hall');
const meadow=sample.sectionPlan.find(section=>section.template==='meadow');
assert.ok(sample.objects.filter(o=>o.distance>=hall.start&&o.distance<hall.end&&o.effect==='speed-pad').length>=2);
assert.equal(sample.objects.filter(o=>o.distance>=meadow.start&&o.distance<meadow.end&&courseApi.isHazard(o.effect)).length,0);
assert.ok(sample.objects.filter(o=>o.distance>=meadow.start&&o.distance<meadow.end&&o.effect==='stamina-pickup').length>=1);
assert.notDeepEqual(sample.scenery,courseApi.generateCourse(654321).scenery);
assert.deepEqual(courseApi.sceneryNear(sample,600,120),sample.scenery.filter(o=>o.distance>=600&&o.distance<=720));
console.log('PASS boost hall and recovery meadow create authored mechanical rhythm');

// Each Type League may now author its own event grammar, but every generated
// layout must stay deterministic, reaction-safe and leave at least one lane open.
for(let seed=1;seed<=300;seed++){
  const geometries=new Set();
  for(const type of config.TYPE_ORDER){
    const race=courseApi.generateCourse(seed,{theme:type}),again=courseApi.generateCourse(seed,{theme:type}),rows=new Map();
    assert.deepEqual(race,again,`${type} seed ${seed} must be deterministic`);
    assert.ok(race.objects.length>=24&&race.objects.length<=32);
    for(const obj of race.objects){
      assert.ok(obj.distance>=150&&obj.distance<1800);
      assert.ok(obj.lane>=0&&obj.lane<3);
      if(!rows.has(obj.distance))rows.set(obj.distance,[]);
      rows.get(obj.distance).push(obj);
    }
    const distances=[...rows.keys()].sort((a,b)=>a-b);
    for(let i=1;i<distances.length;i++)assert.ok(distances[i]-distances[i-1]>=52);
    for(const cluster of rows.values())assert.ok(new Set(cluster.filter(o=>courseApi.isHazard(o.effect)).map(o=>o.lane)).size<=2);
    geometries.add(JSON.stringify(race.objects.map(o=>[o.effect,o.lane,o.distance])));
  }
  assert.ok(geometries.size>=12,`seed ${seed} should preserve broad Type League mechanical variety`);
}
console.log('PASS 300 seeds preserve safe reaction spacing while Type Leagues keep authored event variety');
