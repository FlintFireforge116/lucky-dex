const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../app/src/main/assets/tcgp-battle-data.js');
const effects = require('../app/src/main/assets/tcgp-battle-effects.js');
const core = require('../app/src/main/assets/tcgp-battle-core.js');

const loaner = data.BEGINNER_IVYSAUR_DECK;

test('opening setup is deterministic, guarantees a Basic active, and first player has no first-turn Energy', () => {
  const a = core.createBattle({playerDeck:loaner,opponentDeck:loaner,seed:123,firstSide:'player'});
  const b = core.createBattle({playerDeck:loaner,opponentDeck:loaner,seed:123,firstSide:'player'});
  assert.deepEqual(core.publicSnapshot(a), core.publicSnapshot(b));
  assert.equal(data.cardById(a.sides.player.active.cardId).stage, 'Basic');
  assert.equal(data.cardById(a.sides.opponent.active.cardId).stage, 'Basic');
  assert.ok(a.sides.player.bench.length <= 3);
  assert.ok(a.sides.opponent.bench.length <= 3);
  assert.equal(a.activeSide, 'player');
  assert.equal(a.sides.player.energyAvailable, false);
});

test('energy costs understand typed and colorless requirements', () => {
  assert.equal(effects.canPayCost({Grass:2}, 'GC'), true);
  assert.equal(effects.canPayCost({Grass:1}, 'GC'), false);
  assert.equal(effects.canPayCost({Water:1,Grass:1}, 'CC'), true);
  assert.equal(effects.canPayCost({Water:2}, 'GC'), false);
});

test('turn flow allows one Energy attachment, attacks end the turn, and deck-out does not lose', () => {
  const battle = core.createBattle({playerDeck:loaner,opponentDeck:loaner,seed:8,firstSide:'player'});
  core.applyAction(battle,'player',{type:'endTurn'});
  assert.equal(battle.activeSide,'opponent');
  assert.equal(battle.sides.opponent.energyAvailable,true);
  const target = battle.sides.opponent.active;
  core.applyAction(battle,'opponent',{type:'attach',target:'active'});
  assert.equal(Object.values(target.energy).reduce((a,b)=>a+b,0),1);
  assert.throws(() => core.applyAction(battle,'opponent',{type:'attach',target:'active'}), /Energy.*once/i);
  battle.sides.opponent.deck.length = 0;
  core.applyAction(battle,'opponent',{type:'endTurn'});
  assert.equal(battle.phase,'battle');
  assert.equal(battle.winner,null);
});

test('a Pokémon cannot evolve on its first turn in play but can evolve on a later turn', () => {
  const battle = core.createBattle({playerDeck:loaner,opponentDeck:loaner,seed:4,firstSide:'player'});
  battle.sides.player.active = core.makePokemonSlot('A1-001',0);
  battle.sides.player.hand.unshift({uid:'ivy-test',cardId:'A1-002'});
  assert.equal(core.legalActions(battle,'player').some(a => a.type==='evolve' && a.cardId==='A1-002'), false);
  core.applyAction(battle,'player',{type:'endTurn'});
  core.applyAction(battle,'opponent',{type:'endTurn'});
  const evolve = core.legalActions(battle,'player').find(a => a.type==='evolve' && a.cardId==='A1-002' && a.target==='active');
  assert.ok(evolve);
  core.applyAction(battle,'player',evolve);
  assert.equal(battle.sides.player.active.cardId,'A1-002');
  assert.deepEqual(battle.sides.player.active.stack,['A1-001','A1-002']);
});

test('attack damage, self-heal, KO points and chosen promotion resolve correctly', () => {
  const battle = core.createBattle({playerDeck:loaner,opponentDeck:loaner,seed:22,firstSide:'player'});
  battle.sides.player.active = core.makePokemonSlot('A1-029',0);
  battle.sides.player.active.damage = 20;
  battle.sides.player.active.energy = {Grass:1};
  battle.sides.player.energyAvailable = false;
  battle.sides.opponent.active = core.makePokemonSlot('A1-021',0);
  battle.sides.opponent.active.damage = 45;
  const benched=core.makePokemonSlot('A1-014',0);benched.benchSlot=2;
  battle.sides.opponent.bench = [benched];
  const attack = core.legalActions(battle,'player').find(a => a.type==='attack' && a.attackIndex===0);
  assert.ok(attack);
  core.applyAction(battle,'player',attack);
  assert.equal(battle.sides.player.points,1);
  assert.equal(battle.sides.player.active.damage,10,'Blot heals 10 after attacking');
  assert.equal(battle.phase,'promote');
  assert.equal(battle.sides.opponent.active,null);
  core.applyAction(battle,'opponent',{type:'promote',benchIndex:2});
  assert.equal(battle.sides.opponent.active.cardId,'A1-014');
  assert.equal(battle.activeSide,'opponent','promotion completes the attacking turn');
});

test('three points wins immediately and Solo turn 50 ends as a player loss', () => {
  const battle = core.createBattle({playerDeck:loaner,opponentDeck:loaner,seed:33,firstSide:'player'});
  battle.sides.player.points = 2;
  battle.sides.player.active = core.makePokemonSlot('A1-002',0);
  battle.sides.player.active.energy = {Grass:3};
  battle.sides.opponent.active = core.makePokemonSlot('A1-021',0);
  battle.sides.opponent.active.damage = 49;
  core.applyAction(battle,'player',{type:'attack',attackIndex:0});
  assert.equal(battle.phase,'finished');
  assert.equal(battle.winner,'player');
  assert.equal(battle.reason,'points');

  const timed = core.createBattle({playerDeck:loaner,opponentDeck:loaner,seed:44,firstSide:'player'});
  timed.turnNumber = 50;
  core.applyAction(timed,'player',{type:'endTurn'});
  assert.equal(timed.phase,'finished');
  assert.equal(timed.winner,'opponent');
  assert.equal(timed.reason,'turn-limit');
});

test('Poke Ball searches a random Basic from deck using battle RNG and places it in hand', () => {
  const battle = core.createBattle({playerDeck:loaner,opponentDeck:loaner,seed:55,firstSide:'player'});
  battle.sides.player.hand = [{uid:'ball-test',cardId:'BASIC-POKE-BALL'}];
  battle.sides.player.deck = [
    {uid:'evo',cardId:'A1-002'},
    {uid:'basic-a',cardId:'A1-014'},
    {uid:'basic-b',cardId:'A1-021'}
  ];
  core.applyAction(battle,'player',{type:'trainer',handIndex:0});
  assert.equal(battle.sides.player.hand.length,1);
  assert.equal(data.cardById(battle.sides.player.hand[0].cardId).stage,'Basic');
  assert.equal(battle.sides.player.discard[0].cardId,'BASIC-POKE-BALL');
  assert.equal(battle.sides.player.deck.length,2);
});
