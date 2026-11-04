'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const read=file=>fs.readFileSync(path.join(assets,file),'utf8');

function browserClassicNeo(){
  // The Android WebView uses script tags, unlike CommonJS require, so load
  // dependencies in the order shipped in index.html to detect TDZ/order bugs.
  const html=read('index.html');
  const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(x=>x[1]);
  const essentials=['tcgp-battle-effects.js','tcg-classic-neo-genesis.js'];
  const loaded={};const win={};win.globalThis=win;vm.createContext(win);
  for(const name of scripts){
    if(!essentials.includes(name))continue;
    vm.runInContext(read(name),win,{filename:name,timeout:15000});
    loaded[name]=true;
  }
  assert.ok(essentials.every(name=>loaded[name]),'Both effects engine and Neo script must load');
  return {win,scripts};
}

test('WebView loads the battle-effects engine before Neo Genesis registers cards',()=>{
  const {win,scripts}=browserClassicNeo();
  assert.ok(scripts.indexOf('tcgp-battle-effects.js')<scripts.indexOf('tcg-classic-neo-genesis.js'));
  assert.equal(win.LuckyDexClassicTCGNeoGenesis.CARDS.length,111);
  assert.equal(win.LuckyDexClassicTCGNeoGenesis.CARDS.filter(c=>c.battleEnabled).length,111);
  assert.equal(win.LuckyDexClassicTCGNeoGenesis.CARDS.filter(c=>c.deckEligible).length,105);
});

test('Neo Genesis set + battle-ready + unowned catalogue includes all 111 cards',()=>{
  const data=require(path.join(assets,'tcg-classic-battle-data.js'));
  const workspace=require(path.join(assets,'tcg-classic-deck-workspace.js'));
  const results=workspace.query(workspace.catalogue([]),{
    filters:{set:'neo1',enabled:true,owned:false},sort:'number',pageSize:200
  });
  assert.equal(results.total,111);
  assert.equal(results.rows.length,111);
  assert.equal(results.rows[0].card.id,'neo1-1');
  assert.equal(results.rows[110].card.id,'neo1-111');
  assert.equal(results.rows.every(r=>r.quantity===0),true);
  assert.equal(data.cardById('neo1-1').battleEnabled,true);
});
