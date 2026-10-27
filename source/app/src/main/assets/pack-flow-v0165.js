/* The single pack orchestration path. Existing v0.13 caches and the existing
   commitPreparedPack economy function remain the persistence authorities. */
let packRun=null;
let packEpoch=0;
let packFastRevealActive=false,packFastRevealTimer=null,packFastReleaseHandler=null,packNavigationBusy=false;
const PACK_FAST_CARD_DWELL_MS=700;
const catalogJobs=new Map();
const validatedPackArt=new Map();
const promoSetCache={tcg:[]};
let promoVaultCards=[],promoVaultSetId='',promoVaultBusy=false,promoVaultControlsInstalled=false;

function recordPackOpeningError(error,phase='unknown',card=null,index=null,context=null){
  const pack=preparedPack||context?.pack||null,set=context?.set||pack?.set||null;
  const payload={build:window.__LUCKYDEX_BUILD||'',phase:String(phase||'unknown'),message:String(error?.stack||error?.message||error||'Unknown pack error'),setId:String(set?.id||context?.setId||''),setName:String(set?.name||context?.setName||''),source:String(context?.source||pack?.source||''),cardId:String(card?.id||''),cardName:String(card?.name||''),index:Number.isInteger(index)?index:Number(pack?.currentIndex||0),count:Number(pack?.cards?.length||0),epoch:Number(packRun?.epoch||0),at:Date.now()};
  try{localStorage.setItem('luckyDexLastPackError',JSON.stringify(payload));}catch(_){ }
  try{console.error('[LuckyDex] pack opening recovered',payload);}catch(_){ }
  return payload;
}
function recoverablePackBuildErrorV0391(error){
  if(error?.name==='AbortError')return false;
  return /No cards for |No card matches |Invalid pack collation/i.test(String(error?.message||error||''));
}
async function buildBalancedPackWithRetry(set,source,luckyPack=false,signal=null,godPack=false,attempts=3){
  let lastError=null,total=Math.max(1,Math.trunc(Number(attempts)||1));
  for(let attempt=1;attempt<=total;attempt++){
    try{
      const cards=await buildBalancedPack(set,source,luckyPack,signal,godPack);
      const slots=window.LuckyDexPackPolicy?.slotPlan?.(set,{source,luckyPack})||[];
      return typeof applyPokemonGoHiddenDittoV04030==='function'?await applyPokemonGoHiddenDittoV04030(cards,set,source,signal,slots):cards;
    }
    catch(error){lastError=error;if(signal?.aborted||!recoverablePackBuildErrorV0391(error)||attempt>=total)throw error;}
  }
  throw lastError||new Error('Pack construction failed');
}

function packStageLoading(copy='Preparing artwork…') {
  const stage=document.getElementById('packStage');if(stage.parentElement!==document.body)document.body.appendChild(stage);stage.hidden=false;document.body.classList.add('pack-opening');
  stage.innerHTML=`<button class="pack-exit" id="packExitBtn">‹ SHOP</button><div class="loading pack-loading"><div class="spinner"></div><b>${escapeHtml(copy)}</b></div>`;
  document.getElementById('packExitBtn').onclick=()=>closePackOpening();return stage;
}
function cancelPackRun() {
  stopPackFastReveal();packNavigationBusy=false;
  packEpoch++;
  if(!packRun)return;
  packRun.reveal?.destroy();packRun.abort.abort();
  packRun.urls.forEach(url=>URL.revokeObjectURL(url));packRun.urls.clear();packRun=null;
}
function newPackRun() {
  cancelPackRun();
  return packRun={epoch:packEpoch,abort:new AbortController(),urls:new Set(),art:new Map(),reveal:null};
}
function validPackRun(run) {return run===packRun&&!run.abort.signal.aborted;}
function packDelay(ms,signal) {
  return new Promise(resolve=>{
    let timer=null;
    const finish=value=>{clearTimeout(timer);signal.removeEventListener('abort',abort);resolve(value);};
    const abort=()=>finish(false);
    if(signal.aborted){resolve(false);return;}
    signal.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>finish(true),ms);
  });
}
async function packFetch(url,signal,timeout=4500) {
  if(!isOnlineV13())throw new Error('offline');
  const controller=new AbortController(),abort=()=>controller.abort();
  if(signal?.aborted)controller.abort();signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,timeout);
  try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error(String(response.status));return await response.json();}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
function packSetIdentityV0242(value=''){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
const PHYSICAL_SET_RELEASE_DATES_V0244_RAW=[
  ['Base Set','1999-01-09'],
  ['Base','1999-01-09'],
  ['Miscellaneous','1999-01-09'],
  ['Jungle','1999-06-16'],
  ['Wizards Black Star Promos','1999-07-01'],
  ['Fossil','1999-10-10'],
  ['Base Set 2','2000-02-24'],
  ['Team Rocket','2000-04-24'],
  ['Gym Heroes','2000-08-14'],
  ['Gym Challenge','2000-10-16'],
  ['Neo Genesis','2000-12-16'],
  ['Neo Discovery','2001-06-01'],
  ['Southern Islands','2001-07-31'],
  ['Neo Revelation','2001-09-21'],
  ['Neo Destiny','2002-02-28'],
  ['Legendary Collection','2002-05-24'],
  ['Expedition','2002-09-15'],
  ['Expedition Base Set','2002-09-15'],
  ['Best of Game','2002-12-01'],
  ['Aquapolis','2003-01-15'],
  ['Skyridge','2003-05-12'],
  ['Ruby & Sapphire','2003-07-01'],
  ['Sandstorm','2003-09-18'],
  ['Nintendo Black Star Promos','2003-10-01'],
  ['Dragon','2003-11-24'],
  ['Team Magma vs Team Aqua','2004-03-15'],
  ['EX Trainer Kit—Latias','2004-06-01'],
  ['EX Trainer Kit Latias','2004-06-01'],
  ['EX Trainer Kit—Latios','2004-06-01'],
  ['EX Trainer Kit Latios','2004-06-01'],
  ['Hidden Legends','2004-06-01'],
  ['Poké Card Creator Pack','2004-07-01'],
  ['FireRed & LeafGreen','2004-09-01'],
  ['POP Series 1','2004-09-01'],
  ['Team Rocket Returns','2004-11-01'],
  ['Deoxys','2005-02-01'],
  ['Emerald','2005-05-01'],
  ['Unseen Forces','2005-08-01'],
  ['POP Series 2','2005-08-01'],
  ['Delta Species','2005-10-31'],
  ['Legend Maker','2006-02-01'],
  ['EX Trainer Kit—Plusle','2006-03-01'],
  ['EX Trainer Kit 2 Plusle','2006-03-01'],
  ['EX Trainer Kit—Minun','2006-03-01'],
  ['EX Trainer Kit 2 Minun','2006-03-01'],
  ['POP Series 3','2006-04-01'],
  ['Holon Phantoms','2006-05-01'],
  ['Crystal Guardians','2006-08-01'],
  ['POP Series 4','2006-08-01'],
  ['Dragon Frontiers','2006-11-01'],
  ['Power Keepers','2007-02-02'],
  ['POP Series 5','2007-03-01'],
  ['Diamond & Pearl','2007-05-01'],
  ['DP Black Star Promos','2007-05-01'],
  ['Diamond & Pearl Promos','2007-05-01'],
  ['Mysterious Treasures','2007-08-01'],
  ['POP Series 6','2007-09-01'],
  ['Diamond & Pearl Trainer Kit—Lucario','2007-09-24'],
  ['Diamond & Pearl Trainer Kit—Manaphy','2007-09-24'],
  ['Secret Wonders','2007-11-01'],
  ['Great Encounters','2008-02-01'],
  ['POP Series 7','2008-03-01'],
  ['Majestic Dawn','2008-05-01'],
  ['Legends Awakened','2008-08-01'],
  ['POP Series 8','2008-09-01'],
  ['Stormfront','2008-11-01'],
  ['Platinum','2009-02-11'],
  ['POP Series 9','2009-03-01'],
  ['Rising Rivals','2009-05-16'],
  ['Supreme Victors','2009-08-19'],
  ['Arceus','2009-11-04'],
  ['Pokémon Rumble','2009-12-02'],
  ['Rumble','2009-12-02'],
  ['HeartGold & SoulSilver','2010-02-10'],
  ['HGSS Black Star Promos','2010-02-10'],
  ['HeartGold & SoulSilver Promos','2010-02-10'],
  ['HS Energy (2010 Unnumbered)','2010-02-10'],
  ['HS—Unleashed','2010-05-12'],
  ['Unleashed','2010-05-12'],
  ['HS Trainer Kit—Gyarados','2010-05-12'],
  ['HS Trainer Kit—Raichu','2010-05-12'],
  ['HS—Undaunted','2010-08-18'],
  ['Undaunted','2010-08-18'],
  ['HS—Triumphant','2010-11-03'],
  ['Triumphant','2010-11-03'],
  ['Call of Legends','2011-02-09'],
  ['BW Black Star Promos','2011-03-01'],
  ['Black & White Promos','2011-03-01'],
  ['Black & White','2011-04-25'],
  ['Black & White Energy (2011 Unnumbered)','2011-04-25'],
  ["McDonald's Collection 2011",'2011-06-17'],
  ['Emerging Powers','2011-08-31'],
  ['Black & White Trainer Kit—Excadrill','2011-09-12'],
  ['Black & White Trainer Kit—Zoroark','2011-09-12'],
  ['Noble Victories','2011-11-16'],
  ['Next Destinies','2012-02-08'],
  ['Dark Explorers','2012-05-09'],
  ["McDonald's Collection 2012",'2012-06-15'],
  ['Dragons Exalted','2012-08-15'],
  ['Dragon Vault','2012-10-05'],
  ['Boundaries Crossed','2012-11-07'],
  ['Plasma Storm','2013-02-06'],
  ['Plasma Freeze','2013-05-08'],
  ['Plasma Blast','2013-08-14'],
  ["McDonald's Collection 2013",'2013-10-13'],
  ['XY Black Star Promos','2013-10-12'],
  ['XY Promos','2013-10-12'],
  ['Legendary Treasures','2013-11-06'],
  ['Radiant Collection','2013-11-06'],
  ['Kalos Starter Set','2013-11-08'],
  ['XY Energy (2013 Unnumbered)','2013-11-08'],
  ['XY','2014-02-05'],
  ['XY Trainer Kit—Noivern','2014-03-12'],
  ['XY Trainer Kit—Sylveon','2014-03-12'],
  ['Flashfire','2014-05-07'],
  ["McDonald's Collection 2014",'2014-05-23'],
  ['Furious Fists','2014-08-13'],
  ['XY Trainer Kit—Bisharp','2014-11-14'],
  ['XY Trainer Kit—Wigglytuff','2014-11-14'],
  ['Phantom Forces','2014-11-05'],
  ['Primal Clash','2015-02-04'],
  ['Double Crisis','2015-03-25'],
  ['XY Trainer Kit—Latias','2015-04-29'],
  ['XY Trainer Kit—Latios','2015-04-29'],
  ['Roaring Skies','2015-05-06'],
  ['Ancient Origins','2015-08-12'],
  ['BREAKthrough','2015-11-04'],
  ["McDonald's Collection 2015",'2015-11-27'],
  ['BREAKpoint','2016-02-03'],
  ['Generations','2016-02-22'],
  ['Generations Radiant Collection','2016-02-22'],
  ['XY Trainer Kit—Pikachu Libre','2016-04-27'],
  ['XY Trainer Kit—Suicune','2016-04-27'],
  ['Fates Collide','2016-05-02'],
  ['Steam Siege','2016-08-03'],
  ["McDonald's Collection 2016",'2016-08-19'],
  ['Evolutions','2016-11-02'],
  ['Sun & Moon','2017-02-03'],
  ['SM Black Star Promos','2017-02-03'],
  ['Sun & Moon Promos','2017-02-03'],
  ['Sun & Moon Energy','2017-02-03'],
  ['Sun & Moon Trainer Kit—Alolan Raichu','2017-04-21'],
  ['Sun & Moon Trainer Kit—Lycanroc','2017-04-21'],
  ['Guardians Rising','2017-05-05'],
  ['Burning Shadows','2017-08-05'],
  ['Shining Legends','2017-10-06'],
  ['Crimson Invasion','2017-11-03'],
  ["McDonald's Collection 2017",'2017-11-07'],
  ['Ultra Prism','2018-02-02'],
  ['Forbidden Light','2018-05-04'],
  ['Celestial Storm','2018-08-03'],
  ['Dragon Majesty','2018-09-07'],
  ["McDonald's Collection 2018",'2018-10-16'],
  ['Lost Thunder','2018-11-02'],
  ['Team Up','2019-02-01'],
  ['Sun & Moon Energy (Team Up)','2019-02-01'],
  ['Detective Pikachu','2019-04-05'],
  ['Unbroken Bonds','2019-05-03'],
  ['Unified Minds','2019-08-02'],
  ['Hidden Fates','2019-08-23'],
  ['Hidden Fates Shiny Vault','2019-08-23'],
  ['Shiny Vault','2019-08-23'],
  ["McDonald's Collection 2019",'2019-10-15'],
  ['Cosmic Eclipse','2019-11-01'],
  ['SWSH Black Star Promos','2019-11-15'],
  ['Sword & Shield Promos','2019-11-15'],
  ['Sword & Shield','2020-02-07'],
  ['Sword & Shield Energy','2020-02-07'],
  ['Rebel Clash','2020-05-01'],
  ['Darkness Ablaze','2020-08-14'],
  ['Pokémon Futsal Collection','2020-09-11'],
  ['Pokémon Futsal Promos 2020','2020-09-11'],
  ["Champion's Path",'2020-09-25'],
  ['Champion’s Path','2020-09-25'],
  ['Vivid Voltage','2020-11-13'],
  ["McDonald's Collection 2021",'2021-02-09'],
  ['Shining Fates','2021-02-19'],
  ['Shining Fates Shiny Vault','2021-02-19'],
  ['Battle Styles','2021-03-19'],
  ['Chilling Reign','2021-06-18'],
  ['Evolving Skies','2021-08-27'],
  ['Celebrations','2021-10-08'],
  ['Celebrations: Classic Collection','2021-10-08'],
  ['Celebrations Classic Collection','2021-10-08'],
  ['Fusion Strike','2021-11-12'],
  ['Brilliant Stars','2022-02-25'],
  ['Brilliant Stars Trainer Gallery','2022-02-25'],
  ['Sword & Shield Energy (Brilliant Stars)','2022-02-25'],
  ['Astral Radiance','2022-05-27'],
  ['Astral Radiance Trainer Gallery','2022-05-27'],
  ['Pokémon GO','2022-07-01'],
  ["McDonald's Collection 2022",'2022-08-03'],
  ['Lost Origin','2022-09-09'],
  ['Lost Origin Trainer Gallery','2022-09-09'],
  ['Silver Tempest','2022-11-11'],
  ['Silver Tempest Trainer Gallery','2022-11-11'],
  ['Scarlet & Violet Black Star Promos','2023-01-01'],
  ['Scarlet & Violet Promos','2023-01-01'],
  ['Crown Zenith','2023-01-20'],
  ['Crown Zenith Galarian Gallery','2023-01-20'],
  ['Galarian Gallery','2023-01-20'],
  ['Scarlet & Violet Energies','2023-03-31'],
  ['Scarlet & Violet Energy','2023-03-31'],
  ['Scarlet & Violet','2023-03-31'],
  ['Paldea Evolved','2023-06-09'],
  ['Obsidian Flames','2023-08-11'],
  ["McDonald's Collection 2023",'2023-09-11'],
  ['McDonald’s Match Battle 2023','2023-09-11'],
  ['151','2023-09-22'],
  ['Scarlet & Violet—151','2023-09-22'],
  ['Scarlet & Violet 151','2023-09-22'],
  ['My First Battle','2023-09-29'],
  ['Paradox Rift','2023-11-03'],
  ['Pokémon TCG Classic - Blastoise','2023-11-16'],
  ['Pokémon TCG Classic - Charizard','2023-11-16'],
  ['Pokémon TCG Classic - Venusaur','2023-11-16'],
  ['Pokémon Trading Card Game Classic—Blastoise','2023-11-16'],
  ['Pokémon Trading Card Game Classic—Charizard','2023-11-16'],
  ['Pokémon Trading Card Game Classic—Venusaur','2023-11-16'],
  ['Paldean Fates','2024-01-26'],
  ['Temporal Forces','2024-03-22'],
  ['Twilight Masquerade','2024-05-24'],
  ['Shrouded Fable','2024-08-02'],
  ['Stellar Crown','2024-09-13'],
  ['Surging Sparks','2024-11-08'],
  ['Prismatic Evolutions','2025-01-17'],
  ["McDonald's Collection 2024",'2025-01-21'],
  ['Journey Together','2025-03-28'],
  ['Destined Rivals','2025-05-30'],
  ['Black Bolt','2025-07-18'],
  ['White Flare','2025-07-18'],
  ['Mega Evolution Energies','2025-09-26'],
  ['Mega Evolution Energy','2025-09-26'],
  ['Mega Evolution Black Star Promos','2025-09-26'],
  ['Mega Evolution Promos','2025-09-26'],
  ['Mega Evolution','2025-09-26'],
  ['Phantasmal Flames','2025-11-14'],
  ['Ascended Heroes','2026-01-30'],
  ['Perfect Order','2026-03-27'],
  ['Chaos Rising','2026-05-22'],
  ['Pitch Black','2026-07-17'],
  ['30th Celebration: Classic Collection','2026-09-16'],
  ['30th Celebration Classic Collection','2026-09-16'],
  ['30th Celebration','2026-09-16'],
  ['World Collection','2000-01-01'],
  ['Box Topper','2002-09-15'],
  ['Victory Medals','2007-01-01'],
];
const PHYSICAL_SET_RELEASE_DATES_V0244=Object.fromEntries(PHYSICAL_SET_RELEASE_DATES_V0244_RAW.map(([name,date])=>[packSetIdentityV0242(name),date]));
function packReleaseDateForNameV0244(name=''){return PHYSICAL_SET_RELEASE_DATES_V0244[packSetIdentityV0242(name)]||'';}
window.LuckyDexPackReleaseDates=Object.freeze(Object.fromEntries(PHYSICAL_SET_RELEASE_DATES_V0244_RAW));
window.LuckyDexPackReleaseDateForName=packReleaseDateForNameV0244;
function packReleaseSortKeyV0243(set){
  const known=packReleaseDateForNameV0244(set?.name)||'';
  const raw=known||String(set?.releaseDate||'').trim();
  const exact=LuckyDexPack?.dateValue?LuckyDexPack.dateValue(raw):(/^\d{4}-\d{2}-\d{2}$/.test(raw)?Date.parse(raw+'T00:00:00Z'):null);
  const yearMatch=raw.match(/^(\d{4})/);
  const date=Number.isFinite(Number(exact))&&exact!==null?Number(exact):(yearMatch?Date.UTC(Number(yearMatch[1]),0,1):0);
  const order=Number.isFinite(Number(set?._catalogOrder))?Number(set._catalogOrder):-1;
  return {raw,date,order};
}
function packReleaseDateValueV0242(set){return packReleaseSortKeyV0243(set).date;}
function packReleaseDateLabelV0243(set){
  const raw=packReleaseSortKeyV0243(set).raw;
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){
    const [y,m,d]=raw.split('-').map(Number),months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d} ${months[m-1]} ${y}`;
  }
  return (raw.match(/^\d{4}/)||[])[0]||'';
}
function packChronologicalSetsV0242(sets){return [...(sets||[])].sort((a,b)=>{
  const ak=packReleaseSortKeyV0243(a),bk=packReleaseSortKeyV0243(b);
  return bk.date-ak.date||bk.order-ak.order||String(a?.name||'').localeCompare(String(b?.name||''));
});}
function ensurePackBrowserState(){
  if(!state.ui||typeof state.ui!=='object')state.ui={};
  if(!state.ui.packBrowser||typeof state.ui.packBrowser!=='object')state.ui.packBrowser={sortKey:'releaseDate',sortDir:'desc'};
  if(!state.ui.packMetrics||typeof state.ui.packMetrics!=='object')state.ui.packMetrics={};
  if(!['asc','desc'].includes(state.ui.packBrowser.sortDir))state.ui.packBrowser.sortDir='desc';
  if(!['releaseDate','name','setSize','completion','packsOpened','recentlyOpened'].includes(state.ui.packBrowser.sortKey))state.ui.packBrowser.sortKey='releaseDate';
  if(!state.ui.packBrowser.chronologyV0242){if(state.ui.packBrowser.sortKey==='releaseDate')state.ui.packBrowser.sortDir='desc';state.ui.packBrowser.chronologyV0242=true;}
  return state.ui;
}
function packMetricKey(set,source){return `${source}:${String(set?.id||set?.name||'')}`;}
function packSetMetrics(set,source){
  ensurePackBrowserState();
  const setId=String(set?.id||''),setName=String(set?.name||'').toLowerCase();
  const ownedRows=Object.values(state.cards||{}).filter(card=>{
    if((card?.source||'tcg')!==source)return false;
    if(setId&&String(card?.setId||card?.set?.id||'')===setId)return true;
    return !!setName&&String(card?.setName||card?.set?.name||'').toLowerCase()===setName;
  });
  const owned=new Set(ownedRows.map(card=>String(card.id||`${card.name}|${card.localId||''}`))).size;
  const reported=Number(set?.cardCount?.total||set?.setTotal||ownedRows[0]?.setTotal||0);
  const total=Number.isFinite(reported)&&reported>0?reported:0;
  const stored=state.ui.packMetrics[packMetricKey(set,source)]||{};
  return {owned,total,completion:total?owned/total:0,packsOpened:Math.max(0,Number(stored.packsOpened||0)),lastOpened:Number.isFinite(Number(stored.lastOpened))?Number(stored.lastOpened):null};
}
function packBrowserRows(source,query='',sortKey,sortDir){
  ensurePackBrowserState();
  const key=sortKey||state.ui.packBrowser.sortKey,dir=sortDir||state.ui.packBrowser.sortDir;
  const q=String(query||'').trim().toLowerCase();
  const rows=[...(setCache[source]||[])].filter(set=>!q||String(set?.name||'').toLowerCase().includes(q)||String(set?.id||'').toLowerCase().includes(q));
  const primary=set=>{
    const m=packSetMetrics(set,source);
    if(key==='name')return String(set?.name||set?.id||'').toLowerCase();
    if(key==='setSize')return Number(set?.cardCount?.total||set?.setTotal||0)||0;
    if(key==='completion')return m.completion;
    if(key==='packsOpened')return m.packsOpened;
    if(key==='recentlyOpened')return m.lastOpened||0;
    return packReleaseDateValueV0242(set);
  };
  const mul=dir==='asc'?1:-1;
  return rows.sort((a,b)=>{
    if(key==='releaseDate'){
      const ak=packReleaseSortKeyV0243(a),bk=packReleaseSortKeyV0243(b);
      const byDate=ak.date-bk.date;if(byDate)return byDate*mul;
      const byCatalog=ak.order-bk.order;if(byCatalog)return byCatalog*mul;
    }else{
      const av=primary(a),bv=primary(b);let cmp=0;
      if(typeof av==='string'||typeof bv==='string')cmp=String(av).localeCompare(String(bv));else cmp=Number(av)-Number(bv);
      if(cmp)return cmp*mul;
    }
    const byName=String(a?.name||'').localeCompare(String(b?.name||''));if(byName)return byName;
    return String(a?.id||'').localeCompare(String(b?.id||''));
  });
}
function recordPackOpen(set,source,now=Date.now(),count=1){
  if(!set)return;
  ensurePackBrowserState();
  const key=packMetricKey(set,source),old=state.ui.packMetrics[key]||{},added=Math.max(1,Math.floor(Number(count)||1));
  state.ui.packMetrics[key]={packsOpened:Math.max(0,Number(old.packsOpened||0))+added,lastOpened:Number(now)};
}
window.LuckyDexPackBrowser={
  rows:packBrowserRows,metrics:packSetMetrics,recordOpen:recordPackOpen,chronology:packChronologicalSetsV0242,
  state:()=>ensurePackBrowserState().packBrowser
};

let packBrowserControlsInstalled=false;
function renderPackSetBrowser(source=document.getElementById('cardSource')?.value||'tcg'){
  const browser=document.getElementById('packSetBrowser'),select=document.getElementById('setSelect');if(!browser||!select)return;
  ensurePackBrowserState();
  const search=document.getElementById('packSetSearch'),sort=document.getElementById('packSortKey'),dir=document.getElementById('packSortDir');
  if(sort)sort.value=state.ui.packBrowser.sortKey;
  if(dir){const asc=state.ui.packBrowser.sortDir==='asc';dir.textContent=asc?'↑':'↓';dir.setAttribute('aria-label',asc?'Sort ascending':'Sort descending');dir.setAttribute('aria-pressed',asc?'true':'false');}
  const rows=packBrowserRows(source,search?.value||'',state.ui.packBrowser.sortKey,state.ui.packBrowser.sortDir),selected=select.value;
  const selectedSet=(setCache[source]||[]).find(set=>String(set.id)===String(selected))||rows[0]||null;
  const selectedName=document.getElementById('packSelectedSetName'),selectedMeta=document.getElementById('packSelectedSetMeta');
  if(selectedName)selectedName.textContent=selectedSet?.name||selectedSet?.id||'Choose a set';
  if(selectedMeta)selectedMeta.textContent=packReleaseDateLabelV0243(selectedSet);
  browser.innerHTML=rows.length?rows.map(set=>{
    const m=packSetMetrics(set,source),releaseLabel=packReleaseDateLabelV0243(set);
    const meta=[releaseLabel,m.total?`${m.owned}/${m.total} owned`:m.owned?`${m.owned} owned`:''].filter(Boolean).join(' · ');
    return `<button type="button" class="pack-set-row ${set.id===selected?'selected':''}" data-pack-set-id="${escapeHtml(set.id)}" role="option" aria-selected="${set.id===selected?'true':'false'}"><span><b>${escapeHtml(set.name||set.id)}</b><small>${escapeHtml(meta||'Set')}</small></span><i>›</i></button>`;
  }).join(''):'<div class="pack-set-empty">No sets match your search.</div>';
  browser.querySelectorAll?.('[data-pack-set-id]').forEach(button=>button.onclick=()=>{
    const id=button.dataset.packSetId;
    if(select.value!==id){select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));}
    const panel=document.getElementById('packSetAccordionPanel'),toggle=document.getElementById('packSetAccordionToggle');
    if(panel)panel.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');panel?.closest?.('.pack-set-accordion')?.classList?.remove('open');panel?.closest?.('.pack-selector-card')?.classList?.remove('set-picker-open');renderPackSetBrowser(source);
  });
}
function installPackBrowserControls(){
  if(packBrowserControlsInstalled)return;packBrowserControlsInstalled=true;
  const search=document.getElementById('packSetSearch'),sort=document.getElementById('packSortKey'),dir=document.getElementById('packSortDir'),toggle=document.getElementById('packSetAccordionToggle'),panel=document.getElementById('packSetAccordionPanel');
  if(search)search.addEventListener('input',()=>renderPackSetBrowser());
  if(sort)sort.addEventListener('change',()=>{ensurePackBrowserState();state.ui.packBrowser.sortKey=sort.value;if(sort.value==='releaseDate')state.ui.packBrowser.sortDir='desc';try{save();}catch(_){}renderPackSetBrowser();});
  if(dir)dir.addEventListener('click',()=>{ensurePackBrowserState();state.ui.packBrowser.sortDir=state.ui.packBrowser.sortDir==='asc'?'desc':'asc';try{save();}catch(_){}renderPackSetBrowser();});
  if(toggle&&panel)toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',panel.hidden?'false':'true');toggle.closest?.('.pack-set-accordion')?.classList?.toggle('open',!panel.hidden);toggle.closest?.('.pack-selector-card')?.classList?.toggle('set-picker-open',!panel.hidden);});
}

function promoDustPrice(card){
  const shared=window.LuckyDexCardAcquisition?.promoDustPurchaseCost?.(card);
  if(Number.isFinite(Number(shared)))return Number(shared);
  return 350;
}
function promoCardOwned(card){return !!(card?.id&&state.cards?.[card.id]);}
function promoCardArtwork(card,set){
  const raw=String(card?._packArtwork||card?.image||'');
  if(!raw)return LuckyDexPack.placeholder(card?.name||'Promo');
  if(card?._libraryNative||/^(?:data:|blob:|https:\/\/luckydex\.local\/)/i.test(raw))return raw;
  try{const base=deriveCardBase(card,set)||raw;return cardImage(base,'low','webp');}catch(_){return raw;}
}
function renderPromoVaultEntry(source=document.getElementById('cardSource')?.value||'tcg'){
  const button=document.getElementById('promoVaultBtn');if(!button)return;
  const count=promoSetCache.tcg.length;button.hidden=source!=='tcg'||!count;
  const copy=document.getElementById('promoVaultCount');if(copy)copy.textContent=count?`${count} promo series · buy individual cards with Dust`:'Promo series sync with the physical catalogue';
}
function renderPromoVaultCards(set,cards=promoVaultCards){
  const grid=document.getElementById('promoVaultGrid'),dust=document.getElementById('promoVaultDust');if(dust)dust.textContent=fmt(state.profile.dust||0);if(!grid)return;
  if(!set){grid.innerHTML='<div class="empty compact-empty">No promo series are available yet.</div>';return;}
  if(!cards.length){grid.innerHTML='<div class="empty compact-empty">No promo cards could be loaded for this series.</div>';return;}
  const query=String(document.getElementById('promoVaultSearch')?.value||'').trim().toLowerCase();
  const visible=cards.filter(card=>!query||[card.name,card.localId,card.number,card.rarity].some(value=>String(value||'').toLowerCase().includes(query)));
  if(!visible.length){grid.innerHTML='<div class="empty compact-empty">No promo cards match that search.</div>';return;}
  grid.innerHTML=visible.map(card=>{
    const owned=promoCardOwned(card),price=promoDustPrice(card),canBuy=!owned&&state.profile.dust>=price,img=promoCardArtwork(card,set);
    return `<article class="promo-card ${owned?'owned':''}"><button class="promo-card-art" data-view-promo="${escapeHtml(card.id)}"><img src="${escapeHtml(img)}" alt="${escapeHtml(card.name)}"></button><div class="promo-card-copy"><b>${escapeHtml(card.name)}</b><span>${escapeHtml(card.rarity||'Promo')}</span><button class="${owned?'secondary':'primary'}" data-buy-promo="${escapeHtml(card.id)}" ${canBuy?'':'disabled'}>${owned?'OWNED':`✦ ${fmt(price)} DUST`}</button></div></article>`;
  }).join('');
  grid.querySelectorAll('[data-buy-promo]').forEach(button=>button.onclick=()=>buyPromoCard(button.dataset.buyPromo));
  grid.querySelectorAll('[data-view-promo]').forEach(button=>button.onclick=()=>{const card=cards.find(c=>c.id===button.dataset.viewPromo);if(card)openCardModal({...card,image:promoCardArtwork(card,set)});});
}
function removePromoVaultSet(setId){
  promoSetCache.tcg=promoSetCache.tcg.filter(row=>String(row.id)!==String(setId));
  renderPromoVaultEntry('tcg');
  const select=document.getElementById('promoVaultSetSelect');
  if(select)select.innerHTML=promoSetCache.tcg.map(set=>`<option value="${escapeHtml(set.id)}">${escapeHtml(set.name)} (${Number(set.cardCount?.total||0)})</option>`).join('');
}
async function loadPromoVaultSet(setId){
  const set=promoSetCache.tcg.find(row=>String(row.id)===String(setId));if(!set)return;
  promoVaultSetId=set.id;const grid=document.getElementById('promoVaultGrid');if(grid)grid.innerHTML='<div class="loading">Loading promo cards…</div>';
  promoVaultBusy=true;
  try{
    let full=set;
    if(set?._libraryKey&&window.LuckyDexCardArt)full=await LuckyDexCardArt.prepareSet(set);
    else if(cachedSetV13(set.id,'tcg')?.cards?.length)full=cachedSetV13(set.id,'tcg');
    else if(isOnlineV13())full=await packFetch(API.tcgSet(set.id),null,8000);
    const allCards=[...(full?.cards||[])],cards=allCards.filter(card=>window.LuckyDexCardAcquisition?.promoVaultEligible?.(card,full)!==false);promoVaultCards=cards;cacheSetV13({...full,cards:[]},'tcg');if(allCards.length)cacheCardsV13(allCards,full,'tcg');
    if(!cards.length){
      removePromoVaultSet(full?.id||set.id);promoVaultCards=[];
      if(promoSetCache.tcg.length){const next=promoSetCache.tcg[0];promoVaultSetId=next.id;const select=document.getElementById('promoVaultSetSelect');if(select)select.value=next.id;Promise.resolve().then(()=>loadPromoVaultSet(next.id));}
      else if(grid)grid.innerHTML='<div class="empty compact-empty">No purchasable promo series are available.</div>';
      return;
    }
    renderPromoVaultCards(full,cards);
  }catch(error){promoVaultCards=[];if(grid)grid.innerHTML=`<div class="empty compact-empty"><b>PROMO DATA UNAVAILABLE</b><br>${isOnlineV13()?'Try this series again.':'Connect once to load this promo series.'}</div>`;}
  finally{promoVaultBusy=false;}
}
function grantPromoCard(card,set){
  if(!card?.id||promoCardOwned(card))return false;
  const row={id:card.id,name:card.name,image:card.image||'',localId:card.localId||card.number||'',setId:card.set?.id||set?.id||'',setName:card.set?.name||set?.name||'Promo',setTotal:card.set?.cardCount?.total||set?.cardCount?.total||0,source:'tcg',rarity:card.rarity||'Promo',count:1,firstPulled:Date.now(),_promo:true};
  if(Array.isArray(card.subtypes))row.subtypes=[...card.subtypes];for(const key of ['subtype','supertype','category','type'])if(card?.[key]!=null)row[key]=card[key];
  for(const key of ['_libraryNative','_librarySetKey','_libraryCanonicalId','_artSource','_artIdentityVerified'])if(card[key]!=null)row[key]=card[key];
  state.cards[row.id]=row;addTrainerXp(20+rarityTier(row.rarity)*10);if(looksRare(row.rarity))state.rareHits.unshift({type:'card',name:row.name,rarity:(window.LuckyDexCardRarity?.classify?.(row)?.rarityClass==='secret'?(window.LuckyDexCardRarity.classify(row).revealLabel||'SECRET RARE'):row.rarity),set:row.setName,tier:rarityTier(row),ts:Date.now()});state.rareHits=state.rareHits.slice(0,50);checkCardMilestones(row.setId);save();return true;
}
function buyPromoCard(cardId){
  if(promoVaultBusy)return;const set=promoSetCache.tcg.find(row=>String(row.id)===String(promoVaultSetId)),card=promoVaultCards.find(row=>String(row.id)===String(cardId));if(!set||!card)return;
  if(promoCardOwned(card)){showToast('You already own this promo.');return;}
  const price=promoDustPrice(card);if(state.profile.dust<price){showToast(`You need ${fmt(price)} Card Dust.`);return;}
  state.profile.dust-=price;if(!grantPromoCard(card,set)){state.profile.dust+=price;return;}save();renderGlobalHud();renderPromoVaultCards(set,promoVaultCards);showToast(`${card.name} added to your Promo Vault · −${fmt(price)} Dust`,2600);
}
function openPromoVault(){
  const dialog=document.getElementById('promoVaultDialog'),select=document.getElementById('promoVaultSetSelect');if(!dialog||!select)return;
  const sets=promoSetCache.tcg;if(!sets.length){showToast('Promo series are not available yet.');return;}
  select.innerHTML=sets.map(set=>`<option value="${escapeHtml(set.id)}">${escapeHtml(set.name)} (${Number(set.cardCount?.total||0)})</option>`).join('');
  const wanted=sets.some(s=>s.id===promoVaultSetId)?promoVaultSetId:sets[0].id;select.value=wanted;dialog.showModal();loadPromoVaultSet(wanted);
}
function installPromoVaultControls(){
  if(promoVaultControlsInstalled)return;promoVaultControlsInstalled=true;
  document.getElementById('promoVaultBtn')?.addEventListener('click',openPromoVault);
  document.getElementById('promoVaultClose')?.addEventListener('click',()=>document.getElementById('promoVaultDialog')?.close());
  document.getElementById('promoVaultSetSelect')?.addEventListener('change',event=>loadPromoVaultSet(event.target.value));
  document.getElementById('promoVaultSearch')?.addEventListener('input',()=>{const set=promoSetCache.tcg.find(row=>String(row.id)===String(promoVaultSetId));renderPromoVaultCards(set,promoVaultCards);});
}
window.LuckyDexPromoVault={open:openPromoVault,grantCard:grantPromoCard,priceFor:promoDustPrice,sets:()=>[...promoSetCache.tcg]};

function renderSetOptionsV13(source,sets) {
  const select=document.getElementById('setSelect');if(!select)return;
  const old=select.value,valid=(sets||[]).filter(s=>s.cardCount?.total>0);
  if(source==='tcg'&&window.LuckyDexBoosterArt?.attach)valid.forEach(set=>window.LuckyDexBoosterArt.attach(set));
  if(source==='tcg')promoSetCache.tcg=packChronologicalSetsV0242(valid.filter(set=>(LuckyDexPack.isPromoSet(set)||window.LuckyDexCardAcquisition?.setMayContainPromoCards?.(set))&&window.LuckyDexCardAcquisition?.promoCatalogSetEligible?.(set)!==false));
  const boosterSets=source==='tcg'?valid.filter(set=>window.LuckyDexCardAcquisition?.boosterProductEligible?.(set,'tcg')===true&&!LuckyDexPack.isPromoSet(set)):valid;
  const ordered=packChronologicalSetsV0242(boosterSets);
  setCache[source]=ordered;
  installPromoVaultControls();renderPromoVaultEntry(source);
  if(document.getElementById('cardSource').value!==source)return;
  select.innerHTML=ordered.map(s=>`<option value="${escapeHtml(s.id)}">${escapeHtml((LuckyDexPack.dateValue(s.releaseDate)!==null?s.releaseDate+' · ':'')+s.name)} (${s.cardCount.total})</option>`).join('');
  if(ordered.some(s=>s.id===old))select.value=old;
  installPackBrowserControls();renderPackSetBrowser(source);
  try{updatePackButton();}catch(e){console.error('[LuckyDex] pack HUD update failed',e);}
  Promise.resolve().then(()=>updateOfflineHintV13()).catch(e=>console.error('[LuckyDex] offline hint failed',e));
}
async function loadSets(source) {
  const select=document.getElementById('setSelect');if(!select)return;
  let stored=readCatalogCacheV13()[source]?.sets||[];

  // v0.16.5: the deterministic LuckyDex artwork catalogue is the preferred
  // physical-TCG source. Each row maps to one validated set ZIP. If the draft
  // library is not reachable yet, retain the old TCGdex catalogue as a safe
  // transition fallback rather than leaving the pack shop empty.
  if(source==='tcg'&&window.LuckyDexCardArt){
    const localStored=stored.filter(s=>s?._libraryKey);
    if(localStored.length)renderSetOptionsV13(source,localStored);
    try{
      const exactSets=await LuckyDexCardArt.catalog();
      if(exactSets.length){saveCatalogCacheV13(source,exactSets);renderSetOptionsV13(source,exactSets);return exactSets;}
    }catch(error){console.warn('[LuckyDex] exact card-art catalogue unavailable',error);}
    if(localStored.length){updatePackButton();return localStored;}
  }

  // Pocket has a complete built-in set index. Render it synchronously and
  // never leave Android's native <select> sitting on "Loading sets…" while a
  // CDN/catalogue request is in flight.
  if(source==='tcgp'&&window.LuckyDexPocket){
    const immediate=LuckyDexPocket.mergeCatalog(stored);
    if(immediate.length){saveCatalogCacheV13(source,immediate);renderSetOptionsV13(source,immediate);}
    updatePackButton();updatePackFormatV5?.();
    // Refresh names/counts in the background only. The result is optional.
    if(isOnlineV13()&&!catalogJobs.has(source)){
      const job=LuckyDexPocket.catalog().then(sets=>{if(Array.isArray(sets)&&sets.length){saveCatalogCacheV13(source,sets);renderSetOptionsV13(source,sets);}}).catch(()=>{}).finally(()=>catalogJobs.delete(source));
      catalogJobs.set(source,job);
    }
    return immediate;
  }

  let cached=stored;
  try{cached=await LuckyDexPack.enrichSets(stored,{online:false,cached:id=>cachedSetV13(id,source)});}catch(_){cached=stored;}
  if(cached.length)saveCatalogCacheV13(source,cached);
  if(cached.length)renderSetOptionsV13(source,cached);
  if(!isOnlineV13()){
    if(!cached.length && document.getElementById('cardSource').value===source)select.innerHTML='<option value="">Connect once to sync set list</option>';
    updatePackButton();return cached;
  }
  if(catalogJobs.has(source))return catalogJobs.get(source);
  const job=(async()=>{
    if(!cached.length&&document.getElementById('cardSource').value===source)select.innerHTML='<option value="">Syncing release dates…</option>';
    try{
      const all=await packFetch(`${API.tcgSets}?sort:field=releaseDate&sort:order=DESC`,null,5000);
      let pocket=[...(setCache.tcgp||[]),...(window.LuckyDexPocket?.BUILTIN_SETS||[])];
      try{pocket.push(...((await packFetch(API.tcgSeries('tcgp'),null,3500)).sets||[]));}catch(_){ }
      const ids=new Set(pocket.map(s=>s.id));let sets=(all||[]).filter(s=>!ids.has(s.id)&&s.cardCount?.total>0);
      const previous=new Map(cached.map(s=>[s.id,s]));
      const enriched=await LuckyDexPack.enrichSets(sets,{
        online:isOnlineV13(),cached:id=>{const full=cachedSetV13(id,source);return LuckyDexPack.dateValue(full?.releaseDate)!==null?full:previous.get(id);},
        detail:id=>packFetch(API.tcgSet(id),null,3500),
        persist:s=>{previous.set(s.id,s);saveCatalogCacheV13(source,LuckyDexPack.orderSets(sets.map(row=>previous.get(row.id)||row)));}
      });
      saveCatalogCacheV13(source,enriched);renderSetOptionsV13(source,enriched);return enriched;
    }catch(_){if(!cached.length&&document.getElementById('cardSource').value===source)select.innerHTML='<option value="">Could not sync sets</option>';return cached;}
    finally{catalogJobs.delete(source);updatePackButton();}
  })();
  catalogJobs.set(source,job);return job;
}
async function packCachedBlob(id) {
  try{
    const db=await packDbV131();
    return await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly'),request=tx.objectStore('images').get(id);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error);});
  }catch(_){return null;}
}
async function offlineCardArtworkUrlV06932(cardId){
  const id=String(cardId||'');if(!id||typeof URL==='undefined'||typeof URL.createObjectURL!=='function')return '';
  const blob=await packCachedBlob(id);return blob?.size?URL.createObjectURL(blob):'';
}
window.LuckyDexOfflineCardArt=Object.assign(window.LuckyDexOfflineCardArt||{},{blobForCard:packCachedBlob,urlForCard:offlineCardArtworkUrlV06932});
async function packArtworkIsUsable(card,blob) {
  if(!blob?.size)return /^data:/i.test(card.image||'')?LuckyDexPack.decodeImage(card.image):false;
  let fingerprint=null;
  if(window.crypto?.subtle){
    const digest=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
    fingerprint=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
    const cached=validatedPackArt.get(card.id);if(cached?.fingerprint===fingerprint)return cached.usable;
  }
  const usable=(async()=>{const url=URL.createObjectURL(blob);try{return await LuckyDexPack.decodeImage(url);}finally{URL.revokeObjectURL(url);}})();
  if(fingerprint)validatedPackArt.set(card.id,{fingerprint,usable});return usable;
}
async function packArtworkCandidatesV163(card,run) {
  if(!validPackRun(run))return [];
  const urls=[],seen=new Set(),add=url=>{url=String(url||'');if(url&&!seen.has(url)){seen.add(url);urls.push(url);}};
  if(window.LuckyDexCardArt&&(card?._libraryNative||card?._librarySetKey)){
    try{const local=await LuckyDexCardArt.resolveLocal(card,preparedPack?.set||card?.set||null);if(local)add(local);}catch(_){ }
    // v0.26.7: an index URL is an identity match, not proof the remote image
    // host will decode inside Android WebView. Keep it as the first candidate,
    // but continue into the exact PokémonTCG/Scrydex bridges so one dead
    // hotlink cannot force LOCAL CARD PREVIEW for an otherwise-known card.
  }
  if(!isOnlineV13())return [];
  const addBase=base=>{if(!base)return;add(cardImage(base,'high','webp'));add(cardImage(base,'high','png'));add(cardImage(base,'low','webp'));add(cardImage(base,'low','png'));};
  const source=preparedPack?.source||card?.source||'tcg';

  // v0.16.4: candidates must preserve card identity.  v0.16.3 guessed a
  // Limitless URL from "set code + local collector number".  That is unsafe
  // for reprint/subset catalogues whose local numbering differs from the image
  // provider (30th Classic #015 -> main-set #015 was the visible failure).
  // Resolve by exact card identity first; a missing image is preferable to a
  // confidently wrong image/name pairing.
  const original=card.image||deriveCardBase(card,preparedPack?.set);
  if(source==='tcg'){
    try{
      const alternate=await pokemonTcgArtworkBaseV5(card,preparedPack?.set,run.abort.signal);
      if(alternate)addBase(alternate);
      if(card._ptcgImageLarge)add(card._ptcgImageLarge);
      if(card._ptcgImageSmall)add(card._ptcgImageSmall);
    }catch(e){if(run.abort.signal.aborted)return [];}
    try{
      const scrydex=await scrydexArtworkBaseV164(card,preparedPack?.set,run.abort.signal);
      if(scrydex)addBase(scrydex);
      if(card._scrydexImageLarge)add(card._scrydexImageLarge);
      if(card._scrydexImageSmall)add(card._scrydexImageSmall);
    }catch(e){if(run.abort.signal.aborted)return [];}
    // This helper now emits only URLs carrying an explicit identity bridge.
    try{for(const url of physicalCardArtworkCandidatesV163(card,preparedPack?.set))add(url);}catch(_){ }
  }

  // TCGdex/Pocket bases are tied to the card record itself, so they remain
  // valid fallbacks.  Never resurrect an old unverified Limitless URL here.
  const safeBase=base=>!/limitlesstcg\.nyc3\.cdn\.digitaloceanspaces\.com/i.test(String(base||''));
  if(safeBase(card.image))addBase(card.image);
  if(source==='tcgp')for(const url of (card._tcgpFallbacks||[]))add(url);
  if(card._tcgdexImage&&safeBase(card._tcgdexImage))addBase(card._tcgdexImage);
  if(original&&original!==card.image&&safeBase(original))addBase(original);

  if(!urls.length){
    try{const resolved=await resolveCardArtwork(card,preparedPack?.set,source,run.abort.signal);if(safeBase(resolved)||card._artIdentityVerified)addBase(resolved);}catch(e){if(run.abort.signal.aborted)return [];}
  }
  card._remoteArtworkCandidatesV151=urls.slice();
  return urls;
}

async function cacheRemotePackArtworkV163(card,url,run) {
  if(!validPackRun(run)||!isOnlineV13()||!url||/^(?:data:|blob:)/i.test(url)||window.LuckyDexCardArt?.isLocalUrl?.(url))return;
  const controller=new AbortController(),abort=()=>controller.abort();run.abort.signal.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,10000);
  try{
    const response=await fetch(url,{signal:controller.signal,cache:'force-cache'});if(!response.ok)return;
    const blob=await response.blob();if(!blob.size||!validPackRun(run))return;
    // The card has already decoded from this same URL for display. Avoid doing
    // a second expensive decode here; persist the bytes for airplane-mode use.
    await putOfflineImageV131(card.id,blob);updateOfflineHintV13();
  }catch(_){}finally{clearTimeout(timer);run.abort.signal.removeEventListener('abort',abort);}
}

async function packNetworkBlob(card,run) {
  // Retained for compatibility with older callers. v0.16.3 displays verified
  // remote URLs immediately and caches them in the background instead of
  // blocking the reveal on a cross-origin blob fetch.
  const urls=await packArtworkCandidatesV163(card,run);
  for(const url of urls){
    if(!validPackRun(run)||!isOnlineV13())return null;
    try{
      if(await LuckyDexPack.decodeImage(url,run.abort.signal)){
        cacheRemotePackArtworkV163(card,url,run);
        card._resolvedArtworkUrl=url;
        return null;
      }
    }catch(_){}
  }
  return null;
}

function preloadPackCard(card,run=packRun) {
  if(!run||!card)return Promise.resolve(null);
  if(run.art.has(card.id))return run.art.get(card.id);
  const promise=(async()=>{
    // 1) Offline-first: use a previously cached real card image whenever it is
    // available. The resulting object URL is owned by this pack run.
    try{
      const blob=await packCachedBlob(card.id);
      if(blob?.size&&await packArtworkIsUsable(card,blob)&&validPackRun(run)){
        const url=URL.createObjectURL(blob);run.urls.add(url);card._packArtwork=url;
        return {url,owned:true,source:'cache'};
      }
    }catch(_){}
    if(!validPackRun(run))return {url:LuckyDexPack.placeholder(card.name),owned:false,source:'cancelled'};

    // 2) Local/data artwork and installed LuckyDex set-pack artwork can be
    // shown without any network connection.
    if(/^(?:data:|blob:)/i.test(card.image||'')||window.LuckyDexCardArt?.isLocalUrl?.(card.image||'')){
      try{if(await LuckyDexPack.decodeImage(card.image,run.abort.signal)){card._packArtwork=card.image;return {url:card.image,owned:false,source:window.LuckyDexCardArt?.isLocalUrl?.(card.image)?'library-pack':'local'};}}catch(_){}
    }

    // 3) Online path: resolve all known sources, verify the actual <img> URL,
    // then display it immediately. Blob caching happens in the background.
    // This avoids the old failure mode where a CDN disallowed fetch()/CORS but
    // was perfectly valid in an <img>, which produced LOCAL CARD PREVIEW.
    if(isOnlineV13()){
      const urls=await packArtworkCandidatesV163(card,run);
      for(const url of urls){
        if(!validPackRun(run))break;
        try{
          if(await LuckyDexPack.decodeImage(url,run.abort.signal)){
            card._resolvedArtworkUrl=url;card._packArtwork=url;
            if(!/^(?:data:|blob:)/i.test(url))card.image=url;
            cacheRemotePackArtworkV163(card,url,run);
            return {url,owned:false,source:'remote-direct'};
          }
        }catch(_){}
      }
    }

    const fallback=LuckyDexPack.placeholder(card.name);card._packArtwork=fallback;
    return {url:fallback,owned:false,source:'placeholder'};
  })();
  run.art.set(card.id,promise);return promise;
}

const POCKET_EXACT_DATASETS_V0261=new Set(['luckydex-github-v1','pocketdecks-github-v5']);

async function fixedProductCardsV03514(set,signal){
  const fixed=window.LuckyDexFixedProducts,definition=fixed?.definitionFor?.(set);
  if(!definition)return null;
  let coreCards=[],energyCards=[];
  if(window.LuckyDexCardArt?.catalog){
    const catalogue=await LuckyDexCardArt.catalog();
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    const byName=name=>(catalogue||[]).find(row=>packSetIdentityV0242(row?.name)===packSetIdentityV0242(name));
    const coreStub=byName('HeartGold & SoulSilver'),energyStub=byName('HS Energy (2010 Unnumbered)');
    if(coreStub){
      try{const hydrated=await LuckyDexCardArt.prepareSet(coreStub,signal);coreCards=hydrated?.cards||[];}catch(error){console.warn('[LuckyDex] fixed deck HGSS art unavailable',error);}
    }
    if(energyStub){
      try{const hydrated=await LuckyDexCardArt.prepareSet(energyStub,signal);energyCards=hydrated?.cards||[];}catch(error){console.warn('[LuckyDex] fixed deck energy art unavailable',error);}
    }
  }
  const cards=fixed.build(set,{signatureCards:set?.cards||[],coreCards,energyCards});
  return {
    set:{...set,cardCount:{total:definition.cardCount,official:definition.cardCount},_fixedProduct:true,_fixedProductKind:definition.kind,_fixedProductCode:definition.code},
    cards
  };
}

async function grantFixedProductRewardV03515(code){
  const fixed=window.LuckyDexFixedProducts,art=window.LuckyDexCardArt;
  const definition=fixed?.definitionFor?.({_libraryKey:String(code||'').toUpperCase()});
  if(!definition)throw new Error(`Unknown fixed product: ${code}`);
  if(!art?.catalog||!art?.prepareSet)throw new Error('Physical card library is unavailable');
  const catalogue=await art.catalog();
  const stub=(catalogue||[]).find(row=>String(row?._libraryKey||row?._libraryCode||'').replace(/^library:/i,'').toUpperCase()===definition.code)||
    (catalogue||[]).find(row=>packSetIdentityV0242(row?.name)===packSetIdentityV0242(definition.name));
  if(!stub)throw new Error(`${definition.name} data is unavailable`);
  const hydrated=await art.prepareSet(stub);
  const built=await fixedProductCardsV03514(hydrated);
  if(!built?.cards?.length||built.cards.length!==definition.cardCount)throw new Error(`${definition.name} could not be assembled`);
  const merged=fixed.grantToCollection?.(state.cards,built.cards,Date.now());
  if(!merged)throw new Error(`${definition.name} could not be added to the binder`);
  try{checkCardMilestones(built.set?.id||stub.id);}catch(_){ }
  save();
  try{rebuildCollectionControls();if(collectionMode==='cards')renderCollection();}catch(_){ }
  try{renderProfile();renderGlobalHud();}catch(_){ }
  return {...merged,code:definition.code,name:definition.name};
}

async function preparePack() {
  if(packRun?.building)return;
  const setId=document.getElementById('setSelect').value,source=document.getElementById('cardSource').value;if(!setId)return;
  const entitlement=packEntitlement();if(entitlement.mode==='coins'&&state.profile.coins<entitlement.cost){showToast('Not enough Lucky Coins.');return;}
  const initialSet=setCache[source]?.find(s=>s.id===setId)||cachedSetV13(setId,source);
  // Re-check at the purchase boundary as well as while populating the selector.
  // A stale option/cache entry must never bypass the booster-only product gate.
  // Reject it before starting a run so the building guard cannot be left latched.
  if(source==='tcg'&&window.LuckyDexCardAcquisition?.boosterProductEligible?.(initialSet,'tcg')!==true){showToast('That product is not available in the Booster Shop.');return;}
  const run=newPackRun();run.building=true;preparedPack=null;
  const libraryInstall=source==='tcg'&&!!initialSet?._libraryKey;
  const stage=packStageLoading(libraryInstall?'Loading exact set artwork…':'Building your pack…'),btn=document.getElementById('openPackBtn'),tenBtn=document.getElementById('openTenPackBtn');btn.disabled=true;if(tenBtn)tenBtn.disabled=true;
  const watchdog=setTimeout(()=>{
    if(run!==packRun||!run.building)return;
    run.timedOut=true;run.abort.abort();
    stage.innerHTML='<button class="pack-exit" id="packExitBtn">‹ SHOP</button><div class="empty"><b>PACK DATA TIMED OUT</b><br>The set did not finish loading. Your coins/ticket were not spent. Try again or use an installed/cached set.</div>';
    const exit=document.getElementById('packExitBtn');if(exit)exit.onclick=()=>closePackOpening();
  },libraryInstall?120000:10000);
  try{
    let set=initialSet,cards,godPack=false,luckyPack=false;
    if(source==='tcg'&&set?._libraryKey&&window.LuckyDexCardArt){
      set=await LuckyDexCardArt.prepareSet(set,run.abort.signal);
      if(!validPackRun(run))return;
      const fixedBuilt=await fixedProductCardsV03514(set,run.abort.signal);
      if(fixedBuilt){
        set=fixedBuilt.set;cards=fixedBuilt.cards;
      }else{
        godPack=window.LuckyDexGodPack.shouldRoll()===true;luckyPack=!godPack&&Math.random()<1/500;
        cards=await buildBalancedPackWithRetry(set,source,luckyPack,run.abort.signal,godPack);
      }
      const catalogueOnly={...set,cards:[]};cacheSetV13(catalogueOnly,source);
    }else if(!isOnlineV13()){
      godPack=window.LuckyDexGodPack.shouldRoll()===true;luckyPack=!godPack&&Math.random()<1/500;
      if(!set)throw new Error('offline-set-missing');cards=await buildOfflinePackV13(set,source,luckyPack,godPack);
    }else{
      if(source==='tcgp'&&window.LuckyDexPocket){
        if(!POCKET_EXACT_DATASETS_V0261.has(set?._pocketDataset)||!set?.cards?.length){
          try{set=await LuckyDexPocket.setDetail(setId,run.abort.signal);}
          catch(err){
            // If the dedicated Pocket feed is temporarily unreachable, use any
            // previously cached full Pocket set before giving up.
            const cached=cachedSetV13(setId,source);if(cached?.cards?.length)set=cached;else throw err;
          }
        }
      }else if(!set?.cards?.length)set=await packFetch(API.tcgSet(setId),run.abort.signal,5000);
      if(!validPackRun(run))return;
      godPack=window.LuckyDexGodPack.shouldRoll()===true;luckyPack=!godPack&&Math.random()<1/500;
      cacheSetV13(set,source);cards=await buildBalancedPackWithRetry(set,source,luckyPack,run.abort.signal,godPack);
      if(!validPackRun(run))return;
      cacheCardsV13(cards,set,source);
    }
    if(!validPackRun(run))return;
    preparedPack={set,source,cards,luckyPack,godPack,revealed:new Set(),committed:false,entitlement,currentIndex:0};
    // Artwork must never block pack construction indefinitely. The first two
    // preloads get a small head start, but the sealed pack appears regardless.
    Promise.allSettled(cards.slice(0,2).map(c=>preloadPackCard(c,run)));
    cards.slice(2).forEach(c=>preloadPackCard(c,run));
    await renderSealedPack();
  }catch(error){
    if(run.timedOut||run!==packRun)return;
    recordPackOpeningError(error,'prepare-pack',null,null,{set:initialSet,setId,source});
    stage.innerHTML=`<button class="pack-exit" id="packExitBtn">‹ SHOP</button><div class="empty"><b>${isOnlineV13()?'PACK ERROR':'OFFLINE CACHE NEEDED'}</b><br>${isOnlineV13()?'Could not prepare this set. Nothing was spent. Please try again.':'Open this set online once to cache its cards and artwork. Nothing was spent.'}</div>`;
    document.getElementById('packExitBtn').onclick=()=>closePackOpening();
  }finally{
    clearTimeout(watchdog);
    if(run===packRun){run.building=false;updatePackButton();updateOfflineHintV13();}
  }
}

async function preparePocketTenPack(){
  if(packRun?.building)return false;
  const source=document.getElementById('cardSource')?.value||'tcg',setId=document.getElementById('setSelect')?.value||'';
  if(source!=='tcgp'||!setId){showToast('Choose a TCG Pocket set first.');return false;}
  const initialSet=setCache.tcgp?.find(s=>String(s.id)===String(setId))||cachedSetV13(setId,'tcgp');
  const cost=pocketTenPackCost(initialSet);
  if(Number(state.profile.coins||0)<cost){showToast(`You need ${fmt(cost)} Lucky Coins for 10 packs.`);return false;}
  const run=newPackRun();run.building=true;preparedPack=null;
  const stage=packStageLoading('Building 10 Pocket packs…'),singleBtn=document.getElementById('openPackBtn'),tenBtn=document.getElementById('openTenPackBtn');
  if(singleBtn)singleBtn.disabled=true;if(tenBtn)tenBtn.disabled=true;
  const watchdog=setTimeout(()=>{
    if(run!==packRun||!run.building)return;
    run.timedOut=true;run.abort.abort();
    stage.innerHTML='<button class="pack-exit" id="packExitBtn">‹ SHOP</button><div class="empty"><b>10-PACK DATA TIMED OUT</b><br>The set did not finish loading. Your coins were not spent.</div>';
    const exit=document.getElementById('packExitBtn');if(exit)exit.onclick=()=>closePackOpening();
  },20000);
  try{
    let set=initialSet;
    if(isOnlineV13()){
      if(window.LuckyDexPocket&&(!POCKET_EXACT_DATASETS_V0261.has(set?._pocketDataset)||!set?.cards?.length)){
        try{set=await LuckyDexPocket.setDetail(setId,run.abort.signal);}catch(error){const cached=cachedSetV13(setId,'tcgp');if(cached?.cards?.length)set=cached;else throw error;}
      }
      if(!set?.cards?.length)throw new Error('pocket-set-missing');
      cacheSetV13(set,'tcgp');
    }else if(!set){throw new Error('offline-set-missing');}
    if(!validPackRun(run))return false;
    const packGroups=[];
    for(let i=0;i<TCGP_TEN_PACK_COUNT;i++){
      const godPack=window.LuckyDexGodPack.shouldRoll()===true,luckyPack=!godPack&&Math.random()<1/500;
      const cards=isOnlineV13()?await buildBalancedPackWithRetry(set,'tcgp',luckyPack,run.abort.signal,godPack):await buildOfflinePackV13(set,'tcgp',luckyPack,godPack);
      if(!validPackRun(run))return false;
      packGroups.push({cards, luckyPack, godPack});
      if(isOnlineV13())cacheCardsV13(cards,set,'tcgp');
    }
    const cards=packGroups.flatMap(group=>group.cards);
    preparedPack={set,source:'tcgp',cards,packGroups,packCount:TCGP_TEN_PACK_COUNT,batch:true,luckyPack:false,godPack:false,revealed:new Set(),committed:false,entitlement:{mode:'coins',label:`OPEN 10 · ${fmt(cost)} COINS`,cost},currentIndex:0};
    cards.forEach(card=>preloadPackCard(card,run));
    await renderSealedPack();
    return true;
  }catch(error){
    if(run.timedOut||run!==packRun)return false;
    recordPackOpeningError(error,'prepare-ten-pack',null,null,{set:initialSet,setId,source:'tcgp'});
    stage.innerHTML=`<button class="pack-exit" id="packExitBtn">‹ SHOP</button><div class="empty"><b>${isOnlineV13()?'10-PACK ERROR':'OFFLINE CACHE NEEDED'}</b><br>${isOnlineV13()?'Could not prepare all 10 packs. Nothing was spent. Please try again.':'Open this set online once to cache its cards and artwork. Nothing was spent.'}</div>`;
    const exit=document.getElementById('packExitBtn');if(exit)exit.onclick=()=>closePackOpening();
    return false;
  }finally{
    clearTimeout(watchdog);
    if(run===packRun){run.building=false;updatePackButton();updateOfflineHintV13();}
  }
}

async function openStoredPack(entry,hooks={}) {
  if(packRun?.building)return false;
  const setId=String(entry?.setId||'').trim();if(!setId)return false;
  const run=newPackRun();run.building=true;preparedPack=null;
  const stage=packStageLoading('Preparing your saved booster…');
  try{
    let set=setCache?.tcg?.find?.(s=>String(s?._libraryKey||s?.id||'')===setId)||cachedSetV13(setId,'tcg');
    if((!set||!set.cards?.length)&&window.LuckyDexCardArt?.catalog){
      const catalogue=await LuckyDexCardArt.catalog();
      const stub=(catalogue||[]).find(s=>String(s?._libraryKey||s?.id||'').replace(/^library:/i,'')===setId);
      if(stub)set=await LuckyDexCardArt.prepareSet(stub,run.abort.signal);
    }
    if(!set?.cards?.length&&isOnlineV13())set=await packFetch(API.tcgSet(setId),run.abort.signal,5000);
    if(!validPackRun(run)||!set?.cards?.length)throw new Error('sealed-pack-data-unavailable');
    const fixedBuilt=await fixedProductCardsV03514(set,run.abort.signal);
    let cards;if(fixedBuilt){set=fixedBuilt.set;cards=fixedBuilt.cards;}else cards=await buildBalancedPackWithRetry(set,'tcg',false,run.abort.signal);
    if(!validPackRun(run))return false;
    preparedPack={set,source:'tcg',cards,luckyPack:false,godPack:false,revealed:new Set(),committed:false,entitlement:{mode:'sealed',setId},sealedRewardSetId:setId,currentIndex:0,rewardHooks:hooks||{}};
    Promise.allSettled(cards.slice(0,2).map(c=>preloadPackCard(c,run)));cards.slice(2).forEach(c=>preloadPackCard(c,run));
    await renderSealedPack();return true;
  }catch(_){
    if(run===packRun){showToast('Pack data unavailable. Your sealed pack was kept.');closePackOpening(true);}
    return false;
  }finally{if(run===packRun)run.building=false;}
}
window.LuckyDexPackFlow=Object.assign(window.LuckyDexPackFlow||{},{openStoredPack,grantFixedProductReward:grantFixedProductRewardV03515});

function specialPackIntroMarkupV04028(label='GOD PACK'){
  const particles=Array.from({length:30},(_,i)=>`<i class="god-pack-intro-particle" style="--i:${i}"></i>`).join('');
  const ribbons=Array.from({length:12},(_,i)=>`<i class="god-pack-intro-ribbon" style="--i:${i}"></i>`).join('');
  return `<div class="god-pack-intro" role="status" aria-live="assertive">${ribbons}${particles}<div class="god-pack-intro-core"><strong class="god-pack-intro-title">${escapeHtml(label)}</strong></div></div>`;
}
async function playSpecialPackIntroV04028(run,pack,label='GOD PACK'){
  if(!run||!pack)return true;
  const stage=document.getElementById('packStage');if(!stage)return true;
  stage.classList.remove('god-pack-omen');stage.classList.add('god-pack-active');stage.dataset.packPhase='god-intro';stage.innerHTML=specialPackIntroMarkupV04028(label);
  packHaptic([32,28,52,34,72,40,96,52,130]);
  const shown=await packDelay(1650,run.abort.signal);return !!shown&&validPackRun(run)&&preparedPack===pack;
}
function godPackIntroMarkupV0291(){const particles=Array.from({length:30},(_,i)=>`<i class="god-pack-intro-particle" style="--i:${i}"></i>`).join(''),ribbons=Array.from({length:12},(_,i)=>`<i class="god-pack-intro-ribbon" style="--i:${i}"></i>`).join('');return `<div class="god-pack-intro" role="status" aria-live="assertive">${ribbons}${particles}<div class="god-pack-intro-core"><strong class="god-pack-intro-title">GOD PACK</strong></div></div>`;}
async function playGodPackIntroV0291(run,pack){if(!run||!pack?.godPack)return true;return playSpecialPackIntroV04028(run,pack,'GOD PACK');}

function rarePackIntroMarkupV04030(){
  const sparks=Array.from({length:14},(_,i)=>`<i class="rare-pack-intro-spark" style="--i:${i}"></i>`).join('');
  return `<div class="rare-pack-intro" role="status" aria-live="assertive">${sparks}<div class="rare-pack-intro-core"><small>LUCKY UPLIFT</small><strong>RARE PACK</strong><span>EVERY SLOT RAISED · GREAT HIT GUARANTEED</span></div></div>`;
}
async function playRarePackIntroV04030(run,pack){
  if(!run||!pack)return true;const stage=document.getElementById('packStage');if(!stage)return true;
  stage.classList.remove('god-pack-omen','god-pack-active','rare-pack-active');stage.classList.add('rare-pack-active');stage.dataset.packPhase='rare-intro';stage.innerHTML=rarePackIntroMarkupV04030();
  packHaptic([22,24,36,28,54]);const shown=await packDelay(1180,run.abort.signal);return !!shown&&validPackRun(run)&&preparedPack===pack;
}

function pocketTenPackGroupAtIndex(pack,index=pack?.currentIndex||0){
  const groups=pack?.packGroups||[];if(!groups.length)return null;let start=0;
  for(let groupIndex=0;groupIndex<groups.length;groupIndex++){
    const group=groups[groupIndex]||{},cards=group.cards||[],end=start+cards.length;
    if(index>=start&&index<end)return {groupIndex,group,cards,start,end:end-1,localIndex:index-start};
    start=end;
  }
  return null;
}
function applyPocketTenPackGroupFlags(pack,groupInfo=pocketTenPackGroupAtIndex(pack)){
  if(!pack||!groupInfo)return null;pack.godPack=!!groupInfo.group.godPack;pack.luckyPack=!!groupInfo.group.luckyPack;pack.batchGroupIndex=groupInfo.groupIndex;return groupInfo;
}
async function playPocketTenPackGroupIntro(run,pack,groupInfo=pocketTenPackGroupAtIndex(pack)){
  if(!run||!pack||!groupInfo)return true;applyPocketTenPackGroupFlags(pack,groupInfo);
  pack.batchIntroPlayed=pack.batchIntroPlayed||new Set();if(pack.batchIntroPlayed.has(groupInfo.groupIndex))return true;pack.batchIntroPlayed.add(groupInfo.groupIndex);
  const group=groupInfo.group;
  if(group.godPack)return await playGodPackIntroV0291(run,pack);
  if(group.luckyPack)return await playRarePackIntroV04030(run,pack);
  return true;
}
async function startPocketTenPackReveal(run,pack){
  if(!run||!pack?.packGroups?.length)return false;pack.currentIndex=0;pack.batchIntroPlayed=new Set();const groupInfo=pocketTenPackGroupAtIndex(pack,0);applyPocketTenPackGroupFlags(pack,groupInfo);
  if(!(await playPocketTenPackGroupIntro(run,pack,groupInfo)))return false;return await renderPackCard();
}

async function tearPack() {
  const run=packRun,pack=preparedPack;if(!run||!pack||pack.tearing||pack.committed)return;
  pack.tearing=true;const sealed=document.getElementById('sealedPack');if(sealed){sealed.disabled=true;sealed.classList.add('tearing');}
  vibrate([14,18,24]);
  if(!await packDelay(620,run.abort.signal)||!validPackRun(run)||preparedPack!==pack)return;
  if(commitPreparedPack()===false){pack.tearing=false;if(sealed){sealed.disabled=false;sealed.classList.remove('tearing');}showToast('This sealed pack is no longer available.');return;}
  if(Number(pack.packCount||1)>1){await startPocketTenPackReveal(run,pack);return;}
  if(pack.godPack&&!(await playGodPackIntroV0291(run,pack)))return;
  if(pack.source==='tcgp'&&pack.luckyPack&&!pack.godPack&&!(await playRarePackIntroV04030(run,pack)))return;
  pack.currentIndex=0;await renderPackCard();
}
function stopPackFastReveal(){
  packFastRevealActive=false;if(packFastRevealTimer!==null){clearTimeout(packFastRevealTimer);packFastRevealTimer=null;}
  if(packFastReleaseHandler){window.removeEventListener?.('pointerup',packFastReleaseHandler,true);window.removeEventListener?.('pointercancel',packFastReleaseHandler,true);packFastReleaseHandler=null;}
}
function packFastRevealStep(){
  if(!packFastRevealActive)return;const session=packRun?.reveal?.session;if(!packRun||!preparedPack){stopPackFastReveal();return;}
  if(!session){packFastRevealTimer=setTimeout(packFastRevealStep,60);return;}
  if(!session.ready){session.skip();packFastRevealTimer=setTimeout(packFastRevealStep,PACK_FAST_CARD_DWELL_MS);return;}
  if(preparedPack.currentIndex>=preparedPack.cards.length-1){renderPackSummary();stopPackFastReveal();return;}
  advancePackCard();packFastRevealTimer=setTimeout(packFastRevealStep,120);
}
function startPackFastReveal(){
  if(packFastRevealActive)return;packFastRevealActive=true;packFastReleaseHandler=()=>stopPackFastReveal();
  window.addEventListener?.('pointerup',packFastReleaseHandler,true);window.addEventListener?.('pointercancel',packFastReleaseHandler,true);packFastRevealStep();
}

async function renderPackCard() {
  const run=packRun,pack=preparedPack;if(!run||!pack)return false;
  run.reveal?.destroy();run.reveal=null;
  const index=pack.currentIndex,groupInfo=pocketTenPackGroupAtIndex(pack,index);if(groupInfo)applyPocketTenPackGroupFlags(pack,groupInfo);const card=pack.cards[index];
  if(!card){recordPackOpeningError(new Error('Pack card index out of range'),'card-index',null,index);renderPackSummary();return false;}
  const stage=packStageLoading(),pocketRare=pack.source==='tcgp'&&pack.luckyPack&&!pack.godPack;stage.classList.toggle('god-pack-active',!!pack.godPack);stage.classList.toggle('rare-pack-active',pocketRare);stage.classList.remove('god-pack-omen');
  let art=null,hiddenCoverArt=null;
  try{[art,hiddenCoverArt]=await Promise.all([preloadPackCard(card,run),card._hiddenDittoCover?preloadPackCard(card._hiddenDittoCover,run):Promise.resolve(null),preloadPackCard(pack.cards[index+1],run)]);}catch(error){recordPackOpeningError(error,'preload',card,index);art={url:LuckyDexPack.placeholder(card.name),owned:false,source:'recovery'};hiddenCoverArt=card._hiddenDittoCover?{url:LuckyDexPack.placeholder(card._hiddenDittoCover.name),owned:false,source:'recovery'}:null;}
  if(!validPackRun(run)||preparedPack!==pack||pack.currentIndex!==index)return false;
  const revealOptions={
    card,artwork:art?.url||LuckyDexPack.placeholder(card.name),hiddenDittoCoverArtwork:hiddenCoverArt?.url||card._hiddenDittoCover?._packArtwork||card._hiddenDittoCover?.image||'',index:groupInfo?groupInfo.localIndex:index,count:groupInfo?groupInfo.cards.length:pack.cards.length,setName:pack.set.name,haptic:packHaptic,
    onExit:()=>closePackOpening(),onNext:advancePackCard,onPrevious:previousPackCard,
    onFullScreen:()=>{const hidden=card._hiddenDitto&&!card._hiddenDittoRevealed,shown=hidden?card._hiddenDittoCover:card,shownArt=hidden?(hiddenCoverArt?.url||shown?._packArtwork||shown?.image):(art?.url||card.image||LuckyDexPack.placeholder(card.name));openCardModal({...shown,image:shownArt,_packArtwork:shownArt});},
    onFastStart:startPackFastReveal,onFastEnd:stopPackFastReveal,
    onSettle:()=>pack.revealed.add(index),
    onError:error=>recordPackOpeningError(error,'cinematic-frame',card,index)
  };
  try{run.reveal=LuckyDexPack.mountReveal(stage,revealOptions);}
  catch(error){
    recordPackOpeningError(error,'cinematic-mount',card,index);
    try{run.reveal=LuckyDexPack.mountFallbackReveal(stage,revealOptions);}
    catch(fallbackError){recordPackOpeningError(fallbackError,'fallback-mount',card,index);renderPackSummary();showToast('Pack reveal recovered to the summary.');return false;}
  }
  if(groupInfo){const progress=document.createElement('div');progress.className='pack-batch-running-badge';progress.textContent=`PACK ${groupInfo.groupIndex+1} / ${pack.packGroups.length}`;stage.appendChild(progress);}
  if(pack.godPack||pocketRare){const badge=document.createElement('div');badge.className=pack.godPack?'god-pack-running-badge':'rare-pack-running-badge';badge.textContent=pack.godPack?'GOD PACK':'RARE PACK · UPLIFT';stage.appendChild(badge);}
  return true;
}

function advancePackCard() {
  if(packNavigationBusy||!packRun?.reveal?.session.ready||!preparedPack)return false;
  if(preparedPack.currentIndex>=preparedPack.cards.length-1){packNavigationBusy=true;try{renderPackSummary();}finally{packNavigationBusy=false;}return true;}
  packNavigationBusy=true;
  const pack=preparedPack,run=packRun,currentGroup=pocketTenPackGroupAtIndex(pack,pack.currentIndex),nextIndex=pack.currentIndex+1,nextGroup=pocketTenPackGroupAtIndex(pack,nextIndex);pack.currentIndex=nextIndex;
  Promise.resolve((async()=>{if(nextGroup&&currentGroup&&nextGroup.groupIndex!==currentGroup.groupIndex){if(!(await playPocketTenPackGroupIntro(run,pack,nextGroup)))return false;}return await renderPackCard();})()).catch(error=>recordPackOpeningError(error,'advance',preparedPack?.cards?.[preparedPack?.currentIndex],preparedPack?.currentIndex)).finally(()=>{packNavigationBusy=false;});return true;
}
function previousPackCard() {
  if(packNavigationBusy||!packRun?.reveal?.session.ready||!preparedPack||preparedPack.currentIndex<=0)return false;
  packNavigationBusy=true;preparedPack.currentIndex--;
  Promise.resolve(renderPackCard()).catch(error=>recordPackOpeningError(error,'previous',preparedPack?.cards?.[preparedPack?.currentIndex],preparedPack?.currentIndex)).finally(()=>{packNavigationBusy=false;});return true;
}
function packSummaryLabelV03515(card,set){
  const printed=String(card?.rarity||'').trim(),foil=String(card?._foil||'').trim();
  if(/^no rarity$/i.test(printed))return /reverse/i.test(foil)?'Reverse Holo':/foil|holo/i.test(foil)?'Holofoil':'';
  if(foil&&/reverse/i.test(foil))return printed?`Reverse Holo · ${printed}`:'Reverse Holo';
  return printed||(/foil|holo/i.test(foil)?'Holofoil':foil);
}


function renderPocketTenPackSummary(){
  const pack=preparedPack;if(!pack)return;
  packRun?.reveal?.destroy();if(packRun)packRun.reveal=null;
  const stage=document.getElementById('packStage'),groups=pack.packGroups||[];stage.dataset.packPhase='summary';stage.classList.remove('god-pack-omen','god-pack-active','rare-pack-active');
  let flatIndex=0;
  const groupMarkup=groups.map((group,index)=>{
    const eventLabel=group.godPack?'GOD PACK':group.luckyPack?'RARE PACK · UPLIFT':'',eventClass=group.godPack?' god-pack-group':group.luckyPack?' rare-pack-group':'';
    const cardsMarkup=(group.cards||[]).map(card=>{const cardIndex=flatIndex++;return `<button class="v13-summary-card level-${LuckyDexPack.profileFor(card).level}${card._wasNew?' is-new':''}" data-batch-summary-card="${cardIndex}"><div class="card-art-wrap">${card._wasNew?'<span class="pack-summary-new">NEW</span>':''}<img src="${escapeHtml(card._packArtwork||card.image||LuckyDexPack.placeholder(card.name))}" alt="${escapeHtml(card.name)}"></div><b>${escapeHtml(card.name)}</b><span>${escapeHtml(packSummaryLabelV03515(card,pack.set))}</span></button>`;}).join('');
    return `<section class="pocket-ten-pack-group${eventClass}"><div class="pocket-ten-pack-head"><b>PACK ${index+1}</b>${eventLabel?`<span>${eventLabel}</span>`:''}</div><div class="v13-summary-grid pocket-ten-pack-grid">${cardsMarkup}</div></section>`;
  }).join('');
  stage.innerHTML=`<button class="pack-exit" id="packExitBtn">‹ SHOP</button><div class="v13-summary pocket-ten-pack-summary"><div class="screen-title"><div><div class="eyebrow">10 PACKS COMPLETE</div><h2>${escapeHtml(pack.set.name)}</h2></div><span class="pill">${pack.cards.length} cards</span></div><div class="pocket-ten-pack-groups">${groupMarkup}</div><button class="primary full v13-back-shop" id="shopAnotherPackBtn">BACK TO PACK SHOP</button></div>`;
  document.getElementById('packExitBtn').onclick=document.getElementById('shopAnotherPackBtn').onclick=()=>closePackOpening();
  stage.querySelectorAll('[data-batch-summary-card]').forEach(button=>button.onclick=()=>{const card=pack.cards[Number(button.dataset.batchSummaryCard)];if(card)openCardModal({...card,image:card._packArtwork||card.image});});
}

function renderPackSummary() {
  const pack=preparedPack;if(!pack)return;if(Number(pack.packCount||1)>1)return renderPocketTenPackSummary();
  packRun?.reveal?.destroy();if(packRun)packRun.reveal=null;
  const stage=document.getElementById('packStage'),pocketRare=pack.source==='tcgp'&&pack.luckyPack&&!pack.godPack;stage.dataset.packPhase='summary';stage.classList.toggle('god-pack-active',!!pack.godPack);stage.classList.toggle('rare-pack-active',pocketRare);stage.classList.remove('god-pack-omen');
  const fixedHalfDeck=pack.set?._fixedProductKind==='half-deck'||window.LuckyDexPackPolicy?.resolve?.(pack.set,pack.source)?.productKind==='half-deck';
  const completeLabel=pack.godPack?'GOD PACK COMPLETE':pocketRare?'RARE PACK COMPLETE':fixedHalfDeck?'HALF DECK COMPLETE':'PACK COMPLETE',summaryClass=pack.godPack?'v13-summary god-pack-summary':pocketRare?'v13-summary rare-pack-summary':'v13-summary';let summaryCount=pack.godPack?`${pack.cards.length} hits`:fixedHalfDeck?'30-card Half Deck':`${pack.cards.length} cards`;if(pocketRare)summaryCount='UPLIFTED · GREAT HIT';const specialBadge=pack.godPack?'GOD PACK':pocketRare?'RARE PACK · UPLIFT':'';const badgeClass=pack.godPack?'god-pack-running-badge':'rare-pack-running-badge';
  stage.innerHTML=`<button class="pack-exit" id="packExitBtn">${pack.rewardHooks?'‹ BACK':'‹ SHOP'}</button>${specialBadge?`<div class="${badgeClass}">${specialBadge}</div>`:''}<div class="${summaryClass}"><div class="screen-title"><div><div class="eyebrow">${completeLabel}</div><h2>${escapeHtml(pack.set.name)}</h2></div><span class="pill">${summaryCount}</span></div><div class="v13-summary-grid">${pack.cards.map(c=>`<button class="v13-summary-card level-${LuckyDexPack.profileFor(c).level}${c._wasNew?' is-new':''}" data-summary-card="${escapeHtml(c.id)}"><div class="card-art-wrap">${c._wasNew?'<span class="pack-summary-new">NEW</span>':''}<img src="${escapeHtml(c._packArtwork||LuckyDexPack.placeholder(c.name))}" alt="${escapeHtml(c.name)}"></div><b>${escapeHtml(c.name)}</b><span>${escapeHtml(packSummaryLabelV03515(c,pack.set))}</span></button>`).join('')}</div><button class="primary full v13-back-shop" id="shopAnotherPackBtn">${pack.rewardHooks?'DONE':'BACK TO PACK SHOP'}</button></div>`;
  document.getElementById('packExitBtn').onclick=document.getElementById('shopAnotherPackBtn').onclick=()=>closePackOpening();
  stage.querySelectorAll('[data-summary-card]').forEach(button=>button.onclick=()=>{const c=pack.cards.find(c=>c.id===button.dataset.summaryCard);openCardModal({...c,image:c._packArtwork});});
}
function closePackOpening(force=false) {
  const stage=document.getElementById('packStage');if(!stage)return;
  if(!force&&preparedPack&&!preparedPack.committed&&!preparedPack.debug&&document.getElementById('sealedPack')&&!confirm(preparedPack.sealedRewardSetId?'Keep this booster sealed and leave the opener?':Number(preparedPack.packCount||1)>1?'Leave these 10 unopened packs? Nothing has been spent yet.':'Leave this unopened pack? Nothing has been spent yet.'))return;
  const hooks=preparedPack?.rewardHooks||null,info=preparedPack?{setId:preparedPack.sealedRewardSetId||'',committed:!!preparedPack.committed}:null;
  const dialog=document.getElementById('cardDialog');if(dialog?.open)dialog.close();
  cancelPackRun();preparedPack=null;stage.hidden=true;stage.innerHTML='';stage.classList.remove('god-pack-omen','god-pack-active','rare-pack-active');delete stage.dataset.packPhase;document.body.classList.remove('pack-opening');updatePackButton();
  try{hooks?.onClose?.(info);}catch(_){ }
}
function packHaptic(pattern) {
  if(!state.settings.vibration)return;
  if(window.Android?.packHaptic)window.Android.packHaptic(JSON.stringify(pattern));
  else vibrate(pattern);
}
window.LuckyDexDebug=Object.assign(window.LuckyDexDebug||{}, {
  async playPackTier(tier='crown') {
    if(preparedPack&&!preparedPack.debug)throw new Error('Close the active pack before replaying a preview.');
    const rarities=['Common','Rare','Double Rare','One Star','Two Star','Crown'];
    const aliases={common:0,rare:1,holo:1,illustration:3,'one-star':3,'two-star':4,'three-star':4,high:4,crown:5,top:5};
    const value=typeof tier==='number'?rarities[Math.max(0,Math.min(5,Math.floor(tier)))]:rarities[aliases[String(tier).toLowerCase()]]||String(tier);
    const run=newPackRun(),card={id:'local-debug-card',name:'Lucky Dex Preview',rarity:value,image:LuckyDexPack.placeholder('Lucky Dex Preview')};
    preparedPack={set:{id:'local-preview',name:'Local preview'},source:'tcgp',cards:[card],currentIndex:0,debug:true,committed:true,revealed:new Set()};
    await preloadPackCard(card,run);await renderPackCard();
  }
});
