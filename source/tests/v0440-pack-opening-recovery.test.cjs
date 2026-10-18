'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const flow=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/pack-flow-v0165.js'),'utf8');

function makeHarness(){
  const body={classList:{add(){}},appendChild(){}};
  const nodes={
    setSelect:{value:'invalid-product'},
    cardSource:{value:'tcg'},
    packStage:{parentElement:body,hidden:true,innerHTML:''},
    packExitBtn:{onclick:null},
    openPackBtn:{disabled:false}
  };
  let sealedRenders=0;
  const toasts=[];
  const context={
    console,
    window:null,
    document:{body,getElementById(id){return nodes[id]||null;}},
    state:{profile:{coins:9999}},
    setCache:{tcg:[
      {id:'invalid-product',name:'Trainer Kit',cards:[{id:'x'}]},
      {id:'valid-booster',name:'Valid Booster',cards:[{id:'card-1'}]}
    ],tcgp:[]},
    preparedPack:null,
    packEntitlement(){return {mode:'coins',cost:600};},
    cachedSetV13(){return null;},
    showToast(message){toasts.push(String(message));},
    stopPackFastReveal(){},
    updatePackButton(){},
    updateOfflineHintV13(){},
    isOnlineV13(){return false;},
    buildOfflinePackV13:async()=>[{id:'card-1',name:'Test Card'}],
    renderSealedPack:async()=>{sealedRenders++;},
    preloadPackCard:async()=>null,
    closePackOpening(){},
    escapeHtml:String,
    LuckyDexCardAcquisition:{boosterProductEligible(set){return set?.id==='valid-booster';}},
    LuckyDexGodPack:{shouldRoll(){return false;}},
    LuckyDexPackFlow:{},
    AbortController,
    DOMException,
    URL,
    Map,
    Set,
    Promise,
    Date,
    Math,
    setTimeout,
    clearTimeout
  };
  context.window=context;
  vm.createContext(context);
  vm.runInContext(flow,context,{filename:'pack-flow-v0165.js'});
  return {context,nodes,toasts,getSealedRenders:()=>sealedRenders};
}

test('rejected stale physical product does not wedge later pack opening',async()=>{
  const h=makeHarness();

  await h.context.preparePack();
  assert.deepEqual(h.toasts,['That product is not available in the Booster Shop.']);
  assert.equal(vm.runInContext('packRun?.building ?? false',h.context),false,
    'a rejected stale product must not leave the pack run locked in building state');

  h.nodes.setSelect.value='valid-booster';
  await h.context.preparePack();

  assert.equal(h.getSealedRenders(),1,'a valid booster must still prepare immediately after the rejected stale product');
  assert.equal(vm.runInContext('packRun?.building ?? false',h.context),false,
    'successful preparation must also release the building guard');
});
