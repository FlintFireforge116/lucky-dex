'use strict';
const {test}=require('node:test'); const assert=require('node:assert/strict');const path=require('node:path');
const a=path.resolve(__dirname,'../app/src/main/assets'); const read=n=>require(path.join(a,n));
test('disabling battle-ready filter exposes complete Gym Heroes catalogue',()=>{
 const D=read('tcg-classic-battle-data.js'),W=read('tcg-classic-deck-workspace.js');
 const rows=W.catalogue([]);
 const all=W.query(rows,{filters:{set:'gym1',owned:false,enabled:false},pageSize:200});
 assert.equal(all.total,132);assert.ok(all.rows.some(r=>r.gameplayId==='gym1-2'&&r.card.battleEnabled));
 assert.equal(W.query(rows,{filters:{set:'gym1',owned:false,enabled:true},pageSize:200}).total,D.CARDS.filter(c=>c.setId==='gym1'&&c.battleEnabled).length);
});
test('Gym Heroes ownership recognises library cards even without setTotal and with slash-number formats',()=>{
 const D=read('tcg-classic-battle-data.js');
 const testCards=[{id:'library:gym-4',localId:'4/132',setName:'Gym Heroes',source:'tcg',count:1},{id:'library:GYM1:56',number:'56/132',setId:'library:GYM1',setName:'Gym Heroes',source:'tcg',count:2},{id:'GH-98',number:'98',setName:'Gym Heroes',source:'tcg',count:3}];
 const projected=D.projectOwnedCards(testCards);for(const [number,count] of [[4,1],[56,2],[98,3]])assert.equal(projected.find(r=>r.gameplayId===`gym1-${number}`)?.quantity,count,`Gym Heroes #${number}`);
});

test('Gym Heroes keeps printed Trainer rules visible even when unavailable for battle',()=>{
 const G=read('tcg-classic-gym-heroes.js');
 for(const n of [16,17,18,19,...Array.from({length:30},(_,i)=>i+97)])assert.ok(G.cardById(`gym1-${n}`).text,`Gym Trainer #${n} rules text`);
 assert.equal(G.cardById('gym1-124').trainerType,'Stadium');
 assert.equal(G.cardById('gym1-110').battleEnabled,true,'Erika Perfume resolves opponent hand-to-bench effects');
});
