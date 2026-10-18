(function(root,factory){
  const catalogue=(typeof module==='object'&&module.exports)?require('./cosmetics-catalog-v0413.js'):root.LuckyDexCosmeticsCatalogV0413;
  const api=factory(catalogue||{CATALOGUE:[],BY_ID:{}});
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexCosmeticsV0413=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(catalogue){
  'use strict';
  const DEFAULT_SLEEVE_ID='luckydex-default';
  const registry=catalogue.BY_ID||Object.fromEntries((catalogue.CATALOGUE||[]).map(x=>[x.id,x]));
  const ALWAYS_UNLOCKED_IDS=(catalogue.CATALOGUE||[]).filter(x=>!x.hidden&&(x.alwaysUnlocked===true||(!x.sourceAchievementId&&!x.rewardGroup))).map(x=>x.id);
  let bridge={getState:null,save:null,showToast:null,onChange:null};
  let sessionUnlockAll=false;
  let pendingRecognition=null;
  const strings=v=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()))]:[];
  function normaliseCosmetics(raw,customRegistry){
    const reg=customRegistry||registry;
    const src=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
    const saved=strings(src.unlockedSleeves).filter(id=>!!reg[id]);
    const base=ALWAYS_UNLOCKED_IDS.filter(id=>!!reg[id]);
    if(reg[DEFAULT_SLEEVE_ID]&&!base.includes(DEFAULT_SLEEVE_ID))base.unshift(DEFAULT_SLEEVE_ID);
    const unlocked=[...base,...saved.filter(id=>!base.includes(id))];
    const active=(typeof src.activeSleeve==='string'&&unlocked.includes(src.activeSleeve)&&reg[src.activeSleeve])?src.activeSleeve:DEFAULT_SLEEVE_ID;
    return {...src,unlockedSleeves:unlocked,activeSleeve:active,discoveredSecrets:strings(src.discoveredSecrets),claimedCosmeticRewards:strings(src.claimedCosmeticRewards)};
  }
  function ensureState(state){if(!state||typeof state!=='object')return normaliseCosmetics(null);state.cosmetics=normaliseCosmetics(state.cosmetics);return state.cosmetics;}
  function unlockSleeve(state,id,claimToken){
    const c=ensureState(state);id=String(id||'');
    if(!registry[id])return {ok:false,changed:false,id};
    let changed=false;
    if(!c.unlockedSleeves.includes(id)){c.unlockedSleeves.push(id);changed=true;}
    if(claimToken&&!c.claimedCosmeticRewards.includes(String(claimToken))){c.claimedCosmeticRewards.push(String(claimToken));changed=true;}
    return {ok:true,changed,id};
  }
  function equipSleeve(state,id){
    const c=ensureState(state);id=String(id||'');
    if(!registry[id])return {ok:false,changed:false,reason:'unknown'};
    if(!c.unlockedSleeves.includes(id)&&!sessionUnlockAll)return {ok:false,changed:false,reason:'locked'};
    const changed=c.activeSleeve!==id;c.activeSleeve=id;applyActiveSleeveCss(state);return {ok:true,changed};
  }
  function activeSleeve(state){const c=ensureState(state||bridge.getState?.()||{});return registry[c.activeSleeve]||registry[DEFAULT_SLEEVE_ID]||{id:DEFAULT_SLEEVE_ID,name:'LuckyDex Default',artPath:''};}
  function discoverSecret(state,secretId){const c=ensureState(state);secretId=String(secretId||'');if(!secretId||c.discoveredSecrets.includes(secretId))return false;c.discoveredSecrets.push(secretId);return true;}
  function isDiscovered(state,secretId){return ensureState(state).discoveredSecrets.includes(String(secretId||''));}
  function installBridge(next={}){bridge={...bridge,...next};applyActiveSleeveCss(bridge.getState?.());return api;}

  function defaultBackInnerHtml(){
    return `<span class="lucky-sleeve-back-inner" data-sleeve-id="${DEFAULT_SLEEVE_ID}"><span class="lucky-sleeve-fallback"><i></i></span></span>`;
  }
  function cardBackInnerHtml(stateOverride){
    const entry=activeSleeve(stateOverride||bridge.getState?.()||{}),id=entry?.id||DEFAULT_SLEEVE_ID,path=String(entry?.artPath||'');
    if(!path)return defaultBackInnerHtml();
    const safePath=path.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
    return `<span class="lucky-sleeve-back-inner" data-sleeve-id="${id}"><span class="lucky-sleeve-fallback"><i></i></span><img src="${safePath}" alt="" onerror="this.remove()"></span>`;
  }

  function applyActiveSleeveCss(stateOverride){
    const entry=activeSleeve(stateOverride||bridge.getState?.()||{}),path=String(entry?.artPath||'');
    if(typeof document!=='undefined'&&document.documentElement?.style?.setProperty){const safe=path.replace(/"/g,'%22');document.documentElement.style.setProperty('--luckydex-active-sleeve',path?`url("${safe}")`:'none');}
    if(typeof document!=='undefined')for(const back of document.querySelectorAll?.('.lucky-sleeve-back-inner')||[]){
      back.dataset.sleeveId=entry.id;
      let img=back.querySelector('img');
      if(!path){img?.remove();continue;}
      if(!img){img=document.createElement('img');img.alt='';img.onerror=function(){this.remove();};back.appendChild(img);}
      if(img.getAttribute('src')!==path)img.setAttribute('src',path);
    }
    return entry;
  }

  // All evidence is read from persisted branches. No historical events are inferred
  // from scores, unlocked modes, current journeys, or incomplete card metadata.
  function progressionEvidence(state){
    const positive=v=>{if(typeof v!=='number'&&typeof v!=='string')return 0;const n=Number(v);return Number.isFinite(n)&&n>0?n:0;};
    const values=v=>v&&typeof v==='object'?Object.values(v):[];
    const claims=new Set(strings(state?.profile?.achievementClaims));
    const owned=values(state?.pokemon).filter(p=>Number.isInteger(positive(p?.id))&&positive(p.id)>=1&&positive(p.id)<=1025&&(p.count==null||positive(p.count)>0));
    const species=new Set(owned.map(p=>Number(p.id)));
    const types=['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
    const divisions=['rookie','poke','great','ultra','master'];
    const events=['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition'].map(id=>state?.arcade?.goldenrod?.events?.[id]||{});
    const medals=['bronze','silver','gold'];
    const divisionMedals=events.flatMap(e=>divisions.map(id=>e.divisionTrophies?.[id])).filter(m=>medals.includes(m));
    const typeMedals=events.flatMap(e=>types.flatMap(type=>divisions.map(id=>e.typeTrophies?.[type]?.[id]))).filter(m=>medals.includes(m));
    const sets={tcg:new Map(),tcgp:new Map()};
    for(const card of values(state?.cards)){
      const setId=String(card?.setId||card?.set?.id||'').replace(/^library:/i,'');
      const id=String(card?.id||card?.localId||'');
      const total=positive(card?.setTotal||card?.set?.cardCount?.total);
      if(!setId||!id||!Number.isInteger(total)||!total)continue;
      const source=card.source==='tcgp'?'tcgp':card.source==='tcg'?'tcg':/^[AB]\d/i.test(setId)?'tcgp':'tcg';
      const row=sets[source].get(setId)||{ids:new Set(),total:0};
      row.ids.add(id);row.total=Math.max(row.total,total);sets[source].set(setId,row);
    }
    const completeSets=source=>[...sets[source].values()].filter(row=>row.ids.size>=row.total).length;
    const secretGroups={'collection:starters':'v0413_secret_kanto_starters','collection:eevee-family':'v0413_secret_eevee_family'};
    function complete(group){
      const parts=String(group||'').split(':'),n=positive(parts[parts.length-1]);
      const expectedParts={region:2,dex:2,type:2,shiny:2,collection:3,tcg:3,tcgp:3,packs:2,'god-pack':2,arcade:3,goldenrod:3};
      if(!secretGroups[group]&&!['arcade:impact-clear','goldenrod:podium','goldenrod:division-gold','goldenrod:master-gold'].includes(group)&&parts.length!==expectedParts[parts[0]])return false;
      if(parts[0]==='region'&&['kanto','johto','hoenn'].includes(parts[1]))return claims.has(`regional_${parts[1]}`)||positive(state?.adventureRegional?.records?.[parts[1]]?.clears)>0;
      if(parts[0]==='dex'&&/^[1-9]$/.test(parts[1])){
        const [min,max]=[[1,151],[152,251],[252,386],[387,493],[494,649],[650,721],[722,809],[810,905],[906,1025]][Number(parts[1])-1];
        return claims.has(`dex_gen_${parts[1]}`)||[...species].filter(id=>id>=min&&id<=max).length===max-min+1;
      }
      if(parts[0]==='type'&&types.includes(parts[1]))return new Set(owned.filter(p=>Array.isArray(p.types)&&p.types.some(type=>String(type).toLowerCase()===parts[1])).map(p=>Number(p.id))).size>=10;
      if(parts[0]==='shiny'&&[1,10,25].includes(n))return claims.has(`shiny_${n}`)||Math.max(positive(state?.stats?.shinies),owned.filter(p=>p.shiny).reduce((sum,p)=>sum+Math.max(1,positive(p.count)),0))>=n;
      if(parts[0]==='collection'&&parts[1]==='species'&&Number.isInteger(n)&&n<=1025)return species.has(n);
      if(parts[0]==='collection'&&parts[1]==='family'){
        const ids=String(parts[2]||'').split('-').map(Number);
        return ids.length>1&&ids.every(id=>Number.isInteger(id)&&id>=1&&id<=1025&&species.has(id));
      }
      if(secretGroups[group])return claims.has(secretGroups[group])||(group==='collection:starters'?[1,4,7]:[133,134,135,136,196,197,470,471,700]).every(id=>species.has(id));
      if(['tcg','tcgp'].includes(parts[0])&&parts[1]==='sets'&&[1,5,10].includes(n))return claims.has(parts[0]==='tcg'&&n===10?'sets_tcg_10':parts[0]==='tcgp'&&n===5?'sets_tcgp_5':'')||completeSets(parts[0])>=n;
      if(parts[0]==='packs'&&[50,250].includes(n))return claims.has(`packs_${n}`)||positive(state?.stats?.packs)>=n;
      if(group==='god-pack:1')return claims.has('god_pack_1')||positive(state?.stats?.godPacks)>=1;
      if(group==='arcade:sampler:8')return claims.has('v0413_arcade_sampler_8')||values(state?.arcade?.records?.games).filter(r=>Array.isArray(r?.recent)&&r.recent.some(entry=>typeof entry?.entryId==='string'&&entry.entryId)).length>=8;
      if(group==='arcade:museum:20')return claims.has('museum_exhibits_20')||values(state?.arcade?.museum?.exhibits).filter(e=>e?.discovered===true).length>=20;
      if(group==='arcade:impact-clear')return claims.has('impact_trial_full_clear')||positive(state?.arcade?.impactTrial?.fullClears)>0;
      if(group==='goldenrod:podium')return claims.has('goldenrod_first_podium')||divisionMedals.length+typeMedals.length>0;
      if(group==='goldenrod:division-gold')return claims.has('goldenrod_division_champion')||divisionMedals.includes('gold');
      if(group==='goldenrod:master-gold')return claims.has('goldenrod_master_champion')||events.some(e=>e.divisionTrophies?.master==='gold');
      if(parts[0]==='goldenrod'&&parts[1]==='type'&&types.includes(parts[2])){
        const type=parts[2];
        return events.some(e=>divisions.some(id=>e.typeTrophies?.[type]?.[id]==='gold'))||['easy','normal','hard','expert'].some(id=>state?.arcade?.dash?.leagueRecords?.[type]?.[id]?.trophy==='gold');
      }
      return false;
    }
    return {complete,secretGroups,claims};
  }

  function reconcile(state,achievements=[]){
    ensureState(state);const byId=Object.fromEntries((achievements||[]).map(a=>[String(a?.id||''),a])),unlockedSleeves=[],discoveredSecrets=[],claimTokens=[],recognisedAchievements=[];
    const bindings=[];
    for(const entry of catalogue.CATALOGUE||[])if(entry.sourceAchievementId)bindings.push({achievementId:entry.sourceAchievementId,sleeveId:entry.id,hidden:!!entry.hidden});
    for(const a of achievements||[])if(a?.reward?.sleeve&&!bindings.some(b=>b.achievementId===a.id&&b.sleeveId===a.reward.sleeve))bindings.push({achievementId:a.id,sleeveId:a.reward.sleeve,hidden:!!a.hidden});
    for(const b of bindings){
      const a=byId[b.achievementId];if(!a)continue;
      let complete=!!state?.profile?.achievementClaims?.includes?.(a.id);
      if(!complete&&typeof a.progress==='function'){try{const [v,t]=a.progress();complete=Number(v||0)>=Math.max(1,Number(t||1));}catch(_){}}
      if(!complete)continue;
      const token=`achievement:${a.id}:sleeve:${b.sleeveId}`,had=ensureState(state).unlockedSleeves.includes(b.sleeveId),hadToken=ensureState(state).claimedCosmeticRewards.includes(token);
      let recognised=false;const r=unlockSleeve(state,b.sleeveId,token);if(r.ok&&!had&&r.changed){unlockedSleeves.push(b.sleeveId);recognised=true;}if(!hadToken&&ensureState(state).claimedCosmeticRewards.includes(token))claimTokens.push(token);
      if((a.hidden||b.hidden)&&!isDiscovered(state,a.id)){discoverSecret(state,a.id);discoveredSecrets.push(a.id);recognised=true;}
      if(recognised&&!recognisedAchievements.includes(a.id))recognisedAchievements.push(a.id);
    }
    const evidence=progressionEvidence(state),completedGroups=new Map();
    for(const entry of catalogue.CATALOGUE||[]){
      if(!entry.rewardGroup)continue;
      if(!completedGroups.has(entry.rewardGroup))completedGroups.set(entry.rewardGroup,evidence.complete(entry.rewardGroup));
      if(!completedGroups.get(entry.rewardGroup))continue;
      const secretId=entry.sourceAchievementId;
      if(entry.hidden&&(!secretId||(!evidence.claims.has(secretId)&&!isDiscovered(state,secretId)&&evidence.secretGroups[entry.rewardGroup]!==secretId)))continue;
      const c=ensureState(state),token=secretId?`achievement:${secretId}:sleeve:${entry.id}`:`progression:v0440:${entry.rewardGroup}:sleeve:${entry.id}`;
      const had=c.unlockedSleeves.includes(entry.id),hadToken=c.claimedCosmeticRewards.includes(token);
      const result=unlockSleeve(state,entry.id,token);
      if(result.ok&&!had)unlockedSleeves.push(entry.id);
      if(result.ok&&!hadToken)claimTokens.push(token);
      if(entry.hidden&&discoverSecret(state,secretId)){discoveredSecrets.push(secretId);if(!recognisedAchievements.includes(secretId))recognisedAchievements.push(secretId);}
    }
    if(unlockedSleeves.length||recognisedAchievements.length){pendingRecognition=pendingRecognition||{sleeves:[],achievements:[]};for(const id of unlockedSleeves)if(!pendingRecognition.sleeves.includes(id))pendingRecognition.sleeves.push(id);for(const id of recognisedAchievements)if(!pendingRecognition.achievements.includes(id))pendingRecognition.achievements.push(id);}
    return {unlockedSleeves,discoveredSecrets,claimTokens};
  }
  function consumeRecognitionSummary(){if(!pendingRecognition||(!pendingRecognition.sleeves.length&&!pendingRecognition.achievements.length))return null;const out={sleeves:[...pendingRecognition.sleeves],achievements:[...pendingRecognition.achievements]};pendingRecognition=null;return out;}
  function devUnlockAll({persist=false}={}){
    const ids=Object.keys(registry);sessionUnlockAll=true;
    if(persist&&bridge.getState){const s=bridge.getState();ids.forEach(id=>unlockSleeve(s,id,`dev:${id}`));bridge.save?.();bridge.onChange?.();}
    return ids;
  }
  function isOwned(state,id){return sessionUnlockAll||ensureState(state).unlockedSleeves.includes(id);}
  const api={DEFAULT_SLEEVE_ID,registry,catalogue:catalogue.CATALOGUE||[],normaliseCosmetics,ensureState,unlockSleeve,equipSleeve,activeSleeve,discoverSecret,isDiscovered,installBridge,defaultBackInnerHtml,cardBackInnerHtml,applyActiveSleeveCss,reconcile,consumeRecognitionSummary,devUnlockAll,isOwned};
  return api;
});
