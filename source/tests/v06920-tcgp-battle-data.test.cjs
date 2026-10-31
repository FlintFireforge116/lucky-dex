const test = require('node:test');
const assert = require('node:assert/strict');

const data = require('../app/src/main/assets/tcgp-battle-data.js');

test('maps base and alternate-art Pocket prints to one gameplay identity', () => {
  assert.equal(data.gameplayIdForOwned({ source: 'tcgp', id: 'A1-001', setId: 'A1', name: 'Bulbasaur' }), 'A1-001');
  assert.equal(data.gameplayIdForOwned({ source: 'tcgp', id: 'A1-227', setId: 'A1', name: 'Bulbasaur' }), 'A1-001');
  assert.equal(data.gameplayIdForOwned({ source: 'physical', id: 'A1-001', setId: 'A1', name: 'Bulbasaur' }), null);
});

test('projects owned alternate arts into one playable quantity while preserving variants', () => {
  const owned = {
    a: { source: 'tcgp', id: 'A1-001', setId: 'A1', name: 'Bulbasaur', count: 1, image: 'base.webp' },
    b: { source: 'tcgp', id: 'A1-227', setId: 'A1', name: 'Bulbasaur', count: 2, image: 'art.webp' },
    c: { source: 'tcgp', id: 'A1-002', setId: 'A1', name: 'Ivysaur', count: 1 },
    d: { source: 'physical', id: 'A1-001', setId: 'A1', name: 'Bulbasaur', count: 99 },
  };
  const projected = data.projectOwnedCards(owned);
  const bulbasaur = projected.find((row) => row.gameplayId === 'A1-001');
  assert.ok(bulbasaur);
  assert.equal(bulbasaur.quantity, 3);
  assert.equal(bulbasaur.variants.length, 2);
  assert.equal(projected.find((row) => row.gameplayId === 'A1-002').quantity, 1);
  assert.equal(projected.length, 2);
});

test('catalogue preserves the Genetic Apex beginner definitions and explicitly classifies expanded mechanics', () => {
  const bulbasaur = data.cardById('A1-001');
  assert.deepEqual(
    { name: bulbasaur.name, stage: bulbasaur.stage, hp: bulbasaur.hp, weakness: bulbasaur.weakness, retreat: bulbasaur.retreat },
    { name: 'Bulbasaur', stage: 'Basic', hp: 70, weakness: 'Fire', retreat: 1 }
  );
  assert.deepEqual(bulbasaur.attacks[0], { name: 'Vine Whip', cost: 'GC', damage: 40, text: '', effect: null });
  assert.equal(data.cardById('A1-029').attacks[0].effect.type, 'healSelf');
  assert.equal(data.cardById('A1-030').battleEnabled, true, 'Lilligant uses the supported typed Energy acceleration primitive');
  assert.equal(data.cardById('A1-188').battleEnabled, false, 'Pidgeot opponent-choice switching remains PARTIAL');
  assert.equal(data.cardById('A1-192').battleEnabled, true, 'Fearow uses the tested seeded coin-flip discard primitive');
});

test('unknown or unsupported owned prints do not masquerade as battle-enabled cards', () => {
  assert.equal(data.gameplayIdForOwned({ source: 'tcgp', id: 'ZZ-999', setId: 'ZZ', name: 'Missingno' }), null);
  assert.equal(data.isBattleEnabled({ source: 'tcgp', id: 'A1-188', setId: 'A1', name: 'Pidgeot' }), false);
  assert.equal(data.isBattleEnabled({ source: 'tcgp', id: 'A1-227', setId: 'A1', name: 'Bulbasaur' }), true);
});
