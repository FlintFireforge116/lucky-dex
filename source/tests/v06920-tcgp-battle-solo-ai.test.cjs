const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../app/src/main/assets/tcgp-battle-data.js');
const core = require('../app/src/main/assets/tcgp-battle-core.js');
const ai = require('../app/src/main/assets/tcgp-battle-ai.js');
const solo = require('../app/src/main/assets/tcgp-battle-solo.js');

test('ships the Genetic Apex Beginner Ivysaur Solo deck as a fixed 20-card challenge', () => {
  const challenge = solo.challengeById('genetic-apex-beginner-ivysaur');
  assert.ok(challenge);
  assert.equal(challenge.difficulty,'Beginner');
  assert.equal(challenge.energyType,'Grass');
  assert.equal(challenge.deck.length,20);
  assert.equal(challenge.deck.filter(id => id==='A1-014').length,2,'Paras x2');
  assert.equal(challenge.deck.filter(id => id==='A1-002').length,1,'Ivysaur x1');
  assert.equal(challenge.deck.filter(id => id==='BASIC-POKE-BALL').length,2,'Poke Ball x2');
});

test('Beginner AI only returns actions the rules engine considers legal', () => {
  const battle = core.createBattle({playerDeck:data.BEGINNER_IVYSAUR_DECK,opponentDeck:data.BEGINNER_IVYSAUR_DECK,seed:2020,firstSide:'opponent'});
  for (let step=0;step<12 && battle.phase==='battle' && battle.activeSide==='opponent';step++){
    const legal = core.legalActions(battle,'opponent');
    const action = ai.chooseAction(battle,'opponent','Beginner');
    assert.ok(action);
    assert.ok(legal.some(candidate => ai.sameAction(candidate,action)), `AI chose illegal action ${JSON.stringify(action)}`);
    core.applyAction(battle,'opponent',action);
  }
  assert.ok(battle.phase==='finished' || battle.activeSide==='player','AI turn must terminate');
});

test('AI prefers evolution, useful Energy and the strongest available attack without cheating RNG', () => {
  const battle = core.createBattle({playerDeck:data.BEGINNER_IVYSAUR_DECK,opponentDeck:data.BEGINNER_IVYSAUR_DECK,seed:777,firstSide:'opponent'});
  const side = battle.sides.opponent;
  side.active = core.makePokemonSlot('A1-001',0);
  side.turnCount = 2;
  side.hand = [{uid:'iv',cardId:'A1-002'}];
  side.energyAvailable = true;
  side.energyUsed = false;
  assert.equal(ai.chooseAction(battle,'opponent','Beginner').type,'evolve');
  core.applyAction(battle,'opponent',ai.chooseAction(battle,'opponent','Beginner'));
  assert.equal(ai.chooseAction(battle,'opponent','Beginner').type,'attach');

  side.active.energy={Grass:3};
  side.energyUsed=true;
  const attack = ai.chooseAction(battle,'opponent','Beginner');
  assert.equal(attack.type,'attack');
  assert.equal(attack.attackIndex,0);
});

test('headless Beginner-v-Beginner simulation is deterministic and always ends by the Solo cap', () => {
  function run(seed){
    const battle = solo.createBattle({challengeId:'genetic-apex-beginner-ivysaur',playerDeck:data.BEGINNER_IVYSAUR_DECK,seed,firstSide:'player'});
    let guard=0;
    while (battle.phase==='battle' && guard++<1000) ai.runTurn(battle,battle.activeSide,'Beginner');
    assert.ok(guard<1000,'simulation must not stall');
    assert.equal(battle.phase,'finished');
    assert.ok(battle.turnNumber<=50);
    return {winner:battle.winner,reason:battle.reason,turn:battle.turnNumber,points:[battle.sides.player.points,battle.sides.opponent.points]};
  }
  assert.deepEqual(run(314159),run(314159));
});
