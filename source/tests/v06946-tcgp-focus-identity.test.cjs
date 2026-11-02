const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const K=require('../app/src/main/assets/tcgp-battle-decks.js');

const row=id=>({gameplayId:id,quantity:2,battleEnabled:true,variants:[{id,quantity:2,rarity:'One Diamond'}]});

function serperiorPlusSceptilePool(){
  const pokemon=new Set(['Snivy','Servine','Serperior','Treecko','Grovyle','Mega Sceptile ex']);
  return D.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&(c.kind==='trainer'||pokemon.has(c.name))).map(c=>row(c.id));
}

test('Build Around Card keeps a Stage 2 focus as the only heavy evolution engine',()=>{
  const result=K.buildQuickDeck(serperiorPlusSceptilePool(),{cardId:'B4a-005'});
  assert.equal(result.ok,true,result.errors?.join(' '));
  const names=result.cards.map(id=>D.cardById(id)?.name);
  assert.ok(names.includes('Serperior'),'focus Serperior must remain in the deck');
  assert.ok(names.includes('Snivy')&&names.includes('Servine'),'focus evolution line must remain complete');
  assert.equal(names.includes('Mega Sceptile ex'),false,'a second Stage 2/Mega family must not hijack a focus build');
  assert.equal(names.includes('Grovyle'),false,'do not add the bridge of a rejected heavy secondary line');
  assert.equal(names.includes('Treecko'),false,'do not add a stranded Basic from a rejected heavy secondary line');
});
