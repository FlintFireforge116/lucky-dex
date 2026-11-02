'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const C=require('../app/src/main/assets/tcgp-battle-core.js');

function battle(){
  const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:6947,firstSide:'player'});
  b.phase='battle';b.turnNumber=5;b.sides.player.turnCount=3;b.sides.opponent.turnCount=3;
  b.sides.player.hand=[];b.sides.opponent.hand=[];b.sides.player.bench=[];b.sides.opponent.bench=[];
  return b;
}
function act(b,side,predicate,label){const a=C.legalActions(b,side).find(predicate);assert.ok(a,label);C.applyAction(b,side,a);return a;}

test('Jolteon ex Electromagnetic Wall fires when the opponent attaches Energy from the Energy Zone',()=>{
  const b=battle();b.activeSide='opponent';
  b.sides.player.active=C.makePokemonSlot('B1-081',3,'jolteon');
  b.sides.opponent.active=C.makePokemonSlot('A1-001',3,'target');
  b.sides.opponent.energyAvailable=true;b.sides.opponent.energyUsed=false;b.sides.opponent.energyType='Grass';
  const before=b.sides.opponent.active.damage;
  act(b,'opponent',a=>a.type==='attach'&&a.target==='active','opponent Energy attachment should be legal');
  assert.equal(b.sides.opponent.active.damage,before+20);
  assert.ok(b.log.some(x=>x.type==='ability'&&x.cardId==='B1-081'&&x.event==='opponentEnergyAttached'));
});

test('Meloetta Strange Singing fires at the beginning of its owner turn',()=>{
  const b=battle();b.activeSide='opponent';
  b.sides.player.active=C.makePokemonSlot('B2-070',3,'meloetta');
  b.sides.opponent.active=C.makePokemonSlot('A1-001',3,'foe');
  const psychic=D.CARDS.find(c=>c.battleEnabled&&c.kind==='pokemon'&&c.subtype==='Psychic');
  assert.ok(psychic);
  b.sides.player.deck=[{uid:'psychic-search',cardId:psychic.id},{uid:'draw-first',cardId:'A1-001'}];
  b.sides.player.hand=[];
  act(b,'opponent',a=>a.type==='endTurn','opponent end turn should be legal');
  assert.equal(b.activeSide,'player');
  assert.ok(b.log.some(x=>x.type==='ability'&&x.cardId==='B2-070'&&x.event==='beginTurn'));
});
