'use strict';
// CI recovery: optional nested switches must not silently resolve with no Bench
// selection. In particular these are old Legends Awakened attacks, not XY7.
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:47});
assert.ok(loan.ok,loan.error);
const mon=(id,uid)=>core.makePokemonSlot(id,2,uid);
function battle(id,hasBench=true){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:27,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].bench=[];s.sides[side].hand=[];}
 s.sides.player.active=mon(id,'actor');s.sides.player.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5};
 if(hasBench)s.sides.player.bench=[mon('dp6-117','b1')];
 s.sides.opponent.active=mon('dp5-17','defender');
 return s;
}
function attack(s){const a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(a,'second attack should be legal');core.applyAction(s,'player',a);}
function select(s,pred){const a=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&pred(a));assert.ok(a,'expected explicit effect choice');core.applyAction(s,'player',a);}
for(const [id,name] of [['dp6-101','Hitmontop Gut Spin'],['dp6-121','Spoink Bounce']]){
 test(`${name}: selecting Switch offers a real Bench target and switches the Active`,()=>{
  const s=battle(id);if(id==='dp6-101')s.sides.player.active.stack=['dp6-126',id];
  attack(s);assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'option');
  select(s,a=>a.choiceOption===1);
  assert.equal(s.phase,'effectChoice','yes/no selection must not silently finish the attack');
  assert.equal(s.pendingChoice.kind,'switchBench');
  select(s,a=>a.choiceTarget==='bench'&&a.choiceCardId==='dp6-117');
  assert.equal(s.sides.player.active.uid,'b1');
  assert.equal(s.sides.player.bench[0].uid,'actor');
  assert.notEqual(s.phase,'effectChoice');
 });
 test(`${name}: declining the optional switch preserves the Active`,()=>{
  const s=battle(id);if(id==='dp6-101')s.sides.player.active.stack=['dp6-126',id];
  attack(s);select(s,a=>a.choiceOption===0);
  assert.equal(s.sides.player.active.uid,'actor');
  assert.notEqual(s.phase,'effectChoice');
 });
}
test('Switch effects with no Bench never open an empty target-choice screen',()=>{
 const s=battle('dp6-121',false);attack(s);
 select(s,a=>a.choiceOption===1);
 assert.notEqual(s.phase,'effectChoice');assert.equal(s.sides.player.active.uid,'actor');
});
