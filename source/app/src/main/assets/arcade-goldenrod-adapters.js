(function(root,factory){
  const core=root.LuckyDexGoldenrodCore||(typeof require==='function'?require('./arcade-goldenrod-core.js'):null);
  const api=factory(root,core);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexGoldenrodAdapters=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  const EVENT_IDS=Object.freeze(['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition']);
  const AI_QUALITY=Object.freeze({rookie:.38,poke:.52,great:.66,ultra:.80,master:.90});
  const TARGET_RANGE_AI=Object.freeze({
    rookie:Object.freeze({base:25,span:90,roundBonus:4}),
    poke:Object.freeze({base:35,span:95,roundBonus:5}),
    great:Object.freeze({base:45,span:110,roundBonus:6}),
    ultra:Object.freeze({base:55,span:125,roundBonus:7}),
    master:Object.freeze({base:65,span:140,roundBonus:8})
  });
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const statCurve=root.LuckyDexGoldenrodStatCurve||globalThis.LuckyDexGoldenrodStatCurve||(typeof require==='function'?require('./arcade-goldenrod-stat-curve.js'):null);
  function statPerformance(baseStat,eventId){
    if(eventId==='impactTrial'){const value=impactCore()?.defensePerformance?.(baseStat);if(Number.isFinite(Number(value)))return Number(value);}
    if(eventId==='elementalGauntlet'){const value=elementalCore()?.spDefPerformance?.(baseStat);if(Number.isFinite(Number(value)))return Number(value);}
    if(eventId==='enduranceExpedition'){const value=enduranceCore()?.hpPerformance?.(baseStat);if(Number.isFinite(Number(value)))return Number(value);}
    const f=statCurve?.factor?statCurve.factor(baseStat):1,n=clamp((f-.65)/.63,0,1);return .52+n*.48;
  }
  const title=s=>String(s||'').replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()).trim();
  const hashString=s=>{let h=2166136261;for(const ch of String(s??'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
  function divisionAiQuality(id){return AI_QUALITY[core?.division?.(id)?.id||id]??AI_QUALITY.rookie;}
  function platform(){return root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform||null;}
  function speciesData(){return root.LuckyDexAdventureSpecies||globalThis.LuckyDexAdventureSpecies||{};}
  function dashConfig(){return root.LuckyDexDashConfig||globalThis.LuckyDexDashConfig||(typeof require==='function'?require('./arcade-dash-config.js'):null);}
  function powerCore(){return root.LuckyDexPowerTrialCore||globalThis.LuckyDexPowerTrialCore||(typeof require==='function'?require('./arcade-power-trial-core.js'):null);}
  function impactCore(){return root.LuckyDexImpactTrialCore||globalThis.LuckyDexImpactTrialCore||(typeof require==='function'?require('./arcade-impact-trial-core.js'):null);}
  function targetCore(){return root.LuckyDexTargetRangeCore||globalThis.LuckyDexTargetRangeCore||(typeof require==='function'?require('./arcade-target-range-core.js'):null);}
  function elementalCore(){return root.LuckyDexElementalGauntletCore||globalThis.LuckyDexElementalGauntletCore||(typeof require==='function'?require('./arcade-elemental-gauntlet-core.js'):null);}
  function enduranceCore(){return root.LuckyDexEnduranceExpeditionCore||globalThis.LuckyDexEnduranceExpeditionCore||(typeof require==='function'?require('./arcade-endurance-expedition-core.js'):null);}
  function specialStats(){return root.LuckyDexArcadeSpecialStats||globalThis.LuckyDexArcadeSpecialStats||(typeof require==='function'?require('./arcade-special-stats.js'):null);}

  function normalizeParticipant(row,statKey){
    if(!row)return null;
    const baseStat=Number(row.baseStat??(statKey==='speed'?row.baseSpeed:undefined));
    return {...row,key:String(row.key??`species:${row.id}`),baseStat:Number.isFinite(baseStat)?baseStat:60,statKey,types:Array.isArray(row.types)?row.types.map(t=>String(t).toLowerCase()):[]};
  }
  function caughtParticipants(statKey){
    const p=platform();
    if(statKey==='speed')return (p?.dashRacers?.()||[]).map(r=>normalizeParticipant(r,statKey)).filter(Boolean);
    if(statKey==='spAtk')return (p?.challengeParticipants?.('attack')||[]).map(r=>normalizeParticipant({...r,baseStat:specialStats()?.spAtk?.(r.id)||60},statKey)).filter(Boolean);
    if(statKey==='spDef')return (p?.challengeParticipants?.('defense')||[]).map(r=>normalizeParticipant({...r,baseStat:specialStats()?.spDef?.(r.id)||60},statKey)).filter(Boolean);
    return (p?.challengeParticipants?.(statKey)||[]).map(r=>normalizeParticipant(r,statKey)).filter(Boolean);
  }
  function speciesCandidates(statKey){
    const data=speciesData(),byId=data.byId||{},neutral=Number(data.fallback?.baseStats?.[statKey])||60,out=[];
    const seen=new Set();
    for(const value of Object.values(byId)){
      const id=Number(value?.id);if(!Number.isFinite(id)||id<=0||seen.has(id))continue;seen.add(id);
      const special=statKey==='spAtk'?Number(specialStats()?.spAtk?.(id)):statKey==='spDef'?Number(specialStats()?.spDef?.(id)):NaN,n=Number(value?.baseStats?.[statKey]),baseStat=Number.isFinite(special)&&special>0?special:(Number.isFinite(n)&&n>0?n:neutral);
      out.push({key:`species:${id}`,id,name:String(value?.name||`Pokémon ${id}`),shiny:false,baseStat,statKey,types:Array.isArray(value?.types)?value.types.map(t=>String(t).toLowerCase()):[],image:`arcade/sprites/actors/pokemon/${id}.png`});
    }
    return out;
  }
  function eligibilityFor(statKey,participant,{mode='division',divisionId='rookie',type=null}={}){
    if(String(mode)==='exhibition')return {eligible:true,reason:'eligible'};
    const p=normalizeParticipant(participant,statKey);
    if(type&&!p.types.includes(String(type).toLowerCase()))return {eligible:false,reason:'wrong-type'};
    if(!core.isStatEligible(p.baseStat,divisionId))return {eligible:false,reason:'over-cap'};
    return {eligible:true,reason:'eligible'};
  }
  function selectAiFor(statKey,{divisionId='rookie',type=null,player=null,seed=1,count=5}={}){
    const playerId=Number(player?.id),playerKey=String(player?.key??'');
    const legal=speciesCandidates(statKey).filter(row=>{
      if((Number.isFinite(playerId)&&row.id===playerId)||row.key===playerKey)return false;
      if(type&&!row.types.includes(String(type).toLowerCase()))return false;
      return core.isStatEligible(row.baseStat,divisionId);
    });
    const rng=core.createSeededRng((Number(seed)||1)^hashString(`${statKey}:${type||'all'}:${divisionId}`));
    for(let i=legal.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[legal[i],legal[j]]=[legal[j],legal[i]];}
    return legal.slice(0,Math.max(0,Math.trunc(Number(count)||5)));
  }
  function createAiProfileFor({entrant,divisionId='rookie',seed=1}={}){
    const q=divisionAiQuality(divisionId),rng=core.createSeededRng((Number(seed)||1)^hashString(entrant?.key??entrant?.id));
    return {
      consistency:clamp(q*.82+.12+(rng()-.5)*.10,.25,.98),
      risk:clamp(.22+rng()*.56,.15,.82),
      mistake:clamp(.34-q*.31+rng()*.045,.025,.34),
      peak:clamp(q+.06+rng()*.12,.35,.99),
      variance:clamp(.17-q*.08+rng()*.035,.055,.18),
      seed:(Number(seed)||1)>>>0
    };
  }
  function simulateFor(statKey,eventId,{entrant,profile,divisionId='rookie',roundIndex=0,seed=1}={}){
    const p=profile||createAiProfileFor({entrant,divisionId,seed}),q=divisionAiQuality(divisionId),rng=core.createSeededRng((Number(seed)||1)^hashString(`${entrant?.key??entrant?.id}:${roundIndex}:${eventId}`));
    const stat=statPerformance(Number(entrant?.baseStat)||60,eventId),noise=(rng()-.5)*2*p.variance;
    const mistakeRoll=rng(),peakRoll=rng();
    let perf=stat*.50+q*.24+p.consistency*.18+p.peak*.08+noise;
    if(mistakeRoll<p.mistake)perf-=.10+.13*p.risk*rng();
    else if(peakRoll<p.risk*.35)perf+=.04+.07*p.peak*rng();
    perf=clamp(perf,.18,.995);
    let metric;
    if(eventId==='dash')metric=Math.round(56000-perf*23000+roundIndex*110);
    else if(eventId==='powerTrial')metric=Math.round((42+perf*100)*10)/10;
    else if(eventId==='impactTrial')metric=Math.round((38+perf*105)*10)/10;
    else if(eventId==='elementalGauntlet')metric=Math.round((430+perf*690+roundIndex*25)*10)/10;
    else if(eventId==='enduranceExpedition')metric=Math.round((1850+perf*2250+roundIndex*90)*10)/10;
    else {
      const band=TARGET_RANGE_AI[core?.division?.(divisionId)?.id||divisionId]||TARGET_RANGE_AI.rookie;
      metric=Math.round((band.base+perf*band.span+Math.max(0,Number(roundIndex)||0)*band.roundBonus)*10)/10;
    }
    return {id:String(entrant?.key??entrant?.id),key:String(entrant?.key??entrant?.id),metric,performance:perf};
  }
  function formatTime(ms){const n=Math.max(0,Number(ms)||0);return `${(n/1000).toFixed(2)}s`;}

  function buildAdapter({id,name,statKey,metricDirection}){
    return Object.freeze({
      id,name,statKey,metricDirection,
      participants:()=>caughtParticipants(statKey),
      eligibility:(participant,options)=>eligibilityFor(statKey,participant,options),
      selectAi:options=>selectAiFor(statKey,options),
      createAiProfile:options=>createAiProfileFor(options),
      simulateAiRound:options=>simulateFor(statKey,id,options),
      attackTypes:participant=>Array.from(new Set((participant?.types||[]).map(t=>String(t).toLowerCase()).filter(t=>targetCore()?.ATTACKS?.[t]))),
      attackName:type=>targetCore()?.ATTACKS?.[String(type||'').toLowerCase()]||title(type),
      roundConfig({divisionId='rookie',roundIndex=0,type=null,seed=1}={}){
        const base={divisionId:core.division(divisionId).id,roundIndex:Number(roundIndex)||0,type:type?String(type).toLowerCase():null,seed};
        if(id==='dash')return {...base,theme:dashConfig()?.themeFor?.(type||'normal')||null,themeKey:type||'normal'};
        const c=id==='powerTrial'?powerCore():id==='impactTrial'?impactCore():id==='elementalGauntlet'?elementalCore():id==='enduranceExpedition'?enduranceCore():targetCore();
        return {...base,profile:c?.divisionProfile?.(divisionId,roundIndex)||null,themeKey:type||'normal'};
      },
      playerMetric(result){
        if(Number.isFinite(Number(result?.metric)))return Number(result.metric);
        if(id==='dash')return Number(result?.timeMs??result?.raw?.timeMs)||0;
        if(id==='powerTrial')return Number(result?.score??result?.raw?.score)||0;
        if(id==='impactTrial')return Number(result?.score??result?.raw?.score??result?.bestHardenPct)||0;
        return Number(result?.score??result?.raw?.score)||0;
      },
      formatMetric(metric){return id==='dash'?formatTime(metric):String(Math.round((Number(metric)||0)*10)/10);},
      themeKey({mode='division',type=null}={}){return mode==='type'&&type?String(type).toLowerCase():'normal';}
    });
  }

  const ADAPTERS=Object.freeze({
    dash:buildAdapter({id:'dash',name:'Pokémon Dash',statKey:'speed',metricDirection:'lower'}),
    powerTrial:buildAdapter({id:'powerTrial',name:'Power Trial',statKey:'attack',metricDirection:'higher'}),
    impactTrial:buildAdapter({id:'impactTrial',name:'Impact Trial',statKey:'defense',metricDirection:'higher'}),
    targetRange:buildAdapter({id:'targetRange',name:'Target Range',statKey:'spAtk',metricDirection:'higher'}),
    elementalGauntlet:buildAdapter({id:'elementalGauntlet',name:'Elemental Gauntlet',statKey:'spDef',metricDirection:'higher'}),
    enduranceExpedition:buildAdapter({id:'enduranceExpedition',name:'Endurance Expedition',statKey:'hp',metricDirection:'higher'})
  });
  function get(eventId){return ADAPTERS[String(eventId)]||null;}
  return Object.freeze({EVENT_IDS,get,divisionAiQuality});
});
