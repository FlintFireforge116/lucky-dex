'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const decks=require(path.join(assets,'tcgp-battle-decks.js'));

const row=c=>({gameplayId:c.id,quantity:2,battleEnabled:true,variants:[]});
const selectedPokemon=result=>result.cards.map(id=>data.cardById(id)).filter(c=>c?.kind==='pokemon');

function hasLaterBattleEvolution(card){
  const name=data.normalizeName(card?.name||'');
  return data.CARDS.some(next=>next?.battleEnabled&&next.kind==='pokemon'&&data.normalizeName(next.evolvesFrom||'')===name);
}

test('random Rhyperior build does not use Gabite as a fake endpoint when Garchomp is unavailable',()=>{
  const keepPokemon=new Set(['Rhyhorn','Rhydon','Rhyperior','Gible','Gabite']);
  const rows=data.CARDS
    .filter(c=>c.battleEnabled&&!c.loaner&&(c.kind==='trainer'||keepPokemon.has(c.name)))
    .map(row);

  const result=decks.buildQuickDeck(rows,{type:'Fighting',style:'random',randomSeed:1});
  if(!result.ok)return; // refusing an incoherent tiny collection is preferable to inventing a fake endpoint
  const names=selectedPokemon(result).map(c=>c.name);
  assert.equal(names.includes('Gabite'),false,`Gabite should not be treated as a completed partner family: ${names.join(', ')}`);
  assert.equal(names.includes('Gible'),false,`Gible/Gabite package should be omitted without an actual endpoint: ${names.join(', ')}`);
});

test('automatic builds never end a secondary evolution family on a card with a known later evolution',()=>{
  const rows=data.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(row);
  for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']){
    const result=decks.buildQuickDeck(rows,{type,style:'random',randomSeed:7});
    assert.equal(result.ok,true,`${type} build failed`);
    const pokemon=selectedPokemon(result);
    const families=new Map();
    for(const c of pokemon){
      let root=c,guard=0;
      while(root.stage!=='Basic'&&root.evolvesFrom&&guard++<4){const prior=data.CARDS.find(x=>x.kind==='pokemon'&&x.name===root.evolvesFrom);if(!prior)break;root=prior;}
      const key=data.normalizeName(root.name);
      if(!families.has(key))families.set(key,[]);
      families.get(key).push(c);
    }
    const primary=data.normalizeName(result.archetypeKey||'');
    for(const [family,cards] of families){
      if(family===primary)continue;
      const endpoints=cards.filter(c=>!cards.some(x=>data.normalizeName(x.evolvesFrom||'')===data.normalizeName(c.name)));
      for(const endpoint of endpoints){
        assert.equal(hasLaterBattleEvolution(endpoint),false,`${type} secondary family stops at ${endpoint.name} even though it has a later battle-enabled evolution`);
      }
    }
  }
});


test('explicit Build Around Card may still honour an intermediate evolution when the user chooses it',()=>{
  const rows=data.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(row);
  const result=decks.buildQuickDeck(rows,{cardId:'A2a-046',style:'competitive'});
  assert.equal(result.ok,true);
  assert.ok(result.cards.includes('A2a-046'),'explicit Gabite focus should remain in the deck');
});
