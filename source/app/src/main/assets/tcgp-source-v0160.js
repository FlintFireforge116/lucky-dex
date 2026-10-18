/* LuckyDex v0.26.3 — complete Pokémon TCG Pocket catalogue.
   Primary authority mirrors the physical-card architecture: a compact exact
   index generated into FlintFireforge116/lucky-dex on GitHub. The index is
   built from PocketDecks' v5 catalogue, whose rows contain exact card images
   and exact pack artwork. The older flibustier feed remains metadata fallback
   only so packs are still usable if the LuckyDex index is temporarily absent. */
(function(root){
  'use strict';

  const INDEX_URL='https://raw.githubusercontent.com/FlintFireforge116/lucky-dex/main/tcgp-card-index.json';
  const POCKETDECKS_REPO='PocketDecks/pokemon-tcg-pocket-cards';
  const POCKETDECKS_BASE='https://raw.githubusercontent.com/PocketDecks/pokemon-tcg-pocket-cards/refs/heads/main';
  const DATA_BASE='https://cdn.jsdelivr.net/gh/flibustier/pokemon-tcg-pocket-database@main/dist';
  const RAW_DATA_BASE='https://raw.githubusercontent.com/flibustier/pokemon-tcg-pocket-database/main/dist';
  const LIMITLESS_BASE='https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket';
  const DB_NAME='LuckyDexPocketIndexV0261';
  const DB_STORE='library';
  const DB_KEY='tcgp-card-index';

  const BUILTIN_SETS=[
    ['A1','Genetic Apex','2024-10-30',286],['A1a','Mythical Island','2024-12-17',86],
    ['A2','Space-Time Smackdown','2025-01-29',207],['A2a','Triumphant Light','2025-02-28',96],
    ['A2b','Shining Revelry','2025-03-27',111],['A3','Celestial Guardians','2025-04-30',239],
    ['A3a','Extradimensional Crisis','2025-05-29',103],['A3b','Eevee Grove','2025-06-26',107],
    ['A4','Wisdom of Sea and Sky','2025-07-30',241],['A4a','Secluded Springs','2025-08-28',105],
    ['A4b','Deluxe Pack: ex','2025-09-30',379],['B1','Mega Rising','2025-10-30',331],
    ['B1a','Crimson Blaze','2025-12-17',103],['B2','Fantastical Parade','2026-01-29',234],
    ['B2a','Paldean Wonders','2026-02-26',131],['B2b','Mega Shine','2026-03-26',117],
    ['B3','Pulsing Aura','2026-04-28',234],['B3a','Paradox Drive','2026-05-28',109],
    ['B3b','Everyday Wonders','2026-06-30',106],['B4','Ruler of the Skies','2026-07-30',233],
    ['B4a','Team Rocket’s Ambition','2026-08-27',110],['B4b','Deluxe Pack: Mega','2026-09-30',429]
  ].map(([id,name,releaseDate,total])=>({id,name,releaseDate,cardCount:{total,official:total},_pocketDataset:'fallback-flibustier-v2',_packSize:/^[AB]4b$/i.test(id)?4:5,_deluxe:/^[AB]4b$/i.test(id)}));

  const FALLBACK_RARITY={C:'One Diamond',U:'Two Diamond',R:'Three Diamond',RR:'Four Diamond',AR:'One Star',SR:'Two Star',SAR:'Two Star',IM:'Three Star',UR:'Crown',S:'One Shiny',SSR:'Two Shiny'};
  const fetchCache=new Map();
  const exactSetCache=new Map();
  let indexCache=undefined,indexPromise=null;

  function canonicalSetId(value=''){
    const raw=String(value||'').trim();
    const m=raw.match(/^([ab])(\d+)([a-z]?)$/i);
    return m?`${m[1].toUpperCase()}${m[2]}${m[3].toLowerCase()}`:raw;
  }
  function numberId(value){
    const raw=String(value??'').trim();
    return /^\d+$/.test(raw)?raw.padStart(3,'0'):raw;
  }
  function validIndex(index){
    return !!(index&&Number(index.schema||0)>=1&&Array.isArray(index.sets)&&index.sets.length);
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
  async function fetchJson(url,signal,timeout=6500){
    const key=url;if(!signal&&fetchCache.has(key))return fetchCache.get(key);
    const p=(async()=>{
      const controller=new AbortController(),forward=()=>controller.abort();
      if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',forward,{once:true});
      const timer=setTimeout(()=>controller.abort(),timeout);
      try{
        const response=await fetch(url,{signal:controller.signal,cache:'no-cache'});
        if(!response.ok)throw new Error(`Pocket data ${response.status}`);
        return await response.json();
      }finally{clearTimeout(timer);signal?.removeEventListener('abort',forward);}
    })();
    if(!signal)fetchCache.set(key,p);
    try{return await p;}catch(error){if(!signal)fetchCache.delete(key);throw error;}
  }
  async function getIndex(signal=null,options={}){
    const force=!!options.force;
    if(indexCache!==undefined&&!force)return indexCache;
    if(indexPromise&&!force)return indexPromise;
    indexPromise=(async()=>{
      const stored=await dbGet(),cached=validIndex(stored)?stored:null;
      if(typeof navigator!=='undefined'&&navigator.onLine===false){indexCache=cached;return cached;}
      try{
        const index=await fetchJson(INDEX_URL,signal,9000);
        if(!validIndex(index))throw new Error('invalid Pocket GitHub index');
        indexCache=index;dbPut(index);return index;
      }catch(error){
        if(signal?.aborted)throw error;
        console.warn('[LuckyDexPocket] exact GitHub index unavailable; using safe fallback metadata',error);
        indexCache=cached;return cached;
      }finally{indexPromise=null;}
    })();
    return indexPromise;
  }

  function indexRecord(record){
    if(Array.isArray(record))return {id:String(record[0]||''),number:String(record[1]??''),name:String(record[2]||''),rarity:String(record[3]||'Unknown'),image:String(record[4]||''),pack:String(record[5]||'')};
    return {id:String(record?.id||''),number:String(record?.number??''),name:String(record?.name||''),rarity:String(record?.rarity||'Unknown'),image:String(record?.image||record?.url||''),pack:String(record?.pack||'')};
  }
  function cardFromIndexRecord(record,set){
    const row=indexRecord(record),localId=numberId(row.number),setId=canonicalSetId(set?.id||'');
    const exact=row.image;
    const limitless=setId&&localId?`${LIMITLESS_BASE}/${setId}/${setId}_${localId}_EN.webp`:'';
    return {
      id:row.id?row.id.replace(/^([ab])/i,m=>m.toUpperCase()):`${setId}-${localId}`,
      localId,number:localId,name:row.name||`Card ${localId}`,
      rarity:row.rarity||'Unknown',source:'tcgp',image:exact,
      set:{id:setId,name:set?.name||setId,releaseDate:set?.releaseDate||''},setId,setName:set?.name||setId,
      _pocketNative:true,_pocketDataset:'luckydex-github-v1',_pocketExactRemote:true,
      _artIdentityVerified:!!exact,_artSource:'PocketDecks-GitHub-v5',
      _tcgpFallbacks:limitless?[limitless]:[],packs:row.pack?[row.pack]:[]
    };
  }
  function setFromIndexRow(row,hydrate=true){
    const id=canonicalSetId(row?.id||row?.code||''),name=String(row?.name||id),releaseDate=String(row?.releaseDate||row?.release_date||'');
    const rawCards=Array.isArray(row?.cards)?row.cards:Array.isArray(row?.c)?row.c:[];
    const packs=(Array.isArray(row?.packs)?row.packs:[]).map(pack=>typeof pack==='string'?{name:pack,art:''}:{name:String(pack?.name||''),art:String(pack?.art||pack?.image||'')}).filter(pack=>pack.name||pack.art);
    const total=rawCards.length||Number(row?.total||row?.cardCount?.total||0);
    const packSize=Number(row?.packSize||row?.pack_size||(/^[AB]4b$/i.test(id)?4:5));
    const set={
      id,name,releaseDate,cardCount:{total,official:total},
      packs:packs.map(pack=>pack.name).filter(Boolean),
      boosters:packs.filter(pack=>pack.art).map(pack=>({name:pack.name,artwork_front:pack.art})),
      _pocketPacks:packs,_pocketDataset:'luckydex-github-v1',_packSize:packSize,_deluxe:packSize===4
    };
    if(hydrate)set.cards=rawCards.map(record=>cardFromIndexRecord(record,set)).filter(card=>card.id&&card.name&&card.image);
    return set;
  }
  async function indexCatalog(signal=null){
    const index=await getIndex(signal);if(!validIndex(index))return [];
    return index.sets.map(row=>setFromIndexRow(row,false)).filter(set=>set.id&&set.cardCount.total).sort((a,b)=>String(b.releaseDate).localeCompare(String(a.releaseDate)));
  }
  async function indexSetDetail(id,signal=null){
    const index=await getIndex(signal);if(!validIndex(index))return null;
    const wanted=canonicalSetId(id);const row=index.sets.find(item=>canonicalSetId(item?.id||item?.code)===wanted);if(!row)return null;
    const set=setFromIndexRow(row,true);if(!set.cards?.length)throw new Error('Pocket GitHub set has no exact cards');return set;
  }

  function pocketDecksRarity(card={}){
    const raw=String(card.rarity||'Unknown').trim();
    if(card.shiny===true){if(raw==='☆')return 'One Shiny';if(raw==='☆☆')return 'Two Shiny';}
    return {'◊':'One Diamond','◊◊':'Two Diamond','◊◊◊':'Three Diamond','◊◊◊◊':'Four Diamond','☆':'One Star','☆☆':'Two Star','☆☆☆':'Three Star','♕':'Crown','Crown Rare':'Crown'}[raw]||raw;
  }
  function setFromPocketDecksExpansion(row,hydrateCards=null){
    const id=canonicalSetId(row?.id||''),name=String(row?.name||id),releaseDate=String(row?.release_date||row?.releaseDate||'');
    const packs=(Array.isArray(row?.packs)?row.packs:[]).map(pack=>({name:String(pack?.name||pack?.id||''),art:String(pack?.image||pack?.art||'')})).filter(pack=>pack.name||pack.art);
    const total=Array.isArray(hydrateCards)?hydrateCards.length:Number(row?.total_cards||row?.cardCount?.total||0);
    const packSize=name.toLowerCase().startsWith('deluxe pack')?4:5;
    const set={id,name,releaseDate,cardCount:{total,official:total},packs:packs.map(pack=>pack.name).filter(Boolean),boosters:packs.filter(pack=>pack.art).map(pack=>({name:pack.name,artwork_front:pack.art})),_pocketPacks:packs,_pocketDataset:'pocketdecks-github-v5',_packSize:packSize,_deluxe:packSize===4};
    if(Array.isArray(hydrateCards))set.cards=hydrateCards.map(card=>{
      const sourceId=String(card?.id||'');
      const tail=sourceId.includes('-')?sourceId.slice(sourceId.lastIndexOf('-')+1):String(card?.number||'');
      const number=numberId(tail),art=String(card?.image||'');
      return {id:`${id}-${number}`,localId:number,number,name:String(card?.name||`Card ${number}`),rarity:pocketDecksRarity(card),source:'tcgp',image:art,set:{id,name,releaseDate},setId:id,setName:name,_pocketNative:true,_pocketDataset:'pocketdecks-github-v5',_pocketExactRemote:true,_artIdentityVerified:!!art,_artSource:'PocketDecks-GitHub-v5',_tcgpFallbacks:[`${LIMITLESS_BASE}/${id}/${id}_${number}_EN.webp`],packs:card?.pack?[String(card.pack)]:[]};
    }).filter(card=>card.id&&card.name&&card.image);
    return set;
  }
  async function pocketDecksCatalog(signal=null){
    const rows=await fetchJson(`${POCKETDECKS_BASE}/data/v5/expansions.json`,signal,9000);
    if(!Array.isArray(rows))return [];
    return rows.filter(row=>Array.isArray(row?.packs)&&row.packs.length).map(row=>setFromPocketDecksExpansion(row)).filter(set=>set.id&&set.cardCount.total).sort((a,b)=>String(b.releaseDate).localeCompare(String(a.releaseDate)));
  }
  async function pocketDecksSetDetail(id,signal=null){
    const wanted=canonicalSetId(id),sourceId=wanted.toLowerCase();
    const [expansions,cards]=await Promise.all([
      fetchJson(`${POCKETDECKS_BASE}/data/v5/expansions.json`,signal,9000),
      fetchJson(`${POCKETDECKS_BASE}/data/v5/${encodeURIComponent(sourceId)}/${encodeURIComponent(sourceId)}.json`,signal,9000)
    ]);
    const row=Array.isArray(expansions)?expansions.find(item=>canonicalSetId(item?.id)===wanted):null;
    if(!row||!Array.isArray(cards)||!cards.length)throw new Error('PocketDecks set unavailable');
    const set=setFromPocketDecksExpansion(row,cards);if(!set.cards?.length)throw new Error('PocketDecks exact artwork unavailable');return set;
  }

  /* Metadata fallback retained only for resilience. Exact PocketDecks artwork
     from the LuckyDex GitHub index is always preferred when that index exists. */
  function artAsset(image=''){
    const m=String(image).match(/c?([A-Z]{2,4}_\d+_\d+_\d+)(?:_|\.)/i);return m?m[1]:'';
  }
  function fallbackArtUrls(setCode,number,image){
    const code=canonicalSetId(setCode),n=numberId(number),asset=artAsset(image),urls=[];
    if(code&&n){
      urls.push(`${LIMITLESS_BASE}/${code}/${code}_${n}_EN.webp`);
      urls.push(`${LIMITLESS_BASE}/${code}/${code}_${n}_EN_SM.webp`);
    }
    if(asset)urls.push(`https://pocket.pokemongohub.net/tcg-pocket/cards/${code.toLowerCase()}/webp/${asset}.webp`);
    return [...new Set(urls)];
  }
  function normalizeFallbackSet(row){
    const id=canonicalSetId(row.code||row.id),name=row.name?.en||row.name||id,total=Number(row.count||row.cardCount?.total||0);
    if(!id||/^PROMO/i.test(id)||!total)return null;
    return {id,name,releaseDate:row.releaseDate||'',cardCount:{total,official:total},packs:row.packs||[],boosters:[],_pocketDataset:'fallback-flibustier-v2',_packSize:/^[AB]4b$/i.test(id)?4:5,_deluxe:/^[AB]4b$/i.test(id)};
  }
  function mergeFallbackCatalog(remote=[]){
    const map=new Map(BUILTIN_SETS.map(set=>[set.id,{...set}]));
    remote.forEach(row=>{const set=normalizeFallbackSet(row);if(set)map.set(set.id,{...(map.get(set.id)||{}),...set});});
    return [...map.values()].sort((a,b)=>String(b.releaseDate).localeCompare(String(a.releaseDate)));
  }
  function cardFromFallbackRow(row,set){
    const urls=fallbackArtUrls(set.id,row.number,row.image),localId=numberId(row.number);
    return {
      id:`${set.id}-${localId}`,localId,number:localId,name:row.name||`Card ${row.number}`,
      rarity:FALLBACK_RARITY[row.rarity]||row.rarity||'Unknown',source:'tcgp',image:urls[0]||'',
      set:{id:set.id,name:set.name,releaseDate:set.releaseDate||''},setId:set.id,setName:set.name,
      _pocketNative:true,_pocketDataset:'fallback-flibustier-v2',_pocketRarityCode:row.rarity||'',
      _pocketImageFile:row.image||'',_tcgpFallbacks:urls.slice(1),packs:row.packs||[]
    };
  }
  async function fallbackCatalog(signal=null){
    try{const all=await fetchJson(`${DATA_BASE}/sets.json`,signal),rows=Object.values(all||{}).flat();return mergeFallbackCatalog(rows);}catch(_){return mergeFallbackCatalog([]);}
  }
  async function fallbackSetDetail(id,signal=null){
    let set=BUILTIN_SETS.find(item=>item.id===canonicalSetId(id));if(!set){const all=await fallbackCatalog(signal);set=all.find(item=>item.id===canonicalSetId(id));}
    if(!set)throw new Error('Pocket set not found');
    const urls=[`${DATA_BASE}/cards/${encodeURIComponent(id)}.json`,`${RAW_DATA_BASE}/cards/${encodeURIComponent(id)}.json`];
    let settled=false,pending=urls.length,lastError=null;
    const rows=await new Promise((resolve,reject)=>{
      urls.forEach(url=>fetchJson(url,signal,5000).then(data=>{
        if(settled)return;if(Array.isArray(data)&&data.length){settled=true;resolve(data);return;}
        lastError=new Error('Pocket cards unavailable');if(--pending===0){settled=true;reject(lastError);}
      }).catch(error=>{lastError=error;if(!settled&&--pending===0){settled=true;reject(lastError);}}));
    });
    const cards=rows.map(row=>cardFromFallbackRow(row,set));return {...set,cardCount:{total:cards.length,official:cards.length},cards};
  }

  async function catalog(signal=null){
    const exact=await indexCatalog(signal);if(exact.length)return exact;
    try{const direct=await pocketDecksCatalog(signal);if(direct.length)return direct;}catch(error){if(signal?.aborted)throw error;}
    return fallbackCatalog(signal);
  }
  async function setDetail(id,signal=null){
    const key=canonicalSetId(id);
    if(exactSetCache.has(key))return exactSetCache.get(key);
    const exact=await indexSetDetail(key,signal);if(exact){exactSetCache.set(key,exact);return exact;}
    try{const direct=await pocketDecksSetDetail(key,signal);exactSetCache.set(key,direct);return direct;}catch(error){if(signal?.aborted)throw error;}
    return fallbackSetDetail(key,signal);
  }
  async function resolveCard(card,signal=null){
    if(!card)return null;
    const setId=canonicalSetId(card?.set?.id||card?.setId||'');if(!setId)return null;
    const detail=await setDetail(setId,signal),cards=detail?.cards||[];
    const wantedId=String(card.id||''),wantedNumber=numberId(card.localId??card.number??''),wantedName=String(card.name||'').trim().toLowerCase();
    let hit=cards.find(candidate=>String(candidate.id||'')===wantedId);
    if(!hit)hit=cards.find(candidate=>numberId(candidate.localId??candidate.number??'')===wantedNumber&&(!wantedName||String(candidate.name||'').trim().toLowerCase()===wantedName));
    return hit||null;
  }
  function packSize(setOrId){
    const id=typeof setOrId==='string'?setOrId:setOrId?.id;
    return Number((typeof setOrId==='object'&&setOrId?._packSize)||(/^[AB]4b$/i.test(String(id||''))?4:5));
  }

  root.LuckyDexPocket={
    INDEX_URL,POCKETDECKS_REPO,POCKETDECKS_BASE,DATA_BASE,BUILTIN_SETS,RARITY:FALLBACK_RARITY,
    getIndex,catalog,setDetail,resolveCard,packSize,canonicalSetId,cardFromIndexRecord,setFromIndexRow,setFromPocketDecksExpansion,pocketDecksCatalog,pocketDecksSetDetail,
    fallbackArtUrls,cardFromFallbackRow,mergeCatalog:mergeFallbackCatalog
  };
})(typeof window==='object'?window:globalThis);
