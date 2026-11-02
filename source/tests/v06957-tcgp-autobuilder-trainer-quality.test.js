'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const decks=require(path.join(assets,'tcgp-battle-decks.js'));
const rows=data.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,quantity:2,battleEnabled:true,variants:[]}));
const trainerNames=result=>result.cards.map(id=>data.cardById(id)).filter(c=>c?.kind==='trainer').map(c=>c.name);

test('competitive Trainer scoring does not treat Super Potion self-Energy discard as upside',()=>{
  const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
  let appearances=0;
  for(const type of types){
    const result=decks.buildQuickDeck(rows,{type,style:'competitive'});
    assert.equal(result.ok,true,`${type} build should succeed`);
    if(trainerNames(result).includes('Super Potion'))appearances++;
  }
  assert.ok(appearances<=2,`Super Potion appeared in ${appearances}/${types.length} representative competitive builds`);
});

test('KO-triggered Lucky Egg is not valued like immediate generic draw in an unrelated shell',()=>{
  const result=decks.buildQuickDeck(rows,{cardId:'B1a-048',style:'competitive'}); // Liepard
  assert.equal(result.ok,true);
  const trainers=trainerNames(result);
  assert.ok(!trainers.includes('Lucky Egg'),`unexpected Lucky Egg in generic Liepard shell: ${trainers.join(', ')}`);
});
