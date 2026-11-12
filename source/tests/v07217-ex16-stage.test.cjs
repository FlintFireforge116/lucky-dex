const test=require('node:test');const assert=require('node:assert/strict');
const root='../app/src/main/assets/';const set=require(root+'tcg-classic-power-keepers.js');const all=require(root+'tcg-classic-battle-data.js');
test('all 108 EX Power Keepers prints are unique and reachable',()=>{assert.equal(set.CARDS.length,108);assert.equal(new Set(set.CARDS.map(x=>x.id)).size,108);for(let n=1;n<=108;n++){const c=set.cardById('ex16-'+n);assert.ok(c);assert.equal(all.cardById(c.id)?.id,c.id)}});
test('no partial cards are battle or deck eligible',()=>{for(const c of set.CARDS)if(c.support.status==='PARTIAL'){assert.equal(c.battleEnabled,false,c.id);assert.equal(c.deckEligible,false,c.id)}});
test('staged attacks have no generic special effect placeholders',()=>{for(const c of set.CARDS.filter(x=>x.battleEnabled&&x.kind==='pokemon'))for(const a of c.attacks){assert.ok(a.name);assert.ok(a.cost!==undefined);assert.notEqual(a.text,'Special effect')}});
test('evolution families and EX prizes are represented',()=>{assert.equal(set.cardById('ex16-95').prizeCards,2);assert.equal(set.cardById('ex16-95').evolvesFrom,'Metang');assert.equal(set.cardById('ex16-1').evolvesFrom,'Lairon')});
