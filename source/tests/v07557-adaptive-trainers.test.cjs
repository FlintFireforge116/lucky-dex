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
test('Fire, Water, Lightning builds select relevant support, not the same fixed Trainer package',()=>{
 const results={};for(const type of ['Fire','Water','Lightning']){const r=builder.buildDeck(owned,{style:'competitive',types:[type],randomSeed:13});results[type]=legal(r);}
 assert.ok(['Welder','Kiawe','Fervor'].some(x=>results.Fire.has(x)));assert.ok(['Melony','Aqua Patch','Irida','Switch Raft'].some(x=>results.Water.has(x)));assert.ok(['Electropower','Aether Paradise Conservation Area','Electric Generator'].some(x=>results.Lightning.has(x)));
 for(const [a,b] of [['Fire','Water'],['Water','Lightning'],['Lightning','Fire']])assert.ok(uniqueFrom(results[a],results[b]).length>=3);
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
