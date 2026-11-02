'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const library=require(path.join(assets,'tcgp-deck-library.js'));

const count=(recipe,name)=>recipe.cards.map(data.cardById).filter(c=>c?.name===name).length;

test('official recipe library preserves immutable historical lists with source metadata',()=>{
  assert.ok(Object.isFrozen(library.OFFICIAL_RECIPES));
  assert.ok(library.OFFICIAL_RECIPES.length>=8);
  for(const recipe of library.OFFICIAL_RECIPES){
    assert.equal(recipe.source,'Official');
    assert.equal(recipe.historical,true);
    assert.equal(recipe.cards.length,20,recipe.id);
    assert.ok(['Beginner','Intermediate','Advanced','Expert'].includes(recipe.difficulty),recipe.id);
    assert.ok(recipe.expansion,recipe.id);
    assert.ok(Object.isFrozen(recipe.cards),recipe.id);
  }
});

test('representative official lists keep their exact published card counts',()=>{
  const ivysaur=library.recipeById('official-genetic-apex-beginner-ivysaur');
  assert.equal(count(ivysaur,'Bulbasaur'),1);
  assert.equal(count(ivysaur,'Paras'),2);
  assert.equal(count(ivysaur,'Ivysaur'),1);
  assert.equal(count(ivysaur,'Poke Ball'),2);

  const pikachu=library.recipeById('official-genetic-apex-advanced-pikachu-ex');
  assert.equal(count(pikachu,'Tynamo'),2);
  assert.equal(count(pikachu,'Eelektrik'),2);
  assert.equal(count(pikachu,'Eelektross'),1);
  assert.equal(count(pikachu,'Pikachu ex'),1);

  const pachirisu=library.recipeById('official-space-time-expert-pachirisu-pikachu');
  assert.equal(count(pachirisu,'Pikachu ex'),2);
  assert.equal(count(pachirisu,'Pachirisu ex'),2);
  assert.equal(count(pachirisu,'Rocky Helmet'),2);
  assert.equal(count(pachirisu,"Professor's Research"),2);
});

test('officialForDifficulty returns only recipes from the requested tier',()=>{
  for(const level of ['Beginner','Intermediate','Advanced','Expert']){
    const pool=library.officialForDifficulty(level);
    assert.ok(pool.length>=2,level);
    assert.ok(pool.every(r=>r.difficulty===level));
  }
});

test('official archetype prior rewards real overlap but stays bounded',()=>{
  const known=['A1-096','A1-096','A1-104','A1-104','A2-061','A2-061'];
  const unrelated=['A1-109','A1-109','A1-098','A1-098'];
  const good=library.archetypePrior(known,['Lightning']);
  const bad=library.archetypePrior(unrelated,['Lightning']);
  assert.ok(good>bad,{good,bad});
  assert.ok(good<=60,{good});
});
