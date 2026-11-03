'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const C=require(path.join(assets,'tcg-classic-battle-data.js'));
const K=require(path.join(assets,'tcg-classic-decks.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const ui=()=>fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');

function opponent(seed,excludeTypes=[]){return require(path.join(assets,'tcg-classic-opponents.js')).generate({seed,excludeTypes});}

test('random CPU opponents span the six Base Set Energy types without repeats until a cycle is complete',()=>{
 const seen=[];
 for(let i=0;i<K.ENERGY_TYPES.length;i++){
   const r=opponent(7200+i,seen);
   assert.equal(r.ok,true,r.error);
   assert.ok(K.ENERGY_TYPES.includes(r.type));
   assert.ok(!seen.includes(r.type),`repeat CPU type ${r.type}`);
   seen.push(r.type);
 }
 assert.deepEqual([...seen].sort(),[...K.ENERGY_TYPES].sort());
 assert.equal(opponent(8000,seen).ok,true,'cycle should reset when all types have appeared');
});

test('every random opponent is a legal 30-card battle deck with matching Energy Zone and a coherent typed core',()=>{
 for(const type of K.ENERGY_TYPES){
   const exclusions=K.ENERGY_TYPES.filter(t=>t!==type);
   for(const seed of [1,987,4210]){
     const r=opponent(seed,exclusions);
     assert.equal(r.ok,true,`${type}: ${r.error}`);
     assert.equal(r.type,type);
     assert.equal(r.cards.length,30);
     assert.deepEqual(r.energyTypes,[type]);
     assert.equal(C.validateDeck(r.cards).ok,true);
     assert.ok(r.cards.some(id=>C.cardById(id)?.types?.includes(type)),`${type}: no actual ${type} Pokemon`);
     assert.ok(r.archetype && typeof r.name==='string');
     assert.doesNotThrow(()=>core.createBattle({format:'classic',playerDeck:K.LOANER_DECK.slice(),opponentDeck:r.cards,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:r.energyTypes,seed,manualPlayerSetup:true}));
   }
 }
});

test('Classic fight now uses random generated CPU decks while the existing loaner practice remains',()=>{
 const src=ui();
 assert.match(src,/classicOpponents\.generate\(/);
 assert.match(src,/currentClassicOpponent/);
 assert.match(src,/RANDOM OPPONENT|RANDOM TYPE/i);
 assert.match(src,/classic-practice/);
 assert.match(src,/classicDecks\.LOANER_DECK/);
});

test('Pokémon Trader displays the correct exchange order and reveal/shuffle instructions',()=>{
 const card=C.cardById('base1-77');
 assert.match(card.text,/trade|exchange/i);
 assert.match(card.text,/from your hand/i);
 assert.match(card.text,/from your deck/i);
 assert.match(card.text,/show both|reveal both/i);
 assert.match(card.text,/shuffle your deck afterward/i);
 const rendered=require(path.join(assets,'tcgp-battle-ui.js')).cardRulesHtml(card);
 assert.match(rendered,/show both|reveal both/i);
});

test('Pokémon Trader swaps two chosen Pokémon and reveals both before shuffling',()=>{
 const state=core.createBattle({format:'classic',playerDeck:K.LOANER_DECK.slice(),opponentDeck:K.LOANER_DECK.slice(),playerEnergyTypes:['Fighting'],opponentEnergyTypes:['Fighting'],firstSide:'player',seed:772});
 state.phase='battle';state.activeSide='player';state.turnNumber=3;state.sides.player.turnCount=2;
 for(const side of ['player','opponent']){
   state.sides[side].active=core.makePokemonSlot('base1-7',0,side+'-act');
   state.sides[side].bench=[core.makePokemonSlot('base1-26',0,side+'-bench')];
 }
 const p=state.sides.player;
 p.hand=[{uid:'trainer',cardId:'base1-77'},{uid:'out',cardId:'base1-26'}];
 p.deck=[{uid:'incoming',cardId:'base1-52'},{uid:'nonpokemon',cardId:'base1-96'}];
 const play=core.legalActions(state,'player').find(a=>a.type==='trainer'&&a.cardId==='base1-77');assert.ok(play);core.applyAction(state,'player',play);
 const pickHand=core.legalActions(state,'player').find(a=>a.choiceCardId==='base1-26');assert.ok(pickHand);core.applyAction(state,'player',pickHand);
 const pickDeck=core.legalActions(state,'player').find(a=>a.choiceCardId==='base1-52');assert.ok(pickDeck);core.applyAction(state,'player',pickDeck);
 assert.ok(p.hand.some(r=>r.cardId==='base1-52'));
 assert.ok(p.deck.some(r=>r.cardId==='base1-26'));
 assert.ok(!p.deck.some(r=>r.cardId==='base1-52'));
 assert.ok(state.log.some(l=>l.type==='pokemonTraderReveal'&&l.fromHand==='base1-26'&&l.fromDeck==='base1-52'),'both exchanged Pokémon must be revealed');
});

test('the Classic auto builder exposes an explicit random type option independent of Random/Competitive style',()=>{
 const src=fs.readFileSync(path.join(assets,'tcg-classic-deck-editor.js'),'utf8');
 assert.match(src,/Random type/);
 assert.match(src,/auto-random-type/);
 assert.match(src,/randomType/);
 const chooser=require(path.join(assets,'tcg-classic-opponents.js'));
 const seen=[];
 for(let i=0;i<K.ENERGY_TYPES.length;i++){const type=chooser.pickType({seed:i+102,excludeTypes:seen});assert.ok(!seen.includes(type));seen.push(type);}
 assert.equal(chooser.pickType({seed:301,excludeTypes:seen})!=null,true);
});

test('CPU does not loop an unlimited Base Set Pokémon Power within a single turn',()=>{
 const ai=require(path.join(assets,'tcgp-battle-ai.js'));
 const state=core.createBattle({format:'classic',playerDeck:K.LOANER_DECK.slice(),opponentDeck:K.LOANER_DECK.slice(),playerEnergyTypes:['Grass','Fire'],opponentEnergyTypes:['Grass'],firstSide:'opponent',seed:529});
 state.phase='battle';state.activeSide='opponent';state.turnNumber=5;
 const ss=state.sides.opponent;ss.turnCount=3;ss.active=core.makePokemonSlot('base1-15',0,'venusaur-test');ss.active.energy={Grass:2};ss.bench=[core.makePokemonSlot('base1-44',0,'bulbasaur-test')];ss.bench[0].benchSlot=0;
 const before=core.legalActions(state,'opponent').find(a=>a.type==='ability');assert.ok(before,'player rules still allow Energy Trans');
 ss.abilityUsed[ss.active.uid+':0']=ss.turnCount;
 const next=ai.chooseAction(state,'opponent','Beginner',1);
 assert.notEqual(next.type,'ability','AI must not choose the same power over and over in the same turn');
 assert.ok(core.legalActions(state,'opponent').some(a=>a.type==='ability'),'human ability remains repeatable');
 state.phase='effectChoice';state.choiceSide='opponent';state.pendingChoice={kind:'option',side:'opponent',originSide:'opponent',effect:{type:'redistributeEnergy',phase:'continue'},options:['Move another Energy','Done'],sourceUid:ss.active.uid};
 const done=ai.chooseAction(state,'opponent','Beginner',2);
 assert.equal(done.choiceLabel,'Done','AI must finish the Energy Trans exchange');
});

test('six seeded CPU archetypes can play through full Classic matches without an effect-choice deadlock',()=>{
 const ai=require(path.join(assets,'tcgp-battle-ai.js'));
 for(const type of K.ENERGY_TYPES){
  const opponent=opponentForType(type);
  const s=core.createBattle({format:'classic',playerDeck:K.LOANER_DECK.slice(),opponentDeck:opponent.cards,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:opponent.energyTypes,firstSide:'opponent',seed:1732});
  let steps=0;
  while(s.phase!=='finished'&&steps<700){
   const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
   const action=ai.chooseAction(s,side,'Beginner',steps);assert.ok(action,`${type}: no AI action at step ${steps}`);
   core.applyAction(s,side,action);steps++;
  }
  assert.equal(s.phase,'finished',`${type} battle got stuck at turn ${s.turnNumber} in ${s.phase}`);
 }
 function opponentForType(type){const x=opponent(19302,K.ENERGY_TYPES.filter(t=>t!==type));assert.ok(x.ok);return x;}
});
