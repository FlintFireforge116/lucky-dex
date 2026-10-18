/* LuckyDex v0.16.5 deterministic physical-card artwork library.
   Primary authority: card-art-index.json generated from the validated metadata
   source. A card only resolves when its exact canonical ID or its set + number
   + normalized name agree. Installed set ZIPs remain an optional offline layer. */
(function(){
  'use strict';

  const DEFAULT_REPO='FlintFireforge116/lucky-dex';
  const DEFAULT_TAG='luckydex-card-art-v1';
  const DEFAULT_INDEX=`https://raw.githubusercontent.com/${DEFAULT_REPO}/main/card-art-index.json`;
  const ENDPOINT_KEY='luckyDexCardArtEndpointV165';
  const DB_NAME='LuckyDexCardArtIndexV165';
  const DB_STORE='library';
  const DB_KEY='card-art-index';
  const pending=new Map();
  let indexCache=null;
  let indexPromise=null;

  function normalizeName(value=''){
    return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/pok[eé]mon/g,'pokemon').replace(/[^a-z0-9]+/g,' ').trim();
  }
  function normalizeNumber(value=''){
    let raw=String(value??'').trim().toUpperCase();
    if(/^0*\d+$/.test(raw))return String(Number(raw));
    return raw.replace(/[^A-Z0-9]/g,'');
  }
  function endpoint(){
    let custom={};
    try{custom=JSON.parse(localStorage.getItem(ENDPOINT_KEY)||'{}')||{};}catch(_){ }
    const repo=custom.repo||DEFAULT_REPO,tag=custom.tag||DEFAULT_TAG;
    const assetBase=(custom.assetBase||`https://github.com/${repo}/releases/download/${encodeURIComponent(tag)}`).replace(/\/$/,'');
    return {repo,tag,assetBase,indexUrl:custom.indexUrl||DEFAULT_INDEX};
  }
  function openDb(){
    return new Promise((resolve,reject)=>{
      try{
        const req=indexedDB.open(DB_NAME,1);
        req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE);};
        req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
      }catch(error){reject(error);}
    });
  }
  async function dbGet(){
    try{const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly'),req=tx.objectStore(DB_STORE).get(DB_KEY);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});}catch(_){return null;}
  }
  async function dbPut(value){
    try{const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(value,DB_KEY);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}catch(_){ }
  }
  function validIndex(index){return !!(index&&Array.isArray(index.sets)&&index.sets.length&&Number(index.schema||0)>=1);}
  async function getIndex(options={}){
    const force=!!options.force;
    if(indexCache&&!force)return indexCache;
    if(indexPromise&&!force)return indexPromise;
    indexPromise=(async()=>{
      let cached=await dbGet();if(!validIndex(cached))cached=null;
      if(navigator.onLine===false){indexCache=cached;return cached;}
      try{
        const response=await fetch(endpoint().indexUrl,{cache:'no-store'});
        if(!response.ok)throw new Error(`card-art index ${response.status}`);
        const index=await response.json();if(!validIndex(index))throw new Error('invalid card-art index');
        indexCache=index;dbPut(index);return index;
      }catch(error){
        console.warn('[LuckyDexCardArt] exact index unavailable; retaining safe legacy fallback',error);
        indexCache=cached;return cached;
      }finally{indexPromise=null;}
    })();
    return indexPromise;
  }
  function setKey(row){return String(row?.k||row?.key||row?.code||'').trim();}
  function setName(row){return String(row?.n||row?.name||row?.code||setKey(row));}
  const MONTHS_V03515=Object.freeze({jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11});
  function normalizedSetDateV03515(value){
    const raw=String(value||'').trim();if(!raw)return '';
    let y,m,d,hit=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(hit){y=Number(hit[1]);m=Number(hit[2])-1;d=Number(hit[3]);}
    else{hit=raw.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);if(!hit)return raw;m=MONTHS_V03515[hit[1].toLowerCase()];d=Number(hit[2]);y=Number(hit[3]);if(m===undefined)return raw;}
    const n=Date.UTC(y,m,d),check=new Date(n);
    if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m||check.getUTCDate()!==d)return raw;
    return check.toISOString().slice(0,10);
  }
  function setDate(row){return normalizedSetDateV03515(row?.d||row?.release_date||'');}
  function setSeries(row){return String(row?.s||row?.series||'');}
  function setCards(row){return Array.isArray(row?.c)?row.c:Array.isArray(row?.cards)?row.cards:[];}
  function appSet(row,catalogOrder=0){
    const key=setKey(row),cards=setCards(row),total=cards.length||Number(row?.total||row?.downloaded||0)||0;
    return {id:`library:${key}`,name:setName(row),releaseDate:setDate(row),cardCount:{total,official:total},cards:[],_libraryKey:key,_libraryCode:key,_librarySeries:setSeries(row),_libraryNative:true,_source:'library-index-v1',_catalogOrder:Number(catalogOrder)||0};
  }
  async function catalog(options={}){
    const index=await getIndex(options);
    if(!validIndex(index))return [];
    return index.sets.map((row,indexOrder)=>({row,indexOrder})).filter(item=>setKey(item.row)&&setCards(item.row).length).map(item=>appSet(item.row,item.indexOrder));
  }
  function findIndexSet(index,key){return index?.sets?.find(row=>setKey(row)===String(key||''))||null;}
  function normalizeSetIdentity(value=''){return normalizeName(value);}
  function findExactIndexSetForCard(index,card=null,set=null){
    if(!validIndex(index))return null;
    const explicit=String(card?._librarySetKey||set?._libraryKey||'').trim();
    if(explicit)return findIndexSet(index,explicit);
    const ids=[card?.set?.id,card?.setId,set?.id].map(v=>String(v||'').replace(/^library:/i,'').trim()).filter(Boolean);
    const idHits=index.sets.filter(row=>ids.some(id=>setKey(row).toLowerCase()===id.toLowerCase()));
    if(idHits.length===1)return idHits[0];
    if(idHits.length>1)return null;
    const names=[card?.set?.name,card?.setName,set?.name].map(normalizeSetIdentity).filter(Boolean);
    const nameHits=index.sets.filter(row=>names.includes(normalizeSetIdentity(setName(row))));
    const unique=[];for(const row of nameHits)if(!unique.includes(row))unique.push(row);
    return unique.length===1?unique[0]:null;
  }
  function localPath(key,file){
    const encodedKey=encodeURIComponent(String(key||''));
    const encodedFile=String(file||'').split('/').filter(Boolean).map(encodeURIComponent).join('/');
    return `https://luckydex.local/card-art/${encodedKey}/${encodedFile}`;
  }
  function isLocalUrl(url){return /^https:\/\/luckydex\.local\/card-art\//i.test(String(url||''));}
  function nativeAvailable(){return !!(window.Android&&typeof Android.getCardArtSetManifest==='function');}
  function isInstalled(key){
    if(!key||!nativeAvailable()||typeof Android.hasCardArtSet!=='function')return false;
    try{return !!Android.hasCardArtSet(String(key));}catch(_){return false;}
  }
  function installedManifest(key){
    if(!isInstalled(key))return null;
    try{const raw=Android.getCardArtSetManifest(String(key));return raw?JSON.parse(raw):null;}catch(_){return null;}
  }
  function recordFields(record){
    if(Array.isArray(record))return {id:String(record[0]||''),number:String(record[1]??''),name:String(record[2]||''),rarity:String(record[3]||'Unknown'),url:String(record[4]||''),file:'',variant:String(record[5]||'')};
    // card-art-index schema 1 has existed in both verbose and compact object
    // forms. Set rows already accept k/n/s/d/c; card rows must likewise accept
    // the live compact keys or every card hydrates as an anonymous blank row.
    const compactName=record?.name??record?.title??record?.t;
    const compactNumber=record?.number??record?.printed_number??record?.deck_position??record?.p??record?.no??record?.num??(compactName!=null?record?.n:undefined);
    const compactDisplayName=compactName??record?.n;
    return {
      id:String(record?.id??record?.i??record?.card_id??''),
      number:String(compactNumber??''),
      name:String(compactDisplayName??''),
      rarity:String(record?.rarity??record?.r??'Unknown'),
      url:String(record?.url??record?.source_url??record?.u??record?.image??record?.img??record?.a??''),
      file:String(record?.file??record?.f??''),
      variant:String(record?.variant??record?.v??'')
    };
  }
  function cardFromIndexRecord(record,set){
    const c=recordFields(record),key=set._libraryKey;
    const rarity=window.LuckyDexCardRarity?.normalizedPrintedRarity?.({rarity:c.rarity,localId:c.number,number:c.number,setId:set.id,setName:set.name},set)||c.rarity||'Unknown';
    return {id:c.id||`${key}-${c.number}`,name:c.name||'Unknown card',localId:c.number,number:c.number,rarity,image:c.url,set:{id:set.id,name:set.name,releaseDate:set.releaseDate,cardCount:{total:set.cardCount?.total||0}},setId:set.id,setName:set.name,source:'tcg',_libraryNative:true,_librarySetKey:key,_libraryCanonicalId:c.id,_libraryExactRemote:true,_libraryVariant:c.variant,_artIdentityVerified:true,_artSource:'luckydex-index-v1'};
  }
  function cardFromInstalledRecord(record,set){
    const c=recordFields(record),key=set._libraryKey,file=record?.file||c.file||'';
    const card=cardFromIndexRecord(record,set);card.image=localPath(key,file);card._libraryExactRemote=false;card._artSource='luckydex-library-pack-v1';return card;
  }
  async function hydrateSet(set){
    if(!set?._libraryKey)return set;
    const manifest=installedManifest(set._libraryKey);
    if(manifest?.cards?.length){
      const cards=manifest.cards.filter(row=>row?.id&&row?.file).map(row=>cardFromInstalledRecord(row,set));
      const total=cards.length;return {...set,cards,cardCount:{total,official:total},_libraryInstalled:true};
    }
    const index=await getIndex();const row=findIndexSet(index,set._libraryKey);if(!row)throw new Error('exact card index is unavailable for this set');
    const cards=setCards(row).map(record=>cardFromIndexRecord(record,set)).filter(card=>card.id&&card.name&&card.image);
    if(!cards.length)throw new Error('exact card index has no artwork for this set');
    const total=cards.length;return {...set,cards,cardCount:{total,official:total},_libraryInstalled:false};
  }
  async function prepareSet(set,signal=null){
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    const hydrated=await hydrateSet(set);
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    return hydrated;
  }
  async function exactRecordFor(card,set=null){
    const index=await getIndex();const row=findExactIndexSetForCard(index,card,set);if(!row)return null;
    const key=setKey(row),wantedId=String(card?._libraryCanonicalId||'');
    const wantedNumber=normalizeNumber(card?.localId??card?.number??''),wantedName=normalizeName(card?.name||'');
    let hit=null;
    for(const record of setCards(row)){
      const c=recordFields(record),idMatch=!!(wantedId&&c.id===wantedId),nameMatch=!wantedName||normalizeName(c.name)===wantedName,numberMatch=!!(wantedNumber&&normalizeNumber(c.number)===wantedNumber);
      if((idMatch&&nameMatch)||(wantedNumber&&wantedName&&numberMatch&&nameMatch)){
        if(hit)return null;hit={...c,_setKey:key};
      }
    }
    return hit;
  }
  async function resolveLocal(card,set=null){
    if(!card)return '';
    const hit=await exactRecordFor(card,set);
    const key=String(card?._librarySetKey||set?._libraryKey||hit?._setKey||'');
    if(!key)return '';
    if(isInstalled(key)){
      if(card?._libraryCanonicalId&&card?.image&&isLocalUrl(card.image))return card.image;
      if(nativeAvailable()&&typeof Android.lookupCardArt==='function'){
        try{
          const local=String(Android.lookupCardArt(key,String(card?._libraryCanonicalId||hit?.id||''),String(card?.localId??card?.number??hit?.number??''),String(card?.name||hit?.name||''))||'');
          if(local){card._libraryNative=true;card._librarySetKey=key;if(hit?.id)card._libraryCanonicalId=hit.id;card._artIdentityVerified=true;card._artSource='luckydex-library-pack-v1';return local;}
        }catch(_){ }
      }
    }
    if(navigator.onLine===false||!hit?.url)return '';
    card._libraryNative=true;card._librarySetKey=key;card._libraryCanonicalId=hit.id;card._artIdentityVerified=true;card._artSource='luckydex-index-v1';
    return hit.url;
  }

  // Optional future full-set ZIP installer. It is deliberately not automatic:
  // the current draft Release stays private while the app uses exact original
  // source URLs from the index. If a public/private authenticated asset host is
  // configured later, the same native installer can provide complete offline sets.
  function installAssetUrl(set){const ep=endpoint(),asset=set?._libraryAssetName||`luckydex-set-${set?._libraryKey}-v1.zip`;return `${ep.assetBase}/${encodeURIComponent(asset)}`;}
  function ensureInstalled(set,signal=null){
    if(!set?._libraryKey)return Promise.reject(new Error('not a LuckyDex library set'));
    if(isInstalled(set._libraryKey))return Promise.resolve(true);
    if(!nativeAvailable()||typeof Android.installCardArtPack!=='function')return Promise.reject(new Error('native card-art installer unavailable'));
    const token=`art-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const base=new Promise((resolve,reject)=>{pending.set(token,{resolve,reject});try{Android.installCardArtPack(String(set._libraryKey),installAssetUrl(set),String(set._libraryAssetSha256||''),token);}catch(error){pending.delete(token);reject(error);}});
    if(!signal)return base;
    return new Promise((resolve,reject)=>{const abort=()=>{cleanup();reject(new DOMException('Cancelled','AbortError'));},cleanup=()=>signal.removeEventListener('abort',abort);if(signal.aborted)return abort();signal.addEventListener('abort',abort,{once:true});base.then(v=>{cleanup();resolve(v);},e=>{cleanup();reject(e);});});
  }
  function _nativeInstallComplete(token,payload){const job=pending.get(token);if(!job)return;pending.delete(token);let result={ok:false,error:'unknown installer result'};try{result=JSON.parse(payload||'{}');}catch(_){ }if(result.ok)job.resolve(result);else job.reject(new Error(result.error||'card-art pack install failed'));}
  function configure(values={}){const current=endpoint(),next={repo:values.repo||current.repo,tag:values.tag||current.tag,indexUrl:values.indexUrl||current.indexUrl,assetBase:values.assetBase||current.assetBase};try{localStorage.setItem(ENDPOINT_KEY,JSON.stringify(next));}catch(_){ }indexCache=null;indexPromise=null;return next;}
  async function status(){const index=await getIndex();return {endpoint:endpoint(),indexCached:!!index,setCount:Number(index?.sets?.length||0),cardCount:Number(index?.card_count||0),native:nativeAvailable()};}

  window.LuckyDexCardArt={catalog,getIndex,isInstalled,prepareSet,resolveLocal,isLocalUrl,localPath,ensureInstalled,configure,status,_nativeInstallComplete,_recordFields:recordFields,releaseTag:DEFAULT_TAG,repo:DEFAULT_REPO};
})();
