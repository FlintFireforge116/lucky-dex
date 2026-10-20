'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const css=fs.readFileSync('app/src/main/assets/arcade-fishing.css','utf8');

function el(id=''){
  const listeners={},styleValues={};
  return{id,dataset:{},hidden:false,textContent:'',innerHTML:'',value:'',disabled:false,
    style:{setProperty(k,v){styleValues[k]=v},removeProperty(k){delete styleValues[k]}},styleValues,
    classList:{toggle(){},add(){},remove(){}},
    addEventListener(type,fn){listeners[type]=fn},removeEventListener(){},listeners};
}
function targetFor(selectorMap){return{closest(sel){return selectorMap[sel]||null}};}
function boot(tokens=500){
  const ids=['fishingGame','fishingWalletStrip','fishingLuckyCoins','fishingTokens','fishingFishView','fishingBook','fishingShop','fishingSetupView','fishingPlayView','fishingRegionProgress','fishingSpotProgress','fishingRod','fishingBait','fishingAreaMeta','fishingStartBtn','fishingPlayScene','fishingPlayRegion','fishingPlayArea','fishingPlayGear','fishingPlayRod','fishingPlayBait','fishingChangeSpotBtn','fishingMessage','fishingCountdown','fishingResult','fishingResultOverlay','fishingResultActions','fishingShopWallet','fishingShopNotice','fishingBookGrid','fishingShopGrid','fishingFishTarget','fishingCatchZone','fishingProgressFill','fishingActionBtn','fishingBookSearch','fishingBookRegion','fishingBookCategory','fishingBookStatus','fishingBookSort','fishingCartDock','fishingCartToggle','fishingCartPanel','fishingCartItems','fishingCartTotal','fishingCartBalance','fishingCartCheckout','fishingCartClear'];
  const map=Object.fromEntries(ids.map(id=>[id,el(id)]));
  map.fishingCartPanel.hidden=true;
  const tabs=['fish','book','shop'].map(name=>{const x=el(`tab-${name}`);x.dataset.fishingTab=name;return x;});
  global.window=global;
  global.document={body:{classList:{add(){},remove(){}}},getElementById:id=>map[id]||null,querySelectorAll:sel=>sel==='[data-fishing-tab]'?tabs:[]};
  global.performance={now:()=>0};global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};
  global.setTimeout=()=>1;global.clearTimeout=()=>{};
  global.LuckyDexFishingCore=require('../app/src/main/assets/arcade-fishing-core.js');
  global.LuckyDexFishingLocations=require('../app/src/main/assets/arcade-fishing-locations.js');
  global.LuckyDexAdventureSpecies=require('../app/src/main/assets/adventure/adventure-species.js');
  global.LuckyDexFishingItemArt={pathFor:()=>'',fallbackFor:()=>''};
  global.state={profile:{coins:2500,dust:0,tickets:0},settings:{rareOdds:{}},arcade:{fishing:{fishingTokens:tokens,rods:{old:true},bait:{basic:0}}}};
  global.save=()=>{};
  delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];
  require('../app/src/main/assets/arcade-fishing.js');
  global.LuckyDexFishing.open();
  map.fishingGame.listeners.click({target:targetFor({'[data-fishing-tab]':tabs.find(x=>x.dataset.fishingTab==='shop')})});
  return{map,tabs,click(selector,node){map.fishingGame.listeners.click({target:targetFor({[selector]:node})});}};
}

test('Tackle Shop markup includes a sticky editable cart and final checkout controls',()=>{
  for(const id of ['fishingCartDock','fishingCartToggle','fishingCartPanel','fishingCartItems','fishingCartBalance','fishingCartCheckout','fishingCartClear'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(css,/\.fishing-cart-dock[^}]*position:sticky/);
  assert.match(css,/\.fishing-cart-qty/);
});

test('adding items changes only the temporary cart until checkout',()=>{
  const h=boot(500);
  const good={dataset:{fishingCartAdd:'rod:good'}};
  h.click('[data-fishing-cart-add]',good);
  assert.equal(global.state.arcade.fishing.fishingTokens,500);
  assert.equal(Boolean(global.state.arcade.fishing.rods.good),false);
  assert.match(h.map.fishingCartToggle.textContent,/CART · 1 ITEM · 🎣 120/);
  assert.match(h.map.fishingShopGrid.innerHTML,/Good Rod/);
  assert.match(h.map.fishingShopGrid.innerHTML,/IN CART/);

  const basic={dataset:{fishingCartAdd:'bait:basic'}};
  h.click('[data-fishing-cart-add]',basic);
  h.click('[data-fishing-cart-add]',basic);
  assert.match(h.map.fishingCartToggle.textContent,/CART · 3 ITEMS · 🎣 140/);
  assert.equal(global.state.arcade.fishing.bait.basic,0);
  global.LuckyDexFishing.close();
});

test('cart panel edits bait quantity, previews balance, and checkout refreshes inventory immediately',()=>{
  const h=boot(500);
  h.click('[data-fishing-cart-add]',{dataset:{fishingCartAdd:'rod:good'}});
  h.click('[data-fishing-cart-add]',{dataset:{fishingCartAdd:'bait:basic'}});
  h.click('#fishingCartToggle',h.map.fishingCartToggle);
  assert.equal(h.map.fishingCartPanel.hidden,false);
  assert.match(h.map.fishingCartBalance.textContent,/Current: 🎣 500 → After purchase: 🎣 370/);
  assert.match(h.map.fishingCartItems.innerHTML,/Basic Bait/);

  h.click('[data-fishing-cart-adjust]',{dataset:{fishingCartAdjust:'bait:basic:+1'}});
  assert.match(h.map.fishingCartBalance.textContent,/Current: 🎣 500 → After purchase: 🎣 360/);
  assert.match(h.map.fishingCartToggle.textContent,/3 ITEMS · 🎣 140/);

  h.click('#fishingCartCheckout',h.map.fishingCartCheckout);
  assert.equal(global.state.arcade.fishing.fishingTokens,360);
  assert.equal(global.state.arcade.fishing.rods.good,true);
  assert.equal(global.state.arcade.fishing.bait.basic,10);
  assert.equal(h.map.fishingShopWallet.textContent,'🎣 360');
  assert.match(h.map.fishingShopNotice.textContent,/Purchased 3 items for 140 Fishing Tokens/);
  assert.match(h.map.fishingCartToggle.textContent,/CART · EMPTY/);
  assert.equal(h.map.fishingCartPanel.hidden,true);
  assert.match(h.map.fishingShopGrid.innerHTML,/Good Rod[\s\S]*OWNED/);
  global.LuckyDexFishing.close();
});

test('over-budget cart stays editable and cannot be finalised',()=>{
  const h=boot(100);
  h.click('[data-fishing-cart-add]',{dataset:{fishingCartAdd:'rod:deep'}});
  h.click('#fishingCartToggle',h.map.fishingCartToggle);
  assert.match(h.map.fishingCartBalance.textContent,/Need 🎣 800 more/);
  assert.equal(h.map.fishingCartCheckout.disabled,true);
  assert.equal(global.state.arcade.fishing.fishingTokens,100);
  assert.equal(Boolean(global.state.arcade.fishing.rods.deep),false);
  global.LuckyDexFishing.close();
});


test('cart lines can be removed individually or cleared before checkout',()=>{
  const h=boot(500);
  h.click('[data-fishing-cart-add]',{dataset:{fishingCartAdd:'rod:good'}});
  h.click('[data-fishing-cart-add]',{dataset:{fishingCartAdd:'bait:basic'}});
  h.click('#fishingCartToggle',h.map.fishingCartToggle);
  h.click('[data-fishing-cart-remove]',{dataset:{fishingCartRemove:'rod:good'}});
  assert.match(h.map.fishingCartToggle.textContent,/1 ITEM · 🎣 10/);
  assert.equal(Boolean(global.state.arcade.fishing.rods.good),false);
  h.click('#fishingCartClear',h.map.fishingCartClear);
  assert.match(h.map.fishingCartToggle.textContent,/CART · EMPTY/);
  assert.equal(global.state.arcade.fishing.fishingTokens,500);
  assert.equal(global.state.arcade.fishing.bait.basic,0);
  global.LuckyDexFishing.close();
});

test('cart is session-only and clears when Fishing Lodge is reopened',()=>{
  const h=boot(500);
  h.click('[data-fishing-cart-add]',{dataset:{fishingCartAdd:'bait:basic'}});
  assert.match(h.map.fishingCartToggle.textContent,/1 ITEM/);
  global.LuckyDexFishing.close();
  global.LuckyDexFishing.open();
  h.click('[data-fishing-tab]',h.tabs.find(x=>x.dataset.fishingTab==='shop'));
  assert.match(h.map.fishingCartToggle.textContent,/CART · EMPTY/);
  global.LuckyDexFishing.close();
});
