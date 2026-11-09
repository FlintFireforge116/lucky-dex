'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const effects=require(path.join(A,'tcgp-battle-effects.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));

const deck=opponents.generate({sets:['ecard3'],seed:62});
assert.ok(deck.ok,deck.error);
function battle(attackerId='ecard3-68',energy={Colorless:2}){
 const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,
  playerEnergyTypes:['Fighting','Psychic','Colorless'],opponentEnergyTypes:['Fighting','Psychic','Colorless'],seed:62,firstSide:'player'});
 s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;
 s.sides.player.active=core.makePokemonSlot(attackerId,2,'attacker');s.sides.player.active.energy={...energy};
 s.sides.opponent.active=core.makePokemonSlot('ecard3-16',2,'machamp');
 s.sides.player.bench=[core.makePokemonSlot('ecard3-74',2,'ownBench')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ecard3-74',2,'theirBench')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function attack(s,index){
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===index);
 assert.ok(action,'expected legal attack index '+index);
 core.applyAction(s,'player',action);
 return s.log.findLast(e=>e.type==='attack'&&e.side==='player');
}
test('Skyridge Machamp Immunity is effects-only, never an attack-damage guard',()=>{
 const s=battle(),champ=s.sides.opponent.active;
 for(const id of ['ecard3-16','ecard3-H15']){
  const power=classic.cardById(id).abilities.find(a=>a.name==='Immunity');
  assert.deepEqual(power.effect,{type:'preventEffects',duration:'whileInPlay'});
 }
 assert.equal(effects.attackIsPrevented(s,'opponent',champ,s.sides.player.active,classic.cardById),null);
 assert.equal(effects.attackEffectsPrevented(s,'opponent',champ,s.sides.player.active,classic.cardById),true);
});
test('A damaging Sleep attack damages Machamp normally but does not inflict Sleep',()=>{
 const s=battle('ecard3-68',{Colorless:2}); // Jigglypuff: Lullaby, 10 + Sleep
 const log=attack(s,1);
 assert.equal(log.damage,10);
 assert.equal(s.sides.opponent.active.damage,10);
 assert.equal(!!s.sides.opponent.active.conditions.sleep,false);
});
test('An ordinary attack still damages Machamp and its existing damage is preserved',()=>{
 const s=battle('ecard3-74',{Fighting:1}); // Machop: Smash Punch, 20
 s.sides.opponent.active.damage=20;
 const log=attack(s,0);
 assert.equal(log.damage,20);
 assert.equal(s.sides.opponent.active.damage,40);
});
test('Immunity does not prevent non-attack effects from a Trainer or a Power',()=>{
 const s=battle(),champ=s.sides.opponent.active;
 const ctx={...core.effectContext(s,'player',{},s.sides.player.active),isAttack:false};
 effects.applyEffect({type:'status',target:'opponentActive',status:'sleep'},ctx);
 assert.equal(champ.conditions.sleep,true);
});

test('A damage-counter-placement attack is an effect and is prevented by Immunity',()=>{
 const s=battle('ecard3-57',{Psychic:1}); // Gastly: Haunt places a damage counter as an attack effect
 const log=attack(s,0);
 assert.equal(log.damage,0);
 assert.equal(s.sides.opponent.active.damage,0);
});
