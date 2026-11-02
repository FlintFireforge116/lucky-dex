const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');
function battle(){
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:47,firstSide:'player'});
 b.phase='battle';b.activeSide='player';b.turnNumber=5;
 b.sides.player.active=C.makePokemonSlot('A1-001',1,'p-active');
 b.sides.player.bench=[C.makePokemonSlot('A1-014',1,'p-b0'),C.makePokemonSlot('A1-002',1,'p-b1')];
 b.sides.player.bench[0].benchSlot=0;b.sides.player.bench[1].benchSlot=1;
 b.sides.opponent.active=C.makePokemonSlot('A1-001',1,'o-active');
 return b;
}
function chooseBench(b,index){
 const actions=C.legalActions(b,'player');
 const a=actions.find(x=>x.type==='effectChoice'&&x.choiceBenchIndex===index);
 assert.ok(a,`bench ${index} should be selectable`);C.applyAction(b,'player',a);
}
test('fixed Energy types can be distributed one unit at a time across the Bench',()=>{
 const b=battle();
 E.applyEffect({type:'distributeEnergy',source:'zone',target:'selfBench',energyTypes:['Fire','Water','Lightning']},C.effectContext(b,'player'));
 assert.equal(b.phase,'effectChoice');
 chooseBench(b,0);chooseBench(b,1);chooseBench(b,0);
 assert.equal(b.phase,'battle');
 assert.deepEqual(b.sides.player.bench[0].energy,{Fire:1,Lightning:1});
 assert.deepEqual(b.sides.player.bench[1].energy,{Water:1});
});
test('distinct-target distribution will not offer the same Bench twice',()=>{
 const b=battle();
 E.applyEffect({type:'distributeEnergy',source:'zone',target:'selfBench',energyType:'Water',amount:2,distinctTargets:true},C.effectContext(b,'player'));
 chooseBench(b,0);
 const actions=C.legalActions(b,'player');
 assert.equal(actions.some(x=>x.choiceBenchIndex===0),false);
 assert.equal(actions.some(x=>x.choiceBenchIndex===1),true);
 chooseBench(b,1);
 assert.equal(b.sides.player.bench[0].energy.Water,1);
 assert.equal(b.sides.player.bench[1].energy.Water,1);
});
test('all Energy can be moved from the attacker and distributed across the Bench',()=>{
 const b=battle();b.sides.player.active.energy={Psychic:2,Water:1};
 E.applyEffect({type:'distributeEnergy',source:'self',target:'selfBench',amount:'all'},C.effectContext(b,'player'));
 chooseBench(b,0);chooseBench(b,1);chooseBench(b,0);
 assert.deepEqual(b.sides.player.active.energy,{Psychic:0,Water:0});
 assert.equal(Object.values(b.sides.player.bench[0].energy).reduce((a,n)=>a+n,0),2);
 assert.equal(Object.values(b.sides.player.bench[1].energy).reduce((a,n)=>a+n,0),1);
});
test('multi-target Energy cards compile as battle-ready',()=>{
 const cat=require('../app/src/main/assets/tcgp/generated/catalogue.js');
 const ids=['A1-047','P-A-048','A4-034','B2-066','B3b-031','C1-057','C1-066'];
 const byId=id=>cat.cards.find(c=>c.id===id);
 assert.deepEqual(ids.filter(id=>byId(id)?.support?.status!=='FULL').map(id=>[id,byId(id)?.name,byId(id)?.support?.reasons]),[]);
});
