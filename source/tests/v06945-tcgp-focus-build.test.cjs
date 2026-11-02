const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const K=require('../app/src/main/assets/tcgp-battle-decks.js');

const row=id=>({gameplayId:id,quantity:2,battleEnabled:true,variants:[{id,quantity:2,rarity:'One Diamond'}]});
const allOwned=()=>D.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>row(c.id));

test('build around all-Colourless evolved Pokémon uses its evolution line Energy instead of arbitrary Water',()=>{
  const result=K.buildQuickDeck(allOwned(),{cardId:'B4a-005'}); // Regal Bloom Serperior
  assert.equal(result.ok,true,result.errors?.join(' '));
  assert.ok(result.cards.includes('B4a-005'),'focused Serperior must be in the finished deck');
  assert.ok(result.cards.some(id=>D.cardById(id)?.name==='Servine'),'Serperior deck needs Servine');
  assert.ok(result.cards.some(id=>D.cardById(id)?.name==='Snivy'),'Serperior deck needs Snivy');
  assert.ok(result.energyTypes.includes('Grass'),`expected Grass Energy, got ${result.energyTypes.join(' / ')}`);
});
