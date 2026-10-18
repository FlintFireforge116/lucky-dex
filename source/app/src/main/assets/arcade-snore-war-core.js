(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexSnoreWarCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const TAU=Math.PI*2;
  const CONFIG={
    timingWindowMs:120,
    sleepCrossings:2,
    initialFullPeriodMs:2400,
    maxFullPeriodMs:720,
    rampToMaxMs:34000,
    maxCrossings:96,
    endlessMissLimit:3,
    endlessMaxFullPeriodMs:560,
    endlessRampExtraMs:30000,
    endlessMaxCrossings:2000
  };
  const DIFFICULTIES={
    easy:{label:'EASY',timingSpreadMs:165,errorChance:.24},
    normal:{label:'NORMAL',timingSpreadMs:110,errorChance:.13},
    hard:{label:'HARD',timingSpreadMs:68,errorChance:.065}
  };
  const REWARDS={easy:[85,58,36,20],normal:[110,75,48,26],hard:[140,95,62,35]};
  const OMEGA0=TAU/CONFIG.initialFullPeriodMs;
  const OMEGA_MATCH_MAX=TAU/CONFIG.maxFullPeriodMs;
  const ACCEL1=(OMEGA_MATCH_MAX-OMEGA0)/CONFIG.rampToMaxMs;
  const CAP1_PHASE=OMEGA0*CONFIG.rampToMaxMs+.5*ACCEL1*CONFIG.rampToMaxMs*CONFIG.rampToMaxMs;
  const OMEGA_ENDLESS_MAX=TAU/CONFIG.endlessMaxFullPeriodMs;
  const ACCEL2=(OMEGA_ENDLESS_MAX-OMEGA_MATCH_MAX)/CONFIG.endlessRampExtraMs;
  const CAP2_PHASE=CAP1_PHASE+OMEGA_MATCH_MAX*CONFIG.endlessRampExtraMs+.5*ACCEL2*CONFIG.endlessRampExtraMs*CONFIG.endlessRampExtraMs;
  const DROWZEE={dex:96,name:'Drowzee'};

  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function modeOf(raceOrMode){return (typeof raceOrMode==='string'?raceOrMode:raceOrMode?.mode)==='endless'?'endless':'match';}
  function phaseDeltaAtElapsed(ms,mode='match'){
    const t=Math.max(0,Number(ms)||0),kind=modeOf(mode);
    if(t<=CONFIG.rampToMaxMs)return OMEGA0*t+.5*ACCEL1*t*t;
    const after=t-CONFIG.rampToMaxMs;
    if(kind!=='endless')return CAP1_PHASE+OMEGA_MATCH_MAX*after;
    if(after<=CONFIG.endlessRampExtraMs)return CAP1_PHASE+OMEGA_MATCH_MAX*after+.5*ACCEL2*after*after;
    return CAP2_PHASE+OMEGA_ENDLESS_MAX*(after-CONFIG.endlessRampExtraMs);
  }
  function elapsedForPhaseDelta(delta,mode='match'){
    const d=Math.max(0,Number(delta)||0),kind=modeOf(mode);
    if(d<=CAP1_PHASE)return (-OMEGA0+Math.sqrt(OMEGA0*OMEGA0+2*ACCEL1*d))/ACCEL1;
    if(kind!=='endless')return CONFIG.rampToMaxMs+(d-CAP1_PHASE)/OMEGA_MATCH_MAX;
    if(d<=CAP2_PHASE){
      const q=d-CAP1_PHASE;
      return CONFIG.rampToMaxMs+(-OMEGA_MATCH_MAX+Math.sqrt(OMEGA_MATCH_MAX*OMEGA_MATCH_MAX+2*ACCEL2*q))/ACCEL2;
    }
    return CONFIG.rampToMaxMs+CONFIG.endlessRampExtraMs+(d-CAP2_PHASE)/OMEGA_ENDLESS_MAX;
  }
  function fullPeriodAtElapsed(ms,mode='match'){
    const t=Math.max(0,Number(ms)||0),kind=modeOf(mode);
    if(t>=CONFIG.rampToMaxMs+(kind==='endless'?CONFIG.endlessRampExtraMs:0))return kind==='endless'?CONFIG.endlessMaxFullPeriodMs:CONFIG.maxFullPeriodMs;
    const omega=t<=CONFIG.rampToMaxMs?OMEGA0+ACCEL1*t:OMEGA_MATCH_MAX+ACCEL2*(t-CONFIG.rampToMaxMs);
    return TAU/omega;
  }
  function fullPeriodAt(race,nowMs){
    if(!race)return CONFIG.initialFullPeriodMs;
    return fullPeriodAtElapsed(Math.max(0,Number(nowMs)-Number(race.startedAt||0)),race.mode);
  }
  function centerTimeForIndex(race,index){
    const i=Math.max(0,Math.floor(Number(index)||0));
    return Number(race?.startedAt||0)+elapsedForPhaseDelta(Math.PI/2+i*Math.PI,race?.mode);
  }
  function pendulumPosition(race,nowMs){
    if(!race)return -1;
    const elapsed=Math.max(0,Number(nowMs)-Number(race.startedAt||0));
    return clamp(Math.sin(-Math.PI/2+phaseDeltaAtElapsed(elapsed,race.mode)),-1,1);
  }
  function createRacer(id,label){return {id,label,species:{...DROWZEE},hits:0,misses:0,streak:0,bestStreak:0,attemptedCrossing:-1,sleepThroughCrossing:-1,lastSleepAt:null,lastHitAt:null,plannedCrossing:-1,plannedAt:null};}
  function isSleeping(racer,crossingIndex){return Number(racer?.sleepThroughCrossing??-1)>=Number(crossingIndex??0);}
  function planCpuAttempt(race,racer,index,rng){
    if(!racer||racer.id==='player'||isSleeping(racer,index)){racer.plannedCrossing=index;racer.plannedAt=null;return null;}
    const random=typeof rng==='function'?rng:Math.random,profile=difficultyProfile(race.difficulty),target=centerTimeForIndex(race,index);
    let offset;
    if(random()<profile.errorChance){const sign=random()<.5?-1:1;offset=sign*(CONFIG.timingWindowMs+45+random()*165);}
    else offset=(random()+random()-1)*profile.timingSpreadMs;
    racer.plannedCrossing=index;racer.plannedAt=target+offset;return racer.plannedAt;
  }
  function prepareCrossing(race,rng){
    race.targetAt=centerTimeForIndex(race,race.currentCrossing);
    for(const racer of race.racers.slice(1))planCpuAttempt(race,racer,race.currentCrossing,rng);
  }
  function createRace({difficulty='normal',mode='match',rng=Math.random,nowMs=0}={}){
    const key=DIFFICULTIES[difficulty]?difficulty:'normal',kind=modeOf(mode);
    const racers=[createRacer('player','YOU'),createRacer('cpu1','COM 1'),createRacer('cpu2','COM 2'),createRacer('cpu3','COM 3')];
    const race={difficulty:key,mode:kind,startedAt:Number(nowMs)||0,currentCrossing:0,targetAt:null,racers,player:racers[0],finalized:false,finalizedAt:null,winnerId:null};
    prepareCrossing(race,rng);return race;
  }
  function applyOutcome(race,racer,hit,nowMs,index=race.currentCrossing){
    if(!racer||race.finalized||racer.attemptedCrossing===index||isSleeping(racer,index))return false;
    racer.attemptedCrossing=index;
    if(hit){racer.hits++;racer.streak++;racer.bestStreak=Math.max(racer.bestStreak,racer.streak);racer.lastHitAt=Number(nowMs)||0;}
    else {racer.misses++;racer.streak=0;racer.sleepThroughCrossing=index+CONFIG.sleepCrossings-1;racer.lastSleepAt=Number(nowMs)||0;}
    return true;
  }
  function finalizeIfNeeded(race,nowMs){
    if(!race||race.finalized)return !!race?.finalized;
    if(race.mode==='endless'){
      if(Number(race.player?.misses||0)<CONFIG.endlessMissLimit)return false;
      race.finalized=true;race.finalizedAt=Number(nowMs)||0;race.winnerId=null;return true;
    }
    const awake=awakeRacers(race,race.currentCrossing);
    if(awake.length>1)return false;
    race.finalized=true;race.finalizedAt=Number(nowMs)||0;
    if(awake.length===1)race.winnerId=awake[0].id;
    else race.winnerId=rankRace(race)[0]?.id||'player';
    return true;
  }
  function pressPlayer(race,nowMs){
    if(!race||race.finalized)return {accepted:false,hit:false,sleeping:false};
    const index=race.currentCrossing,player=race.player;
    if(isSleeping(player,index)||player.attemptedCrossing===index)return {accepted:false,hit:false,sleeping:isSleeping(player,index)};
    const hit=Math.abs((Number(nowMs)||0)-race.targetAt)<=CONFIG.timingWindowMs;
    applyOutcome(race,player,hit,nowMs,index);
    if(race.mode==='endless'&&player.misses>=CONFIG.endlessMissLimit)finalizeIfNeeded(race,nowMs);
    return {accepted:true,hit,sleeping:isSleeping(player,index),crossing:index};
  }
  function awakeRacers(race,index=race.currentCrossing){return (race?.racers||[]).filter(r=>!isSleeping(r,index));}
  function crossingLimit(race){return race?.mode==='endless'?CONFIG.endlessMaxCrossings:CONFIG.maxCrossings;}
  function resolveExpiredCrossing(race,deadline,rng){
    const index=race.currentCrossing,target=race.targetAt;
    for(const racer of race.racers.slice(1)){
      if(racer.attemptedCrossing===index||isSleeping(racer,index))continue;
      if(racer.plannedCrossing!==index)planCpuAttempt(race,racer,index,rng);
      if(racer.plannedAt!=null&&racer.plannedAt<=deadline)applyOutcome(race,racer,Math.abs(racer.plannedAt-target)<=CONFIG.timingWindowMs,racer.plannedAt,index);
    }
    for(const racer of race.racers){if(racer.attemptedCrossing!==index&&!isSleeping(racer,index))applyOutcome(race,racer,false,deadline,index);}
    if(finalizeIfNeeded(race,deadline))return;
    race.currentCrossing++;
    if(race.currentCrossing>=crossingLimit(race)){race.finalized=true;race.finalizedAt=deadline;race.winnerId=race.mode==='endless'?null:(rankRace(race)[0]?.id||'player');return;}
    prepareCrossing(race,rng);
  }
  function advanceRace(race,nowMs,rng=Math.random){
    if(!race||race.finalized)return race;
    const now=Number(nowMs)||0,limit=crossingLimit(race);
    let safety=0;
    while(!race.finalized&&safety++<limit){
      const index=race.currentCrossing,target=race.targetAt,deadline=target+CONFIG.timingWindowMs;
      for(const racer of race.racers.slice(1)){
        if(racer.attemptedCrossing===index||isSleeping(racer,index))continue;
        if(racer.plannedCrossing!==index)planCpuAttempt(race,racer,index,rng);
        if(racer.plannedAt!=null&&racer.plannedAt<=now&&racer.plannedAt<=deadline)applyOutcome(race,racer,Math.abs(racer.plannedAt-target)<=CONFIG.timingWindowMs,racer.plannedAt,index);
      }
      if(now<=deadline)break;
      resolveExpiredCrossing(race,deadline,rng);
    }
    return race;
  }
  function accuracyFor(racer){const total=Number(racer?.hits||0)+Number(racer?.misses||0);return total?Number(racer.hits||0)/total:0;}
  function rankRace(race){
    const index=Number(race?.currentCrossing||0),finalRanking=!!race?.winnerId;
    return [...(race?.racers||[])].sort((a,b)=>{
      if(race?.winnerId){if(a.id===race.winnerId)return -1;if(b.id===race.winnerId)return 1;}
      const aa=isSleeping(a,index)?0:1,ba=isSleeping(b,index)?0:1;if(ba!==aa)return ba-aa;
      if(finalRanking){const as=Number(a.lastSleepAt??-1),bs=Number(b.lastSleepAt??-1);if(bs!==as)return bs-as;}
      if(b.hits!==a.hits)return b.hits-a.hits;if(a.misses!==b.misses)return a.misses-b.misses;
      if(b.bestStreak!==a.bestStreak)return b.bestStreak-a.bestStreak;
      return race.racers.indexOf(a)-race.racers.indexOf(b);
    });
  }
  function placeFor(race,id){const i=rankRace(race).findIndex(r=>r.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty){const rows=REWARDS[DIFFICULTIES[difficulty]?difficulty:'normal'];return rows[clamp(Math.round(Number(place)||4)-1,0,3)];}
  function endlessRewardFor(hits){return clamp(40+Math.floor(Math.max(0,Number(hits)||0)/10)*10,40,180);}
  function shiftRaceTimestamps(race,deltaMs){
    if(!race)return race;const d=Math.max(0,Number(deltaMs)||0);race.startedAt+=d;race.targetAt+=d;if(race.finalizedAt!=null)race.finalizedAt+=d;
    for(const r of race.racers){if(r.plannedAt!=null)r.plannedAt+=d;if(r.lastSleepAt!=null)r.lastSleepAt+=d;if(r.lastHitAt!=null)r.lastHitAt+=d;}return race;
  }
  return {CONFIG,DIFFICULTIES,REWARDS,difficultyProfile,createRace,centerTimeForIndex,pendulumPosition,fullPeriodAtElapsed,fullPeriodAt,isSleeping,awakeRacers,pressPlayer,advanceRace,finalizeIfNeeded,rankRace,placeFor,accuracyFor,rewardFor,endlessRewardFor,shiftRaceTimestamps};
});
