'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const tradeSource=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/trade-v0163.js'),'utf8');
const appSource=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');

function makeSet(id,name,source='tcg'){
  const rarities=['Common','Uncommon','Rare','Common','Uncommon','Rare'];
  return {
    id,name,cardCount:{total:18},source,
    cards:Array.from({length:18},(_,i)=>({
      id:`${id}-${i+1}`,name:`${name} Card ${i+1}`,rarity:rarities[i%rarities.length],
      localId:String(i+1),set:{id,name,cardCount:{total:18}},source,image:`${id}-${i+1}.png`
    }))
  };
}

function runtime({sets=[],cards={}}={}){
  const state={cards:{...cards},trade:{openedSets:{},boards:{legacy:['preserve-me']},totalTrades:2},stats:{trades:2}};
  for(const set of sets) state.trade.openedSets[`${set.source||'tcg'}:${set.id}`]={source:set.source||'tcg',setId:set.id,setName:set.name};
  const elements=new Map();
  const document={
    getElementById(id){return elements.get(id)||null;},
    querySelector(){return null;},
    querySelectorAll(){return [];}
  };
  const localStorage={last:null,setItem(k,v){this.last=[k,v];}};
  const context={
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    window:null, document, localStorage, state,
    setCache:{tcg:sets.filter(s=>(s.source||'tcg')==='tcg'),tcgp:sets.filter(s=>s.source==='tcgp')},
    cachedSetV13:(id,source)=>sets.find(s=>s.id===id&&(s.source||'tcg')===source)||null,
    rarityTier:r=>({Common:0,Uncommon:1,Rare:2}[r]??1),
    escapeHtml:s=>String(s??''),
    save(){},
    showToast(){},
    collectionMode:'cards',
    renderCollection(){},
    checkCardMilestones(){},
  };
  context.window=context;
  vm.createContext(context);
  vm.runInContext(tradeSource,context,{filename:'trade-v0163.js'});
  return context;
}

(async()=>{
  {
    const one=makeSet('alpha','Alpha');
    const ctx=runtime({sets:[one]});
    assert.deepEqual(ctx.state.trade.boards,{legacy:['preserve-me']},'legacy trade boards are preserved for save compatibility');
    assert.equal(ctx.state.trade.market,undefined,'new market is lazy before first market request');
    const market=await ctx.LuckyDexTrade._test.ensureMarket();
    assert.ok(Array.isArray(market)&&market.length>0,'one discovered set builds live same-set listings');
    assert.ok(market.every(x=>x.sameSet===true),'one-set market contains no fabricated across-set rows');
    assert.ok(ctx.state.trade.market,'successful build persists one market snapshot');
    assert.equal(ctx.state.trade.market.listings.length,market.length);
  }

  {
    const a=makeSet('alpha','Alpha');
    const b=makeSet('beta','Beta');
    const ctx=runtime({sets:[a,b]});
    const first=await ctx.LuckyDexTrade._test.ensureMarket();
    assert.ok(first.some(x=>x.sameSet===false),'two sets can produce across-set listings in the same market');
    const savedIds=first.map(x=>x.id);
    const savedMarket=ctx.state.trade.market;
    ctx.LuckyDexTrade._test.resetCatalogueCaches();
    ctx.cachedSetV13=()=>null;
    ctx.setCache.tcg=[];
    const afterFailure=await ctx.LuckyDexTrade._test.ensureMarket(true);
    assert.deepEqual(afterFailure.map(x=>x.id),savedIds,'failed forced refresh preserves the last valid market');
    assert.equal(ctx.state.trade.market,savedMarket,'failed refresh does not atomically replace the persisted market');
  }

  {
    const a=makeSet('alpha','Alpha');
    const ctx=runtime({sets:[a]});
    ctx.cachedSetV13=()=>null;
    ctx.setCache.tcg=[];
    const failed=await ctx.LuckyDexTrade._test.ensureMarket();
    assert.equal(failed.length,0,'initial unavailable catalogue returns no transient listings');
    assert.equal(ctx.state.trade.market,undefined,'initial failed build is not cached as a valid empty market');
    ctx.cachedSetV13=(id)=>id==='alpha'?a:null;
    ctx.setCache.tcg=[a];
    ctx.LuckyDexTrade._test.resetCatalogueCaches();
    const retry=await ctx.LuckyDexTrade._test.ensureMarket();
    assert.ok(retry.length>0,'second attempt in the same timer slot retries and succeeds');
    assert.ok(ctx.state.trade.market,'successful retry is persisted');
  }

  {
    const a=makeSet('alpha','Alpha');
    const b=makeSet('beta','Beta');
    const ctx1=runtime({sets:[a,b]});
    const ids1=(await ctx1.LuckyDexTrade._test.ensureMarket()).map(x=>x.id);
    const ctx2=runtime({sets:[a,b]});
    const ids2=(await ctx2.LuckyDexTrade._test.ensureMarket()).map(x=>x.id);
    assert.equal(JSON.stringify(Array.from(ids2)),JSON.stringify(Array.from(ids1)),'same timer slot and opened-set fingerprint produce stable listing IDs');
  }


  {
    const a=makeSet('alpha','Alpha');
    const b=makeSet('beta','Beta');
    const sets=[a,b];
    const ctx=runtime({sets});
    const market=await ctx.LuckyDexTrade._test.ensureMarket();
    const beforeSnapshot=ctx.state.trade.market;
    const beforeSlot=beforeSnapshot.slot,beforeExpiry=beforeSnapshot.expiresAt;
    const samePhysical=ctx.LuckyDexTrade._test.filterMarket(market,{mode:'same',source:'tcg',view:'all',search:''});
    const acrossPhysical=ctx.LuckyDexTrade._test.filterMarket(market,{mode:'global',source:'tcg',view:'all',search:''});
    assert.ok(samePhysical.length>0,'Same Set filters existing market rows');
    assert.ok(acrossPhysical.length>0,'Across Sets filters existing market rows');
    assert.ok(samePhysical.every(x=>x.sameSet&&x.source==='tcg'));
    assert.ok(acrossPhysical.every(x=>!x.sameSet&&x.source==='tcg'));
    const target=samePhysical[0];
    ctx.state.cards[target.request.id]={...target.request,count:2};
    const ready=ctx.LuckyDexTrade._test.filterMarket(market,{mode:'same',source:'tcg',view:'tradeable',search:''});
    const spares=ctx.LuckyDexTrade._test.filterMarket(market,{mode:'same',source:'tcg',view:'spares',search:''});
    assert.ok(ready.some(x=>x.id===target.id),'Can Trade is ownership filtering over the same array');
    assert.ok(spares.some(x=>x.id===target.id),'Spares is ownership filtering over the same array');
    const searched=ctx.LuckyDexTrade._test.filterMarket(market,{mode:'same',source:'tcg',view:'all',search:target.offer.name.slice(0,6)});
    assert.ok(searched.some(x=>x.id===target.id),'search filters the same market rows');
    assert.equal(ctx.state.trade.market,beforeSnapshot,'pure filtering never swaps the market snapshot');
    assert.equal(ctx.state.trade.market.slot,beforeSlot,'filtering never changes the market timer slot');
    assert.equal(ctx.state.trade.market.expiresAt,beforeExpiry,'filtering never extends expiry');

    target.accepted=true;
    const existingIds=market.map(x=>x.id);
    const c=makeSet('gamma','Gamma');
    sets.push(c);ctx.setCache.tcg.push(c);
    const added=await ctx.LuckyDexTrade.noteOpenedSet({source:'tcg',setId:'gamma',setName:'Gamma'});
    assert.equal(added,true,'new set notification registers a previously undiscovered set');
    const augmented=ctx.LuckyDexTrade.current();
    assert.ok(existingIds.every(id=>augmented.some(x=>x.id===id)),'new-set augmentation preserves all existing listings');
    assert.equal(augmented.find(x=>x.id===target.id).accepted,true,'accepted flags survive augmentation');
    assert.ok(augmented.some(x=>x.request.setId==='gamma'||x.offer.setId==='gamma'),'augmentation adds listings involving the new set');
    assert.equal(new Set(augmented.map(x=>x.id)).size,augmented.length,'augmentation never duplicates listing IDs');
    assert.match(ctx.state.trade.market.openedSetFingerprint,/gamma/,'augmentation updates the opened-set fingerprint');
    const countAfter=augmented.length;
    assert.equal(await ctx.LuckyDexTrade.noteOpenedSet({source:'tcg',setId:'gamma',setName:'Gamma'}),false,'repeated set notification is a no-op');
    assert.equal(ctx.LuckyDexTrade.current().length,countAfter,'repeated set notification does not append duplicates');
  }



  {
    const a=makeSet('alpha','Alpha');
    const b=makeSet('beta','Beta');
    const ctx=runtime({sets:[a,b]});
    ctx.cachedSetV13=id=>id==='alpha'?a:null;
    ctx.setCache.tcg=[a];
    ctx.LuckyDexTrade._test.resetCatalogueCaches();
    const partial=await ctx.LuckyDexTrade._test.ensureMarket();
    assert.equal(partial.length,0,'a market with two discovered sets is not cached if only one catalogue is currently resolvable');
    assert.equal(ctx.state.trade.market,undefined,'partial source coverage remains retryable instead of locking Same Set only for four hours');
    ctx.cachedSetV13=id=>id==='alpha'?a:id==='beta'?b:null;
    ctx.setCache.tcg=[a,b];
    ctx.LuckyDexTrade._test.resetCatalogueCaches();
    const recovered=await ctx.LuckyDexTrade._test.ensureMarket();
    assert.ok(recovered.some(x=>x.sameSet===false),'same-slot retry gains Across Sets rows when the second catalogue becomes available');
  }

  {
    const a=makeSet('alpha','Alpha');
    const ctx=runtime({sets:[a]});
    assert.equal(typeof ctx.LuckyDexTrade._test.marketRefreshDue,'function','Trade exposes retry timing for regression testing');
    assert.equal(ctx.LuckyDexTrade._test.marketRefreshDue(1000),true,'a never-attempted stale market may refresh immediately');
    ctx.LuckyDexTrade._test.markMarketAttempt(1000);
    assert.equal(ctx.LuckyDexTrade._test.marketRefreshDue(1001),false,'a failed refresh is throttled instead of retrying every second');
    assert.equal(ctx.LuckyDexTrade._test.marketRefreshDue(15999),false,'retry remains throttled before the retry window elapses');
    assert.equal(ctx.LuckyDexTrade._test.marketRefreshDue(16000),true,'Trade becomes retryable after the bounded retry interval');
  }

  assert.match(appSource,/__origCommitPreparedPackV62\(\);[\s\S]{0,700}LuckyDexTrade\?\.noteOpenedSet/,'committed packs notify Trade about newly opened sets after the real commit');

  console.log('PASS v0.24 single persistent Trade market semantics');
})().catch(err=>{console.error(err);process.exit(1);});
