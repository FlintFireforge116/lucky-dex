const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const core=require('../app/src/main/assets/arcade-fossil-museum-core.js');
const runtime=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-fossil-museum.js'),'utf8');

assert.equal(core.RECOVERY_CLEAR_RATIO,1,'sprite-shaped recovery requires every meaningful visible sprite cell to be exposed');
assert.equal(core.RECOVERY_MASK_SOURCE,'sprite-alpha-v0257','v0.25.7 supersedes the coarse 75% rule with sprite-alpha hitboxes');
const bone=core.byId('rare-bone');
assert.ok(Array.isArray(bone.recoveryMask)&&bone.recoveryMask.length,'Rare Bone must carry a tight sprite recovery mask');
assert.notDeepEqual(bone.recoveryMask,bone.mask,'Rare Bone recovery mask must no longer be its coarse placement footprint');

assert(!runtime.includes('UNBANKED'),'dig UI should not label recovered finds as UNBANKED');
assert.match(runtime,/showFindBanner\(name,'RECOVERED'\)/,'recovery banner should simply say RECOVERED');

console.log('PASS v0.25.6 tighter artifact reveal + simplified recovery copy');
