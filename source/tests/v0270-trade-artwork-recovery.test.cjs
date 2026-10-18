'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const tradeSource=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/trade-v0163.js'),'utf8');
assert.match(tradeSource,/window\.tradeImageFallback=async function[\s\S]{0,700}recoverTradeArtwork\(row,img\)/,'the live Trade onerror path must escalate to exact-card recovery');

function runtime(){
  const document={getElementById(){return null;},querySelector(){return null;},querySelectorAll(){return [];}};
  const state={cards:{},trade:{openedSets:{},boards:{},totalTrades:0},stats:{trades:0}};
  const resolved=[];let saveCalls=0;
  const context={
    console,setTimeout,clearTimeout,setInterval,clearInterval,
    window:null,document,state,localStorage:{setItem(){}},setCache:{tcg:[],tcgp:[]},
    rarityTier(){return 1;},escapeHtml:s=>String(s??''),save(){saveCalls++;},showToast(){},collectionMode:'cards',renderCollection(){},
    resolveCardArtwork:async(card,set,source)=>{
      resolved.push({card:{...card},set,source});
      assert.equal(source,'tcgp','Trade should preserve the Pocket source when using the shared resolver');
      assert.equal(card.setId,'A2b','Trade should preserve the exact Pocket set id');
      assert.equal(card.localId,'019','Trade should preserve the exact collector number');
      assert.equal(card.name,'Wugtrio ex','Trade should preserve card-name identity');
      card.image='https://example.test/A2b/019.webp';
      card._pocketExactRemote=true;
      return card.image;
    },
    cardImage:(base,quality,format)=>`${base}?${quality}.${format}`,
  };
  context.window=context;
  vm.createContext(context);
  vm.runInContext(tradeSource,context,{filename:'trade-v0163.js'});
  return {context,resolved,getSaveCalls:()=>saveCalls};
}

(async()=>{
  const {context,resolved,getSaveCalls}=runtime();
  assert.equal(typeof context.LuckyDexTrade?._test?.recoverTradeArtwork,'function','Trade must expose its artwork recovery helper for regression testing');

  const card={id:'A2b-019',name:'Wugtrio ex',rarity:'Four Diamond',image:'',localId:'019',setId:'A2b',setName:'Shining Revelry',source:'tcgp'};
  const row={card,candidates:['https://broken.test/wugtrio.webp'],index:1,recoveryTried:false};
  const parent={classes:new Set(['broken']),classList:{add(v){parent.classes.add(v);},remove(v){parent.classes.delete(v);}}};
  const img={src:'https://broken.test/wugtrio.webp',parentElement:parent};

  const recovered=await context.LuckyDexTrade._test.recoverTradeArtwork(row,img);
  assert.equal(recovered,true,'Trade thumbnail recovery should succeed when the shared resolver finds exact artwork');
  assert.equal(resolved.length,1,'Trade should invoke the shared exact-card resolver once');
  assert.equal(card.image,'https://example.test/A2b/019.webp','Recovered artwork should be cached back onto the trade card');
  assert.equal(img.src,'https://example.test/A2b/019.webp?high.webp','Recovered artwork should immediately replace the broken thumbnail');
  assert.equal(parent.classes.has('broken'),false,'Successful recovery should clear the artwork-unavailable state');
  assert.equal(row.recoveryTried,true,'Recovery should be attempted only once per rendered trade card');
  assert.equal(getSaveCalls(),1,'Recovered trade artwork should be persisted with the current market state');

  console.log('PASS v0.27.0 Trade thumbnails reuse exact-card artwork recovery');
})().catch(err=>{console.error(err);process.exit(1);});
