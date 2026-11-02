const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const cat=require('../app/src/main/assets/tcgp/generated/catalogue.js');
const byId=id=>cat.cards.find(c=>c.id===id);
function battle(){
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:47,firstSide:'player'});
 b.phase='battle';b.activeSide='player';b.turnNumber=5;
 const v=C.makePokemonSlot('A1-003',1,'venusaur');v.stack=['A1-001','A1-002','A1-003'];v.energy={Grass:1,Colorless:2};b.sides.player.active=v;
 b.sides.opponent.active=C.makePokemonSlot('A1-001',1,'opp');return b;
}
test('Memory Light and Celebi compile as battle-ready',()=>{
 assert.deepEqual(['A4a-068','P-B-079'].filter(id=>byId(id)?.support?.status!=='FULL').map(id=>[id,byId(id)?.support?.reasons]),[]);
});
test('Memory Light exposes attacks from previous evolution cards and still checks their Energy cost',()=>{
 const b=battle();b.sides.player.active.tool={uid:'tool',cardId:'A4a-068'};
 let attacks=C.legalActions(b,'player').filter(a=>a.type==='attack');
 assert.ok(attacks.some(a=>a.attackCardId==='A1-002'&&a.attackIndex===0),'Ivysaur Razor Leaf should be usable');
 assert.equal(attacks.some(a=>a.attackCardId==='A1-001'&&a.attackIndex===0),true,'Bulbasaur Vine Whip should be usable');
 b.sides.player.active.energy={Colorless:3};
 attacks=C.legalActions(b,'player').filter(a=>a.type==='attack');
 assert.equal(attacks.some(a=>a.attackCardId==='A1-002'),false,'previous attack still needs Grass Energy');
});
test('Celebi grants previous-evolution attacks to another evolved Pokemon while in play',()=>{
 const b=battle();const celebi=C.makePokemonSlot('P-B-079',1,'celebi');celebi.benchSlot=0;b.sides.player.bench=[celebi];
 const attacks=C.legalActions(b,'player').filter(a=>a.type==='attack');
 assert.ok(attacks.some(a=>a.attackCardId==='A1-002'));
});
