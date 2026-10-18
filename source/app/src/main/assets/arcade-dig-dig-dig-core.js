(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexDigDigDigCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({raceDistance:80});
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',minIntervalMs:210,maxIntervalMs:300,jitterMs:22,errorChance:.09,hesitationChance:.12,hesitationMinMs:90,hesitationMaxMs:180}),
    normal:Object.freeze({key:'normal',label:'Normal',minIntervalMs:155,maxIntervalMs:225,jitterMs:18,errorChance:.06,hesitationChance:.08,hesitationMinMs:70,hesitationMaxMs:150}),
    hard:Object.freeze({key:'hard',label:'Hard',minIntervalMs:90,maxIntervalMs:130,jitterMs:10,errorChance:.02,hesitationChance:.03,hesitationMinMs:35,hesitationMaxMs:75})
  });
  const REWARDS=Object.freeze({
    easy:Object.freeze([80,55,35,20]),
    normal:Object.freeze([100,70,45,25]),
    hard:Object.freeze([130,90,60,35])
  });

  const clamp01=v=>Math.max(0,Math.min(.999999,Number(v)||0));
  const rand=rng=>clamp01((rng||Math.random)());
  const between=(rng,min,max)=>min+rand(rng)*(max-min);
  const otherSide=side=>side==='left'?'right':'left';
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}

  function acceptInput(racer,side,nowMs){
    if(!racer||!['left','right'].includes(side))return {accepted:false,progress:Number(racer?.progress||0),finished:Boolean(racer?.finishedAt!=null)};
    if(racer.finishedAt!=null||Number(racer.progress||0)>=CONFIG.raceDistance)return {accepted:false,progress:Math.min(CONFIG.raceDistance,Number(racer.progress||0)),finished:true};
    if(racer.lastAcceptedSide===side)return {accepted:false,progress:Number(racer.progress||0),finished:false};
    racer.progress=Math.min(CONFIG.raceDistance,Number(racer.progress||0)+1);
    racer.lastAcceptedSide=side;
    racer.lastAcceptedAt=Number(nowMs)||0;
    if(racer.progress>=CONFIG.raceDistance&&racer.finishedAt==null)racer.finishedAt=Number(nowMs)||0;
    return {accepted:true,progress:racer.progress,finished:racer.finishedAt!=null};
  }

  function nextInterval(cpu,profile,rng){
    const jitter=(rand(rng)*2-1)*profile.jitterMs;
    let interval=Math.max(55,cpu.baseIntervalMs+jitter);
    if(rand(rng)<profile.hesitationChance)interval+=between(rng,profile.hesitationMinMs,profile.hesitationMaxMs);
    return Math.round(interval);
  }

  function createCpu(id,index,profile,rng,nowMs){
    const baseIntervalMs=Math.round(between(rng,profile.minIntervalMs,profile.maxIntervalMs));
    const racer={id,index,kind:'cpu',progress:0,lastAcceptedSide:null,lastAcceptedAt:null,finishedAt:null,baseIntervalMs,nextActionAt:0,actions:0};
    racer.nextActionAt=(Number(nowMs)||0)+nextInterval(racer,profile,rng);
    return racer;
  }

  function createRace({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const profile=difficultyProfile(difficulty),start=Number(nowMs)||0;
    const player={id:'player',index:0,kind:'player',progress:0,lastAcceptedSide:null,lastAcceptedAt:null,finishedAt:null};
    const racers=[player,createCpu('cpu1',1,profile,rng,start),createCpu('cpu2',2,profile,rng,start),createCpu('cpu3',3,profile,rng,start)];
    const race={difficulty:profile.key,startedAt:start,racers,player,firstFinishAt:null,finalized:false,ranking:null};
    return race;
  }

  function advanceCpu(race,cpuIndex,nowMs,rng=Math.random){
    const cpu=race?.racers?.[cpuIndex],profile=difficultyProfile(race?.difficulty);
    if(!cpu||cpu.kind!=='cpu'||cpu.finishedAt!=null)return cpu||null;
    const now=Number(nowMs)||0;
    let guard=0;
    while(cpu.finishedAt==null&&cpu.nextActionAt<=now&&guard++<512){
      const actionAt=cpu.nextActionAt;
      const expected=cpu.lastAcceptedSide?otherSide(cpu.lastAcceptedSide):(rand(rng)<.5?'left':'right');
      const side=rand(rng)<profile.errorChance?(cpu.lastAcceptedSide||otherSide(expected)):expected;
      acceptInput(cpu,side,actionAt);
      cpu.actions++;
      cpu.nextActionAt=actionAt+nextInterval(cpu,profile,rng);
    }
    return cpu;
  }

  function firstFinish(race){
    const finishes=race.racers.map(r=>r.finishedAt).filter(v=>v!=null);
    return finishes.length?Math.min(...finishes):null;
  }

  function rankRace(race){
    return race.racers.slice().sort((a,b)=>{
      const af=a.finishedAt!=null,bf=b.finishedAt!=null;
      if(af&&bf)return a.finishedAt-b.finishedAt||a.index-b.index;
      if(af!==bf)return af?-1:1;
      return Number(b.progress||0)-Number(a.progress||0)||Number(b.lastAcceptedAt??-Infinity)-Number(a.lastAcceptedAt??-Infinity)||a.index-b.index;
    });
  }

  function advanceRace(race,nowMs,rng=Math.random){
    if(!race||race.finalized)return race;
    const now=Number(nowMs)||0;
    for(let i=1;i<race.racers.length;i++)advanceCpu(race,i,now,rng);
    const first=firstFinish(race);
    if(first!=null&&race.firstFinishAt==null)race.firstFinishAt=first;
    if(race.racers.every(r=>r.finishedAt!=null))finalizeRace(race,now);
    return race;
  }

  function finalizeRace(race,nowMs){
    if(!race)return [];
    if(!race.finalized){race.finalized=true;race.finalizedAt=Number(nowMs)||0;race.ranking=rankRace(race).map(r=>r);}
    return race.ranking.slice();
  }

  function rewardFor(place,difficulty='normal'){
    const row=REWARDS[difficulty]||REWARDS.normal;
    const idx=Math.max(0,Math.min(3,Math.trunc(Number(place)||1)-1));
    return row[idx];
  }

  return {CONFIG,DIFFICULTIES,REWARDS,difficultyProfile,createRace,acceptInput,advanceCpu,advanceRace,finalizeRace,rewardFor};
});
