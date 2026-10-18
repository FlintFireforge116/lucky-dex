(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexImpactTrialCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const round1=n=>Math.round((Number(n)||0)*10)/10;
  const COUNTDOWN_STEP_MS=650,COUNTDOWN_END_MS=2200,LANE_GUARD_Y=78,TARGET_GRACE_MS=190;

  const HAZARDS=Object.freeze([
    Object.freeze({id:'boulder-roll',name:'Rolling Boulder',mode:'burst',damage:38,cue:'HARDEN!',hint:'Tap the shields before the boulder hits.',sprite:'adventure/art/objects/strength_boulder.png',spriteScale:5.4,kind:'roll',baseTargets:7,windowMs:1900,lifeMs:560}),
    Object.freeze({id:'tauros-charge',name:'Tauros Charge',mode:'rush',damage:46,cue:'HARDEN!',hint:'A short, violent burst — react fast.',sprite:'arcade/sprites/actors/pokemon/128.png',spriteScale:4.2,kind:'charge',baseTargets:8,windowMs:1520,lifeMs:430}),
    Object.freeze({id:'rock-slide',name:'Rock Slide',mode:'lanes',damage:50,cue:'HARDEN!',hint:'Track the chaotic falling shields and catch them near the guard line.',sprite:'arcade/dash/gen3/route-rock.png',spriteScale:3.1,kind:'fall',baseTargets:9,windowMs:2300,lifeMs:620}),
    Object.freeze({id:'falling-weight',name:'Falling Weight',mode:'precision',damage:54,cue:'HARDEN!',hint:'Small shield points — accuracy matters.',sprite:'arcade/dash/gen3/cave-rock.png',spriteScale:3.4,kind:'weight',baseTargets:7,windowMs:1820,lifeMs:500}),
    Object.freeze({id:'final-barrage',name:'Final Barrage',mode:'barrage',damage:62,cue:'HARDEN!',hint:'Multiple impact waves. Keep up!',sprite:'arcade/challenge-course/training-ram.svg',spriteScale:4.8,kind:'ram',baseTargets:12,windowMs:2700,lifeMs:470})
  ]);

  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',timeScale:1.16,targetCountScale:.86,targetScale:1.14,damageMultiplier:.86,rewardMultiplier:1.0,maxLive:2}),
    normal:Object.freeze({key:'normal',label:'Normal',timeScale:1,targetCountScale:1,targetScale:1,damageMultiplier:1,rewardMultiplier:1.2,maxLive:3}),
    hard:Object.freeze({key:'hard',label:'Hard',timeScale:.98,targetCountScale:1.08,targetScale:.92,damageMultiplier:1.18,rewardMultiplier:1.5,maxLive:4})
  });

  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  const DIVISION_PROFILES=Object.freeze({
    rookie:Object.freeze({timeScale:1.08,targetCountScale:.90,targetScale:1.08,damageMultiplier:.95,maxLive:2,barrageMaxLive:3,graceMs:190,hitRadiusScale:1.10}),
    poke:Object.freeze({timeScale:1.02,targetCountScale:.96,targetScale:1.03,damageMultiplier:1.00,maxLive:3,barrageMaxLive:3,graceMs:170,hitRadiusScale:1.05}),
    great:Object.freeze({timeScale:.96,targetCountScale:1.00,targetScale:1.00,damageMultiplier:1.08,maxLive:3,barrageMaxLive:3,graceMs:145,hitRadiusScale:1.00}),
    ultra:Object.freeze({timeScale:.91,targetCountScale:1.04,targetScale:.95,damageMultiplier:1.16,maxLive:3,barrageMaxLive:4,graceMs:120,hitRadiusScale:.94}),
    master:Object.freeze({timeScale:.86,targetCountScale:1.08,targetScale:.90,damageMultiplier:1.25,maxLive:3,barrageMaxLive:4,graceMs:100,hitRadiusScale:.88})
  });
  function divisionProfile(divisionId='rookie',roundIndex=0){
    const id=DIVISION_PROFILES[divisionId]?divisionId:'rookie',base=DIVISION_PROFILES[id],round=Math.max(0,Math.min(2,Math.trunc(Number(roundIndex)||0))),tighten=round===1?.97:round===2?.94:1;
    return Object.freeze({key:`division-${id}-${round+1}`,label:id.toUpperCase(),divisionId:id,roundIndex:round,timeScale:Math.round(base.timeScale*tighten*1000)/1000,targetCountScale:base.targetCountScale,targetScale:base.targetScale,damageMultiplier:base.damageMultiplier,rewardMultiplier:1,maxLive:base.maxLive,barrageMaxLive:base.barrageMaxLive,graceMs:Math.max(60,base.graceMs-round*10),hitRadiusScale:base.hitRadiusScale});
  }
  function statFactor(value){const curve=(typeof globalThis!=='undefined'&&globalThis.LuckyDexGoldenrodStatCurve)||(typeof require==='function'?require('./arcade-goldenrod-stat-curve.js'):null);return curve?.factor?curve.factor(value):1;}
  function defenseExpressionFactor(defense){
    const n=Number(defense),value=Number.isFinite(n)?n:60;
    if(value>=20)return statFactor(value);
    const t=clamp((value-5)/15,0,1);
    return Math.round((.45+t*.20)*10000)/10000;
  }
  function defensePerformance(defense){
    const f=defenseExpressionFactor(defense);
    return clamp(.40+((f-.45)/.83)*.60,.40,1);
  }
  function defenseResilience(defense){
    const f=defenseExpressionFactor(defense);
    return clamp(.03+((f-.45)/.83)*.42,.03,.45);
  }
  function defenseWorkload(defense){
    const f=defenseExpressionFactor(defense),neutral=defenseExpressionFactor(60);
    return clamp(1+(neutral-f)*2.25,.68,2.05);
  }
  function defenseDamageMultiplier(defense){
    const f=defenseExpressionFactor(defense),neutral=defenseExpressionFactor(60);
    if(f<neutral)return clamp(1+(neutral-f)*3.65,1,2.70);
    return clamp(1-(f-neutral)*.75,.70,1);
  }
  function hardenCoverage(hitValue,totalValue){return clamp((Number(hitValue)||0)/Math.max(.001,Number(totalValue)||0),0,1);}
  function hardenGrade(coverage){
    const c=clamp(coverage,0,1);
    if(c>=.985)return 'IMPENETRABLE';
    if(c>=.86)return 'IRONCLAD';
    if(c>=.70)return 'SOLID';
    if(c>=.50)return 'HARDENED';
    if(c>=.30)return 'SHAKY';
    return 'CRUSHED';
  }

  function countdownLabel(elapsedMs){
    const t=Math.max(0,Number(elapsedMs)||0);
    if(t<COUNTDOWN_STEP_MS)return '3';
    if(t<COUNTDOWN_STEP_MS*2)return '2';
    if(t<COUNTDOWN_STEP_MS*3)return '1';
    if(t<COUNTDOWN_END_MS)return 'GO!';
    return '';
  }

  function segmentHitsCircle(a,b,c,radius=28){
    const ax=Number(a?.x)||0,ay=Number(a?.y)||0,bx=Number(b?.x)||0,by=Number(b?.y)||0,cx=Number(c?.x)||0,cy=Number(c?.y)||0,r=Math.max(0,Number(radius)||0);
    const dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;
    const u=len2>0?clamp(((cx-ax)*dx+(cy-ay)*dy)/len2,0,1):0;
    const px=ax+dx*u,py=ay+dy*u,ox=cx-px,oy=cy-py;
    return ox*ox+oy*oy<=r*r;
  }

  function laneTargetY(target,elapsedSinceSpawn){
    const start=10,impactAt=Math.max(1,Number(target?.impactAtMs)||Math.round((Number(target?.lifeMs)||1)*.72));
    const progress=clamp((Number(elapsedSinceSpawn)||0)/impactAt,0,1);
    return round1(start+(LANE_GUARD_Y-start)*progress);
  }

  function targetHitValue(target,elapsedSinceSpawn){
    if(!target)return 0;
    if(target.mode!=='lanes')return 1;
    const age=Math.max(0,Number(elapsedSinceSpawn)||0),impactAt=Math.max(1,Number(target.impactAtMs)||Math.round((Number(target.lifeMs)||1)*.72));
    if(age>=impactAt)return 1;
    const progress=clamp(age/impactAt,0,1),spread=Math.max(.18,Number(target.timingSpread)||.34);
    return clamp(1-(1-progress)/spread,0,1);
  }

  function createTargetPlan({hazard=HAZARDS[0],difficulty='normal',profile=null,rng=Math.random,golden=false,defense=60}={}){
    const h=hazard||HAZARDS[0],p=profile||difficultyProfile(difficulty),random=typeof rng==='function'?rng:Math.random;
    const targetCount=Math.max(5,Math.round(h.baseTargets*p.targetCountScale*defenseWorkload(defense)));
    let windowMs=Math.max(1000,Math.round(h.windowMs*p.timeScale));
    const lifeMs=Math.max(340,Math.round(h.lifeMs*p.timeScale)),graceMs=Math.max(0,Number(p.graceMs??TARGET_GRACE_MS)||0);
    const maxLive=h.mode==='lanes'?3:h.mode==='barrage'?Math.max(2,Number(p.barrageMaxLive??p.maxLive)||3):Math.max(2,Number(p.maxLive)||3);
    const minGap=Math.max(96,Math.ceil((lifeMs+graceMs)/maxLive)+18);
    const gapVariation=h.mode==='lanes'?110:h.mode==='rush'?52:h.mode==='barrage'?82:96;
    const targets=[];
    let spawnAt=0;
    for(let i=0;i<targetCount;i++){
      if(i>0)spawnAt+=minGap+Math.round(clamp(random(),0,.999999)*gapVariation);
      let x,y,lane=null,timingTarget=null,timingSpread=null;
      if(h.mode==='lanes'){
        lane=Math.floor(clamp(random(),0,.999999)*3);
        const recent=targets.slice(-3).map(t=>t.lane);
        if(recent.length>=2&&recent[recent.length-1]===lane&&recent[recent.length-2]===lane)lane=(lane+1+Math.floor(clamp(random(),0,.999999)*2))%3;
        if(recent.length===3&&recent[0]===recent[2]&&recent[1]===lane&&recent[0]!==recent[1])lane=3-recent[0]-recent[1];
        if(recent.length===3&&new Set([...recent,lane]).size<3){const missing=[0,1,2].filter(v=>![...recent,lane].includes(v));if(missing.length)lane=missing[Math.floor(clamp(random(),0,.999999)*missing.length)];}
        x=[27,50,73][lane];y=10;timingTarget=.72;timingSpread=.34;
      }else if(h.mode==='precision'){
        x=14+clamp(random(),0,.999999)*72;y=34+clamp(random(),0,.999999)*44;
      }else if(h.mode==='rush'){
        const side=clamp(random(),0,.999999)>=.5?1:0;x=side?58+clamp(random(),0,.999999)*30:12+clamp(random(),0,.999999)*30;y=34+clamp(random(),0,.999999)*44;
      }else{
        x=12+clamp(random(),0,.999999)*76;y=34+clamp(random(),0,.999999)*46;
      }
      const impactAtMs=h.mode==='lanes'?Math.max(260,Math.round(lifeMs*.72)):null;
      targets.push({id:`${h.id}-${i}`,index:i,mode:h.mode,spawnAt,lifeMs,graceMs,impactAtMs,x:round1(x),y:round1(y),lane,timingTarget,timingSpread,scale:p.targetScale,value:1,golden:false});
    }
    windowMs=Math.max(windowMs,spawnAt+lifeMs+graceMs+90);
    let goldenTargetCount=0,goldenQuota=0;
    if(golden&&targets.length){
      goldenTargetCount=Math.min(3,targets.length);
      const chosen=new Set();
      for(let g=0;g<goldenTargetCount;g++)chosen.add(Math.min(targets.length-1,Math.round(((g+1)/(goldenTargetCount+1))*(targets.length-1))));
      for(const i of chosen)targets[i].golden=true;
      goldenTargetCount=chosen.size;goldenQuota=goldenTargetCount;
    }
    return {hazardId:h.id,mode:h.mode,difficulty:p.key,windowMs,maxLive,graceMs,hitRadiusScale:Number(p.hitRadiusScale)||1,targets,totalValue:targets.reduce((sum,t)=>sum+t.value,0),goldenTargetCount,goldenQuota};
  }

  function resolveHarden({hazard=HAZARDS[0],difficulty='normal',profile=null,defense=60,hitValue=0,totalValue=1,targetsHit=0,targetsTotal=0,integrity=100,golden=false,goldenTargetsHit=0,goldenTargetsTotal=0,goldenQuota=0}={}){
    const h=hazard||HAZARDS[0],p=profile||difficultyProfile(difficulty),rawCoverage=hardenCoverage(hitValue,totalValue),allTargetsHit=Number(targetsTotal)>0&&Number(targetsHit)>=Number(targetsTotal),coverage=allTargetsHit?1:rawCoverage,perfect=allTargetsHit||coverage>=.985;
    const statReduction=defenseResilience(defense),executionReduction=clamp(Math.pow(coverage,1.25)*.94,0,.94),baseDamage=Math.max(1,Number(h.damage)||40)*p.damageMultiplier*defenseDamageMultiplier(defense);
    const damage=perfect?0:Math.max(1,Math.round(baseDamage*(1-executionReduction)*(1-statReduction)));
    const nextIntegrity=clamp((Number(integrity)||0)-damage,0,100),survived=nextIntegrity>0;
    const goldTotal=Math.max(0,Math.trunc(Number(goldenTargetsTotal)||0)),goldHits=Math.max(0,Math.trunc(Number(goldenTargetsHit)||0)),quota=goldTotal>0?goldTotal:Math.max(0,Math.trunc(Number(goldenQuota)||0));
    const goldenCleared=!!golden&&survived&&goldTotal>0&&goldHits>=goldTotal;
    const defenseBonus=Math.round(statReduction*28),score=Math.max(0,Math.round(coverage*108+(Number(targetsHit)||0)*2+(survived?18:0)+(perfect?45:0)+defenseBonus+(goldenCleared?50:0)-damage*.28));
    return {hazard:h,difficulty:p.key,defense:Number(defense)||60,coverage,rawCoverage,percent:round1(coverage*100),statReduction:round1(statReduction*100),perfect,allTargetsHit,survived,success:survived,damage,integrity:nextIntegrity,grade:hardenGrade(coverage),targetsHit:Math.max(0,Number(targetsHit)||0),targetsTotal:Math.max(0,Number(targetsTotal)||0),golden:!!golden,goldenTargetsHit:goldHits,goldenTargetsTotal:goldTotal,goldenQuota:quota,goldenCleared,score};
  }

  function rollGoldenHazard(rng=Math.random,rate=.02){return clamp(Number((rng||Math.random)())||0,0,.999999)<clamp(rate,0,1);}
  function createRun({difficulty='normal',profile=null,participant=null,rng=Math.random,goldenRate=.02}={}){
    const p=difficultyProfile(difficulty),custom=profile?{...profile}:null,golden=rollGoldenHazard(rng,goldenRate),goldenIndex=golden?Math.floor(clamp(Number(rng())||0,0,.999999)*HAZARDS.length):-1;
    return {difficulty:p.key,profile:custom,participant:participant?{...participant}:null,goldenIndex,hazards:[],score:0,integrity:100,damageTaken:0,perfects:0,successfulDefenses:0,targetsHit:0,targetsTotal:0,goldenTargetsHit:0,bestHardenPct:0,finished:false,fullClear:false};
  }
  function applyHarden(run,{hitValue=0,totalValue=1,targetsHit=0,targetsTotal=0,goldenTargetsHit=0,goldenTargetsTotal=0,goldenQuota=0}={}){
    if(!run||run.finished||run.hazards.length>=HAZARDS.length)return null;
    const index=run.hazards.length,hazard=HAZARDS[index],golden=index===run.goldenIndex,defense=Number(run.participant?.baseStat)||60;
    const out=resolveHarden({hazard,difficulty:run.difficulty,profile:run.profile,defense,hitValue,totalValue,targetsHit,targetsTotal,integrity:run.integrity,golden,goldenTargetsHit,goldenTargetsTotal,goldenQuota});
    run.hazards.push({...out,index});run.score+=out.score;run.integrity=out.integrity;run.damageTaken+=out.damage;run.perfects+=out.perfect?1:0;run.successfulDefenses+=out.survived?1:0;run.targetsHit+=out.targetsHit;run.targetsTotal+=out.targetsTotal;run.goldenTargetsHit+=out.goldenTargetsHit;run.bestHardenPct=Math.max(run.bestHardenPct,out.percent);
    if(run.integrity<=0||run.hazards.length>=HAZARDS.length){run.finished=true;run.fullClear=run.hazards.length>=HAZARDS.length&&run.integrity>0;}
    return run.hazards[run.hazards.length-1];
  }
  function rewardForRun(run){
    const p=run?.profile||difficultyProfile(run?.difficulty),score=Math.max(0,Number(run?.score)||0),survived=Math.max(0,Number(run?.hazards?.length)||0),full=!!run?.fullClear,noDamage=full&&Number(run?.integrity)>=100;
    return Math.max(20,Math.round((24+survived*18+score*.07+(full?45:0)+(noDamage?25:0))*p.rewardMultiplier));
  }

  return Object.freeze({HAZARDS,DIFFICULTIES,DIVISION_PROFILES,COUNTDOWN_STEP_MS,COUNTDOWN_END_MS,LANE_GUARD_Y,TARGET_GRACE_MS,difficultyProfile,divisionProfile,defenseExpressionFactor,defensePerformance,defenseResilience,defenseWorkload,defenseDamageMultiplier,hardenCoverage,hardenGrade,countdownLabel,segmentHitsCircle,laneTargetY,targetHitValue,createTargetPlan,resolveHarden,rollGoldenHazard,createRun,applyHarden,rewardForRun});
});
