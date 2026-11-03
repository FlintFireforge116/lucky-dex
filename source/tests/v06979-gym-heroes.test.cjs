'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const a=path.resolve(__dirname,'../app/src/main/assets');const src=n=>fs.readFileSync(path.join(a,n),'utf8');
const read=n=>require(path.join(a,n));
test('Gym Heroes catalogue has 132 distinct original print IDs, named Gym evolution lines and auditable battle readiness',()=>{
 const gym=read('tcg-classic-gym-heroes.js');
 assert.equal(gym.CARDS.length,132);assert.equal(new Set(gym.CARDS.map(c=>c.id)).size,132);
 assert.equal(gym.cardById('gym1-1').name,"Blaine's Moltres");
 assert.equal(gym.cardById('gym1-56').evolvesFrom,"Misty's Staryu");
 assert.equal(gym.cardById('gym1-127').basicEnergy,true);
 for(const c of gym.CARDS){assert.equal(c.setId,'gym1');assert.equal(c.source,'tcg');assert.ok(c.image.includes('/gym1/'));assert.ok(c.support);if(!c.battleEnabled)assert.ok(c.support.reasons.length,c.id);}
});
test('Classic card catalogue, physical ownership and mixed set pools include Gym Heroes',()=>{
 const D=read('tcg-classic-battle-data.js'),B=read('tcg-classic-deck-builder.js'),O=read('tcg-classic-opponents.js');
 assert.deepEqual(D.SETS.map(x=>x.id),['base1','base2','base3','base5','gym1']);
 assert.ok(B.SET_IDS.includes('gym1'));assert.ok(O.SETS.includes('gym1'));
 const c=D.projectOwnedCards([{id:'GH-56',setId:'library:GH',setName:'Gym Heroes',setTotal:132,source:'tcg',count:3}]).find(c=>c.gameplayId==='gym1-56');
 assert.equal(c?.quantity,3);assert.equal(c?.card.name,"Misty's Starmie");
 const cross=D.CARDS.filter(c=>c.setId==='gym1'&&c.battleEnabled);assert.ok(cross.length>=20,'first playable Gym Heroes batch');
 const pool=[...D.CARDS].filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 const built=B.buildDeck(pool,{style:'competitive',sets:['gym1'],types:['Water'],randomSeed:101});
 assert.equal(built.ok,true,built.errors?.join('; '));assert.ok(built.cards.every(id=>D.cardById(id)?.setId==='gym1'));
 assert.equal(D.validateDeck(built.cards).ok,true);
 const enemy=O.generate({seed:48,type:'Water',sets:['gym1']});assert.equal(enemy.ok,true,enemy.error);assert.ok(enemy.cards.every(id=>D.cardById(id).setId==='gym1'));
});
test('Gym Heroes is visible as set option in Auto Builder, card filter and CPU opponent selector',()=>{
 assert.match(src('tcg-classic-deck-editor.js'),/value:'gym1',label:'Gym Heroes'/);
 assert.match(src('tcgp-battle-ui.js'),/id==='gym1'\?'Gym Heroes'/);
 assert.match(src('index.html'),/tcg-classic-gym-heroes\.js/);
});
test('Gym Heroes does not enable printed attacks and powers without implemented effects',()=>{
 const G=read('tcg-classic-gym-heroes.js');
 assert.equal(G.cardById('gym1-2').battleEnabled,false,'Brock Rhydon needs Bench Guard');
 assert.equal(G.cardById('gym1-14').battleEnabled,false,'Sabrina Gengar requires tricky effects');
 assert.equal(G.cardById('gym1-89').battleEnabled,true,'Misty Shellder has ordinary coin-gated attack');
 assert.equal(G.cardById('gym1-127').deckEligible,false,'basic Energy supplied by zone');
});
test('Gym Heroes attacks and Trainers use executable printed-rule effects, and names cannot cross-evolve',()=>{
 const D=read('tcg-classic-battle-data.js'),B=read('tcg-classic-deck-builder.js'),FX=read('tcgp-battle-effects.js');
 for(const c of D.CARDS.filter(c=>c.setId==='gym1'&&c.battleEnabled)){
  for(const a of c.attacks||[])if(a.effect)assert.equal(FX.supportsEffect(a.effect),true,`${c.id} ${a.name}`);
  if(c.kind==='trainer')assert.equal(FX.supportsEffect(c.effect),true,c.name);
 }
 assert.deepEqual(B.familyLine(D.cardById('gym1-56'),D.CARDS.filter(c=>c.battleEnabled)).map(c=>c.name),["Misty's Staryu","Misty's Starmie"]);
 assert.deepEqual(B.familyLine(D.cardById('gym1-58'),D.CARDS.filter(c=>c.battleEnabled)).map(c=>c.name),["Sabrina's Gastly","Sabrina's Haunter"]);
 assert.equal(D.cardById('gym1-14').evolvesFrom,"Sabrina's Haunter");
 assert.ok(!B.familyLine(D.cardById('gym1-56'),D.CARDS.filter(c=>c.setId==='base1')).length);
 assert.equal(D.cardById('gym1-90').attacks[0].effect.ignoreEffects,true,'Swift ignores Pokémon Powers and defender damage guards');
 assert.equal(D.cardById('gym1-125').effect.side,'both','Sabrina’s Gaze redraws both hands');
});
test('Misty Staryu Swift attacks through a defender guard and Sabrina Haunter counts only its own family',()=>{
 const core=read('tcgp-battle-core.js'),decks=read('tcg-classic-decks.js'),D=read('tcg-classic-battle-data.js');
 const state=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK,opponentDeck:decks.LOANER_DECK,seed:7901,playerEnergyTypes:['Water'],opponentEnergyTypes:['Fighting']});
 state.phase='battle';state.activeSide='player';state.turnNumber=8;state.sides.player.turnCount=4;
 state.sides.player.active=core.makePokemonSlot('gym1-90',0,'swift');state.sides.player.active.energy={Water:2};
 state.sides.opponent.active=core.makePokemonSlot('base1-7',0,'hitmonchan');state.sides.opponent.active.attackGuard={expiresTurn:90,effects:true};
 const action=core.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(action,'Swift must be selectable');core.applyAction(state,'player',action);
 assert.equal(state.sides.opponent.active.damage,20,'Swift ignores damage guard');
 assert.equal(D.cardById('gym1-58').attacks[0].effect.type,'coinDamageByPokemon');
 assert.deepEqual(D.cardById('gym1-58').attacks[0].effect.filter.name,["Sabrina's Gastly","Sabrina's Haunter","Sabrina's Gengar"]);
});
test('Gym Heroes-only generated opponents finish real battle sequences',()=>{
 const O=read('tcg-classic-opponents.js'),C=read('tcgp-battle-core.js'),AI=read('tcgp-battle-ai.js'),D=read('tcg-classic-decks.js');
 for(const seed of [7901,7902,7903,7904]){
  const opp=O.generate({seed,sets:['gym1'],includeColorless:true});assert.ok(opp.ok,opp.error);
  const s=C.createBattle({format:'classic',playerDeck:D.LOANER_DECK.slice(),opponentDeck:opp.cards,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:opp.energyTypes,firstSide:'opponent',seed});
  let i=0;while(s.phase!=='finished'&&i<1100){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
   const a=AI.chooseAction(s,side,'Beginner',i);assert.ok(a,`stuck: seed=${seed}, phase=${s.phase}`);C.applyAction(s,side,a);i++;}
  assert.equal(s.phase,'finished',`${opp.name} stalled after ${i} actions, phase=${s.phase}`);
 }
});
test('Gym auto builder does not add Brock-only search into non-Brock decks',()=>{
 const D=read('tcg-classic-battle-data.js'),B=read('tcg-classic-deck-builder.js');
 const owned=D.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 const water=B.buildDeck(owned,{style:'competitive',types:['Water'],sets:['gym1'],randomSeed:101});assert.ok(water.ok);
 const names=water.cards.map(id=>D.cardById(id).name);
 assert.ok(!names.includes("Brock's Training Method")||water.cards.some(id=>{const c=D.cardById(id);return c.kind==='pokemon'&&c.name.startsWith("Brock's ")}),'Brock Training Method must have Brock targets in the deck');
});
