'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const modPath=path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js');
delete require.cache[modPath];

global.LuckyDexArcadePlatform={awardRun:({coins})=>({coinsAwarded:coins,itemAwarded:null})};
global.LuckyDexArcadeSession={update:()=>{},hideResult:()=>{},showResult:()=>true};
global.LuckyDexFossilMuseumBridge={
  resolveBuriedCard:async()=>({card:{id:'card-1',name:'Testmon ex',image:'cards/testmon.png',rarity:'Rare'},set:{id:'set-1',name:'Test Set'}}),
  resolveBuriedBooster:async()=>({set:{id:'set-b',name:'Booster Set'},boosterArt:'boosters/test.png'}),
  grantCard:(card,set)=>({...card,setName:set.name}),
  grantBooster:()=>1
};
global.state={arcade:{bestBallDrop:0,ballDropJackpots:0}};
global.save=()=>{};
const b=require(modPath);

(async()=>{
  assert.equal(b.BOARD_CONFIG.pegRows,11,'v0.27.4 should shorten Ball Drop to 11 peg rows');
  assert.ok(b.BOARD_CONFIG.height<1140,'11-row board should be physically shorter, not merely CSS-scaled');

  const model=b.createRun();
  model.pegField=b.createPegField(()=>0.42);
  b.prepareTurn(model,()=>0.12);
  const boardRef=model.prizeBoard;
  const snapshot=boardRef.map(p=>({type:p.type,amount:p.amount,label:p.label}));
  b.prepareTurn(model,()=>0.91);
  assert.equal(model.prizeBoard,boardRef,'prize board should persist between manual balls');
  assert.deepEqual(model.prizeBoard.map(p=>({type:p.type,amount:p.amount,label:p.label})),snapshot,'untouched prize slots must not reroll between balls');

  const neighbor=model.prizeBoard[1];
  const before=model.prizeBoard[2];
  const replacement=b.refreshPrizeSlot(model,2,()=>0.73);
  assert.notEqual(model.prizeBoard[2],before,'won slot should receive a new prize object');
  assert.equal(model.prizeBoard[1],neighbor,'refreshing a won slot must leave neighboring rewards untouched');
  assert.equal(replacement,model.prizeBoard[2],'refresh helper should return the replacement prize');
  assert.equal(b.refreshPrizeSlot(model,3,()=>0.99).type,'mystery','centre slot should remain a Mystery target when won and refreshed');

  model.prizeBoard[0]={type:'card',label:'CARD'};
  await b.hydratePrizeForSlot(model,0);
  assert.equal(model.prizeBoard[0].artUrl,'cards/testmon.png','Card target should preload its real card art');
  assert.equal(model.prizeBoard[0].resolvedCard.card.name,'Testmon ex','Card target should keep the exact resolved card until it is won');

  console.log('PASS v0.27.4 Ball Drop 11-row persistent reward board + Card target hydration');
})().catch(err=>{console.error(err);process.exit(1);});
