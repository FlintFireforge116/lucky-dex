'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

function el(id=''){
  const listeners={},styleValues={};
  return{id,dataset:{},hidden:false,textContent:'',innerHTML:'',value:'',disabled:false,
    style:{setProperty(k,v){styleValues[k]=v},removeProperty(k){delete styleValues[k]}},styleValues,
    classList:{toggle(){},add(){},remove(){}},
    addEventListener(type,fn){listeners[type]=fn},removeEventListener(){},listeners};
}
function targetFor(selectorMap){return{closest(sel){return selectorMap[sel]||null}};}

function boot(){
  const ids=['fishingGame','fishingWalletStrip','fishingLuckyCoins','fishingTokens','fishingFishView','fishingBook','fishingShop','fishingSetupView','fishingPlayView','fishingRegionProgress','fishingSpotProgress','fishingRod','fishingBait','fishingAreaMeta','fishingStartBtn','fishingPlayScene','fishingPlayRegion','fishingPlayArea','fishingPlayGear','fishingPlayRod','fishingPlayBait','fishingChangeSpotBtn','fishingMessage','fishingCountdown','fishingResult','fishingResultOverlay','fishingResultActions','fishingShopWallet','fishingShopNotice','fishingBookGrid','fishingShopGrid','fishingFishTarget','fishingCatchZone','fishingProgressFill','fishingActionBtn','fishingBookSearch','fishingBookRegion','fishingBookCategory','fishingBookStatus','fishingBookSort'];
  const map=Object.fromEntries(ids.map(id=>[id,el(id)]));
  const tabs=['fish','book','shop'].map(name=>{const x=el(`tab-${name}`);x.dataset.fishingTab=name;return x;});
  global.window=global;
  global.document={body:{classList:{add(){},remove(){}}},getElementById:id=>map[id]||null,querySelectorAll:sel=>sel==='[data-fishing-tab]'?tabs:[]};
  global.performance={now:()=>0};global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};
  const timers=[];global.setTimeout=(fn,ms)=>{timers.push({fn,ms,cleared:false});return timers.length;};global.clearTimeout=id=>{if(timers[id-1])timers[id-1].cleared=true;};
  global.LuckyDexFishingCore=require('../app/src/main/assets/arcade-fishing-core.js');
  global.LuckyDexFishingLocations=require('../app/src/main/assets/arcade-fishing-locations.js');
  global.LuckyDexAdventureSpecies=require('../app/src/main/assets/adventure/adventure-species.js');
  global.LuckyDexFishingItemArt={pathFor:()=>'',fallbackFor:()=>''};
  global.state={profile:{coins:2500,dust:0,tickets:0},settings:{rareOdds:{}},arcade:{fishing:{fishingTokens:500,rods:{old:true,good:true},bait:{basic:2}}}};
  global.save=()=>{};
  delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];
  require('../app/src/main/assets/arcade-fishing.js');
  global.LuckyDexFishing.open();
  return{map,tabs,timers,flush(){const next=timers.find(t=>!t.cleared&&!t.ran);if(!next)return false;next.ran=true;next.fn();return true;}};
}

test('START FISHING runs a brief visible countdown before CAST LINE becomes active',()=>{
  const h=boot();
  h.map.fishingGame.listeners.click({target:targetFor({'#fishingStartBtn':h.map.fishingStartBtn})});
  assert.equal(h.map.fishingCountdown.hidden,false);
  assert.equal(h.map.fishingCountdown.textContent,'READY');
  assert.equal(h.map.fishingActionBtn.disabled,true);
  const seen=[h.map.fishingCountdown.textContent];
  while(h.flush())seen.push(h.map.fishingCountdown.textContent);
  assert.deepEqual(seen.slice(0,5),['READY','3','2','1','GO!']);
  assert.equal(h.map.fishingCountdown.hidden,true);
  assert.equal(h.map.fishingActionBtn.disabled,false);
  global.LuckyDexFishing.close();
});

test('rod can be changed from inside the fishing location between casts',()=>{
  const h=boot();
  h.map.fishingGame.listeners.click({target:targetFor({'#fishingStartBtn':h.map.fishingStartBtn})});
  while(h.flush()){}
  assert.match(h.map.fishingPlayRod.innerHTML,/Good Rod/);
  h.map.fishingPlayRod.value='good';
  h.map.fishingPlayRod.listeners.change({target:h.map.fishingPlayRod});
  assert.equal(global.state.arcade.fishing.selectedRod,'good');
  assert.match(h.map.fishingPlayGear.textContent,/Good Rod/);
  h.map.fishingPlayBait.value='basic';
  h.map.fishingPlayBait.listeners.change({target:h.map.fishingPlayBait});
  assert.equal(global.state.arcade.fishing.selectedBait,'basic');
  assert.match(h.map.fishingPlayGear.textContent,/Basic Bait/);
  global.LuckyDexFishing.close();
});

test('successful shop purchase immediately updates wallet, inventory, and visible feedback',()=>{
  const h=boot();
  h.tabs.find(x=>x.dataset.fishingTab==='shop');
  h.map.fishingGame.listeners.click({target:targetFor({'[data-fishing-tab]':h.tabs.find(x=>x.dataset.fishingTab==='shop')})});
  const buy={dataset:{fishingBuy:'bait:basic'}};
  h.map.fishingGame.listeners.click({target:targetFor({'[data-fishing-buy]':buy})});
  assert.equal(global.state.arcade.fishing.fishingTokens,490);
  assert.equal(global.state.arcade.fishing.bait.basic,7);
  assert.equal(h.map.fishingShopWallet.textContent,'🎣 490');
  assert.equal(h.map.fishingTokens.textContent,'🎣 490');
  assert.match(h.map.fishingShopNotice.textContent,/Purchased Basic Bait/i);
  assert.match(h.map.fishingShopGrid.innerHTML,/OWNED 7/);
  global.LuckyDexFishing.close();
});
