'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const workspace=require(path.join(assets,'tcgp-deck-workspace.js'));
const solo=require(path.join(assets,'tcgp-battle-solo.js'));
const decks=require(path.join(assets,'tcgp-battle-decks.js'));
const ui=require(path.join(assets,'tcgp-battle-ui.js'));

test('Darkrai Weavile recipe is available in the built-in Pocket roster and as an Expert challenge',()=>{
  const recipe=workspace.LOCAL_RECIPES.find(r=>r.id==='darkrai-weavile');
  assert.ok(recipe);
  assert.equal(recipe.source,'LuckyDex');
  assert.deepEqual(recipe.energyTypes,['Darkness']);
  const valid=decks.validateLoanerDeck(recipe.cards,recipe.energyTypes);
  assert.equal(valid.ok,true);
  assert.equal(valid.energyValid,true);
  assert.deepEqual(valid.unpowerable,[]);
  assert.deepEqual(valid.missingEnergyTypes,[]);
  assert.equal(valid.warnings.some(w=>w.code==='orphan'),false);
  const challenge=solo.CHALLENGES.find(c=>c.recipeId==='darkrai-weavile');
  assert.ok(challenge);
  assert.equal(challenge.difficulty,'Expert');
});

test('coin presentation uses the coin face itself without the old H/T corner badge and the CSS sizes it up',()=>{
  const state={cosmetics:{unlockedCoins:['pocket-coin-mewtwo'],activeCoin:'pocket-coin-mewtwo'}};
  const html=ui._test.coinPresentationHtml(true,'player',state);
  assert.match(html,/tcgp-present-coin-face/);
  assert.doesNotMatch(html,/tcgp-present-coin-side/);
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  assert.match(css,/\.tcgp-present-coin\{width:56px;height:56px/);
  assert.doesNotMatch(css,/\.tcgp-present-coin-side\{/);
});
