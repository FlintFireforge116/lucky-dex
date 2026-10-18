const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=require('../app/src/main/assets/arcade-fossil-museum-core.js');

function bounds(mask){
  let maxR=0,maxC=0;
  for(const [r,c] of mask){maxR=Math.max(maxR,r);maxC=Math.max(maxC,c);}
  return {h:maxR+1,w:maxC+1};
}

// Cave-ins act on unbanked haul and are severe but never wipe a 2+ item haul completely.
assert.strictEqual(core.CAVE_IN_LOSS_CHANCE,0.60,'cave-in loss chance must be 60%');
let seq=[0.1,0.7,0.2];
let resolved=core.resolveCaveInHaul(['a','b','c'],()=>seq.shift());
assert.deepStrictEqual(resolved.keptIds,['b']);
assert.deepStrictEqual(resolved.lostIds,['a','c']);
resolved=core.resolveCaveInHaul(['a','b','c'],()=>0);
assert.strictEqual(resolved.keptIds.length,1,'2+ recovered finds must guarantee one survivor');
assert.strictEqual(resolved.lostIds.length,2);
resolved=core.resolveCaveInHaul(['solo'],()=>0);
assert.deepStrictEqual(resolved.keptIds,[],'a single recovered find may be lost in a cave-in');
assert.deepStrictEqual(resolved.lostIds,['solo']);

// Mining footprints should reflect authentic Underground-style object sizes rather than generic blobs/bars.
const expectedBounds={
  'helix-fossil':{w:4,h:4},
  'dome-fossil':{w:5,h:4},
  'old-amber':{w:4,h:4},
  'root-fossil':{w:5,h:5},
  'claw-fossil':{w:4,h:5},
  'skull-fossil':{w:4,h:4},
  'armor-fossil':{w:5,h:4},
  'star-piece':{w:3,h:3},
  'odd-keystone':{w:4,h:4},
};
for(const [id,expected] of Object.entries(expectedBounds)){
  const item=core.byId(id);assert(item,`missing ${id}`);
  assert.deepStrictEqual(bounds(item.mask),expected,`${id} excavation footprint should match its mining sprite scale`);
}
for(const id of ['helix-fossil','dome-fossil','old-amber','root-fossil','claw-fossil','skull-fossil','armor-fossil','star-piece','odd-keystone']){
  assert.match(core.byId(id).sprite,/arcade\/fossil-museum-v025(?:2\/mining|[3-9]\/items)\//,`${id} should use a local pixel mining-art set`);
}

const runtime=read('app/src/main/assets/arcade-fossil-museum.js');
assert.doesNotMatch(runtime,/UNBANKED/,'recovery state should remain mechanical without noisy UNBANKED copy');
assert.match(runtime,/Recovered finds are only collected when you leave/,'dig should still explain delayed collection before a cave-in');
assert.match(runtime,/resolveCaveInHaul/,'collapse must resolve losses before rewards are granted');
assert.match(runtime,/Lost in the cave-in/,'collapse result must identify lost finds');
assert.match(runtime,/bankRecoveredFind/,'reward grants should be centralised at banking time');
assert.doesNotMatch(runtime,/for\(const id of result\.recoveredIds\)[\s\S]{0,180}routeRecoveredFind/,'strikeCell must not immediately grant recovered finds');
assert.match(runtime,/setOrientation\?\.\('landscape'\)/,'opening Museum Collection should request landscape');
assert.match(runtime,/setOrientation\?\.\('portrait'\)/,'closing Museum Collection should restore portrait');
assert.match(runtime,/MUSEUM_CASES/,'museum placement should be case based');
assert.doesNotMatch(runtime,/MUSEUM_SLOTS\s*=\s*\{/,'arbitrary exhibit coordinates should be retired');
global.LuckyDexFossilMuseumCore=core;
const museumRuntime=require('../app/src/main/assets/arcade-fossil-museum.js');
assert.deepStrictEqual(Object.keys(museumRuntime.MUSEUM_CASES).sort(),['innerLower','innerUpper','outerLow','outerMid','outerTop','pedestal','topA','topB','topC'].sort(),'museum layout must model only the eight genuine glass displays plus the central pedestal');
for(const id of ['relic-crown','hard-stone','everstone','fire-stone','water-stone']){
  const slot=museumRuntime.museumSlotFor(id);
  assert.ok(slot&&slot.caseId==='innerUpper',`${id} should use the genuine upper inner case`);
  assert.ok(slot.y>=51&&slot.y<=59,`${id} must sit on the upper inner case glass`);
}
for(const id of ['thunder-stone','leaf-stone','moon-stone']){
  const slot=museumRuntime.museumSlotFor(id);
  assert.ok(slot&&slot.caseId==='innerLower',`${id} should use the genuine lower inner case`);
  assert.ok(slot.y>=68&&slot.y<=76,`${id} must sit on the lower inner case glass`);
}

const app=read('app/src/main/assets/app-v0167.js');
assert.match(app,/setOrientation:\s*\(mode\)/,'web app bridge must expose orientation control');
const activity=read('app/src/main/java/com/example/luckydex/MainActivity.java');
assert.match(activity,/setOrientation\(String mode\)/);
assert.match(activity,/SCREEN_ORIENTATION_LANDSCAPE/);
assert.match(activity,/SCREEN_ORIENTATION_PORTRAIT/);
const manifest=read('app/src/main/AndroidManifest.xml');
assert.match(manifest,/android:configChanges="orientation\|screenSize\|keyboardHidden"/,'orientation changes must not recreate the WebView activity');

const html=read('app/src/main/assets/index.html');
assert.match(html,/(?:museum-landscape-v0252|museum-game-v0253)/,'museum needs a dedicated landscape/fullscreen composition');
assert.match(html,/oreburgh-museum-dppt-landscape-v0252\.png/,'museum should use the genuine-case v0.25.2 room');
assert.doesNotMatch(html,/fossil-museum-v0250\/items\/old-amber\.png/,'broken museum header icon must be replaced');

const gradle=read('app/build.gradle');
const versionCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
assert.ok(versionCode>=252,'release must not regress below v0.25.2');
const versionName=(gradle.match(/versionName\s+'([^']+)'/)||[])[1];
assert.ok(versionName&&versionName.localeCompare('0.25.2',undefined,{numeric:true})>=0,'release must not regress below v0.25.2');
const pkg=JSON.parse(read('package.json'));
assert.ok(pkg.version.localeCompare('0.25.2',undefined,{numeric:true})>=0,'package version must not regress below v0.25.2');

console.log('v0.25.2 fossil risk + landscape contract passed');
