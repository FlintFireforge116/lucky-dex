const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../app/src/main/assets/tcgp-battle-data.js');
const decks = require('../app/src/main/assets/tcgp-battle-decks.js');

function ownedRows(){
  return data.projectOwnedCards({
    bulbaBase:{source:'tcgp',id:'A1-001',setId:'A1',name:'Bulbasaur',count:1},
    bulbaArt:{source:'tcgp',id:'A1-227',setId:'A1',name:'Bulbasaur',count:1},
    ivy:{source:'tcgp',id:'A1-002',setId:'A1',name:'Ivysaur',count:2},
    paras:{source:'tcgp',id:'A1-014',setId:'A1',name:'Paras',count:2},
    parasect:{source:'tcgp',id:'A1-015',setId:'A1',name:'Parasect',count:2},
    exeggcute:{source:'tcgp',id:'A1-021',setId:'A1',name:'Exeggcute',count:2},
    cottonee:{source:'tcgp',id:'A1-027',setId:'A1',name:'Cottonee',count:2},
    whimsicott:{source:'tcgp',id:'A1-028',setId:'A1',name:'Whimsicott',count:2},
    petilil:{source:'tcgp',id:'A1-029',setId:'A1',name:'Petilil',count:2},
    pidgey:{source:'tcgp',id:'A1-186',setId:'A1',name:'Pidgey',count:2},
    rattata:{source:'tcgp',id:'A1-189',setId:'A1',name:'Rattata',count:2},
  });
}

test('ensures backwards-compatible battle save defaults without replacing existing progress', () => {
  const state = { tcgpBattle:{ helpSeen:true, stats:{wins:4}, decks:[{id:'old',name:'Old',cards:[]}]} };
  const battle = decks.ensureBattleState(state);
  assert.equal(battle.helpSeen, true);
  assert.equal(battle.stats.wins, 4);
  assert.equal(battle.stats.matches, 0);
  assert.equal(battle.decks[0].id, 'old');
  assert.deepEqual(battle.firstClears, {});
});

test('validates exactly 20 cards, at least one Basic, ownership, support cards and two-copy identity limit', () => {
  const legal = [
    'A1-001','A1-001','A1-002','A1-002','A1-014','A1-014','A1-015','A1-015','A1-021','A1-021',
    'A1-027','A1-027','A1-028','A1-028','A1-029','A1-029','A1-186','A1-186','BASIC-POKE-BALL','BASIC-POKE-BALL'
  ];
  assert.deepEqual(decks.validateDeck(legal, ownedRows()), { ok:true, errors:[] });

  const tooManyBulbasaur = legal.slice();
  tooManyBulbasaur[2] = 'A1-001';
  const duplicateResult = decks.validateDeck(tooManyBulbasaur, ownedRows());
  assert.equal(duplicateResult.ok, false);
  assert.ok(duplicateResult.errors.some(e => /2 copies of Bulbasaur/i.test(e)));

  const unowned = legal.slice();
  unowned[0] = 'A1-198';
  const ownershipResult = decks.validateDeck(unowned, ownedRows());
  assert.equal(ownershipResult.ok, false);
  assert.ok(ownershipResult.errors.some(e => /do not own/i.test(e)));

  const noBasics = Array(10).fill('A1-002').flatMap((id) => [id,id]).slice(0,20);
  const basicResult = decks.validateDeck(noBasics, [{gameplayId:'A1-002',quantity:20,battleEnabled:true}]);
  assert.equal(basicResult.ok, false);
  assert.ok(basicResult.errors.some(e => /Basic Pokémon/i.test(e)));
});


test('copy limit key is the gameplay card name so future cross-set reprints cannot bypass Pocket limits', () => {
  assert.equal(decks.copyLimitKey({id:'A1-999',name:'Pikachu'}), decks.copyLimitKey({id:'A2-001',name:'Pikachu'}));
  assert.notEqual(decks.copyLimitKey({id:'A1-999',name:'Pikachu'}), decks.copyLimitKey({id:'A1-004',name:'Pikachu ex'}));
});

test('quick deck respects owned quantities and never creates an illegal 20-card deck', () => {
  const result = decks.buildQuickDeck(ownedRows());
  assert.equal(result.ok, true);
  assert.equal(result.cards.length, 20);
  assert.equal(decks.validateDeck(result.cards, ownedRows()).ok, true);
  const counts = result.cards.reduce((m,id)=>(m[id]=(m[id]||0)+1,m),{});
  assert.ok(Object.values(counts).every(count => count <= 2));
  assert.ok((counts['BASIC-POKE-BALL'] || 0) <= 2);
});

test('loaner deck is a legal self-contained fallback and uses the canonical beginner card pool', () => {
  assert.equal(decks.LOANER_PLAYER_DECK.length, 20);
  assert.deepEqual(decks.validateLoanerDeck(decks.LOANER_PLAYER_DECK), {ok:true,errors:[]});
  assert.ok(decks.LOANER_PLAYER_DECK.includes('A1-001'));
  assert.equal(decks.LOANER_PLAYER_DECK.filter(id => id === 'BASIC-POKE-BALL').length, 2);
});
