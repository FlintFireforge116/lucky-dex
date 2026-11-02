const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');
function battle(){
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:47,firstSide:'player'});
 b.phase='battle';b.activeSide='player';b.turnNumber=5;
 b.sides.player.active=C.makePokemonSlot('A1-001',1,'p-active');
 b.sides.opponent.active=C.makePokemonSlot('A1-001',1,'o-active');
 b.sides.opponent.bench=[C.makePokemonSlot('A1-014',1,'o-bench')];b.sides.opponent.bench[0].benchSlot=0;
 b.sides.player.hand=[];b.sides.opponent.hand=[];return b;
}
test('opponent-choice switch pauses for the opponent and resumes',()=>{
 const b=battle();
 E.applyEffect({type:'forceOpponentSwitch'},C.effectContext(b,'player'));
 assert.equal(b.phase,'effectChoice');assert.equal(b.choiceSide,'opponent');
 const actions=C.legalActions(b,'opponent');assert.equal(actions.length,1);assert.equal(actions[0].choiceBenchIndex,0);
 C.applyAction(b,'opponent',actions[0]);
 assert.equal(b.phase,'battle');assert.equal(b.sides.opponent.active.cardId,'A1-014');
});
test('chosen hand discard pauses for owner choice and discards selected card',()=>{
 const b=battle();b.sides.player.hand=[{uid:'h1',cardId:'A1-001'},{uid:'h2',cardId:'A1-014'}];
 E.applyEffect({type:'discardChosenHand',side:'self',amount:1,required:true},C.effectContext(b,'player'));
 assert.equal(b.phase,'effectChoice');assert.equal(b.choiceSide,'player');
 const actions=C.legalActions(b,'player');assert.equal(actions.length,2);
 const chosen=actions.find(a=>a.choiceCardId==='A1-014');C.applyAction(b,'player',chosen);
 assert.equal(b.sides.player.hand.length,1);assert.equal(b.sides.player.discard.at(-1).cardId,'A1-014');
});
test('required hand discard makes attack do zero damage when the cost cannot be paid',()=>{
 const b=battle();
 b.sides.player.active=C.makePokemonSlot('B1-101',1,'sableye');
 b.sides.player.active.energy={Psychic:2};
 b.sides.player.hand=[];
 const attack=C.legalActions(b,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(attack,'attack remains selectable and resolves as doing nothing');
 const defender=b.sides.opponent.active,before=defender.damage;
 C.applyAction(b,'player',attack);
 assert.equal(defender.damage,before);
 assert.equal(b.sides.player.points,0);
});
test('copy attack uses the selected opposing attack damage',()=>{
 const b=battle();
 b.sides.player.active=C.makePokemonSlot('A1a-032',1,'mew');
 b.sides.player.active.energy={Psychic:3};
 b.sides.opponent.active=C.makePokemonSlot('A1-002',1,'ivy');
 const choices=C.legalActions(b,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(choices.length>0);
 const razor=choices.find(a=>a.choiceAttackIndex===0);
 assert.ok(razor);
 C.applyAction(b,'player',razor);
 assert.equal(b.sides.opponent.active.damage,60);
});
test('Ditto copied attack requires Ditto to have the copied attack energy',()=>{
 const b=battle();
 b.sides.player.active=C.makePokemonSlot('A1-205',1,'ditto');
 b.sides.opponent.active=C.makePokemonSlot('A1-002',1,'ivy');
 b.sides.player.active.energy={Colorless:1};
 let choices=C.legalActions(b,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(choices.length,0);
 b.sides.player.active.energy={Grass:1,Colorless:2};
 choices=C.legalActions(b,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(choices.some(a=>a.choiceAttackIndex===0));
});
