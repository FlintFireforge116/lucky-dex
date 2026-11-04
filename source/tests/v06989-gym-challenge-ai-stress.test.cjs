'use strict';const {test}=require('node:test'),assert=require('node:assert/strict');const path=require('path');const a=path.resolve(__dirname,'../app/src/main/assets'),G=require(a+'/tcg-classic-gym-challenge.js'),C=require(a+'/tcgp-battle-core.js'),A=require(a+'/tcgp-battle-ai.js'),O=require(a+'/tcg-classic-opponents.js'),D=require(a+'/tcg-classic-decks.js');
test('Gym Challenge CPU matches handle effect choices across archetypes and seeds',()=>{
 const fails=[];let finished=0;
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless'])for(const seed of [9901,9903,9907,9911,9913]){
  try{const p=O.generate({seed,sets:['gym2'],type,includeColorless:true});assert.ok(p.ok,p.error);const s=C.createBattle({format:'classic',playerDeck:p.cards,opponentDeck:p.cards,playerEnergyTypes:p.energyTypes,opponentEnergyTypes:p.energyTypes,seed,firstSide:'player'});
   for(let count=0;count<1500&&s.phase!=='finished';count++){let side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const actions=C.legalActions(s,side),move=A.chooseAction(s,side,'Advanced',count);if(!move)throw Error('No move: phase='+s.phase+' side='+side+' pending='+JSON.stringify(s.pendingChoice)+' legal='+JSON.stringify(actions));C.applyAction(s,side,move);}
   assert.equal(s.phase,'finished','match did not finish');finished++;
  }catch(e){fails.push(`${type} seed ${seed}: ${e.stack||e.message}`)}
 }
 assert.deepEqual(fails,[],fails.join('\n'));assert.equal(finished,35);
});
