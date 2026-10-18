const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.resolve(__dirname,'../app/src/main/assets/arcade-fossil-museum-core.js'));

assert.deepEqual(core.BOARD_DEFAULTS,{rows:9,cols:12,minFinds:3,maxFinds:6,minDepth:2,maxDepth:4,stability:100});
assert.deepEqual(core.TOOL_RULES.pickaxe,{stabilityCost:3,centreDamage:3,radius:0,neighbourDamage:0});
assert.deepEqual(core.TOOL_RULES.hammer,{stabilityCost:8,centreDamage:2,radius:1,neighbourDamage:1});
const cardEntry=core.CATALOGUE.find(x=>x.id==='tcg-card'); assert(cardEntry&&cardEntry.weight===1&&cardEntry.rewardDestination==='card','rare TCG card find must exist at weight 1');

let seq=0; const rng=()=>((seq++*37)%100)/100;
const site=core.generateDigSite({rng});
assert.equal(site.depths.length,108);
assert(site.depths.every(d=>d>=2&&d<=4),'all rock depths should begin from 2–4');
assert(site.finds.length>=3&&site.finds.length<=6,'normal sites contain 3–6 finds');
const occupied=new Set();
for(const find of site.finds){
  assert(find.cells.length>1,'buried finds use multi-cell masks');
  for(const index of find.cells){
    assert(index>=0&&index<108,'find mask must remain in bounds');
    assert(!occupied.has(index),'buried finds may not overlap'); occupied.add(index);
  }
}

const giant={id:'giant',name:'Giant',category:'test',weight:999,sprite:'x',mask:Array.from({length:13},(_,r)=>[r,0]),museumEligible:false,duplicateCoins:0,flavour:'',rewardDestination:'coins'};
const small=n=>({id:`small-${n}`,name:`Small ${n}`,category:'test',weight:1,sprite:'x',mask:[[0,0],[0,1]],museumEligible:false,duplicateCoins:0,flavour:'',rewardDestination:'coins'});
const fallback=core.generateDigSite({rng:()=>0,catalogue:[giant,small(1),small(2),small(3)],minFinds:3,maxFinds:3});
assert.equal(fallback.finds.length,3,'bounded placement fallback must still return three finds');
assert(fallback.finds.every(f=>f.itemId.startsWith('small-')),'impossible masks must not hang or leak into site');
assert.equal(new Set(fallback.finds.flatMap(f=>f.cells)).size,fallback.finds.flatMap(f=>f.cells).length,'fallback masks do not overlap');

function manualSite(){return {rows:9,cols:12,depths:Array(108).fill(4),finds:[{id:'find-1',itemId:'helix-fossil',cells:[13,14],recovered:false}],stability:100,finished:false,collapsed:false,awardedFindIds:[]};}
let s=manualSite();
let out=core.strike(s,13,'pickaxe');
assert.deepEqual(out.changedIndices,[13]); assert.equal(s.depths[13],1); assert.equal(s.depths[14],4); assert.equal(s.stability,97);
assert.deepEqual(out.recoveredIds,[],'partial reveal is not recovered');
out=core.strike(s,13,'pickaxe'); assert.equal(s.depths[13],0); assert.deepEqual(out.recoveredIds,[]);
out=core.strike(s,14,'pickaxe'); out=core.strike(s,14,'pickaxe');
assert.deepEqual(out.recoveredIds,['find-1'],'find recovers only when every mask cell reaches zero');
assert.deepEqual(core.completeRecoveredFinds(s),[],'already-awarded recovered find cannot repeat');

s=manualSite(); s.depths=Array(108).fill(4);
out=core.strike(s,13,'hammer');
const expected=[0,1,2,12,13,14,24,25,26];
assert.deepEqual(out.changedIndices,expected); assert.equal(s.depths[13],2); assert.equal(s.depths[0],3); assert.equal(s.stability,92);

s=manualSite(); s.stability=3;
out=core.strike(s,90,'pickaxe'); assert.equal(out.collapsed,true); assert.equal(s.stability,0); assert.equal(s.finished,true);
const snapshot=JSON.stringify(s); out=core.strike(s,13,'pickaxe'); assert.deepEqual(out,{changedIndices:[],recoveredIds:[],collapsed:true,allRecovered:false}); assert.equal(JSON.stringify(s),snapshot,'strike after collapse is inert');

s=manualSite(); s.depths[13]=0; s.depths[14]=0;
assert.deepEqual(core.completeRecoveredFinds(s),['find-1']);
assert.deepEqual(core.completeRecoveredFinds(s),[],'completeRecoveredFinds is idempotent');
console.log('PASS v0.25.0 Fossil Dig pure excavation core');
