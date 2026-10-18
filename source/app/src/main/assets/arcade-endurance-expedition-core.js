(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexEnduranceExpeditionCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const COUNTDOWN_STEP_MS=650;
  const COUNTDOWN_END_MS=COUNTDOWN_STEP_MS*3;

  const STAGES=Object.freeze([
    Object.freeze({id:'forest',name:'FOREST TRAIL',subtitle:'Roots, logs and brambles',theme:'grass',hazards:Object.freeze(['stump','fallen-log','bramble'])}),
    Object.freeze({id:'rapids',name:'RIVER RAPIDS',subtitle:'Driftwood, waves and whirlpools',theme:'water',hazards:Object.freeze(['drift-log','surge','whirlpool'])}),
    Object.freeze({id:'canyon',name:'CANYON PASS',subtitle:'Rolling boulders and fissures',theme:'rock',hazards:Object.freeze(['boulder','fissure','rockfall'])}),
    Object.freeze({id:'cave',name:'DARK CAVE',subtitle:'Stalactites and bat swarms',theme:'dark',hazards:Object.freeze(['stalactite','bat-swarm','cave-rock'])}),
    Object.freeze({id:'summit',name:'FROZEN SUMMIT',subtitle:'Snowballs, ice sheets and avalanches',theme:'ice',hazards:Object.freeze(['snowball','ice-sheet','avalanche'])}),
  ]);

  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({id:'easy',label:'EASY',stageDurationMs:9500,cadenceMinMs:520,cadenceMaxMs:1080,burstChance:.10,burstMinMs:220,burstMaxMs:390,countScale:.82,travelMs:2550,damageScale:.78,rewardMultiplier:.82}),
    normal:Object.freeze({id:'normal',label:'NORMAL',stageDurationMs:10800,cadenceMinMs:390,cadenceMaxMs:900,burstChance:.15,burstMinMs:150,burstMaxMs:310,countScale:1,travelMs:2200,damageScale:1,rewardMultiplier:1}),
    hard:Object.freeze({id:'hard',label:'HARD',stageDurationMs:12100,cadenceMinMs:280,cadenceMaxMs:760,burstChance:.20,burstMinMs:100,burstMaxMs:240,countScale:1.24,travelMs:1880,damageScale:1.28,rewardMultiplier:1.38}),
  });
  const DIVISION_BASE=Object.freeze({
    rookie:{stageDurationMs:9400,cadenceMinMs:510,cadenceMaxMs:1060,burstChance:.10,burstMinMs:210,burstMaxMs:380,countScale:.82,travelMs:2520,damageScale:.80},
    poke:{stageDurationMs:9900,cadenceMinMs:460,cadenceMaxMs:990,burstChance:.12,burstMinMs:190,burstMaxMs:350,countScale:.90,travelMs:2380,damageScale:.88},
    great:{stageDurationMs:10600,cadenceMinMs:400,cadenceMaxMs:900,burstChance:.15,burstMinMs:150,burstMaxMs:310,countScale:1,travelMs:2190,damageScale:1},
    ultra:{stageDurationMs:11400,cadenceMinMs:335,cadenceMaxMs:820,burstChance:.18,burstMinMs:120,burstMaxMs:260,countScale:1.12,travelMs:2020,damageScale:1.13},
    master:{stageDurationMs:12100,cadenceMinMs:275,cadenceMaxMs:750,burstChance:.21,burstMinMs:95,burstMaxMs:230,countScale:1.24,travelMs:1860,damageScale:1.28},
  });
  const BASE_COUNTS=Object.freeze([13,14,15,16,18]);
  const BASE_DAMAGE=Object.freeze({
    stump:13,'fallen-log':17,bramble:15,'drift-log':16,surge:15,whirlpool:17,boulder:21,fissure:18,rockfall:20,stalactite:20,'bat-swarm':14,'cave-rock':19,snowball:21,'ice-sheet':17,avalanche:23
  });

  function hashSeed(seed){if(Number.isFinite(Number(seed)))return (Number(seed)>>>0)||0x6d2b79f5;let h=2166136261;for(const ch of String(seed??'endurance-expedition')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0||0x6d2b79f5;}
  function createSeededRng(seed){let a=hashSeed(seed);return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
  function rand(rng,a,b){return a+clamp((rng||Math.random)(),0,.999999)*(b-a);}
  function difficultyProfile(id='normal'){return {...(DIFFICULTIES[id]||DIFFICULTIES.normal),mode:'exhibition'};}
  function divisionProfile(id='rookie',roundIndex=0){const key=DIVISION_BASE[id]?id:'rookie',r=clamp(Math.trunc(Number(roundIndex)||0),0,2),b=DIVISION_BASE[key];return {...b,id:key,label:key.toUpperCase(),mode:'cup',divisionId:key,roundIndex:r,stageDurationMs:b.stageDurationMs+r*350,cadenceMinMs:Math.max(230,b.cadenceMinMs-r*15),cadenceMaxMs:Math.max(620,b.cadenceMaxMs-r*25),countScale:b.countScale+r*.045,travelMs:Math.max(1720,b.travelMs-r*55),damageScale:b.damageScale+r*.04,rewardMultiplier:1};}
  function countdownLabel(elapsedMs){const t=Math.max(0,Number(elapsedMs)||0);if(t<COUNTDOWN_STEP_MS)return '3';if(t<COUNTDOWN_STEP_MS*2)return '2';if(t<COUNTDOWN_STEP_MS*3)return '1';return '';}

  // HP is the endurance pool. No hidden resistance multiplier: the stat's value is immediately readable.
  function enduranceCapacityForHp(baseHp){return Math.round(20+clamp(Number(baseHp)||60,1,255));}
  function hpPerformance(baseHp){const hp=clamp(Number(baseHp)||60,1,255);return clamp(.48+(hp-1)/254*.62,.48,1.10);}
  function endurancePercent(run){return !run?.enduranceMax?0:clamp(run.endurance/run.enduranceMax*100,0,100);}
  function rollGoldenCache(rng=Math.random,rate=.02){return clamp(Number((rng||Math.random)())||0,0,.999999)<clamp(rate,0,1);}

  function obstacleGeometry(kind,rng){
    const random=typeof rng==='function'?rng:Math.random;
    const x=rand(random,.10,.90);
    switch(kind){
      case 'stump':return {shape:'circle',x,size:rand(random,.055,.085),jumpable:false,visual:'stump'};
      case 'fallen-log':return {shape:'rect',x,width:rand(random,.20,.32),height:.055,jumpable:false,visual:'fallen-log'};
      case 'bramble':return {shape:'wall-gap',gapCenter:rand(random,.22,.78),gapSize:rand(random,.23,.34),height:.075,jumpable:false,visual:'bramble'};
      case 'drift-log':return {shape:'rect',x,width:rand(random,.18,.28),height:.052,drift:rand(random,-.12,.12),jumpable:false,visual:'drift-log'};
      case 'surge':return {shape:'wall-gap',gapCenter:rand(random,.20,.80),gapSize:rand(random,.20,.31),height:.085,jumpable:false,visual:'surge'};
      case 'whirlpool':return {shape:'circle',x,size:rand(random,.085,.13),drift:rand(random,-.08,.08),jumpable:false,visual:'whirlpool'};
      case 'boulder':return {shape:'circle',x,size:rand(random,.07,.105),drift:rand(random,-.18,.18),jumpable:false,visual:'boulder'};
      case 'fissure':return {shape:'rect',x,width:rand(random,.15,.25),height:.045,drift:rand(random,-.06,.06),jumpable:false,visual:'fissure'};
      case 'rockfall':return {shape:'target',x,targetY:rand(random,.42,.77),size:rand(random,.075,.105),jumpable:false,visual:'rockfall'};
      case 'stalactite':return {shape:'target',x,targetY:rand(random,.38,.76),size:rand(random,.065,.095),jumpable:false,visual:'stalactite'};
      case 'bat-swarm':return {shape:'sine',x,width:rand(random,.17,.25),height:.07,amplitude:rand(random,.10,.19),phase:rand(random,0,Math.PI*2),jumpable:false,visual:'bat-swarm'};
      case 'cave-rock':return {shape:'circle',x,size:rand(random,.06,.095),drift:rand(random,-.10,.10),jumpable:false,visual:'cave-rock'};
      case 'snowball':return {shape:'circle',x,size:rand(random,.075,.115),drift:rand(random,-.20,.20),jumpable:false,visual:'snowball'};
      case 'ice-sheet':return {shape:'rect',x,width:rand(random,.22,.36),height:.06,drift:rand(random,-.10,.10),jumpable:false,visual:'ice-sheet'};
      case 'avalanche':return {shape:'wall-gap',gapCenter:rand(random,.18,.82),gapSize:rand(random,.17,.27),height:.105,jumpable:false,visual:'avalanche'};
      default:return {shape:'circle',x,size:.08,jumpable:false,visual:kind};
    }
  }
  function createStagePlan({stage=STAGES[0],profile=difficultyProfile('normal'),rng=Math.random,stageIndex=0,cache=false}={}){
    const random=typeof rng==='function'?rng:Math.random,p=profile||difficultyProfile('normal'),si=clamp(Math.trunc(Number(stageIndex)||0),0,4);
    const count=Math.max(10,Math.round(BASE_COUNTS[si]*(Number(p.countScale)||1)));
    const durationMs=Math.max(7600,Number(p.stageDurationMs)||10800)+si*260;
    const minGap=Math.max(90,Number(p.cadenceMinMs)||390),maxGap=Math.max(minGap+220,Number(p.cadenceMaxMs)||900);
    const obstacles=[];let at=580+rand(random,0,260);
    for(let i=0;i<count;i++){
      const kind=stage.hazards[Math.floor(random()*stage.hazards.length)%stage.hazards.length];
      const geometry=obstacleGeometry(kind,random);
      const base=BASE_DAMAGE[kind]||16;
      obstacles.push({id:`${stage.id}-${i}`,kind,atMs:Math.round(at),travelMs:Math.round((Number(p.travelMs)||2200)*rand(random,.90,1.08)),damage:Math.max(1,Math.round(base*(Number(p.damageScale)||1))),...geometry});
      const burst=random()<clamp(Number(p.burstChance)||0,0,.8);
      at+=burst?rand(random,Number(p.burstMinMs)||120,Number(p.burstMaxMs)||300):rand(random,minGap,maxGap);
    }
    // Spread packed schedules over most of the stage without turning them into a metronome.
    const last=obstacles.at(-1)?.atMs||0;
    if(last>durationMs-900){const scale=(durationMs-1100)/Math.max(1,last);for(const o of obstacles)o.atMs=Math.round(500+(o.atMs-500)*scale);}
    const cachePickup=cache?{id:`cache-${stage.id}`,kind:'golden-cache',atMs:Math.round(durationMs*.55),travelMs:Math.round((Number(p.travelMs)||2200)*1.05),damage:0,shape:'pickup',x:rand(random,.18,.82),size:.055,jumpable:false,visual:'golden-cache'}:null;
    return {stage,stageIndex:si,durationMs,obstacles,cachePickup};
  }

  function createRun({participant={},profile=difficultyProfile('normal'),seed=Date.now(),cacheRate=.02}={}){
    const rng=createSeededRng(seed),baseHp=clamp(Number(participant?.baseStat)||60,1,255),max=enduranceCapacityForHp(baseHp),cache=rollGoldenCache(rng,cacheRate),cacheStageIndex=cache?1+Math.floor(rng()*4):-1;
    return {participantKey:participant?.key||null,baseHp,endurance:max,enduranceMax:max,stageIndex:0,score:0,distance:0,obstaclesSeen:0,obstaclesCleared:0,hits:0,perfectStages:0,finished:false,fullClear:false,cache,cacheStageIndex,cacheCollected:false,seed:Number(seed)||Date.now(),profile:{...profile}};
  }
  function applyHazard(run,hazard,hit){
    if(!run||run.finished)return {hit:false,damage:0,ko:!!run?.finished};
    run.obstaclesSeen=(Number(run.obstaclesSeen)||0)+1;
    if(!hit){run.obstaclesCleared=(Number(run.obstaclesCleared)||0)+1;run.score=(Number(run.score)||0)+24;return {hit:false,damage:0,ko:false};}
    const damage=Math.max(1,Math.round(Number(hazard?.damage)||1));run.hits=(Number(run.hits)||0)+1;run.endurance=Math.max(0,(Number(run.endurance)||0)-damage);run.score=Math.max(0,(Number(run.score)||0)+5);if(run.endurance<=0)run.finished=true;return {hit:true,damage,ko:run.endurance<=0};
  }
  function completeStage(run,{clean=false}={}){if(!run||run.finished)return run;if(clean)run.perfectStages=(Number(run.perfectStages)||0)+1;run.score=(Number(run.score)||0)+180+Math.round(endurancePercent(run)*1.6);run.stageIndex=(Number(run.stageIndex)||0)+1;if(run.stageIndex>=STAGES.length){run.finished=true;run.fullClear=true;run.score+=600+Math.round(endurancePercent(run)*4);}return run;}
  function collectCache(run){if(!run?.cache||run.cacheCollected)return false;run.cacheCollected=true;run.score=(Number(run.score)||0)+500;return true;}
  function roundMetric(run){return Math.round((Number(run?.score)||0)+endurancePercent(run)*3+(run?.fullClear?300:0));}
  function rewardForRun(run){const mult=Math.max(.5,Number(run?.profile?.rewardMultiplier)||1),base=(Number(run?.score)||0)*.22+(run?.fullClear?220:60)+(run?.cacheCollected?120:0);return Math.max(40,Math.round(base*mult));}

  return Object.freeze({COUNTDOWN_STEP_MS,COUNTDOWN_END_MS,STAGES,DIFFICULTIES,DIVISION_BASE,BASE_DAMAGE,createSeededRng,difficultyProfile,divisionProfile,countdownLabel,enduranceCapacityForHp,hpPerformance,endurancePercent,rollGoldenCache,createStagePlan,createRun,applyHazard,completeStage,collectCache,roundMetric,rewardForRun});
});
