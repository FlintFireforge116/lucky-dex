const test=require('node:test');
const assert=require('node:assert/strict');
const N=require('../scripts/lib/tcgp-normalize.cjs');
const dir='../data/tcgp/import/';
const all=[...require(dir+'tcgdex-pocket-cards.json'),...require(dir+'tcgdex-A4b-cards.json'),...require(dir+'vociferix-missing-mechanics.json'),...require(dir+'current-pocket-mechanics.json')];
const raw=id=>all.find(x=>N.printId(x.id)===N.printId(id));

test('second deterministic tail batch compiles as FULL',()=>{
 const ids=['B1-150','P-B-091','B2-042','B2-113','B3a-035','B4a-028','B4-005','B3-073','B3-147','B2-149','B2a-009','B2a-018'];
 const partial=ids.map(id=>[id,N.normalizeMechanics(raw(id))]).filter(([,c])=>c.support.status!=='FULL').map(([id,c])=>[id,c.name,c.support.reasons]);
 assert.deepEqual(partial,[]);
});
