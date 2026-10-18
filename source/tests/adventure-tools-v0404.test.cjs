'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const T=require('../app/src/main/assets/adventure/adventure-tools.js');

const fixture=()=>({profile:{coins:1000,xp:2400},inventory:{pokeball:17,premierball:0,greatball:2,ultraball:1,berry:3,potion:2},pokemon:{},team:[],stats:{}});

test('Mart quote uses selected quantity and unit prices instead of fixed bundles',()=>{
  const s=fixture();
  const one=T.quotePurchase(s,'pokeball',{quantity:1});
  assert.equal(one.qty,1);assert.equal(one.cost,20);assert.equal(one.ownedAfter,18);
  const ten=T.quotePurchase(s,'pokeball',{quantity:10});
  assert.equal(ten.qty,10);assert.equal(ten.cost,200);assert.equal(ten.balanceAfter,800);assert.equal(ten.ownedAfter,27);
  const potion=T.quotePurchase(s,'potion',{quantity:4});
  assert.equal(potion.qty,4);assert.equal(potion.cost,240);
});

test('Poké Ball purchases award one Premier Ball per ten balls in the transaction',()=>{
  const s=fixture();let saves=0;
  const tx=T.createTransactions(()=>s,()=>saves++);
  let ticket=tx.preparePurchase('pokeball',{quantity:10});
  assert.equal(ticket.premierBonus,1);
  let result=tx.confirmPurchase(ticket.token);
  assert.equal(result.applied,true);assert.equal(s.inventory.pokeball,27);assert.equal(s.inventory.premierball,1);assert.equal(s.profile.coins,800);assert.equal(saves,1);
  ticket=tx.preparePurchase('pokeball',{quantity:25});
  assert.equal(ticket.premierBonus,2);
});

test('failed save rolls back coins, bought balls and Premier Ball bonus atomically',()=>{
  const s=fixture();const before=JSON.parse(JSON.stringify(s));
  const tx=T.createTransactions(()=>s,()=>{throw Error('disk');});
  const ticket=tx.preparePurchase('pokeball',{quantity:20});
  const result=tx.confirmPurchase(ticket.token);
  assert.equal(result.applied,false);assert.deepEqual(s,before);
});

test('Mart markup exposes quantity controls and Premier Ball bonus preview',()=>{
  const s=fixture();
  const html=T.markup(s,'mart',{quantities:{pokeball:10}});
  assert.match(html,/data-tool-action="qty"/);
  assert.match(html,/data-key="pokeball"/);
  assert.match(html,/data-quantity="10"/);
  assert.match(html,/Premier Ball/i);
  assert.match(html,/200 Lucky Coins/);
});

test('Premier Ball is recognized as a usable 1x capture ball',()=>{
  const battle=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/adventure/adventure-battle.js'),'utf8');
  const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(battle,/premierball:\{name:'Premier Ball',mod:1\}/);
  assert.match(app,/premierball:\{name:'Premier Ball',mod:1/);
  assert.match(app,/inventory:\{[^}]*premierball:/s);
});
