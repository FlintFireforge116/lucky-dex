'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Base=require('../app/src/main/assets/arcade-fishing-core.js');
const Art=require('../app/src/main/assets/arcade-fishing-item-art.js');
const Species=require('../app/src/main/assets/adventure/adventure-species.js');
function el(id=''){const listeners={},styleValues={};return{id,dataset:{},hidden:false,textContent:'',innerHTML:'',value:'',disabled:false,style:{top:'',height:'',width:'',backgroundImage:'',setProperty(k,v){styleValues[k]=v},removeProperty(k){delete styleValues[k]}},styleValues,classList:{toggle(){},add(){},remove(){}},addEventListener(type,fn){listeners[type]=fn},removeEventListener(){},listeners,setAttribute(){}};}
function clickTarget(id,map){return{closest(sel){return sel===`#${id}`?map[id]:null}};}
function setup(catchRow){
 const ids=['fishingGame','fishingLuckyCoins','fishingTokens','fishingFishView','fishingBook','fishingShop','fishingSetupView','fishingPlayView','fishingRegion','fishingArea','fishingRod','fishingBait','fishingAreaMeta','fishingStartBtn','fishingPlayScene','fishingPlayRegion','fishingPlayArea','fishingPlayGear','fishingChangeSpotBtn','fishingMessage','fishingResultOverlay','fishingResult','fishingResultActions','fishingResultContinueBtn','fishingShopWallet','fishingBookGrid','fishingShopGrid','fishingFishTarget','fishingCatchZone','fishingProgressFill','fishingActionBtn','fishingBookSearch','fishingBookRegion','fishingBookCategory','fishingBookStatus','fishingBookSort'];
 const map=Object.fromEntries(ids.map(id=>[id,el(id)]));map.fishingResultOverlay.hidden=true;map.fishingResultActions.hidden=true;
 global.window=global;global.document={body:{classList:{add(){},remove(){}}},getElementById:id=>map[id]||null,querySelectorAll:()=>[]};global.performance={now:()=>0};let rafCb=null;global.requestAnimationFrame=fn=>{rafCb=fn;return 1};global.cancelAnimationFrame=()=>{};
 global.LuckyDexFishingItemArt=Art;global.LuckyDexFishingCore={...Base,rollCatch:()=>catchRow,stepFight(run){run.phase='caught';return run;}};global.LuckyDexAdventureSpecies=Species;global.state={profile:{coins:0,dust:0,tickets:0},settings:{rareOdds:{}},arcade:{}};global.save=()=>{};
 delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];require('../app/src/main/assets/arcade-fishing.js');global.LuckyDexFishing.open();
 return{map,getRaf:()=>rafCb};
}

test('hooked junk uses its own silhouette art and result popup reveals the same item art',async()=>{
 const junk={...Base.JUNK.find(x=>x.id==='rotten-leftovers'),kind:'junk',difficulty:.14};const {map,getRaf}=setup(junk);
 map.fishingGame.listeners.click({target:clickTarget('fishingStartBtn',map)});map.fishingGame.listeners.click({target:clickTarget('fishingActionBtn',map)});
 assert.match(map.fishingFishTarget.style.backgroundImage,/leftovers\.png/,'hooked target gets the real Leftovers item sprite');
 assert.match(map.fishingMessage.textContent,/Rotten Leftovers/,'non-Pokemon catch may reveal its identity before landing');
 getRaf()(16);await Promise.resolve();
 assert.equal(map.fishingResultOverlay.hidden,false);assert.match(map.fishingResult.innerHTML,/fishing-result-item-art/);assert.match(map.fishingResult.innerHTML,/leftovers\.png/);assert.doesNotMatch(map.fishingResult.innerHTML,/🧰|🎁/);global.LuckyDexFishing.close();
});

test('hooked treasure uses its own silhouette art',()=>{
 const treasure={...Base.TREASURE.find(x=>x.id==='sealed-pack'),kind:'treasure',difficulty:.2};const {map}=setup(treasure);
 map.fishingGame.listeners.click({target:clickTarget('fishingStartBtn',map)});map.fishingGame.listeners.click({target:clickTarget('fishingActionBtn',map)});
 assert.match(map.fishingFishTarget.style.backgroundImage,/booster-mini-v0266\/base1\.webp/);assert.match(map.fishingMessage.textContent,/Sealed Booster/);global.LuckyDexFishing.close();
});
