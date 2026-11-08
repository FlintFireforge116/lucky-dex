'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const cards=require(path.join(A,'tcg-classic-ruby-sapphire.js'));

const deck=opponents.generate({sets:['ex1'],seed:23});
assert.ok(deck.ok,deck.error);
function battleWithDamagedAttacker(cardId,damage){
 const state=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,
  playerEnergyTypes:['Colorless','Water'],opponentEnergyTypes:['Water'],seed:23,firstSide:'player'});
 state.phase='battle';state.activeSide='player';state.turnNumber=7;
 state.sides.player.turnCount=4;state.sides.opponent.turnCount=3;
 state.sides.player.active=core.makePokemonSlot(cardId,2,'attacker');
 state.sides.player.active.damage=damage;
 state.sides.player.active.energy={Colorless:3,Water:1};
 state.sides.opponent.active=core.makePokemonSlot('ex1-14',2,'defender'); // Wailord (no matching Weakness / Resistance)
 state.sides.player.bench=[core.makePokemonSlot('ex1-72',2,'playerBench')];
 state.sides.player.bench[0].benchSlot=0;
 state.sides.opponent.bench=[core.makePokemonSlot('ex1-72',2,'opponentBench')];
 state.sides.opponent.bench[0].benchSlot=0;
 return state;
}
for(const [cardId,attackIndex,label,damageList,base] of [
 ['ex1-47',1,'Vigoroth Rage',[0,10,20,30,40,50,60],20],
 ['ex1-55',0,'Goldeen Flail',[0,10,20,30,40],0]
]){
 test(`${label} preview and executed attack scale by 10 per existing damage counter`,()=>{
  const card=cards.cardById(cardId);
  assert.ok(card);
  assert.equal(card.attacks[attackIndex].effect.type,'damageFromDamage');
  assert.equal(card.attacks[attackIndex].effect.amount,1);
  for(const damage of damageList){
   const s=battleWithDamagedAttacker(cardId,damage);
   const expected=base+damage;
   const preview=core.attackDamagePreview(s,'player',attackIndex);
   assert.equal(preview.damage,expected,`${card.name} ${damage} damage: preview`);
   assert.equal(preview.text,String(expected),`${card.name} ${damage} damage: label`);
   const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===attackIndex);
   assert.ok(action,`${card.name} ${damage}: legal attack action missing`);
   core.applyAction(s,'player',action);
   const hit=s.log.findLast(x=>x.type==='attack'&&x.side==='player');
   assert.ok(hit,`${card.name} ${damage}: attack missing from log`);
   assert.equal(hit.damage,expected,`${card.name} ${damage}: executed damage`);
   assert.equal(s.sides.opponent.active?.damage,expected,`${card.name} ${damage}: applied damage`);
  }
 });
}
