'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const P=require('../app/src/main/assets/pack-policy-v0343.js');
const R=require('../app/src/main/assets/card-rarity-v0253.js');

const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
const start=app.indexOf('async function pickCardForDescriptorV0343');
const end=app.indexOf('async function buildGodPackV0291',start);
assert.ok(start>=0&&end>start,'live descriptor picker source is present');
const pickerSource=app.slice(start,end);

const context={
  window:{LuckyDexPackPolicy:P,LuckyDexCardRarity:R},
  DOMException:global.DOMException,
  console,
  Math,
  rarityTier:(rarity)=>R.classify({rarity}).tier,
  getCardDetail:async brief=>({...brief}),
  enrichPhysicalCardV151:async card=>card,
  finishLabelV0343:()=>'',
  canUseDescriptorCardV0343:()=>true
};
vm.createContext(context);
vm.runInContext(pickerSource+'\nthis.pickCardForDescriptorV0343=pickCardForDescriptorV0343;',context);
const pick=context.pickCardForDescriptorV0343;

(async()=>{
  const jungle={name:'Jungle',releaseDate:'1999-06-16'};
  const uncommon=P.slotPlan(jungle,{source:'tcg'})[7];
  await assert.rejects(
    ()=>pick([{id:'base2-8',name:'Vileplume',rarity:'Rare Holo'}],uncommon,[],null,jungle,'tcg'),
    /No card matches uncommon-1 collation/,
    'live fallback must reject a Rare Holo when an uncommon slot has no valid candidate'
  );

  const th={name:'30th Celebration',releaseDate:'2026-09-16'};
  const pikachu=P.slotPlan(th,{source:'tcg'})[4];
  await assert.rejects(
    ()=>pick([{id:'30c-102',name:'Jirachi ex',localId:'102',rarity:'Double Rare'}],pikachu,[],null,th,'tcg'),
    /No card matches pikachu-rare collation/,
    'live guaranteed Pikachu slot must never fall back to an arbitrary card'
  );

  const valid=await pick([
    {id:'30c-102',name:'Jirachi ex',localId:'102',rarity:'Double Rare'},
    {id:'30c-23',name:'Pikachu',localId:'23',rarity:'Pikachu Rare'}
  ],pikachu,[],null,th,'tcg');
  assert.equal(valid.id,'30c-23','live guaranteed slot selects the real Pikachu candidate');

  console.log('PASS v0.34.5 live collation hard-constraint regression');
})().catch(error=>{console.error(error);process.exitCode=1;});
