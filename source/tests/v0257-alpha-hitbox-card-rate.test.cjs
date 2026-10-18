const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/arcade-fossil-museum-core.js');

assert.equal(core.BURIED_CARD_SITE_CHANCE,0.15,'buried TCG card sites should occur about 15% of digs');
assert.equal(core.RECOVERY_MASK_SOURCE,'sprite-alpha-v0257','recovery hitboxes must come from the rendered sprite alpha shape');

for(const item of core.CATALOGUE){
  assert.ok(Array.isArray(item.recoveryMask)&&item.recoveryMask.length,`${item.id} must have a non-empty alpha-derived recovery mask`);
  const maxR=Math.max(...item.mask.map(([r])=>r));
  const maxC=Math.max(...item.mask.map(([,c])=>c));
  for(const [r,c] of item.recoveryMask){
    assert.ok(r>=0&&c>=0&&r<=maxR&&c<=maxC,`${item.id} recovery mask cell ${r},${c} must remain inside its rendered footprint`);
  }
}

const bone=core.byId('rare-bone');
assert.deepEqual(bone.recoveryMask,[[1,1],[1,2],[2,0],[2,1],[2,2],[3,0],[3,1]],'Rare Bone hitbox should follow the diagonal sprite rather than its 3x5 bounding box');
assert.notDeepEqual(bone.recoveryMask,bone.mask,'Rare Bone alpha hitbox must differ from its placement footprint');

const site=core.generateDigSite({rng:()=>0.2,minFinds:1,maxFinds:1,catalogue:[bone]});
assert.equal(site.finds.length,1);
const find=site.finds[0];
assert.ok(Array.isArray(find.recoveryCells)&&find.recoveryCells.length===bone.recoveryMask.length,'generated finds must carry alpha-derived recovery cells');

site.depths.fill(4);
for(const i of find.recoveryCells)site.depths[i]=0;
assert.equal(core.isFindRecovered(site,find),true,'find recovers when every actual sprite-occupied cell is exposed even if transparent bounding-box cells remain covered');

site.depths[find.recoveryCells[0]]=1;
assert.equal(core.isFindRecovered(site,find),false,'find must not recover while any actual sprite-occupied cell remains covered');

for(const fossilId of ['helix-fossil','dome-fossil','root-fossil','claw-fossil','skull-fossil','armor-fossil']){
  const fossil=core.byId(fossilId);
  assert.ok(fossil.recoveryMask.length<=fossil.mask.length,`${fossilId} recovery mask must be no broader than its placement footprint`);
}

console.log('PASS v0.25.7 alpha-shaped dig hitboxes + 15% card-site rate');
