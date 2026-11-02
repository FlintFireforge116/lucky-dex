const test=require('node:test');
const assert=require('node:assert/strict');
const N=require('../scripts/lib/tcgp-normalize.cjs');
const dir='../data/tcgp/import/';
const all=[...require(dir+'tcgdex-pocket-cards.json'),...require(dir+'tcgdex-A4b-cards.json'),...require(dir+'vociferix-missing-mechanics.json'),...require(dir+'current-pocket-mechanics.json')];
const raw=id=>all.find(x=>N.printId(x.id)===N.printId(id));

test('automatic tail batch compiles as FULL',()=>{
 const ids=['A4a-062','A2-089','B1-136','B1-186','B1-213','B1-223','P-B-070','B2-073','B2-103','B2-143','B2-151','B3-022','B3-045','B3-152','B3a-005','B2a-088','B2b-016','B2b-035','B2b-066','B3a-043','B4-120','C1-015','C1-023'];
 const partial=ids.map(id=>[id,N.normalizeMechanics(raw(id))]).filter(([,c])=>c.support.status!=='FULL').map(([id,c])=>[id,c.name,c.support.reasons]);
 assert.deepEqual(partial,[]);
});
