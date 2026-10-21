/* Lucky Dex v0.16.13 — strict set-mode Global Link Trade marketplace.
   The market is deterministic for each real-world one-hour window and only
   reveals cards from sets the player has actually opened/discovered. The
   Default board shows the full live market; filters/search narrow that
   market to cards the player can actually act on. */
(() => {
  'use strict';

  const REFRESH_HOURS = 1;
  const MARKET_SIZE = 24;
  const MARKET_RETRY_MS = 15000;
  const MARKET_VERSION = 'v0405-exact-physical-rarity';
  const TRAINERS = [
    ['AceLuna','🌙'],['BerryByte','🍓'],['Route3Ranger','🧭'],['MewMint','✨'],['CardSage','🃏'],
    ['VoltVee','⚡'],['MoonBallMike','🌕'],['GengarFan','👻'],['PikaParcel','📦'],['DexDiver','🔎'],
    ['RareRin','💎'],['KantoKid','🔴'],['JohtoJules','🟡'],['SinnohSky','🏔️'],['PaldeaPal','🍇'],
    ['HoloHana','🌈'],['MiraidonMain','🏍️'],['SleeveQueen','🛡️'],['BoosterBen','🎴'],['CrownChaser','👑'],
    ['PokePost','✉️'],['ArtRareAri','🎨'],['TradeTower','🏙️'],['BinderBee','🐝'],['LuckyLink','🍀']
  ];
  let tradeMode = 'same';
  let tradeSource = 'all';
  let tradeView = 'all';
  let marketBuildPromise = null;
  let lastMarketAttemptAt = 0;
  let tradeClockTimer = null;
  const tradeArtLookup = new Map();
  const tradeSetDetailCache = new Map();
  let tradeLibraryCatalogPromise = null;
  let cancelPendingConfirmation=null,viewSerial=0;
  const animationWaits=new Map();

  const $ = id => document.getElementById(id);
  const safe = value => typeof escapeHtml === 'function' ? escapeHtml(value ?? '') : String(value ?? '');
  const sourceOf = card => card?.source || (/^[AB]\d/i.test(String(card?.setId || card?.set?.id || '')) ? 'tcgp' : 'tcg');
  const setIdOf = card => String(card?.setId || card?.set?.id || card?.set || '');
  const setNameOf = card => String(card?.setName || card?.set?.name || card?.set || card?.setId || 'Unknown set');
  const countOf = card => Math.max(0, Number(card?.count || 0));
  const setIdentity = card => `${sourceOf(card)}:${norm(setNameOf(card))||norm(setIdOf(card))}`;
  const sameSet = (a,b) => !!a && !!b && setIdentity(a)===setIdentity(b);
  function tradeAcquisition(card,set=null){
    try{return window.LuckyDexCardAcquisition?.classify?.(card,set||{id:setIdOf(card),name:setNameOf(card)})||'booster';}catch(_){return /\bpromo\b/i.test(String(card?.rarity||''))?'promo_vault':'booster';}
  }
  function tradeRarityClass(card,set=null){
    const acquisition=tradeAcquisition(card,set);
    if(acquisition==='achievement_reward')return 'achievement';
    if(acquisition==='promo_vault'||card?._promo===true)return 'promo';
    if(sourceOf(card)==='tcgp'&&window.LuckyDexCardRarity?.pocketTradeClass){const exact=window.LuckyDexCardRarity.pocketTradeClass(card?.rarity);if(exact)return exact;}
    if(window.LuckyDexCardRarity?.tradeClass)return window.LuckyDexCardRarity.tradeClass(card,set);
    return rarityTier(card||{rarity:'Unknown'});
  }
  function tradeClassDistance(a,b){if(typeof a==='string'||typeof b==='string')return a===b?0:99;return Math.abs(Number(a)-Number(b));}
  function tradeClassLabel(value){if(value==='promo')return 'Promo';if(value==='achievement')return 'Achievement Reward';if(typeof value==='string'){const shared=window.LuckyDexCardRarity?.tradeClassLabel?.(value);if(shared)return shared;return value.replace(/^(?:tcg|tcgp):/,'').replace(/-/g,' ');}return tierLabel(Number(value));}
  function tradeEligible(card,set=null){return tradeRarityClass(card,set)!=='achievement';}
  const human = (value,fallback='Card') => typeof humanCardText==='function' ? humanCardText(value,fallback) : String(value||fallback);
  const norm = v => String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  function ownedEntry(card){
    if(!card)return null;
    if(state.cards?.[card.id])return {key:card.id,card:state.cards[card.id]};
    const wantedName=norm(card.name),wantedNum=norm(card.localId||card.number),wantedSet=norm(card.setName||card.set?.name||''),wantedSource=sourceOf(card);
    const matches=Object.entries(state.cards||{}).filter(([,row])=>{
      if(countOf(row)<1||sourceOf(row)!==wantedSource)return false;
      if(wantedName&&norm(row.name)!==wantedName)return false;
      const rowNum=norm(row.localId||row.number);if(wantedNum&&rowNum&&rowNum!==wantedNum)return false;
      const rowSet=norm(row.setName||row.set?.name||'');if(wantedSet&&rowSet&&rowSet!==wantedSet)return false;
      return true;
    });
    return matches.length===1?{key:matches[0][0],card:matches[0][1]}:null;
  }


  function ensureTradeState(){
    if(!state.trade || typeof state.trade !== 'object') state.trade = {};
    if(!state.trade.openedSets || typeof state.trade.openedSets !== 'object') state.trade.openedSets = {};
    if(!state.trade.boards || typeof state.trade.boards !== 'object') state.trade.boards = {};
    if(!Number.isFinite(Number(state.trade.totalTrades))) state.trade.totalTrades = 0;
    // v0.24 migrates away from per-filter boards. Keep legacy `boards` data
    // untouched for backwards/forwards save compatibility, but never read it
    // as the live market source of truth.
    if(state.trade.marketVersion !== MARKET_VERSION){
      state.trade.marketVersion = MARKET_VERSION;
      delete state.trade.market;
      delete state.trade.currentSlot;
    }

    // Existing saves predate the trade feature. Any set represented in the
    // binder was necessarily opened/discovered and is therefore safe to reveal.
    for(const card of Object.values(state.cards || {})){
      if(!tradeEligible(card))continue;
      const setId = setIdOf(card); if(!setId) continue;
      const source = sourceOf(card), key = `${source}:${setId}`;
      state.trade.openedSets[key] = {source,setId,setName:setNameOf(card)};
    }
    return state.trade;
  }

  function localSlotInfo(date = new Date()){
    const y=date.getFullYear(), m=String(date.getMonth()+1).padStart(2,'0'), d=String(date.getDate()).padStart(2,'0');
    const bucket=Math.floor(date.getHours()/REFRESH_HOURS);
    const next=new Date(date);next.setMinutes(0,0,0);next.setHours((bucket+1)*REFRESH_HOURS);
    return {slot:`${y}-${m}-${d}:${bucket}`,next};
  }

  function formatCountdown(ms){
    ms=Math.max(0,ms);const total=Math.floor(ms/1000),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function updateTradeClock(){
    const el=$('tradeCountdown');if(!el)return;
    const info=localSlotInfo();el.textContent=formatCountdown(info.next-Date.now());
  }

  function marketRefreshDue(now=Date.now()){return !lastMarketAttemptAt || now-lastMarketAttemptAt>=MARKET_RETRY_MS;}
  function markMarketAttempt(now=Date.now()){lastMarketAttemptAt=Number(now)||Date.now();}

  function refreshTradeClock(){
    updateTradeClock();
    const info=localSlotInfo();
    const trade=ensureTradeState();
    if(trade.currentSlot && trade.currentSlot!==info.slot && marketRefreshDue() && document.querySelector('[data-page="trade"]')?.classList.contains('active')){
      renderTradeBoard(true);
    }
  }

  function hash32(text){
    let h=2166136261>>>0;for(let i=0;i<String(text).length;i++){h^=String(text).charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;
  }
  function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
  function pick(arr,rng){return arr?.length?arr[Math.floor(rng()*arr.length)]:null;}
  function shuffle(arr,rng){const out=[...arr];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}

  function discoveredSets(sourceFilter='all'){
    const trade=ensureTradeState(),seen=new Set(),out=[];
    for(const row of Object.values(trade.openedSets)){
      if(sourceFilter!=='all'&&row.source!==sourceFilter)continue;
      if(row.source==='tcg'&&window.LuckyDexCardAcquisition?.tradeCatalogSetEligible?.({id:row.setId,name:row.setName})===false)continue;
      const identity=`${row.source}:${norm(row.setName||row.setId)}`;
      if(seen.has(identity))continue;
      seen.add(identity);out.push(row);
    }
    return out.sort((a,b)=>`${a.source}:${norm(a.setId||a.setName)}`.localeCompare(`${b.source}:${norm(b.setId||b.setName)}`));
  }

  function openedSetFingerprint(){
    return discoveredSets('all').map(row=>`${row.source}:${norm(row.setId||row.setName)}`).sort().join('|');
  }

  function ownedCards(sourceFilter='all'){
    return Object.values(state.cards||{}).filter(c=>countOf(c)>0 && tradeEligible(c) && (sourceFilter==='all'||sourceOf(c)===sourceFilter));
  }

  async function tradeLibraryCatalog(){
    if(!window.LuckyDexCardArt?.catalog)return [];
    if(!tradeLibraryCatalogPromise)tradeLibraryCatalogPromise=LuckyDexCardArt.catalog().catch(()=>[]);
    return tradeLibraryCatalogPromise;
  }

  async function exactLibrarySet(meta){
    if(!meta?.setId||meta.source!=='tcg'||!window.LuckyDexCardArt?.prepareSet)return null;
    try{
      const catalog=await tradeLibraryCatalog(),wantedId=String(meta.setId||'').replace(/^library:/i,'').toLowerCase(),wantedName=norm(meta.setName||'');
      const hits=catalog.filter(set=>{
        const key=String(set?._libraryKey||set?.id||'').replace(/^library:/i,'').toLowerCase();
        return (wantedId&&key===wantedId)||(wantedName&&norm(set?.name)===wantedName);
      });
      const unique=[];for(const set of hits)if(!unique.includes(set))unique.push(set);
      if(unique.length!==1)return null;
      const hydrated=await LuckyDexCardArt.prepareSet(unique[0]);
      return hydrated?.cards?.length?hydrated:null;
    }catch(_){return null;}
  }

  function looksLikeFullSet(set){
    const cards=Array.isArray(set?.cards)?set.cards:[],reported=Number(set?.cardCount?.total||set?.setTotal||0);
    if(!cards.length)return false;
    if(!reported)return cards.length>=12;
    return cards.length>=Math.min(reported,Math.max(12,Math.floor(reported*.88)));
  }

  async function ensureSetDetail(meta){
    if(!meta?.setId)return null;
    const cacheKey=`${meta.source}:${norm(meta.setName||meta.setId)}`;
    if(tradeSetDetailCache.has(cacheKey))return tradeSetDetailCache.get(cacheKey);
    const work=(async()=>{
      // Physical TCG trades use the same deterministic exact catalogue that
      // powers the binder artwork. This prevents the old failure mode where an
      // unavailable remote set API silently turned the player's owned cards
      // into the entire simulated global market.
      const library=await exactLibrarySet(meta);
      if(looksLikeFullSet(library))return library;

      let set=null;
      try{set=cachedSetV13(meta.setId,meta.source);}catch(_){ }
      if(!set)try{set=(setCache?.[meta.source]||[]).find(s=>s.id===meta.setId)||null;}catch(_){ }
      if(looksLikeFullSet(set))return set;
      try{
        if(meta.source==='tcgp' && window.LuckyDexPocket) set=await LuckyDexPocket.setDetail(meta.setId);
        else if(typeof packFetch==='function') set=await packFetch(API.tcgSet(meta.setId),null,5200);
        else set=await fetchJson(API.tcgSet(meta.setId),5200);
        if(set?.id)try{cacheSetV13(set,meta.source);}catch(_){ }
        return looksLikeFullSet(set)?set:null;
      }catch(_){
        // Never use the player's binder as a substitute catalogue. If the full
        // set is unavailable, skip that simulated listing instead of fabricating
        // an ownership-biased market.
        return null;
      }
    })();
    tradeSetDetailCache.set(cacheKey,work);
    const result=await work;
    if(!result)tradeSetDetailCache.delete(cacheKey);
    return result;
  }

  function normalizeTradeCard(card,set,source){
    if(!card)return null;
    const id=String(card.id||'');if(!id)return null;
    const out={
      id,name:card.name||'Unknown card',rarity:card.rarity||'Unknown',image:card.image||'',localId:card.localId||card.number||'',
      setId:card.set?.id||card.setId||set?.id||'',setName:card.set?.name||card.setName||set?.name||'',
      setTotal:Number(card.set?.cardCount?.total||card.setTotal||set?.cardCount?.total||0),source:source||card.source||'tcg'
    };
    try{
      const codes=typeof physicalSetCodesV163==='function'?physicalSetCodesV163(card,set):[];
      if(codes[0])out._limitlessSetCode=codes[0];
    }catch(_){if(card._limitlessSetCode)out._limitlessSetCode=card._limitlessSetCode;}
    if(card._tcgpFallbacks?.length)out._tcgpFallbacks=[...card._tcgpFallbacks];
    if(card._pocketImageFile)out._pocketImageFile=card._pocketImageFile;
    if(card._pocketNative)out._pocketNative=true;
    for(const key of ['_foil','finish','foil','printing','surface'])if(card[key]!=null&&card[key]!=='')out[key]=card[key];
    return out;
  }

  async function chooseOfferCard(set,source,targetClass,excludeIds,rng){
    const briefs=(set?.cards||[]).filter(c=>c?.id&&!excludeIds.has(c.id)&&tradeEligible(c,set));
    if(!briefs.length)return null;

    let card=null;
    const classified=briefs.map(c=>({c,t:tradeRarityClass(c,set)}));
    if(targetClass==='promo'){
      const pool=classified.filter(x=>x.t==='promo');
      if(!pool.length)return null;
      card=pick(pool,rng)?.c;
    }else if(typeof targetClass==='string'){
      const pool=classified.filter(x=>x.t===targetClass);
      if(!pool.length)return null;
      card=pick(pool,rng)?.c;
    }else{
      const hasRarity=briefs.filter(c=>c.rarity && !/^(?:none|unknown)$/i.test(String(c.rarity)));
      if(source==='tcgp'||hasRarity.length>=Math.min(8,Math.ceil(briefs.length*.35))){
        const ranked=classified.filter(x=>typeof x.t==='number');
        if(!ranked.length)return null;
        let pool=ranked.filter(x=>x.t===targetClass);
        if(!pool.length){const min=Math.min(...ranked.map(x=>tradeClassDistance(x.t,targetClass)));pool=ranked.filter(x=>tradeClassDistance(x.t,targetClass)===min);}
        card=pick(pool,rng)?.c;
      }else{
        try{card=await pickCardForTier(briefs,Number(targetClass),excludeIds);}catch(_){card=pick(briefs,rng);}
      }
    }
    if(!card)return null;
    try{if((!card.rarity||/^(?:none|unknown)$/i.test(String(card.rarity)))&&source!=='tcgp')card=await getCardDetail(card);}catch(_){ }
    if(!tradeEligible(card,set))return null;
    if(targetClass==='promo'&&tradeRarityClass(card,set)!=='promo')return null;
    try{if(!card.image && typeof resolveCardArtwork==='function')card.image=await resolveCardArtwork(card,set,source);}catch(_){ }
    return normalizeTradeCard(card,set,source);
  }

  function relationRoll(rng,requestTier){
    // Pocket printed rarities are exact trade classes: a Crown is never a
    // Two Diamond (or even a 3-star) merely because both are "high" cards.
    if(typeof requestTier==='string')return {askDelta:0,offerTier:requestTier};
    // Physical TCG uses the established value-tier market. Occasionally the simulated trainer asks one tier
    // above or below the card they're offering.
    const r=rng();let askDelta=0;
    if(r<.08)askDelta=-1;       // request lower than offer: good for player
    else if(r>.92)askDelta=1;   // request higher than offer: harder bargain
    let offerTier=requestTier-askDelta;
    if(offerTier<0||offerTier>6){askDelta=0;offerTier=requestTier;}
    return {askDelta,offerTier};
  }

  function requestCandidate(pool,rng,usedRequests){
    let available=pool.filter(c=>!usedRequests.has(c.id));if(!available.length)available=pool;
    const duplicates=available.filter(c=>countOf(c)>1);
    return pick(duplicates.length&&rng()<.72?duplicates:available,rng);
  }

  async function requestFromOpenedSet(sourceFilter,rng,usedRequests,preferUnowned=false){
    const metas=shuffle(discoveredSets(sourceFilter),rng);
    for(const meta of metas){
      const set=await ensureSetDetail(meta);
      let pool=(set?.cards||[]).filter(c=>c?.id&&tradeEligible(c,set)&&!usedRequests.has(String(c.id)));
      if(!pool.length)pool=(set?.cards||[]).filter(c=>c?.id&&tradeEligible(c,set));
      if(!pool.length)continue;
      if(preferUnowned){
        const unseen=pool.filter(c=>countOf(state.cards?.[c.id])===0);
        if(unseen.length)pool=unseen;
      }
      let card=pick(pool,rng);if(!card)continue;
      try{
        if(meta.source!=='tcgp' && (!card.rarity||/^(?:none|unknown)$/i.test(String(card.rarity)))) card=await getCardDetail(card);
      }catch(_){ }
      try{
        if(!card.image && typeof resolveCardArtwork==='function')card.image=await resolveCardArtwork(card,set,meta.source);
      }catch(_){ }
      const normalized=normalizeTradeCard(card,set,meta.source);
      if(normalized)return normalized;
    }
    return null;
  }

  async function generateOffer(index,mode,sourceFilter,rng,usedRequests,usedOffers){
    const opened=discoveredSets(sourceFilter);
    if(!opened.length)return null;
    for(let attempt=0;attempt<10;attempt++){
      // Both sides of a listing are sampled from discovered sets, independent
      // of what the player owns. This makes the board look like a real global
      // market. Ownership only controls whether a listing is actionable.
      const request=await requestFromOpenedSet(sourceFilter,rng,usedRequests,false);
      if(!request)continue;

      const reqSource=sourceOf(request),reqSetId=setIdOf(request),reqClass=tradeRarityClass(request);
      if(reqClass==='achievement')continue;
      const relation=reqClass==='promo'?{askDelta:0,offerClass:'promo'}:(()=>{const row=relationRoll(rng,reqClass);return {...row,offerClass:row.offerTier};})();
      let sets=discoveredSets(sourceFilter);
      const requestIdentity=setIdentity(request);
      if(mode==='same'){
        // SAME SET is strict: the offer must come from the exact same discovered set.
        sets=sets.filter(meta=>`${meta.source}:${norm(meta.setName||meta.setId)}`===requestIdentity);
      }else{
        // ACROSS SETS is also strict: never silently fall back to the request set.
        sets=sets.filter(meta=>`${meta.source}:${norm(meta.setName||meta.setId)}`!==requestIdentity);
      }
      if(!sets.length)continue;
      const setMeta=pick(sets,rng),set=await ensureSetDetail(setMeta);if(!set?.cards?.length)continue;
      let offer=await chooseOfferCard(set,setMeta.source,relation.offerClass,new Set([...usedOffers,request.id]),rng);if(!offer)continue;
      // Rarity fairness matters more than making every row use a unique offered
      // card. If uniqueness pushes us outside the intended tier, allow a repeat
      // offer before accepting a lopsided bargain.
      if(tradeRarityClass(offer)!==relation.offerClass){
        const retry=await chooseOfferCard(set,setMeta.source,relation.offerClass,new Set([request.id]),rng);
        if(retry && tradeClassDistance(tradeRarityClass(retry),relation.offerClass)<tradeClassDistance(tradeRarityClass(offer),relation.offerClass))offer=retry;
      }
      const offerClass=tradeRarityClass(offer);
      if(offer.id===request.id||offerClass==='achievement'||tradeClassDistance(offerClass,reqClass)>1)continue;
      if((reqClass==='promo'||offerClass==='promo')&&reqClass!==offerClass)continue;
      // Final semantic guard: mode labels and generated rows must always agree.
      if(mode==='same'&&!sameSet(request,offer))continue;
      if(mode!=='same'&&sameSet(request,offer))continue;
      usedRequests.add(request.id);usedOffers.add(offer.id);
      const trainer=TRAINERS[(hash32(`${localSlotInfo().slot}:${mode}:${sourceFilter}:${index}:${request.id}:${offer.id}`)+index)%TRAINERS.length];
      const actualReqTier=rarityTier(request.rarity||'Unknown'),actualOfferTier=rarityTier(offer.rarity||'Unknown'),actualReqClass=tradeRarityClass(request),actualOfferClass=tradeRarityClass(offer);
      return {
        id:`${index}-${hash32(`${request.id}|${offer.id}|${trainer[0]}`).toString(36)}`,
        trainer:trainer[0],avatar:trainer[1],accepted:false,
        request:normalizeTradeCard(request,{id:reqSetId,name:setNameOf(request)},reqSource),offer,
        reqTier:actualReqTier,offerTier:actualOfferTier,reqClass:actualReqClass,offerClass:actualOfferClass
      };
    }
    return null;
  }

  async function buildMarket(slot){
    const fingerprint=openedSetFingerprint();
    const buckets=[];
    for(const source of ['tcg','tcgp']){
      const count=discoveredSets(source).length;
      if(count>0)buckets.push({mode:'same',source});
      if(count>1)buckets.push({mode:'global',source});
    }
    // No discovered sets is the only genuinely empty market state.
    if(!buckets.length)return {valid:true,fingerprint,listings:[]};

    const bucketState=buckets.map(bucket=>({
      ...bucket,
      rng:mulberry32(hash32(`LuckyDexTrade|${slot}|${fingerprint}|${bucket.mode}|${bucket.source}`)),
      usedRequests:new Set(),usedOffers:new Set(),dead:false,produced:0
    }));
    const offers=[];
    let rounds=0;
    while(offers.length<MARKET_SIZE && rounds<MARKET_SIZE*3 && bucketState.some(b=>!b.dead)){
      rounds++;
      for(const bucket of bucketState){
        if(bucket.dead||offers.length>=MARKET_SIZE)continue;
        const offer=await generateOffer(offers.length,bucket.mode,bucket.source,bucket.rng,bucket.usedRequests,bucket.usedOffers);
        if(!offer){bucket.dead=true;continue;}
        offer.source=bucket.source;
        offer.sameSet=bucket.mode==='same';
        offers.push(offer);bucket.produced++;
      }
    }
    if(!offers.length||bucketState.some(bucket=>bucket.produced===0))return {valid:false,fingerprint,listings:[]};
    return {valid:true,fingerprint,listings:offers};
  }

  function currentMarket(){
    const market=ensureTradeState().market;
    return Array.isArray(market?.listings)?market.listings:[];
  }

  function marketForModeSource(listings=currentMarket(),mode=tradeMode,source=tradeSource){
    return (listings||[]).filter(row=>(mode==='same'?row.sameSet===true:row.sameSet===false) && (source==='all'||row.source===source));
  }

  function filterMarket(listings=currentMarket(),controls={}){
    const mode=controls.mode||tradeMode,source=controls.source||tradeSource,view=controls.view||tradeView;
    const query=String(controls.search??'').trim().toLowerCase();
    let rows=marketForModeSource(listings,mode,source);
    if(view==='tradeable')rows=rows.filter(row=>countOf(ownedEntry(row.request)?.card)>0);
    else if(view==='spares')rows=rows.filter(row=>countOf(ownedEntry(row.request)?.card)>1);
    if(query){
      rows=rows.filter(row=>[row.trainer,row.offer?.name,row.request?.name,row.offer?.setName,row.request?.setName,row.offer?.rarity,row.request?.rarity]
        .some(value=>String(value||'').toLowerCase().includes(query)));
    }
    return rows;
  }

  function resetCatalogueCaches(){
    tradeSetDetailCache.clear();
    tradeLibraryCatalogPromise=null;
  }

  async function ensureMarket(force=false){
    const trade=ensureTradeState(),info=localSlotInfo(),fingerprint=openedSetFingerprint();
    const market=trade.market;
    const isCurrent=market && market.version===MARKET_VERSION && market.slot===info.slot &&
      market.openedSetFingerprint===fingerprint && Array.isArray(market.listings);
    if(isCurrent&&!force)return market.listings;
    if(marketBuildPromise)return marketBuildPromise;

    const previous=market&&Array.isArray(market.listings)?market:null;
    markMarketAttempt();
    const promise=(async()=>{
      const built=await buildMarket(info.slot);
      if(!built.valid)return previous?.listings||[];
      const snapshot={
        version:MARKET_VERSION,
        slot:info.slot,
        generatedAt:Date.now(),
        expiresAt:info.next.getTime(),
        openedSetFingerprint:built.fingerprint,
        listings:built.listings
      };
      trade.market=snapshot;
      trade.currentSlot=info.slot; // compatibility for older diagnostics/tests
      try{if(typeof save==='function')save();else localStorage.setItem('luckyDexSave',JSON.stringify(state));}catch(_){ }
      return snapshot.listings;
    })().finally(()=>{marketBuildPromise=null;});
    marketBuildPromise=promise;
    return promise;
  }

  async function augmentMarketForSet(meta){
    const trade=ensureTradeState(),market=trade.market,info=localSlotInfo();
    if(!market||market.slot!==info.slot||!Array.isArray(market.listings))return 0;
    const source=meta.source,setIdentityWanted=`${source}:${norm(meta.setName||meta.setId)}`;
    const existingIds=new Set(market.listings.map(row=>row.id));
    const added=[];
    const modes=['same'];if(discoveredSets(source).length>1)modes.push('global');
    for(const mode of modes){
      const rng=mulberry32(hash32(`LuckyDexTrade|augment|${info.slot}|${setIdentityWanted}|${mode}`));
      const usedRequests=new Set(),usedOffers=new Set();
      let acceptedForMode=0;
      for(let attempt=0;attempt<36&&acceptedForMode<2;attempt++){
        const row=await generateOffer(market.listings.length+added.length,mode,source,rng,usedRequests,usedOffers);
        if(!row)continue;
        row.source=source;row.sameSet=mode==='same';
        const involvesNew=setIdentity(row.request)===setIdentityWanted||setIdentity(row.offer)===setIdentityWanted;
        if(!involvesNew||existingIds.has(row.id)||added.some(x=>x.id===row.id))continue;
        added.push(row);acceptedForMode++;
      }
    }
    if(added.length)market.listings.push(...added);
    market.openedSetFingerprint=openedSetFingerprint();
    try{if(typeof save==='function')save();else localStorage.setItem('luckyDexSave',JSON.stringify(state));}catch(_){ }
    return added.length;
  }

  async function noteOpenedSet(meta){
    const source=meta?.source==='tcgp'?'tcgp':'tcg',setId=String(meta?.setId||''),setName=String(meta?.setName||meta?.setId||'');
    if(!setId&&!setName)return false;
    if(source==='tcg'&&window.LuckyDexCardAcquisition?.tradeCatalogSetEligible?.({id:setId,name:setName})===false)return false;
    if(!state.trade||typeof state.trade!=='object')state.trade={};
    if(!state.trade.openedSets||typeof state.trade.openedSets!=='object')state.trade.openedSets={};
    const exists=Object.values(state.trade.openedSets).some(row=>row?.source===source &&
      ((setId&&String(row.setId||'')===setId)||(setName&&norm(row.setName||row.setId)===norm(setName))));
    if(exists)return false;
    const key=`${source}:${setId||norm(setName)}`;
    state.trade.openedSets[key]={source,setId,setName:setName||setId};
    ensureTradeState();
    resetCatalogueCaches();
    await augmentMarketForSet(state.trade.openedSets[key]);
    try{if(typeof save==='function')save();else localStorage.setItem('luckyDexSave',JSON.stringify(state));}catch(_){ }
    return true;
  }

  // Compatibility wrapper while older callers still request a board. It no
  // longer generates data per button; it only filters the one market snapshot.
  async function ensureBoard(force=false){
    const listings=await ensureMarket(force);
    return marketForModeSource(listings,tradeMode,tradeSource);
  }

  function tradeDealClass(row){
    const offerClass=row.offerClass??tradeRarityClass(row.offer),reqClass=row.reqClass??tradeRarityClass(row.request);
    if(offerClass==='promo'||reqClass==='promo')return offerClass===reqClass?['','Matched Promo trade']:['risky','Promo rarity mismatch'];
    if(typeof offerClass==='string'||typeof reqClass==='string')return offerClass===reqClass?['','Matched rarity trade']:['risky','Rarity class mismatch'];
    if(Number(offerClass)>Number(reqClass))return ['good','They are offering the rarer card'];
    if(Number(offerClass)<Number(reqClass))return ['risky','They are asking for the rarer card'];
    return ['','Matched rarity trade'];
  }

  function tradeArtworkCandidates(card){
    const candidates=[],add=url=>{url=String(url||'');if(url&&!candidates.includes(url))candidates.push(url);};
    // Prefer a verified/known image, then the deterministic physical CDN, then
    // the low-res and Pocket fallbacks. This keeps current promo sets usable
    // even when one catalogue is behind another.
    try{if(card.image)add(cardImage(card.image,'high'));}catch(_){ }
    try{if(typeof physicalCardArtworkCandidatesV163==='function')for(const url of physicalCardArtworkCandidatesV163(card,null))add(url);}catch(_){ }
    try{if(card.image)add(cardImage(card.image,'low'));}catch(_){ }
    for(const f of card._tcgpFallbacks||[])add(f);
    return candidates;
  }

  function tradeCardArt(card,token){
    const candidates=tradeArtworkCandidates(card);
    tradeArtLookup.set(token,{card,candidates,index:0});
    const src=candidates[0]||'';
    return `<div class="trade-card-art ${src?'':'broken'}"><img ${src?`src="${safe(src)}"`:''} data-trade-art="${safe(token)}" alt="${safe(card.name)}" onerror="tradeImageFallback(this)"><div class="trade-art-fallback">Artwork unavailable<br>${safe(card.name)}</div></div>`;
  }

  async function recoverTradeArtwork(row,img){
    if(!row||!img||row.recoveryTried)return false;
    row.recoveryTried=true;
    const card=row.card;let recovered='';
    try{
      if(typeof window.resolveCardArtwork==='function')recovered=await window.resolveCardArtwork(card,null,sourceOf(card));
      else if(sourceOf(card)==='tcgp'&&window.LuckyDexPocket?.resolveCard){
        const exact=await window.LuckyDexPocket.resolveCard(card);
        if(exact?.image){Object.assign(card,exact);recovered=exact.image;}
      }
    }catch(_){ }
    if(!recovered)return false;
    card.image=recovered;
    try{save();}catch(_){ }
    const src=typeof cardImage==='function'?cardImage(recovered,'high','webp'):recovered;
    if(!row.candidates.includes(src))row.candidates.push(src);
    row.index=row.candidates.indexOf(src);
    img.parentElement?.classList.remove('broken');
    img.src=src;
    return true;
  }

  window.tradeImageFallback=async function(img){
    const row=tradeArtLookup.get(img.dataset.tradeArt);if(!row){img.parentElement?.classList.add('broken');return;}
    row.index++;
    if(row.index<row.candidates.length){img.src=row.candidates[row.index];return;}
    if(await recoverTradeArtwork(row,img))return;
    img.parentElement?.classList.add('broken');
  };

  function tradeAnimationArt(card){return tradeArtworkCandidates(card)[0]||'';}

  function ensureTradeConfirm(){
    let modal=$('tradeConfirmModal');if(modal)return modal;
    modal=document.createElement('div');
    modal.id='tradeConfirmModal';modal.className='trade-confirm-overlay';modal.hidden=true;
    modal.innerHTML=`<div class="trade-confirm-backdrop" data-trade-confirm-cancel></div><section class="trade-confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="tradeConfirmTitle"><div class="trade-confirm-head"><div class="trade-confirm-mark">⇄</div><div><small>GLOBAL LINK TRADE</small><h3 id="tradeConfirmTitle">Confirm trade</h3></div><button class="trade-confirm-close" type="button" data-trade-confirm-cancel aria-label="Cancel trade">✕</button></div><div class="trade-confirm-trainer" id="tradeConfirmTrainer"></div><div class="trade-confirm-pair"><div class="trade-confirm-card" id="tradeConfirmSend"></div><div class="trade-confirm-arrow"><span>⇄</span></div><div class="trade-confirm-card incoming" id="tradeConfirmReceive"></div></div><div class="trade-confirm-warning" id="tradeConfirmWarning"></div><div class="trade-confirm-actions"><button class="secondary" type="button" data-trade-confirm-cancel>KEEP CARD</button><button class="primary" type="button" id="tradeConfirmAccept">TRADE NOW</button></div></section>`;
    document.body.appendChild(modal);return modal;
  }

  function tradeConfirmCard(card,label,count){
    const src=tradeAnimationArt(card),owned=Math.max(0,Number(count||0));
    return `<span>${safe(label)}</span><div class="trade-confirm-art ${src?'':'missing'}">${src?`<img src="${safe(src)}" alt="${safe(card.name)}" onerror="this.parentElement.classList.add('missing');this.remove()">`:''}<div class="trade-confirm-art-fallback">${safe(card.name)}</div></div><b>${safe(human(card.name,'Unknown card'))}</b><small>${safe(human(card.setName||card.setId,'Unknown set'))}</small><em>OWNED ×${owned}</em>`;
  }

  function confirmTradeInApp(row,requested){
    const modal=ensureTradeConfirm(),sendCount=countOf(requested),recvCount=countOf(ownedEntry(row.offer)?.card);
    modal.querySelector('#tradeConfirmTrainer').innerHTML=`<b>${safe(row.avatar)} ${safe(row.trainer)}</b><span>is offering this Link Trade</span>`;
    modal.querySelector('#tradeConfirmSend').innerHTML=tradeConfirmCard(row.request,'YOU SEND',sendCount);
    modal.querySelector('#tradeConfirmReceive').innerHTML=tradeConfirmCard(row.offer,'YOU RECEIVE',recvCount);
    const warning=modal.querySelector('#tradeConfirmWarning');
    warning.className=`trade-confirm-warning ${sendCount===1?'last-copy':''}`;
    warning.innerHTML=sendCount===1?`<b>LAST COPY</b><span>This is your only ${safe(row.request.name)}. The trade cannot be undone.</span>`:`<b>READY TO TRADE</b><span>You will have ${Math.max(0,sendCount-1)} cop${sendCount-1===1?'y':'ies'} of ${safe(row.request.name)} remaining.</span>`;
    modal.hidden=false;requestAnimationFrame(()=>modal.classList.add('show'));
    return new Promise(resolve=>{
      let finished=false;
      const done=value=>{if(finished)return;finished=true;modal.classList.remove('show');modal.hidden=true;cancelPendingConfirmation=null;cleanup();resolve(value);};
      const cancel=[...modal.querySelectorAll('[data-trade-confirm-cancel]')],accept=modal.querySelector('#tradeConfirmAccept');
      const onCancel=()=>done(false),onAccept=()=>done(true),onKey=e=>{if(e.key==='Escape')done(false);};
      const cleanup=()=>{cancel.forEach(el=>el.removeEventListener('click',onCancel));accept.removeEventListener('click',onAccept);document.removeEventListener('keydown',onKey);};
      cancel.forEach(el=>el.addEventListener('click',onCancel));accept.addEventListener('click',onAccept);document.addEventListener('keydown',onKey);
      cancelPendingConfirmation=onCancel;
    });
  }

  function ensureTradeFx(){
    let fx=$('tradeExchangeFx');if(fx)return fx;
    fx=document.createElement('div');
    fx.id='tradeExchangeFx';fx.className='trade-exchange-fx';fx.hidden=true;
    fx.innerHTML=`<div class="trade-fx-backdrop"></div><div class="trade-fx-stage"><div class="trade-fx-burst"></div><div class="trade-fx-streaks"><i></i><i></i><i></i><i></i></div><div class="trade-fx-sparkles"></div><div class="trade-fx-card trade-fx-outgoing"></div><div class="trade-fx-card trade-fx-incoming"></div><div class="trade-fx-copy" hidden><small>LINK TRADE</small><b></b><span></span></div></div>`;
    document.body.appendChild(fx);return fx;
  }

  function fxCardFace(card){
    const src=tradeAnimationArt(card);
    return `<div class="trade-fx-face-art ${src?'':'missing'}">${src?`<img src="${safe(src)}" alt="${safe(card.name)}" onerror="this.parentElement.classList.add('missing')" />`:''}<div class="trade-fx-face-fallback"><b>${safe(card.name)}</b><small>${safe(card.rarity||'Card')}</small></div></div>`;
  }

  function fxCardBack(){
    const inner=window.LuckyDexCosmeticsV0413?.cardBackInnerHtml?.()||`<div class="trade-fx-ball"><i></i></div><b>LUCKY DEX</b>`;
    return `<div class="trade-fx-back">${inner}</div>`;
  }

  function fxExchangeCard(card,label){
    return `<div class="trade-fx-3d"><div class="trade-fx-front">${fxCardFace(card)}</div>${fxCardBack()}</div><span class="trade-fx-receive-label">${safe(label)}</span>`;
  }

  function populateTradeFx(row){
    const fx=ensureTradeFx(),out=fx.querySelector('.trade-fx-outgoing'),incoming=fx.querySelector('.trade-fx-incoming');
    out.classList.remove('flip-edge','face-back');incoming.classList.remove('flip-edge','face-back');
    // Both fronts are deliberately visible first so the exchange is readable.
    // They then turn face-down, cross the link, and only the received card is
    // revealed again once it has arrived in the centre.
    out.innerHTML=fxExchangeCard(row.request,'YOU SEND');
    incoming.innerHTML=fxExchangeCard(row.offer,'YOU RECEIVE');
    const spark=fx.querySelector('.trade-fx-sparkles');spark.innerHTML='';
    const count=14+Math.max(0,Math.min(6,Number(row.offerTier||0)))*4;
    for(let i=0;i<count;i++){
      const el=document.createElement('i'),a=(i/count)*Math.PI*2+(i%3)*.19,r=80+(i%6)*18;
      el.style.setProperty('--sx',`${Math.cos(a)*r}px`);el.style.setProperty('--sy',`${Math.sin(a)*r}px`);el.style.setProperty('--sd',`${(i%7)*34}ms`);spark.appendChild(el);
    }
    const copy=fx.querySelector('.trade-fx-copy');copy.hidden=true;copy.querySelector('b').textContent='';copy.querySelector('span').textContent='';
    fx.className=`trade-exchange-fx tier-${Math.max(0,Math.min(6,Number(row.offerTier||0)))}`;
    return fx;
  }

  function sleep(ms){return new Promise((resolve,reject)=>{const id=setTimeout(()=>{animationWaits.delete(id);resolve();},ms);animationWaits.set(id,()=>{clearTimeout(id);reject(new Error('Trade animation cancelled'));});});}

  async function flipFxFace(cardEl,toBack){
    const body=cardEl?.querySelector('.trade-fx-3d');if(!cardEl||!body)return;
    cardEl.classList.add('flip-edge');
    await sleep(340);
    cardEl.classList.toggle('face-back',!!toBack);
    // Swap artwork while visually edge-on, then expand the new face. This is
    // intentionally not a 180/360deg final transform, avoiding mirrored WebView
    // end states while still reading as a physical card turn.
    await sleep(45);
    cardEl.classList.remove('flip-edge');
    await sleep(360);
  }

  async function playTradeAnimation(row){
    const serial=viewSerial;
    const fx=populateTradeFx(row),out=fx.querySelector('.trade-fx-outgoing'),incoming=fx.querySelector('.trade-fx-incoming');
    fx.hidden=false;void fx.offsetWidth;fx.classList.add('running');
    try{vibrate([10,20,10]);}catch(_){ }

    // 1) Let the player identify both fronts before anything moves.
    await sleep(850);
    if(serial!==viewSerial)return;
    const copy=fx.querySelector('.trade-fx-copy');

    // 2) Both cards turn face-down, exposing an unmistakable LuckyDex back.
    await Promise.all([flipFxFace(out,true),flipFxFace(incoming,true)]);
    await sleep(260);

    // 3) Exchange the two face-down cards.
    fx.classList.add('exchanging');
    try{vibrate([12,28,12]);}catch(_){ }
    await sleep(1780);
    if(serial!==viewSerial)return;

    // 4) The received card has arrived. Reveal back -> edge -> front.
    await sleep(260);
    await flipFxFace(incoming,false);
    fx.classList.add('revealed');
    copy.hidden=false;copy.querySelector('b').textContent='Trade complete!';copy.querySelector('span').textContent=`Received ${row.offer.name}`;
    try{vibrate([18,30,26,30,18]);}catch(_){ }

    // Hold the actual received front long enough to register visually.
    await sleep(1900);
    fx.classList.add('leaving');await sleep(340);fx.hidden=true;fx.className='trade-exchange-fx';
  }

  function tradeCardRarityLabel(card){
    const cls=tradeRarityClass(card);
    if(typeof cls==='string'){
      const useful=tradeClassLabel(cls);
      if(useful&&useful!=='No Rarity')return useful;
    }
    return human(card?.rarity||'','');
  }
  function cardSide(card,kind,rowId){
    const entry=ownedEntry(card),owned=entry?.card,ownedCount=countOf(owned),isNew=!ownedCount;
    const meta=tradeCardRarityLabel(card);
    const setName=human(card.setName||card.setId,'Unknown set');
    return `<div class="trade-card-side"><span class="trade-side-label">${kind==='offer'?'THEY OFFER':'THEY WANT'}</span><div class="trade-card-shell ${kind==='offer'?'offer-card':''}" data-trade-card="${safe(card.id)}" data-trade-row="${safe(rowId)}" data-trade-kind="${kind}">${kind==='offer'&&isNew?'<span class="trade-new">NEW</span>':''}<span class="trade-owned ${ownedCount>1?'has-spares':''} ${ownedCount===0?'zero':''}">OWNED ×${ownedCount}</span>${tradeCardArt(card,`${rowId}:${kind}`)}<b>${safe(human(card.name,'Unknown card'))}</b>${meta?`<small>${safe(meta)}</small>`:''}<small class="trade-set-name">${safe(setName)}</small></div></div>`;
  }

  function tradeCounts(offers){
    const rows=(offers||[]).filter(row=>!row.accepted);
    return {
      all:rows.length,
      ready:rows.filter(row=>countOf(ownedEntry(row.request)?.card)>0).length,
      spares:rows.filter(row=>countOf(ownedEntry(row.request)?.card)>1).length
    };
  }

  function updateTradeBrowser(offers){
    const counts=tradeCounts(offers);
    const all=$('tradeAllCount'),ready=$('tradeReadyCount'),spares=$('tradeSpareCount');
    if(all)all.textContent=counts.all;if(ready)ready.textContent=counts.ready;if(spares)spares.textContent=counts.spares;
    document.querySelectorAll('[data-trade-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.tradeView===tradeView));
    document.querySelectorAll('[data-trade-source]').forEach(btn=>btn.classList.toggle('active',btn.dataset.tradeSource===tradeSource));
    const clear=$('tradeSearchClear'),query=String($('tradeSearch')?.value||'').trim();if(clear)clear.hidden=!query;
  }

  function renderOffers(listings=currentMarket()){
    const list=$('tradeOfferList');if(!list)return;
    const query=String($('tradeSearch')?.value||'').trim();
    const base=filterMarket(listings,{mode:tradeMode,source:tradeSource,view:'all',search:''});
    const visible=filterMarket(listings,{mode:tradeMode,source:tradeSource,view:tradeView,search:query});
    updateTradeBrowser(base);
    if(!visible.length){
      const any=base.length>0,hasSets=discoveredSets(tradeSource).length>0;
      const acrossNeedsMore=tradeMode!=='same'&&discoveredSets(tradeSource).length<2;
      const headline=any?'No matching trades':acrossNeedsMore?'Across Sets needs another set':hasSets?'No live listings loaded':'No trades available yet';
      const detail=any
        ?(tradeView==='spares'?'No live listing currently asks for a card you own twice.':tradeView==='tradeable'?'None of the live requests match a card in your binder.':'Try another card, trainer, rarity or set name.')
        :acrossNeedsMore?'Open a booster from a second set to unlock genuine cross-set listings. Same Set trades are still available.':hasSets?'Your discovered sets are known, but this market did not load any listings. Re-open Trade to retry the discovered-set catalogue.':'Open a booster pack first. Only cards from sets you have discovered can enter the market.';
      list.innerHTML=`<div class="trade-empty"><b>${headline}</b><span>${detail}</span></div>`;
      return;
    }
    list.innerHTML=visible.map(row=>{
      const [dealClass,dealCopy]=tradeDealClass(row),owned=ownedEntry(row.request)?.card,can=countOf(owned)>0,last=countOf(owned)===1;
      let action='';
      if(row.accepted)action='<div class="trade-accepted-stamp trade-action-full">✓ TRADE COMPLETE</div>';
      else if(can)action=`<button class="primary trade-accept trade-action-full ${last?'last-copy':''}" data-accept-trade="${safe(row.id)}"><b>${last?'ACCEPT TRADE · LAST COPY':'ACCEPT TRADE'}</b><span>Give ${safe(row.request.name)} · Receive ${safe(row.offer.name)}</span></button>`;
      else action=`<button class="trade-accept trade-action-full unavailable" disabled><b>NEED ${safe(row.request.name).toUpperCase()}</b><span>Find this card in ${safe(row.request.setName||row.request.setId)} to accept</span></button>`;
      return `<article class="trade-offer ${row.accepted?'accepted':''} ${can?'trade-ready':'trade-missing'}" data-trade-offer="${safe(row.id)}"><div class="trade-person"><div class="trade-avatar">${row.avatar}</div><div class="trade-person-copy"><b>${safe(row.trainer)}</b><span>${row.accepted?'Trade completed':can?'You can make this trade':'Global listing · request not in your binder'}</span></div><div class="trade-online"><i></i>${row.accepted?'DONE':can?'READY':'ONLINE'}</div></div><div class="trade-pair">${cardSide(row.offer,'offer',row.id)}<div class="trade-arrow"><span>⇄</span></div>${cardSide(row.request,'request',row.id)}</div><div class="trade-meta"><div class="trade-deal-copy ${dealClass}"><b>${safe(dealCopy)}</b><span>${(row.offerClass??tradeRarityClass(row.offer))===(row.reqClass??tradeRarityClass(row.request))?tradeClassLabel(row.offerClass??tradeRarityClass(row.offer)):`${tradeClassLabel(row.offerClass??tradeRarityClass(row.offer))} ⇄ ${tradeClassLabel(row.reqClass??tradeRarityClass(row.request))}`} · ${tradeMode==='same'?'same set':'across discovered sets'}</span></div></div><div class="trade-action-row">${action}</div></article>`;
    }).join('');

    list.querySelectorAll('[data-accept-trade]').forEach(btn=>btn.onclick=()=>acceptTrade(btn.dataset.acceptTrade));
    list.querySelectorAll('[data-trade-card]').forEach(el=>el.onclick=()=>{
      const row=findCurrentOffer(el.dataset.tradeRow);const card=el.dataset.tradeKind==='offer'?row?.offer:row?.request;if(card)openCardModal(card);
    });
  }

  function currentBoard(){return filterMarket(currentMarket(),{mode:tradeMode,source:tradeSource,view:'all',search:''});}
  function findCurrentOffer(id){return currentMarket().find(x=>x.id===id);}

  function addTradedCard(card){
    const existing=state.cards[card.id];
    if(existing){existing.count=Number(existing.count||0)+1;existing.image=card.image||existing.image;existing.rarity=card.rarity||existing.rarity;return;}
    state.cards[card.id]={...card,count:1,firstPulled:Date.now()};
  }

  let tradeAnimating=false;
  async function acceptTrade(id){
    const row=findCurrentOffer(id);if(!row||row.accepted||tradeAnimating)return;
    const requestedEntry=ownedEntry(row.request),requested=requestedEntry?.card;
    if(!requested||countOf(requested)<1){showToast(`You need ${row.request.name} before you can accept this trade.`);renderOffers(currentMarket());return;}
    // Use the in-app Link Trade confirmation for every exchange. Besides looking
    // like LuckyDex instead of Android/WebView chrome, it makes last-copy risk
    // explicit while showing both cards and owned quantities before committing.
    tradeAnimating=true;
    if(!await confirmTradeInApp(row,requested)){tradeAnimating=false;return;}

    // Commit the collection transaction before starting the cosmetic animation.
    // In v0.16.2 the mutation happened 820 ms into the animation, so an
    // interrupted WebView/animation could look accepted without actually
    // changing the binder. The animation is now presentation-only.
    document.querySelectorAll('[data-accept-trade]').forEach(btn=>btn.disabled=true);
    try{
      requested.count=Number(requested.count||0)-1;if(requested.count<=0)delete state.cards[requestedEntry.key];
      addTradedCard(row.offer);row.accepted=true;
      const trade=ensureTradeState();trade.totalTrades=Number(trade.totalTrades||0)+1;
      state.stats.trades=Number(state.stats.trades||0)+1;
      for(const card of [row.request,row.offer]){
        const source=sourceOf(card),name=setNameOf(card),existing=Object.values(trade.openedSets).find(s=>s.source===source&&norm(s.setName||s.setId)===norm(name));
        if(!existing){const key=`${source}:${setIdOf(card)}`;trade.openedSets[key]={source,setId:setIdOf(card),setName:name};}
      }
      try{if(typeof checkCardMilestones==='function')checkCardMilestones(row.offer.setId);}catch(_){ }
      save();
      try{if(collectionMode==='cards')renderCollection();}catch(_){ }
      try{await playTradeAnimation(row);}catch(_){ }
      showToast(`${row.trainer} traded you ${row.offer.name}!`,2400);
    }catch(err){
      console.error('Lucky Dex trade failed',err);
      showToast('Trade could not be completed. Please try again.',2400);
    }finally{
      tradeAnimating=false;
      renderOffers(currentMarket());renderDiscoveryText();
    }
  }

  function renderDiscoveryText(){
    const el=$('tradeDiscoveryText');if(!el)return;
    const current=currentBoard(),counts=tradeCounts(current);
    el.textContent=`${current.length} live · ${counts.ready} ready · ${counts.spares} spares`;
  }

  let tradeSection='market';
  function setTradeSection(section){
    tradeSection=section==='dust'?'dust':'market';
    const market=$('tradeMarketPanel'),dust=$('dustExchangePanel');if(market)market.hidden=tradeSection!=='market';if(dust)dust.hidden=tradeSection!=='dust';
    document.querySelectorAll('[data-trade-section]').forEach(btn=>btn.classList.toggle('active',btn.dataset.tradeSection===tradeSection));
    if(tradeSection==='dust'){window.resetDustExchangeFilters?.();window.renderDustExchange?.();}else{renderDiscoveryText();renderOffers(currentMarket());}
  }
  function renderCurrentTrade(){
    if(tradeSection==='dust'){window.renderDustExchange?.();return;}
    renderDiscoveryText();
    renderOffers(currentMarket());
  }

  async function renderTradeBoard(force=false){
    const serial=viewSerial;
    ensureTradeState();updateTradeClock();
    // Keep the last valid market visible during a slot refresh.
    renderCurrentTrade();
    try{
      await ensureMarket(force);
      if(serial!==viewSerial)return;
      renderCurrentTrade();
    }catch(error){
      console.error('Lucky Dex trade market failed',error);
      if(!currentMarket().length){
        const list=$('tradeOfferList');if(list)list.innerHTML='<div class="trade-empty"><b>Could not load the market</b><span>We will retry this market without locking in an empty board.</span></div>';
      }
      renderDiscoveryText();
    }
  }
  window.renderTradeBoard=renderTradeBoard;

  function install(){
    ensureTradeState();
    document.querySelectorAll('[data-trade-section]').forEach(btn=>btn.onclick=()=>setTradeSection(btn.dataset.tradeSection));
    document.querySelectorAll('[data-trade-mode]').forEach(btn=>btn.onclick=()=>{
      tradeMode=btn.dataset.tradeMode;document.querySelectorAll('[data-trade-mode]').forEach(x=>x.classList.toggle('active',x===btn));renderCurrentTrade();
    });
    document.querySelectorAll('[data-trade-source]').forEach(btn=>btn.onclick=()=>{
      tradeSource=['tcg','tcgp'].includes(btn.dataset.tradeSource)?btn.dataset.tradeSource:'all';
      document.querySelectorAll('[data-trade-source]').forEach(x=>x.classList.toggle('active',x===btn));renderCurrentTrade();
    });
    document.querySelectorAll('[data-trade-view]').forEach(btn=>btn.onclick=()=>{
      tradeView=['all','tradeable','spares'].includes(btn.dataset.tradeView)?btn.dataset.tradeView:'all';
      document.querySelectorAll('[data-trade-view]').forEach(x=>x.classList.toggle('active',x===btn));renderCurrentTrade();
    });
    const search=$('tradeSearch');if(search)search.oninput=()=>renderCurrentTrade();
    const clear=$('tradeSearchClear');if(clear)clear.onclick=()=>{if(search){search.value='';search.focus();}renderCurrentTrade();};
    updateTradeClock();
  }

  function cancelOverlay(){
    if(cancelPendingConfirmation){cancelPendingConfirmation();return true;}
    const fx=$('tradeExchangeFx');if(fx&&!fx.hidden){viewSerial++;for(const cancel of animationWaits.values())cancel();animationWaits.clear();fx.hidden=true;fx.classList.remove('running','exchanging','revealed');return true;}
    return false;
  }
  function leave(){viewSerial++;cancelOverlay();if(tradeClockTimer)clearInterval(tradeClockTimer);tradeClockTimer=null;}
  function enter(){if(tradeClockTimer)clearInterval(tradeClockTimer);tradeClockTimer=setInterval(refreshTradeClock,1000);setTradeSection(tradeSection);return tradeSection==='market'?renderTradeBoard(false):Promise.resolve();}

  window.LuckyDexTrade={
    render:renderTradeBoard,clock:localSlotInfo,current:currentMarket,enter,leave,cancelOverlay,
    discovered:()=>discoveredSets(tradeSource),owned:()=>ownedCards(tradeSource),
    setMode:(mode)=>{tradeMode=mode==='global'?'global':'same';renderCurrentTrade();},
    setSource:(source)=>{tradeSource=['tcg','tcgp'].includes(source)?source:'all';renderCurrentTrade();},
    accept:acceptTrade,noteOpenedSet,
    _test:{ensureMarket,currentMarket,marketForModeSource,filterMarket,buildMarket,openedSetFingerprint,resetCatalogueCaches,augmentMarketForSet,marketRefreshDue,markMarketAttempt,tradeRarityClass,tradeDealClass,tradeCardRarityLabel,normalizeTradeCard,recoverTradeArtwork}
  };
  install();
})();
