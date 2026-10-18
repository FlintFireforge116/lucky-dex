const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const assetRoot=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assetRoot,'arcade-dash-course-data.js'));
const course=require(path.join(assetRoot,'arcade-dash-course.js'));
const manifest=JSON.parse(fs.readFileSync(path.join(assetRoot,'arcade/dash/gen3/manifest.json'),'utf8'));
const referenced=new Set();
function verify(key,kind){
  const asset=manifest.sprites[key];
  assert.ok(asset,`course asset ${key} must resolve in the extracted Emerald catalog`);
  if(kind)assert.equal(asset.kind,kind,`${key} must be a ${kind}`);
  assert.ok(!/^https?:/.test(asset.path),'every playable course image is bundled');
  assert.ok(fs.existsSync(path.join(assetRoot,asset.path)),`missing course image ${asset.path}`);
  referenced.add(key);
}
for(const type of require(path.join(assetRoot,'arcade-dash-config.js')).TYPE_ORDER){
  const race=course.generateCourse(7331,{theme:type});
  const profile=data.courseFor(type);
  verify(profile.boost.idle,'pad');verify(profile.boost.active,'pad');
  verify(profile.hazards.rock,'object');verify(profile.hazards.mud,manifest.sprites[profile.hazards.mud].kind==='patch'?'patch':'tile');
  for(const section of race.sectionPlan){
    verify(section.ground,'tile');verify(section.path,'tile');if(section.edge)verify(section.edge,'tile');
    for(const key of [...section.commonScenery,...section.uncommonScenery])verify(key,'object');
    if(section.landmark)verify(section.landmark,'object');
  }
  for(const prop of race.scenery)verify(prop.assetKey,'object');
  for(const object of race.objects)verify(object.assetKey,object.effect==='rock'?'object':object.effect==='mud'?(manifest.sprites[object.assetKey].kind==='patch'?'patch':'tile'):object.effect==='speed-pad'?'pad':'pickup');
}
const paths=[...referenced].map(key=>manifest.sprites[key].path);
assert.equal(new Set(paths).size,paths.length,'distinct asset keys cannot accidentally map to one asset path');
console.log(`PASS all 18 course profiles resolve ${referenced.size} local Emerald assets with correct rendering roles`);
