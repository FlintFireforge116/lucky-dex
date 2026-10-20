'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../app/src/main/assets/arcade-fishing-core.js');

function save(tokens=500){return{profile:{coins:0},arcade:{fishing:{fishingTokens:tokens,rods:{old:true},bait:{basic:0}}}};}

test('checkoutCart totals rods and bait packs and applies them atomically',()=>{
  const s=save(500);
  const out=Core.checkoutCart(s,[{type:'rod',id:'good',quantity:1},{type:'bait',id:'basic',quantity:3}]);
  assert.deepEqual(out,{ok:true,cost:150,itemCount:4,lineCount:2});
  assert.equal(s.arcade.fishing.fishingTokens,350);
  assert.equal(s.arcade.fishing.rods.good,true);
  assert.equal(s.arcade.fishing.bait.basic,15);
});

test('checkoutCart rejects unaffordable cart without mutating wallet or inventory',()=>{
  const s=save(100);
  const before=JSON.stringify(s);
  const out=Core.checkoutCart(s,[{type:'rod',id:'good',quantity:1},{type:'bait',id:'basic',quantity:1}]);
  assert.equal(out.ok,false);
  assert.equal(out.reason,'tokens');
  assert.equal(JSON.stringify(s),before);
});

test('checkoutCart rejects an already-owned or duplicate rod without partial bait purchase',()=>{
  const s=save(500);
  s.arcade.fishing.rods.good=true;
  const before=JSON.stringify(s);
  const owned=Core.checkoutCart(s,[{type:'bait',id:'basic',quantity:2},{type:'rod',id:'good',quantity:1}]);
  assert.equal(owned.ok,false);
  assert.equal(owned.reason,'owned');
  assert.equal(JSON.stringify(s),before);

  const s2=save(500);
  const dup=Core.checkoutCart(s2,[{type:'rod',id:'good',quantity:2}]);
  assert.equal(dup.ok,false);
  assert.equal(dup.reason,'rod-quantity');
  assert.equal(s2.arcade.fishing.fishingTokens,500);
  assert.equal(Boolean(s2.arcade.fishing.rods.good),false);
});

test('checkoutCart rejects empty and malformed carts without mutation',()=>{
  const s=save(500),before=JSON.stringify(s);
  assert.deepEqual(Core.checkoutCart(s,[]),{ok:false,reason:'empty'});
  assert.equal(Core.checkoutCart(s,[{type:'bait',id:'basic',quantity:0}]).reason,'quantity');
  assert.equal(Core.checkoutCart(s,[{type:'junk',id:'basic',quantity:1}]).reason,'type');
  assert.equal(JSON.stringify(s),before);
});
