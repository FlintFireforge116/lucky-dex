(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexMagikarpSplashCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    roundMs:20000,
    quickEarlyMs:110,
    quickLateMs:90,
    scoreHoldMs:135,
    maxHoldMs:260,
    baseFlightMs:420,
    holdFlightGain:1.10,
    quickFlightScale:.84,
    groundedRecoveryMs:240,
    minHeight:.58,
    holdHeightGain:.0039
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',holdMinMs:115,holdMaxMs:205,holdMissChance:.17,quickChance:.12,hesitationMinMs:260,hesitationMaxMs:620,startDelayMinMs:90,startDelayMaxMs:260}),
    normal:Object.freeze({key:'normal',label:'Normal',holdMinMs:130,holdMaxMs:205,holdMissChance:.08,quickChance:.38,hesitationMinMs:130,hesitationMaxMs:340,startDelayMinMs:60,startDelayMaxMs:180}),
    hard:Object.freeze({key:'hard',label:'Hard',holdMinMs:145,holdMaxMs:210,holdMissChance:.025,quickChance:.60,hesitationMinMs:55,hesitationMaxMs:165,startDelayMinMs:35,startDelayMaxMs:120})
  });
  const REWARDS=Object.freeze({
    easy:Object.freeze([80,55,35,20]),
    normal:Object.freeze([100,70,45,25]),
    hard:Object.freeze([130,90,60,35])
  });

  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const clamp01=v=>Math.max(0,Math.min(.999999,n(v)));
  const rand=rng=>clamp01((rng||Math.random)());
  const between=(rng,a,b)=>a+rand(rng)*(b-a);
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function flightMsForHold(holdMs,quick=false){const normal=CONFIG.baseFlightMs+Math.min(CONFIG.maxHoldMs,Math.max(0,n(holdMs)))*CONFIG.holdFlightGain;return normal*(quick?CONFIG.quickFlightScale:1);}
  function heightForHold(holdMs){return CONFIG.minHeight+Math.min(CONFIG.maxHoldMs,Math.max(0,n(holdMs)))*CONFIG.holdHeightGain;}
  function createLane(id,index,kind){
    return {id,index,kind,score:0,quickChain:0,bestQuickChain:0,phase:'grounded',y:0,held:false,jumpStartedAt:null,releasedAt:null,expectedLandingAt:null,counterHitThisJump:false,lastImpactAt:null,lastQuickAt:null,landedAt:null,recoveryUntil:0,queuedQuickAt:null,queuedQuickHeld:false,queuedQuickReleaseAt:null,nextActionAt:null,cpuReleaseAt:null,cpuQuickSuccess:false,currentJumpQuick:false};
  }
  function effectiveHold(lane,nowMs){
    if(lane.jumpStartedAt==null)return 0;
    const end=lane.held?Math.min(n(nowMs),lane.jumpStartedAt+CONFIG.maxHoldMs):(lane.releasedAt??n(nowMs));
    return Math.max(0,Math.min(CONFIG.maxHoldMs,end-lane.jumpStartedAt));
  }
  function updateTrajectory(lane,nowMs){
    if(lane.phase!=='airborne'||lane.jumpStartedAt==null){lane.y=0;return;}
    const hold=effectiveHold(lane,nowMs),flight=flightMsForHold(hold,lane.currentJumpQuick);
    lane.expectedLandingAt=lane.jumpStartedAt+flight;
    const p=Math.max(0,Math.min(1,(n(nowMs)-lane.jumpStartedAt)/flight));
    lane.y=Math.max(0,4*p*(1-p)*heightForHold(hold));
  }
  function startJump(lane,at,{quick=false,held=true}={}){
    lane.phase='airborne';lane.y=0;lane.held=held;lane.jumpStartedAt=n(at);lane.releasedAt=held?null:n(at);lane.currentJumpQuick=!!quick;
    lane.expectedLandingAt=lane.jumpStartedAt+flightMsForHold(0,lane.currentJumpQuick);lane.counterHitThisJump=false;lane.landedAt=null;lane.recoveryUntil=0;
    lane.queuedQuickAt=null;lane.queuedQuickHeld=false;lane.queuedQuickReleaseAt=null;
    if(quick){lane.quickChain=n(lane.quickChain)+1;lane.bestQuickChain=Math.max(n(lane.bestQuickChain),lane.quickChain);lane.lastQuickAt=n(at);}
    else lane.quickChain=0;
  }
  function pressLane(round,lane,nowMs){
    const now=n(nowMs),cutoff=round?.cutoffAt??Infinity;
    if(!lane||now>=cutoff)return {accepted:false,quick:false,quickQueued:false};
    if(lane.phase==='grounded'){
      if(now<n(lane.recoveryUntil))return {accepted:false,quick:false,quickQueued:false};
      startJump(lane,now,{quick:false,held:true});return {accepted:true,quick:false,quickQueued:false};
    }
    if(lane.phase==='landing'){
      const delta=now-n(lane.landedAt);
      if(delta>=0&&delta<=CONFIG.quickLateMs){startJump(lane,now,{quick:true,held:true});return {accepted:true,quick:true,quickQueued:false};}
      return {accepted:false,quick:false,quickQueued:false};
    }
    if(lane.phase==='airborne'){
      if(lane.held||lane.queuedQuickAt!=null||lane.expectedLandingAt==null)return {accepted:false,quick:false,quickQueued:false};
      const delta=now-lane.expectedLandingAt;
      if(delta>=-CONFIG.quickEarlyMs&&delta<=0){lane.queuedQuickAt=now;lane.queuedQuickHeld=true;return {accepted:true,quick:false,quickQueued:true};}
    }
    return {accepted:false,quick:false,quickQueued:false};
  }
  function releaseLane(lane,nowMs){
    if(!lane)return false;
    const now=n(nowMs);
    if(lane.phase==='airborne'&&lane.queuedQuickAt!=null&&lane.queuedQuickHeld){lane.queuedQuickHeld=false;lane.queuedQuickReleaseAt=now;return true;}
    if(lane.phase==='airborne'&&lane.held){lane.held=false;lane.releasedAt=now;updateTrajectory(lane,now);return true;}
    return false;
  }
  function advanceLane(round,lane,nowMs){
    const now=n(nowMs);
    if(!lane)return;
    if(lane.phase==='airborne'){
      updateTrajectory(lane,now);
      const hold=effectiveHold(lane,now),flight=flightMsForHold(hold,lane.currentJumpQuick),hitAt=lane.jumpStartedAt+flight*.36;
      if(!lane.counterHitThisJump&&hold>=CONFIG.scoreHoldMs&&now>=hitAt){lane.counterHitThisJump=true;lane.score=n(lane.score)+1;lane.lastImpactAt=hitAt;}
      const landing=lane.expectedLandingAt;
      if(landing!=null&&now>=landing){
        if(lane.queuedQuickAt!=null){
          const keepHeld=lane.queuedQuickHeld;
          const releaseAt=lane.queuedQuickReleaseAt;
          startJump(lane,landing,{quick:true,held:keepHeld});
          if(!keepHeld){lane.releasedAt=landing;lane.held=false;lane.expectedLandingAt=landing+flightMsForHold(0,true);}
          if(releaseAt!=null&&releaseAt>landing&&lane.held)releaseLane(lane,releaseAt);
          updateTrajectory(lane,now);
        }else{
          lane.phase='landing';lane.y=0;lane.held=false;lane.landedAt=landing;lane.recoveryUntil=landing+CONFIG.groundedRecoveryMs;lane.expectedLandingAt=landing;
        }
      }
    }
    if(lane.phase==='landing'){
      lane.y=0;
      if(now>n(lane.landedAt)+CONFIG.quickLateMs)lane.quickChain=0;
      if(now>=n(lane.recoveryUntil)){lane.phase='grounded';lane.landedAt=null;lane.expectedLandingAt=null;}
    }
  }
  function createRound({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const start=n(nowMs),profile=difficultyProfile(difficulty);
    const racers=[createLane('player',0,'player'),createLane('cpu1',1,'cpu'),createLane('cpu2',2,'cpu'),createLane('cpu3',3,'cpu')];
    for(let i=1;i<racers.length;i++)racers[i].nextActionAt=start+Math.round(between(rng,profile.startDelayMinMs,profile.startDelayMaxMs));
    return {difficulty:profile.key,startedAt:start,cutoffAt:start+CONFIG.roundMs,racers,player:racers[0],finalized:false,finishedAt:null,ranking:null,rng};
  }
  function pressPlayer(round,nowMs){return pressLane(round,round?.player,nowMs);}
  function releasePlayer(round,nowMs){return releaseLane(round?.player,nowMs);}
  function rankRound(round){return (round?.racers||[]).slice().sort((a,b)=>n(b.score)-n(a.score)||a.index-b.index);}
  function placeFor(round,id){const lane=(round?.racers||[]).find(r=>r.id===id);if(!lane)return 4;return 1+(round.racers||[]).filter(r=>n(r.score)>n(lane.score)).length;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal;return row[Math.max(0,Math.min(3,Math.trunc(n(place)||1)-1))];}
  function cpuHold(profile,rng){
    if(rand(rng)<profile.holdMissChance)return Math.round(between(rng,45,CONFIG.scoreHoldMs-8));
    return Math.round(between(rng,Math.max(CONFIG.scoreHoldMs,profile.holdMinMs),profile.holdMaxMs));
  }
  function startCpuJump(round,lane,at,profile,rng,quick){
    startJump(lane,at,{quick:!!quick,held:true});
    const hold=cpuHold(profile,rng);
    lane.cpuReleaseAt=at+hold;
    lane.cpuQuickSuccess=rand(rng)<profile.quickChance;
  }
  function advanceCpu(round,lane,nowMs,rng){
    const now=n(nowMs),profile=difficultyProfile(round.difficulty);
    let guard=0;
    while(guard++<256){
      if(lane.phase==='grounded'){
        if(lane.nextActionAt==null)lane.nextActionAt=Math.max(round.startedAt,n(lane.recoveryUntil));
        if(lane.nextActionAt>now||lane.nextActionAt>=round.cutoffAt)break;
        const at=lane.nextActionAt;lane.nextActionAt=null;startCpuJump(round,lane,at,profile,rng,false);continue;
      }
      if(lane.phase==='airborne'){
        if(lane.held&&lane.cpuReleaseAt!=null&&lane.cpuReleaseAt<=now){const at=lane.cpuReleaseAt;lane.cpuReleaseAt=null;releaseLane(lane,at);continue;}
        updateTrajectory(lane,Math.min(now,lane.expectedLandingAt??now));
        const landing=lane.expectedLandingAt;
        if(landing==null||landing>now){advanceLane(round,lane,now);break;}
        const quick=lane.cpuQuickSuccess&&landing<round.cutoffAt;
        advanceLane(round,lane,landing);
        lane.cpuQuickSuccess=false;lane.cpuReleaseAt=null;
        if(quick&&lane.phase!=='airborne'){startCpuJump(round,lane,landing,profile,rng,true);continue;}
        if(lane.phase==='landing'){
          lane.quickChain=0;
          const ready=lane.recoveryUntil+Math.round(between(rng,profile.hesitationMinMs,profile.hesitationMaxMs));
          lane.phase='grounded';lane.landedAt=null;lane.expectedLandingAt=null;lane.nextActionAt=ready;
          continue;
        }
      }
      if(lane.phase==='landing'){
        const ready=n(lane.recoveryUntil)+Math.round(between(rng,profile.hesitationMinMs,profile.hesitationMaxMs));
        lane.quickChain=0;lane.phase='grounded';lane.landedAt=null;lane.expectedLandingAt=null;lane.nextActionAt=ready;continue;
      }
      break;
    }
    return lane;
  }
  function advanceRound(round,nowMs,rng=Math.random){
    if(!round||round.finalized)return round;
    const now=n(nowMs);
    advanceLane(round,round.player,now);
    for(let i=1;i<round.racers.length;i++)advanceCpu(round,round.racers[i],now,rng);
    if(now>=round.cutoffAt&&round.racers.every(l=>l.phase!=='airborne')){round.finalized=true;round.finishedAt=now;round.ranking=rankRound(round);}
    return round;
  }
  return {CONFIG,DIFFICULTIES,REWARDS,difficultyProfile,createRound,pressPlayer,releasePlayer,advanceRound,rankRound,placeFor,rewardFor,_pressLane:pressLane,_releaseLane:releaseLane,_advanceLane:advanceLane};
});
