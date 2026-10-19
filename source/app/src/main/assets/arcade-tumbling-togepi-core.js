(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexTumblingTogepiCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    courseDistance:1000,
    baseSpeedPerMs:.036,
    lateralSpeedPerMs:.0024,
    visibleDistance:260,
    racerScreenY:26,
    finishGraceMs:3800,
    collisionRadius:.24,
    boostDurationMs:1650,
    boostPerChain:.16,
    maxBoostMultiplier:1.96,
    flowerSlowMs:1100,
    flowerSpeedFactor:.54,
    rockStumbleMs:680,
    diglettStumbleMs:820,
    logJumpMs:520,
    logSlowMs:520,
    logMomentumFactor:.68
  });
  const PLAYABLE_SPECIES=Object.freeze([
    Object.freeze({id:175,name:'Togepi'}),
    Object.freeze({id:138,name:'Omanyte'})
  ]);
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',cpuSpeedScale:.91,routeAccuracy:.68,reactionDistance:78,wobble:.16}),
    normal:Object.freeze({key:'normal',label:'Normal',cpuSpeedScale:.99,routeAccuracy:.80,reactionDistance:92,wobble:.11}),
    hard:Object.freeze({key:'hard',label:'Hard',cpuSpeedScale:1.07,routeAccuracy:.91,reactionDistance:108,wobble:.07})
  });
  const REWARDS=Object.freeze({easy:Object.freeze([100,65,40,25]),normal:Object.freeze([135,90,55,30]),hard:Object.freeze([175,115,75,40])});
  const COURSE_TEMPLATE=Object.freeze([
    ['arrow',70,-.48],['flower',118,.35],['arrow',150,.18],['rock',205,-.25],['arrow',246,-.56],['log',286,.30],
    ['arrow',330,.52],['flower',372,-.18],['rock',418,.46],['arrow',455,.08],['log',502,-.44],['arrow',545,-.24],
    ['flower',590,.42],['arrow',630,.36],['rock',674,-.52],['arrow',712,-.10],['diglett',756,.48],['log',798,.05],
    ['arrow',834,.56],['diglett',875,-.36],['arrow',910,-.48],['flower',944,.20],['arrow',970,.04]
  ]);

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const rand=rng=>clamp((rng||Math.random)(),0,.999999);
  const profileFor=key=>DIFFICULTIES[key]||DIFFICULTIES.normal;
  const speciesFor=id=>PLAYABLE_SPECIES.find(x=>x.id===Number(id))||PLAYABLE_SPECIES[0];
  function buildCourse(rng=Math.random){
    return COURSE_TEMPLATE.map((row,i)=>{
      const [type,progress,x]=row;
      const jitter=(rand(rng)*2-1)*.055;
      return {id:`o${i+1}`,type,progress,x:clamp(x+jitter,-.72,.72),radius:type==='flower'?.30:CONFIG.collisionRadius};
    });
  }
  function makeRacer(id,index,kind,speciesId,nowMs=0){
    const species=speciesFor(speciesId);
    return {id,index,kind,speciesId:species.id,speciesName:species.name,x:0,inputX:0,inputY:0,progress:0,lastProgress:0,lastUpdateAt:Number(nowMs)||0,finishedAt:null,finishPlace:null,seenObjects:{},speedMultiplier:1,boostChain:0,bestBoostChain:0,boostUntil:0,slowedUntil:0,stumblingUntil:0,jumpingUntil:0,arrowsHit:0,arrowsMissed:0,flowersHit:0,rocksHit:0,diglettHits:0,logsJumped:0,obstacleHits:0,nextDecisionAt:Number(nowMs)||0,targetX:0};
  }
  function setInput(racerOrRace,x,y){
    const racer=racerOrRace?.player||racerOrRace;
    if(!racer)return false;
    racer.inputX=clamp(x,-1,1);racer.inputY=clamp(y,-1,1);return true;
  }
  function applyCourseObject(race,racer,obj,nowMs,{collided=true}={}){
    if(!racer||!obj||racer.seenObjects[obj.id])return {hit:false,type:obj?.type||null};
    racer.seenObjects[obj.id]=true;
    const now=Number(nowMs)||0;
    if(!collided){if(obj.type==='arrow'){racer.arrowsMissed++;racer.boostChain=0;}return {hit:false,type:obj.type};}
    if(obj.type==='arrow'){
      racer.arrowsHit++;racer.boostChain=Math.min(6,Number(racer.boostChain||0)+1);racer.bestBoostChain=Math.max(racer.bestBoostChain,racer.boostChain);
      racer.speedMultiplier=Math.min(CONFIG.maxBoostMultiplier,1+CONFIG.boostPerChain*racer.boostChain);racer.boostUntil=now+CONFIG.boostDurationMs;
    }else if(obj.type==='flower'){
      racer.flowersHit++;racer.slowedUntil=Math.max(racer.slowedUntil,now+CONFIG.flowerSlowMs);racer.boostChain=0;
    }else if(obj.type==='rock'){
      racer.rocksHit++;racer.obstacleHits++;racer.stumblingUntil=Math.max(racer.stumblingUntil,now+CONFIG.rockStumbleMs);racer.boostChain=0;racer.speedMultiplier=1;
    }else if(obj.type==='diglett'){
      racer.diglettHits++;racer.obstacleHits++;racer.stumblingUntil=Math.max(racer.stumblingUntil,now+CONFIG.diglettStumbleMs);racer.boostChain=0;racer.speedMultiplier=1;
    }else if(obj.type==='log'){
      racer.logsJumped++;racer.jumpingUntil=Math.max(racer.jumpingUntil,now+CONFIG.logJumpMs);racer.slowedUntil=Math.max(racer.slowedUntil,now+CONFIG.logSlowMs);racer.speedMultiplier=Math.max(.72,Number(racer.speedMultiplier||1)*CONFIG.logMomentumFactor);racer.boostChain=Math.max(0,Number(racer.boostChain||0)-1);
    }
    return {hit:true,type:obj.type,boostChain:racer.boostChain,speedMultiplier:racer.speedMultiplier};
  }
  function processObjects(race,racer,fromProgress,toProgress,nowMs){
    for(const obj of race.course){
      if(racer.seenObjects[obj.id]||obj.progress<=fromProgress||obj.progress>toProgress)continue;
      const hit=Math.abs(Number(racer.x||0)-obj.x)<=Number(obj.radius||CONFIG.collisionRadius);
      applyCourseObject(race,racer,obj,nowMs,{collided:hit});
    }
  }
  function speedFactor(racer,nowMs,cpuScale=1){
    const now=Number(nowMs)||0;
    if(now>=Number(racer.boostUntil||0)&&racer.speedMultiplier>1)racer.speedMultiplier=1;
    if(now<Number(racer.stumblingUntil||0))return 0;
    let factor=Math.max(.35,Number(racer.speedMultiplier||1))*cpuScale;
    if(now<Number(racer.slowedUntil||0))factor*=CONFIG.flowerSpeedFactor;
    return factor;
  }
  function nextUnseenObject(race,racer){return race.course.find(o=>!racer.seenObjects[o.id]&&o.progress>=racer.progress)||null;}
  function steerCpu(race,racer,nowMs,rng){
    const p=profileFor(race.difficulty),now=Number(nowMs)||0;
    if(now<Number(racer.nextDecisionAt||0))return;
    racer.nextDecisionAt=now+120+rand(rng)*120;
    const next=nextUnseenObject(race,racer);let target=0;
    if(next&&next.progress-racer.progress<=p.reactionDistance){
      const accurate=rand(rng)<p.routeAccuracy;
      if(next.type==='arrow')target=accurate?next.x:clamp(next.x+(rand(rng)<.5?-.55:.55),-.72,.72);
      else if(['rock','diglett','flower','log'].includes(next.type))target=accurate?clamp(next.x+(next.x>=0?-.52:.52),-.72,.72):next.x;
    }else target=(rand(rng)*2-1)*p.wobble;
    racer.targetX=target;
    racer.inputX=clamp((target-racer.x)*3.4,-1,1);racer.inputY=1;
  }
  function updateFinishWindow(race,nowMs){
    const finished=race.racers.filter(r=>r.finishedAt!=null).sort((a,b)=>a.finishedAt-b.finishedAt||a.index-b.index);
    finished.forEach((r,i)=>r.finishPlace=i+1);
    if(finished.length&&race.firstFinishAt==null){race.firstFinishAt=finished[0].finishedAt;race.graceEndsAt=race.firstFinishAt+CONFIG.finishGraceMs;}
    if(race.racers.every(r=>r.finishedAt!=null)||(race.graceEndsAt!=null&&Number(nowMs)>=race.graceEndsAt))finalizeRace(race,nowMs);
  }
  function advanceRacer(race,racer,nowMs,rng=Math.random){
    if(!race||!racer||race.finalized||racer.finishedAt!=null)return racer;
    const now=Number(nowMs)||0,fromTime=Number(racer.lastUpdateAt||0),dt=clamp(now-fromTime,0,220);
    racer.lastUpdateAt=now;
    if(racer.kind==='cpu')steerCpu(race,racer,now,rng);
    racer.x=clamp(racer.x+racer.inputX*CONFIG.lateralSpeedPerMs*dt,-.78,.78);
    const forward=Math.max(0,Number(racer.inputY||0));
    const cpuScale=racer.kind==='cpu'?profileFor(race.difficulty).cpuSpeedScale:1;
    const old=racer.progress;
    racer.lastProgress=old;
    racer.progress=Math.min(CONFIG.courseDistance,old+CONFIG.baseSpeedPerMs*dt*forward*speedFactor(racer,now,cpuScale));
    processObjects(race,racer,old,racer.progress,now);
    if(racer.progress>=CONFIG.courseDistance&&racer.finishedAt==null)racer.finishedAt=now;
    return racer;
  }
  function createRace({difficulty='normal',rng=Math.random,nowMs=0,playerSpeciesId=175}={}){
    const profile=profileFor(difficulty),start=Number(nowMs)||0,course=buildCourse(rng);
    const player=makeRacer('player',0,'player',playerSpeciesId,start);
    const racers=[player,makeRacer('cpu1',1,'cpu',175,start),makeRacer('cpu2',2,'cpu',175,start),makeRacer('cpu3',3,'cpu',175,start)];
    racers.slice(1).forEach((r,i)=>{r.x=(i-1)*.18;r.targetX=r.x;r.inputY=1;});
    return {difficulty:profile.key,course,startedAt:start,lastUpdateAt:start,racers,player,firstFinishAt:null,graceEndsAt:null,finalized:false,finalizedAt:null,ranking:null};
  }
  function advanceRace(race,nowMs,rng=Math.random){
    if(!race||race.finalized)return race;
    for(const racer of race.racers)advanceRacer(race,racer,nowMs,rng);
    updateFinishWindow(race,nowMs);return race;
  }
  function rankRace(race){return (race?.racers||[]).slice().sort((a,b)=>{const af=a.finishedAt!=null,bf=b.finishedAt!=null;if(af&&bf)return a.finishedAt-b.finishedAt||a.index-b.index;if(af!==bf)return af?-1:1;return Number(b.progress||0)-Number(a.progress||0)||Number(b.bestBoostChain||0)-Number(a.bestBoostChain||0)||a.index-b.index;});}
  function finalizeRace(race,nowMs){if(!race)return[];if(!race.finalized){race.finalized=true;race.finalizedAt=Number(nowMs)||0;race.ranking=rankRace(race);}return (race.ranking||rankRace(race)).slice();}
  function placeFor(race,id='player'){const i=(race?.ranking||rankRace(race)).findIndex(r=>r.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal;return row[clamp(Math.trunc(Number(place)||1)-1,0,3)];}
  function shiftTimestamps(race,delta){if(!race||!Number(delta))return race;const d=Number(delta);race.startedAt+=d;if(race.firstFinishAt!=null)race.firstFinishAt+=d;if(race.graceEndsAt!=null)race.graceEndsAt+=d;if(race.finalizedAt!=null)race.finalizedAt+=d;for(const r of race.racers){r.lastUpdateAt+=d;r.nextDecisionAt+=d;if(r.finishedAt!=null)r.finishedAt+=d;r.boostUntil+=d;r.slowedUntil+=d;r.stumblingUntil+=d;r.jumpingUntil+=d;}return race;}
  return {CONFIG,PLAYABLE_SPECIES,DIFFICULTIES,REWARDS,COURSE_TEMPLATE,profileFor,speciesFor,buildCourse,createRace,setInput,applyCourseObject,advanceRacer,advanceRace,rankRace,finalizeRace,placeFor,rewardFor,shiftTimestamps};
});
