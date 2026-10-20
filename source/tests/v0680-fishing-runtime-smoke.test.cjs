'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
function el(id=''){const listeners={};return{id,dataset:{},hidden:false,textContent:'',innerHTML:'',value:'',disabled:false,style:{setProperty(){},removeProperty(){}},classList:{toggle(){},add(){},remove(){}},addEventListener(type,fn){listeners[type]=fn},removeEventListener(){},listeners};}
test('Fishing Arcade screen opens against the normal global save bridge without throwing',()=>{
 const ids=['fishingGame','fishingWallet','fishingFishView','fishingBook','fishingShop','fishingRegion','fishingArea','fishingRod','fishingBait','fishingAreaMeta','fishingMessage','fishingResult','fishingShopWallet','fishingBookGrid','fishingShopGrid','fishingFishTarget','fishingCatchZone','fishingProgressFill','fishingReelBtn','fishingCastBtn'];const map=Object.fromEntries(ids.map(id=>[id,el(id)]));
 global.window=global;global.document={getElementById:id=>map[id]||null,querySelectorAll:()=>[]};global.performance={now:()=>0};global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};
 global.LuckyDexFishingCore=require('../app/src/main/assets/arcade-fishing-core.js');global.LuckyDexAdventureSpecies=require('../app/src/main/assets/adventure/adventure-species.js');global.state={profile:{coins:2500,dust:0,tickets:0},settings:{rareOdds:{}},arcade:{}};let saved=0;global.save=()=>saved++;
 delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];require('../app/src/main/assets/arcade-fishing.js');
 assert.equal(typeof global.LuckyDexFishing.open,'function');assert.doesNotThrow(()=>global.LuckyDexFishing.open());assert.equal(map.fishingGame.dataset.wired,'1');assert.match(map.fishingRegion.innerHTML,/Kanto/);assert.match(map.fishingArea.innerHTML,/Cerulean Waters/);assert.match(map.fishingRod.innerHTML,/Old Rod/);assert.ok(global.state.arcade.fishing.rods.old);assert.ok(saved>=1);
 global.LuckyDexFishing.close();
});
