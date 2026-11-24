'use strict';
// No wall-clock assertions: slower CI machines and growing catalogues must not
// make a correct build flaky. Count repeated expensive context computations.
const {test}=require('node:test'),assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const synergy=require('../app/src/main/assets/tcg-deck-synergy.js');
const owned=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:c.setId==='pl4'&&(/^AR[1-9]$/.test(String(c.number))||['94','95','96'].includes(String(c.number)))?30:4}));
function legal(r,rows=owned){assert.equal(r.ok,true,JSON.stringify(r.errors||r.error));assert.equal(r.cards.length,30);assert.equal(decks.validateDraft(r.cards,rows,{requireFull:true}).ok,true);assert.ok(r.cards.every(id=>classic.cardById(id)?.battleEnabled&&classic.cardById(id)?.deckEligible!==false));}
test('canonical lookup preserves card identity, aliases, lab dummy and unknown IDs',()=>{
 for(const c of classic.CARDS)assert.equal(classic.cardById(c.id),c,c.id);
 assert.equal(classic.cardById(' BASE1-4 '),classic.cardById('base1-4'));
 assert.equal(classic.cardById('LAB-SUBSTITUTE').labDummy,true);
 assert.equal(classic.cardById('not-a-real-card'),null);
});
test('full-pool player and CPU use the shared indexed builder without rebuilding synergy context for every Trainer',()=>{
 const original=synergy.context;let calls=0;
 synergy.context=(...args)=>{calls++;return original(...args);};
 try{
  const opts={sets:builder.SET_IDS,style:'random',types:['Water'],randomSeed:13};
  const random=builder.buildDeck(owned,opts);legal(random);assert.ok(calls<500,`Repeated draft context: ${calls}`);
  calls=0;const competitive=builder.buildDeck(owned,{sets:builder.SET_IDS,style:'competitive',randomSeed:33});legal(competitive);assert.ok(calls<500,`Repeated competitive context: ${calls}`);
  calls=0;const opponent=cpu.generate({sets:cpu.SETS,type:'Lightning',seed:1234});legal(opponent);assert.equal(opponent.type,'Lightning');assert.ok(calls<500,`Repeated CPU context: ${calls}`);
  // New calls may have completely different filters/ownership. Do not reuse
  // a previous result, evolution line or mutable draft context across them.
  const narrow=owned.filter(r=>r.gameplayId.startsWith('sm10-'));
  const limited=builder.buildDeck(narrow,{sets:['sm10'],types:['Fire'],style:'competitive',randomSeed:14});legal(limited,narrow);assert.ok(limited.cards.every(id=>id.startsWith('sm10-')));
  const tooFew=builder.buildDeck(narrow.slice(0,1),{sets:['sm10'],style:'competitive',randomSeed:14});assert.equal(tooFew.ok,false);
  const repeated=builder.buildDeck(owned,opts);assert.deepEqual(repeated,random);
 }finally{synergy.context=original;}
});
test('exported familyLine accepts mutable pools and does not return stale roots',()=>{
 const z=classic.cardById('base1-4'),m=classic.cardById('base1-24'),c=classic.cardById('base1-46');
 const pool=[z,m];assert.deepEqual(builder.familyLine(z,pool),[]);pool.push(c);
 const line=builder.familyLine(z,pool);assert.deepEqual(line.map(x=>x.id),[c.id,m.id,z.id]);line.pop();assert.equal(builder.familyLine(z,pool).length,3);
});
