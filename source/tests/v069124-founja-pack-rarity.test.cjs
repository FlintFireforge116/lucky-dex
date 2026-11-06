'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const L=require(path.join(A,'tcg-classic-lental.js'));
const R=require(path.join(A,'card-rarity-v0253.js'));
const P=require(path.join(A,'pack-policy-v0343.js'));
const physicalSet={id:'library:SNAPFOUNJA',name:'New Pokémon Snap — Founja Jungle',_libraryKey:'SNAPFOUNJA',_lentalSet:true};
const cards=L.CARDS.filter(c=>c.setId==='SNAPFOUNJA').map(c=>({...c,localId:c.number,_libraryNative:true,_librarySetKey:'SNAPFOUNJA',setId:physicalSet.id,setName:physicalSet.name}));
const set={...physicalSet,cards};
const counts=rows=>rows.reduce((m,card)=>{const c=R.classify(card,set).rarityClass;m[c]=(m[c]||0)+1;return m;},{});

test('Founja printed rarity is never overridden by original Jungle numbering',()=>{
 assert.equal(cards.length,86);
 assert.deepEqual(counts(cards),{uncommon:17,ultra:13,common:18,rare:38});
 for(const card of cards){
   assert.equal(R.classify(card,set).rarityClass,R.classify(card).rarityClass,`${card.id} ${card.name}`);
   assert.equal(R.classify(card,set).originalRarity,card.rarity,`${card.id} printed rarity`);
 }
 for(const no of [1,3,10,16,20,22,25,34,35,45,63,73,80]){
   const card=cards[no-1];assert.equal(P.cardMatchesDescriptor(card,{pool:'core',allowedClasses:[R.classify(card).rarityClass]},set,'tcg',R.classify),true,card.id);
 }
});

test('Original Jungle and Fossil retain WotC collector-number rarity correction',()=>{
 const samples=[
  ['JU','Jungle',1,'Rare Holo'],['base2','Jungle',20,'Rare'],['library:JU','Jungle',37,'Uncommon'],['library:JU','Jungle',50,'Common'],
  ['FO','Fossil',1,'Rare Holo'],['base3','Fossil',25,'Rare'],['library:FO','Fossil',40,'Uncommon'],['library:FO','Fossil',60,'Common']
 ];
 for(const [id,name,n,expected] of samples){
   const c={id:`${id}-${n}`,localId:String(n),rarity:'Unknown',setId:id,setName:name};
   assert.equal(R.classify(c).originalRarity,expected,`${id} #${n}`);
   assert.equal(R.classify(c,{id,name}).originalRarity,expected,`${id} #${n} with set`);
 }
 // Unknown set identities containing those words must not be treated as WotC.
 for(const name of ['New Pokémon Snap — Founja Jungle','Jungle Adventure','Fossil Discoveries']){
   const c={localId:'1',rarity:'Common',setId:`library:custom-${name}`,setName:name};
   assert.equal(R.classify(c,{id:c.setId,name}).rarityClass,'common');
 }
});

test('Founja pack slot policy has 4 Common, 3 Uncommon and 3 proper hit positions',()=>{
 const p=P.resolve(set,'tcg'),slots=P.slotPlan(set,{source:'tcg'});
 assert.equal(p.id,'lental_booster_10');assert.equal(slots.length,10);
 assert.deepEqual(slots.slice(0,4).map(x=>x.allowedClasses),Array.from({length:4},()=>['common']));
 assert.deepEqual(slots.slice(4,7).map(x=>x.allowedClasses),Array.from({length:3},()=>['uncommon']));
 assert.ok(slots.slice(7).every(x=>x.rareOrHigher));
 for(const slot of slots){
   const eligible=cards.filter(c=>P.cardMatchesDescriptor(c,slot,set,'tcg',R.classify));
   assert.ok(eligible.length>3,`${slot.id} insufficient cards`);
   assert.ok(eligible.every(c=>slot.allowedClasses.includes(R.classify(c,set).rarityClass)),`${slot.id} wrong class eligible`);
 }
});

// Exercise the exact production selection function, with the Android card-art
// detail lookup stubbed out. This catches future regressions that tests of the
// rarity classifier alone would miss.
const app=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
const start=app.indexOf('function finishLabelV0343(');
const end=app.indexOf('async function buildGodPackV0291(',start);
assert.ok(start>=0&&end>start);
const pickerSource=app.slice(start,end)+'\nthis.pick=pickCardForDescriptorV0343;';
function makePicker(randomValue){
 const math=Object.create(Math);math.random=()=>randomValue;
 const context={Math:math,console,window:{LuckyDexPackPolicy:P,LuckyDexCardRarity:R},getCardDetail:async x=>({...x}),rarityTier:x=>R.tier(x),enrichPhysicalCardV151:async x=>x};
 vm.runInNewContext(pickerSource,context,{timeout:2000});
 return context.pick;
}
async function draw(pick){
 const selected=[];
 for(const slot of P.slotPlan(set,{source:'tcg'}))selected.push(await pick(cards,slot,selected,null,set,'tcg'));
 const audit=P.validatePack(selected,set,'tcg',{classifier:R.classify});assert.equal(audit.ok,true,audit.errors.join('; '));
 return selected;
}
test('production pack picker honours printed rarities at high and low chase rolls',async()=>{
 for(const [roll,expectedHits] of [[0,'ultra'],[.999999,'rare']]){
  const picked=await draw(makePicker(roll));const seen=picked.map(x=>R.classify(x,set).rarityClass);
  assert.deepEqual(seen.slice(0,4),['common','common','common','common']);
  assert.deepEqual(seen.slice(4,7),['uncommon','uncommon','uncommon']);
  assert.deepEqual(seen.slice(7),[expectedHits,expectedHits,expectedHits]);
 }
});

test('Lental hit slots produce the documented tier frequencies',()=>{
  // Use deterministic uniform draws to pin the rarity-weight contract without
  // making the test depend on the ambient random stream.
  let state=0x45be217;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const slots=P.slotPlan(set,{source:'tcg'}).slice(7);
  const expected=[.06,.16,.35];
  for(let i=0;i<slots.length;i++){
    let high=0;for(let n=0;n<20000;n++){
      const c=P.targetClassesFor(set,slots[i],'tcg',random);
      assert.ok(c.length===1&&(c[0]==='rare'||c[0]==='ultra'));
      if(c[0]==='ultra')high++;
    }
    assert.ok(Math.abs(high/20000-expected[i])<.018,`${slots[i].id}: ${high/20000} vs ${expected[i]}`);
  }
});

test('live collation with random rolls never leaks wrong rarity classes',async()=>{
 const context={Math,console,window:{LuckyDexPackPolicy:P,LuckyDexCardRarity:R},getCardDetail:async x=>({...x}),rarityTier:x=>R.tier(x),enrichPhysicalCardV151:async x=>x};
 vm.runInNewContext(pickerSource,context,{timeout:2000});
 let ultras=0;
 for(let n=0;n<24;n++){
   const picked=await draw(context.pick);let classes=picked.map(x=>R.classify(x,set).rarityClass);
   assert.deepEqual(classes.slice(0,4),Array(4).fill('common'));
   assert.deepEqual(classes.slice(4,7),Array(3).fill('uncommon'));
   assert.ok(classes.slice(7).every(c=>c==='rare'||c==='ultra'));
   ultras+=classes.slice(7).filter(c=>c==='ultra').length;
 }
 assert.ok(ultras>=1&&ultras<=72,`Unexpected chase rate: ${ultras}/72 hit slots`);
});
