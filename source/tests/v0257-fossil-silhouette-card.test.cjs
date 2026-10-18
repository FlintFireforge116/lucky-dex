const assert=require('assert');
const core=require('../app/src/main/assets/arcade-fossil-museum-core.js');

assert.strictEqual(core.BURIED_CARD_SITE_CHANCE,0.15,'buried card site chance should be 15%');

const bone=core.byId('rare-bone');
assert.ok(Array.isArray(bone.mask)&&bone.mask.length,'Rare Bone needs placement mask');
assert.ok(Array.isArray(bone.recoveryMask)&&bone.recoveryMask.length,'Rare Bone needs sprite-derived recovery mask');
assert.notDeepStrictEqual(bone.recoveryMask,bone.mask,'recovery mask must be independent of placement footprint');

const rows=9,cols=12,row=2,col=4;
const placementCells=bone.mask.map(([r,c])=>(row+r)*cols+(col+c));
const recoveryCells=bone.recoveryMask.map(([r,c])=>(row+r)*cols+(col+c));
const depths=Array(rows*cols).fill(4);
for(const i of recoveryCells)depths[i]=0;
const site={rows,cols,depths};
const find={itemId:'rare-bone',row,col,cells:placementCells,recoveryCells};
assert.strictEqual(core.isFindRecovered(site,find),true,'clearing the visible Rare Bone silhouette should recover it');
const hidden=recoveryCells[0]; depths[hidden]=1;
assert.strictEqual(core.isFindRecovered(site,find),false,'a still-covered visible Rare Bone cell should prevent recovery');

for(const item of core.CATALOGUE){
  if(item.id.startsWith('coin-cache-')||item.id==='tcg-card')continue;
  assert.ok(Array.isArray(item.recoveryMask)&&item.recoveryMask.length,`${item.id} needs a recovery mask`);
  const maxR=Math.max(...item.mask.map(x=>x[0])), maxC=Math.max(...item.mask.map(x=>x[1]));
  for(const [r,c] of item.recoveryMask){
    assert.ok(r>=0&&c>=0&&r<=maxR&&c<=maxC,`${item.id} recovery mask must stay inside placement bounds`);
  }
}
console.log('v0.25.7 silhouette/card contract passed');
