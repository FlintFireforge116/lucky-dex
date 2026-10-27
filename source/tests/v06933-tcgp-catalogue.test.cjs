const test=require('node:test'),assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
test('all released print records resolve locally and real alternate art resolves by gameplay rather than name',()=>{
 assert.ok(data.PRINTS?.length>=4316,'Every cutoff print needs a local record');
 assert.equal(data.cardById('A1-227')?.id,'A1-001');assert.equal(data.gameplayIdForOwned({source:'tcgp',id:'P-A-023',name:'Bulbasaur'}),'A1-001');
 assert.notEqual(data.cardById('A1-094')?.id,data.cardById('A3-057')?.id);
 for(const p of data.PRINTS)assert.ok(data.cardById(p.id),p.id);
});
test('fake same-name prints cannot impersonate known gameplay and collection rows stay untouched',()=>{
 assert.equal(data.gameplayIdForOwned({source:'tcgp',id:'A1-999',setId:'A1',name:'Bulbasaur'}),null);
 const owned=[{source:'tcgp',id:'A1-001',name:'Bulbasaur',count:1,image:'base.webp'},{source:'tcgp',id:'P-A-023',name:'Bulbasaur',count:2,image:'promo.webp'}],snapshot=JSON.stringify(owned);
 const rows=data.projectOwnedCards(owned);assert.equal(rows[0].quantity,3);assert.equal(rows[0].variants.length,2);assert.equal(JSON.stringify(owned),snapshot);
});
test('unsupported mechanics are visible classifications and never enabled as flat damage',()=>{
 assert.ok(data.CARDS.length>2000);for(const c of data.CARDS){if(c.loaner)continue;assert.ok(['FULL','PARTIAL','UNSUPPORTED'].includes(c.support?.status));assert.equal(c.battleEnabled,c.support.status==='FULL');if(!c.battleEnabled)assert.ok(c.support.reasons.length);}
});
