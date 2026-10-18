(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexEkansHoopCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const sockets=[];
  for(let depth=0;depth<3;depth++)for(let lane=0;lane<3;lane++)sockets.push({index:depth*3+lane,lane,depth});

  const TARGET_TYPES=Object.freeze({
    diglett:Object.freeze({kind:'diglett',speciesId:50,shiny:false,points:1,lifetimeMinMs:2400,lifetimeMaxMs:3600}),
    dugtrio:Object.freeze({kind:'dugtrio',speciesId:51,shiny:false,points:3,lifetimeMinMs:1400,lifetimeMaxMs:2200}),
    shinyDiglett:Object.freeze({kind:'shinyDiglett',speciesId:50,shiny:true,points:5,lifetimeMinMs:2000,lifetimeMaxMs:3000}),
    shinyDugtrio:Object.freeze({kind:'shinyDugtrio',speciesId:51,shiny:true,points:10,lifetimeMinMs:1200,lifetimeMaxMs:1800})
  });

  const CONFIG=Object.freeze({
    durationMs:60000,
    sockets:Object.freeze(sockets.map(s=>Object.freeze({...s}))),
    maxActiveTargets:3,
    hitTolerance:Object.freeze({diglett:0.58,dugtrio:0.72,shinyDiglett:0.58,shinyDugtrio:0.72}),
    targetValues:Object.freeze({diglett:1,dugtrio:3,shinyDiglett:5,shinyDugtrio:10}),
    targetLifetimeMs:Object.freeze({
      diglett:Object.freeze({min:TARGET_TYPES.diglett.lifetimeMinMs,max:TARGET_TYPES.diglett.lifetimeMaxMs}),
      dugtrio:Object.freeze({min:TARGET_TYPES.dugtrio.lifetimeMinMs,max:TARGET_TYPES.dugtrio.lifetimeMaxMs}),
      shinyDiglett:Object.freeze({min:TARGET_TYPES.shinyDiglett.lifetimeMinMs,max:TARGET_TYPES.shinyDiglett.lifetimeMaxMs}),
      shinyDugtrio:Object.freeze({min:TARGET_TYPES.shinyDugtrio.lifetimeMinMs,max:TARGET_TYPES.shinyDugtrio.lifetimeMaxMs})
    })
  });

  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',durationMs:75000,targetLifetimeScale:1.35,thresholds:Object.freeze([15,28,45,65])}),
    normal:Object.freeze({key:'normal',label:'Normal',durationMs:60000,targetLifetimeScale:1,thresholds:Object.freeze([20,35,55,80])}),
    hard:Object.freeze({key:'hard',label:'Hard',durationMs:50000,targetLifetimeScale:0.72,thresholds:Object.freeze([24,42,65,95])})
  });

  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}

  const rand=rng=>Math.max(0,Math.min(0.999999,Number((rng||Math.random)())||0));
  const between=(rng,min,max)=>min+rand(rng)*(max-min);

  function targetTypeForRoll(speciesRoll,shinyRoll=1){
    const species=Math.max(0,Math.min(0.999999,Number(speciesRoll)||0));
    const shiny=Math.max(0,Math.min(0.999999,Number(shinyRoll)||0));
    const isDugtrio=species>=0.80;
    const isShiny=shiny<0.01;
    if(isDugtrio)return isShiny?TARGET_TYPES.shinyDugtrio:TARGET_TYPES.dugtrio;
    return isShiny?TARGET_TYPES.shinyDiglett:TARGET_TYPES.diglett;
  }

  function streakMultiplier(streak){
    const n=Math.max(0,Math.trunc(Number(streak)||0));
    if(n>=12)return 2;
    if(n>=8)return 1.5;
    if(n>=4)return 1.25;
    return 1;
  }

  function rewardTier(score,difficulty='normal'){
    const n=Math.max(0,Math.round(Number(score)||0));
    const [bronze,silver,gold,master]=difficultyProfile(difficulty).thresholds;
    if(n>=master)return {tier:'Master',coins:250,nextAt:null};
    if(n>=gold)return {tier:'Gold',coins:160,nextAt:master};
    if(n>=silver)return {tier:'Silver',coins:100,nextAt:gold};
    if(n>=bronze)return {tier:'Bronze',coins:60,nextAt:silver};
    return {tier:'Participation',coins:30,nextAt:bronze};
  }

  function createRound(){
    return {score:0,streak:0,bestStreak:0,totalHoops:0,shinyHits:0,misses:0,targets:[],nextToken:1,lastSpawnSocket:null,lastSpawnAt:0,startedAt:null,endsAt:null};
  }

  function availableSockets(round){
    const used=new Set(round.targets.map(t=>t.socketIndex));
    return CONFIG.sockets.filter(s=>!used.has(s.index));
  }

  function spawnTarget(round,rng,nowMs=0,{lifetimeScale=1}={}){
    if(!round||!Array.isArray(round.targets))throw new TypeError('round required');
    if(round.targets.length>=CONFIG.maxActiveTargets)return null;
    let choices=availableSockets(round);
    if(!choices.length)return null;
    if(choices.length>1&&round.lastSpawnSocket!==null){
      const filtered=choices.filter(s=>s.index!==round.lastSpawnSocket);
      if(filtered.length)choices=filtered;
    }
    const socket=choices[Math.floor(rand(rng)*choices.length)];
    const type=targetTypeForRoll(rand(rng),rand(rng));
    const scale=Math.max(0.25,Math.min(3,Number(lifetimeScale)||1));
    const lifetime=Math.round(between(rng,type.lifetimeMinMs,type.lifetimeMaxMs)*scale);
    const spawnedAt=Number(nowMs)||0;
    const target={
      socketIndex:socket.index,lane:socket.lane,depth:socket.depth,token:round.nextToken++,
      kind:type.kind,speciesId:type.speciesId,shiny:type.shiny,points:type.points,
      spawnedAt,expiresAt:spawnedAt+lifetime
    };
    round.targets.push(target);
    round.lastSpawnSocket=socket.index;
    round.lastSpawnAt=spawnedAt;
    return target;
  }

  function expireTargets(round,nowMs){
    const now=Number(nowMs)||0;
    const expired=round.targets.filter(t=>t.expiresAt<=now);
    if(expired.length)round.targets=round.targets.filter(t=>t.expiresAt>now);
    return expired;
  }

  function resolveThrow(round,throwSpec,nowMs){
    if(!round||!Array.isArray(round.targets))throw new TypeError('round required');
    const now=Number(nowMs)||0;
    const lane=Number(throwSpec?.lane);
    const depth=Number(throwSpec?.depth);
    const token=throwSpec?.targetToken;
    const candidates=round.targets.filter(t=>t.expiresAt>now&&(token===undefined||token===null||t.token===token));
    let best=null,bestDistance=Infinity;
    for(const t of candidates){
      const distance=Math.hypot(lane-t.lane,depth-t.depth);
      const tolerance=Number(CONFIG.hitTolerance[t.kind]||0.58);
      if(distance<=tolerance&&distance<bestDistance){bestDistance=distance;best=t;}
    }
    if(!best){
      round.streak=0;
      round.misses=Number(round.misses||0)+1;
      return {hit:false,basePoints:0,points:0,target:null,distance:bestDistance,streak:0,multiplier:1};
    }
    const idx=round.targets.findIndex(t=>t.token===best.token);
    if(idx<0){
      round.streak=0;
      round.misses=Number(round.misses||0)+1;
      return {hit:false,basePoints:0,points:0,target:null,distance:bestDistance,streak:0,multiplier:1};
    }
    round.targets.splice(idx,1);
    round.streak=Number(round.streak||0)+1;
    round.bestStreak=Math.max(Number(round.bestStreak||0),round.streak);
    round.totalHoops=Number(round.totalHoops||0)+1;
    if(best.shiny)round.shinyHits=Number(round.shinyHits||0)+1;
    const multiplier=streakMultiplier(round.streak);
    const points=Math.max(1,Math.round(Number(best.points||0)*multiplier));
    round.score=Number(round.score||0)+points;
    return {hit:true,basePoints:best.points,points,target:{...best},distance:bestDistance,streak:round.streak,multiplier};
  }

  return {CONFIG,TARGET_TYPES,DIFFICULTIES,difficultyProfile,targetTypeForRoll,streakMultiplier,rewardTier,createRound,spawnTarget,expireTargets,resolveThrow};
});
