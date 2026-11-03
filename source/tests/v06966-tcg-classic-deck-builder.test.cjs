'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const assets=path.join(root,'app/src/main/assets');

function rowsFor(ids,quantity=4){
  const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
  return [...new Set(ids)].map(id=>({gameplayId:id,quantity,card:classic.cardById(id),battleEnabled:true,variants:[{id,quantity,row:{id,source:'tcg',setId:'base1',count:quantity}}]}));
}

function broadOwnedRows(){
  const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
  return classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4,card:c,battleEnabled:true,variants:[{id:c.id,quantity:4,row:{id:c.id,source:'tcg',setId:'base1',count:4}}]}));
}

test('Classic auto builder module produces a legal owned 30-card deck',()=>{
  const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
  const decks=require('../app/src/main/assets/tcg-classic-decks.js');
  const rows=broadOwnedRows();
  const result=builder.buildDeck(rows,{style:'competitive'});
  assert.equal(result.ok,true,result.errors?.join(' '));
  assert.equal(result.cards.length,30);
  assert.equal(decks.validateDraft(result.cards,rows,{requireFull:true}).ok,true);
  const counts=new Map();for(const id of result.cards)counts.set(id,(counts.get(id)||0)+1);
  assert.ok([...counts.values()].every(n=>n<=4));
  assert.ok(result.energyTypes.length>=1&&result.energyTypes.length<=2);
});

test('Classic auto builder never strands an evolution without its earlier stages',()=>{
  const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
  const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
  const result=builder.buildDeck(broadOwnedRows(),{style:'competitive',focusCardId:'base1-4'}); // Charizard
  assert.equal(result.ok,true,result.errors?.join(' '));
  const names=new Set(result.cards.map(id=>classic.cardById(id)?.name));
  assert.ok(names.has('Charizard'));
  assert.ok(names.has('Charmeleon'));
  assert.ok(names.has('Charmander'));
  for(const id of result.cards){
    let card=classic.cardById(id);
    while(card?.evolvesFrom){
      assert.ok(names.has(card.evolvesFrom),`${card.name} is missing ${card.evolvesFrom}`);
      card=classic.CARDS.find(c=>c.name===card.evolvesFrom);
    }
  }
});

test('Classic random auto builder can rotate archetypes',()=>{
  const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
  const rows=broadOwnedRows();
  const a=builder.buildDeck(rows,{style:'random',randomSeed:11});
  const b=builder.buildDeck(rows,{style:'random',randomSeed:47,excludeArchetypes:[a.archetypeKey]});
  assert.equal(a.ok,true);
  assert.equal(b.ok,true);
  assert.notEqual(a.archetypeKey,b.archetypeKey);
});

test('Classic auto builder can widen an unrestricted small collection to two Energy types',()=>{
  const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
  const decks=require('../app/src/main/assets/tcg-classic-decks.js');
  const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
  const counts=new Map();for(const id of decks.LOANER_DECK)counts.set(id,(counts.get(id)||0)+1);
  const rows=[...counts].map(([id,quantity])=>({gameplayId:id,quantity,card:classic.cardById(id),battleEnabled:true,variants:[]}));
  const result=builder.buildDeck(rows,{style:'competitive'});
  assert.equal(result.ok,true,result.errors?.join(' '));
  assert.equal(result.cards.length,30);
  assert.deepEqual(result.energyTypes.slice().sort(),['Fighting','Fire']);
  assert.equal(decks.readiness({cards:result.cards,energyMode:'manual',energyTypes:result.energyTypes},rows).ok,true);
});

test('Classic deck editor mirrors the Pocket workspace structure and is wired into Battle Lab',()=>{
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  const ui=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  const editor=fs.readFileSync(path.join(assets,'tcg-classic-deck-editor.js'),'utf8');
  assert.match(html,/tcg-classic-deck-builder\.js/);
  assert.match(html,/tcg-classic-deck-workspace\.js/);
  assert.match(html,/tcg-classic-deck-editor\.js/);
  assert.match(editor,/MY DECK/);
  assert.match(editor,/Auto build/);
  assert.match(editor,/Competitive/);
  assert.match(editor,/Random/);
  assert.match(editor,/Fill \/ repair this deck/);
  assert.match(editor,/Build around this card/);
  assert.match(ui,/LuckyDexClassicTCGDeckEditor\.open/);
  assert.match(ui,/classic-quick/);
});

test('v0.69.66 release markers agree',()=>{
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  const runtime=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  assert.match(gradle,/versionCode 7046/);
  assert.match(gradle,/versionName '0\.69\.66'/);
  assert.match(runtime,/window\.__LUCKYDEX_BUILD='0\.69\.66'/);
  assert.match(html,/LUCKY DEX · v0\.69\.66/);
});
