'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const owned=data.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:c.setId==='pl4'&&(/^AR[1-9]$/.test(String(c.number))||['94','95','96'].includes(String(c.number)))?30:4}));
const oldPack=['Energy Recycle System','Holon Lass','Holon Scientist','Dual Ball'];
const trainers=r=>r.cards.map(data.cardById).filter(c=>c.kind==='trainer');
const names=r=>new Set(trainers(r).map(c=>c.name));
const uniqueFrom=(a,b)=>[...a].filter(n=>!b.has(n));
function legal(r,rows=owned){assert.equal(r.ok,true,JSON.stringify(r.errors||r.error));assert.equal(r.cards.length,30);assert.equal(decks.validateDraft(r.cards,rows,{requireFull:true}).ok,true);const n=names(r);assert.ok(oldPack.filter(x=>n.has(x)).length<3,'not the old universal filler package');return n;}
const fairyOpts={style:'competitive',types:['Fairy'],focusCardId:'xy11-78',sets:builder.SET_IDS,randomSeed:13};
test('Gardevoir screenshot reproduction: broad collection no longer takes the legacy universal package, preserves Spirit Link and changes support across seeds',()=>{
 const a=builder.buildDeck(owned,fairyOpts),b=builder.buildDeck(owned,{...fairyOpts,randomSeed:24}),na=legal(a),nb=legal(b);
 assert.equal(a.focusCardId,'xy11-78');assert.equal(b.focusCardId,'xy11-78');assert.ok(na.has('Gardevoir Spirit Link'));assert.ok(nb.has('Gardevoir Spirit Link'));
 assert.ok(!na.has('Holon Lass')&&!nb.has('Holon Lass'));assert.ok(uniqueFrom(na,nb).length>=3&&uniqueFrom(nb,na).length>=3);
 assert.deepEqual(builder.buildDeck(owned,fairyOpts),a,'same seed and inputs remain reproducible');
});
// Keep exact expected names in a bounded, historical card pool with explicit
// Pokemon cores. Adding another expansion must not silently change this fixture.
const supportFixtureSets=['base1','ex3','xy11','sm8','sm9','sm10','sm115','sm12','swsh2','swsh6','swsh9','swsh10','sv1'];
const supportFixture=owned.filter(r=>supportFixtureSets.includes(data.cardById(r.gameplayId).setId));
const typeCases=[['Fire','swsh9-26',['Welder','Kiawe','Fervor']],['Water','swsh9-31',['Melony','Aqua Patch','Irida','Switch Raft']],['Lightning','sm9-51',['Electropower','Aether Paradise Conservation Area','Electric Generator','Electromagnetic Radar']]];
function distinctTypeSupport(results){for(const [a,b] of [['Fire','Water'],['Water','Lightning'],['Lightning','Fire']])assert.ok(uniqueFrom(results[a],results[b]).length>=3,`${a} vs ${b}: ${[...results[a]]} / ${[...results[b]]}`);}
test('Bounded Fire, Water, Lightning fixtures select relevant type-specific support',()=>{
 const results={};for(const [type,focusCardId,expected] of typeCases){const r=builder.buildDeck(supportFixture,{style:'competitive',types:[type],sets:supportFixtureSets,focusCardId,randomSeed:13});const n=results[type]=legal(r,supportFixture);assert.equal(r.focusCardId,focusCardId);assert.ok(expected.some(x=>n.has(x)),`${type} support: ${[...n]}`);}
 distinctTypeSupport(results);
});
test('Growing all-set Fire, Water, Lightning decks remain legal and varied without freezing Trainer names',()=>{
 const results={};for(const [type] of typeCases){const r=builder.buildDeck(owned,{style:'competitive',types:[type],randomSeed:13});results[type]=legal(r);const chosen=r.cards.map(data.cardById),ctx=synergy.context(chosen,r.energyTypes);const usable=trainers(r).filter(c=>Number.isFinite(synergy.trainerScore(c,ctx)));assert.ok(new Set(usable.map(c=>c.name)).size>=3,`${type} has too few useful Trainers`);assert.ok(usable.some(c=>synergy.metadata(c).roles.some(role=>role==='search'||role==='draw')),`${type} has no consistency support`);}
 distinctTypeSupport(results);
});
test('CPU uses the same adaptive path; restricted inventory, manual retained cards and seed changes do not leak eligibility',()=>{
 const a=cpu.generate({sets:cpu.SETS,type:'Lightning',seed:1234}),b=cpu.generate({sets:cpu.SETS,type:'Lightning',seed:5678});const na=legal(a),nb=legal(b);assert.ok(uniqueFrom(na,nb).length>=2);
 const sets=['xy11','xy12','sm1','sm2'],rows=owned.filter(r=>sets.includes(data.cardById(r.gameplayId).setId));const limited=builder.buildDeck(rows,{sets,types:['Fairy'],focusCardId:'xy11-78',randomSeed:13});legal(limited,rows);assert.ok(limited.cards.every(id=>sets.includes(data.cardById(id).setId)));
 const retained=builder.buildDeck(owned,{...fairyOpts,cards:['base1-91','base1-91']});legal(retained);assert.ok(retained.cards.filter(id=>id==='base1-91').length>=2);
});
test('competitive candidate comparison uses adaptive Trainer selection across seeds',async()=>{
 const optimizer=require('../app/src/main/assets/tcg-deck-optimizer.js');
 const r=await optimizer.optimise({build:builder.buildDeck,rows:owned,options:{...fairyOpts,optimiserBudgetMs:30000},maxCandidates:4,simulate:false,seed:13});
 const n=legal(r);assert.ok(n.has('Gardevoir Spirit Link'));assert.ok(r.rankedCandidates>=2);assert.ok(!n.has('Holon Lass'));
});

const synergy=require('../app/src/main/assets/tcg-deck-synergy.js');
test('Named Trainer targets use exact printed names, not type or TAG TEAM name fragments',()=>{
 const misty=data.cardById('sm115-63'),brock=data.cardById('sm115-55');
 const score=(trainer,mons,types)=>synergy.trainerScore(trainer,synergy.context(mons.map(data.cardById),types));
 assert.equal(score(misty,['sm9-160','sm12-38'],['Water']),-Infinity);
 assert.equal(score(misty,['sm9-160','sm12-38','sm9-25'],['Water']),-Infinity);
 const exact=n=>data.CARDS.find(c=>c.kind==='pokemon'&&c.battleEnabled&&c.name===n).id;
 for(const n of ['Psyduck','Horsea','Staryu','Starmie-GX','Magikarp','Gyarados','Lapras'])assert.ok(Number.isFinite(score(misty,[exact(n),'sm9-160'],['Water'])),n);
 assert.equal(score(brock,[exact('Machop')],['Fighting']),-Infinity);
 for(const n of ['Geodude','Graveler','Golem','Onix-GX','Cubone','Rhyhorn','Rhydon','Sudowoodo'])assert.ok(Number.isFinite(score(brock,[exact(n)],['Fighting'])),n);
});
test('Both reported TAG TEAM cores exclude Misty when the final draft contains no named recipient',()=>{
 const eligible=new Set(['Psyduck','Horsea','Staryu','Starmie-GX','Magikarp','Gyarados','Lapras']);
 for(const focusCardId of ['sm9-160','sm12-38'])for(const randomSeed of [13,24]){
  const r=builder.buildDeck(owned,{style:'competitive',types:['Water'],focusCardId,randomSeed});legal(r);
  const mons=r.cards.map(data.cardById).filter(c=>c.kind==='pokemon');
  if(!mons.some(c=>eligible.has(c.name)))assert.ok(!r.cards.includes('sm115-63'),focusCardId);
  if(randomSeed===13){assert.ok(!mons.some(c=>eligible.has(c.name)),'reproduce reported recipient-free core');assert.ok(!r.cards.includes('sm115-63'));}
 }
});
test('Explicit retained named Trainer is not silently removed by auto fill',()=>{
 const r=builder.buildDeck(owned,{style:'competitive',types:['Water'],focusCardId:'sm9-160',randomSeed:13,cards:['sm115-63']});legal(r);assert.ok(r.cards.includes('sm115-63'));
});
test('CPU and optimiser share the hard named-recipient guard',async()=>{
 const optimizer=require('../app/src/main/assets/tcg-deck-optimizer.js');
 const allowed=new Set(['Psyduck','Horsea','Staryu','Starmie-GX','Magikarp','Gyarados','Lapras']);
 const check=r=>{legal(r);if(r.cards.includes('sm115-63'))assert.ok(r.cards.map(data.cardById).some(p=>p.kind==='pokemon'&&allowed.has(p.name)));};
 check(cpu.generate({sets:cpu.SETS,type:'Water',seed:1234}));
 check(await optimizer.optimise({build:builder.buildDeck,rows:owned,options:{style:'competitive',types:['Water'],focusCardId:'sm9-160',optimiserBudgetMs:30000},maxCandidates:4,simulate:false,seed:13}));
});
