const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/trade-v0163.js'),'utf8');

function makeSet(id='alpha',name='Alpha'){
  const rarities=['Common','Uncommon','Rare'];
  return {id,name,source:'tcg',cards:Array.from({length:18},(_,i)=>({id:`${id}-${i+1}`,name:`${name} ${i+1}`,rarity:rarities[i%3],setId:id,setName:name,source:'tcg',image:`${i}.png`}))};
}
function runtime({trade}={}){
  const set=makeSet();
  const state={cards:{},stats:{trades:7},trade:trade||{openedSets:{'tcg:alpha':{source:'tcg',setId:'alpha',setName:'Alpha'}},boards:{legacy:['keep']},totalTrades:7}};
  const context={console,setTimeout,clearTimeout,setInterval,clearInterval,window:null,document:{getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}},localStorage:{setItem(){}},state,setCache:{tcg:[set],tcgp:[]},cachedSetV13:(id,src)=>id==='alpha'&&src==='tcg'?set:null,rarityTier:r=>({Common:0,Uncommon:1,Rare:2}[r]??1),escapeHtml:s=>String(s??''),save(){},showToast(){},collectionMode:'cards',renderCollection(){},checkCardMilestones(){}};
  context.window=context;vm.createContext(context);vm.runInContext(source,context,{filename:'trade-v0163.js'});return context;
}
(async()=>{
  const ctx=runtime();
  const a=ctx.LuckyDexTrade.clock(new Date(2026,9,10,10,15,0));
  assert.equal(a.next.getHours(),11,'10:15 refreshes at 11:00');
  assert.equal(a.next.getMinutes(),0);
  const same=ctx.LuckyDexTrade.clock(new Date(2026,9,10,10,59,59));
  const next=ctx.LuckyDexTrade.clock(new Date(2026,9,10,11,0,0));
  assert.equal(a.slot,same.slot,'same local clock hour shares a deterministic slot');
  assert.notEqual(a.slot,next.slot,'adjacent local hours use different slots');
  const midnight=ctx.LuckyDexTrade.clock(new Date(2026,9,10,23,59,0));
  assert.equal(midnight.next.getHours(),0);
  assert.equal(midnight.next.getDate(),11,'23:59 rolls to next local day');

  const oldMarket={version:'v0248-promo-set-filter',slot:'2026-10-10:2',openedSetFingerprint:'tcg:alpha',listings:[{id:'old',accepted:true}]};
  const trade={marketVersion:'v0248-promo-set-filter',market:oldMarket,currentSlot:oldMarket.slot,openedSets:{'tcg:alpha':{source:'tcg',setId:'alpha',setName:'Alpha'}},boards:{legacy:['keep']},totalTrades:7,acceptedHistory:['persist-me']};
  const migrated=runtime({trade});
  await migrated.LuckyDexTrade._test.ensureMarket();
  assert.notEqual(migrated.state.trade.market.version,'v0248-promo-set-filter','legacy four-hour snapshot is invalidated and rebuilt');
  assert.deepEqual(Array.from(migrated.state.trade.boards.legacy),['keep']);
  assert.equal(migrated.state.trade.totalTrades,7);
  assert.deepEqual(Array.from(migrated.state.trade.acceptedHistory),['persist-me']);
  assert.ok(migrated.state.trade.openedSets['tcg:alpha'],'opened-set discovery survives migration');
  const throttle=runtime();
  assert.equal(throttle.LuckyDexTrade._test.marketRefreshDue(15999),true,'never-attempted instance remains immediately retryable');
  throttle.LuckyDexTrade._test.markMarketAttempt(1000);
  assert.equal(throttle.LuckyDexTrade._test.marketRefreshDue(15999),false,'15 second retry throttle remains intact');
  assert.equal(throttle.LuckyDexTrade._test.marketRefreshDue(16000),true);
  console.log('PASS v0.34.3 hourly trade cadence and migration');
})().catch(err=>{console.error(err);process.exit(1)});
