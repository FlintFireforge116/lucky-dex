const test=require('node:test');
const assert=require('node:assert/strict');
const N=require('../scripts/lib/tcgp-normalize.cjs');
const dir='../data/tcgp/import/';
const all=[...require(dir+'tcgdex-pocket-cards.json'),...require(dir+'tcgdex-A4b-cards.json'),...require(dir+'vociferix-missing-mechanics.json'),...require(dir+'current-pocket-mechanics.json')];
const raw=id=>all.find(x=>N.printId(x.id)===N.printId(id));
test('interactive Stadiums compile to once-per-turn actions',()=>{
 const ids=['B2a-093','B3-153','B3a-074','B3b-069','B4-155','B4a-072','C1-131'];
 const out=ids.map(id=>N.normalizeMechanics(raw(id)));
 assert.deepEqual(out.filter(c=>c.support.status!=='FULL').map(c=>[c.id,c.support.reasons]),[]);
 assert.ok(out.every(c=>c.effect?.type==='stadiumAction'));
});
