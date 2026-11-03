'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const broad=()=>classic.CARDS.filter(c=>c.battleEnabled&&!c.basicEnergy).map(c=>({gameplayId:c.id,quantity:4}));
const names=cards=>cards.map(id=>classic.cardById(id)?.name);

test('competitive Base Set Grass never pads Venusaur with isolated Koffing and Nidoran',()=>{
 const owned=broad();const result=builder.buildDeck(owned,{style:'competitive',types:['Grass'],focusCardId:'base1-15'});
 assert.equal(result.ok,true,result.errors?.join('; '));
 assert.equal(result.cards.length,30);
 assert.equal(decks.readiness({cards:result.cards,energyTypes:result.energyTypes,energyMode:'manual'},owned).ok,true);
 const present=names(result.cards);
 for(const stray of ['Koffing','Nidoran♂'])assert.ok(!present.includes(stray),`found unsupported ${stray} in a complete owned collection`);
 assert.ok(present.includes('Venusaur'));
 assert.ok(present.includes('Ivysaur'));
 assert.ok(present.includes('Bulbasaur'));
 assert.ok(result.cards.filter(id=>classic.cardById(id)?.kind==='trainer').length>=12,'competitive deck has room for consistency Trainers');
});
test('competitive Fire supports Charizard without unrelated attackers and keeps legal Energy',()=>{
 const owned=broad();const result=builder.buildDeck(owned,{style:'competitive',types:['Fire'],focusCardId:'base1-4'});
 assert.equal(result.ok,true,result.errors?.join('; '));
 assert.equal(decks.readiness({cards:result.cards,energyTypes:result.energyTypes,energyMode:'manual'},owned).ok,true);
 const present=names(result.cards);
 assert.ok(present.includes('Charizard')&&present.includes('Charmeleon')&&present.includes('Charmander'));
 for(const stray of ['Koffing','Nidoran♂'])assert.ok(!present.includes(stray),`unsupported ${stray} should not be generic padding`);
 if(present.includes('Vulpix'))assert.ok(present.includes('Ninetales'),'Vulpix only belongs as part of its Ninetales line');
});
test('auto-build can still finish a smaller owned collection even if ideal support is unavailable',()=>{
 const quantities=new Map();for(const id of decks.LOANER_DECK)quantities.set(id,(quantities.get(id)||0)+1);
 const owned=[...quantities].map(([gameplayId,quantity])=>({gameplayId,quantity}));
 const result=builder.buildDeck(owned,{style:'competitive'});
 assert.equal(result.ok,true,result.errors?.join('; '));
 assert.equal(result.cards.length,30);
 assert.equal(decks.readiness({cards:result.cards,energyTypes:result.energyTypes,energyMode:'manual'},owned).ok,true);
});

test('requested Energy type determines the competitive core, not a generic Colorless wall',()=>{
 const owned=broad();
 for(const type of decks.ENERGY_TYPES){
   const result=builder.buildDeck(owned,{style:'competitive',types:[type]});
   assert.equal(result.ok,true,`${type}: ${result.errors?.join('; ')}`);
   assert.ok(result.cards.some(id=>classic.cardById(id)?.types?.includes(type)),`${type}: no type-matching Pokémon`);
   assert.ok(!result.strategy.includes('Chansey core'),`${type}: Chansey is Colorless support, not the requested core`);
   assert.deepEqual(result.energyTypes,[type],`${type}: keep selected Energy Zone`);
 }
});

test('competitive primary and partner evolution lines never contain stranded earlier stages',()=>{
 const owned=broad();
 for(const type of decks.ENERGY_TYPES){
   const result=builder.buildDeck(owned,{style:'competitive',types:[type]});
   const present=new Set(names(result.cards));
   for(const id of result.cards){const c=classic.cardById(id);if(c?.kind!=='pokemon'||c.stage==='Basic')continue;
     let node=c;
     while(node.evolvesFrom){assert.ok(present.has(node.evolvesFrom),`${type} contains ${node.name} without ${node.evolvesFrom}`);node=classic.CARDS.find(x=>x.name===node.evolvesFrom);assert.ok(node);}
   }
 }
});

test('evolution family discovery can connect Koffing to a later-set Weezing',()=>{
 const koffing=classic.cardById('base1-51');
 const futureWeezing={id:'fossil-45',name:'Weezing',kind:'pokemon',stage:'Stage 1',types:['Grass'],evolvesFrom:'Koffing',attacks:[]};
 assert.deepEqual(builder.familyLine(futureWeezing,[koffing,futureWeezing]).map(card=>card.name),['Koffing','Weezing']);
});

test('Colorless attack costs do not count as a second Basic Energy type',()=>{
 const raticate=classic.CARDS.find(c=>c.name==='Raticate');
 const arcanine=classic.CARDS.find(c=>c.name==='Arcanine');
 assert.deepEqual(builder.attackTypes(raticate),[]);
 assert.deepEqual(builder.attackTypes(arcanine),['Fire']);
});
