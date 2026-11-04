'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const path=require('node:path'),assets=path.resolve(__dirname,'../app/src/main/assets');
const C=require(path.join(assets,'tcgp-battle-core.js')),AI=require(path.join(assets,'tcgp-battle-ai.js'));
const D=require(path.join(assets,'tcg-classic-battle-data.js')),O=require(path.join(assets,'tcg-classic-opponents.js')),B=require(path.join(assets,'tcg-classic-deck-builder.js'));
const inventory=D.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
test('Gym Heroes-only and mixed Gym Hero CPU decks complete battles without loops or invalid actions',()=>{
 for(let seed=8101;seed<8113;seed++){
  const opp=O.generate({seed,type:seed%3===0?undefined:['Grass','Water','Psychic','Fire','Fighting','Colorless'][seed%6],sets:seed%3===0?['gym1']:['gym1','base1']});assert.ok(opp.ok,`CPU ${seed}: ${opp.error}`);
  const own=B.buildDeck(inventory,{style:'random',sets:seed%2===0?['gym1']:['gym1','base1'],randomSeed:seed+50});assert.ok(own.ok,`Player ${seed}: ${own.errors?.join(';')}`);
  const s=C.createBattle({format:'classic',playerDeck:own.cards,opponentDeck:opp.cards,playerEnergyTypes:own.energyTypes,opponentEnergyTypes:opp.energyTypes,seed,firstSide:seed%2===0?'player':'opponent'});
  let n=0;
  for(;s.phase!=='finished'&&n<1900;n++){
   const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
   const action=AI.chooseAction(s,side,'Beginner',n);assert.ok(action,`No AI action seed ${seed} phase ${s.phase} at ${n}, recent=${JSON.stringify(s.log.slice(-3))}`);
   C.applyAction(s,side,action);
  }
  assert.equal(s.phase,'finished',`Gym opponent seed ${seed}, last=${JSON.stringify(s.log.slice(-3))}`);
 }
});
