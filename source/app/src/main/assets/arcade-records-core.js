(function(root){
  'use strict';
  const VERSION=1, HISTORY_LIMIT=10, STR_LIMIT=120;
  const caps={scoreboard:8,stats:12,pbs:8,rewards:8,achievements:8};
  function s(v,max=STR_LIMIT){return String(v==null?'':v).slice(0,max);}
  function n(v,fallback=0){const x=Number(v);return Number.isFinite(x)?x:fallback;}
  function bool(v){return !!v;}
  function rows(input,limit,map){return (Array.isArray(input)?input:[]).slice(0,limit).map(map).filter(Boolean);}
  function scoreboardRow(r){if(!r||typeof r!=='object')return null;return {rank:s(r.rank),label:s(r.label||r.name),value:s(r.value),subtitle:s(r.subtitle),player:bool(r.player),kind:s(r.kind)};}
  function statRow(r){if(!r||typeof r!=='object')return null;return {label:s(r.label||r.title),value:s(r.value??r.subtitle)};}
  function pbRow(r){if(!r||typeof r!=='object')return null;return {label:s(r.label||r.title),value:s(r.value??r.subtitle),isNew:bool(r.isNew)};}
  function rewardRow(r){if(!r||typeof r!=='object')return null;return {label:s(r.label||r.title),value:s(r.value??r.subtitle)};}
  function achievementRow(r){if(!r||typeof r!=='object'||!s(r.id))return null;return {id:s(r.id),name:s(r.name),icon:s(r.icon,40),desc:s(r.desc),hidden:bool(r.hidden)};}
  function normalizeReview(gameId,input){
    const r=input&&typeof input==='object'?input:{};
    return {
      gameId:s(gameId||r.gameId,60),title:s(r.title||'GAME REVIEW'),mode:s(r.mode),difficulty:s(r.difficulty),metricLabel:s(r.metricLabel||'SCORE'),metricValue:s(r.metricValue??''),primaryMetric:s(r.primaryMetric??r.metricValue??''),
      scoreboard:rows(r.scoreboard,caps.scoreboard,scoreboardRow),stats:rows(r.stats,(gameId||r.gameId)==='pokemonSeek'?24:caps.stats,statRow),pbs:rows(r.pbs,caps.pbs,pbRow),rewards:rows(r.rewards,caps.rewards,rewardRow),achievements:rows(r.achievements,caps.achievements,achievementRow),readOnly:bool(r.readOnly)
    };
  }
  function normalizeHistoryEntry(gameId,entry){
    if(!entry||typeof entry!=='object')return null;
    const entryId=s(entry.entryId); if(!entryId)return null;
    const review=normalizeReview(gameId,entry);
    return {...review,entryId,completedAt:Math.max(0,n(entry.completedAt,0)),readOnly:true};
  }
  function historyEntryFromReview(review,{completedAt=Date.now(),entryId}={}){
    const id=s(entryId); if(!id)return null;
    const r=normalizeReview(review?.gameId,review);
    return {...r,entryId:id,completedAt:Math.max(0,n(completedAt,Date.now())),readOnly:true};
  }
  function normalizeStore(store){
    const src=store&&typeof store==='object'?store:{}; const games={};
    const srcGames=src.games&&typeof src.games==='object'?src.games:{};
    for(const [gameId,value] of Object.entries(srcGames)){
      const recent=(Array.isArray(value?.recent)?value.recent:[]).map(e=>normalizeHistoryEntry(gameId,e)).filter(Boolean).sort((a,b)=>b.completedAt-a.completedAt).slice(0,HISTORY_LIMIT);
      games[s(gameId,60)]={...(value&&typeof value==='object'?value:{}),recent};
    }
    return {version:VERSION,games};
  }
  function appendHistory(store,gameId,entry,limit=HISTORY_LIMIT){
    const safe=normalizeStore(store), e=normalizeHistoryEntry(gameId,entry); if(!e)return {store:safe,appended:false};
    const key=s(gameId,60), existing=safe.games[key]?.recent||[];
    if(existing.some(x=>x.entryId===e.entryId))return {store:safe,appended:false};
    safe.games[key]={...(safe.games[key]||{}),recent:[e,...existing].sort((a,b)=>b.completedAt-a.completedAt).slice(0,Math.max(1,Math.min(HISTORY_LIMIT,Number(limit)||HISTORY_LIMIT)))};
    return {store:safe,appended:true};
  }
  function reviewFromHistory(gameId,entry){const e=normalizeHistoryEntry(gameId,entry);return e?normalizeReview(gameId,{...e,readOnly:true}):null;}
  function trophyRank(value){return ({bronze:1,silver:2,gold:3})[String(value||'').toLowerCase()]||0;}
  function updateTournamentRecord(store,gameId,{mode='division',divisionId='rookie',type=null,playerStanding={},metricDirection='higher',trophy=null}={}){
    const safe=normalizeStore(store),key=s(gameId,60);
    const bucket={...(safe.games[key]||{})},tournament={...(bucket.tournament&&typeof bucket.tournament==='object'?bucket.tournament:{})};
    tournament.divisions={...(tournament.divisions&&typeof tournament.divisions==='object'?tournament.divisions:{})};
    tournament.types={...(tournament.types&&typeof tournament.types==='object'?tournament.types:{})};
    const division=s(divisionId,30)||'rookie',place=Math.max(1,Math.min(6,Math.trunc(n(playerStanding?.place,6)))),points=Math.max(0,n(playerStanding?.points,0)),metric=n(playerStanding?.aggregateMetric,0);
    if(mode==='division'){
      const prior=tournament.divisions[division]&&typeof tournament.divisions[division]==='object'?tournament.divisions[division]:{};
      const priorMetric=Number(prior.bestAggregateMetric),hasMetric=Number.isFinite(priorMetric);
      tournament.divisions[division]={
        bestPlace:Math.min(Number.isFinite(Number(prior.bestPlace))?Number(prior.bestPlace):6,place),
        bestPoints:Math.max(Number(prior.bestPoints)||0,points),
        bestAggregateMetric:!hasMetric?metric:(metricDirection==='lower'?Math.min(priorMetric,metric):Math.max(priorMetric,metric))
      };
    }else if(mode==='type'&&type){
      const typeKey=s(type,30).toLowerCase();
      tournament.types[typeKey]={...(tournament.types[typeKey]&&typeof tournament.types[typeKey]==='object'?tournament.types[typeKey]:{})};
      const prior=tournament.types[typeKey][division],medal=String(trophy||'').toLowerCase();
      if(trophyRank(medal)>trophyRank(prior))tournament.types[typeKey][division]=medal;
    }
    bucket.tournament=tournament;safe.games[key]=bucket;return safe;
  }
  function newAchievements(beforeIds,afterRows){const before=new Set((Array.isArray(beforeIds)?beforeIds:[]).map(x=>s(x)));return rows(afterRows,caps.achievements,achievementRow).filter(r=>!before.has(r.id));}
  const api={VERSION,HISTORY_LIMIT,normalizeReview,historyEntryFromReview,normalizeHistoryEntry,appendHistory,reviewFromHistory,updateTournamentRecord,newAchievements};
  root.LuckyDexArcadeRecordsCore=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
