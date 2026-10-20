'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
function el(id=''){const listeners={},styles={};return{id,dataset:{},hidden:false,textContent:'',innerHTML:'',value:'',disabled:false,style:{setProperty(k,v){styles[k]=v}},styles,classList:{toggle(){},add(){},remove(){}},addEventListener(t,f){listeners[t]=f},removeEventListener(){},listeners};}
function target(data={}){return{closest(sel){if(sel==='[data-fishing-region]'&&data.region)return{dataset:{fishingRegion:data.region}};if(sel==='[data-fishing-area]'&&data.area)return{dataset:{fishingArea:data.area}};return null;}};}
function setup(){const ids=['fishingGame','fishingFishView','fishingBook','fishingShop','fishingSetupView','fishingPlayView','fishingRegionProgress','fishingSpotProgress','fishingRod','fishingBait','fishingAreaMeta','fishingStartBtn','fishingPlayScene','fishingPlayRegion','fishingPlayArea','fishingPlayGear','fishingChangeSpotBtn','fishingMessage','fishingResult','fishingResultOverlay','fishingResultActions','fishingActionBtn','fishingFishTarget','fishingCatchZone','fishingProgressFill','fishingLuckyCoins','fishingTokens','fishingBookSearch','fishingBookRegion','fishingBookCategory','fishingBookStatus','fishingBookSort','fishingBookGrid','fishingShopGrid','fishingShopWallet'];const map=Object.fromEntries(ids.map(id=>[id,el(id)]));global.window=global;global.document={body:{classList:{add(){},remove(){}}},getElementById:id=>map[id]||null,querySelectorAll:()=>[]};global.performance={now:()=>0};global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};global.LuckyDexFishingLocations=require('../app/src/main/assets/arcade-fishing-locations.js');global.LuckyDexFishingCore=require('../app/src/main/assets/arcade-fishing-core.js');global.LuckyDexAdventureSpecies=require('../app/src/main/assets/adventure/adventure-species.js');global.state={profile:{coins:0},settings:{rareOdds:{}},arcade:{}};global.save=()=>{};delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];require('../app/src/main/assets/arcade-fishing.js');global.LuckyDexFishing.open();return map;}

test('locked region/spot actions are rejected until progression unlocks them',()=>{
 const map=setup(),Core=global.LuckyDexFishingCore,cat=Core.buildCatalog(global.LuckyDexAdventureSpecies.byId),first=cat.regions.kanto.areas[0],second=cat.regions.kanto.areas[1];
 assert.match(map.fishingRegionProgress.innerHTML,/Kanto/);assert.match(map.fishingRegionProgress.innerHTML,/Johto/);assert.match(map.fishingSpotProgress.innerHTML,/Cerulean Waters/);
 map.fishingGame.listeners.click({target:target({area:second.id})});assert.equal(Core.ensureState(global.state).selectedArea,first.id);
 map.fishingGame.listeners.click({target:target({region:'johto'})});assert.equal(Core.ensureState(global.state).selectedRegion,'kanto');
 for(const id of first.pool.slice(0,3).map(x=>x.speciesId))Core.recordProgressionCatch(global.state,cat,first,id);
 global.LuckyDexFishing.render();assert.match(map.fishingSpotProgress.innerHTML,new RegExp(second.name));const secondButton=map.fishingSpotProgress.innerHTML.match(new RegExp(`<button[^>]*data-fishing-area=\"${second.id}\"[^>]*>`))?.[0]||'';assert.doesNotMatch(secondButton,/disabled/);
 map.fishingGame.listeners.click({target:target({area:second.id})});assert.equal(Core.ensureState(global.state).selectedArea,second.id);
 global.LuckyDexFishing.close();
});

test('setup reports rod-accessible count without exposing locked species names',()=>{
 const map=setup(),Core=global.LuckyDexFishingCore,s=Core.ensureState(global.state);s.rods.super=true;s.selectedRod='old';global.LuckyDexFishing.render();const oldMeta=map.fishingAreaMeta.textContent;s.selectedRod='super';global.LuckyDexFishing.render();const superMeta=map.fishingAreaMeta.textContent;
 const oldCount=Number(oldMeta.match(/(\d+) reachable/)?.[1]),superCount=Number(superMeta.match(/(\d+) reachable/)?.[1]);assert.ok(superCount>oldCount,`${oldCount} -> ${superCount}`);assert.doesNotMatch(map.fishingRegionProgress.innerHTML,/Chinchou|Totodile|Suicune/i);global.LuckyDexFishing.close();
});
