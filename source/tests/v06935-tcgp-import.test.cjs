const test=require('node:test'),assert=require('node:assert/strict');const D=require('../app/src/main/assets/tcgp/generated/catalogue.js');
test('exact-print licensed source fills all missing mechanics without altering the released identity/print inventory',()=>{
 assert.equal(D.cards.length,2319);assert.equal(D.prints.length,4316);assert.equal(D.cards.filter(c=>c.support.status==='UNSUPPORTED').length,0);
 const c=D.cards.find(c=>c.id==='P-A-102');assert.equal(c.name,'Tropius');assert.equal(c.hp,100);assert.equal(c.stage,'Basic');assert.ok(c.attacks.length);
 assert.ok(!D.prints.some(p=>p.id==='P-B-103'));
});
