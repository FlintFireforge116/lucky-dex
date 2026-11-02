'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const decks=require(path.join(assets,'tcgp-battle-decks.js'));
const row=(id,quantity=2)=>({gameplayId:id,quantity,battleEnabled:true,variants:[]});

test('competitive candidate records and applies a bounded official archetype prior',()=>{
  const rows=data.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>row(c.id,2));
  const result=decks.buildQuickDeck(rows,{cardId:'A1-096',style:'competitive'});
  assert.equal(result.ok,true);
  assert.ok(result.officialArchetypePrior>0,result.strategy);
  assert.ok(result.officialArchetypePrior<=60);
  assert.equal(result.score,result.baseScore+result.officialArchetypePrior);
});

test('random builds do not use the official prior to collapse diversity',()=>{
  const rows=data.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>row(c.id,2));
  const result=decks.buildQuickDeck(rows,{type:'Lightning',style:'random',randomSeed:12345});
  assert.equal(result.ok,true);
  assert.equal(result.officialArchetypePrior,0);
});
