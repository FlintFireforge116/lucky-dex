(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexGoldenrodCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const DIVISIONS=Object.freeze([
    Object.freeze({id:'rookie',label:'ROOKIE',maxStat:59,index:0}),
    Object.freeze({id:'poke',label:'POKÉ',maxStat:89,index:1}),
    Object.freeze({id:'great',label:'GREAT',maxStat:119,index:2}),
    Object.freeze({id:'ultra',label:'ULTRA',maxStat:149,index:3}),
    Object.freeze({id:'master',label:'MASTER',maxStat:null,index:4})
  ]);
  const POINTS_BY_PLACE=Object.freeze({1:10,2:6,3:4,4:3,5:2,6:1});
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));

  function division(id){return DIVISIONS.find(d=>d.id===String(id||'').toLowerCase())||DIVISIONS[0];}
  function nextDivision(id){const d=division(id);return DIVISIONS[d.index+1]||null;}
  function isStatEligible(baseStat,divisionId){const d=division(divisionId);const n=Number(baseStat);return Number.isFinite(n)&&(d.maxStat==null||n<=d.maxStat);}
  function pointsForPlace(place){return POINTS_BY_PLACE[Math.trunc(Number(place)||0)]||0;}
  function trophyForPlace(place){return ({1:'gold',2:'silver',3:'bronze'})[Math.trunc(Number(place)||0)]||null;}

  function hashSeed(seed){
    if(Number.isFinite(Number(seed)))return (Number(seed)>>>0)||0x6d2b79f5;
    const s=String(seed??'goldenrod');let h=2166136261;
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return h>>>0||0x6d2b79f5;
  }
  function createSeededRng(seed){
    let a=hashSeed(seed);
    return function(){
      a|=0;a=(a+0x6D2B79F5)|0;
      let t=Math.imul(a^(a>>>15),1|a);
      t=(t+Math.imul(t^(t>>>7),61|t))^t;
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }

  function compressedStat(baseStat,{min=20,max=180,floor=.55,ceiling=1}={}){
    const lo=Number(min),hi=Math.max(lo+1,Number(max)),a=Number(floor),b=Math.max(a,Number(ceiling));
    const t=clamp((Number(baseStat)-lo)/(hi-lo),0,1);
    return a+(b-a)*Math.sqrt(t);
  }

  function normalizeEntrant(value,index,isPlayer=false){
    const id=String(value?.id??value?.key??(isPlayer?'player':`entrant-${index}`));
    return {...(value||{}),id,seedOrder:index,isPlayer:!!isPlayer,points:0,aggregateMetric:0,places:[],roundMetrics:[]};
  }

  function createCup({eventId,mode='division',divisionId='rookie',type=null,player,entrants=[],seed=Date.now(),metricDirection='higher'}={}){
    const all=[normalizeEntrant(player||{id:'player',name:'YOU'},0,true),...entrants.slice(0,5).map((e,i)=>normalizeEntrant(e,i+1,false))];
    return {
      id:`${String(eventId||'event')}-${hashSeed(seed).toString(36)}`,
      eventId:String(eventId||''),mode:String(mode||'division'),divisionId:division(divisionId).id,type:type?String(type).toLowerCase():null,
      seed:hashSeed(seed),metricDirection:metricDirection==='lower'?'lower':'higher',entrants:all,rounds:[],rareReceipts:[],
      abandoned:false,completed:false,completionValue:undefined
    };
  }

  function recordRound(cup,{roundId,results=[],rareReceipts=[]}={}){
    if(!cup||cup.abandoned)return {accepted:false,reason:'abandoned'};
    const rid=String(roundId??`round-${cup.rounds.length+1}`);
    if(cup.rounds.length>=3)return {accepted:false,reason:'complete'};
    if(cup.rounds.some(r=>r.roundId===rid))return {accepted:false,reason:'duplicate'};
    const byId=new Map(cup.entrants.map(e=>[e.id,e]));
    const normalized=[];
    for(let i=0;i<results.length;i++){
      const input=results[i]||{};const entrant=byId.get(String(input.id));if(!entrant)continue;
      const place=Math.max(1,Math.min(6,Math.trunc(Number(input.place)||i+1)));
      const metric=Number(input.metric);const cleanMetric=Number.isFinite(metric)?metric:0;
      entrant.points+=pointsForPlace(place);
      entrant.aggregateMetric+=cleanMetric;
      entrant.places.push(place);entrant.roundMetrics.push(cleanMetric);
      normalized.push({id:entrant.id,place,metric:cleanMetric,points:pointsForPlace(place)});
    }
    const receipts=Array.isArray(rareReceipts)?rareReceipts.filter(Boolean).map(r=>({...r})):[];
    cup.rareReceipts.push(...receipts);
    cup.rounds.push({roundId:rid,results:normalized,rareReceipts:receipts});
    return {accepted:true,round:cup.rounds[cup.rounds.length-1],standings:standings(cup)};
  }

  function standings(cup){
    if(!cup)return [];
    const dir=cup.metricDirection==='lower'?-1:1;
    return cup.entrants.map(e=>({...e,bestPlace:e.places.length?Math.min(...e.places):99})).sort((a,b)=>{
      if(b.points!==a.points)return b.points-a.points;
      if(a.aggregateMetric!==b.aggregateMetric)return dir===1?b.aggregateMetric-a.aggregateMetric:a.aggregateMetric-b.aggregateMetric;
      if(a.bestPlace!==b.bestPlace)return a.bestPlace-b.bestPlace;
      return a.seedOrder-b.seedOrder;
    }).map((e,i)=>({...e,place:i+1}));
  }

  function completeCupOnce(cup,fn){
    if(!cup||cup.abandoned)return null;
    if(cup.completed)return cup.completionValue;
    cup.completed=true;
    cup.completionValue=typeof fn==='function'?fn(cup):true;
    return cup.completionValue;
  }
  function abandonCup(cup){if(cup&&!cup.completed)cup.abandoned=true;return cup;}

  return Object.freeze({DIVISIONS,POINTS_BY_PLACE,division,nextDivision,isStatEligible,pointsForPlace,trophyForPlace,createSeededRng,compressedStat,createCup,recordRound,standings,completeCupOnce,abandonCup});
});
