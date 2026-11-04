'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const full=classic.CARDS.filter(card=>card.battleEnabled&&card.deckEligible!==false).map(card=>({gameplayId:card.id,quantity:4}));
const ready=(result,rows)=>{
 assert.equal(result.ok,true,result.errors?.join('; '));
 assert.equal(result.cards.length,30);
 assert.ok(result.cards.every(id=>classic.cardById(id)?.battleEnabled));
 assert.equal(decks.readiness({cards:result.cards,energyMode:'manual',energyTypes:result.energyTypes},rows).ok,true,`Energy requirements not met: ${result.strategy}`);
};

test('random features printed Pokémon across all six sets, not a top-14 scoring shortlist',()=>{
 const selected=new Set(),sourceSets=new Set();
 for(let seed=1;seed<=240;seed++){
  const result=builder.buildDeck(full,{style:'random',randomSeed:seed});ready(result,full);
  assert.ok(result.cards.includes(result.focusCardId),`The chosen featured card must actually be in the deck: ${result.focusCardId}`);
  assert.ok(result.strategy.includes(classic.cardById(result.focusCardId).name+' featured'));
  selected.add(result.focusCardId);sourceSets.add(classic.cardById(result.focusCardId).setId);
 }
 assert.ok(selected.size>100,`Random only featured ${selected.size} printed Pokémon`);
 assert.deepEqual([...sourceSets].sort(),builder.SET_IDS.slice().sort());
});

test('seeded competitive rotates viable cores across all six set catalogues',()=>{
 const selected=new Set(),sourceSets=new Set();
 for(let seed=1;seed<=240;seed++){
  const result=builder.buildDeck(full,{style:'competitive',randomSeed:seed});ready(result,full);
  selected.add(result.focusCardId);sourceSets.add(classic.cardById(result.focusCardId).setId);
 }
 assert.ok(selected.size>=60,`Competitive only chose ${selected.size} different Pokémon`);
 assert.deepEqual([...sourceSets].sort(),builder.SET_IDS.slice().sort());
});

test('exclusions rotate the precise featured Pokémon, not merely the Energy type',()=>{
 for(const style of ['random','competitive']){
  const first=builder.buildDeck(full,{style,randomSeed:13});
  const second=builder.buildDeck(full,{style,randomSeed:13,excludeArchetypes:[first.archetypeKey]});
  ready(first,full);ready(second,full);
  assert.notEqual(first.archetypeKey,second.archetypeKey,`${style} ignored recent history`);
 }
});

test('single-set pools never create unsupported third Energy types when filler slots are needed',()=>{
 for(const setId of builder.SET_IDS){
  const owned=full.filter(row=>classic.cardById(row.gameplayId).setId===setId);
  for(const style of ['random','competitive'])for(let seed=1;seed<=16;seed++){
   const result=builder.buildDeck(owned,{style,sets:[setId],randomSeed:seed});ready(result,owned);
   assert.ok(result.cards.every(id=>classic.cardById(id).setId===setId));
   assert.ok(result.energyTypes.length<=2);
  }
 }
});

test('competitive Water can use a Water specialist without obligatorily adding Fossil Magmar',()=>{
 const result=builder.buildDeck(full,{style:'competitive',randomSeed:1});ready(result,full);
 assert.equal(result.focusCardId,'base1-25');
 assert.deepEqual(result.energyTypes,['Water']);
 assert.equal(result.cards.includes('base3-39'),false);
});

test('Blaine evolution focus includes the featured stage and relevant Gym support',()=>{
 const result=builder.buildDeck(full,{style:'competitive',focusCardId:'gym2-2',types:['Fire']});ready(result,full);
 for(const name of ["Blaine's Charmander","Blaine's Charmeleon","Blaine's Charizard"])
  assert.ok(result.cards.some(id=>classic.cardById(id)?.name===name),`missing ${name}`);
 assert.ok(result.cards.some(id=>classic.cardById(id)?.setId.startsWith('gym')&&classic.cardById(id).kind==='trainer'),'should contain later-set Trainer support');
});

test('Classic editor supplies seeds and tracks archetype history for both generation styles',()=>{
 const source=fs.readFileSync(path.join(assets,'tcg-classic-deck-editor.js'),'utf8');
 assert.match(source,/const seed=root\.crypto/);
 assert.match(source,/const historyKey=`classic:\$\{style\}/);
 assert.match(source,/excludeArchetypes:history\.slice\(\),randomSeed:seed/);
 assert.match(source,/randomHistory\.set\(historyKey/);
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8');
 assert.match(gradle,/versionName '0\.69\.91'/);
});
