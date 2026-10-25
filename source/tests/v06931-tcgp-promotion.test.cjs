const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const ai=require('../app/src/main/assets/tcgp-battle-ai.js');
const deck=data.BEGINNER_IVYSAUR_DECK;

function slot(id,benchSlot){const s=core.makePokemonSlot(id,0);if(benchSlot!=null)s.benchSlot=benchSlot;return s;}

test('KO pauses for defender promotion instead of auto-promoting Bench 1',()=>{
  const battle=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:921,firstSide:'player'});
  battle.sides.player.active=slot('A1-002');
  battle.sides.player.active.energy={Grass:3};
  battle.sides.opponent.active=slot('A1-021');
  battle.sides.opponent.active.damage=49;
  battle.sides.opponent.bench=[slot('A1-014',0),slot('A1-029',2)];
  core.applyAction(battle,'player',{type:'attack',attackIndex:0});
  assert.equal(battle.phase,'promote');
  assert.equal(battle.promotionSide,'opponent');
  assert.equal(battle.sides.opponent.active,null);
  const promote=core.legalActions(battle,'opponent').filter(a=>a.type==='promote');
  assert.deepEqual(promote.map(a=>a.benchIndex).sort(),[0,2]);
});

test('defender can choose any occupied Bench slot as the new Active and battle then advances turn',()=>{
  const battle=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:922,firstSide:'player'});
  battle.sides.player.active=slot('A1-002');
  battle.sides.player.active.energy={Grass:3};
  battle.sides.opponent.active=slot('A1-021');
  battle.sides.opponent.active.damage=49;
  battle.sides.opponent.bench=[slot('A1-014',0),slot('A1-029',2)];
  core.applyAction(battle,'player',{type:'attack',attackIndex:0});
  core.applyAction(battle,'opponent',{type:'promote',benchIndex:2});
  assert.equal(battle.sides.opponent.active.cardId,'A1-029');
  assert.equal(battle.sides.opponent.bench.length,1);
  assert.equal(battle.sides.opponent.bench[0].benchSlot,0);
  assert.equal(battle.phase,'battle');
  assert.equal(battle.activeSide,'opponent');
  assert.equal(battle.promotionSide,null);
});

test('Beginner AI can select a legal promotion action',()=>{
  const battle=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:923,firstSide:'player'});
  battle.phase='promote';battle.promotionSide='opponent';battle.sides.opponent.active=null;
  battle.sides.opponent.bench=[slot('A1-014',1)];
  const action=ai.chooseAction(battle,'opponent','Beginner');
  assert.equal(action.type,'promote');
  assert.equal(action.benchIndex,1);
});
