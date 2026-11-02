const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const K=require('../app/src/main/assets/tcgp-battle-decks.js');

const row=id=>({gameplayId:id,quantity:2,battleEnabled:true,variants:[{id,quantity:2,rarity:'One Diamond'}]});
const allOwned=()=>D.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>row(c.id));

test('random builder can exclude already-served successful archetypes',()=>{
  const rows=allOwned();
  const first=K.buildQuickDeck(rows,{types:['Water'],style:'random',variant:2});
  assert.equal(first.ok,true,first.errors?.join(' '));
  const next=K.buildQuickDeck(rows,{types:['Water'],style:'random',variant:3,excludeArchetypes:[first.archetypeKey]});
  assert.equal(next.ok,true,next.errors?.join(' '));
  assert.notEqual(next.archetypeKey,first.archetypeKey,`excluded random archetype repeated: ${first.archetypeKey}`);
});

test('random builder accepts a fresh random seed independently of deterministic variant cycling',()=>{
  const rows=allOwned();
  const seen=new Set();
  for(const randomSeed of [11,22,33,44,55,66]){
    const r=K.buildQuickDeck(rows,{types:['Fighting'],style:'random',variant:0,randomSeed});
    assert.equal(r.ok,true,r.errors?.join(' '));
    seen.add(r.archetypeKey);
  }
  assert.ok(seen.size>=3,`fresh random seeds only produced ${[...seen].join(', ')}`);
});

test('deck editor remembers served random archetypes and supplies exclusions plus a fresh seed',()=>{
  const src=fs.readFileSync(require.resolve('../app/src/main/assets/tcgp-deck-editor.js'),'utf8');
  assert.match(src,/randomHistory/);
  assert.match(src,/excludeArchetypes/);
  assert.match(src,/randomSeed/);
});
