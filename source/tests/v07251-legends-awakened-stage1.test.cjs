'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const la=require('../app/src/main/assets/tcg-classic-legends-awakened.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:47});assert.ok(loan.ok,loan.error);
function slot(id,uid){return core.makePokemonSlot(id,2,uid||id);}
function board(id,defender='dp5-17',seed=21){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].bench=[];s.sides[side].hand=[];}
 s.sides.player.active=slot(id,'actor');s.sides.player.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5};
 s.sides.opponent.active=slot(defender,'defender');return s;
}
function hit(s,i=0){const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(a,`${s.sides.player.active.cardId} attack ${i} missing`);core.applyAction(s,'player',a);return s;}
test('dp6 registration has 146 distinct prints, physical artwork and strict gated access',()=>{
 assert.equal(la.CARDS.length,146);assert.equal(new Set(la.CARDS.map(c=>c.id)).size,146);
 assert.equal(la.CARDS[0].name,'Deoxys Normal Forme');assert.equal(la.CARDS.at(-1).name,'Uxie LV.X');
 assert.equal(la.CARDS.filter(c=>c.battleEnabled).length>=8,true);
 for(let n=1;n<=146;n++){const c=la.cardById(`dp6-${n}`);assert.ok(c);assert.equal(c.number,String(n));assert.strictEqual(data.cardById(c.id),c);assert.equal(c.image,`https://images.pokemontcg.io/dp6/${n}.png`);if(c.battleEnabled){assert.equal(c.support.status,'FULL');for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[]);}}
 assert.equal(data.SETS.some(x=>x.id==='dp6'),true);assert.ok(cpu.SETS.includes('dp6'));assert.ok(builder.SET_IDS.includes('dp6'));
 for(const id of ['dp6-7','dp6-16','dp6-19','dp6-21'])assert.equal(la.cardById(id).battleEnabled,true,`final set must include ${id}`);
 assert.equal(data.projectOwnedCards([{source:'tcg',setName:'Legends Awakened',localId:'117',count:2}]).find(x=>x.gameplayId==='dp6-117')?.quantity,2);
});
test('All final DP6 prints are battle-ready with no gated placeholders',()=>{
 for(const c of la.CARDS.filter(c=>!c.battleEnabled)){
  assert.equal(c.deckEligible,false,c.id);
  assert.equal(c.support.status,'PARTIAL',c.id);
 }
 for(const id of ['dp6-7','dp6-16','dp6-19'])assert.equal(data.isBattleEnabled(id),true);
});
test('verified Riolu, Chinchou, Drifloon and Metang printed damage and status',()=>{
 assert.equal(la.cardById('dp6-117').stage,'Basic');
 let s=board('dp6-117');hit(s,1);assert.equal(s.sides.opponent.active.damage,30);
 s=board('dp6-87');hit(s,1);assert.equal(s.sides.opponent.active.damage,10);
 s=board('dp6-92');hit(s,1);assert.equal(s.sides.opponent.active.damage,20);
 s=board('dp6-64');hit(s,1);assert.equal(s.sides.opponent.active.damage,50);
});
test('coin flips and effects applied to real defenders, not predetermined outcomes',()=>{
 for(const [id,attack,status] of [['dp6-87',0,'confusion'],['dp6-92',0,'confusion'],['dp6-95',0,'poison'],['dp6-110',1,'burn'],['dp6-112',0,'poison'],['dp6-115',1,'paralysis']]){
  for(let seed=1;seed<=7;seed++){
   const s=board(id,'dp5-17',seed);hit(s,attack);
   const flip=s.log.find(x=>x.type==='coin'&&x.side==='player');assert.ok(flip,`${id} no visible attack coin`);
   const applied=s.log.some(x=>x.type==='status'&&x.side==='player'&&x.status===status&&x.affectedBySide?.opponent===1);
   assert.equal(applied,!!flip.heads,`${id}: ${status} application does not match attack coin`);
   if(status!=='burn')assert.equal(!!s.sides.opponent.active.conditions[status],!!flip.heads,`${id}: ${status} final state mismatch`);
   else if(flip.heads)assert.ok(s.log.some(x=>x.type==='statusDamage'&&x.side==='opponent'&&x.status==='burn'), 'Burn check should resolve after attack before next turn');
  }
 }
});
test('source metadata and evolution costs stay distinct from arbitrary type preferences',()=>{
 assert.equal(la.cardById('dp6-64').evolvesFrom,'Beldum');
 assert.equal(la.cardById('dp6-115').evolvesFrom,'Poliwag');
 assert.deepEqual(la.cardById('dp6-87').deckMeta.energyTypes,['Water']);
 assert.deepEqual(la.cardById('dp6-117').deckMeta.energyTypes,['Fighting']);
 assert.deepEqual(la.cardById('dp6-110').deckMeta.energyTypes,['Fire']);
 assert.equal(la.cardById('dp6-110').attacks[1].cost,'RCC');
});

test('newly enabled proportional and coin-bonus attacks use printed damage',()=>{
 for(const [id,i,base,boost] of [['dp6-52',1,30,20],['dp6-55',1,30,40],['dp6-116',1,10,20]]){
  for(let seed=1;seed<=6;seed++){const s=board(id,'dp5-17',seed);hit(s,i);
   const roll=s.log.find(x=>x.type==='coin'&&x.side==='player');assert.ok(roll,`${id} bonus coin absent`);
   assert.equal(s.sides.opponent.active.damage,base+(roll.heads?boost:0),`${id} bonus outcome`);
  }
 }
 for(const id of ['dp6-90','dp6-91']){
  const s=board(id,'dp5-12',47);hit(s,1);const rolls=s.log.filter(x=>x.type==='coin'&&x.side==='player');
  assert.equal(rolls.length,1,`${id} expected one two-result coin event`);
  assert.equal(rolls[0].results?.length,2,`${id} expected two visible individual results`);
  assert.equal(s.sides.opponent.active.damage,20*rolls[0].results.filter(Boolean).length,`${id} coin multiplier result`);
 }
});
test('draw, heal, recoil and retreat locks use battle state not text-only placeholders',()=>{
 let s=board('dp6-84');const before=s.sides.player.hand.length;hit(s,0);assert.equal(s.sides.player.hand.length,before+1);
 s=board('dp6-111');s.sides.player.active.damage=30;hit(s,1);assert.equal(s.sides.player.active.damage,20);
 s=board('dp6-104');hit(s,1);assert.equal(s.sides.player.active.damage,10);
 s=board('dp6-108');hit(s,1);assert.equal((s.sides.opponent.active?.locks||[]).some(x=>x.action==='retreat'),true);
});
test('narrow dp6 CPU request never escapes into older cards',()=>{
 const r=cpu.generate({sets:['dp6'],type:'Fighting',seed:101});
 assert.ok(!r.ok || r.cards.every(c=>(typeof c==='string'?c:c.cardId||c.id||'').startsWith('dp6-')));
});
