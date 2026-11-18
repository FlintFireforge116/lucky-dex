'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
// Keep the test independent of the remote 111-print archive: the production
// archive is authenticated separately by v07275 after generation.
const rawLookup=classic.cardById;
const examples={
 'pl4-AR7':{id:'pl4-AR7',setId:'pl4',number:'AR7',name:'Arceus',kind:'pokemon',stage:'Basic',hp:80,types:['Psychic'],subtype:'Psychic',attacks:[{name:'Mind Bend',cost:'PCC',damage:40,effect:{type:'status',target:'opponentActive',status:'confusion'}}],abilities:[],rarity:'Rare',retreat:1,battleEnabled:true,deckEligible:true},
 'pl4-94':{id:'pl4-94',setId:'pl4',number:'94',name:'Arceus LV.X',kind:'pokemon',stage:'Level-Up',evolvesFrom:'Arceus',hp:120,types:['Colorless'],subtype:'Colorless',attacks:[],abilities:[],rarity:'Rare',battleEnabled:true,deckEligible:true},
 'pl4-79':{id:'pl4-79',setId:'pl4',number:'79',name:'Treecko',kind:'pokemon',stage:'Basic',hp:50,types:['Grass'],subtype:'Grass',attacks:[{name:'Slash',cost:'C',damage:20,effect:{type:'noop'}}],abilities:[],rarity:'Common',battleEnabled:true,deckEligible:true}
};
classic.cardById=id=>examples[id]||rawLookup(id);
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const owned=Object.keys(examples).map(gameplayId=>({gameplayId,quantity:30}));

test('manual editor accepts all permitted Arceus Basic and Arceus LV.X copies',()=>{
 for(const id of ['pl4-AR7','pl4-94']){
  let cards=[];
  for(let i=0;i<30;i++){
   const attempt=decks.edit(cards,id,1,owned);
   assert.equal(attempt.ok,true,`${id} copy ${i+1}: ${attempt.error||''}`);
   cards=attempt.cards;
  }
  assert.equal(cards.length,30);
 }
});
test('partial draft validation accepts 30 Arceus copies, rejects 5 ordinary copies',()=>{
 const legal=decks.validateDraft(Array(30).fill('pl4-AR7'),owned);
 assert.equal(legal.ok,true,JSON.stringify(legal.errors));
 const regular=decks.validateDraft(Array(5).fill('pl4-79'),owned);
 assert.equal(regular.ok,false);
 assert.ok(regular.errors.some(x=>/four|4-copy/.test(x)));
});
test('manual editor still enforces the regular four-copy limit and owned quantities',()=>{
 const fifth=decks.edit(Array(4).fill('pl4-79'),'pl4-79',1,owned);
 assert.equal(fifth.ok,false);
 const insufficient=decks.edit(Array(3).fill('pl4-AR7'),'pl4-AR7',1,[{gameplayId:'pl4-AR7',quantity:3}]);
 assert.equal(insufficient.ok,false);
});
test('autobuilder recognises 30 owned copies of one unlimited Arceus print as sufficient card stock',()=>{
 classic.CARDS.push(examples['pl4-AR7']);
 try {
  const result=builder.buildDeck([{gameplayId:'pl4-AR7',quantity:30}],{sets:['pl4'],types:['Psychic'],focusCardId:'pl4-AR7'});
  assert.ok(!result.errors?.some(x=>/Not enough owned battle-ready Classic card copies/.test(x)),JSON.stringify(result.errors));
 }finally{classic.CARDS.splice(classic.CARDS.indexOf(examples['pl4-AR7']),1)}
});
