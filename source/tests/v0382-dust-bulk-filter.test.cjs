const assert=require('assert');
const core=require('../app/src/main/assets/dust-exchange-core.js');

const cards={
  pika:{id:'pika',name:'Pikachu',localId:'25',setName:'Jungle',rarity:'Rare',count:7,value:20},
  eevee:{id:'eevee',name:'Eevee',localId:'51',setName:'Jungle',rarity:'Common',count:3,value:10},
  mew:{id:'mew',name:'Mew',localId:'8',setName:'Promo',rarity:'Promo',count:8,value:100,protected:true},
  rai:{id:'rai',name:'Raichu',localId:'14',setName:'Base Set',rarity:'Rare',count:5,value:20},
  pid:{id:'pid',name:'Pidgey',localId:'57',setName:'Jungle',rarity:'Common',count:6,value:10}
};
const hooks={
  setFor:c=>c.setName,
  rarityFor:c=>c.rarity,
  valueFor:c=>c.value,
  isProtected:c=>!!c.protected
};

assert.equal(core.normalizeKeepCopies(3),3);
assert.equal(core.normalizeKeepCopies(0),1,'final copy remains protected');
assert.equal(core.normalizeKeepCopies(999),99,'bulk keep preference is bounded');

const jungleRare=core.buildBatch(Object.values(cards),{query:'',set:'Jungle',rarity:'Rare',dustValue:''},3,hooks);
assert.deepEqual(jungleRare.rows.map(r=>[r.id,r.qty,r.gain]),[['pika',4,80]]);
assert.equal(jungleRare.cardTypes,1);
assert.equal(jungleRare.copies,4);
assert.equal(jungleRare.dust,80);
assert.equal(jungleRare.keepCopies,3);

const searchNumber=core.buildBatch(Object.values(cards),{query:'14',set:'',rarity:'',dustValue:''},1,hooks);
assert.deepEqual(searchNumber.rows.map(r=>r.id),['rai'],'search matches collector number');

const commonTen=core.buildBatch(Object.values(cards),{query:'',set:'Jungle',rarity:'Common',dustValue:'10'},3,hooks);
assert.deepEqual(commonTen.rows.map(r=>[r.id,r.qty]),[['pid',3]],'count <= keep is ignored while matching cards above keep are included');

const protectedBatch=core.buildBatch(Object.values(cards),{query:'mew',set:'',rarity:'',dustValue:''},1,hooks);
assert.equal(protectedBatch.copies,0,'protected cards never enter a bulk snapshot');

const snapshot=core.buildBatch(Object.values(cards),{query:'',set:'Jungle',rarity:'',dustValue:''},3,hooks);
const live=Object.fromEntries(Object.entries(cards).map(([k,v])=>[k,{...v}]));
const applied=core.applyBatch(live,snapshot,hooks);
assert.equal(applied.ok,true);
assert.equal(applied.dust,110);
assert.equal(live.pika.count,3);
assert.equal(live.pid.count,3);
assert.equal(live.eevee.count,3);

const changed=Object.fromEntries(Object.entries(cards).map(([k,v])=>[k,{...v}]));
changed.pika.count=6;
const rejected=core.applyBatch(changed,snapshot,hooks);
assert.deepEqual(rejected,{ok:false,reason:'changed'},'a changed collection invalidates the confirmation snapshot');
assert.equal(changed.pika.count,6,'failed validation must mutate nothing');
assert.equal(changed.pid.count,6,'failed validation is atomic');

const tampered=JSON.parse(JSON.stringify(snapshot));
tampered.rows[0].gain+=999999;
const untouched=Object.fromEntries(Object.entries(cards).map(([k,v])=>[k,{...v}]));
assert.deepEqual(core.applyBatch(untouched,tampered,hooks),{ok:false,reason:'changed'},'confirmed Dust amount cannot be tampered independently of card value');
assert.equal(untouched.pika.count,7);

console.log('PASS v0.38.2 dust bulk filter core');
