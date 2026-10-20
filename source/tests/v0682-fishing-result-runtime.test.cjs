'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Base=require('../app/src/main/assets/arcade-fishing-core.js');
const Species=require('../app/src/main/assets/adventure/adventure-species.js');
function el(id=''){const listeners={},styleValues={};return{id,dataset:{},hidden:false,textContent:'',innerHTML:'',value:'',disabled:false,style:{top:'',height:'',width:'',backgroundImage:'',setProperty(k,v){styleValues[k]=v},removeProperty(k){delete styleValues[k]}},styleValues,classList:{toggle(){},add(){},remove(){}},addEventListener(type,fn){listeners[type]=fn},removeEventListener(){},listeners};}
function clickTarget(id,map){return{closest(sel){return sel===`#${id}`?map[id]:null}};}

test('landing a Pokemon reveals it only in an input-blocking result modal',async()=>{
 const ids=['fishingGame','fishingLuckyCoins','fishingTokens','fishingFishView','fishingBook','fishingShop','fishingSetupView','fishingPlayView','fishingRegion','fishingArea','fishingRod','fishingBait','fishingAreaMeta','fishingStartBtn','fishingPlayScene','fishingPlayRegion','fishingPlayArea','fishingPlayGear','fishingChangeSpotBtn','fishingMessage','fishingResultOverlay','fishingResult','fishingResultActions','fishingResultContinueBtn','fishingShopWallet','fishingBookGrid','fishingShopGrid','fishingFishTarget','fishingCatchZone','fishingProgressFill','fishingActionBtn','fishingBookSearch','fishingBookRegion','fishingBookCategory','fishingBookStatus','fishingBookSort'];
 const map=Object.fromEntries(ids.map(id=>[id,el(id)]));map.fishingResultOverlay.hidden=true;map.fishingResultActions.hidden=true;
 global.window=global;global.document={body:{classList:{add(){},remove(){}}},getElementById:id=>map[id]||null,querySelectorAll:()=>[]};global.performance={now:()=>0};
 let rafCb=null;global.requestAnimationFrame=fn=>{rafCb=fn;return 1};global.cancelAnimationFrame=()=>{};global.setTimeout=(fn)=>{fn();return 1};global.clearTimeout=()=>{};
 global.LuckyDexFishingCore={...Base,rollCatch:()=>Base.createCatch({species:Species.byId[72],rolls:{size:.5},rod:'old'})};global.LuckyDexAdventureSpecies=Species;global.state={profile:{coins:0,dust:0,tickets:0},settings:{rareOdds:{}},arcade:{}};global.save=()=>{};
 delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];require('../app/src/main/assets/arcade-fishing.js');global.LuckyDexFishing.open();
 map.fishingGame.listeners.click({target:clickTarget('fishingStartBtn',map)});map.fishingGame.listeners.click({target:clickTarget('fishingActionBtn',map)});
 assert.equal(map.fishingFishTarget.textContent,'');assert.equal(map.fishingResultOverlay.hidden,true);assert.doesNotMatch(map.fishingMessage.textContent,/Tentacool/);
 let holding=false,ts=0;
 for(let i=0;i<5000&&map.fishingResultOverlay.hidden;i++){
   const fish=parseFloat(map.fishingFishTarget.style.top)||50,zone=parseFloat(map.fishingCatchZone.style.top)||50,wantHold=zone>fish;
   if(wantHold!==holding){holding=wantHold;(holding?map.fishingActionBtn.listeners.pointerdown:map.fishingActionBtn.listeners.pointerup)?.({target:map.fishingActionBtn,preventDefault(){}});}
   ts+=16;const cb=rafCb;assert.equal(typeof cb,'function');cb(ts);await Promise.resolve();
 }
 assert.equal(map.fishingResultOverlay.hidden,false,'successful catch opens modal');assert.match(map.fishingResult.innerHTML,/Tentacool/,'Pokemon is revealed after landing');assert.equal(map.fishingActionBtn.disabled,true,'cast/reel button is blocked behind modal');assert.equal(map.fishingResultActions.hidden,false,'KEEP FISHING is immediately available in the separate popup');
 assert.equal(global.state.stats?.arcadeCoins,global.state.profile.coins,'Fishing Lucky Coins count toward the shared Arcade earnings stat');
 global.LuckyDexFishing.close();
});
