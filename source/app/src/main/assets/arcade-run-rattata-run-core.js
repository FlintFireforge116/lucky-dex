(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexRunRattataRunCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    courseDistance:1200,
    hurdles:Object.freeze([220,390,575,760,930,1080]),
    graceMs:3000,
    minTapIntervalMs:45,
    baseStride:6.5,
    momentumStrideBonus:5.5,
    momentumPerTap:.14,
    momentumDecayPerMs:.00018,
    jumpDurationMs:500,
    jumpCooldownMs:240,
    stumbleMs:650,
    stumbleMomentumFactor:.25,
    fastTimeMs:10000
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',minRunIntervalMs:128,maxRunIntervalMs:168,jitterMs:16,jumpErrorChance:.18,jumpLeadDistance:38,hesitationChance:.08,hesitationMs:120,jumpDurationMs:700}),
    normal:Object.freeze({key:'normal',label:'Normal',minRunIntervalMs:104,maxRunIntervalMs:136,jitterMs:12,jumpErrorChance:.10,jumpLeadDistance:34,hesitationChance:.05,hesitationMs:90,jumpDurationMs:650}),
    hard:Object.freeze({key:'hard',label:'Hard',minRunIntervalMs:84,maxRunIntervalMs:108,jitterMs:8,jumpErrorChance:.04,jumpLeadDistance:31,hesitationChance:.025,hesitationMs:60,jumpDurationMs:500})
  });
  const REWARDS=Object.freeze({easy:Object.freeze([90,60,40,25]),normal:Object.freeze([120,80,50,30]),hard:Object.freeze([150,100,65,40])});
  const RATTATA=Object.freeze({dex:19,name:'Rattata'});

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const rand=rng=>clamp(Number((rng||Math.random)())||0,0,.999999);
  const between=(rng,a,b)=>a+rand(rng)*(b-a);
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function createRacer(id,index,kind,nowMs=0){const label=id==='player'?'YOU':`COM ${index}`;return {id,index,kind,label,species:{...RATTATA},progress:0,momentum:0,lastMomentumAt:Number(nowMs)||0,lastRunAt:null,runPresses:0,jumpUntil:0,jumpCooldownUntil:0,stumblingUntil:0,hurdlesCleared:0,hurdlesHit:0,nextHurdleIndex:0,finishedAt:null,nextRunAt:null,baseRunIntervalMs:null};}
  function decayMomentum(racer,nowMs){const now=Number(nowMs)||0,then=Number(racer.lastMomentumAt??now),dt=Math.max(0,now-then);racer.momentum=clamp(Number(racer.momentum||0)-dt*CONFIG.momentumDecayPerMs,0,1);racer.lastMomentumAt=now;return racer.momentum;}
  function isAirborne(racer,nowMs){return Number(racer?.jumpUntil||0)>Number(nowMs||0);}
  function isStumbling(racer,nowMs){return Number(racer?.stumblingUntil||0)>Number(nowMs||0);}
  function pressJump(race,racer,nowMs){
    if(!race||!racer||race.finalized||racer.finishedAt!=null)return {accepted:false,reason:'finished'};
    const now=Number(nowMs)||0;
    if(isStumbling(racer,now))return {accepted:false,reason:'stumble'};
    if(now<Number(racer.jumpCooldownUntil||0))return {accepted:false,reason:'cooldown'};
    const duration=Number(difficultyProfile(race.difficulty).jumpDurationMs)||CONFIG.jumpDurationMs;racer.jumpUntil=now+duration;racer.jumpCooldownUntil=racer.jumpUntil+CONFIG.jumpCooldownMs;
    return {accepted:true,jumpUntil:racer.jumpUntil};
  }
  function updateFinishWindow(race,nowMs){
    if(!race)return;
    const finished=race.racers.filter(r=>r.finishedAt!=null);
    if(finished.length&&race.firstFinishAt==null){race.firstFinishAt=Math.min(...finished.map(r=>Number(r.finishedAt)));race.graceEndsAt=race.firstFinishAt+CONFIG.graceMs;}
    if(race.racers.every(r=>r.finishedAt!=null)||race.graceEndsAt!=null&&Number(nowMs)>=race.graceEndsAt)finalizeRace(race,nowMs);
  }
  function pressRun(race,racer,nowMs){
    if(!race||!racer||race.finalized||racer.finishedAt!=null)return {accepted:false,reason:'finished',finished:!!racer?.finishedAt};
    const now=Number(nowMs)||0;
    if(isStumbling(racer,now))return {accepted:false,reason:'stumble',finished:false};
    if(racer.lastRunAt!=null&&now-Number(racer.lastRunAt)<CONFIG.minTapIntervalMs)return {accepted:false,reason:'too-fast',finished:false};
    decayMomentum(racer,now);
    racer.momentum=clamp(racer.momentum+CONFIG.momentumPerTap,0,1);
    racer.lastRunAt=now;racer.runPresses++;
    const old=Number(racer.progress||0),stride=CONFIG.baseStride+CONFIG.momentumStrideBonus*racer.momentum;
    let next=Math.min(CONFIG.courseDistance,old+stride),hurdleHit=false,hurdleCleared=false;
    while(racer.nextHurdleIndex<CONFIG.hurdles.length&&CONFIG.hurdles[racer.nextHurdleIndex]<=next){
      if(isAirborne(racer,now)){racer.hurdlesCleared++;hurdleCleared=true;}
      else {racer.hurdlesHit++;hurdleHit=true;racer.stumblingUntil=now+CONFIG.stumbleMs;racer.momentum*=CONFIG.stumbleMomentumFactor;}
      racer.nextHurdleIndex++;
    }
    racer.progress=next;
    if(racer.progress>=CONFIG.courseDistance&&racer.finishedAt==null)racer.finishedAt=now;
    updateFinishWindow(race,now);
    return {accepted:true,progress:racer.progress,momentum:racer.momentum,hurdleHit,hurdleCleared,finished:racer.finishedAt!=null};
  }
  function nextCpuInterval(cpu,profile,rng){
    const jitter=(rand(rng)*2-1)*profile.jitterMs;
    let ms=Math.max(CONFIG.minTapIntervalMs+5,Number(cpu.baseRunIntervalMs||between(rng,profile.minRunIntervalMs,profile.maxRunIntervalMs))+jitter);
    if(rand(rng)<profile.hesitationChance)ms+=profile.hesitationMs;
    return Math.round(ms);
  }
  function createCpu(id,index,profile,rng,nowMs){
    const r=createRacer(id,index,'cpu',nowMs);r.baseRunIntervalMs=Math.round(between(rng,profile.minRunIntervalMs,profile.maxRunIntervalMs));r.nextRunAt=(Number(nowMs)||0)+nextCpuInterval(r,profile,rng);return r;
  }
  function createRace({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const profile=difficultyProfile(difficulty),start=Number(nowMs)||0,player=createRacer('player',0,'player',start);
    const racers=[player,createCpu('cpu1',1,profile,rng,start),createCpu('cpu2',2,profile,rng,start),createCpu('cpu3',3,profile,rng,start)];
    return {difficulty:profile.key,startedAt:start,racers,player,firstFinishAt:null,graceEndsAt:null,finalized:false,finalizedAt:null,ranking:null};
  }
  function maybeCpuJump(race,cpu,at,profile,rng){
    if(cpu.nextHurdleIndex>=CONFIG.hurdles.length||isAirborne(cpu,at)||isStumbling(cpu,at))return false;
    const gap=CONFIG.hurdles[cpu.nextHurdleIndex]-Number(cpu.progress||0);
    if(gap>profile.jumpLeadDistance)return false;
    if(rand(rng)<profile.jumpErrorChance)return false;
    return !!pressJump(race,cpu,at).accepted;
  }
  function advanceCpu(race,cpuIndex,nowMs,rng=Math.random){
    const cpu=race?.racers?.[cpuIndex],profile=difficultyProfile(race?.difficulty);if(!cpu||cpu.kind!=='cpu'||cpu.finishedAt!=null)return cpu||null;
    const now=Number(nowMs)||0;let guard=0;
    while(cpu.finishedAt==null&&Number(cpu.nextRunAt)<=now&&guard++<512){
      const at=Math.max(Number(cpu.nextRunAt)||0,Number(cpu.stumblingUntil||0));
      if(at>now){cpu.nextRunAt=at;break;}
      maybeCpuJump(race,cpu,at,profile,rng);pressRun(race,cpu,at);
      cpu.nextRunAt=at+nextCpuInterval(cpu,profile,rng);
      if(race.finalized)break;
    }
    return cpu;
  }
  function rankRace(race){return (race?.racers||[]).slice().sort((a,b)=>{const af=a.finishedAt!=null,bf=b.finishedAt!=null;if(af&&bf)return Number(a.finishedAt)-Number(b.finishedAt)||a.index-b.index;if(af!==bf)return af?-1:1;return Number(b.progress||0)-Number(a.progress||0)||Number(b.hurdlesCleared||0)-Number(a.hurdlesCleared||0)||a.index-b.index;});}
  function finalizeRace(race,nowMs){if(!race)return[];if(!race.finalized){race.finalized=true;race.finalizedAt=Number(nowMs)||0;race.ranking=rankRace(race);}return race.ranking.slice();}
  function advanceRace(race,nowMs,rng=Math.random){if(!race||race.finalized)return race;const now=Number(nowMs)||0;for(let i=1;i<race.racers.length&&!race.finalized;i++)advanceCpu(race,i,now,rng);updateFinishWindow(race,now);return race;}
  function placeFor(race,id='player'){const i=rankRace(race).findIndex(r=>r.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal,idx=clamp(Math.trunc(Number(place)||1)-1,0,3);return row[idx];}

  return {CONFIG,DIFFICULTIES,REWARDS,RATTATA,difficultyProfile,createRace,pressRun,pressJump,advanceCpu,advanceRace,rankRace,finalizeRace,placeFor,rewardFor,isAirborne,isStumbling};
});
