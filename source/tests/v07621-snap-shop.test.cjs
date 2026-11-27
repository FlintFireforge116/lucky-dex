'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const A=path.join(__dirname,'../app/src/main/assets');
function setup(online=false){
 const nodes={setSelect:{value:'',innerHTML:''},cardSource:{value:'tcg'},packSetBrowser:{innerHTML:'',querySelectorAll:()=>[]},packSetSearch:{value:'snap',addEventListener(){}},promoVaultBtn:{addEventListener(){}}};
 const ctx={console,window:null,navigator:{onLine:online},fetch:async()=>({ok:true,json:async()=>({schema:1,sets:[{k:'base1',n:'Base Set',d:'1999-01-09',c:[{id:'base1-1'}]},{k:'basep',n:'Wizards Black Star Promos',c:[{id:'basep-1'}]}]})}),localStorage:{getItem:()=>null},state:{cards:{},ui:{},settings:{}},setCache:{tcg:[],tcgp:[]},document:{getElementById:id=>nodes[id]||null},LuckyDexDebug:{},escapeHtml:String,AbortController,URL,setTimeout,clearTimeout,Promise,Date,updatePackButton(){},updateOfflineHintV13(){},readCatalogCacheV13:()=>({}),saveCatalogCacheV13(){}};
 ctx.window=ctx;vm.createContext(ctx);
 for(const f of ['pack-opening-v0160.js','pack-policy-v0343.js','card-acquisition-v0246.js','booster-art-v0260.js','card-art-library-v0165.js','pack-flow-v0165.js'])vm.runInContext(fs.readFileSync(path.join(A,f),'utf8'),ctx,{filename:f});
 return {ctx,nodes};
}
for(const online of [false,true])test(`real Snap catalogue renders in Pack Shop (${online?'online':'offline'})`,async()=>{
 const {ctx,nodes}=setup(online),sets=await ctx.LuckyDexCardArt.catalog();
 const snap=sets.filter(s=>s._lentalSet);assert.equal(snap.length,2);assert.ok(snap.every(Object.isFrozen));
 ctx.renderSetOptionsV13('tcg',sets);
 const actual=ctx.LuckyDexPackBrowser.rows('tcg','snap');
 assert.deepEqual(Array.from(actual,s=>s.id).sort(),['library:SNAPFLORIO','library:SNAPFOUNJA']);
 for(const s of actual){
  assert.equal(s.cardCount.total,s._libraryKey==='SNAPFLORIO'?123:86);
  assert.equal(ctx.LuckyDexPackPolicy.resolve(s).price,650);
  assert.equal(ctx.LuckyDexPackPolicy.resolve(s).slots.length,10);
  assert.equal(s._boosterArt,ctx.LuckyDexBoosterArt.localPath(s));
  assert.ok(fs.existsSync(path.join(A,s._boosterArt)));
  assert.ok(nodes.setSelect.innerHTML.includes(s.id));assert.ok(nodes.packSetBrowser.innerHTML.includes(s.name));
 }
 assert.ok(snap.every(s=>!s._boosterArt),'source templates remain immutable');
 assert.ok(!nodes.setSelect.innerHTML.includes('basep'));
 if(online)assert.ok(nodes.setSelect.innerHTML.includes('base1'));
 ctx.renderSetOptionsV13('tcg',await ctx.LuckyDexCardArt.catalog());
 assert.equal(ctx.LuckyDexPackBrowser.rows('tcg','snap').length,2);
});
