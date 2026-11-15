'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js'),cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:15});assert.ok(loan.ok);
function board(){const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:16,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal']});s.phase='battle';s.activeSide='player';s.turnNumber=10;for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];}s.sides.player.active=core.makePokemonSlot('dp6-117',1,'actor');s.sides.player.active.energy={Fighting:3,Psychic:3};s.sides.opponent.active=core.makePokemonSlot('dp6-117',1,'defender');return s;}
function acts(s,type,side='player'){return core.legalActions(s,side).filter(a=>a.type===type);}
test('new Claw and Root Fossils are real trainer cards placed as Pokemon, retain prize semantics',()=>{
 for(const id of ['dp6-138','dp6-139']){const c=data.cardById(id);assert.equal(c.kind,'trainer');assert.equal(c.effect.type,'playFossil');assert.equal(c.countsAsKnockout,true);assert.equal(c.effect.countsAsKnockout,true);assert.deepEqual(fx.validateEffect(c.effect),[]);assert.deepEqual(fx.validateEffect(c.abilities[0].effect),[]);
  const s=board();s.sides.player.hand=[{uid:'physical',cardId:id}];const a=acts(s,'trainer')[0];assert.ok(a&&a.cardId===id);core.applyAction(s,'player',a);const fossil=s.sides.player.bench.find(p=>p.cardId===id);assert.ok(fossil);assert.equal(fossil.uid,'physical');
  assert.ok(acts(s,'discardFossil').some(a=>a.cardId===id));
  const discard=acts(s,'discardFossil').find(a=>a.cardId===id);core.applyAction(s,'player',discard);assert.ok(!s.sides.player.bench.some(p=>p.cardId===id));assert.ok(s.sides.player.discard.some(r=>r.cardId===id));
 }
});
test('Fossils cannot retreat or receive special conditions, and they are eligible to evolve',()=>{
 const s=board();s.sides.player.active=core.makePokemonSlot('dp6-138',2,'claw');const bench=core.makePokemonSlot('dp6-117',2,'bench');bench.benchSlot=0;s.sides.player.bench=[bench];assert.equal(acts(s,'retreat').length,0);
 assert.equal(fx.statusIsPrevented(s,s.sides.player.active,data.cardById,'poison'),true);
 s.sides.player.hand=[{uid:'anorith',cardId:'ex2-27'}];s.sides.player.active.playedOnSideTurn=2;assert.ok(acts(s,'evolve').some(a=>a.cardId==='ex2-27'));
});
test('Claw Fossil Jagged Stone counter-attack is triggered when damaged, including fatal damage',()=>{
 const s=board();s.sides.opponent.active=core.makePokemonSlot('dp6-138',2,'claw');s.sides.player.active=core.makePokemonSlot('dp6-11',2,'hit');s.sides.player.active.energy={Psychic:3};
 const action=acts(s,'attack').find(a=>a.attackIndex===1);assert.ok(action);core.applyAction(s,'player',action);
 assert.equal(s.sides.player.active.damage,10);assert.ok(s.log.some(e=>e.reason==='Jagged Stone'));
 assert.ok(s.log.some(e=>e.type==='ko'&&e.cardId==='dp6-138'&&e.awarded>=1),'Knockout should award a Prize');
});
test('Root Fossil heals ten damage between turns, including when Benched',()=>{
 const s=board();const p=core.makePokemonSlot('dp6-139',2,'root');p.benchSlot=0;p.damage=30;s.sides.player.bench=[p];core.endTurn(s);
 assert.equal(p.damage,20);
});
test('strict DP6-only CPU deck building does not include Fossils without enabled Fossil evolution lines',()=>{
 for(const type of ['Grass','Fighting','Psychic','Water','Lightning']){
  const deck=cpu.generate({sets:['dp6'],type,seed:319});assert.ok(deck.ok);
  assert.equal((deck.cards||[]).filter(id=>id==='dp6-138'||id==='dp6-139').length,0,`${type} added fossil without evolution`);
 }
});
