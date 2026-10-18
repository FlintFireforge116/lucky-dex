const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const scene=require(path.join(root,'app/src/main/assets/clefairy-scene.js'));

assert.equal(scene.durationFor('idle'),220,'idle timing must remain unchanged');
assert.equal(scene.durationFor('star'),968);
assert.equal(scene.durationFor('song'),1129);
assert.equal(scene.durationFor('moon'),1065);
assert.equal(scene.durationFor('spin'),935);

for(const action of ['star','song','moon','spin']){
  const m=scene.motionAt(action,scene.durationFor(action));
  assert.ok(Math.abs(m.x)<1e-9,`${action} should finish centered`);
  assert.ok(Math.abs(m.y)<1e-9,`${action} should finish vertically neutral`);
  assert.ok(Math.abs(m.light)<1e-9,`${action} should finish without residual light`);
  assert.ok(Math.abs(m.rotation/360-Math.round(m.rotation/360))<1e-9,`${action} should finish upright`);
  assert.ok(Math.abs(m.weights.idle-1)<1e-9,`${action} should finish in idle pose`);
}

const memory=fs.readFileSync(path.join(root,'app/src/main/assets/clefairy-memory.js'),'utf8');
assert.match(memory,/delay\(100\s*,\s*control\.signal\)/,'playback gap should be 100 ms');
assert.doesNotMatch(memory,/delay\(220\s*,\s*control\.signal\)/,'old 220 ms playback gap must be removed');
assert.match(memory,/SEQUENCE BROKEN/,'a miss should hand off to the v0.39 GAME REVIEW');
assert.doesNotMatch(memory,/resetTimer\s*=\s*setTimeout[^;]*LuckyDexClefairy\?\.durationFor/,'a miss must no longer auto-reset behind the GAME REVIEW');

console.log('PASS v0.28.3 Clefairy pacing contract');
