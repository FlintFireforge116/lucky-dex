'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Base=require('../app/src/main/assets/arcade-fishing-core.js');
const Species=require('../app/src/main/assets/adventure/adventure-species.js');
function el(id=''){const listeners={},styleValues={};return{id,dataset:{},hidden:false,textContent:'',innerHTML:'',value:'',disabled:false,style:{top:'',height:'',width:'',backgroundImage:'',setProperty(k,v){styleValues[k]=v},removeProperty(k){delete styleValues[k]}},styleValues,classList:{toggle(){},add(){},remove(){}},addEventListener(type,fn){listeners[type]=fn},removeEventListener(){},listeners};}
function clickTarget(id,map){return{closest(sel){return sel===`#${id}`?map[id]:null}};}
function setup(overrides={}){
 const ids=['fishingGame','fishingLuckyCoins','fishingTokens','fishingFishView','fishingBook','fishingShop','fishingSetupView','fishingPlayView','fishingRegion','fishingArea','fishingRod','fishingBait','fishingAreaMeta','fishingStartBtn','fishingPlayScene','fishingPlayRegion','fishingPlayArea','fishingPlayGear','fishingChangeSpotBtn','fishingMessage','fishingResultOverlay','fishingResult','fishingResultActions','fishingResultContinueBtn','fishingShopWallet','fishingBookGrid','fishingShopGrid','fishingFishTarget','fishingCatchZone','fishingProgressFill','fishingActionBtn','fishingBookSearch','fishingBookRegion','fishingBookCategory','fishingBookStatus','fishingBookSort'];
 const map=Object.fromEntries(ids.map(id=>[id,el(id)]));map.fishingResultOverlay.hidden=true;map.fishingResultActions.hidden=true;
 global.window=global;global.document={body:{classList:{add(){},remove(){}}},getElementById:id=>map[id]||null,querySelectorAll:()=>[]};global.performance={now:()=>0};let rafCb=null;global.requestAnimationFrame=fn=>{rafCb=fn;return 1};global.cancelAnimationFrame=()=>{};
 global.LuckyDexFishingCore={...Base,...overrides};global.LuckyDexAdventureSpecies=Species;global.state={profile:{coins:0,dust:0,tickets:0},settings:{rareOdds:{}},arcade:{}};global.save=()=>{};
 delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];require('../app/src/main/assets/arcade-fishing.js');global.LuckyDexFishing.open();
 return{map,getRaf:()=>rafCb};
}

test('landed Pokemon actually credits and renders Fishing Tokens in the wallet',async()=>{
 const fixed=Base.createCatch({species:Species.byId[129],rolls:{size:.5},rod:'old'}),{map,getRaf}=setup({rollCatch:()=>fixed});
 map.fishingGame.listeners.click({target:clickTarget('fishingStartBtn',map)});map.fishingGame.listeners.click({target:clickTarget('fishingActionBtn',map)});
 let ts=0,holding=false;for(let i=0;i<5000&&map.fishingResultOverlay.hidden;i++){const fish=parseFloat(map.fishingFishTarget.style.top)||50,zone=parseFloat(map.fishingCatchZone.style.top)||50,want=zone>fish;if(want!==holding){holding=want;(want?map.fishingActionBtn.listeners.pointerdown:map.fishingActionBtn.listeners.pointerup)?.({target:map.fishingActionBtn,preventDefault(){}});}ts+=16;getRaf()(ts);await Promise.resolve();}
 const payout=Base.catchPayout(fixed);assert.equal(global.state.arcade.fishing.fishingTokens,payout.fishingTokens,'saved wallet gets credited');assert.match(map.fishingTokens.textContent,new RegExp(String(payout.fishingTokens)),'visible wallet refreshes with credited tokens');assert.equal(map.fishingResultActions.hidden,false,'KEEP FISHING is available immediately in the separate popup');global.LuckyDexFishing.close();
});

test('escaped catch opens the same blocking popup with KEEP FISHING',async()=>{
 const fixed=Base.createCatch({species:Species.byId[129],rolls:{size:.5},rod:'old'}),{map,getRaf}=setup({rollCatch:()=>fixed,stepFight(run){run.phase='escaped';return run;}});
 map.fishingGame.listeners.click({target:clickTarget('fishingStartBtn',map)});map.fishingGame.listeners.click({target:clickTarget('fishingActionBtn',map)});getRaf()(16);await Promise.resolve();
 assert.equal(map.fishingResultOverlay.hidden,false,'escape opens result overlay');assert.match(map.fishingResult.innerHTML,/got away/i);assert.equal(map.fishingResultActions.hidden,false,'KEEP FISHING is immediately available');assert.equal(map.fishingActionBtn.disabled,true,'underlying cast button stays blocked');global.LuckyDexFishing.close();
});
