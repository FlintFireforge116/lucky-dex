'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
function el(id=''){const listeners={},styleValues={};return{id,dataset:{},hidden:false,textContent:'',innerHTML:'',value:'',disabled:false,style:{setProperty(k,v){styleValues[k]=v},removeProperty(k){delete styleValues[k]}},styleValues,classList:{toggle(){},add(){},remove(){}},addEventListener(type,fn){listeners[type]=fn},removeEventListener(){},listeners};}
function clickTarget(id,map){return{closest(sel){return sel===`#${id}`?map[id]:null}};}

test('Fishing setup enters a focused play view and the single action button changes from CAST to REEL',async()=>{
 const ids=['fishingGame','fishingWallet','fishingFishView','fishingBook','fishingShop','fishingSetupView','fishingPlayView','fishingRegion','fishingArea','fishingRod','fishingBait','fishingAreaMeta','fishingStartBtn','fishingPlayScene','fishingPlayRegion','fishingPlayArea','fishingPlayGear','fishingChangeSpotBtn','fishingMessage','fishingResult','fishingShopWallet','fishingBookGrid','fishingShopGrid','fishingFishTarget','fishingCatchZone','fishingProgressFill','fishingActionBtn','fishingBookSearch','fishingBookRegion','fishingBookCategory','fishingBookStatus','fishingBookSort'];
 const map=Object.fromEntries(ids.map(id=>[id,el(id)]));
 global.window=global;global.document={getElementById:id=>map[id]||null,querySelectorAll:()=>[]};global.performance={now:()=>0};global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};
 global.LuckyDexFishingCore=require('../app/src/main/assets/arcade-fishing-core.js');global.LuckyDexAdventureSpecies=require('../app/src/main/assets/adventure/adventure-species.js');global.state={profile:{coins:2500,dust:0,tickets:0},settings:{rareOdds:{}},arcade:{}};global.save=()=>{};
 delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];require('../app/src/main/assets/arcade-fishing.js');global.LuckyDexFishing.open();
 assert.equal(map.fishingSetupView.hidden,false);assert.equal(map.fishingPlayView.hidden,true);
 map.fishingGame.listeners.click({target:clickTarget('fishingStartBtn',map)});
 await new Promise(r=>setTimeout(r,1950));
 assert.equal(map.fishingSetupView.hidden,true);assert.equal(map.fishingPlayView.hidden,false);assert.match(map.fishingPlayScene.styleValues['--fishing-bg'],/url\('/);assert.equal(map.fishingActionBtn.textContent,'CAST LINE');
 map.fishingGame.listeners.click({target:clickTarget('fishingActionBtn',map)});
 assert.equal(map.fishingActionBtn.textContent,'HOLD TO REEL');assert.match(map.fishingMessage.textContent,/line|zone/i);assert.ok(map.fishingProgressFill.style.height);
 global.LuckyDexFishing.close();
});
