(function(root,factory){
  const core=root.LuckyDexGoldenrodCore||(typeof require==='function'?require('./arcade-goldenrod-core.js'):null);
  const api=factory(core);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexGoldenrodState=api;
})(typeof window!=='undefined'?window:globalThis,function(core){
  'use strict';
  const EVENT_IDS=['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition'];
  const TYPES=new Set(['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']);
  const MEDALS=new Set(['bronze','silver','gold']);
  const LEGACY_DIVISION={easy:'poke',normal:'great',hard:'ultra',expert:'master'};
  const DEFAULT_EVENT_STATE=Object.freeze({unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:Object.freeze({}),typeTrophies:Object.freeze({}),records:Object.freeze({})});

  const clone=v=>JSON.parse(JSON.stringify(v));
  const divRank=id=>core?.division?core.division(id).index:({rookie:0,poke:1,great:2,ultra:3,master:4}[id]??0);
  function trophyRank(medal){return ({bronze:1,silver:2,gold:3})[String(medal||'').toLowerCase()]||0;}
  function betterMedal(a,b){return trophyRank(a)>=trophyRank(b)?a:b;}
  function defaultEventState(){return {unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}};}
  function defaultGoldenrodState(){return {version:1,events:{dash:defaultEventState(),powerTrial:defaultEventState(),impactTrial:defaultEventState(),targetRange:defaultEventState(),elementalGauntlet:defaultEventState(),enduranceExpedition:defaultEventState()}};}

  function normalizeEvent(value){
    const src=value&&typeof value==='object'?value:{};
    const validDiv=['rookie','poke','great','ultra','master'].includes(String(src.unlockedDivision))?String(src.unlockedDivision):'rookie';
    const divisionTrophies={...(src.divisionTrophies&&typeof src.divisionTrophies==='object'?src.divisionTrophies:{})};
    for(const id of ['rookie','poke','great','ultra','master'])if(id in divisionTrophies&&!MEDALS.has(String(divisionTrophies[id])))delete divisionTrophies[id];
    const typeTrophies={};
    for(const [type,byDivision] of Object.entries(src.typeTrophies&&typeof src.typeTrophies==='object'?src.typeTrophies:{})){
      if(!byDivision||typeof byDivision!=='object'){typeTrophies[type]=byDivision;continue;}
      typeTrophies[type]={...byDivision};
      for(const id of ['rookie','poke','great','ultra','master'])if(id in typeTrophies[type]&&!MEDALS.has(String(typeTrophies[type][id])))delete typeTrophies[type][id];
    }
    return {...src,unlockedDivision:validDiv,typeCupsUnlocked:!!src.typeCupsUnlocked,divisionTrophies,typeTrophies,records:{...(src.records&&typeof src.records==='object'?src.records:{})}};
  }

  function migrateLegacyDash(goldenrod,legacyDash){
    const out=goldenrod&&typeof goldenrod==='object'?goldenrod:defaultGoldenrodState();
    out.events=out.events&&typeof out.events==='object'?out.events:{};
    out.events.dash=normalizeEvent(out.events.dash);
    const dash=out.events.dash;
    const records=legacyDash?.leagueRecords&&typeof legacyDash.leagueRecords==='object'?legacyDash.leagueRecords:{};
    for(const [rawType,byDifficulty] of Object.entries(records)){
      const type=String(rawType||'').toLowerCase();
      if(!TYPES.has(type)||!byDifficulty||typeof byDifficulty!=='object')continue;
      for(const [difficulty,record] of Object.entries(byDifficulty)){
        const divisionId=LEGACY_DIVISION[String(difficulty||'').toLowerCase()];
        const medal=String(record?.trophy||'').toLowerCase();
        if(!divisionId||!MEDALS.has(medal))continue;
        dash.typeTrophies[type]={...(dash.typeTrophies[type]||{})};
        dash.typeTrophies[type][divisionId]=betterMedal(dash.typeTrophies[type][divisionId],medal)||medal;
        dash.typeCupsUnlocked=true;
        const next=core?.nextDivision?.(divisionId);
        const unlocked=next?.id||divisionId;
        if(divRank(unlocked)>divRank(dash.unlockedDivision))dash.unlockedDivision=unlocked;
      }
    }
    return out;
  }

  function normalizeGoldenrodState(value,{legacyDash}={}){
    const src=value&&typeof value==='object'?value:{};
    const out={...src,version:1,events:{...(src.events&&typeof src.events==='object'?src.events:{})}};
    for(const id of EVENT_IDS)out.events[id]=normalizeEvent(out.events[id]);
    return migrateLegacyDash(out,legacyDash);
  }

  function applyCupProgress(eventState,{mode,divisionId='rookie',type=null,finalPlace=6,trophy=null}={}){
    const e=eventState&&typeof eventState==='object'?eventState:defaultEventState();
    Object.assign(e,normalizeEvent(e));
    const place=Math.max(1,Math.min(6,Math.trunc(Number(finalPlace)||6)));
    const medal=MEDALS.has(String(trophy))?String(trophy):null;
    const division=core?.division?.(divisionId)?.id||String(divisionId||'rookie');
    const before=e.unlockedDivision;
    if(mode==='division'){
      if(medal)e.divisionTrophies[division]=betterMedal(e.divisionTrophies[division],medal)||medal;
      if(place<=3){
        if(division==='rookie')e.typeCupsUnlocked=true;
        const next=core?.nextDivision?.(division);
        if(next&&divRank(next.id)>divRank(e.unlockedDivision))e.unlockedDivision=next.id;
      }
    }else if(mode==='type'&&type){
      const t=String(type).toLowerCase();e.typeTrophies[t]={...(e.typeTrophies[t]||{})};
      if(medal)e.typeTrophies[t][division]=betterMedal(e.typeTrophies[t][division],medal)||medal;
    }
    return {unlockedDivision:e.unlockedDivision,divisionUnlocked:e.unlockedDivision!==before?e.unlockedDivision:null,typeCupsUnlocked:e.typeCupsUnlocked,trophy:medal};
  }

  return Object.freeze({DEFAULT_EVENT_STATE,defaultGoldenrodState,normalizeGoldenrodState,migrateLegacyDash,applyCupProgress,trophyRank});
});
