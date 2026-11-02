'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const decks=require(path.join(assets,'tcgp-battle-decks.js'));
const library=require(path.join(assets,'tcgp-deck-library.js'));
const solo=require(path.join(assets,'tcgp-battle-solo.js'));
const progress=require(path.join(assets,'tcgp-battle-progress.js'));

const playerDeck=data.BEGINNER_IVYSAUR_DECK.slice();

test('all official recipes admitted to Solo are legal 20-card loaner decks',()=>{
  for(const recipe of library.OFFICIAL_RECIPES){
    const valid=decks.validateLoanerDeck(recipe.cards,recipe.energyTypes);
    assert.equal(valid.ok,true,recipe.id);
    assert.equal(valid.energyValid,true,recipe.id);
    assert.deepEqual(valid.unpowerable,[],recipe.id);
    assert.deepEqual(valid.missingEnergyTypes,[],recipe.id);
    assert.equal(valid.warnings.some(w=>w.code==='orphan'),false,recipe.id);
  }
});

test('Solo exposes named official opponents and one repeatable Random Battle per difficulty',()=>{
  for(const level of solo.DIFFICULTIES){
    const official=solo.CHALLENGES.filter(c=>c.difficulty===level&&c.source==='Official'&&!c.randomPool);
    assert.ok(official.length>=2,level);
    const random=solo.CHALLENGES.filter(c=>c.difficulty===level&&c.randomPool);
    assert.equal(random.length,1,level);
    assert.equal(random[0].repeatable,true);
    assert.equal(random[0].countsForCompletion,false);
  }
});

test('difficulty progress excludes repeatable Random Battle',()=>{
  const state={tcgpBattle:{firstClears:{}}};
  for(const level of solo.DIFFICULTIES){
    const expected=solo.CHALLENGES.filter(c=>c.difficulty===level&&c.countsForCompletion!==false).length;
    assert.equal(solo.difficultyProgress(level,state).total,expected);
  }
});

test('seeded Random Battle selects a deterministic official recipe from the requested tier',()=>{
  for(const level of solo.DIFFICULTIES){
    const challenge=solo.CHALLENGES.find(c=>c.difficulty===level&&c.randomPool);
    const a=solo.createBattle({challengeId:challenge.id,playerDeck,playerEnergyTypes:['Grass'],seed:123456});
    const b=solo.createBattle({challengeId:challenge.id,playerDeck,playerEnergyTypes:['Grass'],seed:123456});
    assert.equal(a.opponentRecipeId,b.opponentRecipeId,level);
    const recipe=library.recipeById(a.opponentRecipeId);
    assert.ok(recipe,level);
    assert.equal(recipe.difficulty,level);
    assert.deepEqual(a.opponentDeck,recipe.cards);
  }
});

test('winning repeatable Random Battle records the win but never marks a first clear',()=>{
  const state={profile:{coins:0,dust:0},tcgpBattle:{firstClears:{},stats:{},decks:[]}};
  const challenge=solo.CHALLENGES.find(c=>c.difficulty==='Beginner'&&c.randomPool);
  const battle=solo.createBattle({challengeId:challenge.id,playerDeck,playerEnergyTypes:['Grass'],seed:99});
  battle.phase='finished';battle.winner='player';battle.turnNumber=5;
  const result=progress.recordResult(state,battle,challenge);
  assert.equal(result.firstClear,false);
  assert.equal(state.tcgpBattle.firstClears[challenge.id],undefined);
  assert.equal(state.tcgpBattle.challengeRecords[challenge.id].wins,1);
});
